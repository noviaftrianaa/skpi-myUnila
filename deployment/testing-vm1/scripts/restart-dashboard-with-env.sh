#!/bin/bash

###############################################################################
# Restart Dashboard Service with Environment Variables
# This script sources .env and restarts dashboard service with proper env vars
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Get deployment directory (parent of scripts)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOYMENT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$DEPLOYMENT_DIR/.env"
COMPOSE_DIR="$DEPLOYMENT_DIR/services/3-backend"
COMPOSE_FILE="docker-compose.dashboard.yml"

log_info "Deployment directory: $DEPLOYMENT_DIR"
log_info "Environment file: $ENV_FILE"
log_info "Compose directory: $COMPOSE_DIR"
echo ""

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    log_error ".env file not found at: $ENV_FILE"
    exit 1
fi

log_step "Loading environment variables from .env..."

# Source the .env file to load variables
set -a
source "$ENV_FILE"
set +a

log_step "Verifying DASHBOARD_* variables..."
echo "DASHBOARD_APP_KEY: ${DASHBOARD_APP_KEY:0:20}..."
echo "DASHBOARD_DB_HOST: ${DASHBOARD_DB_HOST}"
echo "DASHBOARD_DB_DATABASE: ${DASHBOARD_DB_DATABASE}"
echo "DASHBOARD_DB_USERNAME: ${DASHBOARD_DB_USERNAME}"
echo "DASHBOARD_REDIS_HOST: ${DASHBOARD_REDIS_HOST}"
echo ""

if [ -z "$DASHBOARD_APP_KEY" ] || [ -z "$DASHBOARD_DB_HOST" ] || [ -z "$DASHBOARD_DB_DATABASE" ]; then
    log_error "Required DASHBOARD_* variables not set in .env"
    exit 1
fi

log_step "Stopping dashboard service..."
cd "$COMPOSE_DIR"
docker compose -f "$COMPOSE_FILE" down

log_step "Starting dashboard service with environment variables..."
docker compose -f "$COMPOSE_FILE" up -d

log_info "Waiting 15 seconds for service to start..."
sleep 15

log_step "Verifying environment variables in container..."
echo ""
docker exec myunila-dashboard-service env | grep -E "^APP_KEY=|^APP_ENV=|^DB_HOST=|^DB_DATABASE=|^DB_USERNAME=|^REDIS_HOST=" || true

log_step "Checking container logs..."
echo ""
docker logs myunila-dashboard-service --tail 20

echo ""
log_info "✓ Dashboard service restarted!"
log_info ""
log_warn "Test endpoints:"
log_warn "  Health: curl http://192.168.123.172:9800/dashboard-service/api/health"
log_warn "  API v1: curl http://192.168.123.172:9800/dashboard-service/api/v1/unila/profile"
echo ""
