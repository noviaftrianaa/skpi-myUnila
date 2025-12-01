#!/bin/bash

###############################################################################
# Quick Rebuild Services - LOCAL ENVIRONMENT
# For quick changes in code or .env without full rebuild
#
# Usage:
#   bash quick-rebuild.sh              # Rebuild all services
#   bash quick-rebuild.sh dashboard    # Rebuild only dashboard
#   bash quick-rebuild.sh auth         # Rebuild only auth
#   bash quick-rebuild.sh sister       # Rebuild only sister
#   bash quick-rebuild.sh feeder       # Rebuild only feeder
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Detect if running in Git Bash on Windows
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows paths (Git Bash format)
    REPO_DIR="/c/laragon/www/my-unila"
else
    # Unix paths
    REPO_DIR=$(cd "$(dirname "$0")/../../.." && pwd)
fi

DEPLOYMENT_DIR="$REPO_DIR/deployment/local"

# Parse service argument
SERVICE="${1:-all}"

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Quick Rebuild - LOCAL${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

cd "$DEPLOYMENT_DIR" || exit 1

# Function to rebuild a specific service
rebuild_service() {
    local service_name=$1
    local container_name="myunila-${service_name}-service"
    local compose_file="services/3-backend/docker-compose.${service_name}.yml"

    echo -e "${GREEN}Rebuilding ${service_name} service...${NC}"

    # Stop the service
    echo "  → Stopping ${service_name}..."
    docker compose --env-file .env -f "$compose_file" stop ${service_name}-service 2>/dev/null || true

    # Rebuild without cache - use --no-cache to ensure code changes are picked up
    echo "  → Rebuilding image (no-cache)..."
    docker compose --env-file .env -f "$compose_file" build --no-cache --pull ${service_name}-service

    # Start the service
    echo "  → Starting ${service_name}..."
    docker compose --env-file .env -f "$compose_file" up -d ${service_name}-service

    # Clear Laravel caches if it's a PHP service
    if [ "$service_name" != "sister" ] && [ "$service_name" != "feeder" ]; then
        sleep 3
        echo "  → Clearing Laravel caches..."
        docker exec $container_name php artisan config:clear 2>/dev/null || true
        docker exec $container_name php artisan route:clear 2>/dev/null || true
        docker exec $container_name php artisan cache:clear 2>/dev/null || true
    fi

    echo -e "${GREEN}✓ ${service_name} service rebuilt${NC}"
    echo ""
}

# Function to rebuild frontend
rebuild_frontend() {
    echo -e "${GREEN}Rebuilding Frontend...${NC}"

    # Stop the frontend service
    echo "  → Stopping frontend..."
    docker compose --env-file .env -f services/1-nextjs/docker-compose.yml stop nextjs 2>/dev/null || true

    # Rebuild without cache - use --no-cache to ensure code changes are picked up
    echo "  → Rebuilding image (no-cache)..."
    docker compose --env-file .env -f services/1-nextjs/docker-compose.yml build --no-cache --pull nextjs

    # Start the service
    echo "  → Starting frontend..."
    docker compose --env-file .env -f services/1-nextjs/docker-compose.yml up -d nextjs

    echo -e "${GREEN}✓ Frontend rebuilt${NC}"
    echo ""
}

# Function to rebuild nginx
rebuild_nginx() {
    echo -e "${GREEN}Rebuilding Nginx...${NC}"

    # Stop the nginx service
    echo "  → Stopping nginx..."
    docker compose --env-file .env -f services/3-backend/docker-compose.nginx.yml stop nginx 2>/dev/null || true

    # Rebuild without cache
    echo "  → Rebuilding image (no-cache)..."
    docker compose --env-file .env -f services/3-backend/docker-compose.nginx.yml build --no-cache nginx

    # Start the service
    echo "  → Starting nginx..."
    docker compose --env-file .env -f services/3-backend/docker-compose.nginx.yml up -d nginx

    echo -e "${GREEN}✓ Nginx rebuilt${NC}"
    echo ""
}

# Rebuild based on argument
case "$SERVICE" in
    dashboard)
        rebuild_service "dashboard"
        ;;
    auth)
        rebuild_service "auth"
        ;;
    sister)
        rebuild_service "sister"
        ;;
    feeder)
        rebuild_service "feeder"
        ;;
    frontend)
        rebuild_frontend
        ;;
    nginx)
        rebuild_nginx
        ;;
    all)
        echo "Rebuilding all services..."
        echo ""
        rebuild_frontend
        rebuild_service "dashboard"
        rebuild_service "auth"
        rebuild_service "sister"
        rebuild_service "feeder"
        rebuild_nginx
        echo ""
        ;;
    *)
        echo -e "${RED}Error: Invalid service name${NC}"
        echo ""
        echo "Usage:"
        echo "  bash quick-rebuild.sh              # Rebuild all"
        echo "  bash quick-rebuild.sh dashboard    # Rebuild dashboard only"
        echo "  bash quick-rebuild.sh auth         # Rebuild auth only"
        echo "  bash quick-rebuild.sh sister       # Rebuild sister only"
        echo "  bash quick-rebuild.sh feeder       # Rebuild feeder only"
        echo "  bash quick-rebuild.sh frontend     # Rebuild frontend only"
        echo "  bash quick-rebuild.sh nginx        # Rebuild nginx only"
        echo ""
        exit 1
        ;;
esac

# Wait for services
echo "Waiting 10 seconds for services to stabilize..."
sleep 10

# Show status
echo ""
echo -e "${BLUE}Container Status:${NC}"
docker ps --filter "name=myunila" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo -e "${GREEN}✓ Quick rebuild complete!${NC}"
echo ""

echo -e "${YELLOW}Test Endpoints:${NC}"
if [ "$SERVICE" == "all" ] || [ "$SERVICE" == "frontend" ]; then
    echo "  Frontend:  curl http://localhost:3001"
fi
if [ "$SERVICE" == "all" ] || [ "$SERVICE" == "dashboard" ]; then
    echo "  Dashboard: curl http://localhost:8082/api/health"
fi
if [ "$SERVICE" == "all" ] || [ "$SERVICE" == "auth" ]; then
    echo "  Auth:      curl http://localhost:8081/api/health"
fi
if [ "$SERVICE" == "all" ] || [ "$SERVICE" == "sister" ]; then
    echo "  Sister:    curl http://localhost:8083/health"
fi
if [ "$SERVICE" == "all" ] || [ "$SERVICE" == "feeder" ]; then
    echo "  Feeder:    curl http://localhost:8084/health"
fi
echo ""
