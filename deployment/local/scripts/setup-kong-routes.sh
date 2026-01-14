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
LOG_RECEIVER_URL="http://myunila-nginx:80/api/v1/internal/kong-logs"

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Kong Routes Setup - Local${NC}"
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
    # Try python first
    local id=$(echo "$json" | python -m json.tool 2>/dev/null | grep '"id"' | head -1 | cut -d'"' -f4)
    # Fallback to grep if python not available
    if [ -z "$id" ]; then
        id=$(echo "$json" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    fi
    echo "$id"
}

# Helper function to add HTTP Log plugin to a route
add_http_log_plugin() {
    local route_id=$1
    local route_name=$2

    echo -e "${YELLOW}  → Adding HTTP Log plugin...${NC}"

    curl -s -X POST "$KONG_ADMIN_URL/routes/$route_id/plugins" \
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
      }" > /dev/null

    echo -e "${GREEN}  ✓ HTTP Log plugin added${NC}"
}

# Helper function to delete all Kong configurations
cleanup_kong() {
    echo -e "${YELLOW}Cleaning up existing Kong configurations...${NC}"

    # Delete all routes first (routes depend on services)
    echo "  → Deleting all routes..."
    ROUTES=$(curl -s "$KONG_ADMIN_URL/routes" | python -m json.tool 2>/dev/null | grep '"id"' | cut -d'"' -f4)
    for route_id in $ROUTES; do
        curl -s -X DELETE "$KONG_ADMIN_URL/routes/$route_id" > /dev/null 2>&1
    done
    echo -e "${GREEN}  ✓ All routes deleted${NC}"

    # Delete all services
    echo "  → Deleting all services..."
    SERVICES=$(curl -s "$KONG_ADMIN_URL/services" | python -m json.tool 2>/dev/null | grep '"id"' | cut -d'"' -f4)
    for service_id in $SERVICES; do
        curl -s -X DELETE "$KONG_ADMIN_URL/services/$service_id" > /dev/null 2>&1
    done
    echo -e "${GREEN}  ✓ All services deleted${NC}"

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
# 1. Public Service (formerly Dashboard Service)
###############################################################################
echo -e "${GREEN}[1/4] Setting up Public Service...${NC}"

# Note: Public service only has public endpoints (no JWT required)
# All endpoints: /api/v1/* (Kong route: /public-service/api/v1/*)

# Create Public Service for public endpoints
# Laravel routes: /api/v1/...
# Kong will strip /public-service and forward to nginx port 81
echo -e "${YELLOW}  → Creating public-service for public endpoints...${NC}"
PUBLIC_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "public-service",
    "url": "http://myunila-nginx:81"
  }')

PUBLIC_SERVICE_ID=$(parse_json_id "$PUBLIC_SERVICE")

if [ -z "$PUBLIC_SERVICE_ID" ]; then
    echo -e "${RED}  ✗ Failed to create Public service${NC}"
else
    echo -e "${GREEN}  ✓ Public service created: $PUBLIC_SERVICE_ID${NC}"

    # Route: Public endpoints (no JWT) - /public-service/api/v1/X → /api/v1/X
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
echo -e "${GREEN}[2/4] Setting up Auth Service...${NC}"

# Create Auth Service
# Kong will strip /auth-service and forward remaining path to nginx
# Example: /auth-service/api/v1/auth/login → /api/v1/auth/login → nginx routes to auth-service
AUTH_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "auth-service",
    "url": "http://myunila-nginx:80"
  }')

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

        # Add HTTP Log plugin
        add_http_log_plugin "$AUTH_ROUTE_ID" "auth-service"
    fi
fi

echo ""

###############################################################################
# 3. Sister Service
###############################################################################
echo -e "${GREEN}[3/4] Setting up Sister Service...${NC}"

# Create Sister Service with extended timeouts for long-running sync operations
SISTER_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "sister-service",
    "url": "http://myunila-sister-service:8083",
    "connect_timeout": 300000,
    "write_timeout": 300000,
    "read_timeout": 300000,
    "retries": 5
  }')

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
      -d '{
        "name": "sister-public-service",
        "url": "http://myunila-sister-service:8083/public"
      }')

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
echo -e "${GREEN}[4/5] Setting up Feeder Service...${NC}"

# Create Feeder Service
FEEDER_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "feeder-service",
    "url": "http://myunila-feeder-service:8084",
    "connect_timeout": 300000,
    "write_timeout": 300000,
    "read_timeout": 300000,
    "retries": 5
  }')

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
      -d '{
        "name": "feeder-public-service",
        "url": "http://myunila-feeder-service:8084"
      }')

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
# 5. MyUnila Service (SIKEP)
###############################################################################
echo -e "${GREEN}[5/6] Setting up MyUnila Service...${NC}"

