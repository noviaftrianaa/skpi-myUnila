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
echo -e "${GREEN}[0/6] Setting up JWT Consumer...${NC}"

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
# 1. Public Service (formerly Dashboard Service)
###############################################################################
echo -e "${GREEN}[1/6] Setting up Public Service...${NC}"

# Note: Public service only has public endpoints (no JWT required)
# Frontend env includes /api/v1: NEXT_PUBLIC_PUBLIC_API_URL=http://kong:9800/public-service/api/v1
# Kong strips /public-service prefix and forwards remaining path to backend
# Example: Frontend calls /public-service/api/v1/unila/statistics → Kong forwards /api/v1/unila/statistics to backend
echo -e "${YELLOW}  → Creating public-service for public endpoints...${NC}"
PUBLIC_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"public-service\",
    \"url\": \"${PUBLIC_SERVICE_URL:-http://192.168.120.42:8082}\"
  }")

PUBLIC_SERVICE_ID=$(parse_json_id "$PUBLIC_SERVICE")

if [ -z "$PUBLIC_SERVICE_ID" ]; then
    echo -e "${RED}  ✗ Failed to create Public service${NC}"
else
    echo -e "${GREEN}  ✓ Public service created: $PUBLIC_SERVICE_ID${NC}"

    # Route: Public endpoints (no JWT) - /public-service/* → /*
    # Frontend: /public-service/api/v1/unila/statistics → backend: /api/v1/unila/statistics
    echo -e "${YELLOW}  → Creating public route...${NC}"
    PUBLIC_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$PUBLIC_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "public-service-route",
        "paths": ["/public-service"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"],
        "regex_priority": 300
      }')

    PUBLIC_ROUTE_ID=$(parse_json_id "$PUBLIC_ROUTE")

    if [ -n "$PUBLIC_ROUTE_ID" ]; then
        # Add CORS plugin (no JWT plugin - all public)
        curl -s -X POST "$KONG_ADMIN_URL/routes/$PUBLIC_ROUTE_ID/plugins" \
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
        echo -e "${GREEN}  ✓ Public route created (no JWT)${NC}"
    fi
fi

echo ""

###############################################################################
# 2. Auth Service
###############################################################################
echo -e "${GREEN}[2/6] Setting up Auth Service...${NC}"

# Create Auth Service
# Note: Upstream is at VM2 (e.g., 192.168.120.42:8081)
# Frontend env includes /api/v1: NEXT_PUBLIC_AUTH_API_URL=http://kong:9800/auth-service/api/v1
# Kong strips /auth-service prefix and forwards remaining path to backend
# Example: Frontend calls /auth-service/api/v1/auth/login → Kong forwards /api/v1/auth/login to backend
AUTH_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"auth-service\",
    \"url\": \"${AUTH_SERVICE_URL:-http://192.168.120.42:8081}\"
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

# Create Auth Manakses Service (protected with JWT at Kong level)
# Similar to sister/feeder services - Kong validates JWT, Laravel trusts it
# This routes /auth-service/api/v1/manakses/* to backend /api/v1/manakses/*
echo -e "${YELLOW}  → Creating auth-manakses-service for protected manakses endpoints...${NC}"
AUTH_MANAKSES_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"auth-manakses-service\",
    \"url\": \"${AUTH_SERVICE_URL:-http://192.168.120.42:8081}/api/v1/manakses\"
  }")

AUTH_MANAKSES_SERVICE_ID=$(parse_json_id "$AUTH_MANAKSES_SERVICE")

if [ -z "$AUTH_MANAKSES_SERVICE_ID" ]; then
    echo -e "${YELLOW}  ! Manakses service may already exist, continuing...${NC}"
else
    echo -e "${GREEN}  ✓ Manakses service created: $AUTH_MANAKSES_SERVICE_ID${NC}"
fi

# Create route for manakses service with JWT validation
AUTH_MANAKSES_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/auth-manakses-service/routes" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "auth-manakses-route",
    "paths": ["/auth-service/api/v1/manakses"],
    "strip_path": true,
    "preserve_host": false,
    "protocols": ["http", "https"],
    "regex_priority": 100
  }')

AUTH_MANAKSES_ROUTE_ID=$(parse_json_id "$AUTH_MANAKSES_ROUTE")

if [ -n "$AUTH_MANAKSES_ROUTE_ID" ]; then
    # Add CORS plugin
    curl -s -X POST "$KONG_ADMIN_URL/routes/$AUTH_MANAKSES_ROUTE_ID/plugins" \
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

    # Add JWT plugin (authentication required)
    curl -s -X POST "$KONG_ADMIN_URL/routes/$AUTH_MANAKSES_ROUTE_ID/plugins" \
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
    echo -e "${GREEN}  ✓ Manakses route created with JWT (for /api/v1/manakses/*)${NC}"
fi

echo ""

###############################################################################
# 3. Sister Service
###############################################################################
echo -e "${GREEN}[3/6] Setting up Sister Service...${NC}"

