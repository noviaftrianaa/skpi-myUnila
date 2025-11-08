#!/bin/bash

###############################################################################
# Update Dashboard Environment Variables
# This script populates DASHBOARD_* variables from existing DB_MSSQL_* values
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
    log_error "Please create .env file first or run setup script"
    exit 1
fi

# Source the .env file to get current values
set -a
source "$ENV_FILE"
set +a

log_step "Checking current DB_MSSQL_* values..."
echo "DB_MSSQL_HOST: ${DB_MSSQL_HOST:-NOT SET}"
echo "DB_MSSQL_PORT: ${DB_MSSQL_PORT:-NOT SET}"
echo "DB_MSSQL_DATABASE: ${DB_MSSQL_DATABASE:-NOT SET}"
echo "DB_MSSQL_USERNAME: ${DB_MSSQL_USERNAME:-NOT SET}"
echo "DB_MSSQL_PASSWORD: ${DB_MSSQL_PASSWORD:+***SET***}"
echo ""

if [ -z "$DB_MSSQL_HOST" ] || [ -z "$DB_MSSQL_DATABASE" ]; then
    log_error "DB_MSSQL_HOST or DB_MSSQL_DATABASE not set in .env"
    log_error "Please set these values first"
    exit 1
fi

log_step "Generating new DASHBOARD_APP_KEY..."
DASHBOARD_APP_KEY="base64:$(openssl rand -base64 32)"
log_info "New key generated"
echo ""

log_step "Updating DASHBOARD_* environment variables..."

# Create backup
BACKUP_FILE="$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
cp "$ENV_FILE" "$BACKUP_FILE"
log_info "Backup created: $BACKUP_FILE"

# Update DASHBOARD_APP_KEY
if grep -q "^DASHBOARD_APP_KEY=" "$ENV_FILE"; then
    sed -i "s|^DASHBOARD_APP_KEY=.*|DASHBOARD_APP_KEY=$DASHBOARD_APP_KEY|" "$ENV_FILE"
    log_info "✓ Updated DASHBOARD_APP_KEY"
else
    echo "DASHBOARD_APP_KEY=$DASHBOARD_APP_KEY" >> "$ENV_FILE"
    log_info "✓ Added DASHBOARD_APP_KEY"
fi

# Update DASHBOARD_DB_HOST
if grep -q "^DASHBOARD_DB_HOST=" "$ENV_FILE"; then
    sed -i "s|^DASHBOARD_DB_HOST=.*|DASHBOARD_DB_HOST=$DB_MSSQL_HOST|" "$ENV_FILE"
    log_info "✓ Updated DASHBOARD_DB_HOST=$DB_MSSQL_HOST"
else
    echo "DASHBOARD_DB_HOST=$DB_MSSQL_HOST" >> "$ENV_FILE"
    log_info "✓ Added DASHBOARD_DB_HOST=$DB_MSSQL_HOST"
fi

# Update DASHBOARD_DB_PORT
DASHBOARD_DB_PORT="${DB_MSSQL_PORT:-1433}"
if grep -q "^DASHBOARD_DB_PORT=" "$ENV_FILE"; then
    sed -i "s|^DASHBOARD_DB_PORT=.*|DASHBOARD_DB_PORT=$DASHBOARD_DB_PORT|" "$ENV_FILE"
    log_info "✓ Updated DASHBOARD_DB_PORT=$DASHBOARD_DB_PORT"
else
    echo "DASHBOARD_DB_PORT=$DASHBOARD_DB_PORT" >> "$ENV_FILE"
    log_info "✓ Added DASHBOARD_DB_PORT=$DASHBOARD_DB_PORT"
fi

# Update DASHBOARD_DB_DATABASE
if grep -q "^DASHBOARD_DB_DATABASE=" "$ENV_FILE"; then
    sed -i "s|^DASHBOARD_DB_DATABASE=.*|DASHBOARD_DB_DATABASE=$DB_MSSQL_DATABASE|" "$ENV_FILE"
    log_info "✓ Updated DASHBOARD_DB_DATABASE=$DB_MSSQL_DATABASE"
