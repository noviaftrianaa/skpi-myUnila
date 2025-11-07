#!/bin/bash

###############################################################################
# MyUnila VM1 - Update Service Script
# Usage: ./update-service.sh [service-name]
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

###############################################################################
# Usage
###############################################################################
usage() {
    echo "Usage: $0 [service-name]"
    echo ""
    echo "Available services:"
    echo "  redis           - Redis cache"
    echo "  postgres        - PostgreSQL for Kong"
    echo "  kong            - Kong Gateway"
    echo "  auth            - Auth Service"
    echo "  dashboard       - Dashboard Service"
    echo "  sister          - Sister Service"
    echo "  nginx           - Nginx web server"
    echo "  frontend        - Next.js Frontend"
    echo "  monitoring      - Monitoring stack"
    echo ""
    echo "Example:"
    echo "  $0 sister"
    exit 1
}

###############################################################################
# Update service
###############################################################################
update_service() {
    local service=$1
    local compose_file=""
    local service_dir=""

    case $service in
        redis)
            service_dir="1-infrastructure"
            compose_file="docker-compose.redis.yml"
            ;;
        postgres)
            service_dir="1-infrastructure"
            compose_file="docker-compose.postgres.yml"
            ;;
        kong)
            service_dir="2-gateway"
            compose_file="docker-compose.kong.yml"
            ;;
        auth)
            service_dir="3-backend"
            compose_file="docker-compose.auth.yml"
            ;;
        dashboard)
            service_dir="3-backend"
            compose_file="docker-compose.dashboard.yml"
            ;;
        sister)
            service_dir="3-backend"
            compose_file="docker-compose.sister.yml"
            ;;
        nginx)
            service_dir="3-backend"
            compose_file="docker-compose.nginx.yml"
            ;;
        frontend)
            service_dir="4-frontend"
            compose_file="docker-compose.frontend.yml"
            ;;
        monitoring)
            service_dir="5-monitoring"
            compose_file="docker-compose.monitoring.yml"
            ;;
        *)
            log_error "Unknown service: $service"
            usage
            ;;
    esac

    local full_path="$PROJECT_ROOT/services/$service_dir"

    if [ ! -f "$full_path/$compose_file" ]; then
        log_error "Compose file not found: $full_path/$compose_file"
        exit 1
    fi

    cd "$full_path"

    log_info "Updating $service..."

    # Pull latest image
    log_info "Pulling latest image..."
    docker compose -f "$compose_file" pull

    # Stop service
    log_info "Stopping service..."
    docker compose -f "$compose_file" down

    # Start service with new image
    log_info "Starting service with new image..."
    docker compose -f "$compose_file" up -d

    # Wait a bit
    sleep 5

    # Check if service is running
    if docker compose -f "$compose_file" ps | grep -q "Up"; then
        log_success "$service updated successfully!"

        # Show logs
        echo ""
        log_info "Recent logs:"
        docker compose -f "$compose_file" logs --tail=20
    else
        log_error "$service failed to start!"
        echo ""
        docker compose -f "$compose_file" logs --tail=50
        exit 1
    fi
}

###############################################################################
# Main
###############################################################################
main() {
    if [ $# -eq 0 ]; then
        usage
    fi

    SERVICE=$1

    echo ""
    echo "========================================"
    echo "  Updating Service: $SERVICE"
    echo "========================================"
    echo ""

    update_service "$SERVICE"

    echo ""
    log_success "Update completed!"
    echo ""
}

main "$@"