# Create Sister Service with extended timeouts for long-running sync operations
# Note: Upstream is at VM3 (e.g., 192.168.120.43:8083)
SISTER_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"sister-service\",
    \"url\": \"${SISTER_SERVICE_URL:-http://192.168.120.43:8083}\",
    \"connect_timeout\": 720000,
    \"write_timeout\": 720000,
    \"read_timeout\": 720000,
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
echo -e "${GREEN}[4/6] Setting up Feeder Service...${NC}"

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

###############################################################################
# 5. MyUnila Service
###############################################################################
echo -e "${GREEN}[5/6] Setting up MyUnila Service...${NC}"

# Create MyUnila Service
# Note: Upstream is at VM3 (e.g., 192.168.120.43:8086)
# MyUnila service is a Go app with routes at /api/v1/* (SIKEP, etc.)
MYUNILA_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"myunila-service\",
    \"url\": \"${MYUNILA_SERVICE_URL:-http://192.168.120.43:8086}\",
    \"connect_timeout\": 300000,
    \"write_timeout\": 300000,
    \"read_timeout\": 300000,
    \"retries\": 5
  }")

MYUNILA_SERVICE_ID=$(parse_json_id "$MYUNILA_SERVICE")

if [ -z "$MYUNILA_SERVICE_ID" ]; then
    echo -e "${RED}  ✗ Failed to create MyUnila service${NC}"
else
    echo -e "${GREEN}  ✓ MyUnila service created: $MYUNILA_SERVICE_ID${NC}"

    # Route 1: Protected /api/v1/* endpoints (with JWT for API calls)
    echo -e "${YELLOW}  → Creating protected /api/v1 route...${NC}"
    MYUNILA_API_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$MYUNILA_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "myunila-api-v1-route",
        "paths": ["/myunila-service"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"],
        "regex_priority": 200
      }')

    MYUNILA_API_ROUTE_ID=$(parse_json_id "$MYUNILA_API_ROUTE")

    if [ -n "$MYUNILA_API_ROUTE_ID" ]; then
        # Add CORS plugin
        curl -s -X POST "$KONG_ADMIN_URL/routes/$MYUNILA_API_ROUTE_ID/plugins" \
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
        curl -s -X POST "$KONG_ADMIN_URL/routes/$MYUNILA_API_ROUTE_ID/plugins" \
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

    # Route 2: Public endpoints (no JWT) - separate service for public data
    echo -e "${YELLOW}  → Creating public service for public endpoints...${NC}"
    MYUNILA_PUBLIC_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
      -H "Content-Type: application/json" \
      -d "{
        \"name\": \"myunila-public-service\",
        \"url\": \"${MYUNILA_SERVICE_URL:-http://192.168.120.43:8086}\"
      }")

    MYUNILA_PUBLIC_SERVICE_ID=$(parse_json_id "$MYUNILA_PUBLIC_SERVICE")

    if [ -z "$MYUNILA_PUBLIC_SERVICE_ID" ]; then
        echo -e "${YELLOW}  ! Public service may already exist, continuing...${NC}"
    else
        echo -e "${GREEN}  ✓ Public service created: $MYUNILA_PUBLIC_SERVICE_ID${NC}"
    fi

    # Create route for public service
    MYUNILA_PUBLIC_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/myunila-public-service/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "myunila-public-route",
        "paths": ["/myunila-service/public"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"],
        "regex_priority": 150
      }')

    MYUNILA_PUBLIC_ROUTE_ID=$(parse_json_id "$MYUNILA_PUBLIC_ROUTE")

    if [ -n "$MYUNILA_PUBLIC_ROUTE_ID" ]; then
        # Add CORS plugin (no JWT plugin)
        curl -s -X POST "$KONG_ADMIN_URL/routes/$MYUNILA_PUBLIC_ROUTE_ID/plugins" \
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
        echo -e "${GREEN}  ✓ Public route created (no JWT, for public endpoints)${NC}"
    fi
fi

echo ""

###############################################################################
# 6. Keuangan Service (SIMPEDAM)
###############################################################################
echo -e "${GREEN}[6/9] Setting up Keuangan Service...${NC}"

# Create Keuangan Service
# Note: Upstream is at VM3 (e.g., 192.168.120.43:8088)
# Keuangan service is a Go app for SIMPEDAM integration
KEUANGAN_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"keuangan-service\",
    \"url\": \"${KEUANGAN_SERVICE_URL:-http://192.168.120.43:8088}\",
    \"connect_timeout\": 300000,
    \"write_timeout\": 300000,
    \"read_timeout\": 300000,
    \"retries\": 5
  }")

KEUANGAN_SERVICE_ID=$(parse_json_id "$KEUANGAN_SERVICE")

if [ -z "$KEUANGAN_SERVICE_ID" ]; then
    echo -e "${RED}  ✗ Failed to create Keuangan service${NC}"
