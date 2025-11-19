#!/bin/bash

###############################################################################
# Test JWT Validation on Sister vs Feeder Routes
# This script tests if JWT tokens work on both services
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

KONG_PROXY_URL="http://localhost:9800"

echo ""
echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}  Test JWT Validation${NC}"
echo -e "${YELLOW}=========================================${NC}"
echo ""

# Prompt for JWT token
echo -e "${YELLOW}Please provide a valid JWT token:${NC}"
read -p "Token: " JWT_TOKEN

echo ""
echo -e "${BLUE}=== Testing Sister Service ===${NC}"
echo -e "${YELLOW}Endpoint: /sister-service/api/v1/dosen?page=1&limit=5${NC}"
SISTER_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  "$KONG_PROXY_URL/sister-service/api/v1/dosen?page=1&limit=5")

HTTP_STATUS=$(echo "$SISTER_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$SISTER_RESPONSE" | sed '/HTTP_STATUS/d')

echo -e "${YELLOW}Status Code:${NC} $HTTP_STATUS"
if [ "$HTTP_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ Sister Service: JWT Valid${NC}"
    echo -e "${YELLOW}Response (first 200 chars):${NC}"
    echo "$BODY" | head -c 200
    echo "..."
elif [ "$HTTP_STATUS" == "401" ]; then
    echo -e "${RED}✗ Sister Service: JWT Invalid or Expired${NC}"
    echo -e "${YELLOW}Response:${NC}"
    echo "$BODY"
else
    echo -e "${YELLOW}Sister Service: Unexpected status $HTTP_STATUS${NC}"
    echo -e "${YELLOW}Response:${NC}"
    echo "$BODY"
fi

echo ""
echo ""
echo -e "${BLUE}=== Testing Feeder Service ===${NC}"
echo -e "${YELLOW}Endpoint: /feeder-service/api/v1/mahasiswa?page=1&limit=5${NC}"
FEEDER_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  "$KONG_PROXY_URL/feeder-service/api/v1/mahasiswa?page=1&limit=5")

HTTP_STATUS=$(echo "$FEEDER_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$FEEDER_RESPONSE" | sed '/HTTP_STATUS/d')

echo -e "${YELLOW}Status Code:${NC} $HTTP_STATUS"
if [ "$HTTP_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ Feeder Service: JWT Valid${NC}"
    echo -e "${YELLOW}Response (first 200 chars):${NC}"
    echo "$BODY" | head -c 200
    echo "..."
elif [ "$HTTP_STATUS" == "401" ]; then
    echo -e "${RED}✗ Feeder Service: JWT Invalid or Expired${NC}"
    echo -e "${YELLOW}Response:${NC}"
    echo "$BODY"
else
    echo -e "${YELLOW}Feeder Service: Unexpected status $HTTP_STATUS${NC}"
    echo -e "${YELLOW}Response:${NC}"
    echo "$BODY"
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Test Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
