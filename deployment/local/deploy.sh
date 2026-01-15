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
    echo -e "  ${GREEN}3)${NC} Quick Rebuild - Public Only"
    echo -e "  ${GREEN}4)${NC} Quick Rebuild - Auth Only"
    echo -e "  ${GREEN}5)${NC} Quick Rebuild - Sister Only"
    echo -e "  ${GREEN}6)${NC} Quick Rebuild - Feeder Only"
    echo -e "  ${GREEN}7)${NC} Quick Rebuild - MyUnila Only"
    echo -e "  ${GREEN}8)${NC} Quick Rebuild - API Service Only"
    echo -e "  ${GREEN}9)${NC} Quick Rebuild - Frontend Only"
    echo -e "  ${GREEN}10)${NC} Quick Rebuild - Executive Only"
    echo -e "  ${GREEN}29)${NC} Quick Rebuild - Nginx Only"
    echo ""
    echo -e "  ${CYAN}--- Quick Dev Rebuild (Dengan Cache, Lebih Cepat) ---${NC}"
    echo -e "  ${CYAN}22)${NC} Quick Dev Rebuild - All Laravel (auth + public)"
    echo -e "  ${CYAN}23)${NC} Quick Dev Rebuild - Public Only"
    echo -e "  ${CYAN}24)${NC} Quick Dev Rebuild - Auth Only"
    echo ""
    echo -e "  ${BLUE}10)${NC} Restart All Services"
    echo -e "  ${BLUE}11)${NC} Restart Public Only"
    echo -e "  ${BLUE}12)${NC} Restart Auth Only"
    echo -e "  ${BLUE}13)${NC} Restart Sister Only"
    echo -e "  ${BLUE}14)${NC} Restart Feeder Only"
    echo -e "  ${BLUE}15)${NC} Restart MyUnila Only"
    echo -e "  ${BLUE}16)${NC} Restart API Service Only"
    echo -e "  ${BLUE}17)${NC} Restart Executive Only"
    echo -e "  ${BLUE}32)${NC} Restart Nginx Only"
    echo ""
    echo -e "  ${YELLOW}18)${NC} Show Container Status"
    echo -e "  ${YELLOW}19)${NC} Show Logs"
    echo -e "  ${YELLOW}20)${NC} Test Endpoints"
    echo -e "  ${YELLOW}21)${NC} Setup Kong Routes"
    echo ""
    echo -e "  ${RED}22)${NC} Cleanup Docker Resources (hapus images tidak terpakai)"
    echo ""
    echo -e "  ${CYAN}--- Quick Dev Rebuild (Dengan Cache, Lebih Cepat) ---${NC}"
    echo -e "  ${CYAN}23)${NC} Quick Dev Rebuild - All Laravel (auth + public)"
    echo -e "  ${CYAN}24)${NC} Quick Dev Rebuild - Public Only"
    echo -e "  ${CYAN}25)${NC} Quick Dev Rebuild - Auth Only"
    echo ""
    echo -e "  ${CYAN}--- Cache Management ---${NC}"
    echo -e "  ${YELLOW}26)${NC} Clear All Cache (Redis + Laravel)"
    echo -e "  ${YELLOW}27)${NC} Clear Redis Cache Only"
    echo -e "  ${YELLOW}28)${NC} Clear Laravel Cache Only (all services)"
    echo ""
    echo -e "  ${CYAN}--- Service Generator ---${NC}"
    echo -e "  ${GREEN}30)${NC} Create New Service (Laravel atau Go)"
    echo ""
    echo -e "  ${RED}0)${NC} Exit"
    echo ""
    echo -n "Pilihan [0-32]: "
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
    echo "  1) Public"
    echo "  2) Auth"
    echo "  3) Sister"
    echo "  4) Feeder"
    echo "  5) MyUnila"
    echo "  6) API Service"
    echo "  7) Executive"
    echo "  8) Nginx"
    echo "  9) Redis"
    echo "  10) MeiliSearch"
    echo "  11) Kong"
    echo ""
    read -p "Pilihan [1-11]: " log_choice

    case $log_choice in
        1) docker logs myunila-public-service --tail 100 -f ;;
        2) docker logs myunila-auth-service --tail 100 -f ;;
        3) docker logs myunila-sister-service --tail 100 -f ;;
        4) docker logs myunila-feeder-service --tail 100 -f ;;
        5) docker logs myunila-service --tail 100 -f ;;
        6) docker logs myunila-api-service --tail 100 -f ;;
        7) docker logs myunila-executive-service --tail 100 -f ;;
        8) docker logs myunila-nginx --tail 100 -f ;;
        9) docker logs myunila-redis --tail 100 -f ;;
        10) docker logs myunila-meilisearch --tail 100 -f ;;
        11) docker logs myunila-kong --tail 100 -f ;;
        *) echo "Invalid choice" ;;
    esac
}

