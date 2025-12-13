#!/bin/bash

###############################################################################
# Update Auth Service Environment Variables
# This script populates AUTH_* variables from existing DB_MSSQL_* values
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

log_step "Generating new AUTH_APP_KEY..."
AUTH_APP_KEY="base64:$(openssl rand -base64 32)"
log_info "New key generated"
echo ""

log_step "Generating new JWT_SECRET..."
JWT_SECRET="base64:$(openssl rand -base64 64)"
log_info "New JWT secret generated"
echo ""

log_step "Updating AUTH_* environment variables..."

# Create backup
BACKUP_FILE="$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
cp "$ENV_FILE" "$BACKUP_FILE"
log_info "Backup created: $BACKUP_FILE"

# Update AUTH_APP_KEY
if grep -q "^AUTH_APP_KEY=" "$ENV_FILE"; then
    sed -i "s|^AUTH_APP_KEY=.*|AUTH_APP_KEY=$AUTH_APP_KEY|" "$ENV_FILE"
    log_info "✓ Updated AUTH_APP_KEY"
else
    echo "AUTH_APP_KEY=$AUTH_APP_KEY" >> "$ENV_FILE"
    log_info "✓ Added AUTH_APP_KEY"
fi

# Update AUTH_DB_HOST
if grep -q "^AUTH_DB_HOST=" "$ENV_FILE"; then
    sed -i "s|^AUTH_DB_HOST=.*|AUTH_DB_HOST=$DB_MSSQL_HOST|" "$ENV_FILE"
    log_info "✓ Updated AUTH_DB_HOST=$DB_MSSQL_HOST"
else
    echo "AUTH_DB_HOST=$DB_MSSQL_HOST" >> "$ENV_FILE"
    log_info "✓ Added AUTH_DB_HOST=$DB_MSSQL_HOST"
fi

# Update AUTH_DB_PORT
AUTH_DB_PORT="${DB_MSSQL_PORT:-1433}"
if grep -q "^AUTH_DB_PORT=" "$ENV_FILE"; then
    sed -i "s|^AUTH_DB_PORT=.*|AUTH_DB_PORT=$AUTH_DB_PORT|" "$ENV_FILE"
    log_info "✓ Updated AUTH_DB_PORT=$AUTH_DB_PORT"
else
    echo "AUTH_DB_PORT=$AUTH_DB_PORT" >> "$ENV_FILE"
    log_info "✓ Added AUTH_DB_PORT=$AUTH_DB_PORT"
fi

# Update AUTH_DB_DATABASE
if grep -q "^AUTH_DB_DATABASE=" "$ENV_FILE"; then
    sed -i "s|^AUTH_DB_DATABASE=.*|AUTH_DB_DATABASE=$DB_MSSQL_DATABASE|" "$ENV_FILE"
    log_info "✓ Updated AUTH_DB_DATABASE=$DB_MSSQL_DATABASE"
else
    echo "AUTH_DB_DATABASE=$DB_MSSQL_DATABASE" >> "$ENV_FILE"
    log_info "✓ Added AUTH_DB_DATABASE=$DB_MSSQL_DATABASE"
fi

# Update AUTH_DB_USERNAME
if grep -q "^AUTH_DB_USERNAME=" "$ENV_FILE"; then
    sed -i "s|^AUTH_DB_USERNAME=.*|AUTH_DB_USERNAME=$DB_MSSQL_USERNAME|" "$ENV_FILE"
    log_info "✓ Updated AUTH_DB_USERNAME=$DB_MSSQL_USERNAME"
else
    echo "AUTH_DB_USERNAME=$DB_MSSQL_USERNAME" >> "$ENV_FILE"
    log_info "✓ Added AUTH_DB_USERNAME=$DB_MSSQL_USERNAME"
fi

# Update AUTH_DB_PASSWORD
if grep -q "^AUTH_DB_PASSWORD=" "$ENV_FILE"; then
    sed -i "s|^AUTH_DB_PASSWORD=.*|AUTH_DB_PASSWORD=$DB_MSSQL_PASSWORD|" "$ENV_FILE"
    log_info "✓ Updated AUTH_DB_PASSWORD=***"
else
    echo "AUTH_DB_PASSWORD=$DB_MSSQL_PASSWORD" >> "$ENV_FILE"
    log_info "✓ Added AUTH_DB_PASSWORD=***"
fi

