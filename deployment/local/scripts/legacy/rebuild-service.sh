#!/bin/bash

###############################################################################
# Rebuild Specific Service - Local Development
# Usage: ./rebuild-service.sh [auth|dashboard|sister|all]
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOYMENT_DIR="$SCRIPT_DIR/.."

SERVICE=$1

if [ -z "$SERVICE" ]; then
    echo -e "${RED}Error: Service name required${NC}"
    echo ""
    echo "Usage: $0 [auth|dashboard|sister|all]"
    echo ""
    echo "Examples:"
    echo "  $0 auth       # Rebuild auth service only"
    echo "  $0 dashboard  # Rebuild dashboard service only"
    echo "  $0 sister     # Rebuild sister service only"
    echo "  $0 all        # Rebuild all services"
    exit 1
fi

cd "$DEPLOYMENT_DIR"

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Rebuild Service - Local${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

rebuild_auth() {
    echo -e "${GREEN}[1/2] Rebuilding Auth Service...${NC}"
    docker compose --env-file .env -f services/3-backend/docker-compose.auth.yml build --no-cache auth-service
    echo -e "${GREEN}[2/2] Restarting Auth Service...${NC}"
    docker compose --env-file .env -f services/3-backend/docker-compose.auth.yml up -d auth-service
    echo -e "${GREEN}✓ Auth service rebuilt and restarted${NC}"
}

rebuild_dashboard() {
    echo -e "${GREEN}[1/2] Rebuilding Dashboard Service...${NC}"
    docker compose --env-file .env -f services/3-backend/docker-compose.dashboard.yml build --no-cache dashboard-service
    echo -e "${GREEN}[2/2] Restarting Dashboard Service...${NC}"
    docker compose --env-file .env -f services/3-backend/docker-compose.dashboard.yml up -d dashboard-service
    echo -e "${GREEN}✓ Dashboard service rebuilt and restarted${NC}"
}

rebuild_sister() {
    echo -e "${GREEN}[1/2] Rebuilding Sister Service...${NC}"
    docker compose --env-file .env -f services/3-backend/docker-compose.sister.yml build --no-cache sister-service
    echo -e "${GREEN}[2/2] Restarting Sister Service...${NC}"
    docker compose --env-file .env -f services/3-backend/docker-compose.sister.yml up -d sister-service
    echo -e "${GREEN}✓ Sister service rebuilt and restarted${NC}"
}

case $SERVICE in
    auth)
        rebuild_auth
        ;;
    dashboard)
        rebuild_dashboard
        ;;
    sister)
        rebuild_sister
        ;;
    all)
        rebuild_auth
        echo ""
        rebuild_dashboard
        echo ""
        rebuild_sister
        ;;
    *)
        echo -e "${RED}Error: Unknown service '$SERVICE'${NC}"
        echo "Valid services: auth, dashboard, sister, all"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Rebuild Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

# Show container status
echo -e "${YELLOW}Container Status:${NC}"
docker ps --filter "name=myunila" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAME|auth-service|dashboard-service|sister-service"
echo ""