else
    echo "DASHBOARD_DB_DATABASE=$DB_MSSQL_DATABASE" >> "$ENV_FILE"
    log_info "✓ Added DASHBOARD_DB_DATABASE=$DB_MSSQL_DATABASE"
fi

# Update DASHBOARD_DB_USERNAME
if grep -q "^DASHBOARD_DB_USERNAME=" "$ENV_FILE"; then
    sed -i "s|^DASHBOARD_DB_USERNAME=.*|DASHBOARD_DB_USERNAME=$DB_MSSQL_USERNAME|" "$ENV_FILE"
    log_info "✓ Updated DASHBOARD_DB_USERNAME=$DB_MSSQL_USERNAME"
else
    echo "DASHBOARD_DB_USERNAME=$DB_MSSQL_USERNAME" >> "$ENV_FILE"
    log_info "✓ Added DASHBOARD_DB_USERNAME=$DB_MSSQL_USERNAME"
fi

# Update DASHBOARD_DB_PASSWORD
if grep -q "^DASHBOARD_DB_PASSWORD=" "$ENV_FILE"; then
    sed -i "s|^DASHBOARD_DB_PASSWORD=.*|DASHBOARD_DB_PASSWORD=$DB_MSSQL_PASSWORD|" "$ENV_FILE"
    log_info "✓ Updated DASHBOARD_DB_PASSWORD=***"
else
    echo "DASHBOARD_DB_PASSWORD=$DB_MSSQL_PASSWORD" >> "$ENV_FILE"
    log_info "✓ Added DASHBOARD_DB_PASSWORD=***"
fi

# Update DASHBOARD_APP_URL
DASHBOARD_APP_URL="${DASHBOARD_APP_URL:-http://${VM_IP:-192.168.123.172}:9800/dashboard-service}"
if grep -q "^DASHBOARD_APP_URL=" "$ENV_FILE"; then
    sed -i "s|^DASHBOARD_APP_URL=.*|DASHBOARD_APP_URL=$DASHBOARD_APP_URL|" "$ENV_FILE"
    log_info "✓ Updated DASHBOARD_APP_URL=$DASHBOARD_APP_URL"
else
    echo "DASHBOARD_APP_URL=$DASHBOARD_APP_URL" >> "$ENV_FILE"
    log_info "✓ Added DASHBOARD_APP_URL=$DASHBOARD_APP_URL"
fi

# Update DASHBOARD_APP_ENV
if grep -q "^DASHBOARD_APP_ENV=" "$ENV_FILE"; then
    sed -i "s|^DASHBOARD_APP_ENV=.*|DASHBOARD_APP_ENV=production|" "$ENV_FILE"
else
    echo "DASHBOARD_APP_ENV=production" >> "$ENV_FILE"
fi

# Update DASHBOARD_APP_DEBUG
if grep -q "^DASHBOARD_APP_DEBUG=" "$ENV_FILE"; then
    sed -i "s|^DASHBOARD_APP_DEBUG=.*|DASHBOARD_APP_DEBUG=false|" "$ENV_FILE"
else
    echo "DASHBOARD_APP_DEBUG=false" >> "$ENV_FILE"
fi

echo ""
log_step "Verifying updated values..."
echo ""
grep "^DASHBOARD_" "$ENV_FILE" | while read -r line; do
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
log_info "✓ Environment variables updated successfully!"
log_info ""
log_warn "Next steps:"
log_warn "  1. Review the changes: cat $ENV_FILE | grep DASHBOARD"
log_warn "  2. Restart dashboard service:"
log_warn "     cd $DEPLOYMENT_DIR/services/3-backend"
log_warn "     docker compose -f docker-compose.dashboard.yml restart"
log_warn ""
log_info "Backup file: $BACKUP_FILE"
echo ""
