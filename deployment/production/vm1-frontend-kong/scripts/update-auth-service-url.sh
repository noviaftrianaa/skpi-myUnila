#!/bin/bash

###############################################################################
# Update Auth Service URL in Production .env
# This script updates AUTH_SERVICE_URL to include /api path
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

echo ""
echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}  Update Auth Service URL${NC}"
echo -e "${YELLOW}=========================================${NC}"
echo ""

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: .env file not found at $ENV_FILE${NC}"
    echo -e "${YELLOW}Tip: Copy from .env.example first:${NC}"
    echo "  cp $SCRIPT_DIR/../.env.example $ENV_FILE"
    exit 1
fi

# Check current AUTH_SERVICE_URL
CURRENT_URL=$(grep "^AUTH_SERVICE_URL=" "$ENV_FILE" | cut -d '=' -f2)

echo -e "${YELLOW}Current AUTH_SERVICE_URL:${NC} $CURRENT_URL"

# Check if it already has /api
if [[ "$CURRENT_URL" == *"/api" ]]; then
    echo -e "${GREEN}✓ AUTH_SERVICE_URL already has /api path${NC}"
    echo ""
    exit 0
fi

# Update the URL
echo -e "${YELLOW}Updating AUTH_SERVICE_URL to include /api path...${NC}"

# Backup .env file
cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
echo -e "${GREEN}✓ Backup created${NC}"

# Update AUTH_SERVICE_URL
if grep -q "^AUTH_SERVICE_URL=" "$ENV_FILE"; then
    # Replace existing value
    sed -i 's|^AUTH_SERVICE_URL=.*|AUTH_SERVICE_URL=http://192.168.120.42:8081/api|' "$ENV_FILE"
    echo -e "${GREEN}✓ AUTH_SERVICE_URL updated${NC}"
else
    # Add new value
    echo "AUTH_SERVICE_URL=http://192.168.120.42:8081/api" >> "$ENV_FILE"
    echo -e "${GREEN}✓ AUTH_SERVICE_URL added${NC}"
fi

# Show new value
NEW_URL=$(grep "^AUTH_SERVICE_URL=" "$ENV_FILE" | cut -d '=' -f2)
echo -e "${GREEN}New AUTH_SERVICE_URL:${NC} $NEW_URL"

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Update Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Run setup-kong-routes.sh to apply changes:"
echo "     cd $SCRIPT_DIR"
echo "     bash setup-kong-routes.sh"
echo ""
