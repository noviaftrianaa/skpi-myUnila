#!/bin/bash

###############################################################################
# MyUnila Minimal Deployment - TANPA Kong
#
# Untuk tim yang hanya butuh beberapa service, tanpa Kong API Gateway.
# Frontend langsung akses backend via port masing-masing.
#
# Usage:
#   bash deploy-minimal.sh                    # Default: auth + public + frontend
#   bash deploy-minimal.sh auth               # Auth + frontend saja
#   bash deploy-minimal.sh auth public sister # Pilih service
#   bash deploy-minimal.sh --all              # Semua service tanpa Kong
#   bash deploy-minimal.sh --no-frontend auth # Backend saja, tanpa frontend Docker
#   bash deploy-minimal.sh --stop             # Stop semua service
#
# Service yang tersedia:
#   auth, public, dashboard, sister, feeder, keuangan, myunila, api
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Auto-detect paths (works on any machine/OS)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
DEPLOYMENT_DIR="$SCRIPT_DIR"
SERVICES_DIR="$DEPLOYMENT_DIR/services"

# Parse flags
BUILD_FRONTEND=true
STOP_MODE=false
ALL_SERVICES=false
SERVICES=()

for arg in "$@"; do
    case $arg in
        --no-frontend) BUILD_FRONTEND=false ;;
        --stop) STOP_MODE=true ;;
        --all) ALL_SERVICES=true ;;
        auth|public|dashboard|sister|feeder|keuangan|myunila|api)
            SERVICES+=("$arg")
            ;;
        *)
            echo -e "${RED}Unknown argument: $arg${NC}"
            echo "Usage: bash deploy-minimal.sh [--no-frontend] [--stop] [--all] [service1 service2 ...]"
            exit 1
            ;;
    esac
done

