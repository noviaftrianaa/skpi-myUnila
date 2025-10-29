#!/bin/bash

# ============================================================================
# Automated Deployment Script for VM Ubuntu 1
# Deploys Frontend + Kong Gateway + Nginx
# ============================================================================

set -e

# Configuration
DEPLOY_DIR="/opt/myunila/vm-ubuntu-1"
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

    if [ "$free_mem" -lt 2048 ]; then
        log_warn "Low memory available (${free_mem}MB). Recommended: 2048MB+"
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

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-1"

    if [ ! -f ".env" ]; then
        log_warn ".env file not found"

        if [ -f ".env.example" ]; then
            log_info "Copying .env.example to .env"
            cp .env.example .env

            log_warn "IMPORTANT: Please edit .env file with your configuration"
            log_warn "Required variables:"
            log_warn "  - KONG_PG_PASSWORD"
            log_warn "  - VM_UBUNTU_2_IP"
            log_warn "  - NEXT_PUBLIC_APP_URL"
            log_warn "  - NEXT_PUBLIC_API_URL"

            read -p "Press Enter after editing .env file to continue..."
        else
            log_error ".env.example not found"
            exit 1
        fi
    else
        log_info ".env file found"
    fi
}

# Stop existing containers
stop_containers() {
    section_header "Stopping Existing Containers"

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-1"

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

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-1"

    log_info "Pulling base images..."
    docker-compose pull kong-database nginx || true
}

# Build images
build_images() {
    section_header "Building Docker Images"

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-1"

    log_info "Building frontend image..."
    docker-compose build --no-cache frontend
}

# Start services
start_services() {
    section_header "Starting Services"

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-1"

    log_info "Starting database first..."
    docker-compose up -d kong-database

    log_info "Waiting for database to be ready..."
    sleep 10

    log_info "Running Kong migrations..."
    docker-compose run --rm kong kong migrations bootstrap || \
        docker-compose run --rm kong kong migrations up

    log_info "Starting all services..."
    docker-compose up -d

    log_info "Waiting for services to stabilize..."
    sleep 15
}

# Verify deployment
verify_deployment() {
    section_header "Verifying Deployment"

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-1"

    log_info "Checking container status..."
    docker-compose ps

    echo ""
    log_info "Checking service health..."

    # Check frontend
    if curl -f -s http://localhost:3000/api/health > /dev/null 2>&1; then
        log_info "Frontend: OK"
    else
        log_warn "Frontend: Health check failed"
    fi

    # Check Kong Admin
    if curl -f -s http://localhost:8001/status > /dev/null 2>&1; then
        log_info "Kong Admin API: OK"
    else
        log_warn "Kong Admin API: Health check failed"
    fi

    # Check Kong Proxy
    if curl -s http://localhost:9800/ > /dev/null 2>&1; then
        log_info "Kong Proxy: OK"
    else
        log_warn "Kong Proxy: Health check failed"
    fi

    # Check Nginx
    if curl -f -s http://localhost/ > /dev/null 2>&1; then
        log_info "Nginx: OK"
    else
        log_warn "Nginx: Health check failed"
    fi
}

# Show logs
show_logs() {
    section_header "Recent Logs"

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-1"

    log_info "Last 20 lines of logs for each service:"

    for service in kong-database kong frontend nginx; do
        echo ""
        echo -e "${YELLOW}=== $service ===${NC}"
        docker-compose logs --tail=20 "$service" 2>&1 || true
    done
}

# Main execution
main() {
    echo ""
    echo "============================================"
    echo "VM Ubuntu 1 Deployment Script"
    echo "============================================"
    echo "Timestamp: $(date)"
    echo ""

    check_prerequisites
    pull_code
    check_env_file
    stop_containers
    pull_images
    build_images
    start_services
    verify_deployment
    show_logs

    section_header "Deployment Complete"

    log_info "Services are running!"
    log_info ""
    log_info "Access points:"
    log_info "  - Frontend: http://localhost:3000"
    log_info "  - Kong Proxy: http://localhost:9800"
    log_info "  - Kong Admin: http://localhost:8001"
    log_info "  - Nginx: http://localhost:80"
    log_info ""
    log_info "Next steps:"
    log_info "  1. Configure Kong routes: ./configure-kong.sh"
    log_info "  2. Setup SSL certificates (if production)"
    log_info "  3. Run health check: ./health-check.sh"
    log_info ""

    echo "============================================"
}

# Trap errors
trap 'log_error "Deployment failed at line $LINENO"' ERR

# Run main
main

exit 0
