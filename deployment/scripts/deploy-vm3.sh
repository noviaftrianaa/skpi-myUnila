#!/bin/bash

# ============================================================================
# Automated Deployment Script for VM Ubuntu 3
# Deploys Sync Services (Sister, PDDIKTI Feeder) + Redis
# ============================================================================

set -e

# Configuration
DEPLOY_DIR="/opt/myunila/vm-ubuntu-3"
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

    log_info "Checking Go build tools..."
    if ! command -v go &> /dev/null; then
        log_warn "Go is not installed on host (not required if using Docker builds)"
    else
        log_info "Go: $(go version)"
    fi

    log_info "Checking system resources..."
    local free_mem=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    log_info "Available memory: ${free_mem}MB"

    if [ "$free_mem" -lt 2048 ]; then
        log_warn "Low memory available (${free_mem}MB). Recommended: 2048MB+"
    fi

    local free_disk=$(df -BM "$DEPLOY_DIR" 2>/dev/null | awk 'NR==2{print $4}' | sed 's/M//' || echo "0")
    log_info "Available disk space: ${free_disk}MB"

    if [ "$free_disk" -lt 5120 ]; then
        log_warn "Low disk space (${free_disk}MB). Recommended: 5120MB+"
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

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-3"

    if [ ! -f ".env" ]; then
        log_warn ".env file not found"

        if [ -f ".env.example" ]; then
            log_info "Copying .env.example to .env"
            cp .env.example .env

            log_warn "IMPORTANT: Please edit .env file with your configuration"
            log_warn "Required variables:"
            log_warn "  - DB_HOST, DB_USERNAME, DB_PASSWORD"
            log_warn "  - REDIS_PASSWORD"
            log_warn "  - SISTER_API credentials (BASE_URL, IDPENGGUNA, USERNAME, PASSWORD)"
            log_warn "  - FEEDER_API credentials (BASE_URL, USERNAME, PASSWORD, KODE_PT)"
            log_warn "  - API_CONFIG_ENCRYPTION_KEY"
            log_warn "  - SYNC_SCHEDULE settings"

            read -p "Press Enter after editing .env file to continue..."
        else
            log_error ".env.example not found"
            exit 1
        fi
    else
        log_info ".env file found"
    fi

    # Validate critical environment variables
    source .env

    local missing_vars=()

    [ -z "$DB_HOST" ] && missing_vars+=("DB_HOST")
    [ -z "$DB_USERNAME" ] && missing_vars+=("DB_USERNAME")
    [ -z "$DB_PASSWORD" ] && missing_vars+=("DB_PASSWORD")
    [ -z "$SISTER_API_BASE_URL" ] && missing_vars+=("SISTER_API_BASE_URL")
    [ -z "$SISTER_API_USERNAME" ] && missing_vars+=("SISTER_API_USERNAME")
    [ -z "$FEEDER_API_BASE_URL" ] && missing_vars+=("FEEDER_API_BASE_URL")
    [ -z "$API_CONFIG_ENCRYPTION_KEY" ] && missing_vars+=("API_CONFIG_ENCRYPTION_KEY")

    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            log_error "  - $var"
        done
        exit 1
    fi

    log_info "Environment validation: OK"
}

