#!/bin/bash

# ========================================
# Setup Kong JWT Plugin
# ========================================

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "========================================"
echo "  Kong JWT Plugin Setup"
echo "========================================"
echo ""

# Configuration
KONG_ADMIN_URL="http://localhost:9801"
JWT_SECRET="!UnilaAuthService2025"
ISSUER="http://localhost:8081"

# Function to check response
check_response() {
    if echo "$1" | grep -q "id"; then
        echo -e "${GREEN}✓ Success${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed${NC}"
        echo "Response: $1"
        return 1
    fi
}

# 1. Check Kong is running
echo -e "${YELLOW}→ Checking Kong is running...${NC}"
KONG_STATUS=$(curl -s $KONG_ADMIN_URL)
if echo "$KONG_STATUS" | grep -q "version"; then
    echo -e "${GREEN}✓ Kong is running${NC}"
else
    echo -e "${RED}✗ Kong is not running. Please start Kong first.${NC}"
    exit 1
fi
echo ""

# 2. Create Consumer for auth-service
echo -e "${YELLOW}→ Creating consumer 'auth-service'...${NC}"
CONSUMER_RESPONSE=$(curl -s -X POST $KONG_ADMIN_URL/consumers \
    -H "Content-Type: application/json" \
    -d '{
        "username": "auth-service",
        "custom_id": "myunila-auth-service"
    }')

if echo "$CONSUMER_RESPONSE" | grep -q "already exists"; then
    echo -e "${YELLOW}! Consumer already exists, skipping...${NC}"
elif check_response "$CONSUMER_RESPONSE"; then
    echo "Consumer created successfully"
else
    echo "Warning: Consumer creation failed, but continuing..."
fi
echo ""

# 3. Add JWT credential to consumer
echo -e "${YELLOW}→ Adding JWT credential to consumer...${NC}"
JWT_CREDENTIAL_RESPONSE=$(curl -s -X POST $KONG_ADMIN_URL/consumers/auth-service/jwt \
    -H "Content-Type: application/json" \
    -d "{
        \"key\": \"$ISSUER\",
        \"secret\": \"$JWT_SECRET\",
        \"algorithm\": \"HS256\"
    }")

if echo "$JWT_CREDENTIAL_RESPONSE" | grep -q "already exists"; then
    echo -e "${YELLOW}! JWT credential already exists, updating...${NC}"
    # Get existing credential ID and delete it
    EXISTING_ID=$(curl -s $KONG_ADMIN_URL/consumers/auth-service/jwt | python -c "import sys, json; data = json.load(sys.stdin); print(data['data'][0]['id'] if data.get('data') else '')")
    if [ ! -z "$EXISTING_ID" ]; then
        curl -s -X DELETE $KONG_ADMIN_URL/consumers/auth-service/jwt/$EXISTING_ID > /dev/null
        echo "  Deleted old credential"
    fi
    # Retry creation
    JWT_CREDENTIAL_RESPONSE=$(curl -s -X POST $KONG_ADMIN_URL/consumers/auth-service/jwt \
        -H "Content-Type: application/json" \
        -d "{
            \"key\": \"$ISSUER\",
            \"secret\": \"$JWT_SECRET\",
            \"algorithm\": \"HS256\"
        }")
fi

if check_response "$JWT_CREDENTIAL_RESPONSE"; then
    echo "JWT credential added successfully"
else
    echo "Warning: JWT credential creation failed"
fi
echo ""

# 4. Enable JWT plugin on dashboard-service route
echo -e "${YELLOW}→ Enabling JWT plugin on dashboard-service routes...${NC}"

# Get dashboard-service route ID
DASHBOARD_ROUTE_ID=$(curl -s "$KONG_ADMIN_URL/routes" | python -c "import sys, json; data = json.load(sys.stdin); routes = [r for r in data.get('data', []) if r.get('name') == 'dashboard-route']; print(routes[0]['id'] if routes else '')")

if [ -z "$DASHBOARD_ROUTE_ID" ]; then
    echo -e "${RED}✗ Dashboard route not found. Please ensure dashboard-service is configured in Kong.${NC}"
else
    echo "  Found dashboard route: $DASHBOARD_ROUTE_ID"

    # Add JWT plugin to the route
    JWT_PLUGIN_RESPONSE=$(curl -s -X POST "$KONG_ADMIN_URL/routes/$DASHBOARD_ROUTE_ID/plugins" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "jwt",
            "config": {
                "claims_to_verify": ["exp"],
                "key_claim_name": "iss",
                "secret_is_base64": false,
                "anonymous": null,
                "run_on_preflight": true,
                "maximum_expiration": 0,
                "header_names": ["authorization"],
                "cookie_names": []
            }
        }')

    if echo "$JWT_PLUGIN_RESPONSE" | grep -q "already exists"; then
        echo -e "${YELLOW}! JWT plugin already enabled on this route${NC}"
    elif check_response "$JWT_PLUGIN_RESPONSE"; then
        echo "JWT plugin enabled on dashboard-service route"
    fi
fi
echo ""

# 5. Add Request Transformer plugin to inject user headers
echo -e "${YELLOW}→ Adding Request Transformer plugin to inject user headers...${NC}"

if [ ! -z "$DASHBOARD_ROUTE_ID" ]; then
    TRANSFORMER_RESPONSE=$(curl -s -X POST "$KONG_ADMIN_URL/routes/$DASHBOARD_ROUTE_ID/plugins" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "request-transformer",
            "config": {
                "add": {
                    "headers": [
                        "X-User-Id:$(uri_captures[\"sub\"] or jwt_claims[\"sub\"])",
                        "X-User-Name:$(jwt_claims[\"user\"][\"name\"] or \"\")",
                        "X-User-Email:$(jwt_claims[\"user\"][\"email\"] or \"\")",
                        "X-User-Role:$(jwt_claims[\"user\"][\"role\"] or \"\")",
                        "X-User-Username:$(jwt_claims[\"user\"][\"username\"] or \"\")"
                    ]
                }
            }
        }')

    if echo "$TRANSFORMER_RESPONSE" | grep -q "already exists"; then
        echo -e "${YELLOW}! Request Transformer plugin already enabled${NC}"
    elif check_response "$TRANSFORMER_RESPONSE"; then
        echo "Request Transformer plugin enabled"
    fi
fi
echo ""

# 6. Summary
echo "========================================"
echo -e "${GREEN}  Kong JWT Setup Complete!${NC}"
echo "========================================"
echo ""
echo "Configuration:"
echo "  - Issuer (iss):  $ISSUER"
echo "  - Algorithm:     HS256"
echo "  - Consumer:      auth-service"
echo ""
echo "Testing:"
echo "  1. Login to get token:"
echo "     curl -X POST http://localhost:8081/api/v1/auth/login \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"username\":\"mizar.zulmi1073\",\"password\":\"makinjaya\"}'"
echo ""
echo "  2. Use token to access protected endpoint:"
echo "     curl http://localhost:9800/dashboard-service/api/v1/my-favorites \\"
echo "       -H 'Authorization: Bearer YOUR_TOKEN_HERE'"
echo ""
echo "Next steps:"
echo "  - Create TrustKong middleware in dashboard-service"
echo "  - Add protected routes in dashboard-service"
echo ""
