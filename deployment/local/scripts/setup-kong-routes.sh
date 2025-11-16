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

# Create Dashboard Service
DASHBOARD_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "dashboard-service",
    "url": "http://myunila-nginx:81"
  }')

DASHBOARD_SERVICE_ID=$(parse_json_id "$DASHBOARD_SERVICE")

if [ -z "$DASHBOARD_SERVICE_ID" ]; then
    echo -e "${RED}  ✗ Failed to create Dashboard service${NC}"
else
    echo -e "${GREEN}  ✓ Dashboard service created: $DASHBOARD_SERVICE_ID${NC}"

    # Create protected route (with JWT)
    curl -s -X POST "$KONG_ADMIN_URL/services/$DASHBOARD_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "dashboard-protected-route",
        "paths": ["/dashboard-service/api"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"]
      }' > /dev/null
    echo -e "${GREEN}  ✓ Dashboard protected route created${NC}"

    # Create public route (without JWT)
    curl -s -X POST "$KONG_ADMIN_URL/services/$DASHBOARD_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "dashboard-public-route",
        "paths": ["/dashboard-service/public"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"]
      }' > /dev/null
    echo -e "${GREEN}  ✓ Dashboard public route created${NC}"

    # Add CORS plugin to public route
    PUBLIC_ROUTE_JSON=$(curl -s "$KONG_ADMIN_URL/routes/dashboard-public-route")
    PUBLIC_ROUTE_ID=$(parse_json_id "$PUBLIC_ROUTE_JSON")

    if [ -n "$PUBLIC_ROUTE_ID" ]; then
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
        echo -e "${GREEN}  ✓ CORS plugin added to public route${NC}"
    fi
fi

echo ""

###############################################################################
# 2. Auth Service
###############################################################################
echo -e "${GREEN}[2/4] Setting up Auth Service...${NC}"

# Create Auth Service
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

    # Create Auth route (public, no JWT needed for login)
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
    echo -e "${GREEN}  ✓ Auth route created${NC}"

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

# Create Sister Service
SISTER_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "sister-service",
    "url": "http://myunila-sister-service:8083"
  }')

SISTER_SERVICE_ID=$(parse_json_id "$SISTER_SERVICE")

if [ -z "$SISTER_SERVICE_ID" ]; then
    echo -e "${RED}  ✗ Failed to create Sister service${NC}"
else
    echo -e "${GREEN}  ✓ Sister service created: $SISTER_SERVICE_ID${NC}"

    # Create Sister route
    SISTER_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$SISTER_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "sister-service-route",
        "paths": ["/sister-service"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"]
      }')

    SISTER_ROUTE_ID=$(parse_json_id "$SISTER_ROUTE")
    echo -e "${GREEN}  ✓ Sister route created${NC}"

    # Add CORS plugin
    if [ -n "$SISTER_ROUTE_ID" ]; then
        curl -s -X POST "$KONG_ADMIN_URL/routes/$SISTER_ROUTE_ID/plugins" \
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

        # Add JWT plugin
        curl -s -X POST "$KONG_ADMIN_URL/routes/$SISTER_ROUTE_ID/plugins" \
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
        echo -e "${GREEN}  ✓ JWT plugin added${NC}"
    fi

    # Create separate PUBLIC route for dosen photo endpoint (no JWT required)
    echo -e "${YELLOW}  → Creating public photo route...${NC}"
    PHOTO_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$SISTER_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "sister-photo-public-route",
        "paths": ["/sister-service/dosen/photo"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"]
      }')

    PHOTO_ROUTE_ID=$(parse_json_id "$PHOTO_ROUTE")

    if [ -n "$PHOTO_ROUTE_ID" ]; then
        # Add CORS plugin for photo route (no JWT plugin)
        curl -s -X POST "$KONG_ADMIN_URL/routes/$PHOTO_ROUTE_ID/plugins" \
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
        echo -e "${GREEN}  ✓ Public photo route created (no JWT)${NC}"
    fi
fi

echo ""

###############################################################################
# 4. Feeder Service
###############################################################################
echo -e "${GREEN}[4/4] Setting up Feeder Service...${NC}"

# Create Feeder Service
FEEDER_SERVICE=$(curl -s -X POST "$KONG_ADMIN_URL/services" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "feeder-service",
    "url": "http://myunila-feeder-service:8084"
  }')

FEEDER_SERVICE_ID=$(parse_json_id "$FEEDER_SERVICE")

if [ -z "$FEEDER_SERVICE_ID" ]; then
    echo -e "${RED}  ✗ Failed to create Feeder service${NC}"
else
    echo -e "${GREEN}  ✓ Feeder service created: $FEEDER_SERVICE_ID${NC}"

    # Create Feeder route
    FEEDER_ROUTE=$(curl -s -X POST "$KONG_ADMIN_URL/services/$FEEDER_SERVICE_ID/routes" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "feeder-service-route",
        "paths": ["/feeder-service"],
        "strip_path": true,
        "preserve_host": false,
        "protocols": ["http", "https"]
      }')

    FEEDER_ROUTE_ID=$(parse_json_id "$FEEDER_ROUTE")
    echo -e "${GREEN}  ✓ Feeder route created${NC}"

    # Add CORS plugin
    if [ -n "$FEEDER_ROUTE_ID" ]; then
        curl -s -X POST "$KONG_ADMIN_URL/routes/$FEEDER_ROUTE_ID/plugins" \
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

        # Add JWT plugin
        curl -s -X POST "$KONG_ADMIN_URL/routes/$FEEDER_ROUTE_ID/plugins" \
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
        echo -e "${GREEN}  ✓ JWT plugin added${NC}"
    fi
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Kong Routes Setup Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

echo -e "${YELLOW}Configured Routes:${NC}"
echo "  Dashboard (protected): http://localhost:9800/dashboard-service/api/v1"
echo "  Dashboard (public):    http://localhost:9800/dashboard-service/public/api/v1"
echo "  Auth:                  http://localhost:9800/auth-service/api/v1"
echo "  Sister:                http://localhost:9800/sister-service"
echo "  Feeder:                http://localhost:9800/feeder-service"
echo ""

echo -e "${YELLOW}Check Kong services:${NC}"
echo "  curl $KONG_ADMIN_URL/services"
echo ""
