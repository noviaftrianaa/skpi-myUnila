#!/bin/bash

###############################################################################
# VM1 - Deploy Frontend & Kong Gateway
# Server: 192.168.120.41
# User: myfrontend
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_DIR="/var/www/my-unila"
DEPLOY_DIR="$APP_DIR/deployment/production/vm1-frontend-kong"

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Deploy Frontend & Kong - VM1${NC}"
echo -e "${BLUE}  Kong Gateway + Frontend + PostgreSQL${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Step 1: Pull latest code
echo -e "${GREEN}[1/8] Pulling latest code...${NC}"
cd "$APP_DIR"
git pull
echo ""

# Step 2: Check .env file
echo -e "${GREEN}[2/8] Checking environment file...${NC}"
if [ ! -f "$DEPLOY_DIR/.env" ]; then
    echo -e "${YELLOW}  .env not found, copying from .env.example${NC}"
    cp "$DEPLOY_DIR/.env.example" "$DEPLOY_DIR/.env"
    echo -e "${RED}  Please update .env with your configuration!${NC}"
    exit 1
fi
echo -e "  ✓ .env file exists"
echo ""

# Step 3: Create Docker network
echo -e "${GREEN}[3/8] Creating Docker network...${NC}"
docker network create myunila-prod-network 2>/dev/null || echo "  Network already exists"
echo ""

# Step 4: Stop old containers
echo -e "${GREEN}[4/8] Stopping old containers...${NC}"
cd "$DEPLOY_DIR"
docker compose -f services/frontend/docker-compose.yml down 2>/dev/null || true
docker compose -f services/kong/docker-compose.yml down 2>/dev/null || true
docker compose -f services/postgres/docker-compose.yml down 2>/dev/null || true
echo ""

# Step 5: Start PostgreSQL
echo -e "${GREEN}[5/8] Starting PostgreSQL...${NC}"
docker compose -f services/postgres/docker-compose.yml up -d
echo "  Waiting for PostgreSQL to be ready..."
sleep 10
echo ""

# Step 6: Start Kong
echo -e "${GREEN}[6/8] Starting Kong Gateway...${NC}"
docker compose -f services/kong/docker-compose.yml up -d
echo "  Waiting for Kong to be ready..."
sleep 15
echo ""

# Step 7: Setup Kong routes
echo -e "${GREEN}[7/8] Setting up Kong routes...${NC}"
cd scripts
chmod +x setup-kong-routes.sh
./setup-kong-routes.sh
cd "$DEPLOY_DIR"
echo ""

# Step 8: Start Frontend
echo -e "${GREEN}[8/8] Starting Frontend...${NC}"
docker compose -f services/frontend/docker-compose.yml build --no-cache frontend
docker compose -f services/frontend/docker-compose.yml up -d
sleep 5
echo ""

# Check status
echo -e "${GREEN}Checking services status...${NC}"
echo ""
docker ps --filter "name=myunila" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

echo -e "${YELLOW}Service URLs:${NC}"
echo "  Kong Gateway Proxy: http://192.168.120.41:9800"
echo "  Kong Admin API:     http://192.168.120.41:9801"
echo "  Frontend:           http://192.168.120.41:3000"
echo ""

echo -e "${YELLOW}API Routes (via Kong):${NC}"
echo "  Dashboard (public):    http://192.168.120.41:9800/dashboard-service/public/api/v1"
echo "  Dashboard (protected): http://192.168.120.41:9800/dashboard-service/api/v1"
echo "  Auth Service:          http://192.168.120.41:9800/auth-service/api/v1"
echo "  Sister Service:        http://192.168.120.41:9800/sister-service/api/v1"
echo ""

echo -e "${YELLOW}External Services (192.168.123.190):${NC}"
echo "  Redis:              192.168.123.190:6379"
echo "  Meilisearch:        http://192.168.123.190:7700"
echo "  SQL Server:         192.168.123.190:1433"
echo ""

echo -e "${YELLOW}Check logs:${NC}"
echo "  docker logs myunila-kong --tail 50"
echo "  docker logs myunila-frontend-service --tail 50"
echo "  docker logs myunila-kong-postgres --tail 50"
echo ""

# Check for unhealthy services
UNHEALTHY=$(docker ps --filter "name=myunila" --filter "health=unhealthy" --format "{{.Names}}" | wc -l)
if [ "$UNHEALTHY" -gt 0 ]; then
    echo -e "${RED}⚠ Warning: Some services are unhealthy${NC}"
    docker ps --filter "name=myunila" --filter "health=unhealthy" --format "  - {{.Names}}: {{.Status}}"
    echo ""
fi
