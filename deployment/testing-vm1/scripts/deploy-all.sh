#!/bin/bash

###############################################################################
# MyUnila VM1 - Deploy All Services
# This script deploys all services in the correct order
###############################################################################

set -e  # Exit on error

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
# Check prerequisites
###############################################################################
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if .env exists
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        log_error ".env file not found!"
        log_info "Please copy .env.example to .env and configure it"
        exit 1
    fi

    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi

    # Check Docker Compose
    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

###############################################################################
# Load environment variables
###############################################################################
load_env() {
    log_info "Loading environment variables..."
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
    log_success "Environment variables loaded"
}

###############################################################################
# Deploy infrastructure services
###############################################################################
deploy_infrastructure() {
    log_info "Deploying infrastructure services..."

    cd "$PROJECT_ROOT/services/1-infrastructure"

    # Deploy Redis
    log_info "Starting Redis..."
    docker compose -f docker-compose.redis.yml up -d
    sleep 5

    # Deploy PostgreSQL for Kong
    log_info "Starting PostgreSQL for Kong..."
    docker compose -f docker-compose.postgres.yml up -d
    sleep 10

    log_success "Infrastructure services deployed"
}

###############################################################################
# Deploy Kong Gateway
###############################################################################
deploy_kong() {
    log_info "Deploying Kong Gateway..."

    cd "$PROJECT_ROOT/services/2-gateway"

    docker compose -f docker-compose.kong.yml up -d

    # Wait for Kong to be healthy
    log_info "Waiting for Kong to be ready..."
    sleep 15

    # Check Kong health
    for i in {1..30}; do
        if curl -sf http://localhost:${KONG_PROXY_PORT:-9800}/ > /dev/null 2>&1; then
            log_success "Kong Gateway is ready"
            break
        fi
        echo -n "."
        sleep 2
    done

    log_success "Kong Gateway deployed"
}

###############################################################################
# Deploy backend services
###############################################################################
deploy_backend() {
    log_info "Deploying backend services..."

    cd "$PROJECT_ROOT/services/3-backend"

    # Deploy Auth Service
    log_info "Starting Auth Service..."
    docker compose -f docker-compose.auth.yml up -d
    sleep 10

    # Deploy Dashboard Service
    log_info "Starting Dashboard Service..."
    docker compose -f docker-compose.dashboard.yml up -d
    sleep 10

    # Deploy Sister Service
    log_info "Starting Sister Service..."
    docker compose -f docker-compose.sister.yml up -d
    sleep 10

    # Deploy Nginx
    log_info "Starting Nginx..."
    docker compose -f docker-compose.nginx.yml up -d
    sleep 5

    log_success "Backend services deployed"
}

###############################################################################
# Deploy frontend
###############################################################################
deploy_frontend() {
    log_info "Deploying frontend..."

    cd "$PROJECT_ROOT/services/4-frontend"

    docker compose -f docker-compose.frontend.yml up -d

    # Wait for frontend to be ready
    log_info "Waiting for frontend to be ready..."
    sleep 20

    log_success "Frontend deployed"
}

###############################################################################
# Deploy monitoring stack (optional)
###############################################################################
deploy_monitoring() {
    if [ "$SKIP_MONITORING" = "true" ]; then
        log_warning "Skipping monitoring stack deployment"
        return
    fi

    log_info "Deploying monitoring stack..."

    cd "$PROJECT_ROOT/services/5-monitoring"

    docker compose -f docker-compose.monitoring.yml up -d

    log_success "Monitoring stack deployed"
}

###############################################################################
# Show deployment summary
###############################################################################
show_summary() {
    echo ""
    echo "========================================"
    echo "  Deployment Summary"
    echo "========================================"
    echo ""

    # Check service status
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

    echo ""
    echo "========================================"
    echo "  Access URLs"
    echo "========================================"
    echo ""
    echo "Kong Gateway:"
    echo "  - Proxy:      http://${VM_IP:-localhost}:${KONG_PROXY_PORT:-9800}"
    echo "  - Admin API:  http://${VM_IP:-localhost}:${KONG_ADMIN_PORT:-9801}"
    echo "  - UI:         http://${VM_IP:-localhost}:${KONG_UI_PORT:-9803}"
    echo ""
    echo "Backend Services:"
    echo "  - Auth:       http://${VM_IP:-localhost}:8081"
    echo "  - Dashboard:  http://${VM_IP:-localhost}:8082"
    echo "  - Sister:     http://${VM_IP:-localhost}:8083"
    echo ""
    echo "Frontend:"
    echo "  - Web App:    http://${VM_IP:-localhost}:3000"
    echo ""

    if [ "$SKIP_MONITORING" != "true" ]; then
        echo "Monitoring:"
        echo "  - Grafana:    http://${VM_IP:-localhost}:${GRAFANA_PORT:-3002}"
        echo "  - Prometheus: http://${VM_IP:-localhost}:${PROMETHEUS_PORT:-9090}"
        echo ""
    fi

    echo "========================================"
    echo ""
}

###############################################################################
# Main execution
###############################################################################
main() {
    echo ""
    echo "========================================"
    echo "  MyUnila VM1 - Deploy All Services"
    echo "========================================"
    echo ""

    check_prerequisites
    load_env

    # Deploy services in order
    deploy_infrastructure
    deploy_kong
    deploy_backend
    deploy_frontend
    deploy_monitoring

    show_summary

    log_success "All services deployed successfully!"
    echo ""
    echo "Run './scripts/health-check.sh' to verify all services"
    echo ""
}

# Run main function
main "$@"