# Default services if none specified
if [ ${#SERVICES[@]} -eq 0 ] && [ "$ALL_SERVICES" = false ]; then
    SERVICES=("auth" "public")
fi

# All services mode
if [ "$ALL_SERVICES" = true ]; then
    SERVICES=("auth" "public" "dashboard" "sister" "feeder" "keuangan" "myunila" "api")
fi

# Laravel services that need Nginx reverse proxy
LARAVEL_SERVICES=("auth" "public" "dashboard")

# Check if any selected service needs Nginx
needs_nginx() {
    for svc in "${SERVICES[@]}"; do
        for laravel_svc in "${LARAVEL_SERVICES[@]}"; do
            if [ "$svc" = "$laravel_svc" ]; then
                return 0
            fi
        done
    done
    return 1
}

# Check if service needs MeiliSearch
needs_meilisearch() {
    for svc in "${SERVICES[@]}"; do
        if [ "$svc" = "public" ]; then
            return 0
        fi
    done
    return 1
}

# ============================================
# STOP MODE
# ============================================
if [ "$STOP_MODE" = true ]; then
    echo ""
    echo -e "${YELLOW}Stopping all MyUnila services...${NC}"
    echo ""

    cd "$DEPLOYMENT_DIR"

    # Stop frontend
    docker compose --env-file .env -f "$SERVICES_DIR/4-frontend/docker-compose.yml" down 2>/dev/null || true

    # Stop backend services
    for svc in auth public dashboard sister feeder keuangan myunila api; do
        docker compose --env-file .env -f "$SERVICES_DIR/3-backend/docker-compose.${svc}.yml" down 2>/dev/null || true
    done

    # Stop nginx
    docker compose -f "$SERVICES_DIR/3-backend/docker-compose.nginx.yml" down 2>/dev/null || true

    # Stop infrastructure
    docker compose --env-file .env -f "$SERVICES_DIR/1-infrastructure/docker-compose.meilisearch.yml" down 2>/dev/null || true
    docker compose -f "$SERVICES_DIR/1-infrastructure/docker-compose.redis.yml" down 2>/dev/null || true

    echo -e "${GREEN}All services stopped.${NC}"
    echo ""
    exit 0
fi

# ============================================
# START MODE
# ============================================
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                        ║${NC}"
echo -e "${CYAN}║    ${BLUE}MyUnila Minimal Deployment (Tanpa Kong)${CYAN}          ║${NC}"
echo -e "${CYAN}║                                                        ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

cd "$DEPLOYMENT_DIR" || exit 1

# Step 1: Check .env
echo -e "${GREEN}[1/5] Checking environment...${NC}"
if [ ! -f "$DEPLOYMENT_DIR/.env" ]; then
    echo -e "${RED}ERROR: .env file not found!${NC}"
    echo ""
    echo "Buat .env dari template:"
    echo "  cp .env.example .env"
    echo "  # Edit .env: isi DB_MSSQL_HOST, DB_MSSQL_USERNAME, DB_MSSQL_PASSWORD"
    echo ""
    exit 1
fi
echo -e "  ${GREEN}✓ .env found${NC}"
echo -e "  Services: ${CYAN}${SERVICES[*]}${NC}"
echo -e "  Frontend Docker: ${CYAN}${BUILD_FRONTEND}${NC}"
echo ""

# Step 2: Create network & start infrastructure
echo -e "${GREEN}[2/5] Starting infrastructure...${NC}"

# Create network if not exists
if ! docker network ls --format '{{.Name}}' | grep -q "^myunila-network$"; then
    echo "  → Creating Docker network: myunila-network"
    docker network create myunila-network
fi

# Start Redis (always required)
echo "  → Starting Redis..."
docker compose -f "$SERVICES_DIR/1-infrastructure/docker-compose.redis.yml" up -d
sleep 3

# Start MeiliSearch if public-service is selected
if needs_meilisearch; then
    echo "  → Starting MeiliSearch (needed by public-service)..."
    docker compose --env-file .env -f "$SERVICES_DIR/1-infrastructure/docker-compose.meilisearch.yml" up -d
    sleep 3
fi

echo -e "  ${GREEN}✓ Infrastructure ready${NC}"
echo ""

# Step 3: Start backend services
echo -e "${GREEN}[3/5] Starting backend services...${NC}"

for svc in "${SERVICES[@]}"; do
    compose_file="$SERVICES_DIR/3-backend/docker-compose.${svc}.yml"
    if [ -f "$compose_file" ]; then
        echo "  → Starting ${svc} service..."
        docker compose --env-file .env -f "$compose_file" up -d
    else
        echo -e "  ${YELLOW}⚠ Compose file not found: $compose_file${NC}"
    fi
done

# Wait for service volumes to be created before starting Nginx
sleep 5

# Start Nginx if any Laravel service is selected
if needs_nginx; then
    echo "  → Starting Nginx (reverse proxy for Laravel services)..."
    docker compose -f "$SERVICES_DIR/3-backend/docker-compose.nginx.yml" up -d 2>/dev/null || {
        echo -e "  ${YELLOW}  Retrying Nginx startup...${NC}"
        sleep 5
        docker compose -f "$SERVICES_DIR/3-backend/docker-compose.nginx.yml" up -d
    }
fi

echo -e "  ${GREEN}✓ Backend services started${NC}"
echo ""

# Step 4: Start frontend (Docker mode)
if [ "$BUILD_FRONTEND" = true ]; then
    echo -e "${GREEN}[4/5] Starting frontend (Docker)...${NC}"

    # Set API URLs for direct access (tanpa Kong)
    export NEXT_PUBLIC_API_URL=http://localhost:8081
    export NEXT_PUBLIC_AUTH_API_URL=http://localhost:8081/api/v1
    export NEXT_PUBLIC_PUBLIC_API_URL=http://localhost:8082/api/v1
    export NEXT_PUBLIC_SISTER_API_URL=http://localhost:8083
    export NEXT_PUBLIC_FEEDER_API_URL=http://localhost:8084
    export NEXT_PUBLIC_MYUNILA_API_URL=http://localhost:8086
    export NEXT_PUBLIC_KEUANGAN_API_URL=http://localhost:8088
    export NEXT_PUBLIC_DASHBOARD_API_URL=http://localhost:8087/api/v1

    echo "  → Building frontend with direct API URLs (tanpa Kong)..."
    docker compose --env-file .env -f "$SERVICES_DIR/4-frontend/docker-compose.yml" up -d --build

    echo -e "  ${GREEN}✓ Frontend started${NC}"
else
    echo -e "${YELLOW}[4/5] Skipping frontend Docker (--no-frontend)${NC}"
    echo -e "  Jalankan frontend manual: cd frontend && npm run dev"
fi
echo ""

# Step 5: Wait and show status
echo -e "${GREEN}[5/5] Waiting for services to stabilize...${NC}"
sleep 10

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Container Status${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""
docker ps --filter "name=myunila" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Deployment Complete! (Tanpa Kong)${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Access Points:${NC}"
if [ "$BUILD_FRONTEND" = true ]; then
    echo "  Frontend:          http://localhost:3000"
fi
for svc in "${SERVICES[@]}"; do
    case $svc in
        auth)      echo "  Auth Service:      http://localhost:8081" ;;
        public)    echo "  Public Service:    http://localhost:8082" ;;
        sister)    echo "  Sister Service:    http://localhost:8083" ;;
        feeder)    echo "  Feeder Service:    http://localhost:8084" ;;
        api)       echo "  API Service:       http://localhost:8085" ;;
        myunila)   echo "  MyUnila Service:   http://localhost:8086" ;;
        dashboard) echo "  Dashboard Service: http://localhost:8087" ;;
        keuangan)  echo "  Keuangan Service:  http://localhost:8088" ;;
    esac
done
echo "  Redis:             localhost:6379"
echo ""

echo -e "${YELLOW}Test Health:${NC}"
for svc in "${SERVICES[@]}"; do
    case $svc in
        auth)      echo "  curl http://localhost:8081/api/health" ;;
        public)    echo "  curl http://localhost:8082/api/health" ;;
        sister)    echo "  curl http://localhost:8083/health" ;;
        feeder)    echo "  curl http://localhost:8084/health" ;;
        api)       echo "  curl http://localhost:8085/health" ;;
        myunila)   echo "  curl http://localhost:8086/health" ;;
        dashboard) echo "  curl http://localhost:8087/api/health" ;;
        keuangan)  echo "  curl http://localhost:8088/health" ;;
    esac
done
echo ""

if [ "$BUILD_FRONTEND" = false ]; then
    echo -e "${YELLOW}Frontend (manual):${NC}"
    echo "  cd frontend"
    echo "  cp .env.local.example .env.local   # (sekali saja)"
    echo "  npm install                         # (sekali saja)"
    echo "  npm run dev"
    echo ""
fi

echo -e "${YELLOW}Stop semua:${NC}"
echo "  bash deploy-minimal.sh --stop"
echo ""

# Check for unhealthy services
UNHEALTHY=$(docker ps --filter "name=myunila" --filter "health=unhealthy" --format "{{.Names}}" 2>/dev/null)
if [ -n "$UNHEALTHY" ]; then
    echo -e "${RED}⚠ Warning: Some services are unhealthy:${NC}"
    echo "$UNHEALTHY" | while read name; do echo "  - $name"; done
    echo ""
    echo "Check logs: docker logs <container-name> --tail 50"
    echo ""
fi

echo -e "${GREEN}Done!${NC}"
