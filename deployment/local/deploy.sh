#!/bin/bash

###############################################################################
# MyUnila Local Deployment Helper
# Main script untuk memudahkan deployment di local environment
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Detect if running in Git Bash on Windows
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    SCRIPT_DIR="/c/laragon/www/my-unila/deployment/local/scripts"
else
    SCRIPT_DIR="$(cd "$(dirname "$0")/scripts" && pwd)"
fi

# Function to show menu
show_menu() {
    clear
    echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                                                        ║${NC}"
    echo -e "${CYAN}║        ${BLUE}MyUnila Local Deployment Helper${CYAN}            ║${NC}"
    echo -e "${CYAN}║                                                        ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Pilih operasi:${NC}"
    echo ""
    echo -e "  ${GREEN}1)${NC} Clean Rebuild All (Hapus semua & rebuild)"
    echo -e "  ${GREEN}2)${NC} Quick Rebuild All Services"
    echo -e "  ${GREEN}3)${NC} Quick Rebuild - Dashboard Only"
    echo -e "  ${GREEN}4)${NC} Quick Rebuild - Auth Only"
    echo -e "  ${GREEN}5)${NC} Quick Rebuild - Sister Only"
    echo -e "  ${GREEN}6)${NC} Quick Rebuild - Feeder Only"
    echo -e "  ${GREEN}7)${NC} Quick Rebuild - Frontend Only"
    echo ""
    echo -e "  ${BLUE}8)${NC} Restart All Services"
    echo -e "  ${BLUE}9)${NC} Restart Dashboard Only"
    echo -e "  ${BLUE}10)${NC} Restart Auth Only"
    echo -e "  ${BLUE}11)${NC} Restart Sister Only"
    echo -e "  ${BLUE}12)${NC} Restart Feeder Only"
    echo ""
    echo -e "  ${YELLOW}13)${NC} Show Container Status"
    echo -e "  ${YELLOW}14)${NC} Show Logs"
    echo -e "  ${YELLOW}15)${NC} Test Endpoints"
    echo -e "  ${YELLOW}16)${NC} Setup Kong Routes"
    echo ""
    echo -e "  ${RED}0)${NC} Exit"
    echo ""
    echo -n "Pilihan [0-16]: "
}

# Function to show container status
show_status() {
    echo ""
    echo -e "${BLUE}Container Status:${NC}"
    echo ""
    docker ps --filter "name=myunila" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    read -p "Press Enter to continue..."
}

# Function to show logs
show_logs() {
    echo ""
    echo -e "${YELLOW}Pilih service untuk lihat logs:${NC}"
    echo "  1) Dashboard"
    echo "  2) Auth"
    echo "  3) Sister"
    echo "  4) Feeder"
    echo "  5) Nginx"
    echo "  6) Redis"
    echo "  7) MeiliSearch"
    echo "  8) Kong"
    echo ""
    read -p "Pilihan [1-8]: " log_choice

    case $log_choice in
        1) docker logs myunila-dashboard-service --tail 100 -f ;;
        2) docker logs myunila-auth-service --tail 100 -f ;;
        3) docker logs myunila-sister-service --tail 100 -f ;;
        4) docker logs myunila-feeder-service --tail 100 -f ;;
        5) docker logs myunila-nginx --tail 100 -f ;;
        6) docker logs myunila-redis --tail 100 -f ;;
        7) docker logs myunila-meilisearch --tail 100 -f ;;
        8) docker logs myunila-kong --tail 100 -f ;;
        *) echo "Invalid choice" ;;
    esac
}

# Function to test endpoints
test_endpoints() {
    echo ""
    echo -e "${BLUE}Testing Endpoints...${NC}"
    echo ""

    echo -n "Dashboard Health: "
    DASH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/api/health 2>/dev/null || echo "000")
    if [ "$DASH_STATUS" = "200" ]; then
        echo -e "${GREEN}✓ $DASH_STATUS OK${NC}"
    else
        echo -e "${RED}✗ $DASH_STATUS${NC}"
    fi

    echo -n "Auth Health:      "
    AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/api/health 2>/dev/null || echo "000")
    if [ "$AUTH_STATUS" = "200" ]; then
        echo -e "${GREEN}✓ $AUTH_STATUS OK${NC}"
    else
        echo -e "${RED}✗ $AUTH_STATUS${NC}"
    fi

    echo -n "Sister Health:    "
    SISTER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8083/health 2>/dev/null || echo "000")
    if [ "$SISTER_STATUS" = "200" ]; then
        echo -e "${GREEN}✓ $SISTER_STATUS OK${NC}"
    else
        echo -e "${RED}✗ $SISTER_STATUS${NC}"
    fi

    echo -n "Feeder Health:    "
    FEEDER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8084/health 2>/dev/null || echo "000")
    if [ "$FEEDER_STATUS" = "200" ]; then
        echo -e "${GREEN}✓ $FEEDER_STATUS OK${NC}"
    else
        echo -e "${RED}✗ $FEEDER_STATUS${NC}"
    fi

    echo ""
    echo -e "${YELLOW}URLs:${NC}"
    echo "  Dashboard: http://localhost:8082"
    echo "  Auth:      http://localhost:8081"
    echo "  Sister:    http://localhost:8083"
    echo "  Feeder:    http://localhost:8084"
    echo ""
    read -p "Press Enter to continue..."
}

# Main loop
while true; do
    show_menu
    read choice

    case $choice in
        1)
            bash "$SCRIPT_DIR/clean-rebuild-all.sh"
            read -p "Press Enter to continue..."
            ;;
        2)
            bash "$SCRIPT_DIR/quick-rebuild.sh"
            read -p "Press Enter to continue..."
            ;;
        3)
            bash "$SCRIPT_DIR/quick-rebuild.sh" dashboard
            read -p "Press Enter to continue..."
            ;;
        4)
            bash "$SCRIPT_DIR/quick-rebuild.sh" auth
            read -p "Press Enter to continue..."
            ;;
        5)
            bash "$SCRIPT_DIR/quick-rebuild.sh" sister
            read -p "Press Enter to continue..."
            ;;
        6)
            bash "$SCRIPT_DIR/quick-rebuild.sh" feeder
            read -p "Press Enter to continue..."
            ;;
        7)
            bash "$SCRIPT_DIR/quick-rebuild.sh" frontend
            read -p "Press Enter to continue..."
            ;;
        8)
            bash "$SCRIPT_DIR/restart-services.sh"
            read -p "Press Enter to continue..."
            ;;
        9)
            bash "$SCRIPT_DIR/restart-services.sh" dashboard
            read -p "Press Enter to continue..."
            ;;
        10)
            bash "$SCRIPT_DIR/restart-services.sh" auth
            read -p "Press Enter to continue..."
            ;;
        11)
            bash "$SCRIPT_DIR/restart-services.sh" sister
            read -p "Press Enter to continue..."
            ;;
        12)
            bash "$SCRIPT_DIR/restart-services.sh" feeder
            read -p "Press Enter to continue..."
            ;;
        13)
            show_status
            ;;
        14)
            show_logs
            ;;
        15)
            test_endpoints
            ;;
        16)
            echo ""
            echo -e "${GREEN}Running Kong Routes Setup...${NC}"
            bash "$SCRIPT_DIR/setup-kong-routes.sh"
            read -p "Press Enter to continue..."
            ;;
        0)
            echo ""
            echo -e "${GREEN}Goodbye!${NC}"
            echo ""
            exit 0
            ;;
        *)
            echo ""
            echo -e "${RED}Invalid choice!${NC}"
            sleep 2
            ;;
    esac
done
