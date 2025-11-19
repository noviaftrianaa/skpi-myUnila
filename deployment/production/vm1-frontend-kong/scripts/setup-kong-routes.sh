#!/bin/bash

###############################################################################
# Setup Kong Routes for Local Development
# Configures services and routes for all backend services
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

KONG_ADMIN_URL="http://localhost:9801"

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Kong Routes Setup - Production VM1${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Wait for Kong to be ready
echo -e "${GREEN}Waiting for Kong to be ready...${NC}"
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s "$KONG_ADMIN_URL" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Kong is ready${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "  Waiting... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}✗ Kong failed to start${NC}"
    exit 1
fi

echo ""

###############################################################################
# Helper Functions
###############################################################################

# Helper function to parse JSON
parse_json_id() {
    local json="$1"
    # Try jq first (most reliable)
    if command -v jq &> /dev/null; then
        local id=$(echo "$json" | jq -r '.id // empty' 2>/dev/null)
        if [ -n "$id" ]; then
            echo "$id"
            return
        fi
    fi
    # Try python3
    local id=$(echo "$json" | python3 -m json.tool 2>/dev/null | grep '"id"' | head -1 | cut -d'"' -f4)
    # Fallback to grep if python3 not available
    if [ -z "$id" ]; then
        id=$(echo "$json" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    fi
    echo "$id"
}

# Helper function to extract all IDs from JSON array
parse_json_ids() {
    local json="$1"
    # Try jq first (most reliable)
    if command -v jq &> /dev/null; then
        echo "$json" | jq -r '.data[]?.id // empty' 2>/dev/null
        return
    fi
    # Try python3
    local ids=$(echo "$json" | python3 -m json.tool 2>/dev/null | grep '"id"' | cut -d'"' -f4)
    # Fallback to grep
    if [ -z "$ids" ]; then
        ids=$(echo "$json" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    fi
    echo "$ids"
}

# Helper function to delete all Kong configurations
cleanup_kong() {
    echo -e "${YELLOW}Cleaning up existing Kong configurations...${NC}"

    # Delete all routes first (routes depend on services)
    echo "  → Deleting all routes..."
    ROUTES_JSON=$(curl -s "$KONG_ADMIN_URL/routes")
    ROUTE_IDS=$(parse_json_ids "$ROUTES_JSON")

    if [ -n "$ROUTE_IDS" ]; then
        for route_id in $ROUTE_IDS; do
            curl -s -X DELETE "$KONG_ADMIN_URL/routes/$route_id" > /dev/null 2>&1
            echo "    Deleted route: $route_id"
        done
        echo -e "${GREEN}  ✓ All routes deleted${NC}"
    else
        echo -e "${YELLOW}  ! No routes found to delete${NC}"
    fi

    # Delete all services
    echo "  → Deleting all services..."
    SERVICES_JSON=$(curl -s "$KONG_ADMIN_URL/services")
    SERVICE_IDS=$(parse_json_ids "$SERVICES_JSON")

    if [ -n "$SERVICE_IDS" ]; then
        for service_id in $SERVICE_IDS; do
            curl -s -X DELETE "$KONG_ADMIN_URL/services/$service_id" > /dev/null 2>&1
            echo "    Deleted service: $service_id"
        done
        echo -e "${GREEN}  ✓ All services deleted${NC}"
    else
        echo -e "${YELLOW}  ! No services found to delete${NC}"
    fi

    echo ""
}

###############################################################################
# Cleanup existing configurations
###############################################################################
cleanup_kong

###############################################################################
# 0. Setup JWT Consumer & Credentials
###############################################################################
echo -e "${GREEN}[0/4] Setting up JWT Consumer...${NC}"

# JWT Configuration
JWT_SECRET="${JWT_SECRET:-!UnilaAuthService2025}"
ISSUER="${JWT_ISSUER:-http://localhost:8081}"

# Create Consumer for auth-service
CONSUMER_RESPONSE=$(curl -s -X POST "$KONG_ADMIN_URL/consumers" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "auth-service",
    "custom_id": "myunila-auth-service"
  }')

if echo "$CONSUMER_RESPONSE" | grep -q "already exists"; then
    echo -e "${YELLOW}  ! Consumer already exists, skipping...${NC}"
elif echo "$CONSUMER_RESPONSE" | grep -q "id"; then
    echo -e "${GREEN}  ✓ Consumer created successfully${NC}"
else
    echo -e "${YELLOW}  ! Consumer creation response: continuing anyway...${NC}"
fi

# Add JWT credential to consumer
JWT_CREDENTIAL_RESPONSE=$(curl -s -X POST "$KONG_ADMIN_URL/consumers/auth-service/jwt" \
  -H "Content-Type: application/json" \
  -d "{
    \"key\": \"$ISSUER\",
    \"secret\": \"$JWT_SECRET\",
    \"algorithm\": \"HS256\"
  }")

if echo "$JWT_CREDENTIAL_RESPONSE" | grep -q "already exists"; then
    echo -e "${YELLOW}  ! JWT credential already exists${NC}"
elif echo "$JWT_CREDENTIAL_RESPONSE" | grep -q "id"; then
    echo -e "${GREEN}  ✓ JWT credential added successfully${NC}"
else
    echo -e "${YELLOW}  ! JWT credential response: continuing anyway...${NC}"
fi

echo ""

###############################################################################
# 1. Dashboard Service
###############################################################################
echo -e "${GREEN}[1/4] Setting up Dashboard Service...${NC}"

# Create Dashboard Service (for protected endpoints)
# Note: Upstream is at VM2 (e.g., 192.168.120.42:8082)
# Add /api path prefix to match Laravel 11 auto-prefixing
DASHBOARD_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"dashboard-service\",
    \"url\": \"${DASHBOARD_SERVICE_URL:-http://192.168.120.42:8082/api}\"
  }")

DASHBOARD_SERVICE_ID=$(parse_json_id "$DASHBOARD_SERVICE")

if [ -z "$DASHBOARD_SERVICE_ID" ]; then
    echo -e "${RED}  ✗ Failed to create Dashboard service${NC}"
else
    echo -e "${GREEN}  ✓ Dashboard service created: $DASHBOARD_SERVICE_ID${NC}"
fi

# Create separate Dashboard Public Service for public endpoints
# Laravel routes: /api/public/api/v1/...
# Kong will strip /dashboard-service/public and forward to /api/public
echo -e "${YELLOW}  → Creating dashboard-public-service for public endpoints...${NC}"
DASHBOARD_PUBLIC_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"dashboard-public-service\",
    \"url\": \"${DASHBOARD_SERVICE_URL:-http://192.168.120.42:8082}/api/public\"
  }")

DASHBOARD_PUBLIC_SERVICE_ID=$(parse_json_id "$DASHBOARD_PUBLIC_SERVICE")

if [ -z "$DASHBOARD_PUBLIC_SERVICE_ID" ]; then
    echo -e "${RED}  ✗ Failed to create Dashboard Public service${NC}"
else
    echo -e "${GREEN}  ✓ Dashboard Public service created: $DASHBOARD_PUBLIC_SERVICE_ID${NC}"

    # Route 1: Public endpoints (no JWT) - /dashboard-service/public/api/v1/X → /api/public/api/v1/X
    # Strip /dashboard-service/public, forward to /api/public (via service path)
    echo -e "${YELLOW}  → Creating public route for /public endpoints...${NC}"
    DASHBOARD_PUBLIC_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$DASHBOARD_PUBLIC_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "dashboard-public-route",
        "paths": ["/dashboard-service/public"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"],
        "regex_priority": 300
      }')

    DASHBOARD_PUBLIC_ROUTE_ID=$(parse_json_id "$DASHBOARD_PUBLIC_ROUTE")

    if [ -n "$DASHBOARD_PUBLIC_ROUTE_ID" ]; then
        # Add CORS plugin (no JWT)
        curl -s -X POST "$KONG_ADMIN_URL/routes/$DASHBOARD_PUBLIC_ROUTE_ID/plugins" \
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
        echo -e "${GREEN}  ✓ Public route created (no JWT, for /public/v1/*)${NC}"
    fi
fi

# Route 2: Protected endpoints (with JWT) - /dashboard-service/api/v1/my → /api/api/v1/my
if [ -n "$DASHBOARD_SERVICE_ID" ]; then
    echo -e "${YELLOW}  → Creating protected route for /my endpoints...${NC}"
    DASHBOARD_PROTECTED_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$DASHBOARD_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "dashboard-protected-route",
        "paths": ["/dashboard-service/api/v1/my"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"],
        "regex_priority": 200
      }')

    DASHBOARD_PROTECTED_ROUTE_ID=$(parse_json_id "$DASHBOARD_PROTECTED_ROUTE")

    if [ -n "$DASHBOARD_PROTECTED_ROUTE_ID" ]; then
        # Add CORS plugin
        curl -s -X POST "$KONG_ADMIN_URL/routes/$DASHBOARD_PROTECTED_ROUTE_ID/plugins" \
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

        # Add JWT plugin
        curl -s -X POST "$KONG_ADMIN_URL/routes/$DASHBOARD_PROTECTED_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "jwt",
            "config": {
              "claims_to_verify": ["exp"],
              "key_claim_name": "iss",
              "secret_is_base64": false,
              "anonymous": null,
              "run_on_preflight": false,
              "maximum_expiration": 0,
              "header_names": ["authorization"],
              "cookie_names": []
            }
          }' > /dev/null
        echo -e "${GREEN}  ✓ Protected route created with JWT (for /api/v1/my/*)${NC}"
    fi
fi

echo ""

###############################################################################
# 2. Auth Service
###############################################################################
echo -e "${GREEN}[2/4] Setting up Auth Service...${NC}"

# Create Auth Service
# Note: Upstream is at VM2 (e.g., 192.168.120.42:8081)
# Laravel 11 auto-adds /api prefix to api routes, so we need /api in service URL
# Kong will strip /auth-service and forward remaining path to upstream nginx with /api prefix
# Example: /auth-service/api/v1/auth/login → /api/api/v1/auth/login → Laravel processes it
AUTH_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"auth-service\",
    \"url\": \"${AUTH_SERVICE_URL:-http://192.168.120.42:8081/api}\"
  }")