else
    echo -e "${GREEN}  ✓ Keuangan service created: $KEUANGAN_SERVICE_ID${NC}"

    # Route: Protected /api/v1/* endpoints (with JWT)
    echo -e "${YELLOW}  → Creating protected /api/v1 route...${NC}"
    KEUANGAN_API_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$KEUANGAN_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "keuangan-api-v1-route",
        "paths": ["/keuangan-service"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"],
        "regex_priority": 200
      }')

    KEUANGAN_API_ROUTE_ID=$(parse_json_id "$KEUANGAN_API_ROUTE")

    if [ -n "$KEUANGAN_API_ROUTE_ID" ]; then
        # Add CORS plugin with extended headers for sync operations
        curl -s -X POST "$KONG_ADMIN_URL/routes/$KEUANGAN_API_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "cors",
            "config": {
              "origins": ["*"],
              "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
              "headers": ["Accept", "Accept-Version", "Content-Length", "Content-MD5", "Content-Type", "Date", "X-Auth-Token", "Authorization", "X-Requested-With", "X-User-ID"],
              "exposed_headers": ["X-Auth-Token", "Content-Length"],
              "credentials": true,
              "max_age": 3600
            }
          }' > /dev/null

        # Add JWT plugin
        curl -s -X POST "$KONG_ADMIN_URL/routes/$KEUANGAN_API_ROUTE_ID/plugins" \
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
fi

echo ""

###############################################################################
# 7. JWT Consumer & Credentials Setup
###############################################################################
echo ""
echo -e "${GREEN}[7/9] Setting up JWT Consumer & Credentials...${NC}"

# Create consumer for auth service
echo -e "${YELLOW}  → Creating consumer 'auth-service'...${NC}"
CONSUMER_RESPONSE=$(curl -s -X POST "$KONG_ADMIN_URL/consumers" \
  -H "Content-Type: application/json" \
  --data-raw '{
    "username": "auth-service",
    "custom_id": "auth-service-jwt"
  }')

if echo "$CONSUMER_RESPONSE" | grep -q '"id"'; then
    echo -e "${GREEN}  ✓ Consumer created${NC}"
elif echo "$CONSUMER_RESPONSE" | grep -q "unique constraint violation"; then
    echo -e "${YELLOW}  ! Consumer already exists${NC}"
else
    echo -e "${RED}  ✗ Failed to create consumer${NC}"
fi

# Create JWT credentials
echo -e "${YELLOW}  → Creating JWT credentials (iss: http://192.168.120.42)...${NC}"
JWT_CRED_RESPONSE=$(curl -s -X POST "$KONG_ADMIN_URL/consumers/auth-service/jwt" \
  -H "Content-Type: application/json" \
  --data-raw '{
    "key": "http://192.168.120.42",
    "algorithm": "HS256",
    "secret": "!UnilaAuthService2025"
  }')

if echo "$JWT_CRED_RESPONSE" | grep -q '"id"'; then
    echo -e "${GREEN}  ✓ JWT credential created${NC}"
elif echo "$JWT_CRED_RESPONSE" | grep -q "unique constraint violation"; then
    echo -e "${YELLOW}  ! JWT credential already exists${NC}"
else
    echo -e "${RED}  ✗ Failed to create JWT credential${NC}"
fi

###############################################################################
# 7. Dashboard Service (Laravel)
###############################################################################
echo -e "${GREEN}[7/8] Setting up Dashboard Service...${NC}"

# Create Dashboard Service
# Note: Upstream is at VM2 (e.g., 192.168.120.42:8086)
DASHBOARD_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"dashboard-service\",
    \"url\": \"${DASHBOARD_SERVICE_URL:-http://192.168.120.42:8086}\",
    \"connect_timeout\": 60000,
    \"write_timeout\": 60000,
    \"read_timeout\": 60000,
    \"retries\": 3
  }")

DASHBOARD_SERVICE_ID=$(parse_json_id "$DASHBOARD_SERVICE")

if [ -z "$DASHBOARD_SERVICE_ID" ]; then
    echo -e "${RED}  ✗ Failed to create Dashboard service${NC}"
else
    echo -e "${GREEN}  ✓ Dashboard service created: $DASHBOARD_SERVICE_ID${NC}"

    # Route: Protected endpoints (with JWT)
    echo -e "${YELLOW}  → Creating protected route...${NC}"
    DASHBOARD_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$DASHBOARD_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "dashboard-service-route",
        "paths": ["/dashboard-service"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"],
        "regex_priority": 200
      }')

    DASHBOARD_ROUTE_ID=$(parse_json_id "$DASHBOARD_ROUTE")

    if [ -n "$DASHBOARD_ROUTE_ID" ]; then
        # Add CORS plugin
        curl -s -X POST "$KONG_ADMIN_URL/routes/$DASHBOARD_ROUTE_ID/plugins" \
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
        curl -s -X POST "$KONG_ADMIN_URL/routes/$DASHBOARD_ROUTE_ID/plugins" \
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
        echo -e "${GREEN}  ✓ Protected route created with JWT${NC}"
    fi
fi

echo ""

###############################################################################
# 8. API Service (Go - OneData)
###############################################################################
echo -e "${GREEN}[8/8] Setting up API Service (OneData)...${NC}"

