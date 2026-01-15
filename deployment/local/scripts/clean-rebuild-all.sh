#!/bin/bash

###############################################################################
# Clean and Rebuild All Services from Scratch - LOCAL ENVIRONMENT
# Remove all containers, images, and volumes, then rebuild everything
#
# Usage: bash clean-rebuild-all.sh
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
echo -e "${RED}  LOCAL DEVELOPMENT ENVIRONMENT${NC}"
echo -e "${RED}  This will remove ALL containers, images${NC}"
echo -e "${RED}  and volumes for MyUnila services!${NC}"
echo -e "${RED}=========================================${NC}"
echo ""

read -p "Are you sure? This will DELETE everything! (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 1
fi

# Detect if running in Git Bash on Windows
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows paths (Git Bash format)
    REPO_DIR="/c/laragon/www/my-unila"
else
    # Unix paths
    REPO_DIR=$(cd "$(dirname "$0")/../../.." && pwd)
fi

DEPLOYMENT_DIR="$REPO_DIR/deployment/local"

echo ""
echo -e "${BLUE}Using directories:${NC}"
echo "  Repository:  $REPO_DIR"
echo "  Deployment:  $DEPLOYMENT_DIR"
echo ""

# Step 1: Check environment file
echo -e "${GREEN}[1/7] Checking environment file...${NC}"
if [ ! -f "$DEPLOYMENT_DIR/.env" ]; then
    echo -e "${RED}ERROR: .env file not found at $DEPLOYMENT_DIR/.env${NC}"
    echo "Please create .env file first!"
    exit 1
fi
echo "✓ .env file found"
echo ""

# Step 2: Stop all services
echo -e "${GREEN}[2/8] Stopping all services...${NC}"
docker compose --env-file "$DEPLOYMENT_DIR/.env" -f "$DEPLOYMENT_DIR/services/4-frontend/docker-compose.yml" down 2>/dev/null || true
docker compose -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.nginx.yml" down 2>/dev/null || true
docker compose --env-file "$DEPLOYMENT_DIR/.env" -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.myunila.yml" down 2>/dev/null || true
docker compose --env-file "$DEPLOYMENT_DIR/.env" -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.feeder.yml" down 2>/dev/null || true
docker compose --env-file "$DEPLOYMENT_DIR/.env" -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.sister.yml" down 2>/dev/null || true
docker compose --env-file "$DEPLOYMENT_DIR/.env" -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.executive.yml" down 2>/dev/null || true
docker compose --env-file "$DEPLOYMENT_DIR/.env" -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.auth.yml" down 2>/dev/null || true
docker compose --env-file "$DEPLOYMENT_DIR/.env" -f "$DEPLOYMENT_DIR/services/3-backend/docker-compose.public.yml" down 2>/dev/null || true
docker compose --env-file "$DEPLOYMENT_DIR/.env" -f "$DEPLOYMENT_DIR/services/2-gateway/docker-compose.kong.yml" down 2>/dev/null || true
docker compose --env-file "$DEPLOYMENT_DIR/.env" -f "$DEPLOYMENT_DIR/services/1-infrastructure/docker-compose.meilisearch.yml" down 2>/dev/null || true
docker compose -f "$DEPLOYMENT_DIR/services/1-infrastructure/docker-compose.redis.yml" down 2>/dev/null || true
echo "✓ Services stopped"
echo ""

# Step 3: Remove all MyUnila containers
echo -e "${GREEN}[3/7] Removing all MyUnila containers...${NC}"
CONTAINERS=$(docker ps -a --filter "name=myunila" --format "{{.Names}}")
if [ -n "$CONTAINERS" ]; then
    echo "$CONTAINERS" | xargs docker rm -f
    echo "✓ Containers removed"
else
    echo "✓ No containers to remove"
fi
echo ""

# Step 4: Remove all MyUnila images
echo -e "${GREEN}[4/7] Removing all MyUnila images...${NC}"
IMAGES=$(docker images --filter "reference=myunila/*" --format "{{.Repository}}:{{.Tag}}")
if [ -n "$IMAGES" ]; then
    echo "$IMAGES" | xargs docker rmi -f
    echo "✓ Images removed"
else
    echo "✓ No images to remove"
fi
echo ""

# Step 5: Remove all MyUnila volumes (OPTIONAL)
echo -e "${YELLOW}[5/7] Removing all MyUnila volumes...${NC}"
read -p "Remove volumes (Redis/MeiliSearch data will be lost)? (yes/no): " remove_volumes
if [ "$remove_volumes" == "yes" ]; then
    VOLUMES=$(docker volume ls --filter "name=myunila" --format "{{.Name}}")
    if [ -n "$VOLUMES" ]; then
        echo "$VOLUMES" | xargs docker volume rm
        echo "✓ Volumes removed"
    else
        echo "✓ No volumes to remove"
    fi
else
    echo "✓ Volumes kept"
fi
echo ""

# Step 6: Rebuild all images
echo -e "${GREEN}[6/7] Rebuilding all images from scratch (this will take 5-10 minutes)...${NC}"
echo ""

cd "$DEPLOYMENT_DIR"

echo "  → Building Public Service..."
docker compose --env-file .env -f services/3-backend/docker-compose.public.yml build --no-cache --pull public-service
echo ""

echo "  → Building Auth Service..."
docker compose --env-file .env -f services/3-backend/docker-compose.auth.yml build --no-cache --pull auth-service
echo ""