AUTH_SERVICE_ID=$(parse_json_id "$AUTH_SERVICE")

if [ -z "$AUTH_SERVICE_ID" ]; then
    echo -e "${RED}  ✗ Failed to create Auth service${NC}"
else
    echo -e "${GREEN}  ✓ Auth service created: $AUTH_SERVICE_ID${NC}"

    # Create Auth route (no JWT at Kong level - auth service handles JWT internally)
    AUTH_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$AUTH_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "auth-service-route",
        "paths": ["/auth-service"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"]
      }')

    AUTH_ROUTE_ID=$(parse_json_id "$AUTH_ROUTE")
    echo -e "${GREEN}  ✓ Auth route created (no JWT at Kong level)${NC}"

    # Add CORS plugin
    if [ -n "$AUTH_ROUTE_ID" ]; then
        curl -s -X POST "$KONG_ADMIN_URL/routes/$AUTH_ROUTE_ID/plugins" \
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
        echo -e "${GREEN}  ✓ CORS plugin added${NC}"
    fi
fi

echo ""

###############################################################################
# 3. Sister Service
###############################################################################
echo -e "${GREEN}[3/4] Setting up Sister Service...${NC}"

# Create Sister Service with extended timeouts for long-running sync operations
# Note: Upstream is at VM3 (e.g., 192.168.120.43:8083)
SISTER_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"sister-service\",
    \"url\": \"${SISTER_SERVICE_URL:-http://192.168.120.43:8083}\",
    \"connect_timeout\": 300000,
    \"write_timeout\": 300000,
    \"read_timeout\": 300000,
    \"retries\": 5
  }")