# Update AUTH_APP_URL
AUTH_APP_URL="${AUTH_APP_URL:-http://${VM_IP:-192.168.123.172}:9800/auth-service}"
if grep -q "^AUTH_APP_URL=" "$ENV_FILE"; then
    sed -i "s|^AUTH_APP_URL=.*|AUTH_APP_URL=$AUTH_APP_URL|" "$ENV_FILE"
    log_info "✓ Updated AUTH_APP_URL=$AUTH_APP_URL"
else
    echo "AUTH_APP_URL=$AUTH_APP_URL" >> "$ENV_FILE"
    log_info "✓ Added AUTH_APP_URL=$AUTH_APP_URL"
fi

# Update AUTH_REDIS_HOST
if grep -q "^AUTH_REDIS_HOST=" "$ENV_FILE"; then
    sed -i "s|^AUTH_REDIS_HOST=.*|AUTH_REDIS_HOST=redis|" "$ENV_FILE"
    log_info "✓ Updated AUTH_REDIS_HOST=redis"
else
    echo "AUTH_REDIS_HOST=redis" >> "$ENV_FILE"
    log_info "✓ Added AUTH_REDIS_HOST=redis"
fi

# Update AUTH_REDIS_PORT
if grep -q "^AUTH_REDIS_PORT=" "$ENV_FILE"; then
    sed -i "s|^AUTH_REDIS_PORT=.*|AUTH_REDIS_PORT=6379|" "$ENV_FILE"
    log_info "✓ Updated AUTH_REDIS_PORT=6379"
else
    echo "AUTH_REDIS_PORT=6379" >> "$ENV_FILE"
    log_info "✓ Added AUTH_REDIS_PORT=6379"
fi

# Update AUTH_APP_ENV
if grep -q "^AUTH_APP_ENV=" "$ENV_FILE"; then
    sed -i "s|^AUTH_APP_ENV=.*|AUTH_APP_ENV=production|" "$ENV_FILE"
else
    echo "AUTH_APP_ENV=production" >> "$ENV_FILE"
fi

# Update AUTH_APP_DEBUG
if grep -q "^AUTH_APP_DEBUG=" "$ENV_FILE"; then
    sed -i "s|^AUTH_APP_DEBUG=.*|AUTH_APP_DEBUG=false|" "$ENV_FILE"
else
    echo "AUTH_APP_DEBUG=false" >> "$ENV_FILE"
fi

# Update AUTH_APLIKASI_ID (for login logging)
if grep -q "^AUTH_APLIKASI_ID=" "$ENV_FILE"; then
    sed -i "s|^AUTH_APLIKASI_ID=.*|AUTH_APLIKASI_ID=6df39588-e4d7-4e92-b3b1-e7b5078a3832|" "$ENV_FILE"
    log_info "✓ Updated AUTH_APLIKASI_ID=6df39588-e4d7-4e92-b3b1-e7b5078a3832"
else
    echo "AUTH_APLIKASI_ID=6df39588-e4d7-4e92-b3b1-e7b5078a3832" >> "$ENV_FILE"
    log_info "✓ Added AUTH_APLIKASI_ID=6df39588-e4d7-4e92-b3b1-e7b5078a3832"
fi

# Update JWT_SECRET
if grep -q "^JWT_SECRET=" "$ENV_FILE"; then
    sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" "$ENV_FILE"
    log_info "✓ Updated JWT_SECRET"
else
    echo "JWT_SECRET=$JWT_SECRET" >> "$ENV_FILE"
    log_info "✓ Added JWT_SECRET"
fi

echo ""
log_step "Verifying updated values..."
echo ""
grep "^AUTH_" "$ENV_FILE" | while read -r line; do
    key=$(echo "$line" | cut -d= -f1)
    value=$(echo "$line" | cut -d= -f2-)

    # Mask sensitive values
    if [[ "$key" == *"PASSWORD"* ]] || [[ "$key" == *"KEY"* ]] || [[ "$key" == *"SECRET"* ]]; then
        echo "  $key=***"
    else
        echo "  $key=$value"
    fi
done

echo ""
grep "^JWT_SECRET=" "$ENV_FILE" | while read -r line; do
    echo "  JWT_SECRET=***"
done

echo ""
log_info "✓ Environment variables updated successfully!"
log_info ""
log_warn "Next steps:"
log_warn "  1. Review the changes: cat $ENV_FILE | grep -E 'AUTH_|JWT_'"
log_warn "  2. Restart auth service:"
log_warn "     cd $DEPLOYMENT_DIR"
log_warn "     ./scripts/restart-auth-with-env.sh"
log_warn ""
log_info "Backup file: $BACKUP_FILE"
echo ""
