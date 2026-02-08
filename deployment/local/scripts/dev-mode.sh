#!/bin/bash

###############################################################################
# MyUnila Dev Mode
#
# Starts everything needed for local development:
# 1. All backend services via Docker (as usual)
# 2. Frontend via npm run dev (HMR - instant hot reload)
#
# Usage: bash dev-mode.sh [--backend-only] [--frontend-only]
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Detect OS and set paths
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    PROJECT_ROOT="/c/laragon/www/my-unila"
else
    PROJECT_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
fi

DEPLOY_DIR="$PROJECT_ROOT/deployment/local"
SERVICES_DIR="$DEPLOY_DIR/services"
SCRIPTS_DIR="$DEPLOY_DIR/scripts"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Parse flags
BACKEND_ONLY=false
FRONTEND_ONLY=false

for arg in "$@"; do
    case $arg in
        --backend-only) BACKEND_ONLY=true ;;
        --frontend-only) FRONTEND_ONLY=true ;;
    esac
done

# Track frontend PID
FRONTEND_PID=""

cleanup() {
    echo ""
    echo -e "${YELLOW}==============================${NC}"
    echo -e "${YELLOW}  Shutting down Dev Mode...${NC}"
    echo -e "${YELLOW}==============================${NC}"

    # Stop frontend
    if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID" 2>/dev/null
        wait "$FRONTEND_PID" 2>/dev/null
    fi

    echo -e "${GREEN}Dev Mode stopped. Docker containers still running.${NC}"
    echo -e "${YELLOW}To stop Docker: docker stop \$(docker ps -q --filter name=myunila)${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Banner
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                            ║${NC}"
echo -e "${CYAN}║        ${MAGENTA}MyUnila Dev Mode${CYAN}                                  ║${NC}"
echo -e "${CYAN}║                                                            ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================
# Step 1: Check prerequisites
# ============================================
echo -e "${BLUE}[1/3] Checking prerequisites...${NC}"

# Check docker
if ! $FRONTEND_ONLY; then
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}  Docker not found. Please install Docker.${NC}"
        exit 1
    fi
    echo -e "${GREEN}  docker: OK${NC}"
fi

# Check node
if ! $BACKEND_ONLY; then
    if ! command -v node &> /dev/null; then
        echo -e "${RED}  Node.js not found. Please install Node.js.${NC}"
        exit 1
    fi
    echo -e "${GREEN}  node: OK ($(node -v))${NC}"
fi

echo ""

# ============================================
# Step 2: Start Backend (all Docker)
# ============================================
if ! $FRONTEND_ONLY; then
    echo -e "${BLUE}[2/3] Starting backend services (Docker)...${NC}"

    # Use deploy.sh option 1 (full Docker deploy) or start individually
    # Check Docker network
    if ! docker network ls --format '{{.Name}}' | grep -q "myunila-network"; then
        echo -e "${YELLOW}  Creating Docker network: myunila-network${NC}"
        docker network create myunila-network 2>/dev/null
    fi

    # Start Redis
    if ! docker ps --format '{{.Names}}' | grep -q "myunila-redis"; then
        echo -e "${YELLOW}  Starting Redis...${NC}"
        docker-compose -f "$SERVICES_DIR/1-infrastructure/docker-compose.redis.yml" up -d 2>/dev/null
    fi
    echo -e "${GREEN}  Redis: running (:6379)${NC}"

    # Start Kong
    if ! docker ps --format '{{.Names}}' | grep -q "myunila-kong$"; then
        echo -e "${YELLOW}  Starting Kong...${NC}"
        docker-compose -f "$SERVICES_DIR/2-gateway/docker-compose.kong.yml" up -d 2>/dev/null
        sleep 5
    fi
    echo -e "${GREEN}  Kong: running (:9800)${NC}"

    # Start Nginx
    if ! docker ps --format '{{.Names}}' | grep -q "myunila-nginx"; then
        echo -e "${YELLOW}  Starting Nginx...${NC}"
        docker-compose -f "$SERVICES_DIR/3-backend/docker-compose.nginx.yml" up -d 2>/dev/null
    fi

    # Start Laravel services
    for svc in auth public dashboard; do
        container="myunila-${svc}-service"
        compose_file="$SERVICES_DIR/3-backend/docker-compose.${svc}.yml"
        if ! docker ps --format '{{.Names}}' | grep -q "$container"; then
            echo -e "${YELLOW}  Starting ${svc} service...${NC}"
            docker-compose -f "$compose_file" up -d 2>/dev/null
        fi
    done
    echo -e "${GREEN}  Auth Service: running (:8081) [volume mount]${NC}"
    echo -e "${GREEN}  Public Service: running (:8082) [volume mount]${NC}"
    echo -e "${GREEN}  Dashboard Service: running (:8087) [volume mount]${NC}"

    # Start Go services (Docker)
    GO_SERVICES=("keuangan" "sister" "feeder" "api" "myunila")
    GO_COMPOSE=(
        "$SERVICES_DIR/3-backend/docker-compose.keuangan.yml"
        "$SERVICES_DIR/3-backend/docker-compose.sister.yml"
        "$SERVICES_DIR/3-backend/docker-compose.feeder.yml"
        "$SERVICES_DIR/3-backend/docker-compose.api.yml"
        "$SERVICES_DIR/3-backend/docker-compose.myunila.yml"
    )
    GO_CONTAINERS=("myunila-keuangan-service" "myunila-sister-service" "myunila-feeder-service" "myunila-api-service" "myunila-service")
    GO_PORTS=("8088" "8083" "8084" "8085" "8086")

    for i in "${!GO_SERVICES[@]}"; do
        container="${GO_CONTAINERS[$i]}"
        compose="${GO_COMPOSE[$i]}"
        name="${GO_SERVICES[$i]}"
        port="${GO_PORTS[$i]}"
        if ! docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
            if [ -f "$compose" ]; then
                echo -e "${YELLOW}  Starting ${name} service...${NC}"
                docker-compose -f "$compose" up -d 2>/dev/null
            fi
        fi
        echo -e "${GREEN}  ${name^} Service: running (:${port}) [Docker]${NC}"
    done

    echo ""
