#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}MestrIA Backend - Setup Script${NC}\n"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}Dependencies installed${NC}\n"
else
    echo -e "${GREEN}Dependencies already installed${NC}\n"
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}Creating .env.local from .env.example...${NC}"
    cp .env.example .env.local
    echo -e "${GREEN}.env.local created${NC}"
    echo -e "${YELLOW}Note: Update GROQ_API_KEY if you have one${NC}\n"
else
    echo -e "${GREEN}.env.local already exists${NC}\n"
fi

# Check if Docker containers are running
echo -e "${YELLOW}Checking Docker containers...${NC}"

if command -v docker &> /dev/null; then
    if [ "$(docker ps -q -f name=mestria-db)" ]; then
        echo -e "${GREEN}PostgreSQL is running${NC}\n"
    else
        echo -e "${YELLOW}PostgreSQL is not running. Starting...${NC}"
        docker-compose up -d postgres
        echo -e "${YELLOW}Waiting for PostgreSQL to be ready... (10s)${NC}"
        sleep 10
        echo -e "${GREEN}PostgreSQL started${NC}\n"
    fi
else
    echo -e "${YELLOW}Docker not found. Using local PostgreSQL${NC}\n"
fi

# Run migrations
echo -e "${YELLOW}Running Prisma migrations...${NC}"
npm run prisma:migrate -- --skip-generate

if [ $? -ne 0 ]; then
    echo -e "${RED}Migrations failed. Make sure PostgreSQL is running.${NC}"
    exit 1
fi
echo -e "${GREEN}Migrations completed${NC}\n"

# Run seeds
echo -e "${YELLOW}Seeding database with test data...${NC}"
npm run seed

if [ $? -ne 0 ]; then
    echo -e "${RED}Seeding failed${NC}"
    exit 1
fi
echo -e "${GREEN}Database seeded successfully${NC}\n"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setup completed!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "Next steps:"
echo -e "1. Start the development server:"
echo -e "   ${YELLOW}npm run dev:watch${NC}"
echo -e "\n2. In another terminal, open Prisma Studio:"
echo -e "   ${YELLOW}npm run prisma:studio${NC}"
echo -e "\n3. Test the API:"
echo -e "   ${YELLOW}curl http://localhost:3000/health${NC}"
echo -e "\n4. Read the documentation:"
echo -e "   ${YELLOW}QUICK_START.md${NC} - Quick setup guide"
echo -e "   ${YELLOW}AI_SYSTEM.md${NC} - AI and Circuit Breaker explanations"
echo -e "   ${YELLOW}SEEDS.md${NC} - Test data and database seeding"
echo -e "   ${YELLOW}ARCHITECTURE.md${NC} - Clean architecture overview\n"
