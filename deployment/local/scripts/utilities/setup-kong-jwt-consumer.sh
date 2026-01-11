#!/bin/bash

###############################################################################
# Setup Kong JWT Consumer & Credentials
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
echo -e "${YELLOW}  Setup Kong JWT Consumer${NC}"
echo -e "${YELLOW}=========================================${NC}"
echo ""

# Create consumer for auth service
echo -e "${YELLOW}Creating consumer 'auth-service'...${NC}"
CONSUMER=$(curl -s -X POST "$KONG_ADMIN_URL/consumers" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "auth-service",
    "custom_id": "auth-service-jwt"
  }')

CONSUMER_ID=$(echo "$CONSUMER" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('id', ''))
except:
    pass
" 2>/dev/null)

if [ -z "$CONSUMER_ID" ]; then
    echo -e "${YELLOW}  ! Consumer may already exist, fetching existing...${NC}"
    CONSUMER_ID=$(curl -s "$KONG_ADMIN_URL/consumers/auth-service" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('id', ''))
except:
    pass
" 2>/dev/null)
fi

if [ -n "$CONSUMER_ID" ]; then
    echo -e "${GREEN}  ✓ Consumer ready: $CONSUMER_ID${NC}"
else
    echo -e "${RED}  ✗ Failed to create/find consumer${NC}"
    exit 1
fi

# Create JWT credentials with the same 'iss' as auth service generates
# Auth service JWT has iss: "http://192.168.120.42" (from .env JWT_ISS)
echo ""
echo -e "${YELLOW}Creating JWT credentials...${NC}"

# Get JWT secret from auth service .env (must match auth service JWT_SECRET)
JWT_SECRET="!UnilaAuthService2025"

JWT_CREDENTIAL=$(curl -s -X POST "$KONG_ADMIN_URL/consumers/auth-service/jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "http://192.168.120.42",
    "algorithm": "HS256",
    "secret": "'"$JWT_SECRET"'"
  }')

JWT_CRED_ID=$(echo "$JWT_CREDENTIAL" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'id' in data:
        print(data['id'])
    elif 'message' in data:
        print('ERROR: ' + data['message'], file=sys.stderr)
except Exception as e:
    print('ERROR: ' + str(e), file=sys.stderr)
" 2>&1)

if echo "$JWT_CRED_ID" | grep -q "ERROR"; then
    echo -e "${YELLOW}  ! JWT credential may already exist${NC}"
    echo -e "${YELLOW}    $(echo $JWT_CRED_ID | sed 's/ERROR: //')${NC}"
else
    echo -e "${GREEN}  ✓ JWT credential created: $JWT_CRED_ID${NC}"
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

echo -e "${YELLOW}Important Notes:${NC}"
echo "  1. Kong JWT consumer created with username: auth-service"
echo "  2. JWT credential registered with key (iss): http://192.168.120.42"
echo "  3. Make sure JWT_SECRET in this script matches auth service JWT_SECRET"
echo ""
echo -e "${YELLOW}To verify:${NC}"
echo "  curl $KONG_ADMIN_URL/consumers/auth-service/jwt"
echo ""
