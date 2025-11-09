#!/bin/bash

###############################################################################
# Restart All MyUnila Services
# Stops and starts all Docker containers in correct order
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Restart All MyUnila Services${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

DEPLOYMENT_DIR="/var/www/my-unila/deployment/testing-vm1"

# Stop all services (reverse order)
echo -e "${YELLOW}[1/2] Stopping all services...${NC}"
echo ""

echo "  → Stopping Frontend..."
docker compose -f "$DEPLOYMENT_DIR/services/4-frontend/docker-compose.frontend.yml" down 2>/dev/null || true

echo "  → Stopping Nginx..."
docker compose -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.nginx.yml" down 2>/dev/null || true

echo "  → Stopping Sister Service..."
docker compose -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.sister.yml" down 2>/dev/null || true

echo "  → Stopping Auth Service..."
docker compose -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.auth.yml" down 2>/dev/null || true

echo "  → Stopping Dashboard Service..."
docker compose -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.dashboard.yml" down 2>/dev/null || true

echo "  → Stopping Kong Gateway..."
docker compose -f "$DEPLOYMENT_DIR/services/2-gateway/docker-compose.kong.yml" down 2>/dev/null || true

echo "  → Stopping Meilisearch..."
docker compose -f "$DEPLOYMENT_DIR/services/1-infrastructure/docker-compose.meilisearch.yml" down 2>/dev/null || true

echo "  → Stopping Redis..."
docker compose -f "$DEPLOYMENT_DIR/services/1-infrastructure/docker-compose.redis.yml" down 2>/dev/null || true

echo ""
echo -e "${GREEN}✓ All services stopped${NC}"
echo ""

# Start all services (correct order)
echo -e "${YELLOW}[2/2] Starting all services...${NC}"
echo ""

echo "  → Starting Redis..."
docker compose -f "$DEPLOYMENT_DIR/services/1-infrastructure/docker-compose.redis.yml" up -d
echo "     Waiting 3 seconds for Redis to be ready..."
sleep 3

echo "  → Starting Meilisearch..."
docker compose -f "$DEPLOYMENT_DIR/services/1-infrastructure/docker-compose.meilisearch.yml" up -d
echo "     Waiting 5 seconds for Meilisearch to be ready..."
sleep 5

echo "  → Starting Kong Gateway..."
docker compose -f "$DEPLOYMENT_DIR/services/2-gateway/docker-compose.kong.yml" up -d
echo "     Waiting 10 seconds for Kong to be ready..."
sleep 10

echo "  → Starting Dashboard Service..."
docker compose -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.dashboard.yml" up -d

echo "  → Starting Auth Service..."
docker compose -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.auth.yml" up -d

echo "  → Starting Sister Service..."
docker compose -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.sister.yml" up -d

echo "  → Starting Nginx..."
docker compose -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.nginx.yml" up -d

echo "     Waiting 5 seconds for backend services to be ready..."
sleep 5

echo "  → Starting Frontend..."
docker compose -f "$DEPLOYMENT_DIR/services/4-frontend/docker-compose.frontend.yml" up -d

echo ""
echo -e "${GREEN}✓ All services started${NC}"
echo ""

# Wait for services to stabilize
echo "Waiting 10 seconds for all services to stabilize..."
sleep 10

# Show status
echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Container Status${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
docker ps --filter "name=myunila" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | head -20

echo ""
echo -e "${GREEN}✓ All services restarted successfully!${NC}"
echo ""
echo -e "${YELLOW}Test endpoints:${NC}"
echo "  Dashboard API: curl http://192.168.123.172:9800/dashboard-service/api/health"
echo "  Auth API:      curl http://192.168.123.172:9800/auth-service/api/health"
echo "  Sister API:    curl http://192.168.123.172:9800/sister-service/health"
echo "  Frontend:      curl http://192.168.123.172:3000"
echo ""