# Create API Service
# Note: Upstream is at VM3 (e.g., 192.168.120.43:8085)
API_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"api-service\",
    \"url\": \"${API_SERVICE_URL:-http://192.168.120.43:8085}\",
    \"connect_timeout\": 60000,
    \"write_timeout\": 60000,
    \"read_timeout\": 60000,
    \"retries\": 3
  }")

API_SERVICE_ID=$(parse_json_id "$API_SERVICE")

if [ -z "$API_SERVICE_ID" ]; then
    echo -e "${RED}  ✗ Failed to create API service${NC}"
else
    echo -e "${GREEN}  ✓ API service created: $API_SERVICE_ID${NC}"

    # Route: Protected endpoints (with JWT)
    echo -e "${YELLOW}  → Creating protected route...${NC}"
    API_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$API_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "api-service-route",
        "paths": ["/api-service"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"],
        "regex_priority": 200
      }')

    API_ROUTE_ID=$(parse_json_id "$API_ROUTE")

    if [ -n "$API_ROUTE_ID" ]; then
        # Add CORS plugin
        curl -s -X POST "$KONG_ADMIN_URL/routes/$API_ROUTE_ID/plugins" \
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
        curl -s -X POST "$KONG_ADMIN_URL/routes/$API_ROUTE_ID/plugins" \
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
        echo -e "${GREEN}  ✓ Protected route created with JWT${NC}"
    fi
fi

###############################################################################
# 9. MinIO Storage Service (Public - no auth, read-only)
###############################################################################
echo -e "${GREEN}[9/10] Setting up MinIO Storage Service...${NC}"

# Create MinIO Storage Service
# Note: Upstream is at MinIO VM (192.168.120.47:9000)
MINIO_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"minio-storage\",
    \"url\": \"${MINIO_STORAGE_URL:-http://192.168.120.47:9000}\",
    \"connect_timeout\": 5000,
    \"write_timeout\": 30000,
    \"read_timeout\": 30000,
    \"retries\": 2
  }")

MINIO_SERVICE_ID=$(parse_json_id "$MINIO_SERVICE")

if [ -z "$MINIO_SERVICE_ID" ]; then
    echo -e "${RED}  ✗ Failed to create MinIO Storage service${NC}"
else
    echo -e "${GREEN}  ✓ MinIO Storage service created: $MINIO_SERVICE_ID${NC}"

    # Route: Public read-only (no JWT, GET/HEAD only)
    echo -e "${YELLOW}  → Creating public storage route...${NC}"
    MINIO_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$MINIO_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "minio-storage-route",
        "paths": ["/gateway/storage"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"],
        "methods": ["GET", "HEAD"],
        "regex_priority": 200
      }')

    MINIO_ROUTE_ID=$(parse_json_id "$MINIO_ROUTE")

    if [ -n "$MINIO_ROUTE_ID" ]; then
        # Add CORS plugin
        curl -s -X POST "$KONG_ADMIN_URL/routes/$MINIO_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "cors",
            "config": {
              "origins": ["*"],
              "methods": ["GET", "HEAD", "OPTIONS"],
              "headers": ["Accept", "Content-Type", "Range"],
              "exposed_headers": ["Content-Length", "Content-Type", "ETag"],
              "credentials": false,
              "max_age": 86400
            }
          }' > /dev/null

        # Add rate limiting plugin (protect MinIO from abuse)
        curl -s -X POST "$KONG_ADMIN_URL/routes/$MINIO_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "rate-limiting",
            "config": {
              "minute": 300,
              "hour": 5000,
              "policy": "local"
            }
          }' > /dev/null

        echo -e "${GREEN}  ✓ Public storage route created (GET/HEAD only, rate-limited)${NC}"
    fi
fi

echo ""

###############################################################################
# 10. API Documentation Routes (Protected with JWT via header AND cookie)
###############################################################################
echo -e "${GREEN}[10/10] Setting up API Documentation Routes (Protected)...${NC}"

# Note: JWT plugin configured to read token from BOTH header AND cookie
# This allows browser access after login (token stored in cookie)
# Cookie name: token (set by auth-service on login)

# Auth Service Docs
echo -e "${YELLOW}  → Creating auth-service-docs route...${NC}"
AUTH_DOCS_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"auth-service-docs\",
    \"url\": \"${AUTH_SERVICE_URL:-http://192.168.120.42:8081}/docs\"
  }")

AUTH_DOCS_SERVICE_ID=$(parse_json_id "$AUTH_DOCS_SERVICE")

