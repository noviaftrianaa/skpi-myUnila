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

# Auto-detect script directory (works on any machine/OS)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/scripts" && pwd)"

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
    echo -e "  ${CYAN}--- Clean & Full Rebuild ---${NC}"
    echo -e "  ${GREEN}1)${NC}  Clean Rebuild All (Hapus semua & rebuild)"
    echo -e "  ${GREEN}2)${NC}  Quick Rebuild All Services"
    echo ""
    echo -e "  ${CYAN}--- Quick Rebuild (Per Service) ---${NC}"
    echo -e "  ${GREEN}3)${NC}  Quick Rebuild - Public Only"
    echo -e "  ${GREEN}4)${NC}  Quick Rebuild - Auth Only"
    echo -e "  ${GREEN}5)${NC}  Quick Rebuild - Sister Only"
    echo -e "  ${GREEN}6)${NC}  Quick Rebuild - Feeder Only"
    echo -e "  ${GREEN}7)${NC}  Quick Rebuild - Keuangan Only"
    echo -e "  ${GREEN}8)${NC}  Quick Rebuild - MyUnila Only"
    echo -e "  ${GREEN}9)${NC}  Quick Rebuild - API Service Only"
    echo -e "  ${GREEN}10)${NC} Quick Rebuild - Dashboard Only"
    echo -e "  ${GREEN}11)${NC} Quick Rebuild - Frontend Only"
    echo -e "  ${GREEN}12)${NC} Quick Rebuild - Nginx Only"
    echo ""
    echo -e "  ${CYAN}--- Quick Dev Rebuild (Dengan Cache, Lebih Cepat) ---${NC}"
    echo -e "  ${CYAN}13)${NC} Quick Dev Rebuild - All Laravel (auth + public)"
    echo -e "  ${CYAN}14)${NC} Quick Dev Rebuild - Public Only"
    echo -e "  ${CYAN}15)${NC} Quick Dev Rebuild - Auth Only"
    echo -e "  ${CYAN}16)${NC} Quick Dev Rebuild - Frontend Only (FAST!)"
    echo ""
    echo -e "  ${CYAN}--- Restart Services ---${NC}"
    echo -e "  ${BLUE}17)${NC} Restart All Services"
    echo -e "  ${BLUE}18)${NC} Restart Public Only"
    echo -e "  ${BLUE}19)${NC} Restart Auth Only"
    echo -e "  ${BLUE}20)${NC} Restart Sister Only"
    echo -e "  ${BLUE}21)${NC} Restart Feeder Only"
    echo -e "  ${BLUE}22)${NC} Restart Keuangan Only"
    echo -e "  ${BLUE}23)${NC} Restart MyUnila Only"
    echo -e "  ${BLUE}24)${NC} Restart API Service Only"
    echo -e "  ${BLUE}25)${NC} Restart Dashboard Only"
    echo -e "  ${BLUE}26)${NC} Restart Nginx Only"
    echo ""
    echo -e "  ${CYAN}--- Monitoring & Testing ---${NC}"
    echo -e "  ${YELLOW}27)${NC} Show Container Status"
    echo -e "  ${YELLOW}28)${NC} Show Logs"
    echo -e "  ${YELLOW}29)${NC} Test Endpoints"
    echo -e "  ${YELLOW}30)${NC} Setup Kong Routes"
    echo ""
    echo -e "  ${CYAN}--- Cache Management ---${NC}"
    echo -e "  ${YELLOW}31)${NC} Clear All Cache (Redis + Laravel)"
    echo -e "  ${YELLOW}32)${NC} Clear Redis Cache Only"
    echo -e "  ${YELLOW}33)${NC} Clear Laravel Cache Only (all services)"
    echo ""
    echo -e "  ${CYAN}--- Utilities ---${NC}"
    echo -e "  ${GREEN}34)${NC} Create New Service (Laravel atau Go)"
    echo -e "  ${RED}35)${NC} Cleanup Docker Resources (hapus images tidak terpakai)"
    echo ""
    echo -e "  ${CYAN}--- Frontend Development ---${NC}"
    echo -e "  ${GREEN}36)${NC} Frontend Hot Reload (Dev Mode - Port 3000)"
    echo ""
    echo -e "  ${CYAN}--- Dev Mode (Hot Reload) ---${NC}"
    echo -e "  ${MAGENTA}37)${NC} Dev Mode - ALL (Docker infra + Go air + Frontend npm dev)"
    echo -e "  ${MAGENTA}38)${NC} Go Hot Reload - Keuangan Only"
    echo -e "  ${MAGENTA}39)${NC} Go Hot Reload - ALL Go Services"
    echo -e "  ${MAGENTA}40)${NC} Go Hot Reload - Pilih Service"
    echo -e "  ${MAGENTA}41)${NC} Dev Mode - Backend Only (no frontend)"
    echo ""
    echo -e "  ${RED}0)${NC}  Exit"
    echo ""
    echo -n "Pilihan [0-41]: "
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
    echo "  7) Keuangan"
    echo "  8) Dashboard"
    echo "  9) Nginx"
    echo "  10) Redis"
    echo "  11) MeiliSearch"
    echo "  12) Kong"
    echo ""
    read -p "Pilihan [1-12]: " log_choice

    case $log_choice in
        1) docker logs myunila-public-service --tail 100 -f ;;
        2) docker logs myunila-auth-service --tail 100 -f ;;
        3) docker logs myunila-sister-service --tail 100 -f ;;
        4) docker logs myunila-feeder-service --tail 100 -f ;;
        5) docker logs myunila-service --tail 100 -f ;;
        6) docker logs myunila-api-service --tail 100 -f ;;
        7) docker logs myunila-keuangan-service --tail 100 -f ;;
        8) docker logs myunila-dashboard-service --tail 100 -f ;;
        9) docker logs myunila-nginx --tail 100 -f ;;
        10) docker logs myunila-redis --tail 100 -f ;;
        11) docker logs myunila-meilisearch --tail 100 -f ;;
        12) docker logs myunila-kong --tail 100 -f ;;
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

    echo -n "Keuangan:         "
    KEUANGAN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8088/health 2>/dev/null || echo "000")
    if [ "$KEUANGAN_STATUS" = "200" ]; then
        echo -e "${GREEN}✓ $KEUANGAN_STATUS OK${NC}"
    else
        echo -e "${RED}✗ $KEUANGAN_STATUS${NC}"
    fi

    echo -n "Dashboard:        "
    DASHBOARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8087/api/health 2>/dev/null || echo "000")
    if [ "$DASHBOARD_STATUS" = "200" ]; then
        echo -e "${GREEN}✓ $DASHBOARD_STATUS OK${NC}"
    else
        echo -e "${RED}✗ $DASHBOARD_STATUS${NC}"
    fi

    echo ""
    echo -e "${YELLOW}URLs:${NC}"
    echo "  Public:      http://localhost:8082"
    echo "  Auth:        http://localhost:8081"
    echo "  Sister:      http://localhost:8083"
    echo "  Feeder:      http://localhost:8084"
    echo "  API Service: http://localhost:8085"
    echo "  Keuangan:    http://localhost:8088"
    echo "  Dashboard:   http://localhost:8087"
    echo "  API Docs:    http://localhost:8085/api/docs"
    echo ""
    read -p "Press Enter to continue..."
}

