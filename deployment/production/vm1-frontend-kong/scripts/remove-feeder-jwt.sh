#!/bin/bash

###############################################################################
# Remove JWT Plugin from Feeder Service Route
# This script removes JWT authentication from feeder service route
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

KONG_ADMIN_URL="http://localhost:9801"

echo ""
echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}  Remove JWT from Feeder Service${NC}"
echo -e "${YELLOW}=========================================${NC}"
echo ""

# Get feeder service route ID
echo -e "${YELLOW}Finding feeder-service-route...${NC}"
FEEDER_ROUTE_ID=$(curl -s "$KONG_ADMIN_URL/routes" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for route in data.get('data', []):
    if route.get('name') == 'feeder-service-route':
        print(route['id'])
        break
")

if [ -z "$FEEDER_ROUTE_ID" ]; then
    echo -e "${RED}✗ Feeder route not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Feeder route found: $FEEDER_ROUTE_ID${NC}"

# Get JWT plugin ID from feeder route
echo -e "${YELLOW}Finding JWT plugin on feeder route...${NC}"
JWT_PLUGIN_ID=$(curl -s "$KONG_ADMIN_URL/routes/$FEEDER_ROUTE_ID/plugins" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for plugin in data.get('data', []):
    if plugin.get('name') == 'jwt':
        print(plugin['id'])
        break
")

if [ -z "$JWT_PLUGIN_ID" ]; then
    echo -e "${GREEN}✓ No JWT plugin found (already removed or never existed)${NC}"
    echo ""
    exit 0
fi

echo -e "${YELLOW}Found JWT plugin: $JWT_PLUGIN_ID${NC}"

# Delete JWT plugin
echo -e "${YELLOW}Removing JWT plugin...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$KONG_ADMIN_URL/plugins/$JWT_PLUGIN_ID")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" == "204" ] || [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ JWT plugin removed successfully${NC}"
else
    echo -e "${RED}✗ Failed to remove JWT plugin (HTTP $HTTP_CODE)${NC}"
    exit 1
fi

# Verify removal
echo -e "${YELLOW}Verifying removal...${NC}"
REMAINING_PLUGINS=$(curl -s "$KONG_ADMIN_URL/routes/$FEEDER_ROUTE_ID/plugins" | python3 -c "
import sys, json
data = json.load(sys.stdin)
plugins = [p['name'] for p in data.get('data', [])]
print(', '.join(plugins) if plugins else 'none')
")

echo -e "${GREEN}✓ Remaining plugins on feeder route: $REMAINING_PLUGINS${NC}"

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  JWT Plugin Removed Successfully!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${YELLOW}Feeder service now handles JWT validation internally.${NC}"
echo -e "${YELLOW}Frontend can access feeder service without Kong JWT check.${NC}"
echo ""