# Function to test endpoints
test_endpoints() {
    echo ""
    echo -e "${BLUE}Testing Endpoints...${NC}"
    echo ""

    echo -n "Public Health:    "
    PUBLIC_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/api/health 2>/dev/null || echo "000")
    if [ "$PUBLIC_STATUS" = "200" ]; then
        echo -e "${GREEN}✓ $PUBLIC_STATUS OK${NC}"
    else
        echo -e "${RED}✗ $PUBLIC_STATUS${NC}"
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

    echo -n "MyUnila Health:   "
    MYUNILA_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8086/health 2>/dev/null || echo "000")
    if [ "$MYUNILA_STATUS" = "200" ]; then
        echo -e "${GREEN}✓ $MYUNILA_STATUS OK${NC}"
    else
        echo -e "${RED}✗ $MYUNILA_STATUS${NC}"
    fi

    echo -n "API Service:      "
    API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8085/health 2>/dev/null || echo "000")
    if [ "$API_STATUS" = "200" ]; then
        echo -e "${GREEN}✓ $API_STATUS OK${NC}"
    else
        echo -e "${RED}✗ $API_STATUS${NC}"
    fi

    echo -n "Executive:        "
    EXECUTIVE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8087/api/health 2>/dev/null || echo "000")
    if [ "$EXECUTIVE_STATUS" = "200" ]; then
        echo -e "${GREEN}✓ $EXECUTIVE_STATUS OK${NC}"
    else
        echo -e "${RED}✗ $EXECUTIVE_STATUS${NC}"
    fi

    echo ""
    echo -e "${YELLOW}URLs:${NC}"
    echo "  Public:      http://localhost:8082"
    echo "  Auth:        http://localhost:8081"
    echo "  Sister:      http://localhost:8083"
    echo "  Feeder:      http://localhost:8084"
    echo "  MyUnila:     http://localhost:8086"
    echo "  API Service: http://localhost:8085"
    echo "  Executive:   http://localhost:8087"
    echo "  API Docs:    http://localhost:8085/api/docs"
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
            bash "$SCRIPT_DIR/quick-rebuild.sh" public
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
            bash "$SCRIPT_DIR/quick-rebuild.sh" myunila
            read -p "Press Enter to continue..."
            ;;
        8)
            bash "$SCRIPT_DIR/quick-rebuild.sh" api
            read -p "Press Enter to continue..."
            ;;
        9)
            bash "$SCRIPT_DIR/quick-rebuild.sh" frontend
            read -p "Press Enter to continue..."
            ;;
        10)
            bash "$SCRIPT_DIR/quick-rebuild.sh" executive
            read -p "Press Enter to continue..."
            ;;
        29)
            bash "$SCRIPT_DIR/quick-rebuild.sh" nginx
            read -p "Press Enter to continue..."
            ;;
        11)
            bash "$SCRIPT_DIR/restart-services.sh" public
            read -p "Press Enter to continue..."
            ;;
        12)
            bash "$SCRIPT_DIR/restart-services.sh" auth
            read -p "Press Enter to continue..."
            ;;
        13)
            bash "$SCRIPT_DIR/restart-services.sh" sister
            read -p "Press Enter to continue..."
            ;;
        14)
            bash "$SCRIPT_DIR/restart-services.sh" feeder
            read -p "Press Enter to continue..."
            ;;
        15)
            bash "$SCRIPT_DIR/restart-services.sh" myunila
            read -p "Press Enter to continue..."
            ;;
        16)
            bash "$SCRIPT_DIR/restart-services.sh" api
            read -p "Press Enter to continue..."
            ;;
        17)
            bash "$SCRIPT_DIR/restart-services.sh" executive
            read -p "Press Enter to continue..."
            ;;
        32)
            bash "$SCRIPT_DIR/restart-services.sh" nginx
            read -p "Press Enter to continue..."
            ;;
        18)
            show_status
            ;;
        19)
            show_logs
            ;;
        20)
            test_endpoints
            ;;
        21)
            echo ""
            echo -e "${GREEN}Running Kong Routes Setup...${NC}"
            bash "$SCRIPT_DIR/setup-kong-routes.sh"
            read -p "Press Enter to continue..."
            ;;
        21)
            echo ""
            echo -e "${YELLOW}Cleaning up Docker resources...${NC}"
            echo ""
            echo -e "${BLUE}Removing stopped containers...${NC}"
            docker container prune -f
            echo ""
            echo -e "${BLUE}Removing dangling images (older than 24h)...${NC}"
            docker image prune -af --filter "until=24h"
            echo ""
            echo -e "${BLUE}Removing unused volumes...${NC}"
            docker volume prune -f
            echo ""
            echo -e "${BLUE}Removing build cache (older than 24h)...${NC}"
            docker builder prune -af --filter "until=24h"
            echo ""
            echo -e "${GREEN}✓ Cleanup complete!${NC}"
            echo ""
            echo -e "${BLUE}Docker disk usage:${NC}"
            docker system df
            echo ""
            read -p "Press Enter to continue..."
            ;;
        22)
            echo ""
            echo -e "${CYAN}Quick Dev Rebuild - All Laravel Services (dengan cache)${NC}"
            echo -e "${YELLOW}Lebih cepat untuk perubahan kode saja!${NC}"
            echo ""
            bash "$SCRIPT_DIR/quick-dev-rebuild.sh"
            read -p "Press Enter to continue..."
            ;;
        23)
            echo ""
            echo -e "${CYAN}Quick Dev Rebuild - Public Only (dengan cache)${NC}"
            echo -e "${YELLOW}Lebih cepat untuk perubahan kode saja!${NC}"
            echo ""
            bash "$SCRIPT_DIR/quick-dev-rebuild.sh" public
            read -p "Press Enter to continue..."
            ;;
        24)
            echo ""
            echo -e "${CYAN}Quick Dev Rebuild - Auth Only (dengan cache)${NC}"
            echo -e "${YELLOW}Lebih cepat untuk perubahan kode saja!${NC}"
            echo ""
            bash "$SCRIPT_DIR/quick-dev-rebuild.sh" auth
            read -p "Press Enter to continue..."
            ;;
        26)
            echo ""
            echo -e "${CYAN}Clear All Cache (Redis + Laravel)${NC}"
            echo ""
            # Clear Redis
            echo -e "${BLUE}Clearing Redis cache...${NC}"
            docker exec myunila-redis redis-cli FLUSHALL
            echo -e "${GREEN}✓ Redis cache cleared${NC}"
            echo ""
            # Clear Laravel cache for all services
            echo -e "${BLUE}Clearing Laravel cache on Auth Service...${NC}"
            docker exec myunila-auth-service php artisan optimize:clear 2>/dev/null || echo "Auth service not running"
            echo -e "${BLUE}Clearing Laravel cache on Public Service...${NC}"
            docker exec myunila-public-service php artisan optimize:clear 2>/dev/null || echo "Public service not running"
            echo -e "${BLUE}Clearing Laravel cache on Executive Service...${NC}"
            docker exec myunila-executive-service php artisan optimize:clear 2>/dev/null || echo "Executive service not running"
            echo ""
            echo -e "${GREEN}✓ All cache cleared!${NC}"
            read -p "Press Enter to continue..."
            ;;
        27)
            echo ""
            echo -e "${CYAN}Clear Redis Cache Only${NC}"
            echo ""
            echo -e "${BLUE}Clearing Redis cache...${NC}"
            docker exec myunila-redis redis-cli FLUSHALL
            echo -e "${GREEN}✓ Redis cache cleared${NC}"
            read -p "Press Enter to continue..."
            ;;
        28)
            echo ""
            echo -e "${CYAN}Clear Laravel Cache Only (all services)${NC}"
            echo ""
            echo -e "${BLUE}Clearing Laravel cache on Auth Service...${NC}"
            docker exec myunila-auth-service php artisan optimize:clear 2>/dev/null || echo "Auth service not running"
            echo -e "${BLUE}Clearing Laravel cache on Public Service...${NC}"
            docker exec myunila-public-service php artisan optimize:clear 2>/dev/null || echo "Public service not running"
            echo -e "${BLUE}Clearing Laravel cache on Executive Service...${NC}"
            docker exec myunila-executive-service php artisan optimize:clear 2>/dev/null || echo "Executive service not running"
            echo ""
            echo -e "${GREEN}✓ Laravel cache cleared!${NC}"
            read -p "Press Enter to continue..."
            ;;
        30)
            echo ""
            echo -e "${GREEN}Running Create New Service Script...${NC}"
            bash "$SCRIPT_DIR/create-new-service.sh"
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
