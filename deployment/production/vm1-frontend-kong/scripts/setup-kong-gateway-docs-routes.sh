#!/bin/bash

###############################################################################
# Setup Kong Gateway Routes for API Documentation
# This script creates Kong routes for accessing API docs via gateway
#
# Usage: bash setup-kong-gateway-docs-routes.sh
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

KONG_ADMIN_URL="http://localhost:9801"

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Setup Kong Gateway Docs Routes${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

# Service mapping: service_name -> backend_url
declare -A SERVICES
SERVICES["api-service"]="http://192.168.120.43:8085"
SERVICES["auth-service"]="http://192.168.120.42:8081"
SERVICES["public-service"]="http://192.168.120.42:8082"
SERVICES["sister-service"]="http://192.168.120.43:8083"
SERVICES["feeder-service"]="http://192.168.120.43:8084"
SERVICES["myunila-service"]="http://192.168.120.43:8086"

for SERVICE in "${!SERVICES[@]}"; do
    BACKEND_URL="${SERVICES[$SERVICE]}"
    SERVICE_NAME="gateway-${SERVICE}-docs"
    ROUTE_NAME="gateway-${SERVICE}-docs-route"
    SPEC_ROUTE_NAME="gateway-${SERVICE}-docs-spec-route"

    echo -e "${YELLOW}Setting up ${SERVICE}...${NC}"

    # Check if service already exists
    EXISTING_SERVICE=$(curl -s "$KONG_ADMIN_URL/services/$SERVICE_NAME" 2>/dev/null)
    if echo "$EXISTING_SERVICE" | grep -q "\"id\""; then
        echo "  ⚠ Service $SERVICE_NAME already exists, skipping..."
    else
        # Create service
        echo "  → Creating service: $SERVICE_NAME -> $BACKEND_URL"
        curl -s -X POST "$KONG_ADMIN_URL/services" \
            -H "Content-Type: application/json" \
            -d "{\"name\":\"$SERVICE_NAME\",\"url\":\"$BACKEND_URL\"}" > /dev/null
    fi

    # === ROUTE 1: Public spec files (NO JWT) - higher priority ===
    EXISTING_SPEC_ROUTE=$(curl -s "$KONG_ADMIN_URL/routes/$SPEC_ROUTE_NAME" 2>/dev/null)
    if echo "$EXISTING_SPEC_ROUTE" | grep -q "\"id\""; then
        echo "  ⚠ Route $SPEC_ROUTE_NAME already exists, checking plugins..."
    else
        # Create regex route for spec files - PUBLIC access - higher priority matches first
        echo "  → Creating public route: /gateway/$SERVICE/docs/{openapi.json,openapi.yaml,favicon.png}"
        curl -s -X POST "$KONG_ADMIN_URL/services/$SERVICE_NAME/routes" \
            -H "Content-Type: application/json" \
            -d "{\"name\":\"$SPEC_ROUTE_NAME\",\"paths\":[\"~/gateway/$SERVICE(?P<path>/docs/(openapi\\\\.json|openapi\\\\.yaml|favicon\\\\.png))\"],\"methods\":[\"GET\",\"OPTIONS\"],\"strip_path\":false,\"preserve_host\":false,\"protocols\":[\"http\",\"https\"],\"regex_priority\":1000}" > /dev/null
    fi

    # Add plugins for public spec route (NO JWT plugin!)
    EXISTING_SPEC_TRANSFORMER=$(curl -s "$KONG_ADMIN_URL/routes/$SPEC_ROUTE_NAME/plugins" | grep -o '"request-transformer"')
    if [ -z "$EXISTING_SPEC_TRANSFORMER" ]; then
        echo "  → Adding request-transformer plugin to spec route"
        curl -s -X POST "$KONG_ADMIN_URL/routes/$SPEC_ROUTE_NAME/plugins" \
            -H "Content-Type: application/json" \
            -d '{"name":"request-transformer","config":{"replace":{"uri":"$(uri_captures.path)"}}}' > /dev/null
    else
        echo "  ✓ request-transformer plugin already exists on spec route"
    fi

    EXISTING_SPEC_CORS=$(curl -s "$KONG_ADMIN_URL/routes/$SPEC_ROUTE_NAME/plugins" | grep -o '"cors"')
    if [ -z "$EXISTING_SPEC_CORS" ]; then
        echo "  → Adding CORS plugin to spec route"
        curl -s -X POST "$KONG_ADMIN_URL/routes/$SPEC_ROUTE_NAME/plugins" \
            -H "Content-Type: application/json" \
            -d '{"name":"cors","config":{"origins":["*"],"methods":["GET","OPTIONS"],"headers":["Accept","Authorization","Content-Type"],"credentials":false,"max_age":3600}}' > /dev/null
    else
        echo "  ✓ CORS plugin already exists on spec route"
    fi

    # === ROUTE 2: Protected docs page (requires JWT) - lower priority ===
    EXISTING_ROUTE=$(curl -s "$KONG_ADMIN_URL/routes/$ROUTE_NAME" 2>/dev/null)
    if echo "$EXISTING_ROUTE" | grep -q "\"id\""; then
        echo "  ⚠ Route $ROUTE_NAME already exists, checking plugins..."
    else
        # Create regex route - matches /docs and /docs/* - lower priority matched after spec files
        echo "  → Creating protected route: /gateway/$SERVICE/docs"
        curl -s -X POST "$KONG_ADMIN_URL/services/$SERVICE_NAME/routes" \
            -H "Content-Type: application/json" \
            -d "{\"name\":\"$ROUTE_NAME\",\"paths\":[\"~/gateway/$SERVICE(?P<path>/docs.*)\"],\"methods\":[\"GET\",\"OPTIONS\"],\"strip_path\":false,\"preserve_host\":false,\"protocols\":[\"http\",\"https\"],\"regex_priority\":900}" > /dev/null
    fi

    # Add plugins for protected route
    EXISTING_TRANSFORMER=$(curl -s "$KONG_ADMIN_URL/routes/$ROUTE_NAME/plugins" | grep -o '"request-transformer"')
    if [ -z "$EXISTING_TRANSFORMER" ]; then
        echo "  → Adding request-transformer plugin to docs route"
        curl -s -X POST "$KONG_ADMIN_URL/routes/$ROUTE_NAME/plugins" \
            -H "Content-Type: application/json" \
            -d '{"name":"request-transformer","config":{"replace":{"uri":"$(uri_captures.path)"}}}' > /dev/null
    else
        echo "  ✓ request-transformer plugin already exists on docs route"
    fi

    EXISTING_CORS=$(curl -s "$KONG_ADMIN_URL/routes/$ROUTE_NAME/plugins" | grep -o '"cors"')
    if [ -z "$EXISTING_CORS" ]; then
        echo "  → Adding CORS plugin to docs route"
        curl -s -X POST "$KONG_ADMIN_URL/routes/$ROUTE_NAME/plugins" \
            -H "Content-Type: application/json" \
            -d '{"name":"cors","config":{"origins":["*"],"methods":["GET","OPTIONS"],"headers":["Accept","Authorization","Content-Type","Cookie"],"credentials":true,"max_age":3600}}' > /dev/null
    else
        echo "  ✓ CORS plugin already exists on docs route"
    fi

    EXISTING_JWT=$(curl -s "$KONG_ADMIN_URL/routes/$ROUTE_NAME/plugins" | grep -o '"jwt"')
    if [ -z "$EXISTING_JWT" ]; then
        echo "  → Adding JWT plugin to docs route (cookie: token)"
        curl -s -X POST "$KONG_ADMIN_URL/routes/$ROUTE_NAME/plugins" \
            -H "Content-Type: application/json" \
            -d '{"name":"jwt","config":{"claims_to_verify":["exp"],"key_claim_name":"iss","secret_is_base64":false,"run_on_preflight":false,"header_names":["authorization"],"cookie_names":["token"]}}' > /dev/null
    else
        echo "  ✓ JWT plugin already exists on docs route"
    fi

    echo -e "  ${GREEN}✓ Successfully configured $SERVICE${NC}"
    echo ""
done

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

echo -e "${YELLOW}Test URLs:${NC}"
echo "  https://my.unila.ac.id/gateway/api-service/docs"
echo "  https://my.unila.ac.id/gateway/auth-service/docs"
echo "  https://my.unila.ac.id/gateway/public-service/docs"
echo "  https://my.unila.ac.id/gateway/sister-service/docs"
echo "  https://my.unila.ac.id/gateway/feeder-service/docs"
echo "  https://my.unila.ac.id/gateway/myunila-service/docs"
echo ""

echo -e "${YELLOW}Note:${NC}"
echo "  - All docs require login (JWT token via cookie or header)"
echo "  - OpenAPI spec files (/docs/openapi.json) are public for Scalar UI"
echo ""
