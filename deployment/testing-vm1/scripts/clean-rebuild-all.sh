#!/bin/bash

###############################################################################
# Clean and Rebuild All Services from Scratch
# Remove all containers, images, and volumes, then rebuild everything
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${RED}=========================================${NC}"
echo -e "${RED}  CLEAN & REBUILD ALL SERVICES${NC}"
echo -e "${RED}  This will remove ALL containers, images${NC}"
echo -e "${RED}  and volumes for MyUnila services!${NC}"
echo -e "${RED}=========================================${NC}"
echo ""

read -p "Are you sure? This will DELETE everything! (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 1
fi

REPO_DIR="/var/www/my-unila"
DEPLOYMENT_DIR="$REPO_DIR/deployment/testing-vm1"

# Step 1: Pull latest code
echo ""
echo -e "${GREEN}[1/8] Pulling latest code...${NC}"
cd "$REPO_DIR"
git pull
echo ""

# Step 2: Update environment variables
echo -e "${GREEN}[2/8] Updating environment variables...${NC}"
cd "$DEPLOYMENT_DIR/scripts"
./update-dashboard-env.sh 2>&1 | grep -E "✓|Updated|Added" || true
./update-auth-env.sh 2>&1 | grep -E "✓|Updated|Added" || true
./update-sister-env.sh 2>&1 | grep -E "✓|Updated|Added" || true

# Fix Sister DB variables (remove ${} references)
cd "$DEPLOYMENT_DIR"
sed -i '/^SISTER_DB_HOST=\${DB_MSSQL_HOST}/d' .env
sed -i '/^SISTER_DB_PORT=\${DB_MSSQL_PORT}/d' .env
sed -i '/^SISTER_DB_USERNAME=\${DB_MSSQL_USERNAME}/d' .env
sed -i '/^SISTER_DB_PASSWORD=\${DB_MSSQL_PASSWORD}/d' .env
sed -i '/^SISTER_DB_DATABASE=\${DB_MSSQL_DATABASE}/d' .env

# Add Meilisearch key if not exists
if ! grep -q "^MEILISEARCH_KEY=" .env; then
    echo "MEILISEARCH_KEY=masterKey1234567890ABCDEF" >> .env
fi

echo ""

# Step 3: Stop all services
echo -e "${GREEN}[3/8] Stopping all services...${NC}"
docker compose -f "$DEPLOYMENT_DIR/services/4-frontend/docker-compose.frontend.yml" down 2>/dev/null || true
docker compose -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.nginx.yml" down 2>/dev/null || true
docker compose --env-file "$DEPLOYMENT_DIR/.env" -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.sister.yml" down 2>/dev/null || true
docker compose --env-file "$DEPLOYMENT_DIR/.env" -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.auth.yml" down 2>/dev/null || true
docker compose --env-file "$DEPLOYMENT_DIR/.env" -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.dashboard.yml" down 2>/dev/null || true
docker compose -f "$DEPLOYMENT_DIR/services/2-gateway/docker-compose.kong.yml" down 2>/dev/null || true
docker compose --env-file "$DEPLOYMENT_DIR/.env" -f "$DEPLOYMENT_DIR/services/1-infrastructure/docker-compose.meilisearch.yml" down 2>/dev/null || true
docker compose -f "$DEPLOYMENT_DIR/services/1-infrastructure/docker-compose.redis.yml" down 2>/dev/null || true
echo ""

# Step 4: Remove all MyUnila containers
echo -e "${GREEN}[4/8] Removing all MyUnila containers...${NC}"
docker ps -a --filter "name=myunila" --format "{{.Names}}" | xargs -r docker rm -f
echo ""

# Step 5: Remove all MyUnila images
echo -e "${GREEN}[5/8] Removing all MyUnila images...${NC}"
docker images --filter "reference=myunila/*" --format "{{.Repository}}:{{.Tag}}" | xargs -r docker rmi -f
echo ""

