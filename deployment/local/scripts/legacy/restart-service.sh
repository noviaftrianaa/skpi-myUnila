#!/bin/bash

###############################################################################
# Restart Service (untuk perubahan .env) - Local Development
# Usage: ./restart-service.sh [auth|dashboard|sister|all|nginx]
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
    echo "Usage: $0 [auth|dashboard|sister|nginx|all]"
    echo ""
    echo "Examples:"
    echo "  $0 auth       # Restart auth service only"
    echo "  $0 dashboard  # Restart dashboard service only"
    echo "  $0 sister     # Restart sister service only"
    echo "  $0 nginx      # Restart nginx backend proxy"
    echo "  $0 all        # Restart all services"
    exit 1
fi

cd "$DEPLOYMENT_DIR"

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Restart Service - Local${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

restart_auth() {
    echo -e "${GREEN}Restarting Auth Service...${NC}"
    docker compose --env-file .env -f services/3-backend/docker-compose.auth.yml restart auth-service
    echo -e "${GREEN}✓ Auth service restarted${NC}"
}

restart_dashboard() {
    echo -e "${GREEN}Restarting Dashboard Service...${NC}"
    docker compose --env-file .env -f services/3-backend/docker-compose.dashboard.yml restart dashboard-service
    echo -e "${GREEN}✓ Dashboard service restarted${NC}"
}

restart_sister() {
    echo -e "${GREEN}Restarting Sister Service...${NC}"
    docker compose --env-file .env -f services/3-backend/docker-compose.sister.yml restart sister-service
    echo -e "${GREEN}✓ Sister service restarted${NC}"
}

restart_nginx() {
    echo -e "${GREEN}Restarting Nginx Backend Proxy...${NC}"
    docker compose --env-file .env -f services/3-backend/docker-compose.nginx.yml restart nginx
    echo -e "${GREEN}✓ Nginx restarted${NC}"
}

case $SERVICE in
    auth)
        restart_auth
        ;;
    dashboard)
        restart_dashboard
        ;;
    sister)
        restart_sister
        ;;
    nginx)
        restart_nginx
        ;;
    all)
        restart_auth
        echo ""
        restart_dashboard
        echo ""
        restart_sister
        echo ""
        restart_nginx
        ;;
    *)
        echo -e "${RED}Error: Unknown service '$SERVICE'${NC}"
        echo "Valid services: auth, dashboard, sister, nginx, all"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Restart Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

# Show container status
echo -e "${YELLOW}Container Status:${NC}"
docker ps --filter "name=myunila" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