if [ -n "$AUTH_DOCS_SERVICE_ID" ]; then
    AUTH_DOCS_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$AUTH_DOCS_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "auth-service-docs-route",
        "paths": ["/gateway/auth-service/docs"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"],
        "regex_priority": 500
      }')

    AUTH_DOCS_ROUTE_ID=$(parse_json_id "$AUTH_DOCS_ROUTE")

    if [ -n "$AUTH_DOCS_ROUTE_ID" ]; then
        # Add CORS
        curl -s -X POST "$KONG_ADMIN_URL/routes/$AUTH_DOCS_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "cors",
            "config": {
              "origins": ["*"],
              "methods": ["GET", "OPTIONS"],
              "headers": ["Accept", "Authorization", "Content-Type"],
              "credentials": true,
              "max_age": 3600
            }
          }' > /dev/null

        # Add JWT plugin (reads from header AND cookie)
        curl -s -X POST "$KONG_ADMIN_URL/routes/$AUTH_DOCS_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "jwt",
            "config": {
              "claims_to_verify": ["exp"],
              "key_claim_name": "iss",
              "secret_is_base64": false,
              "anonymous": null,
              "run_on_preflight": false,
              "header_names": ["authorization"],
              "cookie_names": ["token"]
            }
          }' > /dev/null
        echo -e "${GREEN}  ✓ auth-service-docs route created with JWT (header + cookie)${NC}"
    fi
fi

# Public Service Docs
echo -e "${YELLOW}  → Creating public-service-docs route...${NC}"
PUBLIC_DOCS_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"public-service-docs\",
    \"url\": \"${PUBLIC_SERVICE_URL:-http://192.168.120.42:8082}/docs\"
  }")

PUBLIC_DOCS_SERVICE_ID=$(parse_json_id "$PUBLIC_DOCS_SERVICE")

if [ -n "$PUBLIC_DOCS_SERVICE_ID" ]; then
    PUBLIC_DOCS_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$PUBLIC_DOCS_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "public-service-docs-route",
        "paths": ["/gateway/public-service/docs"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"],
        "regex_priority": 500
      }')

    PUBLIC_DOCS_ROUTE_ID=$(parse_json_id "$PUBLIC_DOCS_ROUTE")

    if [ -n "$PUBLIC_DOCS_ROUTE_ID" ]; then
        curl -s -X POST "$KONG_ADMIN_URL/routes/$PUBLIC_DOCS_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "cors",
            "config": {
              "origins": ["*"],
              "methods": ["GET", "OPTIONS"],
              "headers": ["Accept", "Authorization", "Content-Type"],
              "credentials": true,
              "max_age": 3600
            }
          }' > /dev/null

        curl -s -X POST "$KONG_ADMIN_URL/routes/$PUBLIC_DOCS_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "jwt",
            "config": {
              "claims_to_verify": ["exp"],
              "key_claim_name": "iss",
              "secret_is_base64": false,
              "anonymous": null,
              "run_on_preflight": false,
              "header_names": ["authorization"],
              "cookie_names": ["token"]
            }
          }' > /dev/null
        echo -e "${GREEN}  ✓ public-service-docs route created with JWT (header + cookie)${NC}"
    fi
fi

# Sister Service Docs
echo -e "${YELLOW}  → Creating sister-service-docs route...${NC}"
SISTER_DOCS_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"sister-service-docs\",
    \"url\": \"${SISTER_SERVICE_URL:-http://192.168.120.43:8083}/docs\"
  }")

SISTER_DOCS_SERVICE_ID=$(parse_json_id "$SISTER_DOCS_SERVICE")

if [ -n "$SISTER_DOCS_SERVICE_ID" ]; then
    SISTER_DOCS_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$SISTER_DOCS_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "sister-service-docs-route",
        "paths": ["/gateway/sister-service/docs"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"],
        "regex_priority": 500
      }')

    SISTER_DOCS_ROUTE_ID=$(parse_json_id "$SISTER_DOCS_ROUTE")

    if [ -n "$SISTER_DOCS_ROUTE_ID" ]; then
        curl -s -X POST "$KONG_ADMIN_URL/routes/$SISTER_DOCS_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "cors",
            "config": {
              "origins": ["*"],
              "methods": ["GET", "OPTIONS"],
              "headers": ["Accept", "Authorization", "Content-Type"],
              "credentials": true,
              "max_age": 3600
            }
          }' > /dev/null

        curl -s -X POST "$KONG_ADMIN_URL/routes/$SISTER_DOCS_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "jwt",
            "config": {
              "claims_to_verify": ["exp"],
              "key_claim_name": "iss",
              "secret_is_base64": false,
              "anonymous": null,
              "run_on_preflight": false,
              "header_names": ["authorization"],
              "cookie_names": ["token"]
            }
          }' > /dev/null
        echo -e "${GREEN}  ✓ sister-service-docs route created with JWT (header + cookie)${NC}"
    fi
fi

# Feeder Service Docs
echo -e "${YELLOW}  → Creating feeder-service-docs route...${NC}"
FEEDER_DOCS_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"feeder-service-docs\",
    \"url\": \"${FEEDER_SERVICE_URL:-http://192.168.120.43:8084}/docs\"
  }")

FEEDER_DOCS_SERVICE_ID=$(parse_json_id "$FEEDER_DOCS_SERVICE")

