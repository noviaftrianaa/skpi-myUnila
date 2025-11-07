#!/bin/bash

###############################################################################
# MyUnila VM1 - Stop All Services
# This script stops all services in reverse order
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

###############################################################################
# Main execution
###############################################################################
main() {
    echo ""
    echo "========================================"
    echo "  Stopping All Services"
    echo "========================================"
    echo ""

    # Stop monitoring
    if [ -f "$PROJECT_ROOT/services/5-monitoring/docker-compose.monitoring.yml" ]; then
        log_info "Stopping monitoring stack..."
        cd "$PROJECT_ROOT/services/5-monitoring"
        docker compose -f docker-compose.monitoring.yml down
    fi

    # Stop frontend
    if [ -f "$PROJECT_ROOT/services/4-frontend/docker-compose.frontend.yml" ]; then
        log_info "Stopping frontend..."
        cd "$PROJECT_ROOT/services/4-frontend"
        docker compose -f docker-compose.frontend.yml down
    fi

    # Stop backend services
    log_info "Stopping backend services..."
    cd "$PROJECT_ROOT/services/3-backend"

    [ -f docker-compose.nginx.yml ] && docker compose -f docker-compose.nginx.yml down
    [ -f docker-compose.sister.yml ] && docker compose -f docker-compose.sister.yml down
    [ -f docker-compose.dashboard.yml ] && docker compose -f docker-compose.dashboard.yml down
    [ -f docker-compose.auth.yml ] && docker compose -f docker-compose.auth.yml down

    # Stop Kong
    if [ -f "$PROJECT_ROOT/services/2-gateway/docker-compose.kong.yml" ]; then
        log_info "Stopping Kong Gateway..."
        cd "$PROJECT_ROOT/services/2-gateway"
        docker compose -f docker-compose.kong.yml down
    fi

    # Stop infrastructure
    log_info "Stopping infrastructure services..."
    cd "$PROJECT_ROOT/services/1-infrastructure"

    [ -f docker-compose.postgres.yml ] && docker compose -f docker-compose.postgres.yml down
    [ -f docker-compose.redis.yml ] && docker compose -f docker-compose.redis.yml down

    echo ""
    log_success "All services stopped"
    echo ""
    echo "Note: Docker volumes are preserved. To remove them, run:"
    echo "  docker volume prune"
    echo ""
}

main "$@"
