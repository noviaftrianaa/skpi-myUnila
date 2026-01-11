#!/bin/bash

###############################################################################
# Quick Start untuk Development - Local
# Script ini untuk start semua service tanpa rebuild
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOYMENT_DIR="$SCRIPT_DIR/.."

cd "$DEPLOYMENT_DIR"

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Quick Start - Local Development${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# 1. Infrastructure
echo -e "${GREEN}[1/5] Starting Infrastructure (Redis, Meilisearch)...${NC}"
docker compose --env-file .env -f services/1-infrastructure/docker-compose.redis.yml up -d
docker compose --env-file .env -f services/1-infrastructure/docker-compose.meilisearch.yml up -d

# 2. Kong Gateway
echo -e "${GREEN}[2/5] Starting Kong Gateway...${NC}"
docker compose --env-file .env -f services/2-gateway/docker-compose.kong.yml up -d

# Wait for Kong to be ready
echo "  Waiting for Kong to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:9801 > /dev/null 2>&1; then
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep 2
done

# 3. Backend Services
echo -e "${GREEN}[3/5] Starting Backend Services...${NC}"
docker compose --env-file .env -f services/3-backend/docker-compose.auth.yml up -d
docker compose --env-file .env -f services/3-backend/docker-compose.dashboard.yml up -d
docker compose --env-file .env -f services/3-backend/docker-compose.sister.yml up -d

# 4. Nginx Backend Proxy
echo -e "${GREEN}[4/5] Starting Nginx Backend Proxy...${NC}"
docker compose --env-file .env -f services/3-backend/docker-compose.nginx.yml up -d

# 5. Setup Kong Routes
echo -e "${GREEN}[5/5] Setting up Kong Routes...${NC}"
sleep 3  # Wait a bit for services to be ready
bash scripts/setup-kong-routes.sh

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  All Services Started!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

# Show container status
echo -e "${YELLOW}Container Status:${NC}"
docker ps --filter "name=myunila" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo -e "${YELLOW}Available Endpoints:${NC}"
echo "  Frontend (Next.js): http://localhost:3000"
echo "  Kong Gateway:       http://localhost:9800"
echo "  Kong Admin:         http://localhost:9801"
echo "  Kong UI:            http://localhost:9803"
echo "  Auth Service:       http://localhost:8081"
echo "  Dashboard Service:  http://localhost:8082"
echo "  Sister Service:     http://localhost:8083"
echo "  Redis:              localhost:6379"
echo "  Meilisearch:        http://localhost:7700"
echo ""

echo -e "${YELLOW}API via Kong Gateway:${NC}"
echo "  Dashboard: http://localhost:9800/dashboard-service/public/api/v1"
echo "  Auth:      http://localhost:9800/auth-service/api/v1"
echo "  Sister:    http://localhost:9800/sister-service"
echo ""
