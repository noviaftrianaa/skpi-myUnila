#!/bin/bash

###############################################################################
# Rebuild individual service(s) on VM5 Staging
#
# Usage:
#   ./scripts/rebuild-service.sh <service>     # Rebuild 1 service
#   ./scripts/rebuild-service.sh <s1> <s2>     # Rebuild multiple
#   ./scripts/rebuild-service.sh --list        # Show available services
#   ./scripts/rebuild-service.sh --all         # Rebuild all services
#
# Examples:
#   ./scripts/rebuild-service.sh sister
#   ./scripts/rebuild-service.sh frontend kong
#   ./scripts/rebuild-service.sh auth dashboard nginx
###############################################################################

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$BASE_DIR/.env"
SERVICES_DIR="$BASE_DIR/services"

# Service → compose file mapping
declare -A SERVICE_MAP=(
    # Infrastructure
    [postgres]="infrastructure/docker-compose.postgres.yml"
    [redis]="infrastructure/docker-compose.redis.yml"
    [meilisearch]="infrastructure/docker-compose.meilisearch.yml"
    # Gateway
    [kong]="gateway/docker-compose.kong.yml"
    # Frontend
    [frontend]="frontend/docker-compose.frontend.yml"
    # Backend PHP
    [nginx]="backend-php/docker-compose.nginx.yml"
    [auth]="backend-php/docker-compose.auth.yml"
    [dashboard]="backend-php/docker-compose.dashboard.yml"
    [executive]="backend-php/docker-compose.executive.yml"
    [public]="backend-php/docker-compose.public.yml"
    [simbak]="backend-php/docker-compose.simbak.yml"
    [si-prestasi]="backend-php/docker-compose.si-prestasi.yml"
    [si-kkn]="backend-php/docker-compose.si-kkn.yml"
    # Backend Go
    [sister]="backend-go/docker-compose.sister.yml"
    [feeder]="backend-go/docker-compose.feeder.yml"
    [myunila]="backend-go/docker-compose.myunila.yml"
    [api]="backend-go/docker-compose.api.yml"
    [keuangan]="backend-go/docker-compose.keuangan.yml"
    [monitoring]="backend-go/docker-compose.monitoring.yml"
    [man-konten]="backend-go/docker-compose.man-konten.yml"
)

show_list() {
    echo ""
    echo -e "${BLUE}Available services:${NC}"
    echo ""
    echo -e "  ${YELLOW}Infrastructure:${NC}  postgres, redis, meilisearch"
    echo -e "  ${YELLOW}Gateway:${NC}         kong"
    echo -e "  ${YELLOW}Frontend:${NC}        frontend"
    echo -e "  ${YELLOW}Backend PHP:${NC}     auth, dashboard, executive, public, simbak, si-prestasi, si-kkn, nginx"
    echo -e "  ${YELLOW}Backend Go:${NC}      sister, feeder, myunila, api, keuangan, monitoring"
    echo ""
    echo "Usage: $0 <service> [service2] [service3] ..."
    echo ""
}

rebuild_service() {
    local svc=$1
    local compose_file="${SERVICE_MAP[$svc]}"

    if [ -z "$compose_file" ]; then
        echo -e "  ${RED}Unknown service: $svc${NC}"
        echo "  Use --list to see available services"
        return 1
    fi

    local full_path="$SERVICES_DIR/$compose_file"

    echo -e "${BLUE}[$svc] Rebuilding...${NC}"

    # Pull latest code
    echo -e "  Pulling latest code..."
    cd "$BASE_DIR/../../../../.." && git pull origin master 2>/dev/null || true
    cd "$BASE_DIR"

    # Build & recreate
    echo -e "  Building & starting..."
    docker compose --env-file "$ENV_FILE" -f "$full_path" up -d --build --force-recreate 2>&1 | while read line; do
        echo "  $line"
    done

    # Wait for healthy
    local container=""
    case $svc in
        auth)       container="myunila-auth-staging" ;;
        dashboard)  container="myunila-dashboard-staging" ;;
        executive)  container="myunila-executive-staging" ;;
        public)     container="myunila-public-staging" ;;
        nginx)      container="myunila-nginx-staging" ;;
        sister)     container="myunila-sister-staging" ;;
        feeder)     container="myunila-feeder-staging" ;;
        myunila)    container="myunila-myunila-staging" ;;
        api|ws)   container="myunila-ws-staging" ;;
        keuangan)   container="myunila-keuangan-staging" ;;
        monitoring) container="myunila-monitoring-staging" ;;
        kong)       container="myunila-kong-staging" ;;
        frontend)   container="myunila-frontend-staging" ;;
        redis)      container="myunila-redis-staging" ;;
        meilisearch) container="myunila-meilisearch-staging" ;;
        postgres)   container="myunila-kong-postgres-staging" ;;
    esac

    if [ -n "$container" ]; then
        echo -ne "  Waiting for healthy"
        for i in $(seq 1 30); do
            status=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "none")
            if [ "$status" = "healthy" ]; then
                echo -e " ${GREEN}OK${NC}"
                break
            elif [ "$status" = "none" ]; then
                # No healthcheck, just check running
                running=$(docker inspect --format='{{.State.Running}}' "$container" 2>/dev/null || echo "false")
                if [ "$running" = "true" ]; then
                    echo -e " ${GREEN}Running${NC}"
                    break
                fi
            fi
            echo -n "."
            sleep 2
        done
        if [ "$i" -eq 30 ]; then
            echo -e " ${YELLOW}TIMEOUT${NC}"
        fi
    fi

    echo -e "  ${GREEN}Done${NC}"
    echo ""
}

# Main
if [ $# -eq 0 ] || [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_list
    exit 0
fi

if [ "$1" = "--list" ]; then
    show_list
    exit 0
fi

if [ "$1" = "--all" ]; then
    set -- postgres redis meilisearch kong auth dashboard public nginx sister feeder myunila api keuangan monitoring frontend
fi

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Rebuild Service(s): $*${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

FAILED=0
for svc in "$@"; do
    rebuild_service "$svc" || FAILED=$((FAILED + 1))
done

# Summary
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep staging
echo ""

if [ $FAILED -gt 0 ]; then
    echo -e "${RED}$FAILED service(s) failed${NC}"
    exit 1
else
    echo -e "${GREEN}All services rebuilt successfully${NC}"
fi
echo ""

# Auto-cleanup dangling images + build cache untuk hemat storage.
# Aman: tidak menyentuh volume + tidak menghapus image yang dipakai container.
# Set REBUILD_NO_CLEANUP=1 untuk skip kalau perlu.
if [ "${REBUILD_NO_CLEANUP:-0}" != "1" ]; then
    echo -e "${BLUE}Auto-cleanup dangling images + build cache (set REBUILD_NO_CLEANUP=1 untuk skip)...${NC}"
    BEFORE=$(docker system df --format "{{.Reclaimable}}" 2>/dev/null | head -1)
    docker image prune -f >/dev/null 2>&1 || true
    docker builder prune -f --keep-storage 2GB >/dev/null 2>&1 || true
    echo -e "${GREEN}  ✓ cleanup selesai (dangling + build cache, volume tidak disentuh)${NC}"
    echo ""
fi
