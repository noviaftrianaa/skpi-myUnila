#!/bin/bash

###############################################################################
# Diagnose Auth Service Login Issues
# This script checks logs, configuration, and database connectivity
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

log_step "1. Checking auth-service container status..."
echo ""
docker ps -a --filter "name=myunila-auth-service" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

log_step "2. Checking auth-service healthcheck..."
echo ""
docker inspect myunila-auth-service --format='{{json .State.Health}}' | python3 -m json.tool 2>/dev/null || echo "No healthcheck data"
echo ""

log_step "3. Checking Laravel logs (last 50 lines)..."
echo ""
docker exec myunila-auth-service cat /var/www/storage/logs/laravel.log 2>/dev/null | tail -50 || log_warn "Could not read Laravel logs"
echo ""

log_step "4. Checking PHP-FPM error logs..."
echo ""
docker logs myunila-auth-service --tail 50 2>&1 | grep -i error || log_info "No errors in PHP-FPM logs"
echo ""

log_step "5. Checking environment variables in container..."
echo ""
docker exec myunila-auth-service env | grep -E "^APP_|^DB_|^JWT_|^REDIS_" | sort
echo ""

log_step "6. Testing database connectivity..."
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

log_step "7. Testing Redis connectivity..."
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

log_step "8. Checking if users table exists and has data..."
echo ""
docker exec myunila-auth-service php artisan tinker --execute="
try {
    \$count = DB::table('users')->count();
    echo \"✓ Users table exists with \$count records\n\";
    if (\$count > 0) {
        \$user = DB::table('users')->select('username', 'email', 'created_at')->first();
        echo \"Sample user: \" . json_encode(\$user, JSON_PRETTY_PRINT) . \"\n\";
    }
} catch (Exception \$e) {
    echo \"✗ Error accessing users table: \" . \$e->getMessage() . \"\n\";
}
" 2>&1
echo ""

log_step "9. Testing auth login endpoint directly (inside container)..."
echo ""
docker exec myunila-auth-service php artisan tinker --execute="
\$response = null;
try {
    // Simulate a login request
    \$start = microtime(true);

    // Get first user for testing
    \$user = DB::table('users')->first();
    if (\$user) {
        echo \"Testing with username: {\$user->username}\n\";
    } else {
        echo \"No users found in database!\n\";
    }

    \$elapsed = microtime(true) - \$start;
    echo \"Query execution time: \" . round(\$elapsed, 2) . \" seconds\n\";

} catch (Exception \$e) {
    echo \"Error: \" . \$e->getMessage() . \"\n\";
}
" 2>&1
echo ""

log_step "10. Checking Kong timeout configuration..."
echo ""
docker exec myunila-kong-gateway kong config init -p /tmp 2>/dev/null || true
docker exec myunila-kong-gateway env | grep -i timeout | sort || log_warn "Could not read Kong timeout config"
echo ""

log_step "11. Checking Kong upstream latency for recent requests..."
echo ""
docker logs myunila-kong-gateway --tail 20 | grep -i "auth-service" || log_info "No recent auth-service requests in Kong logs"
echo ""

echo ""
log_info "=== Diagnostic Summary ==="
log_warn "Next steps based on findings:"
log_warn "  1. If database connection fails: Check DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD"
log_warn "  2. If Redis connection fails: Check REDIS_HOST and redis container status"
log_warn "  3. If no users exist: Run php artisan db:seed or create test user"
log_warn "  4. If Laravel logs show errors: Fix the errors shown above"
log_warn "  5. If Kong timeout is 60s: Restart Kong with: cd services/2-gateway && docker compose -f docker-compose.kong.yml restart"
echo ""
