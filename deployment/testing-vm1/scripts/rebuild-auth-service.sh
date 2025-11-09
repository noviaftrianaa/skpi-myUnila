#!/bin/bash

###############################################################################
# Rebuild Auth Service with Latest Code
# Pull latest code, rebuild Docker image, and restart service
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

echo ""
log_info "========================================="
log_info "  Rebuild Auth Service"
log_info "========================================="
echo ""

# Get paths
REPO_DIR="/var/www/my-unila"
DEPLOYMENT_DIR="$REPO_DIR/deployment/testing-vm1"
BACKEND_DIR="$DEPLOYMENT_DIR/services/3-backend"

log_step "1. Pulling latest code from repository..."
echo ""

cd "$REPO_DIR"
git pull

echo ""
log_step "2. Stopping auth-service..."
echo ""

cd "$BACKEND_DIR"
docker compose -f docker-compose.auth.yml down

echo ""
log_step "3. Rebuilding auth-service image (this may take a few minutes)..."
echo ""

docker compose -f docker-compose.auth.yml build --no-cache auth-service

echo ""
log_step "4. Starting auth-service with new image..."
echo ""

docker compose -f docker-compose.auth.yml up -d

echo ""
log_info "Waiting 20 seconds for service to start..."
sleep 20

echo ""
log_step "5. Checking container status..."
echo ""

docker ps --filter "name=myunila-auth-service" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
log_step "6. Checking container logs..."
echo ""

docker logs myunila-auth-service --tail 30

echo ""
log_step "7. Testing health endpoint..."
echo ""

HEALTH_RESPONSE=$(curl -s http://localhost/api/health 2>&1 || echo "FAILED")
echo "$HEALTH_RESPONSE"

echo ""
log_info "========================================="
log_info "  Rebuild Complete!"
log_info "========================================="
echo ""

log_warn "Test login endpoint:"
echo ""
echo "  curl -v -X POST http://192.168.123.172:9800/auth-service/api/v1/auth/login \\"
echo "    -H \"Content-Type: application/json\" \\"
echo "    -d '{\"username\":\"admin\",\"password\":\"Admin@2024\"}'"
echo ""

log_info "Login should now complete in < 5 seconds (instead of timeout)"
echo ""
