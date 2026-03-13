#!/bin/bash

# Test script for MestrIA Backend
# Requires: curl, jq (optional, for pretty JSON)

set -e

BASE_URL="http://localhost:3000"
CAMPAIGN_ID="" # Will be fetched if possible

echo "=========================================="
echo "MestrIA Backend - Test Suite"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4

    echo -e "${YELLOW}Testing: $description${NC}"
    echo "Request: $method $endpoint"

    if [ -z "$data" ]; then
        response=$(curl -s -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json")
    else
        response=$(curl -s -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi

    echo "Response:"
    if command -v jq &> /dev/null; then
        echo "$response" | jq . 2>/dev/null || echo "$response"
    else
        echo "$response"
    fi
    echo ""
}

# Test 1: Health Check
test_endpoint "GET" "/health" "" "Health Check"

# Test 2: Circuit Breaker Status (before any AI calls)
test_endpoint "GET" "/api/ai/circuit-breaker/status" "" "Circuit Breaker Status (Initial)"

# Test 3: Generate AI Response (requires campaign ID)
echo -e "${YELLOW}Note: For AI tests, you need a valid CAMPAIGN_ID${NC}"
echo "Get one from Prisma Studio: npm run prisma:studio"
read -p "Enter Campaign ID (or press Enter to skip): " CAMPAIGN_ID

if [ ! -z "$CAMPAIGN_ID" ]; then
    ai_payload="{
        \"campaignId\": \"$CAMPAIGN_ID\",
        \"message\": \"Thordak enters a dark tavern\",
        \"type\": \"narrative\"
    }"

    test_endpoint "POST" "/api/ai/generate" "$ai_payload" "Generate AI Narrative (Groq→Ollama fallback)"

    # Test 4: Circuit Breaker Status (after AI call)
    test_endpoint "GET" "/api/ai/circuit-breaker/status" "" "Circuit Breaker Status (After AI call)"
else
    echo -e "${YELLOW}Skipping AI tests${NC}"
    echo ""
fi

echo -e "${GREEN}=========================================="
echo "Test suite completed!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. For GUI testing, import postman_collection.json to Postman/Insomnia"
echo "2. Set BASE_URL and CAMPAIGN_ID variables in Postman"
echo "3. Use Prisma Studio for data exploration: npm run prisma:studio"
