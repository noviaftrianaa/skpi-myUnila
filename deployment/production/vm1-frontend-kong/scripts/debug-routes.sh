#!/bin/bash

###############################################################################
# Debug Kong Routes - Compare Sister vs Feeder
# This script compares Kong routes configuration for sister and feeder services
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

KONG_ADMIN_URL="http://localhost:9801"

echo ""
echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}  Kong Routes Debugging${NC}"
echo -e "${YELLOW}=========================================${NC}"
echo ""

# Sister Service Routes
echo -e "${BLUE}=== SISTER SERVICE ===${NC}"
echo -e "${YELLOW}Routes:${NC}"
curl -s "$KONG_ADMIN_URL/routes" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for route in data.get('data', []):
    if 'sister' in route.get('name', '').lower():
        print(f\"  Name: {route['name']}\")
        print(f\"  Paths: {route['paths']}\")
        print(f\"  Strip Path: {route['strip_path']}\")
        print(f\"  Service ID: {route['service']['id']}\")
        print()
"

echo -e "${YELLOW}Services:${NC}"
curl -s "$KONG_ADMIN_URL/services" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for service in data.get('data', []):
    if 'sister' in service.get('name', '').lower():
        print(f\"  Name: {service['name']}\")
        print(f\"  URL: {service['protocol']}://{service['host']}:{service['port']}{service.get('path', '')}\")
        print()
"

echo -e "${YELLOW}Plugins on sister-api-v1-route:${NC}"
SISTER_ROUTE_ID=$(curl -s "$KONG_ADMIN_URL/routes" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for route in data.get('data', []):
    if route.get('name') == 'sister-api-v1-route':
        print(route['id'])
        break
")
if [ -n "$SISTER_ROUTE_ID" ]; then
    curl -s "$KONG_ADMIN_URL/routes/$SISTER_ROUTE_ID/plugins" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for plugin in data.get('data', []):
    print(f\"  - {plugin['name']}\")
"
fi

echo ""
echo -e "${BLUE}=== FEEDER SERVICE ===${NC}"
echo -e "${YELLOW}Routes:${NC}"
curl -s "$KONG_ADMIN_URL/routes" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for route in data.get('data', []):
    if 'feeder' in route.get('name', '').lower():
        print(f\"  Name: {route['name']}\")
        print(f\"  Paths: {route['paths']}\")
        print(f\"  Strip Path: {route['strip_path']}\")
        print(f\"  Service ID: {route['service']['id']}\")
        print()
"

echo -e "${YELLOW}Services:${NC}"
curl -s "$KONG_ADMIN_URL/services" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for service in data.get('data', []):
    if 'feeder' in service.get('name', '').lower():
        print(f\"  Name: {service['name']}\")
        print(f\"  URL: {service['protocol']}://{service['host']}:{service['port']}{service.get('path', '') or ''}\")
        print()
"

echo -e "${YELLOW}Plugins on feeder-api-v1-route:${NC}"
FEEDER_ROUTE_ID=$(curl -s "$KONG_ADMIN_URL/routes" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for route in data.get('data', []):
    if route.get('name') == 'feeder-api-v1-route':
        print(route['id'])
        break
")
if [ -n "$FEEDER_ROUTE_ID" ]; then
    curl -s "$KONG_ADMIN_URL/routes/$FEEDER_ROUTE_ID/plugins" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for plugin in data.get('data', []):
    print(f\"  - {plugin['name']}\")
"
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Debug Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
