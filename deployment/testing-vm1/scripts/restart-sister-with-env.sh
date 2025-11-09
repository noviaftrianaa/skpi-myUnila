#!/bin/bash

###############################################################################
# Restart Sister Service with Environment Variables
# This script sources .env and restarts sister service with proper env vars
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
COMPOSE_FILE="docker-compose.sister.yml"

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

log_step "Verifying SISTER_* variables..."
echo "SISTER_APP_PORT: ${SISTER_APP_PORT}"
echo "SISTER_DB_HOST: ${SISTER_DB_HOST}"
echo "SISTER_DB_DATABASE: ${SISTER_DB_DATABASE}"
echo "SISTER_DB_USERNAME: ${SISTER_DB_USERNAME}"
echo "SISTER_REDIS_HOST: ${SISTER_REDIS_HOST}"
echo "SISTER_API_BASE_URL: ${SISTER_API_BASE_URL}"
echo "API_CONFIG_ENCRYPTION_KEY: ${API_CONFIG_ENCRYPTION_KEY:0:20}..."
echo ""

if [ -z "$SISTER_DB_HOST" ] || [ -z "$SISTER_DB_DATABASE" ] || [ -z "$SISTER_API_BASE_URL" ] || [ -z "$API_CONFIG_ENCRYPTION_KEY" ]; then
    log_error "Required SISTER_* or API_CONFIG_ENCRYPTION_KEY variables not set in .env"
    exit 1
fi

log_step "Stopping sister service..."
cd "$COMPOSE_DIR"
docker compose -f "$COMPOSE_FILE" down

log_step "Starting sister service with environment variables..."
docker compose -f "$COMPOSE_FILE" up -d

log_info "Waiting 15 seconds for service to start..."
sleep 15

log_step "Verifying environment variables in container..."
echo ""
docker exec myunila-sister-service env | grep -E "^APP_NAME=|^APP_PORT=|^DB_HOST=|^DB_DATABASE=|^DB_USERNAME=|^REDIS_HOST=|^SISTER_API_BASE_URL=" || true

log_step "Checking container logs..."
echo ""
docker logs myunila-sister-service --tail 30

echo ""
log_info "✓ Sister service restarted!"
log_info ""
log_warn "Test endpoints:"
log_warn "  Health: curl http://192.168.123.172:9800/sister-service/api/health"
log_warn "  API v1: curl http://192.168.123.172:9800/sister-service/api/v1/dosen"
echo ""
