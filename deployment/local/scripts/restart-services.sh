#!/bin/bash

###############################################################################
# Restart Services - LOCAL ENVIRONMENT
# For .env changes without rebuilding images
#
# Usage:
#   bash restart-services.sh              # Restart all
#   bash restart-services.sh dashboard    # Restart only dashboard
#   bash restart-services.sh auth         # Restart only auth
#   bash restart-services.sh sister       # Restart only sister
#   bash restart-services.sh feeder       # Restart only feeder
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Auto-detect paths (works on any machine/OS)
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
BACKEND_DIR="$REPO_DIR/backend"

SERVICE="${1:-all}"

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Restart Services - LOCAL${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

cd "$BACKEND_DIR" || exit 1

# Function to restart a service
restart_service() {
    local service_name=$1
    local container_name="myunila-${service_name}-service"

    echo -e "${GREEN}Restarting ${service_name} service...${NC}"

    # Restart the service
    docker compose restart ${service_name}-service

    # Clear Laravel caches if it's a PHP service (not Go services)
    if [ "$service_name" != "sister" ] && [ "$service_name" != "feeder" ] && [ "$service_name" != "myunila" ]; then
        sleep 3
        echo "  → Clearing Laravel caches..."
        docker exec $container_name php artisan config:clear 2>/dev/null || true
        docker exec $container_name php artisan route:clear 2>/dev/null || true
        docker exec $container_name php artisan cache:clear 2>/dev/null || true
    fi

    echo -e "${GREEN}✓ ${service_name} service restarted${NC}"
    echo ""
}

# Restart based on argument
case "$SERVICE" in
    dashboard)
        restart_service "dashboard"
        ;;
    auth)
        restart_service "auth"
        ;;
    sister)
        restart_service "sister"
        ;;
    feeder)
        restart_service "feeder"
        ;;
    keuangan)
        restart_service "keuangan"
        ;;
    myunila)
        restart_service "myunila"
        ;;
    api)
        restart_service "api"
        ;;
    public)
        restart_service "public"
        ;;
    redis)
        echo -e "${GREEN}Restarting Redis...${NC}"
        docker compose restart redis
        echo -e "${GREEN}✓ Redis restarted${NC}"
        echo ""
        ;;
    meilisearch)
        echo -e "${GREEN}Restarting Meilisearch...${NC}"
        docker compose restart meilisearch
        echo -e "${GREEN}✓ Meilisearch restarted${NC}"
        echo ""
        ;;
    nginx)
        echo -e "${GREEN}Restarting Nginx...${NC}"
        docker compose restart nginx
        echo -e "${GREEN}✓ Nginx restarted${NC}"
        echo ""
        ;;
    all)
        echo "Restarting all services..."
        echo ""
        restart_service "dashboard"
        restart_service "auth"
        restart_service "sister"
        restart_service "feeder"
        restart_service "keuangan"
        restart_service "myunila"
        restart_service "api"

        echo -e "${GREEN}Restarting Nginx...${NC}"
        docker compose restart nginx
        echo ""

        echo -e "${GREEN}Flushing Redis cache...${NC}"
        docker exec myunila-redis redis-cli FLUSHALL 2>/dev/null || true
        echo ""
        ;;
    *)
        echo -e "${RED}Error: Invalid service name${NC}"
        echo ""
        echo "Usage:"
        echo "  bash restart-services.sh              # Restart all"
        echo "  bash restart-services.sh dashboard    # Restart dashboard only"
        echo "  bash restart-services.sh auth         # Restart auth only"
        echo "  bash restart-services.sh public       # Restart public only"
        echo "  bash restart-services.sh sister       # Restart sister only"
        echo "  bash restart-services.sh feeder       # Restart feeder only"
        echo "  bash restart-services.sh keuangan     # Restart keuangan only"
        echo "  bash restart-services.sh myunila      # Restart myunila only"
        echo "  bash restart-services.sh api          # Restart api only"
        echo "  bash restart-services.sh redis        # Restart redis only"
        echo "  bash restart-services.sh meilisearch  # Restart meilisearch only"
        echo "  bash restart-services.sh nginx        # Restart nginx only"
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
docker ps --filter "name=myunila" --format "table {{.Names}}\t{{.Status}}"

echo ""
echo -e "${GREEN}✓ Restart complete!${NC}"
echo ""