# Step 6: Remove all MyUnila volumes (OPTIONAL - comment out if you want to keep data)
echo -e "${YELLOW}[6/8] Removing all MyUnila volumes...${NC}"
read -p "Remove volumes (data will be lost)? (yes/no): " remove_volumes
if [ "$remove_volumes" == "yes" ]; then
    docker volume ls --filter "name=myunila" --format "{{.Name}}" | xargs -r docker volume rm
    echo "✓ Volumes removed"
else
    echo "✓ Volumes kept"
fi
echo ""

# Step 7: Rebuild all images
echo -e "${GREEN}[7/8] Rebuilding all images from scratch (this will take 5-10 minutes)...${NC}"
echo ""

cd "$DEPLOYMENT_DIR"

echo "  → Building Dashboard Service..."
docker compose --env-file .env -f services/3-backend/docker-compose.dashboard.yml build --no-cache --pull dashboard-service
echo ""

echo "  → Building Auth Service..."
docker compose --env-file .env -f services/3-backend/docker-compose.auth.yml build --no-cache --pull auth-service
echo ""

echo "  → Building Sister Service..."
docker compose --env-file .env -f services/3-backend/docker-compose.sister.yml build --no-cache --pull sister-service
echo ""

echo "  → Building Frontend Service..."
docker compose -f services/4-frontend/docker-compose.frontend.yml build --no-cache --pull 2>/dev/null || echo "Frontend build skipped (image-based)"
echo ""

echo -e "${GREEN}✓ All images rebuilt${NC}"
echo ""

# Step 8: Start all services
echo -e "${GREEN}[8/8] Starting all services...${NC}"
echo ""

echo "  → Starting Redis..."
docker compose -f services/1-infrastructure/docker-compose.redis.yml up -d
sleep 3

echo "  → Starting Meilisearch..."
docker compose --env-file .env -f services/1-infrastructure/docker-compose.meilisearch.yml up -d
sleep 5

echo "  → Starting Kong Gateway..."
docker compose -f services/2-gateway/docker-compose.kong.yml up -d
sleep 10

echo "  → Starting Dashboard Service..."
docker compose --env-file .env -f services/3-backend/docker-compose.dashboard.yml up -d

echo "  → Starting Auth Service..."
docker compose --env-file .env -f services/3-backend/docker-compose.auth.yml up -d

echo "  → Starting Sister Service..."
docker compose --env-file .env -f services/3-backend/docker-compose.sister.yml up -d

echo "  → Starting Nginx..."
docker compose -f services/3-backend/docker-compose.nginx.yml up -d

sleep 5

echo "  → Starting Frontend..."
docker compose -f services/4-frontend/docker-compose.frontend.yml up -d

echo ""
echo -e "${GREEN}✓ All services started${NC}"
echo ""

# Wait for services
echo "Waiting 20 seconds for all services to stabilize..."
sleep 20

# Show status
echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Container Status${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
docker ps --filter "name=myunila" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | head -20

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Clean Rebuild Complete!${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

echo -e "${YELLOW}Access Points:${NC}"
echo "  Frontend:      http://192.168.123.172:3000"
echo "  Kong Gateway:  http://192.168.123.172:9800"
echo "  Dashboard API: http://192.168.123.172:9800/dashboard-service/api/health"
echo "  Auth API:      http://192.168.123.172:9800/auth-service/api/health"
echo "  Sister API:    http://192.168.123.172:9800/sister-service/health"
echo "  Meilisearch:   http://192.168.123.172:7700"
echo ""

# Check for unhealthy services
UNHEALTHY=$(docker ps --filter "name=myunila" --filter "health=unhealthy" --format "{{.Names}}" | wc -l)
if [ "$UNHEALTHY" -gt 0 ]; then
    echo -e "${RED}⚠ Warning: Some services are unhealthy${NC}"
    docker ps --filter "name=myunila" --filter "health=unhealthy" --format "  - {{.Names}}: {{.Status}}"
    echo ""
fi

echo -e "${YELLOW}Check logs:${NC}"
echo "  docker logs myunila-dashboard-service --tail 50"
echo "  docker logs myunila-auth-service --tail 50"
echo "  docker logs myunila-sister-service --tail 50"
echo "  docker logs myunila-frontend --tail 50"
echo "  docker logs myunila-meilisearch --tail 50"
echo ""
