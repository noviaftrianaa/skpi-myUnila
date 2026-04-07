#!/bin/bash

###############################################################################
# VM2 - Deploy Backend Services 1 (Public + Auth + Dashboard)
# Server: 192.168.120.42
# User: mybackend1
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_DIR="/var/www/my-unila"
DEPLOY_DIR="$APP_DIR/deployment/production/vm2-backend1"

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Deploy Backend Services - VM2${NC}"
echo -e "${BLUE}  Public + Auth + Dashboard${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Step 1: Pull latest code
echo -e "${GREEN}[1/7] Pulling latest code...${NC}"
cd "$APP_DIR"
git pull
echo ""

# Step 2: Check .env file
echo -e "${GREEN}[2/7] Checking environment file...${NC}"
if [ ! -f "$DEPLOY_DIR/.env" ]; then
    echo -e "${YELLOW}  .env not found, copying from .env.example${NC}"
    cp "$DEPLOY_DIR/.env.example" "$DEPLOY_DIR/.env"
    echo -e "${RED}  Please update .env with your configuration!${NC}"
    exit 1
fi
echo -e "  ✓ .env file exists"
echo ""

# Step 3: Create Docker network
echo -e "${GREEN}[3/7] Creating Docker network...${NC}"
docker network create myunila-prod-network 2>/dev/null || echo "  Network already exists"
echo ""

# Step 4: Build services
echo -e "${GREEN}[4/7] Building services...${NC}"
cd "$DEPLOY_DIR"

echo "  → Building Public Service..."
docker compose --env-file .env -f services/public/docker-compose.yml build --no-cache public-service
echo ""

echo "  → Building Auth Service..."
docker compose --env-file .env -f services/auth/docker-compose.yml build --no-cache auth-service
echo ""

echo "  → Building Dashboard Service..."
docker compose --env-file .env -f services/dashboard/docker-compose.yml build --no-cache dashboard-service
echo ""

# Step 5: Stop old containers
echo -e "${GREEN}[5/7] Stopping old containers...${NC}"
docker compose --env-file .env -f services/nginx/docker-compose.yml down 2>/dev/null || true
docker compose --env-file .env -f services/public/docker-compose.yml down 2>/dev/null || true
docker compose --env-file .env -f services/auth/docker-compose.yml down 2>/dev/null || true
docker compose --env-file .env -f services/dashboard/docker-compose.yml down 2>/dev/null || true
echo ""

# Step 6: Start services
echo -e "${GREEN}[6/7] Starting services...${NC}"

echo "  → Starting Public Service..."
docker compose --env-file .env -f services/public/docker-compose.yml up -d
sleep 5

echo "  → Starting Auth Service..."
docker compose --env-file .env -f services/auth/docker-compose.yml up -d
sleep 5

echo "  → Starting Dashboard Service..."
docker compose --env-file .env -f services/dashboard/docker-compose.yml up -d
sleep 5

echo "  → Starting Nginx..."
docker compose --env-file .env -f services/nginx/docker-compose.yml up -d
sleep 3

echo ""

# Step 7: Check status
echo -e "${GREEN}[7/7] Checking services status...${NC}"
echo ""
docker ps --filter "name=myunila" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

echo -e "${YELLOW}Service URLs:${NC}"
echo "  Auth Service:      http://192.168.120.42:8081"
echo "  Public Service:    http://192.168.120.42:8082"
echo "  Dashboard Service: http://192.168.120.42:8086"
echo ""

echo -e "${YELLOW}Check logs:${NC}"
echo "  docker logs myunila-public-service --tail 50"
echo "  docker logs myunila-auth-service --tail 50"
echo "  docker logs myunila-dashboard-service --tail 50"
echo "  docker logs myunila-nginx-vm2 --tail 50"
echo ""

# Check for unhealthy services
UNHEALTHY=$(docker ps --filter "name=myunila" --filter "health=unhealthy" --format "{{.Names}}" | wc -l)
if [ "$UNHEALTHY" -gt 0 ]; then
    echo -e "${RED}⚠ Warning: Some services are unhealthy${NC}"
    docker ps --filter "name=myunila" --filter "health=unhealthy" --format "  - {{.Names}}: {{.Status}}"
    echo ""
fi
