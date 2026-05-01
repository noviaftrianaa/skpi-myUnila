#!/bin/bash

###############################################################################
# VM3 - Deploy Backend Services 2
# Server: 192.168.120.43
# User: mybackend2
# Services: Sister + Feeder + MyUnila + API + Keuangan + Monitoring
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_DIR="/var/www/my-unila"
DEPLOY_DIR="$APP_DIR/deployment/production/vm3-backend2"

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Deploy Backend Services - VM3${NC}"
echo -e "${BLUE}  Sister + Feeder + MyUnila + API + Monitoring${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Step 1: Pull latest code
echo -e "${GREEN}[1/6] Pulling latest code...${NC}"
cd "$APP_DIR"
git pull
echo ""

# Step 2: Check .env file
echo -e "${GREEN}[2/6] Checking environment file...${NC}"
if [ ! -f "$DEPLOY_DIR/.env" ]; then
    echo -e "${YELLOW}  .env not found, copying from .env.example${NC}"
    cp "$DEPLOY_DIR/.env.example" "$DEPLOY_DIR/.env"
    echo -e "${RED}  Please update .env with your configuration!${NC}"
    exit 1
fi
echo -e "  ✓ .env file exists"
echo ""

# Step 3: Create Docker network
echo -e "${GREEN}[3/6] Creating Docker network...${NC}"
docker network create myunila-prod-network 2>/dev/null || echo "  Network already exists"
echo ""

# Step 4: Build Services
echo -e "${GREEN}[4/6] Building Services...${NC}"
cd "$DEPLOY_DIR"

echo "  → Building Sister Service..."
docker compose --env-file .env -f services/sister/docker-compose.yml build --no-cache sister-service
echo ""

echo "  → Building Feeder Service..."
docker compose --env-file .env -f services/feeder/docker-compose.yml build --no-cache feeder-service
echo ""

echo "  → Building API Service..."
docker compose --env-file .env -f services/api/docker-compose.yml build --no-cache api-service
echo ""

echo "  → Building MyUnila Service..."
docker compose --env-file .env -f services/myunila/docker-compose.yml build --no-cache myunila-service
echo ""

echo "  → Building Monitoring Service..."
docker compose --env-file .env -f services/monitoring/docker-compose.yml build --no-cache monitoring-service
echo ""

echo "  → Building Manajemen Konten Service..."
docker compose --env-file .env -f services/man-konten/docker-compose.yml build --no-cache manajemen-konten-service
echo ""

# Step 5: Stop old containers
echo -e "${GREEN}[5/6] Stopping old containers...${NC}"
docker compose --env-file .env -f services/sister/docker-compose.yml down 2>/dev/null || true
docker compose --env-file .env -f services/feeder/docker-compose.yml down 2>/dev/null || true
docker compose --env-file .env -f services/api/docker-compose.yml down 2>/dev/null || true
docker compose --env-file .env -f services/myunila/docker-compose.yml down 2>/dev/null || true
docker compose --env-file .env -f services/monitoring/docker-compose.yml down 2>/dev/null || true
docker compose --env-file .env -f services/man-konten/docker-compose.yml down 2>/dev/null || true
echo ""

# Step 6: Start Services
echo -e "${GREEN}[6/6] Starting Services...${NC}"

echo "  → Starting Sister Service..."
docker compose --env-file .env -f services/sister/docker-compose.yml up -d
sleep 5

echo "  → Starting Feeder Service..."
docker compose --env-file .env -f services/feeder/docker-compose.yml up -d
sleep 5

echo "  → Starting API Service..."
docker compose --env-file .env -f services/api/docker-compose.yml up -d
sleep 5

echo "  → Starting MyUnila Service..."
docker compose --env-file .env -f services/myunila/docker-compose.yml up -d
sleep 5

echo "  → Starting Monitoring Service..."
docker compose --env-file .env -f services/monitoring/docker-compose.yml up -d
sleep 5

echo "  → Starting Manajemen Konten Service..."
docker compose --env-file .env -f services/man-konten/docker-compose.yml up -d
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
echo "  Sister Service:     http://192.168.120.43:8083"
echo "  Feeder Service:     http://192.168.120.43:8084"
echo "  API Service:        http://192.168.120.43:8085"
echo "  MyUnila Service:    http://192.168.120.43:8086"
echo "  Monitoring Service: http://192.168.120.43:8089"
echo ""

echo -e "${YELLOW}Check logs:${NC}"
echo "  docker logs myunila-sister-service --tail 50"
echo "  docker logs myunila-feeder-service --tail 50"
echo "  docker logs myunila-api-service --tail 50"
echo "  docker logs myunila-service --tail 50"
echo "  docker logs myunila-monitoring-service --tail 50"
echo ""

# Check for unhealthy services
UNHEALTHY=$(docker ps --filter "name=myunila" --filter "health=unhealthy" --format "{{.Names}}" | wc -l)
if [ "$UNHEALTHY" -gt 0 ]; then
    echo -e "${RED}⚠ Warning: Some services are unhealthy${NC}"
    docker ps --filter "name=myunila" --filter "health=unhealthy" --format "  - {{.Names}}: {{.Status}}"
    echo ""
fi

# Auto-cleanup dangling images + build cache (aman, tidak sentuh volume).
# Set REBUILD_NO_CLEANUP=1 untuk skip kalau perlu.
if [ "${REBUILD_NO_CLEANUP:-0}" != "1" ]; then
    echo "🧹 Auto-cleanup dangling images + build cache..."
    docker image prune -f >/dev/null 2>&1 || true
    docker builder prune -f --keep-storage 2GB >/dev/null 2>&1 || true
    echo "  ✓ cleanup selesai (volume tidak disentuh)"
    echo ""
fi

