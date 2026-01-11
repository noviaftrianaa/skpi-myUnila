#!/bin/bash

###############################################################################
# Kong HTTP Log Plugin Setup
# Adds centralized logging to ALL Kong routes using HTTP Log plugin
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

KONG_ADMIN_URL="http://localhost:9801"
LOG_RECEIVER_URL="http://myunila-nginx:80/api/v1/internal/kong-logs"

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Kong HTTP Log Plugin Setup${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

###############################################################################
# Helper function to add HTTP Log plugin to a route
###############################################################################
add_http_log_plugin() {
    local route_id=$1
    local route_name=$2

    echo -e "${YELLOW}  → Adding HTTP Log plugin to: $route_name${NC}"

    RESPONSE=$(curl -s -X POST "$KONG_ADMIN_URL/routes/$route_id/plugins" \
      -H "Content-Type: application/json" \
      -d "{
        \"name\": \"http-log\",
        \"config\": {
          \"http_endpoint\": \"$LOG_RECEIVER_URL\",
          \"method\": \"POST\",
          \"timeout\": 5000,
          \"keepalive\": 60000,
          \"retry_count\": 3,
          \"queue_size\": 1000,
          \"flush_timeout\": 2,
          \"content_type\": \"application/json\",
          \"headers\": {
            \"X-Log-Source\": \"kong-gateway\"
          }
        }
      }")

    if echo "$RESPONSE" | grep -q '"id"'; then
        echo -e "${GREEN}  ✓ HTTP Log plugin added to $route_name${NC}"
        return 0
    elif echo "$RESPONSE" | grep -q "already exists"; then
        echo -e "${YELLOW}  ! HTTP Log plugin already exists on $route_name${NC}"
        return 0
    else
        echo -e "${RED}  ✗ Failed to add HTTP Log plugin to $route_name${NC}"
        echo "$RESPONSE"
        return 1
    fi
}

###############################################################################
# Get all routes and add HTTP Log plugin
###############################################################################
echo -e "${GREEN}Fetching all Kong routes...${NC}"

# Get all routes
ROUTES=$(curl -s "$KONG_ADMIN_URL/routes" | python -m json.tool 2>/dev/null)

if [ -z "$ROUTES" ]; then
    echo -e "${RED}Failed to fetch routes from Kong${NC}"
    exit 1
fi

# Parse route IDs and names
ROUTE_IDS=$(echo "$ROUTES" | grep '"id"' | cut -d'"' -f4)
ROUTE_NAMES=$(echo "$ROUTES" | grep '"name"' | cut -d'"' -f4)

# Convert to arrays
IFS=$'\n' read -rd '' -a ROUTE_ID_ARRAY <<< "$ROUTE_IDS"
IFS=$'\n' read -rd '' -a ROUTE_NAME_ARRAY <<< "$ROUTE_NAMES"

echo -e "${GREEN}Found ${#ROUTE_ID_ARRAY[@]} routes${NC}"
echo ""

# Add HTTP Log plugin to each route
SUCCESS_COUNT=0
FAILED_COUNT=0

for i in "${!ROUTE_ID_ARRAY[@]}"; do
    ROUTE_ID="${ROUTE_ID_ARRAY[$i]}"
    ROUTE_NAME="${ROUTE_NAME_ARRAY[$i]}"

    if [ -z "$ROUTE_ID" ]; then
        continue
    fi

    echo -e "${BLUE}[$((i+1))/${#ROUTE_ID_ARRAY[@]}] Processing: $ROUTE_NAME (ID: ${ROUTE_ID:0:8}...)${NC}"

    if add_http_log_plugin "$ROUTE_ID" "$ROUTE_NAME"; then
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi

    echo ""
done

###############################################################################
# Summary
###############################################################################
echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Setup Complete${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo -e "${GREEN}Success: $SUCCESS_COUNT routes${NC}"
if [ $FAILED_COUNT -gt 0 ]; then
    echo -e "${RED}Failed: $FAILED_COUNT routes${NC}"
fi
echo ""
echo -e "${YELLOW}Log Receiver Endpoint:${NC}"
echo "  $LOG_RECEIVER_URL"
echo ""
echo -e "${YELLOW}Test log receiver health:${NC}"
echo "  curl http://localhost:8081/api/v1/internal/kong-logs/health"
echo ""
echo -e "${YELLOW}All requests to Kong gateway will now be logged to:${NC}"
echo "  Database: logger.log_akses_jwt"
echo "  Table structure:"
echo "    - id_log_jwt: Link to JWT token log"
echo "    - menu_akses: Request URI/endpoint"
echo "    - method: HTTP method (GET, POST, etc)"
echo "    - request_list: JSON with service, route, latency, etc"
echo "    - waktu_akses: Access timestamp"
echo "    - a_berhasil: Success flag (1=success, 0=failed)"
echo "    - ket: Status message"
echo ""