SISTER_SERVICE_ID=$(parse_json_id "$SISTER_SERVICE")

if [ -z "$SISTER_SERVICE_ID" ]; then
    echo -e "${RED}  ✗ Failed to create Sister service${NC}"
else
    echo -e "${GREEN}  ✓ Sister service created: $SISTER_SERVICE_ID${NC}"

    # Route 1: Protected /api/v1/* endpoints (with JWT for all GET/POST)
    echo -e "${YELLOW}  → Creating protected /api/v1 route...${NC}"
    SISTER_API_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$SISTER_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "sister-api-v1-route",
        "paths": ["/sister-service"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"],
        "regex_priority": 200
      }')

    SISTER_API_ROUTE_ID=$(parse_json_id "$SISTER_API_ROUTE")

    if [ -n "$SISTER_API_ROUTE_ID" ]; then
        # Add CORS plugin
        curl -s -X POST "$KONG_ADMIN_URL/routes/$SISTER_API_ROUTE_ID/plugins" \
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

        # Add JWT plugin (authentication required for all methods)
        curl -s -X POST "$KONG_ADMIN_URL/routes/$SISTER_API_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "jwt",
            "config": {
              "claims_to_verify": ["exp"],
              "key_claim_name": "iss",
              "secret_is_base64": false,
              "anonymous": null,
              "run_on_preflight": false,
              "maximum_expiration": 0,
              "header_names": ["authorization"],
              "cookie_names": []
            }
          }' > /dev/null
        echo -e "${GREEN}  ✓ Protected /api/v1 route created with JWT${NC}"
    fi

    # Route 2: Public endpoints (no JWT) - separate service with /public path
    echo -e "${YELLOW}  → Creating public service for photo endpoint...${NC}"
    SISTER_PUBLIC_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
      -H "Content-Type: application/json" \
      -d "{
        \"name\": \"sister-public-service\",
        \"url\": \"${SISTER_SERVICE_URL:-http://192.168.120.43:8083}/public\"
      }")

    SISTER_PUBLIC_SERVICE_ID=$(parse_json_id "$SISTER_PUBLIC_SERVICE")

    if [ -z "$SISTER_PUBLIC_SERVICE_ID" ]; then
        echo -e "${YELLOW}  ! Public service may already exist, continuing...${NC}"
    else
        echo -e "${GREEN}  ✓ Public service created: $SISTER_PUBLIC_SERVICE_ID${NC}"
    fi

    # Create route for public service
    SISTER_PUBLIC_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/sister-public-service/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "sister-public-route",
        "paths": ["/sister-service/public"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"],
        "regex_priority": 150
      }')

    SISTER_PUBLIC_ROUTE_ID=$(parse_json_id "$SISTER_PUBLIC_ROUTE")

    if [ -n "$SISTER_PUBLIC_ROUTE_ID" ]; then
        # Add CORS plugin (no JWT plugin)
        curl -s -X POST "$KONG_ADMIN_URL/routes/$SISTER_PUBLIC_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "cors",
            "config": {
              "origins": ["*"],
              "methods": ["GET", "OPTIONS"],
              "headers": ["Accept", "Content-Type"],
              "exposed_headers": [],
              "credentials": false,
              "max_age": 3600
            }
          }' > /dev/null
        echo -e "${GREEN}  ✓ Public route created (no JWT, for photo endpoint)${NC}"
    fi