else
    echo -e "${YELLOW}[2/3] Skipping backend (--frontend-only)${NC}"
    echo ""
fi

# ============================================
# Step 3: Start Frontend (npm run dev - HMR)
# ============================================
if ! $BACKEND_ONLY; then
    echo -e "${BLUE}[3/3] Starting Frontend (Next.js dev server)...${NC}"

    if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
        echo -e "${YELLOW}  Installing npm dependencies...${NC}"
        cd "$FRONTEND_DIR" && npm install
    fi

    # Stop Docker frontend if running (free port 3000)
    if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "myunila-frontend"; then
        echo -e "${YELLOW}  Stopping Docker frontend container (freeing port 3000)...${NC}"
        docker stop myunila-frontend 2>/dev/null
    fi

    echo -e "${GREEN}  Starting Next.js dev server on :3000...${NC}"
    cd "$FRONTEND_DIR" && npm run dev -- -p 3000 &
    FRONTEND_PID=$!
    echo ""
else
    echo -e "${YELLOW}[3/3] Skipping frontend (--backend-only)${NC}"
    echo ""
fi

# ============================================
# Summary
# ============================================
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Dev Mode Active!${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Services:${NC}"

if ! $FRONTEND_ONLY; then
    echo -e "  ${CYAN}Kong Gateway${NC}     -> http://localhost:9800"
    echo -e "  ${CYAN}Redis${NC}            -> localhost:6379"
    echo -e "  ${BLUE}Auth (Laravel)${NC}   -> http://localhost:8081  [Docker + volume mount]"
    echo -e "  ${BLUE}Public (Laravel)${NC} -> http://localhost:8082  [Docker + volume mount]"
    echo -e "  ${BLUE}Dashboard${NC}        -> http://localhost:8087  [Docker + volume mount]"
    echo -e "  ${GREEN}Sister (Go)${NC}      -> http://localhost:8083  [Docker]"
    echo -e "  ${GREEN}Feeder (Go)${NC}      -> http://localhost:8084  [Docker]"
    echo -e "  ${GREEN}API (Go)${NC}         -> http://localhost:8085  [Docker]"
    echo -e "  ${GREEN}MyUnila (Go)${NC}     -> http://localhost:8086  [Docker]"
    echo -e "  ${GREEN}Keuangan (Go)${NC}    -> http://localhost:8088  [Docker]"
fi

if ! $BACKEND_ONLY; then
    echo -e "  ${MAGENTA}Frontend${NC}         -> http://localhost:3000  [Next.js HMR]"
fi

echo ""
echo -e "${YELLOW}Hot Reload:${NC}"
echo -e "  Laravel      -> Edit PHP file, save -> instant (volume mount + PHP-FPM)"
echo -e "  Frontend     -> Edit TSX file, save -> instant (Next.js HMR)"
echo -e "  Go services  -> Edit .go file -> rebuild Docker container"
echo ""
echo -e "${RED}Press Ctrl+C to stop frontend. Docker containers keep running.${NC}"
echo ""

# Wait for frontend process
if [ -n "$FRONTEND_PID" ]; then
    wait "$FRONTEND_PID"
else
    echo -e "${GREEN}All services started via Docker. Nothing to wait for.${NC}"
fi
