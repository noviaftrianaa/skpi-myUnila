#!/bin/bash

###############################################################################
# Update Sister Service Environment Variables - Production
# This script populates SISTER_* variables in .env
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

log_info "Deployment directory: $DEPLOYMENT_DIR"
log_info "Environment file: $ENV_FILE"
echo ""

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    log_error ".env file not found at: $ENV_FILE"
    log_error "Please create .env file first from .env.example"
    exit 1
fi

# Source the .env file to get current values
set -a
source "$ENV_FILE"
set +a

log_step "Checking current SISTER DB values..."
echo "SISTER_DB_HOST: ${SISTER_DB_HOST:-NOT SET}"
echo "SISTER_DB_PORT: ${SISTER_DB_PORT:-NOT SET}"
echo "SISTER_DB_DATABASE: ${SISTER_DB_DATABASE:-NOT SET}"
echo "SISTER_DB_USERNAME: ${SISTER_DB_USERNAME:-NOT SET}"
echo "SISTER_DB_PASSWORD: ${SISTER_DB_PASSWORD:+***SET***}"
echo ""

echo "SISTER API Configuration:"
echo "SISTER_API_BASE_URL: ${SISTER_API_BASE_URL:-NOT SET}"
echo "SISTER_API_IDPENGGUNA: ${SISTER_API_IDPENGGUNA:-NOT SET}"
echo "SISTER_API_USERNAME: ${SISTER_API_USERNAME:-NOT SET}"
echo "SISTER_API_PASSWORD: ${SISTER_API_PASSWORD:+***SET***}"
echo ""

if [ -z "$SISTER_DB_HOST" ] || [ -z "$SISTER_DB_DATABASE" ]; then
    log_error "SISTER_DB_HOST or SISTER_DB_DATABASE not set in .env"
    log_error "Please edit .env and set these values first"
    exit 1
fi

if [ -z "$SISTER_API_BASE_URL" ]; then
    log_error "SISTER_API_BASE_URL not set in .env"
    log_error "Please edit .env and set this value first"
    exit 1
fi

log_step "Generating new API_CONFIG_ENCRYPTION_KEY..."
API_CONFIG_ENCRYPTION_KEY="$(openssl rand -base64 32)"
log_info "New encryption key generated"
echo ""

log_step "Updating SISTER_* environment variables..."

# Create backup
BACKUP_FILE="$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
cp "$ENV_FILE" "$BACKUP_FILE"
log_info "Backup created: $BACKUP_FILE"

# Update API_CONFIG_ENCRYPTION_KEY
if grep -q "^API_CONFIG_ENCRYPTION_KEY=" "$ENV_FILE"; then
    sed -i "s|^API_CONFIG_ENCRYPTION_KEY=.*|API_CONFIG_ENCRYPTION_KEY=$API_CONFIG_ENCRYPTION_KEY|" "$ENV_FILE"
    log_info "✓ Updated API_CONFIG_ENCRYPTION_KEY"
else
    echo "API_CONFIG_ENCRYPTION_KEY=$API_CONFIG_ENCRYPTION_KEY" >> "$ENV_FILE"
    log_info "✓ Added API_CONFIG_ENCRYPTION_KEY"
fi

# Update SISTER_APP_NAME
if grep -q "^SISTER_APP_NAME=" "$ENV_FILE"; then
    sed -i "s|^SISTER_APP_NAME=.*|SISTER_APP_NAME=\"Sister Service\"|" "$ENV_FILE"
else
    echo "SISTER_APP_NAME=\"Sister Service\"" >> "$ENV_FILE"
fi

# Update SISTER_APP_PORT
if grep -q "^SISTER_APP_PORT=" "$ENV_FILE"; then
    sed -i "s|^SISTER_APP_PORT=.*|SISTER_APP_PORT=:8083|" "$ENV_FILE"
else
    echo "SISTER_APP_PORT=:8083" >> "$ENV_FILE"
fi

# Update SISTER_APP_ENV
if grep -q "^SISTER_APP_ENV=" "$ENV_FILE"; then
    sed -i "s|^SISTER_APP_ENV=.*|SISTER_APP_ENV=production|" "$ENV_FILE"
else
    echo "SISTER_APP_ENV=production" >> "$ENV_FILE"
fi

# Update SISTER_DB_DRIVER
if grep -q "^SISTER_DB_DRIVER=" "$ENV_FILE"; then
    sed -i "s|^SISTER_DB_DRIVER=.*|SISTER_DB_DRIVER=sqlserver|" "$ENV_FILE"
else
    echo "SISTER_DB_DRIVER=sqlserver" >> "$ENV_FILE"
fi

# Update SISTER_DB_MAX_OPEN_CONNS
if grep -q "^SISTER_DB_MAX_OPEN_CONNS=" "$ENV_FILE"; then
    sed -i "s|^SISTER_DB_MAX_OPEN_CONNS=.*|SISTER_DB_MAX_OPEN_CONNS=25|" "$ENV_FILE"
else
    echo "SISTER_DB_MAX_OPEN_CONNS=25" >> "$ENV_FILE"
fi

# Update SISTER_DB_MAX_IDLE_CONNS
if grep -q "^SISTER_DB_MAX_IDLE_CONNS=" "$ENV_FILE"; then
    sed -i "s|^SISTER_DB_MAX_IDLE_CONNS=.*|SISTER_DB_MAX_IDLE_CONNS=5|" "$ENV_FILE"
else
    echo "SISTER_DB_MAX_IDLE_CONNS=5" >> "$ENV_FILE"
fi

# Update SISTER_DB_CONN_MAX_LIFETIME
if grep -q "^SISTER_DB_CONN_MAX_LIFETIME=" "$ENV_FILE"; then
    sed -i "s|^SISTER_DB_CONN_MAX_LIFETIME=.*|SISTER_DB_CONN_MAX_LIFETIME=5m|" "$ENV_FILE"
else
    echo "SISTER_DB_CONN_MAX_LIFETIME=5m" >> "$ENV_FILE"
fi

echo ""
log_step "Verifying updated values..."
echo ""
grep "^SISTER_" "$ENV_FILE" | while read -r line; do
    key=$(echo "$line" | cut -d= -f1)
    value=$(echo "$line" | cut -d= -f2-)

    # Mask sensitive values
    if [[ "$key" == *"PASSWORD"* ]] || [[ "$key" == *"KEY"* ]]; then
        echo "  $key=***"
    else
        echo "  $key=$value"
    fi
done

echo ""
grep "^API_CONFIG_ENCRYPTION_KEY=" "$ENV_FILE" | while read -r line; do
    echo "  API_CONFIG_ENCRYPTION_KEY=***"
done

echo ""
log_info "✓ Environment variables updated successfully!"
log_info ""
log_warn "Next steps:"
log_warn "  1. Review the changes: grep -E 'SISTER_|API_CONFIG' $ENV_FILE"
log_warn "  2. Restart sister service:"
log_warn "     cd $DEPLOYMENT_DIR"
log_warn "     docker compose -f services/sister/docker-compose.yml down"
log_warn "     docker compose -f services/sister/docker-compose.yml up -d"
log_warn ""
log_info "Backup file: $BACKUP_FILE"
echo ""