fi

echo ""

###############################################################################
# 4. Feeder Service
###############################################################################
echo -e "${GREEN}[4/4] Setting up Feeder Service...${NC}"

# Create Feeder Service
# Note: Upstream is at VM3 (e.g., 192.168.120.43:8084)
# Feeder service is a Go app with routes at /api/v1/*
FEEDER_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"feeder-service\",
    \"url\": \"${FEEDER_SERVICE_URL:-http://192.168.120.43:8084}\",
    \"connect_timeout\": 300000,
    \"write_timeout\": 300000,
    \"read_timeout\": 300000,
    \"retries\": 5
  }")

FEEDER_SERVICE_ID=$(parse_json_id "$FEEDER_SERVICE")

if [ -z "$FEEDER_SERVICE_ID" ]; then
    echo -e "${RED}  ✗ Failed to create Feeder service${NC}"
else
    echo -e "${GREEN}  ✓ Feeder service created: $FEEDER_SERVICE_ID${NC}"

    # Route 1: Protected /api/v1/* endpoints (with JWT for API calls)
    echo -e "${YELLOW}  → Creating protected /api/v1 route...${NC}"
    FEEDER_API_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$FEEDER_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "feeder-api-v1-route",
        "paths": ["/feeder-service"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"],
        "regex_priority": 200
      }')

    FEEDER_API_ROUTE_ID=$(parse_json_id "$FEEDER_API_ROUTE")

    if [ -n "$FEEDER_API_ROUTE_ID" ]; then
        # Add CORS plugin
        curl -s -X POST "$KONG_ADMIN_URL/routes/$FEEDER_API_ROUTE_ID/plugins" \
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

        # Add JWT plugin (authentication required for API calls)
        curl -s -X POST "$KONG_ADMIN_URL/routes/$FEEDER_API_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "jwt",
            "config": {
              "claims_to_verify": ["exp"],
              "key_claim_name": "iss",
              "secret_is_base64": false,
              "anonymous": null,
              "run_on_preflight": false,
              "maximum_expiration": 0,
              "header_names": ["authorization"],
              "cookie_names": []
            }
          }' > /dev/null
        echo -e "${GREEN}  ✓ Protected /api/v1 route created with JWT${NC}"
    fi

    # Route 2: Public endpoints (no JWT) - separate service for frontend SSR
    echo -e "${YELLOW}  → Creating public service for frontend SSR...${NC}"
    FEEDER_PUBLIC_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
      -H "Content-Type: application/json" \
      -d "{
        \"name\": \"feeder-public-service\",
        \"url\": \"${FEEDER_SERVICE_URL:-http://192.168.120.43:8084}\"
      }")

    FEEDER_PUBLIC_SERVICE_ID=$(parse_json_id "$FEEDER_PUBLIC_SERVICE")

    if [ -z "$FEEDER_PUBLIC_SERVICE_ID" ]; then
        echo -e "${YELLOW}  ! Public service may already exist, continuing...${NC}"
    else
        echo -e "${GREEN}  ✓ Public service created: $FEEDER_PUBLIC_SERVICE_ID${NC}"
    fi

    # Create route for public service
    FEEDER_PUBLIC_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/feeder-public-service/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "feeder-public-route",
        "paths": ["/feeder-service/public"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"],
        "regex_priority": 150
      }')

    FEEDER_PUBLIC_ROUTE_ID=$(parse_json_id "$FEEDER_PUBLIC_ROUTE")

    if [ -n "$FEEDER_PUBLIC_ROUTE_ID" ]; then
        # Add CORS plugin (no JWT plugin)
        curl -s -X POST "$KONG_ADMIN_URL/routes/$FEEDER_PUBLIC_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "cors",
            "config": {
              "origins": ["*"],
              "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
              "headers": ["Accept", "Content-Type"],
              "exposed_headers": [],
              "credentials": false,
              "max_age": 3600
            }
          }' > /dev/null
        echo -e "${GREEN}  ✓ Public route created (no JWT, for frontend SSR)${NC}"
    fi
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Kong Routes Setup Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

echo -e "${YELLOW}Configured Routes:${NC}"
echo "  Dashboard (public):    http://localhost:9800/dashboard-service/public/api/v1"
echo "  Dashboard (protected): http://localhost:9800/dashboard-service/api/v1"
echo "  Auth:                  http://localhost:9800/auth-service/api/v1"
echo "  Sister (protected):    http://localhost:9800/sister-service/api/v1"
echo "  Sister (public photo): http://localhost:9800/sister-service/public/api/v1/dosen/photo/:id"
echo "  Feeder (protected):    http://localhost:9800/feeder-service/api/v1"
echo ""

echo -e "${YELLOW}Example Test Commands:${NC}"
echo "  # Dashboard public (no auth)"
echo "  curl http://localhost:9800/dashboard-service/public/api/v1/dosen/statistics"
echo ""
echo "  # Sister public photo (no auth)"
echo "  curl http://localhost:9800/sister-service/public/api/v1/dosen/photo/YOUR-ID-HERE"
echo ""
echo "  # Check Kong services and routes"
echo "  curl $KONG_ADMIN_URL/services"
echo "  curl $KONG_ADMIN_URL/routes"
echo ""