# Create MyUnila Service
MYUNILA_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "myunila-service",
    "url": "http://myunila-service:8086",
    "connect_timeout": 300000,
    "write_timeout": 300000,
    "read_timeout": 300000,
    "retries": 5
  }')

MYUNILA_SERVICE_ID=$(parse_json_id "$MYUNILA_SERVICE")

if [ -z "$MYUNILA_SERVICE_ID" ]; then
    echo -e "${RED}  ✗ Failed to create MyUnila service${NC}"
else
    echo -e "${GREEN}  ✓ MyUnila service created: $MYUNILA_SERVICE_ID${NC}"

    # Route: Protected /api/v1/* endpoints (with JWT)
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

        # Add JWT plugin
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
fi

echo ""

###############################################################################
# 6. JWT Consumer & Credentials Setup
###############################################################################
echo ""
echo -e "${GREEN}[6/6] Setting up JWT Consumer & Credentials...${NC}"

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
# 7. Dashboard Service
###############################################################################
echo -e "${GREEN}[7/7] Setting up Dashboard Service...${NC}"

# Create Dashboard Service
DASHBOARD_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "dashboard-service",
    "url": "http://myunila-dashboard-service:9000",
    "connect_timeout": 60000,
    "write_timeout": 60000,
    "read_timeout": 60000,
    "retries": 3
  }')

DASHBOARD_SERVICE_ID=$(parse_json_id "$DASHBOARD_SERVICE")

if [ -z "$DASHBOARD_SERVICE_ID" ]; then
    echo -e "${RED}  ✗ Failed to create Dashboard service${NC}"
else
    echo -e "${GREEN}  ✓ Dashboard service created: $DASHBOARD_SERVICE_ID${NC}"

    # Route: Protected /api/v1/* endpoints (with JWT)
    echo -e "${YELLOW}  → Creating protected /api/v1 route...${NC}"
    DASHBOARD_API_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$DASHBOARD_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "dashboard-api-v1-route",
        "paths": ["/dashboard-service"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"],
        "regex_priority": 200
      }')

    DASHBOARD_API_ROUTE_ID=$(parse_json_id "$DASHBOARD_API_ROUTE")

    if [ -n "$DASHBOARD_API_ROUTE_ID" ]; then
        # Add CORS plugin
        curl -s -X POST "$KONG_ADMIN_URL/routes/$DASHBOARD_API_ROUTE_ID/plugins" \
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
        curl -s -X POST "$KONG_ADMIN_URL/routes/$DASHBOARD_API_ROUTE_ID/plugins" \
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

###############################################################################
# 8. API Service (Go - OneData)
###############################################################################
echo -e "${GREEN}[8/8] Setting up API Service (OneData)...${NC}"

# Create API Service
API_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "api-service",
    "url": "http://myunila-api-service:8085",
    "connect_timeout": 60000,
    "write_timeout": 60000,
    "read_timeout": 60000,
    "retries": 3
  }')

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

echo ""

###############################################################################
# 9. API Documentation Routes (Protected with JWT - Developer Role Only)
###############################################################################
echo -e "${GREEN}[9/9] Setting up API Documentation Routes (Protected)...${NC}"

# Create a dedicated service for each docs endpoint that routes through Kong with JWT

# Auth Service Docs
echo -e "${YELLOW}  → Creating auth-service-docs route...${NC}"
AUTH_DOCS_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "auth-service-docs",
    "url": "http://myunila-nginx:80/docs"
  }')

AUTH_DOCS_SERVICE_ID=$(parse_json_id "$AUTH_DOCS_SERVICE")

if [ -n "$AUTH_DOCS_SERVICE_ID" ]; then
    AUTH_DOCS_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$AUTH_DOCS_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "auth-service-docs-route",
        "paths": ["/auth-service/docs"],
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

        # Add JWT plugin
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
              "header_names": ["authorization"]
            }
          }' > /dev/null
        echo -e "${GREEN}  ✓ auth-service-docs route created with JWT${NC}"
    fi
fi

# Public Service Docs
echo -e "${YELLOW}  → Creating public-service-docs route...${NC}"
PUBLIC_DOCS_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "public-service-docs",
    "url": "http://myunila-nginx:81/docs"
  }')

PUBLIC_DOCS_SERVICE_ID=$(parse_json_id "$PUBLIC_DOCS_SERVICE")