# Main loop
while true; do
    show_menu
    read choice

    case $choice in
        # === Clean & Full Rebuild ===
        1)
            bash "$SCRIPT_DIR/clean-rebuild-all.sh"
            read -p "Press Enter to continue..."
            ;;
        2)
            bash "$SCRIPT_DIR/quick-rebuild.sh"
            read -p "Press Enter to continue..."
            ;;

        # === Quick Rebuild (Per Service) ===
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
            bash "$SCRIPT_DIR/quick-rebuild.sh" keuangan
            read -p "Press Enter to continue..."
            ;;
        8)
            bash "$SCRIPT_DIR/quick-rebuild.sh" myunila
            read -p "Press Enter to continue..."
            ;;
        9)
            bash "$SCRIPT_DIR/quick-rebuild.sh" api
            read -p "Press Enter to continue..."
            ;;
        10)
            bash "$SCRIPT_DIR/quick-rebuild.sh" dashboard
            read -p "Press Enter to continue..."
            ;;
        11)
            bash "$SCRIPT_DIR/quick-rebuild.sh" frontend
            read -p "Press Enter to continue..."
            ;;
        12)
            bash "$SCRIPT_DIR/quick-rebuild.sh" nginx
            read -p "Press Enter to continue..."
            ;;

        # === Quick Dev Rebuild ===
        13)
            echo ""
            echo -e "${CYAN}Quick Dev Rebuild - All Laravel Services (dengan cache)${NC}"
            echo -e "${YELLOW}Lebih cepat untuk perubahan kode saja!${NC}"
            echo ""
            bash "$SCRIPT_DIR/quick-dev-rebuild.sh"
            read -p "Press Enter to continue..."
            ;;
        14)
            echo ""
            echo -e "${CYAN}Quick Dev Rebuild - Public Only (dengan cache)${NC}"
            echo -e "${YELLOW}Lebih cepat untuk perubahan kode saja!${NC}"
            echo ""
            bash "$SCRIPT_DIR/quick-dev-rebuild.sh" public
            read -p "Press Enter to continue..."
            ;;
        15)
            echo ""
            echo -e "${CYAN}Quick Dev Rebuild - Auth Only (dengan cache)${NC}"
            echo -e "${YELLOW}Lebih cepat untuk perubahan kode saja!${NC}"
            echo ""
            bash "$SCRIPT_DIR/quick-dev-rebuild.sh" auth
            read -p "Press Enter to continue..."
            ;;
        16)
            echo ""
            echo -e "${CYAN}Quick Dev Rebuild - Frontend Only (dengan cache)${NC}"
            echo -e "${YELLOW}Lebih cepat untuk perubahan kode saja!${NC}"
            echo ""
            bash "$SCRIPT_DIR/quick-dev-rebuild.sh" frontend
            read -p "Press Enter to continue..."
            ;;

        # === Restart Services ===
        17)
            bash "$SCRIPT_DIR/restart-services.sh"
            read -p "Press Enter to continue..."
            ;;
        18)
            bash "$SCRIPT_DIR/restart-services.sh" public
            read -p "Press Enter to continue..."
            ;;
        19)
            bash "$SCRIPT_DIR/restart-services.sh" auth
            read -p "Press Enter to continue..."
            ;;
        20)
            bash "$SCRIPT_DIR/restart-services.sh" sister
            read -p "Press Enter to continue..."
            ;;
        21)
            bash "$SCRIPT_DIR/restart-services.sh" feeder
            read -p "Press Enter to continue..."
            ;;
        22)
            bash "$SCRIPT_DIR/restart-services.sh" keuangan
            read -p "Press Enter to continue..."
            ;;
        23)
            bash "$SCRIPT_DIR/restart-services.sh" myunila
            read -p "Press Enter to continue..."
            ;;
        24)
            bash "$SCRIPT_DIR/restart-services.sh" api
            read -p "Press Enter to continue..."
            ;;
        25)
            bash "$SCRIPT_DIR/restart-services.sh" dashboard
            read -p "Press Enter to continue..."
            ;;
        26)
            bash "$SCRIPT_DIR/restart-services.sh" nginx
            read -p "Press Enter to continue..."
            ;;

        # === Monitoring & Testing ===
        27)
            show_status
            ;;
        28)
            show_logs
            ;;
        29)
            test_endpoints
            ;;
        30)
            echo ""
            echo -e "${GREEN}Running Kong Routes Setup...${NC}"
            bash "$SCRIPT_DIR/setup-kong-routes.sh"
            read -p "Press Enter to continue..."
            ;;

        # === Cache Management ===
        31)
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
            echo ""
            echo -e "${GREEN}✓ All cache cleared!${NC}"
            read -p "Press Enter to continue..."
            ;;
        32)
            echo ""
            echo -e "${CYAN}Clear Redis Cache Only${NC}"
            echo ""
            echo -e "${BLUE}Clearing Redis cache...${NC}"
            docker exec myunila-redis redis-cli FLUSHALL
            echo -e "${GREEN}✓ Redis cache cleared${NC}"
            read -p "Press Enter to continue..."
            ;;
        33)
            echo ""
            echo -e "${CYAN}Clear Laravel Cache Only (all services)${NC}"
            echo ""
            echo -e "${BLUE}Clearing Laravel cache on Auth Service...${NC}"
            docker exec myunila-auth-service php artisan optimize:clear 2>/dev/null || echo "Auth service not running"
            echo -e "${BLUE}Clearing Laravel cache on Public Service...${NC}"
            docker exec myunila-public-service php artisan optimize:clear 2>/dev/null || echo "Public service not running"
            echo ""
            echo -e "${GREEN}✓ Laravel cache cleared!${NC}"
            read -p "Press Enter to continue..."
            ;;

        # === Utilities ===
        34)
            echo ""
            echo -e "${GREEN}Running Create New Service Script...${NC}"
            bash "$SCRIPT_DIR/create-new-service.sh"
            ;;
        35)
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

        # === Frontend Development ===
        36)
            echo ""
            echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
            echo -e "${CYAN}║     ${GREEN}Frontend Hot Reload Mode (Next.js Dev Server)${CYAN}     ║${NC}"
            echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
            echo ""
            echo -e "${YELLOW}Starting Next.js development server with hot reload...${NC}"
            echo -e "${BLUE}URL: http://localhost:3000${NC}"
            echo -e "${YELLOW}Press Ctrl+C to stop the server.${NC}"
            echo ""

            # Auto-detect frontend directory
            FRONTEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/frontend"

            # Kill any existing process on port 3000
            EXISTING_PID=$(netstat -ano 2>/dev/null | grep ":3000" | grep LISTEN | head -1 | awk '{print $NF}')
            if [ -n "$EXISTING_PID" ] && [ "$EXISTING_PID" != "0" ]; then
                echo -e "${YELLOW}Killing existing process on port 3000 (PID: $EXISTING_PID)...${NC}"
                taskkill //PID "$EXISTING_PID" //F 2>/dev/null
                sleep 1
            fi

            # Cleanup on exit: kill node process on port 3000
            cleanup_frontend() {
                echo ""
                echo -e "${YELLOW}Stopping frontend server...${NC}"
                FRONTEND_PID=$(netstat -ano 2>/dev/null | grep ":3000" | grep LISTEN | head -1 | awk '{print $NF}')
                if [ -n "$FRONTEND_PID" ] && [ "$FRONTEND_PID" != "0" ]; then
                    taskkill //PID "$FRONTEND_PID" //F 2>/dev/null
                fi
                echo -e "${GREEN}Frontend server stopped.${NC}"
            }
            trap cleanup_frontend EXIT INT TERM

            cd "$FRONTEND_DIR" && npm run dev -- -p 3000
            cleanup_frontend
            trap - EXIT INT TERM
            echo ""
            echo -e "${GREEN}Hot Reload server stopped.${NC}"
            read -p "Press Enter to continue..."
            ;;

        # === Dev Mode (Hot Reload) ===
        37)
            bash "$SCRIPT_DIR/dev-mode.sh"
            read -p "Press Enter to continue..."
            ;;
        38)
            bash "$SCRIPT_DIR/go-hot-reload.sh" keuangan
            read -p "Press Enter to continue..."
            ;;
        39)
            bash "$SCRIPT_DIR/go-hot-reload.sh" all
            read -p "Press Enter to continue..."
            ;;
        40)
            echo ""
            echo -e "${YELLOW}Pilih Go service:${NC}"
            echo "  1) Keuangan (port 8088)"
            echo "  2) Sister (port 8083)"
            echo "  3) Feeder (port 8084)"
            echo "  4) API (port 8085)"
            echo "  5) MyUnila (port 8086)"
            echo ""
            read -p "Pilihan [1-5]: " go_choice
            case $go_choice in
                1) bash "$SCRIPT_DIR/go-hot-reload.sh" keuangan ;;
                2) bash "$SCRIPT_DIR/go-hot-reload.sh" sister ;;
                3) bash "$SCRIPT_DIR/go-hot-reload.sh" feeder ;;
                4) bash "$SCRIPT_DIR/go-hot-reload.sh" api ;;
                5) bash "$SCRIPT_DIR/go-hot-reload.sh" myunila ;;
                *) echo -e "${RED}Pilihan tidak valid${NC}" ;;
            esac
            read -p "Press Enter to continue..."
            ;;
        41)
            bash "$SCRIPT_DIR/dev-mode.sh" --no-frontend
            read -p "Press Enter to continue..."
            ;;

        # === Exit ===
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