# Test database connection
test_database() {
    section_header "Testing Database Connection"

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-3"

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

# Test external API connectivity (optional)
test_external_apis() {
    section_header "Testing External API Connectivity"

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-3"

    source .env

    # Test SISTER API
    log_info "Testing SISTER API connectivity..."
    if command -v curl &> /dev/null; then
        if curl -f -s --connect-timeout 10 "$SISTER_API_BASE_URL" > /dev/null 2>&1; then
            log_info "SISTER API: Reachable"
        else
            log_warn "SISTER API: Cannot reach (may require authentication)"
        fi
    else
        log_warn "curl not installed, skipping API connectivity test"
    fi

    # Test PDDIKTI Feeder API
    log_info "Testing PDDIKTI Feeder API connectivity..."
    if command -v curl &> /dev/null; then
        if curl -f -s --connect-timeout 10 "$FEEDER_API_BASE_URL" > /dev/null 2>&1; then
            log_info "PDDIKTI Feeder API: Reachable"
        else
            log_warn "PDDIKTI Feeder API: Cannot reach (may require authentication)"
        fi
    fi
}

# Stop existing containers
stop_containers() {
    section_header "Stopping Existing Containers"

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-3"

    if docker-compose ps -q 2>/dev/null | grep -q .; then
        log_info "Stopping existing containers..."
        docker-compose down
        log_info "Containers stopped successfully"
    else
        log_info "No running containers found"
    fi
}

# Pull Docker images
pull_images() {
    section_header "Pulling Docker Images"

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-3"

    log_info "Pulling base images..."
    docker-compose pull redis redis-exporter node-exporter nginx-exporter nginx || true

    log_info "Base images pulled successfully"
}

# Build Go service images
build_images() {
    section_header "Building Docker Images"

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-3"

    log_info "Building sister-service..."
    docker-compose build --no-cache sister-service
    log_info "Sister service build: OK"

    log_info "Building feeder-service..."
    docker-compose build --no-cache feeder-service
    log_info "Feeder service build: OK"
}

# Initialize Redis
init_redis() {
    section_header "Initializing Redis"

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-3"

    log_info "Starting Redis..."
    docker-compose up -d redis

    log_info "Waiting for Redis to be ready..."
    sleep 10

    # Test Redis connection
    if docker exec redis-sync redis-cli ping 2>/dev/null | grep -q PONG; then
        log_info "Redis: Ready"
    else
        log_error "Redis: Not responding"
        exit 1
    fi
}

# Start services
start_services() {
    section_header "Starting Services"

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-3"

    log_info "Starting Redis (if not already running)..."
    docker-compose up -d redis
    sleep 5

    log_info "Starting Sister Service..."
    docker-compose up -d sister-service
    sleep 10

    log_info "Starting PDDIKTI Feeder Service..."
    docker-compose up -d feeder-service
    sleep 10

    log_info "Starting Nginx..."
    docker-compose up -d nginx
    sleep 5

    log_info "Starting monitoring exporters..."
    docker-compose up -d redis-exporter node-exporter nginx-exporter
    sleep 5

    log_info "Waiting for services to stabilize..."
    sleep 15
}

# Verify deployment
verify_deployment() {
    section_header "Verifying Deployment"

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-3"

    log_info "Checking container status..."
    docker-compose ps

    echo ""
    log_info "Checking service health..."

    # Check Redis
    if docker exec redis-sync redis-cli ping 2>/dev/null | grep -q PONG; then
        log_info "Redis: OK"
    else
        log_warn "Redis: Health check failed"
    fi

    # Check Sister Service
    if curl -f -s http://localhost:8083/health > /dev/null 2>&1; then
        log_info "Sister Service: OK"
    else
        log_warn "Sister Service: Health check failed"
        log_warn "Checking logs..."
        docker logs --tail=20 sister-service
    fi

    # Check Feeder Service
    if curl -f -s http://localhost:8084/health > /dev/null 2>&1; then
        log_info "PDDIKTI Feeder Service: OK"
    else
        log_warn "PDDIKTI Feeder Service: Health check failed"
        log_warn "Checking logs..."
        docker logs --tail=20 feeder-service
    fi

    # Check Nginx
    if curl -f -s http://localhost:8080/health > /dev/null 2>&1; then
        log_info "Nginx: OK"
    else
        log_warn "Nginx: Health check failed"
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

    if curl -f -s http://localhost:9113/metrics > /dev/null 2>&1; then
        log_info "Nginx Exporter: OK"
    else
        log_warn "Nginx Exporter: Health check failed"
    fi
}

# Show logs
show_logs() {
    section_header "Recent Logs"

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-3"

    log_info "Last 20 lines of logs for each service:"

    for service in redis sister-service feeder-service nginx; do
        echo ""
        echo -e "${YELLOW}=== $service ===${NC}"
        docker-compose logs --tail=20 "$service" 2>&1 || true
    done
}

# Display sync status
show_sync_status() {
    section_header "Sync Status"

    cd "$DEPLOY_DIR/deployment/vm-ubuntu-3"

    log_info "Checking sync schedules..."

    source .env

    echo ""
    echo -e "${BLUE}Configured Sync Schedules:${NC}"
    echo "  - Dosen Sync:      ${SYNC_SCHEDULE_DOSEN:-0 2 * * *}"
    echo "  - Mahasiswa Sync:  ${SYNC_SCHEDULE_MAHASISWA:-0 3 * * *}"
    echo "  - Data Upload:     ${UPLOAD_SCHEDULE:-0 4 * * 0}"
    echo ""
    echo -e "${BLUE}Sync Configuration:${NC}"
    echo "  - Batch Size:      ${SYNC_BATCH_SIZE:-100}"
    echo "  - Max Retries:     ${SYNC_MAX_RETRIES:-3}"
    echo "  - Upload Enabled:  ${UPLOAD_ENABLED:-true}"
    echo ""
}

# Main execution
main() {
    echo ""
    echo "============================================"
    echo "VM Ubuntu 3 Deployment Script"
    echo "Sync Services (Sister + PDDIKTI Feeder)"
    echo "============================================"
    echo "Timestamp: $(date)"
    echo ""

    check_prerequisites
    pull_code
    check_env_file
    test_database
    test_external_apis
    stop_containers
    pull_images
    build_images
    init_redis
    start_services
    verify_deployment
    show_logs
    show_sync_status

    section_header "Deployment Complete"

    log_info "Services are running!"
    log_info ""
    log_info "Service endpoints:"
    log_info "  - Sister Service:        http://localhost:8083"
    log_info "  - PDDIKTI Feeder:        http://localhost:8084"
    log_info "  - Nginx Health:          http://localhost:8080/health"
    log_info ""
    log_info "Monitoring endpoints:"
    log_info "  - Node Exporter:         http://localhost:9100/metrics"
    log_info "  - Redis Exporter:        http://localhost:9121/metrics"
    log_info "  - Nginx Exporter:        http://localhost:9113/metrics"
    log_info ""
    log_info "Service-specific monitoring:"
    log_info "  - Sister Monitoring:     http://localhost:8083/public/monitoring/active"
    log_info "  - Feeder Monitoring:     http://localhost:8084/public/monitoring/active"
    log_info ""
    log_info "Next steps:"
    log_info "  1. Verify sync schedules are correct"
    log_info "  2. Test manual sync: curl -X POST http://localhost:8083/api/v1/dosen/sync"
    log_info "  3. Configure Kong routes on VM Ubuntu 1"
    log_info "  4. Setup monitoring alerts in Prometheus"
    log_info "  5. Monitor sync logs: docker logs -f sister-service"
    log_info ""

    echo "============================================"
}

# Trap errors
trap 'log_error "Deployment failed at line $LINENO"' ERR

# Run main
main

exit 0
