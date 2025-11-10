#!/bin/bash

###############################################################################
# Setup Kong Public Route for Dashboard Service
# Creates a separate public route without JWT authentication
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Kong Admin API
KONG_ADMIN_URL="http://localhost:9801"

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Setup Kong Public Route${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Step 1: Get dashboard service ID
echo -e "${GREEN}[1/3] Getting dashboard service ID...${NC}"

# Try with python first, fallback to grep
DASHBOARD_SERVICE_JSON=$(curl -s "$KONG_ADMIN_URL/services/dashboard-service")
DASHBOARD_SERVICE_ID=$(echo "$DASHBOARD_SERVICE_JSON" | python -m json.tool 2>/dev/null | grep '"id"' | head -1 | cut -d'"' -f4)

# Fallback if python is not available
if [ -z "$DASHBOARD_SERVICE_ID" ]; then
    DASHBOARD_SERVICE_ID=$(echo "$DASHBOARD_SERVICE_JSON" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
fi

if [ -z "$DASHBOARD_SERVICE_ID" ]; then
    echo -e "${RED}✗ Dashboard service not found in Kong${NC}"
    echo "Response: $DASHBOARD_SERVICE_JSON"
    exit 1
fi

echo -e "   Dashboard Service ID: $DASHBOARD_SERVICE_ID"
echo ""

# Step 2: Create public route (without JWT)
echo -e "${GREEN}[2/3] Creating public route for dashboard service...${NC}"

# Check if route already exists
ROUTES_JSON=$(curl -s "$KONG_ADMIN_URL/routes")
EXISTING_ROUTE=$(echo "$ROUTES_JSON" | grep -o '"name":"dashboard-public-route"[^}]*"id":"[^"]*"' | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -n "$EXISTING_ROUTE" ]; then
    echo -e "${YELLOW}   Public route already exists, deleting old route...${NC}"
    curl -s -X DELETE "$KONG_ADMIN_URL/routes/$EXISTING_ROUTE"
fi

# Create new public route
ROUTE_RESPONSE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$DASHBOARD_SERVICE_ID/routes" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "dashboard-public-route",
    "paths": ["/dashboard-service/public"],
    "strip_path": true,
    "preserve_host": false,
    "protocols": ["http", "https"]
  }')

# Parse route ID (try python first, fallback to grep)
PUBLIC_ROUTE_ID=$(echo "$ROUTE_RESPONSE" | python -m json.tool 2>/dev/null | grep '"id"' | head -1 | cut -d'"' -f4)

if [ -z "$PUBLIC_ROUTE_ID" ]; then
    PUBLIC_ROUTE_ID=$(echo "$ROUTE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
fi

if [ -z "$PUBLIC_ROUTE_ID" ]; then
    echo -e "${RED}✗ Failed to create public route${NC}"
    echo "Response: $ROUTE_RESPONSE"
    exit 1
fi

echo -e "${GREEN}   ✓ Public route created: $PUBLIC_ROUTE_ID${NC}"
echo ""

# Step 3: Add CORS plugin to public route
echo -e "${GREEN}[3/3] Adding CORS plugin to public route...${NC}"

CORS_RESPONSE=$(curl -s -X POST "$KONG_ADMIN_URL/routes/$PUBLIC_ROUTE_ID/plugins" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "cors",
    "config": {
      "origins": ["*"],
      "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      "headers": ["Accept", "Accept-Version", "Content-Length", "Content-MD5", "Content-Type", "Date", "X-Auth-Token", "Authorization"],
      "exposed_headers": ["X-Auth-Token"],
      "credentials": true,
      "max_age": 3600
    }
  }')

# Parse CORS plugin ID
CORS_PLUGIN_ID=$(echo "$CORS_RESPONSE" | python -m json.tool 2>/dev/null | grep '"id"' | head -1 | cut -d'"' -f4)

if [ -z "$CORS_PLUGIN_ID" ]; then
    CORS_PLUGIN_ID=$(echo "$CORS_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
fi

if [ -z "$CORS_PLUGIN_ID" ]; then
    echo -e "${YELLOW}   ⚠ CORS plugin might already exist or failed to create${NC}"
    echo "   Response: $CORS_RESPONSE" | head -100
else
    echo -e "${GREEN}   ✓ CORS plugin added: $CORS_PLUGIN_ID${NC}"
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Kong Public Route Setup Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

# Test the route
echo -e "${BLUE}Testing public route...${NC}"
echo ""

TEST_URL="http://localhost:9800/dashboard-service/public/api/health"
echo -e "Testing: ${YELLOW}$TEST_URL${NC}"
HEALTH_CHECK=$(curl -s -w "\nHTTP Status: %{http_code}\n" "$TEST_URL")
echo "$HEALTH_CHECK"
echo ""

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Route Configuration Summary${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo -e "${YELLOW}Protected Route (requires JWT):${NC}"
echo "  http://localhost:9800/dashboard-service/api/v1/..."
echo ""
echo -e "${YELLOW}Public Route (no authentication):${NC}"
echo "  http://localhost:9800/dashboard-service/public/api/v1/..."
echo ""
echo -e "${GREEN}Usage in Frontend:${NC}"
echo "  NEXT_PUBLIC_DASHBOARD_API_URL=http://localhost:9800/dashboard-service/public/api/v1"
echo ""
echo -e "${BLUE}=========================================${NC}"
echo ""
