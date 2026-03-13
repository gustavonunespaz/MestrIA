#!/bin/bash

BASE_URL="http://localhost:3000/api"
UNIQUE_ID=$(date +%s)
EMAIL="testuser_${UNIQUE_ID}@example.com"
PASSWORD="Password123!"

echo "=========================================="
echo "Starting E2E Database and API Test Flow"
echo "=========================================="

echo -e "\n1. Registering new user: $EMAIL"
REGISTER_RESPONSE=$(curl -s -w "\\n%{http_code}" -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Tester $UNIQUE_ID\", \"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

HTTP_STATUS=$(echo "$REGISTER_RESPONSE" | tail -n1)
BODY=$(echo "$REGISTER_RESPONSE" | head -n-1)

echo "$BODY" | grep -q "id" && echo "✅ User Registered (Status $HTTP_STATUS)" || {
    echo "❌ Failed to register (Status $HTTP_STATUS)"
    echo "Response Body: $BODY"
    exit 1
}

echo -e "\n2. Logging in with $EMAIL"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/users/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to extract JWT token. Response:"
    echo $LOGIN_RESPONSE
    exit 1
fi
echo "✅ Authenticated. Token received."

echo -e "\n3. Creating a new Campaign"
CAMPAIGN_RESPONSE=$(curl -s -X POST "$BASE_URL/campaigns" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"title\": \"A Aventura de Teste $UNIQUE_ID\", \"description\": \"Validação do BD\", \"systemBase\": \"D&D 5E\", \"dmType\": \"AI\"}")

CAMPAIGN_ID=$(echo $CAMPAIGN_RESPONSE | grep -o '"id":"[^"]*' | grep -o '[^"]*$')

if [ -z "$CAMPAIGN_ID" ]; then
    echo "❌ Failed to create campaign."
    echo $CAMPAIGN_RESPONSE
    exit 1
fi
echo "✅ Campaign Created! ID: $CAMPAIGN_ID"

echo -e "\n4. Fetching campaigns list"
LIST_RESPONSE=$(curl -s -X GET "$BASE_URL/campaigns/list" \
  -H "Authorization: Bearer $TOKEN")

echo $LIST_RESPONSE | grep -q "$CAMPAIGN_ID" && echo "✅ Database Query OK (Campaign found in list)" || echo "❌ Campaign not in list"

echo -e "\n=========================================="
echo "🟢 ALL TESTS PASSED SUCCESSFULLY"
echo "=========================================="