echo "  → Building Sister Service..."
docker compose --env-file .env -f services/3-backend/docker-compose.sister.yml build --no-cache --pull sister-service
echo ""

echo "  → Building Feeder Service..."
docker compose --env-file .env -f services/3-backend/docker-compose.feeder.yml build --no-cache --pull feeder-service
echo ""

echo "  → Building MyUnila Service..."
docker compose --env-file .env -f services/3-backend/docker-compose.myunila.yml build --no-cache --pull myunila-service
echo ""

echo "  → Building Executive Service..."
docker compose --env-file .env -f services/3-backend/docker-compose.executive.yml build --no-cache --pull executive-service
echo ""

echo "  → Building Frontend..."
docker compose --env-file .env -f services/4-frontend/docker-compose.yml build --no-cache --pull frontend
echo ""

echo -e "${GREEN}✓ All images rebuilt${NC}"
echo ""

# Step 7: Start all services
echo -e "${GREEN}[7/8] Starting all services in correct order...${NC}"
echo ""

cd "$DEPLOYMENT_DIR"

echo "  → Starting Redis..."
docker compose -f services/1-infrastructure/docker-compose.redis.yml up -d
sleep 3

echo "  → Starting Meilisearch..."
docker compose --env-file .env -f services/1-infrastructure/docker-compose.meilisearch.yml up -d
sleep 5

echo "  → Starting Kong Gateway..."
docker compose --env-file .env -f services/2-gateway/docker-compose.kong.yml up -d
sleep 10

echo "  → Starting Public Service..."
docker compose --env-file .env -f services/3-backend/docker-compose.public.yml up -d

echo "  → Starting Auth Service..."
docker compose --env-file .env -f services/3-backend/docker-compose.auth.yml up -d

echo "  → Starting Sister Service..."
docker compose --env-file .env -f services/3-backend/docker-compose.sister.yml up -d

echo "  → Starting Feeder Service..."
docker compose --env-file .env -f services/3-backend/docker-compose.feeder.yml up -d

echo "  → Starting MyUnila Service..."
docker compose --env-file .env -f services/3-backend/docker-compose.myunila.yml up -d

echo "  → Starting Executive Service..."
docker compose --env-file .env -f services/3-backend/docker-compose.executive.yml up -d

echo "  → Waiting for service volumes to be created..."
sleep 10

echo "  → Starting Nginx..."
# Nginx depends on external volumes created by auth/dashboard services
docker compose -f services/3-backend/docker-compose.nginx.yml up -d 2>&1 || {
    echo -e "${YELLOW}  Note: Nginx startup may need retry if volumes not ready${NC}"
}

sleep 5

# Retry nginx if it's not running
if ! docker ps --filter "name=myunila-nginx" --filter "status=running" --format "{{.Names}}" | grep -q "myunila-nginx"; then
    echo -e "${YELLOW}  → Retrying Nginx startup...${NC}"
    docker compose -f services/3-backend/docker-compose.nginx.yml up -d
fi

echo ""
echo "  → Starting Frontend..."
docker compose --env-file .env -f services/4-frontend/docker-compose.yml up -d

echo ""
echo -e "${GREEN}✓ All services started${NC}"
echo ""

# Wait for services to stabilize
echo "Waiting 20 seconds for all services to stabilize..."
sleep 20

# Step 8: Show status
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

echo -e "${YELLOW}Access Points (Local):${NC}"
echo "  Frontend:          http://localhost:3000"
echo "  Auth Service:      http://localhost:8081"
echo "  Public Service:    http://localhost:8082"
echo "  Sister Service:    http://localhost:8083"
echo "  Feeder Service:    http://localhost:8084"
echo "  MyUnila Service:   http://localhost:8086"
echo "  Executive Service: http://localhost:8087"
echo "  Kong Gateway:      http://localhost:9800"
echo "  Kong Admin:        http://localhost:9801"
echo "  Kong UI:           http://localhost:9803"
echo "  Redis:             localhost:6379"
echo "  Meilisearch:       http://localhost:7700"
echo ""

echo -e "${YELLOW}Test Endpoints:${NC}"
echo "  Public Health:    curl http://localhost:8082/api/health"
echo "  Auth Health:      curl http://localhost:8081/api/health"
echo "  Sister Health:    curl http://localhost:8083/health"
echo "  Feeder Health:    curl http://localhost:8084/health"
echo "  MyUnila Health:   curl http://localhost:8086/health"
echo "  Executive Health: curl http://localhost:8087/api/health"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Configure Kong routes if needed"
echo "  2. Test services with health endpoints above"
echo "  3. Check service logs if any issues"
echo ""

# Check for unhealthy services
UNHEALTHY=$(docker ps --filter "name=myunila" --filter "health=unhealthy" --format "{{.Names}}" 2>/dev/null | wc -l)
if [ "$UNHEALTHY" -gt 0 ]; then
    echo -e "${RED}⚠ Warning: Some services are unhealthy${NC}"
    docker ps --filter "name=myunila" --filter "health=unhealthy" --format "  - {{.Names}}: {{.Status}}"
    echo ""
fi

echo -e "${YELLOW}Check logs:${NC}"
echo "  docker logs myunila-public-service --tail 50"
echo "  docker logs myunila-auth-service --tail 50"
echo "  docker logs myunila-sister-service --tail 50"
echo "  docker logs myunila-feeder-service --tail 50"
echo "  docker logs myunila-service --tail 50"
echo "  docker logs myunila-executive-service --tail 50"
echo ""

echo -e "${GREEN}Done!${NC}"
echo ""
