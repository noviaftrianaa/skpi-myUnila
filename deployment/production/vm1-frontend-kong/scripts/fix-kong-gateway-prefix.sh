#!/bin/bash

# Fix Kong Routes - Add /gateway prefix
# This script updates existing Kong routes to add /gateway prefix
# to match frontend environment variables

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

KONG_ADMIN_URL="http://localhost:9801"

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Fixing Kong Routes - Add /gateway prefix${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

# Function to parse JSON ID
parse_json_id() {
    echo "$1" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4
}

# Update dashboard-public-route
echo -e "${YELLOW}[1/4] Updating dashboard-public-route...${NC}"
curl -s -X PATCH "$KONG_ADMIN_URL/routes/dashboard-public-route" \
  -H "Content-Type: application/json" \
  -d '{
    "paths": ["/gateway/dashboard-service/public"]
  }' > /dev/null
echo -e "${GREEN}  ✓ Updated to /gateway/dashboard-service/public${NC}"

# Update dashboard-protected-route
echo -e "${YELLOW}[2/4] Updating dashboard-protected-route...${NC}"
curl -s -X PATCH "$KONG_ADMIN_URL/routes/dashboard-protected-route" \
  -H "Content-Type: application/json" \
  -d '{
    "paths": ["/gateway/dashboard-service/api/v1/my"]
  }' > /dev/null
echo -e "${GREEN}  ✓ Updated to /gateway/dashboard-service/api/v1/my${NC}"

# Update auth-service-route
echo -e "${YELLOW}[3/4] Updating auth-service-route...${NC}"
curl -s -X PATCH "$KONG_ADMIN_URL/routes/auth-service-route" \
  -H "Content-Type: application/json" \
  -d '{
    "paths": ["/gateway/auth-service"]
  }' > /dev/null
echo -e "${GREEN}  ✓ Updated to /gateway/auth-service${NC}"

# Update sister-service-route
echo -e "${YELLOW}[4/4] Updating sister-service-route...${NC}"
curl -s -X PATCH "$KONG_ADMIN_URL/routes/sister-service-route" \
  -H "Content-Type: application/json" \
  -d '{
    "paths": ["/gateway/sister-service"]
  }' > /dev/null
echo -e "${GREEN}  ✓ Updated to /gateway/sister-service${NC}"

# Update feeder-service-route
echo -e "${YELLOW}[5/5] Updating feeder-service-route...${NC}"
curl -s -X PATCH "$KONG_ADMIN_URL/routes/feeder-service-route" \
  -H "Content-Type: application/json" \
  -d '{
    "paths": ["/gateway/feeder-service"]
  }' > /dev/null
echo -e "${GREEN}  ✓ Updated to /gateway/feeder-service${NC}"

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Kong Routes Updated Successfully!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

echo -e "${YELLOW}Updated Routes:${NC}"
echo "  Dashboard (public):    https://my.unila.ac.id/gateway/dashboard-service/public/..."
echo "  Dashboard (protected): https://my.unila.ac.id/gateway/dashboard-service/api/v1/my/..."
echo "  Auth:                  https://my.unila.ac.id/gateway/auth-service/api/v1/..."
echo "  Sister:                https://my.unila.ac.id/gateway/sister-service/api/v1/..."
echo "  Feeder:                https://my.unila.ac.id/gateway/feeder-service/api/v1/..."
echo ""
