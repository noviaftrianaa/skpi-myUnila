#!/bin/bash

# ============================================================================
# Automated Deployment Script for VM Ubuntu 2
# Deploys Backend Services (Auth, Dashboard, Sister) + Redis
# ============================================================================

set -e

# Configuration
DEPLOY_DIR="/opt/myunila/vm-ubuntu-2"
REPO_URL="${REPO_URL:-}"
BRANCH="${BRANCH:-master}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

section_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Check prerequisites
check_prerequisites() {
    section_header "Checking Prerequisites"

    log_info "Checking Docker..."
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    log_info "Docker: $(docker --version)"

    log_info "Checking Docker Compose..."
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    log_info "Docker Compose: OK"

    log_info "Checking system resources..."
    local free_mem=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    log_info "Available memory: ${free_mem}MB"

    if [ "$free_mem" -lt 4096 ]; then
        log_warn "Low memory available (${free_mem}MB). Recommended: 4096MB+"
    fi
}

# Pull latest code
pull_code() {
    section_header "Pulling Latest Code"

    if [ -d "$DEPLOY_DIR" ]; then
        log_info "Directory exists, pulling latest changes..."
        cd "$DEPLOY_DIR"

        if [ -d ".git" ]; then
            git fetch origin
            git pull origin "$BRANCH"
        else
            log_warn "Not a git repository, skipping pull"
        fi
    else
        log_info "Cloning repository..."

        if [ -z "$REPO_URL" ]; then
            log_error "REPO_URL not set. Cannot clone repository."
            exit 1
        fi

        mkdir -p "$(dirname $DEPLOY_DIR)"
        git clone -b "$BRANCH" "$REPO_URL" "$DEPLOY_DIR"
        cd "$DEPLOY_DIR"
    fi
}

# Check environment file
check_env_file() {
    section_header "Checking Environment Configuration"

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-2"

    if [ ! -f ".env" ]; then
        log_warn ".env file not found"

        if [ -f ".env.example" ]; then
            log_info "Copying .env.example to .env"
            cp .env.example .env

            log_warn "IMPORTANT: Please edit .env file with your configuration"
            log_warn "Required variables:"
            log_warn "  - DB_HOST"
            log_warn "  - DB_USERNAME"
            log_warn "  - DB_PASSWORD"
            log_warn "  - JWT_SECRET"
            log_warn "  - API_CONFIG_ENCRYPTION_KEY"
            log_warn "  - SISTER_API credentials"

            read -p "Press Enter after editing .env file to continue..."
        else
            log_error ".env.example not found"
            exit 1
        fi
    else
        log_info ".env file found"
    fi
}

# Test database connection
test_database() {
    section_header "Testing Database Connection"

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-2"

    source .env

    log_info "Testing connection to ${DB_HOST}:${DB_PORT}..."

    if command -v nc &> /dev/null; then
        if nc -z -w5 "$DB_HOST" "$DB_PORT" 2>/dev/null; then
            log_info "Database connection: OK"
        else
            log_error "Cannot connect to database at ${DB_HOST}:${DB_PORT}"
            log_error "Please verify database is running and accessible"
            exit 1
        fi
    else
        log_warn "netcat not installed, skipping database connection test"
    fi
}

# Stop existing containers
stop_containers() {
    section_header "Stopping Existing Containers"

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-2"

    if docker-compose ps -q 2>/dev/null | grep -q .; then
        log_info "Stopping existing containers..."
        docker-compose down
    else
        log_info "No running containers found"
    fi
}

# Pull Docker images
pull_images() {
    section_header "Pulling Docker Images"

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-2"

    log_info "Pulling base images..."
    docker-compose pull redis redis-exporter node-exporter nginx-exporter || true
}

# Build images
build_images() {
    section_header "Building Docker Images"

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-2"

    log_info "Building auth-service..."
    docker-compose build --no-cache auth-service

    log_info "Building dashboard-service..."
    docker-compose build --no-cache dashboard-service

    log_info "Building sister-service..."
    docker-compose build --no-cache sister-service
}