if [ -n "$PUBLIC_DOCS_SERVICE_ID" ]; then
    PUBLIC_DOCS_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$PUBLIC_DOCS_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "public-service-docs-route",
        "paths": ["/public-service/docs"],
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
              "header_names": ["authorization"]
            }
          }' > /dev/null
        echo -e "${GREEN}  ✓ public-service-docs route created with JWT${NC}"
    fi
fi

# Sister Service Docs
echo -e "${YELLOW}  → Creating sister-service-docs route...${NC}"
SISTER_DOCS_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "sister-service-docs",
    "url": "http://myunila-sister-service:8083/docs"
  }')

SISTER_DOCS_SERVICE_ID=$(parse_json_id "$SISTER_DOCS_SERVICE")

if [ -n "$SISTER_DOCS_SERVICE_ID" ]; then
    SISTER_DOCS_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$SISTER_DOCS_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "sister-service-docs-route",
        "paths": ["/sister-service/docs"],
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
              "header_names": ["authorization"]
            }
          }' > /dev/null
        echo -e "${GREEN}  ✓ sister-service-docs route created with JWT${NC}"
    fi
fi

# Feeder Service Docs
echo -e "${YELLOW}  → Creating feeder-service-docs route...${NC}"
FEEDER_DOCS_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "feeder-service-docs",
    "url": "http://myunila-feeder-service:8084/docs"
  }')

FEEDER_DOCS_SERVICE_ID=$(parse_json_id "$FEEDER_DOCS_SERVICE")

if [ -n "$FEEDER_DOCS_SERVICE_ID" ]; then
    FEEDER_DOCS_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$FEEDER_DOCS_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "feeder-service-docs-route",
        "paths": ["/feeder-service/docs"],
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
              "header_names": ["authorization"]
            }
          }' > /dev/null
        echo -e "${GREEN}  ✓ feeder-service-docs route created with JWT${NC}"
    fi
fi

# MyUnila Service Docs
echo -e "${YELLOW}  → Creating myunila-service-docs route...${NC}"
MYUNILA_DOCS_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "myunila-service-docs",
    "url": "http://myunila-service:8086/docs"
  }')

MYUNILA_DOCS_SERVICE_ID=$(parse_json_id "$MYUNILA_DOCS_SERVICE")

if [ -n "$MYUNILA_DOCS_SERVICE_ID" ]; then
    MYUNILA_DOCS_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$MYUNILA_DOCS_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "myunila-service-docs-route",
        "paths": ["/myunila-service/docs"],
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
              "header_names": ["authorization"]
            }
          }' > /dev/null
        echo -e "${GREEN}  ✓ myunila-service-docs route created with JWT${NC}"
    fi
fi

# API Service Docs
echo -e "${YELLOW}  → Creating api-service-docs route...${NC}"
API_DOCS_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "api-service-docs",
    "url": "http://myunila-api-service:8085/docs"
  }')

API_DOCS_SERVICE_ID=$(parse_json_id "$API_DOCS_SERVICE")

if [ -n "$API_DOCS_SERVICE_ID" ]; then
    API_DOCS_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$API_DOCS_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "api-service-docs-route",
        "paths": ["/api-service/docs"],
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
              "header_names": ["authorization"]
            }
          }' > /dev/null
        echo -e "${GREEN}  ✓ api-service-docs route created with JWT${NC}"
    fi
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Kong Routes Setup Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

echo -e "${YELLOW}Configured Routes:${NC}"
echo "  Public (public):       http://localhost:9800/public-service/api/v1"
echo "  Auth:                  http://localhost:9800/auth-service/api/v1"
echo "  Sister (protected):    http://localhost:9800/sister-service/api/v1"
echo "  Sister (public photo): http://localhost:9800/sister-service/public/api/v1/dosen/photo/:id"
echo "  Feeder (protected):    http://localhost:9800/feeder-service/api/v1"
echo "  MyUnila (protected):   http://localhost:9800/myunila-service/api/v1"
echo "  Dashboard (protected): http://localhost:9800/dashboard-service/api/v1"
echo "  API/OneData (protected): http://localhost:9800/api-service/api/v1"
echo ""

echo -e "${YELLOW}Example Test Commands:${NC}"
echo "  # Public service (no auth)"
echo "  curl http://localhost:9800/public-service/api/v1/dosen/statistics"
echo ""
echo "  # Sister public photo (no auth)"
echo "  curl http://localhost:9800/sister-service/public/api/v1/dosen/photo/YOUR-ID-HERE"
echo ""
echo "  # Check Kong services and routes"
echo "  curl $KONG_ADMIN_URL/services"
echo "  curl $KONG_ADMIN_URL/routes"
echo ""
