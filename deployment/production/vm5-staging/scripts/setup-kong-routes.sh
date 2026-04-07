#!/bin/bash

###############################################################################
# Setup Kong Routes for Staging VM5
# All services are local (container names), not remote IPs
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Load environment variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: .env file not found at $ENV_FILE${NC}"
    exit 1
fi

source "$ENV_FILE"

KONG_ADMIN_URL="http://localhost:${KONG_ADMIN_PORT:-9801}"

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Kong Routes Setup - Staging VM5${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Wait for Kong to be ready
echo -e "${GREEN}Waiting for Kong to be ready...${NC}"
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s "$KONG_ADMIN_URL" > /dev/null 2>&1; then
        echo -e "${GREEN}  Kong is ready${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "  Waiting... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}  Kong failed to start${NC}"
    exit 1
fi

echo ""

###############################################################################
# Helper Functions
###############################################################################

parse_json_id() {
    local json="$1"
    if command -v jq &> /dev/null; then
        local id=$(echo "$json" | jq -r '.id // empty' 2>/dev/null)
        if [ -n "$id" ]; then
            echo "$id"
            return
        fi
    fi
    local id=$(echo "$json" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "$id"
}

parse_json_ids() {
    local json="$1"
    if command -v jq &> /dev/null; then
        echo "$json" | jq -r '.data[]?.id // empty' 2>/dev/null
        return
    fi
    echo "$json" | grep -o '"id":"[^"]*"' | cut -d'"' -f4
}

cleanup_kong() {
    echo -e "${YELLOW}Cleaning up existing Kong configurations...${NC}"

    echo "  Deleting all routes..."
    ROUTES_JSON=$(curl -s "$KONG_ADMIN_URL/routes")
    ROUTE_IDS=$(parse_json_ids "$ROUTES_JSON")
    if [ -n "$ROUTE_IDS" ]; then
        for route_id in $ROUTE_IDS; do
            curl -s -X DELETE "$KONG_ADMIN_URL/routes/$route_id" > /dev/null 2>&1
        done
        echo -e "${GREEN}  Routes deleted${NC}"
    else
        echo -e "${YELLOW}  No routes to delete${NC}"
    fi

    echo "  Deleting all services..."
    SERVICES_JSON=$(curl -s "$KONG_ADMIN_URL/services")
    SERVICE_IDS=$(parse_json_ids "$SERVICES_JSON")
    if [ -n "$SERVICE_IDS" ]; then
        for service_id in $SERVICE_IDS; do
            curl -s -X DELETE "$KONG_ADMIN_URL/services/$service_id" > /dev/null 2>&1
        done
        echo -e "${GREEN}  Services deleted${NC}"
    else
        echo -e "${YELLOW}  No services to delete${NC}"
    fi
    echo ""
}

# Create service + route + CORS helper
create_service_route() {
    local name=$1
    local url=$2
    local path=$3
    local priority=${4:-100}

    echo -e "${GREEN}  Setting up $name...${NC}"

    # Create service
    local SERVICE_RESPONSE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
      -H "Content-Type: application/json" \
      -d "{
        \"name\": \"$name\",
        \"url\": \"$url\"
      }")

    local SERVICE_ID=$(parse_json_id "$SERVICE_RESPONSE")
    if [ -z "$SERVICE_ID" ]; then
        echo -e "${RED}    Failed to create $name${NC}"
        return 1
    fi
    echo -e "    Service created: $SERVICE_ID"

    # Create route
    local ROUTE_RESPONSE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d "{
        \"name\": \"${name}-route\",
        \"paths\": [\"/$path\"],
        \"strip_path\": true,
        \"preserve_host\": false,
        \"protocols\": [\"http\", \"https\"],
        \"regex_priority\": $priority
      }")

    local ROUTE_ID=$(parse_json_id "$ROUTE_RESPONSE")
    if [ -n "$ROUTE_ID" ]; then
        echo -e "    Route created: /$path -> $url"

        # Add CORS plugin
        curl -s -X POST "$KONG_ADMIN_URL/routes/$ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "cors",
            "config": {
              "origins": ["*"],
              "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
              "headers": ["Accept", "Authorization", "Content-Type"],
              "exposed_headers": ["X-Auth-Token"],
              "credentials": true,
              "max_age": 3600
            }
          }' > /dev/null
        echo -e "    CORS enabled"
    else
        echo -e "${RED}    Failed to create route for $name${NC}"
    fi
    echo ""
}