if [ -n "$FEEDER_DOCS_SERVICE_ID" ]; then
    FEEDER_DOCS_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$FEEDER_DOCS_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "feeder-service-docs-route",
        "paths": ["/gateway/feeder-service/docs"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"],
        "regex_priority": 500
      }')

    FEEDER_DOCS_ROUTE_ID=$(parse_json_id "$FEEDER_DOCS_ROUTE")

    if [ -n "$FEEDER_DOCS_ROUTE_ID" ]; then
        curl -s -X POST "$KONG_ADMIN_URL/routes/$FEEDER_DOCS_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "cors",
            "config": {
              "origins": ["*"],
              "methods": ["GET", "OPTIONS"],
              "headers": ["Accept", "Authorization", "Content-Type"],
              "credentials": true,
              "max_age": 3600
            }
          }' > /dev/null

        curl -s -X POST "$KONG_ADMIN_URL/routes/$FEEDER_DOCS_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "jwt",
            "config": {
              "claims_to_verify": ["exp"],
              "key_claim_name": "iss",
              "secret_is_base64": false,
              "anonymous": null,
              "run_on_preflight": false,
              "header_names": ["authorization"],
              "cookie_names": ["token"]
            }
          }' > /dev/null
        echo -e "${GREEN}  ✓ feeder-service-docs route created with JWT (header + cookie)${NC}"
    fi
fi

# MyUnila Service Docs
echo -e "${YELLOW}  → Creating myunila-service-docs route...${NC}"
MYUNILA_DOCS_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"myunila-service-docs\",
    \"url\": \"${MYUNILA_SERVICE_URL:-http://192.168.120.43:8086}/docs\"
  }")

MYUNILA_DOCS_SERVICE_ID=$(parse_json_id "$MYUNILA_DOCS_SERVICE")

if [ -n "$MYUNILA_DOCS_SERVICE_ID" ]; then
    MYUNILA_DOCS_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$MYUNILA_DOCS_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "myunila-service-docs-route",
        "paths": ["/gateway/myunila-service/docs"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"],
        "regex_priority": 500
      }')

    MYUNILA_DOCS_ROUTE_ID=$(parse_json_id "$MYUNILA_DOCS_ROUTE")

    if [ -n "$MYUNILA_DOCS_ROUTE_ID" ]; then
        curl -s -X POST "$KONG_ADMIN_URL/routes/$MYUNILA_DOCS_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "cors",
            "config": {
              "origins": ["*"],
              "methods": ["GET", "OPTIONS"],
              "headers": ["Accept", "Authorization", "Content-Type"],
              "credentials": true,
              "max_age": 3600
            }
          }' > /dev/null

        curl -s -X POST "$KONG_ADMIN_URL/routes/$MYUNILA_DOCS_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "jwt",
            "config": {
              "claims_to_verify": ["exp"],
              "key_claim_name": "iss",
              "secret_is_base64": false,
              "anonymous": null,
              "run_on_preflight": false,
              "header_names": ["authorization"],
              "cookie_names": ["token"]
            }
          }' > /dev/null
        echo -e "${GREEN}  ✓ myunila-service-docs route created with JWT (header + cookie)${NC}"
    fi
fi

# API Service Docs
echo -e "${YELLOW}  → Creating api-service-docs route...${NC}"
API_DOCS_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"api-service-docs\",
    \"url\": \"${API_SERVICE_URL:-http://192.168.120.43:8085}/docs\"
  }")

API_DOCS_SERVICE_ID=$(parse_json_id "$API_DOCS_SERVICE")

if [ -n "$API_DOCS_SERVICE_ID" ]; then
    API_DOCS_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$API_DOCS_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "api-service-docs-route",
        "paths": ["/gateway/api-service/docs"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"],
        "regex_priority": 500
      }')

    API_DOCS_ROUTE_ID=$(parse_json_id "$API_DOCS_ROUTE")

    if [ -n "$API_DOCS_ROUTE_ID" ]; then
        curl -s -X POST "$KONG_ADMIN_URL/routes/$API_DOCS_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "cors",
            "config": {
              "origins": ["*"],
              "methods": ["GET", "OPTIONS"],
              "headers": ["Accept", "Authorization", "Content-Type"],
              "credentials": true,
              "max_age": 3600
            }
          }' > /dev/null

        curl -s -X POST "$KONG_ADMIN_URL/routes/$API_DOCS_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "jwt",
            "config": {
              "claims_to_verify": ["exp"],
              "key_claim_name": "iss",
              "secret_is_base64": false,
              "anonymous": null,
              "run_on_preflight": false,
              "header_names": ["authorization"],
              "cookie_names": ["token"]
            }
          }' > /dev/null
        echo -e "${GREEN}  ✓ api-service-docs route created with JWT (header + cookie)${NC}"
    fi
fi

# Keuangan Service Docs
echo -e "${YELLOW}  → Creating keuangan-service-docs route...${NC}"
KEUANGAN_DOCS_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"keuangan-service-docs\",
    \"url\": \"${KEUANGAN_SERVICE_URL:-http://192.168.120.43:8088}/docs\"
  }")

KEUANGAN_DOCS_SERVICE_ID=$(parse_json_id "$KEUANGAN_DOCS_SERVICE")

