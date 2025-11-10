#!/bin/bash

###############################################################################
# Rebuild All MyUnila Services
# Pull latest code, rebuild all Docker images, and restart services
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Rebuild All MyUnila Services${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

REPO_DIR="/var/www/my-unila"
DEPLOYMENT_DIR="$REPO_DIR/deployment/testing-vm1"

# Step 1: Pull latest code
echo -e "${GREEN}[1/6] Pulling latest code from repository...${NC}"
echo ""
cd "$REPO_DIR"
git pull
echo ""

# Step 2: Update environment variables
echo -e "${GREEN}[2/6] Updating environment variables...${NC}"
echo ""
cd "$DEPLOYMENT_DIR/scripts"

echo "  → Updating Dashboard environment..."
./update-dashboard-env.sh 2>&1 | grep -E "✓|Updated|Added" || true

echo "  → Updating Auth environment..."
./update-auth-env.sh 2>&1 | grep -E "✓|Updated|Added" || true

echo "  → Updating Sister environment..."
./update-sister-env.sh 2>&1 | grep -E "✓|Updated|Added" || true

echo "  → Updating Frontend environment..."
./update-frontend-env.sh 2>&1 | grep -E "✓|Updated|Added" || true

echo ""

# Step 3: Stop all services
echo -e "${GREEN}[3/6] Stopping all services...${NC}"
echo ""

docker compose -f "$DEPLOYMENT_DIR/services/4-frontend/docker-compose.frontend.yml" down 2>/dev/null || true
docker compose -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.nginx.yml" down 2>/dev/null || true
docker compose -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.sister.yml" down 2>/dev/null || true
docker compose -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.auth.yml" down 2>/dev/null || true
docker compose -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.dashboard.yml" down 2>/dev/null || true
docker compose -f "$DEPLOYMENT_DIR/services/2-gateway/docker-compose.kong.yml" down 2>/dev/null || true
docker compose -f "$DEPLOYMENT_DIR/services/1-infrastructure/docker-compose.meilisearch.yml" down 2>/dev/null || true
docker compose -f "$DEPLOYMENT_DIR/services/1-infrastructure/docker-compose.redis.yml" down 2>/dev/null || true

echo -e "${GREEN}✓ All services stopped${NC}"
echo ""

# Step 4: Rebuild images
echo -e "${GREEN}[4/6] Rebuilding Docker images (this may take 5-10 minutes)...${NC}"
echo ""

echo "  → Rebuilding Dashboard Service..."
cd "$DEPLOYMENT_DIR/services/3-backend"
docker compose -f docker-compose.dashboard.yml build --no-cache dashboard-service
echo ""

echo "  → Rebuilding Auth Service..."
docker compose -f docker-compose.auth.yml build --no-cache auth-service
echo ""

echo "  → Rebuilding Sister Service..."
docker compose -f docker-compose.sister.yml build --no-cache sister-service
echo ""

echo "  → Rebuilding Frontend Service..."
cd "$DEPLOYMENT_DIR"
docker compose --env-file .env -f services/4-frontend/docker-compose.frontend.yml build --no-cache frontend
echo ""

echo -e "${GREEN}✓ All images rebuilt${NC}"
echo ""

# Step 5: Start all services
echo -e "${GREEN}[5/6] Starting all services in correct order...${NC}"
echo ""

echo "  → Starting Redis..."
docker compose -f "$DEPLOYMENT_DIR/services/1-infrastructure/docker-compose.redis.yml" up -d
sleep 3

echo "  → Starting Meilisearch..."
docker compose -f "$DEPLOYMENT_DIR/services/1-infrastructure/docker-compose.meilisearch.yml" up -d
sleep 5

echo "  → Starting Kong Gateway..."
docker compose -f "$DEPLOYMENT_DIR/services/2-gateway/docker-compose.kong.yml" up -d
sleep 10

echo "  → Starting Dashboard Service..."
docker compose -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.dashboard.yml" up -d

echo "  → Starting Auth Service..."
docker compose -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.auth.yml" up -d

echo "  → Starting Sister Service..."
docker compose -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.sister.yml" up -d

echo "  → Starting Nginx..."
docker compose -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.nginx.yml" up -d

sleep 5

echo "  → Starting Frontend..."
docker compose --env-file "$DEPLOYMENT_DIR/.env" -f "$DEPLOYMENT_DIR/services/4-frontend/docker-compose.frontend.yml" up -d

echo ""
echo -e "${GREEN}✓ All services started${NC}"
echo ""

# Wait for services to stabilize
echo "Waiting 15 seconds for all services to stabilize..."
sleep 15

# Step 6: Verify services
echo -e "${GREEN}[6/6] Verifying services...${NC}"
echo ""

echo -e "${BLUE}Container Status:${NC}"
docker ps --filter "name=myunila" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | head -20

echo ""
echo -e "${BLUE}Testing Endpoints:${NC}"
echo ""

# Test Dashboard
DASHBOARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health 2>/dev/null || echo "000")
if [ "$DASHBOARD_STATUS" = "200" ]; then
    echo -e "  Dashboard API: ${GREEN}✓ 200 OK${NC}"
else
    echo -e "  Dashboard API: ${RED}✗ $DASHBOARD_STATUS${NC}"
fi

# Test Auth
AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health 2>/dev/null || echo "000")
if [ "$AUTH_STATUS" = "200" ]; then
    echo -e "  Auth API:      ${GREEN}✓ 200 OK${NC}"
else
    echo -e "  Auth API:      ${RED}✗ $AUTH_STATUS${NC}"
fi

# Test Sister
SISTER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://192.168.123.172:8083/health 2>/dev/null || echo "000")
if [ "$SISTER_STATUS" = "200" ]; then
    echo -e "  Sister API:    ${GREEN}✓ 200 OK${NC}"
else
    echo -e "  Sister API:    ${RED}✗ $SISTER_STATUS${NC}"
fi

# Test Frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://192.168.123.172:3000 2>/dev/null || echo "000")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "  Frontend:      ${GREEN}✓ 200 OK${NC}"
else
    echo -e "  Frontend:      ${RED}✗ $FRONTEND_STATUS${NC}"
fi

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Rebuild Complete!${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

echo -e "${YELLOW}Access Points:${NC}"
echo "  Frontend:      http://192.168.123.172:3000"
echo "  Kong Gateway:  http://192.168.123.172:9800"
echo "  Dashboard API: http://192.168.123.172:9800/dashboard-service/api/health"
echo "  Auth API:      http://192.168.123.172:9800/auth-service/api/health"
echo "  Sister API:    http://192.168.123.172:9800/sister-service/health"
echo ""

echo -e "${YELLOW}Check Logs:${NC}"
echo "  docker logs myunila-dashboard-service --tail 50"
echo "  docker logs myunila-auth-service --tail 50"
echo "  docker logs myunila-sister-service --tail 50"
echo "  docker logs myunila-frontend --tail 50"
echo ""

# Check if any services are unhealthy
UNHEALTHY=$(docker ps --filter "name=myunila" --filter "health=unhealthy" --format "{{.Names}}" | wc -l)
if [ "$UNHEALTHY" -gt 0 ]; then
    echo -e "${RED}⚠ Warning: Some services are unhealthy${NC}"
    docker ps --filter "name=myunila" --filter "health=unhealthy" --format "  - {{.Names}}: {{.Status}}"
    echo ""
    echo -e "${YELLOW}Run diagnostics:${NC}"
    echo "  cd /var/www/my-unila/deployment/testing-vm1/scripts"
    echo "  ./diagnose-all-services.sh"
    echo ""
fi