# Run database migrations
run_migrations() {
    section_header "Running Database Migrations"

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-2"

    log_info "Starting Redis temporarily for migrations..."
    docker-compose up -d redis
    sleep 5

    log_info "Running auth-service migrations..."
    docker-compose run --rm auth-service php artisan migrate --force || log_warn "Auth migrations may have already run"

    log_info "Running dashboard-service migrations..."
    docker-compose run --rm dashboard-service php artisan migrate --force || log_warn "Dashboard migrations may have already run"

    log_info "Migrations complete"
}

# Start services
start_services() {
    section_header "Starting Services"

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-2"

    log_info "Starting Redis first..."
    docker-compose up -d redis
    sleep 5

    log_info "Starting backend services..."
    docker-compose up -d auth-service dashboard-service sister-service
    sleep 10

    log_info "Starting monitoring exporters..."
    docker-compose up -d redis-exporter node-exporter nginx-exporter

    log_info "Starting Nginx..."
    docker-compose up -d nginx

    log_info "Waiting for services to stabilize..."
    sleep 15
}

# Verify deployment
verify_deployment() {
    section_header "Verifying Deployment"

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-2"

    log_info "Checking container status..."
    docker-compose ps

    echo ""
    log_info "Checking service health..."

    # Check Redis
    if docker exec redis redis-cli ping 2>/dev/null | grep -q PONG; then
        log_info "Redis: OK"
    else
        log_warn "Redis: Health check failed"
    fi

    # Check Auth Service
    if curl -f -s http://localhost:8081/health > /dev/null 2>&1; then
        log_info "Auth Service: OK"
    else
        log_warn "Auth Service: Health check failed"
    fi

    # Check Dashboard Service
    if curl -f -s http://localhost:8082/health > /dev/null 2>&1; then
        log_info "Dashboard Service: OK"
    else
        log_warn "Dashboard Service: Health check failed"
    fi

    # Check Sister Service
    if curl -f -s http://localhost:8083/health > /dev/null 2>&1; then
        log_info "Sister Service: OK"
    else
        log_warn "Sister Service: Health check failed"
    fi

    # Check exporters
    if curl -f -s http://localhost:9121/metrics > /dev/null 2>&1; then
        log_info "Redis Exporter: OK"
    else
        log_warn "Redis Exporter: Health check failed"
    fi

    if curl -f -s http://localhost:9100/metrics > /dev/null 2>&1; then
        log_info "Node Exporter: OK"
    else
        log_warn "Node Exporter: Health check failed"
    fi
}

# Show logs
show_logs() {
    section_header "Recent Logs"

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-2"

    log_info "Last 20 lines of logs for each service:"

    for service in redis auth-service dashboard-service sister-service; do
        echo ""
        echo -e "${YELLOW}=== $service ===${NC}"
        docker-compose logs --tail=20 "$service" 2>&1 || true
    done
}

# Main execution
main() {
    echo ""
    echo "============================================"
    echo "VM Ubuntu 2 Deployment Script"
    echo "============================================"
    echo "Timestamp: $(date)"
    echo ""

    check_prerequisites
    pull_code
    check_env_file
    test_database
    stop_containers
    pull_images
    build_images
    run_migrations
    start_services
    verify_deployment
    show_logs

    section_header "Deployment Complete"

    log_info "Services are running!"
    log_info ""
    log_info "Service endpoints:"
    log_info "  - Auth Service:      http://localhost:8081"
    log_info "  - Dashboard Service: http://localhost:8082"
    log_info "  - Sister Service:    http://localhost:8083"
    log_info ""
    log_info "Monitoring endpoints:"
    log_info "  - Node Exporter:     http://localhost:9100/metrics"
    log_info "  - Redis Exporter:    http://localhost:9121/metrics"
    log_info "  - Nginx Exporter:    http://localhost:9113/metrics"
    log_info ""
    log_info "Next steps:"
    log_info "  1. Configure Kong routes on VM Ubuntu 1"
    log_info "  2. Run health check: ./health-check.sh"
    log_info "  3. Setup monitoring alerts"
    log_info ""

    echo "============================================"
}

# Trap errors
trap 'log_error "Deployment failed at line $LINENO"' ERR

# Run main
main

exit 0