if [ -n "$KEUANGAN_DOCS_SERVICE_ID" ]; then
    KEUANGAN_DOCS_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$KEUANGAN_DOCS_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "keuangan-service-docs-route",
        "paths": ["/gateway/keuangan-service/docs"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"],
        "regex_priority": 500
      }')

    KEUANGAN_DOCS_ROUTE_ID=$(parse_json_id "$KEUANGAN_DOCS_ROUTE")

    if [ -n "$KEUANGAN_DOCS_ROUTE_ID" ]; then
        curl -s -X POST "$KONG_ADMIN_URL/routes/$KEUANGAN_DOCS_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "cors",
            "config": {
              "origins": ["*"],
              "methods": ["GET", "OPTIONS"],
              "headers": ["Accept", "Authorization", "Content-Type"],
              "credentials": true,
              "max_age": 3600
            }
          }' > /dev/null

        curl -s -X POST "$KONG_ADMIN_URL/routes/$KEUANGAN_DOCS_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "jwt",
            "config": {
              "claims_to_verify": ["exp"],
              "key_claim_name": "iss",
              "secret_is_base64": false,
              "anonymous": null,
              "run_on_preflight": false,
              "header_names": ["authorization"],
              "cookie_names": ["token"]
            }
          }' > /dev/null
        echo -e "${GREEN}  ✓ keuangan-service-docs route created with JWT (header + cookie)${NC}"
    fi
fi

# Dashboard Service Docs
echo -e "${YELLOW}  → Creating dashboard-service-docs route...${NC}"
DASHBOARD_DOCS_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"dashboard-service-docs\",
    \"url\": \"${DASHBOARD_SERVICE_URL:-http://192.168.120.42:8086}/docs\"
  }")

DASHBOARD_DOCS_SERVICE_ID=$(parse_json_id "$DASHBOARD_DOCS_SERVICE")

if [ -n "$DASHBOARD_DOCS_SERVICE_ID" ]; then
    DASHBOARD_DOCS_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$DASHBOARD_DOCS_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "dashboard-service-docs-route",
        "paths": ["/gateway/dashboard-service/docs"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"],
        "regex_priority": 500
      }')

    DASHBOARD_DOCS_ROUTE_ID=$(parse_json_id "$DASHBOARD_DOCS_ROUTE")

    if [ -n "$DASHBOARD_DOCS_ROUTE_ID" ]; then
        curl -s -X POST "$KONG_ADMIN_URL/routes/$DASHBOARD_DOCS_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "cors",
            "config": {
              "origins": ["*"],
              "methods": ["GET", "OPTIONS"],
              "headers": ["Accept", "Authorization", "Content-Type"],
              "credentials": true,
              "max_age": 3600
            }
          }' > /dev/null

        curl -s -X POST "$KONG_ADMIN_URL/routes/$DASHBOARD_DOCS_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "jwt",
            "config": {
              "claims_to_verify": ["exp"],
              "key_claim_name": "iss",
              "secret_is_base64": false,
              "anonymous": null,
              "run_on_preflight": false,
              "header_names": ["authorization"],
              "cookie_names": ["token"]
            }
          }' > /dev/null
        echo -e "${GREEN}  ✓ dashboard-service-docs route created with JWT (header + cookie)${NC}"
    fi
fi

###############################################################################
# Web Monitoring Service (Go Fiber, port 8089)
###############################################################################
echo ""
echo -e "${GREEN}[+] Setting up Web Monitoring Service...${NC}"

WEBMON_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"webmon-service\",
    \"url\": \"${WEBMON_SERVICE_URL:-http://192.168.120.43:8089}\",
    \"connect_timeout\": 300000,
    \"write_timeout\": 300000,
    \"read_timeout\": 300000,
    \"retries\": 3
  }")

WEBMON_SERVICE_ID=$(parse_json_id "$WEBMON_SERVICE")

if [ -z "$WEBMON_SERVICE_ID" ]; then
    echo -e "${RED}  ✗ Failed to create webmon-service${NC}"
else
    echo -e "${GREEN}  ✓ webmon-service created: $WEBMON_SERVICE_ID${NC}"

    # Single route: /webmon-service (strip_path=true, JWT required)
    WEBMON_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$WEBMON_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "webmon-route",
        "paths": ["/webmon-service"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"],
        "regex_priority": 200
      }')

    WEBMON_ROUTE_ID=$(parse_json_id "$WEBMON_ROUTE")

    if [ -n "$WEBMON_ROUTE_ID" ]; then
        # CORS plugin
        curl -s -X POST "$KONG_ADMIN_URL/routes/$WEBMON_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "cors",
            "config": {
              "origins": ["*"],
              "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
              "headers": ["Accept", "Accept-Version", "Content-Length", "Content-MD5", "Content-Type", "Date", "X-Auth-Token", "Authorization", "X-Requested-With", "X-User-ID"],
              "exposed_headers": ["X-Auth-Token", "Content-Length"],
              "credentials": true,
              "max_age": 3600
            }
          }' > /dev/null

        # JWT plugin
        curl -s -X POST "$KONG_ADMIN_URL/routes/$WEBMON_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "jwt",
            "config": {
              "key_claim_name": "iss",
              "claims_to_verify": ["exp"],
              "header_names": ["Authorization"],
              "cookie_names": ["token"]
            }
          }' > /dev/null

        echo -e "${GREEN}  ✓ webmon-service route created with JWT (header + cookie)${NC}"
    fi
