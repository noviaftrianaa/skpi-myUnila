#!/bin/bash

###############################################################################
# Fix Auth Service Configuration
# This script updates all auth-service configs to match dashboard-service
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
log_info "  Auth Service Configuration Fix"
log_info "========================================="
echo ""

# Get paths
DEPLOYMENT_DIR="/var/www/my-unila/deployment/testing-vm1"
SCRIPTS_DIR="$DEPLOYMENT_DIR/scripts"
BACKEND_DIR="$DEPLOYMENT_DIR/services/3-backend"

log_step "1. Copying updated files from home directory..."
echo ""

# Copy docker-compose.auth.yml
if [ -f ~/docker-compose.auth.yml ]; then
    cp ~/docker-compose.auth.yml "$BACKEND_DIR/"
    log_info "✓ Updated docker-compose.auth.yml"
else
    log_warn "docker-compose.auth.yml not found in home directory"
fi

# Copy update-auth-env.sh
if [ -f ~/update-auth-env.sh ]; then
    cp ~/update-auth-env.sh "$SCRIPTS_DIR/"
    chmod +x "$SCRIPTS_DIR/update-auth-env.sh"
    log_info "✓ Updated update-auth-env.sh"
else
    log_warn "update-auth-env.sh not found in home directory"
fi

# Copy diagnose-auth-login.sh
if [ -f ~/diagnose-auth-login.sh ]; then
    cp ~/diagnose-auth-login.sh "$SCRIPTS_DIR/"
    chmod +x "$SCRIPTS_DIR/diagnose-auth-login.sh"
    log_info "✓ Added diagnose-auth-login.sh"
else
    log_warn "diagnose-auth-login.sh not found in home directory"
fi

echo ""
log_step "2. Running update-auth-env.sh to populate environment variables..."
echo ""

cd "$SCRIPTS_DIR"
./update-auth-env.sh

echo ""
log_step "3. Stopping auth-service..."
echo ""

cd "$BACKEND_DIR"
docker compose -f docker-compose.auth.yml down

echo ""
log_step "4. Starting auth-service with updated configuration..."
echo ""

docker compose -f docker-compose.auth.yml up -d

echo ""
log_info "Waiting 20 seconds for service to start..."
sleep 20

echo ""
log_step "5. Verifying environment variables in container..."
echo ""

docker exec myunila-auth-service env | grep -E "^APP_|^DB_|^REDIS_|^JWT_|^APLIKASI_" | sort

echo ""
log_step "6. Checking container status..."
echo ""

docker ps --filter "name=myunila-auth-service" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
log_step "7. Checking container logs..."
echo ""

docker logs myunila-auth-service --tail 30

echo ""
log_step "8. Testing auth-service health endpoint..."
echo ""

HEALTH_RESPONSE=$(curl -s http://localhost/api/health 2>&1 || echo "FAILED")
echo "$HEALTH_RESPONSE"

echo ""
log_step "9. Testing database connectivity..."
echo ""

docker exec myunila-auth-service php -r "
try {
    \$host = getenv('DB_HOST');
    \$port = getenv('DB_PORT');
    \$database = getenv('DB_DATABASE');
    \$username = getenv('DB_USERNAME');
    \$password = getenv('DB_PASSWORD');

    \$dsn = \"sqlsrv:Server={\$host},{\$port};Database={\$database}\";
    \$pdo = new PDO(\$dsn, \$username, \$password);
    echo \"✓ Database connection successful!\n\";
    echo \"Server: \$host:\$port\n\";
    echo \"Database: \$database\n\";
} catch (Exception \$e) {
    echo \"✗ Database connection failed: \" . \$e->getMessage() . \"\n\";
    exit(1);
}
"

echo ""
log_step "10. Testing Redis connectivity..."
echo ""

docker exec myunila-auth-service php -r "
try {
    \$redis = new Redis();
    \$host = getenv('REDIS_HOST');
    \$port = getenv('REDIS_PORT');
    \$redis->connect(\$host, \$port);
    echo \"✓ Redis connection successful!\n\";
    echo \"Server: \$host:\$port\n\";
} catch (Exception \$e) {
    echo \"✗ Redis connection failed: \" . \$e->getMessage() . \"\n\";
    exit(1);
}
"

echo ""
log_info "========================================="
log_info "  Configuration Update Complete!"
log_info "========================================="
echo ""

log_warn "Next: Test login endpoint"
echo ""
echo "  curl -v -X POST http://192.168.123.172:9800/auth-service/api/v1/auth/login \\"
echo "    -H \"Content-Type: application/json\" \\"
echo "    -d '{\"username\":\"admin\",\"password\":\"Admin@2024\"}'"
echo ""

log_warn "If login is slow (>10 seconds), run diagnostic:"
echo "  cd $SCRIPTS_DIR"
echo "  ./diagnose-auth-login.sh"
echo ""
