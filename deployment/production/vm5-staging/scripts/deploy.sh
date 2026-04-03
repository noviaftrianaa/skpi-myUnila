#!/bin/bash

###############################################################################
# MyUnila Staging - Full Deployment Script
# VM5: 192.168.120.45 (All services in one VM)
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Base directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$BASE_DIR/.env"

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  MyUnila Staging - Full Deployment${NC}"
echo -e "${BLUE}  VM5: 192.168.120.45${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Check .env file
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: .env file not found at $ENV_FILE${NC}"
    echo -e "${YELLOW}Copy .env.example to .env and fill in the values:${NC}"
    echo "  cp $BASE_DIR/.env.example $BASE_DIR/.env"
    exit 1
fi

source "$ENV_FILE"

###############################################################################
# Helper Functions
###############################################################################

wait_for_healthy() {
    local container_name=$1
    local max_retries=${2:-30}
    local retry_count=0

    echo -n "  Waiting for $container_name to be healthy"
    while [ $retry_count -lt $max_retries ]; do
        local status=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "not_found")
        if [ "$status" = "healthy" ]; then
            echo -e " ${GREEN}OK${NC}"
            return 0
        fi
        echo -n "."
        retry_count=$((retry_count + 1))
        sleep 3
    done
    echo -e " ${YELLOW}TIMEOUT (container may still be starting)${NC}"
    return 1
}

compose_up() {
    local file=$1
    local dir=$(dirname "$file")
    echo -e "${GREEN}  Starting: $(basename $file)${NC}"
    docker compose --env-file "$ENV_FILE" -f "$file" up -d --build 2>&1 | tail -5
}

compose_up_no_build() {
    local file=$1
    echo -e "${GREEN}  Starting: $(basename $file)${NC}"
    docker compose --env-file "$ENV_FILE" -f "$file" up -d 2>&1 | tail -5
}

###############################################################################
# Step 1: Create Docker Network
###############################################################################

echo -e "${BLUE}[1/8] Creating Docker network...${NC}"
NETWORK_NAME="${NETWORK_NAME:-myunila-staging-network}"
if docker network inspect "$NETWORK_NAME" >/dev/null 2>&1; then
    echo -e "  Network ${GREEN}$NETWORK_NAME${NC} already exists"
else
    docker network create "$NETWORK_NAME"
    echo -e "  Network ${GREEN}$NETWORK_NAME${NC} created"
fi
echo ""

###############################################################################
# Step 2: Start Infrastructure (PostgreSQL, Redis, Meilisearch)
###############################################################################

echo -e "${BLUE}[2/8] Starting infrastructure services...${NC}"
compose_up_no_build "$BASE_DIR/services/infrastructure/docker-compose.postgres.yml"
compose_up_no_build "$BASE_DIR/services/infrastructure/docker-compose.redis.yml"
compose_up_no_build "$BASE_DIR/services/infrastructure/docker-compose.meilisearch.yml"

echo ""
echo -e "${YELLOW}  Waiting for infrastructure to be ready...${NC}"
wait_for_healthy "myunila-kong-postgres-staging" 30
wait_for_healthy "myunila-redis-staging" 15
wait_for_healthy "myunila-meilisearch-staging" 15
echo ""

###############################################################################
# Step 3: Start Kong Gateway
###############################################################################

echo -e "${BLUE}[3/8] Starting Kong Gateway...${NC}"
compose_up_no_build "$BASE_DIR/services/gateway/docker-compose.kong.yml"

echo ""
echo -e "${YELLOW}  Waiting for Kong to be ready...${NC}"
sleep 10
wait_for_healthy "myunila-kong-staging" 60
echo ""

###############################################################################
# Step 4: Build & Start PHP Services
###############################################################################

echo -e "${BLUE}[4/8] Building & starting PHP services...${NC}"
compose_up "$BASE_DIR/services/backend-php/docker-compose.auth.yml"
compose_up "$BASE_DIR/services/backend-php/docker-compose.dashboard.yml"
compose_up "$BASE_DIR/services/backend-php/docker-compose.public.yml"

echo ""
echo -e "${YELLOW}  Waiting for PHP services to be ready...${NC}"
wait_for_healthy "myunila-auth-staging" 60
wait_for_healthy "myunila-dashboard-staging" 60
wait_for_healthy "myunila-public-staging" 60
echo ""

###############################################################################
# Step 5: Start Nginx (reverse proxy for PHP services)
###############################################################################

echo -e "${BLUE}[5/8] Starting Nginx reverse proxy...${NC}"
compose_up_no_build "$BASE_DIR/services/backend-php/docker-compose.nginx.yml"
wait_for_healthy "myunila-nginx-staging" 15
echo ""

###############################################################################
# Step 6: Build & Start Go Services
###############################################################################

echo -e "${BLUE}[6/8] Building & starting Go services...${NC}"
compose_up "$BASE_DIR/services/backend-go/docker-compose.sister.yml"
compose_up "$BASE_DIR/services/backend-go/docker-compose.feeder.yml"
compose_up "$BASE_DIR/services/backend-go/docker-compose.myunila.yml"
compose_up "$BASE_DIR/services/backend-go/docker-compose.api.yml"
compose_up "$BASE_DIR/services/backend-go/docker-compose.keuangan.yml"
compose_up "$BASE_DIR/services/backend-go/docker-compose.monitoring.yml"

echo ""
echo -e "${YELLOW}  Waiting for Go services to be ready...${NC}"
wait_for_healthy "myunila-sister-staging" 60
wait_for_healthy "myunila-feeder-staging" 60
wait_for_healthy "myunila-myunila-staging" 60
wait_for_healthy "myunila-ws-staging" 30
wait_for_healthy "myunila-keuangan-staging" 60
wait_for_healthy "myunila-monitoring-staging" 60
echo ""

###############################################################################
# Step 7: Build & Start Frontend
###############################################################################

echo -e "${BLUE}[7/8] Building & starting Frontend...${NC}"
compose_up "$BASE_DIR/services/frontend/docker-compose.frontend.yml"

echo ""
echo -e "${YELLOW}  Waiting for Frontend to be ready...${NC}"
wait_for_healthy "myunila-frontend-staging" 120
echo ""

###############################################################################
# Step 8: Setup Kong Routes
###############################################################################

echo -e "${BLUE}[8/8] Setting up Kong routes...${NC}"
bash "$SCRIPT_DIR/setup-kong-routes.sh"
echo ""

###############################################################################
# Summary
###############################################################################

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Deployment Summary${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

echo -e "${GREEN}All containers:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "staging|NAMES"

echo ""
echo -e "${GREEN}Service URLs:${NC}"
echo "  Frontend:    http://192.168.120.45:3000"
echo "  Kong Proxy:  http://192.168.120.45:9800"
echo "  Kong Admin:  http://192.168.120.45:9801"
echo ""
echo -e "${GREEN}Health Checks:${NC}"
echo "  Auth:        http://192.168.120.45:8081/health"
echo "  Public:      http://192.168.120.45:8082/health"
echo "  Sister:      http://192.168.120.45:8083/health"
echo "  Feeder:      http://192.168.120.45:8084/health"
echo "  API:         http://192.168.120.45:8085/health"
echo "  MyUnila:     http://192.168.120.45:8086/health"
echo "  Keuangan:    http://192.168.120.45:8088/health"
echo "  Monitoring:  http://192.168.120.45:8089/health"
echo ""
echo -e "${GREEN}Deployment complete!${NC}"
