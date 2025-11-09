#!/bin/bash

###############################################################################
# Restart Auth Service with Environment Variables
# This script sources .env and restarts auth service with proper env vars
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
COMPOSE_FILE="docker-compose.auth.yml"

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

log_step "Verifying AUTH_* variables..."
echo "AUTH_APP_KEY: ${AUTH_APP_KEY:0:20}..."
echo "AUTH_DB_HOST: ${AUTH_DB_HOST}"
echo "AUTH_DB_DATABASE: ${AUTH_DB_DATABASE}"
echo "AUTH_DB_USERNAME: ${AUTH_DB_USERNAME}"
echo "AUTH_REDIS_HOST: ${AUTH_REDIS_HOST}"
echo "JWT_SECRET: ${JWT_SECRET:0:20}..."
echo ""

if [ -z "$AUTH_APP_KEY" ] || [ -z "$AUTH_DB_HOST" ] || [ -z "$AUTH_DB_DATABASE" ] || [ -z "$JWT_SECRET" ]; then
    log_error "Required AUTH_* or JWT_SECRET variables not set in .env"
    exit 1
fi

log_step "Stopping auth service..."
cd "$COMPOSE_DIR"
docker compose -f "$COMPOSE_FILE" down

log_step "Starting auth service with environment variables..."
docker compose -f "$COMPOSE_FILE" up -d

log_info "Waiting 15 seconds for service to start..."
sleep 15

log_step "Verifying environment variables in container..."
echo ""
docker exec myunila-auth-service env | grep -E "^APP_KEY=|^APP_ENV=|^DB_HOST=|^DB_DATABASE=|^DB_USERNAME=|^REDIS_HOST=|^JWT_SECRET=" || true

log_step "Checking container logs..."
echo ""
docker logs myunila-auth-service --tail 20

echo ""
log_info "✓ Auth service restarted!"
log_info ""
log_warn "Test endpoints:"
log_warn "  Health: curl http://192.168.123.172:9800/auth-service/api/health"
log_warn "  Login:  curl -X POST http://192.168.123.172:9800/auth-service/api/v1/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"user@example.com\",\"password\":\"password\"}'"
echo ""
