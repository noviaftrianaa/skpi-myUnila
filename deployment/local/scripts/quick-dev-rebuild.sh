#!/bin/bash

###############################################################################
# Quick Dev Rebuild - Laravel Services (WITH Docker Cache)
# For quick code changes without rebuilding dependencies
#
# This is FASTER than quick-rebuild.sh because it uses Docker cache
# Only use this for CODE changes, NOT for:
#   - .env changes
#   - composer.json changes
#   - Dockerfile changes
#
# Usage:
#   bash quick-dev-rebuild.sh              # Rebuild all Laravel services
#   bash quick-dev-rebuild.sh public       # Rebuild only public
#   bash quick-dev-rebuild.sh auth         # Rebuild only auth
#   bash quick-dev-rebuild.sh executive    # Rebuild only executive
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
echo -e "${BLUE}  Quick Dev Rebuild (WITH Cache)${NC}"
echo -e "${BLUE}  For Laravel Services Only${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo -e "${YELLOW}Note: This uses Docker cache for faster builds${NC}"
echo -e "${YELLOW}      Use 'quick-rebuild.sh' for full rebuild${NC}"
echo ""

cd "$DEPLOYMENT_DIR" || exit 1

# Function to rebuild a Laravel service (with cache)
rebuild_laravel_service() {
    local service_name=$1
    local container_name="myunila-${service_name}-service"
    local compose_file="services/3-backend/docker-compose.${service_name}.yml"

    echo -e "${GREEN}Rebuilding ${service_name} service (with cache)...${NC}"

    # Stop the service
    echo "  → Stopping ${service_name}..."
    docker compose --env-file .env -f "$compose_file" stop ${service_name}-service 2>/dev/null || true

    # Rebuild WITH cache - much faster for code-only changes
    echo "  → Rebuilding image (with cache)..."
    docker compose --env-file .env -f "$compose_file" build ${service_name}-service

    # Start the service
    echo "  → Starting ${service_name}..."
    docker compose --env-file .env -f "$compose_file" up -d ${service_name}-service

    # Clear Laravel caches
    sleep 3
    echo "  → Clearing Laravel caches..."
    docker exec $container_name php artisan config:clear 2>/dev/null || true
    docker exec $container_name php artisan route:clear 2>/dev/null || true
    docker exec $container_name php artisan cache:clear 2>/dev/null || true

    # Start queue worker for auth-service (for background sync jobs)
    if [ "$service_name" == "auth" ]; then
        echo "  → Starting queue worker for background jobs..."
        docker exec -d $container_name sh -c "nohup php artisan queue:work redis --tries=3 --timeout=1800 --memory=256 > /var/www/storage/logs/queue-worker.log 2>&1 &"
        sleep 2
        if docker exec $container_name ps aux | grep -q "queue:work"; then
            echo -e "  ${GREEN}✓ Queue worker started${NC}"
        else
            echo -e "  ${YELLOW}! Queue worker may not have started, check manually${NC}"
        fi
    fi

    echo -e "${GREEN}✓ ${service_name} service rebuilt (with cache)${NC}"
    echo ""
}

# Rebuild based on argument
case "$SERVICE" in
    public)
        rebuild_laravel_service "public"
        # Public uses nginx as reverse proxy, need to restart nginx too
        echo -e "${YELLOW}Restarting nginx to reconnect to public-service...${NC}"
        docker restart myunila-nginx 2>/dev/null || true
        ;;
    auth)
        rebuild_laravel_service "auth"
        # Auth uses nginx as reverse proxy, need to restart nginx too
        echo -e "${YELLOW}Restarting nginx to reconnect to auth-service...${NC}"
        docker restart myunila-nginx 2>/dev/null || true
        ;;
    executive)
        rebuild_laravel_service "executive"
        # Executive uses nginx as reverse proxy, need to restart nginx too
        echo -e "${YELLOW}Restarting nginx to reconnect to executive-service...${NC}"
        docker restart myunila-nginx 2>/dev/null || true
        ;;
    all)
        echo "Rebuilding all Laravel services (with cache)..."
        echo ""
        rebuild_laravel_service "public"
        rebuild_laravel_service "auth"
        rebuild_laravel_service "executive"
        echo ""
        # Restart nginx after all services are rebuilt
        echo -e "${YELLOW}Restarting nginx to reconnect to services...${NC}"
        docker restart myunila-nginx 2>/dev/null || true
        ;;
    *)
        echo -e "${RED}Error: Invalid service name${NC}"
        echo ""
        echo "This script only supports Laravel services:"
        echo "  bash quick-dev-rebuild.sh              # Rebuild all Laravel services"
        echo "  bash quick-dev-rebuild.sh public       # Rebuild public only"
        echo "  bash quick-dev-rebuild.sh auth         # Rebuild auth only"
        echo "  bash quick-dev-rebuild.sh executive    # Rebuild executive only"
        echo ""
        echo "For Go services (sister, feeder, myunila), use quick-rebuild.sh"
        echo ""
        exit 1
        ;;
esac

# Wait for services
echo "Waiting 5 seconds for services to stabilize..."
sleep 5

# Show status
echo ""
echo -e "${BLUE}Container Status:${NC}"
docker ps --filter "name=myunila" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo -e "${GREEN}✓ Quick dev rebuild complete!${NC}"
echo ""

echo -e "${YELLOW}Test Endpoints:${NC}"
if [ "$SERVICE" == "all" ] || [ "$SERVICE" == "public" ]; then
    echo "  Public:    curl http://localhost:8082/api/health"
fi
if [ "$SERVICE" == "all" ] || [ "$SERVICE" == "auth" ]; then
    echo "  Auth:      curl http://localhost:8081/api/health"
fi
if [ "$SERVICE" == "all" ] || [ "$SERVICE" == "executive" ]; then
    echo "  Executive: curl http://localhost:8087/api/health"
fi
echo ""