###############################################################################
# Cleanup & Setup
###############################################################################

cleanup_kong

###############################################################################
# Setup JWT Consumer
###############################################################################

echo -e "${BLUE}[0] Setting up JWT Consumer...${NC}"

JWT_SECRET_VAL="${JWT_SECRET}"
ISSUER="${JWT_ISSUER:-http://192.168.120.45}"

curl -s -X POST "$KONG_ADMIN_URL/consumers" \
  -H "Content-Type: application/json" \
  -d '{"username": "auth-service", "custom_id": "myunila-auth-service"}' > /dev/null 2>&1

curl -s -X POST "$KONG_ADMIN_URL/consumers/auth-service/jwt" \
  -H "Content-Type: application/json" \
  -d "{
    \"key\": \"$ISSUER\",
    \"secret\": \"$JWT_SECRET_VAL\",
    \"algorithm\": \"HS256\"
  }" > /dev/null 2>&1

echo -e "${GREEN}  JWT Consumer configured${NC}"
echo ""

###############################################################################
# Create Services & Routes (all local container names)
###############################################################################

echo -e "${BLUE}Creating services and routes...${NC}"
echo ""

# Auth Service (via Nginx port 80)
create_service_route "auth-service" \
    "${AUTH_SERVICE_URL:-http://myunila-nginx-staging:80}" \
    "auth-service" 200

# Public Service (via Nginx port 81)
create_service_route "public-service" \
    "${PUBLIC_SERVICE_URL:-http://myunila-nginx-staging:81}" \
    "public-service" 300

# Dashboard Service (via Nginx port 82)
create_service_route "dashboard-service" \
    "${DASHBOARD_SERVICE_URL:-http://myunila-nginx-staging:82}" \
    "dashboard-service" 250

# Sister Service (Go - direct)
create_service_route "sister-service" \
    "${SISTER_SERVICE_URL:-http://myunila-sister-staging:8083}" \
    "sister-service" 100

# Feeder Service (Go - direct)
create_service_route "feeder-service" \
    "${FEEDER_SERVICE_URL:-http://myunila-feeder-staging:8084}" \
    "feeder-service" 100

# API Service / OneData (Go - direct)
create_service_route "ws-service" \
    "${API_SERVICE_URL:-http://myunila-ws-staging:8085}" \
    "ws-service" 100

# MyUnila Service (Go - direct)
create_service_route "myunila-service" \
    "${MYUNILA_SERVICE_URL:-http://myunila-myunila-staging:8086}" \
    "myunila-service" 100

# Keuangan Service (Go - direct)
create_service_route "keuangan-service" \
    "${KEUANGAN_SERVICE_URL:-http://myunila-keuangan-staging:8088}" \
    "keuangan-service" 100

# Monitoring / Webmon Service (Go - direct)
create_service_route "webmon-service" \
    "${WEBMON_SERVICE_URL:-http://myunila-monitoring-staging:8089}" \
    "webmon-service" 100

# Monitoring Stack
# Frontend
create_service_route "frontend-service" \
    "http://myunila-frontend-staging:3000" \
    "" 1

# Monitoring Stack
create_service_route "grafana-service" \
    "http://myunila-grafana-staging:3000" \
    "grafana" 100

create_service_route "prometheus-service" \
    "http://myunila-prometheus-staging:9090" \
    "prometheus" 100

###############################################################################
# Summary
###############################################################################

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Kong Routes Summary${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

echo -e "${GREEN}Registered services:${NC}"
curl -s "$KONG_ADMIN_URL/services" | python3 -m json.tool 2>/dev/null | grep '"name"' || \
curl -s "$KONG_ADMIN_URL/services" | grep -o '"name":"[^"]*"' | sed 's/"name":"//;s/"//'

echo ""
echo -e "${GREEN}Registered routes:${NC}"
curl -s "$KONG_ADMIN_URL/routes" | python3 -m json.tool 2>/dev/null | grep -E '"name"|"paths"' || \
curl -s "$KONG_ADMIN_URL/routes" | grep -o '"name":"[^"]*"' | sed 's/"name":"//;s/"//'

echo ""
echo -e "${GREEN}Kong routes setup complete!${NC}"
echo ""
echo "Test with:"
echo "  curl http://192.168.120.45:9800/auth-service/api/v1/health"
echo "  curl http://192.168.120.45:9800/public-service/api/v1/health"
echo "  curl http://192.168.120.45:9800/sister-service/health"
echo ""
