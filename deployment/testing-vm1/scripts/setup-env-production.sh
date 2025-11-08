#!/bin/bash

###############################################################################
# Setup Production Environment Files
# This script copies .env template files to services for production deployment
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Get project root (3 levels up from this script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
DEPLOYMENT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TEMPLATES_DIR="$DEPLOYMENT_DIR/configs/env-templates"

log_info "Project root: $PROJECT_ROOT"
log_info "Templates directory: $TEMPLATES_DIR"
echo ""

###############################################################################
# Setup Dashboard Service .env
###############################################################################
log_info "=== Setting up Dashboard Service .env ==="

DASHBOARD_SERVICE_DIR="$PROJECT_ROOT/backend/dashboard-service"
DASHBOARD_TEMPLATE="$TEMPLATES_DIR/dashboard-service.env"
DASHBOARD_ENV="$DASHBOARD_SERVICE_DIR/.env"

if [ -f "$DASHBOARD_TEMPLATE" ]; then
    log_info "Copying template to .env for dashboard-service"
    cp "$DASHBOARD_TEMPLATE" "$DASHBOARD_ENV"

    log_warn "Please edit the following file and update credentials:"
    log_warn "  $DASHBOARD_ENV"
    log_warn ""
    log_warn "Update these values:"
    log_warn "  - DB_USERNAME"
    log_warn "  - DB_PASSWORD"
    log_warn "  - SISTER_DB_USERNAME"
    log_warn "  - SISTER_DB_PASSWORD"
    echo ""
else
    log_error "Template not found: $DASHBOARD_TEMPLATE"
    exit 1
fi

###############################################################################
# Setup Auth Service .env
###############################################################################
log_info "=== Setting up Auth Service .env ==="

AUTH_SERVICE_DIR="$PROJECT_ROOT/backend/auth-service"
AUTH_TEMPLATE="$TEMPLATES_DIR/auth-service.env"
AUTH_ENV="$AUTH_SERVICE_DIR/.env"

if [ -f "$AUTH_TEMPLATE" ]; then
    log_info "Copying template to .env for auth-service"
    cp "$AUTH_TEMPLATE" "$AUTH_ENV"

    log_warn "Please edit the following file and update credentials:"
    log_warn "  $AUTH_ENV"
    log_warn ""
    log_warn "Update these values:"
    log_warn "  - APP_KEY (generate with: php artisan key:generate --show)"
    log_warn "  - DB_USERNAME"
    log_warn "  - DB_PASSWORD"
    log_warn "  - JWT_SECRET (change to a random 32+ character string)"
    echo ""
else
    log_error "Template not found: $AUTH_TEMPLATE"
    exit 1
fi

###############################################################################
# Setup Sister Service .env
###############################################################################
log_info "=== Setting up Sister Service .env ==="

SISTER_SERVICE_DIR="$PROJECT_ROOT/backend/sister-service"
SISTER_TEMPLATE="$TEMPLATES_DIR/sister-service.env"
SISTER_ENV="$SISTER_SERVICE_DIR/.env"

if [ -f "$SISTER_TEMPLATE" ]; then
    log_info "Copying template to .env for sister-service"
    cp "$SISTER_TEMPLATE" "$SISTER_ENV"

    log_warn "Please edit the following file and update credentials:"
    log_warn "  $SISTER_ENV"
    log_warn ""
    log_warn "Update these values:"
    log_warn "  - JWT_SECRET (MUST match auth-service JWT_SECRET)"
    log_warn "  - API_CONFIG_ENCRYPTION_KEY (generate with: openssl rand -base64 32 | head -c 32)"
    log_warn "  - SISTER_API_USERNAME"
    log_warn "  - SISTER_API_PASSWORD"
    log_warn "  - FEEDER_API_USERNAME"
    log_warn "  - FEEDER_API_PASSWORD"
    log_warn "  - DB_USER"
    log_warn "  - DB_PASSWORD"
    echo ""
else
    log_error "Template not found: $SISTER_TEMPLATE"
    exit 1
fi

###############################################################################
# Summary
###############################################################################
log_info "=== Setup Complete ==="
echo ""
log_info "Environment files created from templates:"
log_info "  - $DASHBOARD_ENV"
log_info "  - $AUTH_ENV"
log_info "  - $SISTER_ENV"
echo ""
log_info "Next steps:"
log_info "1. Edit each .env file and update credentials (see warnings above)"
log_info "2. Rebuild services with new .env files:"
log_info "   cd $PROJECT_ROOT/deployment/testing-vm1/services/3-backend"
log_info "   docker-compose -f docker-compose.dashboard.yml build --no-cache"
log_info "   docker-compose -f docker-compose.dashboard.yml up -d"
log_info "   docker-compose -f docker-compose.auth.yml build --no-cache"
log_info "   docker-compose -f docker-compose.auth.yml up -d"
log_info ""
log_info "3. Rebuild sister-service:"
log_info "   cd $PROJECT_ROOT/deployment/testing-vm1/services/3-backend"
log_info "   docker-compose -f docker-compose.sister.yml build --no-cache"
log_info "   docker-compose -f docker-compose.sister.yml up -d"
echo ""
