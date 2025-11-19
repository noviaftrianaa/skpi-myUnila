#!/bin/bash

###############################################################################
# Setup Kong JWT Consumer & Credentials (Production)
# This script creates a Kong consumer and JWT credentials for auth service
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

KONG_ADMIN_URL="http://localhost:9801"

echo ""
echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}  Setup Kong JWT Consumer (Production)${NC}"
echo -e "${YELLOW}=========================================${NC}"
echo ""

# Create consumer for auth service
echo -e "${YELLOW}Creating consumer 'auth-service'...${NC}"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$KONG_ADMIN_URL/consumers" \
  -H "Content-Type: application/json" \
  --data-raw '{
    "username": "auth-service",
    "custom_id": "auth-service-jwt"
  }')

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)

if [ "$HTTP_STATUS" == "201" ]; then
    echo -e "${GREEN}  ✓ Consumer created successfully${NC}"
elif echo "$RESPONSE" | grep -q "unique constraint violation"; then
    echo -e "${YELLOW}  ! Consumer already exists, continuing...${NC}"
else
    echo -e "${RED}  ✗ Failed to create consumer${NC}"
    echo "$RESPONSE"
fi

# Create JWT credentials with the same 'iss' as auth service generates
echo ""
echo -e "${YELLOW}Creating JWT credentials...${NC}"
echo -e "${YELLOW}  - Issuer (key): http://192.168.120.42${NC}"
echo -e "${YELLOW}  - Algorithm: HS256${NC}"

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$KONG_ADMIN_URL/consumers/auth-service/jwt" \
  -H "Content-Type: application/json" \
  --data-raw '{
    "key": "http://192.168.120.42",
    "algorithm": "HS256",
    "secret": "!UnilaAuthService2025"
  }')

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)

if [ "$HTTP_STATUS" == "201" ]; then
    echo -e "${GREEN}  ✓ JWT credential created successfully${NC}"
elif echo "$RESPONSE" | grep -q "unique constraint violation"; then
    echo -e "${YELLOW}  ! JWT credential already exists${NC}"
else
    echo -e "${RED}  ✗ Failed to create JWT credential${NC}"
    echo "$RESPONSE"
fi

# Verify setup
echo ""
echo -e "${YELLOW}Verifying setup...${NC}"
CREDENTIALS=$(curl -s "$KONG_ADMIN_URL/consumers/auth-service/jwt")
echo "$CREDENTIALS" | grep -q "http://192.168.120.42"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✓ JWT credential verified${NC}"
else
    echo -e "${RED}  ✗ JWT credential not found${NC}"
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

echo -e "${YELLOW}Summary:${NC}"
echo "  ✓ Kong consumer: auth-service"
echo "  ✓ JWT issuer: http://192.168.120.42"
echo "  ✓ Algorithm: HS256"
echo ""
echo -e "${YELLOW}Test the setup:${NC}"
echo "  1. Login to get a JWT token"
echo "  2. Test feeder service:"
echo "     curl -H \"Authorization: Bearer YOUR_TOKEN\" http://localhost:9800/feeder-service/api/v1/mahasiswa/stats"
echo "  3. Test sister service:"
echo "     curl -H \"Authorization: Bearer YOUR_TOKEN\" http://localhost:9800/sister-service/api/v1/dosen/stats"
echo ""