fi

# --- Service: public routes (v1/public/*) — no auth required ---
WEBMON_PUBLIC_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"webmon-public-service\",
    \"url\": \"${WEBMON_SERVICE_URL:-http://192.168.120.43:8089}/v1/public\",
    \"connect_timeout\": 60000,
    \"write_timeout\": 60000,
    \"read_timeout\": 60000,
    \"retries\": 2
  }")

WEBMON_PUBLIC_SERVICE_ID=$(parse_json_id "$WEBMON_PUBLIC_SERVICE")

if [ -z "$WEBMON_PUBLIC_SERVICE_ID" ]; then
    echo -e "${RED}  ✗ Failed to create webmon-public-service${NC}"
else
    echo -e "${GREEN}  ✓ webmon-public-service created: $WEBMON_PUBLIC_SERVICE_ID${NC}"

    WEBMON_PUBLIC_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$WEBMON_PUBLIC_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "webmon-public-route",
        "paths": ["/webmon-service/v1/public"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"],
        "regex_priority": 300
      }')

    WEBMON_PUBLIC_ROUTE_ID=$(parse_json_id "$WEBMON_PUBLIC_ROUTE")

    if [ -n "$WEBMON_PUBLIC_ROUTE_ID" ]; then
        curl -s -X POST "$KONG_ADMIN_URL/routes/$WEBMON_PUBLIC_ROUTE_ID/plugins" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "cors",
            "config": {
              "origins": ["*"],
              "methods": ["GET", "OPTIONS"],
              "headers": ["Accept", "Content-Type"],
              "max_age": 3600
            }
          }' > /dev/null

        echo -e "${GREEN}  ✓ webmon-public-route created (no auth) for /v1/public/*${NC}"
    fi
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Kong Routes Setup Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

echo -e "${YELLOW}Configured Routes (Kong strips service prefix, forwards remaining path):${NC}"
echo "  Public (no JWT):       /public-service/* → backend/*"
echo "  Auth (no JWT@Kong):    /auth-service/* → backend/*"
echo "  Sister (JWT required): /sister-service/* → backend/*"
echo "  Sister (public photo): /sister-service/public/* → backend/public/*"
echo "  Feeder (JWT required): /feeder-service/* → backend/*"
echo "  MyUnila (JWT req):     /myunila-service/* → backend/*"
echo "  MyUnila (public):      /myunila-service/public/* → backend/*"
echo "  Keuangan (JWT req):    /keuangan-service/* → backend/*"
echo "  WebMon (JWT req):      /webmon-service/* → backend/*"
echo "  Dashboard (JWT req):   /dashboard-service/* → backend/*"
echo "  API/OneData (JWT req): /api-service/* → backend/*"
echo "  MinIO Storage (public):/gateway/storage/* → MinIO:9000/* (GET/HEAD only)"
echo ""
echo -e "${YELLOW}API Documentation Routes (JWT + Developer role required):${NC}"
echo "  Auth Docs:      /gateway/auth-service/docs/*"
echo "  Public Docs:    /gateway/public-service/docs/*"
echo "  Sister Docs:    /gateway/sister-service/docs/*"
echo "  Feeder Docs:    /gateway/feeder-service/docs/*"
echo "  MyUnila Docs:   /gateway/myunila-service/docs/*"
echo "  Keuangan Docs:  /gateway/keuangan-service/docs/*"
echo "  API Docs:       /gateway/api-service/docs/*"
echo "  Dashboard Docs: /gateway/dashboard-service/docs/*"
echo ""

echo -e "${YELLOW}Example Test Commands:${NC}"
echo "  # Public service (no auth) - frontend includes /api/v1 in env"
echo "  curl http://localhost:9800/public-service/api/v1/unila/statistics"
echo "  curl http://localhost:9800/public-service/api/v1/dosen/statistics"
echo ""
echo "  # Auth service (no JWT at Kong level)"
echo "  curl http://localhost:9800/auth-service/api/v1/auth/login -X POST -d '{...}'"
echo ""
echo "  # Sister public photo (no auth)"
echo "  curl http://localhost:9800/sister-service/public/api/v1/dosen/photo/YOUR-ID-HERE"
echo ""
echo "  # MyUnila SIKEP (requires JWT)"
echo "  curl -H 'Authorization: Bearer <token>' http://localhost:9800/myunila-service/api/v1/sikep/referensi/metadata"
echo ""
echo "  # MinIO Storage (public, read-only)"
echo "  curl http://localhost:9800/gateway/storage/myunila-photos/sdm/{id_sdm}.jpg"
echo ""
echo "  # Check Kong services and routes"
echo "  curl $KONG_ADMIN_URL/services"
echo "  curl $KONG_ADMIN_URL/routes"
echo ""
