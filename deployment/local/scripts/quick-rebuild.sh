#!/bin/bash

###############################################################################
# Quick Rebuild Services - LOCAL ENVIRONMENT
# For quick changes in code or .env without full rebuild
#
# Usage:
#   bash quick-rebuild.sh              # Rebuild all services
#   bash quick-rebuild.sh public       # Rebuild only public
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
    # Special case: myunila service has container name "myunila-service" not "myunila-myunila-service"
    if [ "$service_name" == "myunila" ]; then
        local container_name="myunila-service"
        local docker_service_name="myunila-service"
    else
        local container_name="myunila-${service_name}-service"
        local docker_service_name="${service_name}-service"
    fi
    local compose_file="services/3-backend/docker-compose.${service_name}.yml"

    echo -e "${GREEN}Rebuilding ${service_name} service...${NC}"

    # Stop the service
    echo "  → Stopping ${service_name}..."
    docker compose --env-file .env -f "$compose_file" stop ${docker_service_name} 2>/dev/null || true

    # Rebuild without cache - use --no-cache to ensure code changes are picked up
    echo "  → Rebuilding image (no-cache)..."
    docker compose --env-file .env -f "$compose_file" build --no-cache --pull ${docker_service_name}

    # Start the service
    echo "  → Starting ${service_name}..."
    docker compose --env-file .env -f "$compose_file" up -d ${docker_service_name}

    # Clear Laravel caches if it's a PHP service (not Go services)
    if [ "$service_name" != "sister" ] && [ "$service_name" != "feeder" ] && [ "$service_name" != "myunila" ]; then
        sleep 3
        echo "  → Clearing Laravel caches..."
        docker exec $container_name php artisan config:clear 2>/dev/null || true
        docker exec $container_name php artisan route:clear 2>/dev/null || true
        docker exec $container_name php artisan cache:clear 2>/dev/null || true
    fi

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

    echo -e "${GREEN}✓ ${service_name} service rebuilt${NC}"
    echo ""
}

# Function to rebuild frontend
rebuild_frontend() {
    echo -e "${GREEN}Rebuilding Frontend...${NC}"

    # Stop the frontend service
    echo "  → Stopping frontend..."
    docker compose --env-file .env -f services/4-frontend/docker-compose.yml stop frontend 2>/dev/null || true

    # Rebuild without cache - use --no-cache to ensure code changes are picked up
    echo "  → Rebuilding image (no-cache)..."
    docker compose --env-file .env -f services/4-frontend/docker-compose.yml build --no-cache --pull frontend

    # Start the service
    echo "  → Starting frontend..."
    docker compose --env-file .env -f services/4-frontend/docker-compose.yml up -d frontend

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
    public)
        rebuild_service "public"
        # Public uses nginx as reverse proxy, need to restart nginx too
        echo -e "${YELLOW}Restarting nginx to reconnect to public-service...${NC}"
        docker restart myunila-nginx 2>/dev/null || true
        # Generate API docs
        echo "  → Generating Public Service docs..."
        docker exec myunila-public-service php artisan l5-swagger:generate 2>/dev/null && echo "    ✓ Docs generated" || echo "    ⚠ Docs failed"
        ;;
    auth)
        rebuild_service "auth"
        # Auth uses nginx as reverse proxy, need to restart nginx too
        echo -e "${YELLOW}Restarting nginx to reconnect to auth-service...${NC}"
        docker restart myunila-nginx 2>/dev/null || true
        # Generate API docs
        echo "  → Generating Auth Service docs..."
        docker exec myunila-auth-service php artisan l5-swagger:generate 2>/dev/null && echo "    ✓ Docs generated" || echo "    ⚠ Docs failed"
        ;;
    sister)
        rebuild_service "sister"
        ;;
    feeder)
        rebuild_service "feeder"
        ;;
    myunila)
        rebuild_service "myunila"
        ;;
    api)
        rebuild_service "api"
        ;;
    dashboard)
        rebuild_service "dashboard"
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
        rebuild_service "public"
        rebuild_service "auth"
        rebuild_service "sister"
        rebuild_service "feeder"
        rebuild_service "myunila"
        rebuild_service "api"
        rebuild_service "dashboard"
        rebuild_nginx

        # Setup Kong routes after all services are up
        echo ""
        echo -e "${GREEN}Setting up Kong routes...${NC}"
        SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
        if [ -f "$SCRIPT_DIR/setup-kong-routes.sh" ]; then
            bash "$SCRIPT_DIR/setup-kong-routes.sh"
        else
            echo -e "${YELLOW}⚠ Kong routes script not found, skipping...${NC}"
        fi

        # Generate API documentation for Laravel services
        echo ""
        echo -e "${GREEN}Generating API documentation...${NC}"
        echo "  → Generating Public Service docs..."
        docker exec myunila-public-service php artisan l5-swagger:generate 2>/dev/null && echo "    ✓ Public Service docs generated" || echo "    ⚠ Public Service docs failed"
        echo "  → Generating Auth Service docs..."
        docker exec myunila-auth-service php artisan l5-swagger:generate 2>/dev/null && echo "    ✓ Auth Service docs generated" || echo "    ⚠ Auth Service docs failed"
        echo ""
        ;;
    *)
        echo -e "${RED}Error: Invalid service name${NC}"
        echo ""
        echo "Usage:"
        echo "  bash quick-rebuild.sh              # Rebuild all"
        echo "  bash quick-rebuild.sh public       # Rebuild public only"
        echo "  bash quick-rebuild.sh auth         # Rebuild auth only"
        echo "  bash quick-rebuild.sh sister       # Rebuild sister only"
        echo "  bash quick-rebuild.sh feeder       # Rebuild feeder only"
        echo "  bash quick-rebuild.sh myunila      # Rebuild myunila only"
        echo "  bash quick-rebuild.sh api          # Rebuild api (onedata) only"
        echo "  bash quick-rebuild.sh dashboard    # Rebuild dashboard only"
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
if [ "$SERVICE" == "all" ] || [ "$SERVICE" == "public" ]; then
    echo "  Public:    curl http://localhost:8082/api/health"
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
if [ "$SERVICE" == "all" ] || [ "$SERVICE" == "myunila" ]; then
    echo "  MyUnila:   curl http://localhost:8086/health"
fi
if [ "$SERVICE" == "all" ] || [ "$SERVICE" == "api" ]; then
    echo "  OneData:   curl http://localhost:8085/health"
    echo "  API Docs:  http://localhost:8085/api/docs"
fi
if [ "$SERVICE" == "all" ] || [ "$SERVICE" == "dashboard" ]; then
    echo "  Dashboard: curl http://localhost:8087/api/health"
fi
echo ""
