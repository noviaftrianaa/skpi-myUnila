#!/bin/bash

###############################################################################
# Diagnose All Services - Check Dashboard, Auth, Sister, Kong
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  MyUnila Services Diagnostic${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# 1. Check all containers
echo -e "${GREEN}[1] Container Status${NC}"
echo ""
docker ps --filter "name=myunila" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | head -20
echo ""

# 2. Check database connectivity from dashboard-service
echo -e "${GREEN}[2] Dashboard-Service Database Connection${NC}"
echo ""
docker exec myunila-dashboard-service php -r "
try {
    \$host = getenv('DB_HOST');
    \$port = getenv('DB_PORT');
    \$database = getenv('DB_DATABASE');
    \$start = microtime(true);
    \$dsn = \"sqlsrv:Server={\$host},{\$port};Database={\$database}\";
    \$pdo = new PDO(\$dsn, getenv('DB_USERNAME'), getenv('DB_PASSWORD'));
    \$elapsed = microtime(true) - \$start;
    echo \"✓ Connected in \" . round(\$elapsed, 2) . \" seconds\n\";
    echo \"Server: \$host:\$port\n\";
    echo \"Database: \$database\n\";
} catch (Exception \$e) {
    echo \"✗ Connection failed: \" . \$e->getMessage() . \"\n\";
}
" 2>&1 || echo "✗ Dashboard service not running"
echo ""

# 3. Check database connectivity from auth-service
echo -e "${GREEN}[3] Auth-Service Database Connection${NC}"
echo ""
docker exec myunila-auth-service php -r "
try {
    \$host = getenv('DB_HOST');
    \$port = getenv('DB_PORT');
    \$database = getenv('DB_DATABASE');
    \$start = microtime(true);
    \$dsn = \"sqlsrv:Server={\$host},{\$port};Database={\$database}\";
    \$pdo = new PDO(\$dsn, getenv('DB_USERNAME'), getenv('DB_PASSWORD'));
    \$elapsed = microtime(true) - \$start;
    echo \"✓ Connected in \" . round(\$elapsed, 2) . \" seconds\n\";
    echo \"Server: \$host:\$port\n\";
    echo \"Database: \$database\n\";
} catch (Exception \$e) {
    echo \"✗ Connection failed: \" . \$e->getMessage() . \"\n\";
}
" 2>&1 || echo "✗ Auth service not running"
echo ""

# 4. Test simple query speed from dashboard
echo -e "${GREEN}[4] Dashboard-Service Query Speed Test${NC}"
echo ""
docker exec myunila-dashboard-service php -r "
try {
    \$start = microtime(true);
    \$pdo = new PDO(
        'sqlsrv:Server=' . getenv('DB_HOST') . ',' . getenv('DB_PORT') . ';Database=' . getenv('DB_DATABASE'),
        getenv('DB_USERNAME'),
        getenv('DB_PASSWORD')
    );
    \$result = \$pdo->query('SELECT TOP 1 * FROM man_akses.pengguna')->fetch();
    \$elapsed = microtime(true) - \$start;
    echo \"✓ Query completed in \" . round(\$elapsed, 2) . \" seconds\n\";
    if (\$elapsed > 5) {
        echo \"⚠ WARNING: Query is slow (>5s)\n\";
    }
} catch (Exception \$e) {
    echo \"✗ Query failed: \" . \$e->getMessage() . \"\n\";
}
" 2>&1 || echo "✗ Failed to run query"
echo ""

# 5. Test simple query speed from auth
echo -e "${GREEN}[5] Auth-Service Query Speed Test${NC}"
echo ""
docker exec myunila-auth-service php -r "
try {
    \$start = microtime(true);
    \$pdo = new PDO(
        'sqlsrv:Server=' . getenv('DB_HOST') . ',' . getenv('DB_PORT') . ';Database=' . getenv('DB_DATABASE'),
        getenv('DB_USERNAME'),
        getenv('DB_PASSWORD')
    );
    \$result = \$pdo->query('SELECT TOP 1 * FROM man_akses.pengguna')->fetch();
    \$elapsed = microtime(true) - \$start;
    echo \"✓ Query completed in \" . round(\$elapsed, 2) . \" seconds\n\";
    if (\$elapsed > 5) {
        echo \"⚠ WARNING: Query is slow (>5s)\n\";
    }
} catch (Exception \$e) {
    echo \"✗ Query failed: \" . \$e->getMessage() . \"\n\";
}
" 2>&1 || echo "✗ Failed to run query"
echo ""

# 6. Check Redis connectivity
echo -e "${GREEN}[6] Redis Connection${NC}"
echo ""
docker exec myunila-dashboard-service php -r "
try {
    \$redis = new Redis();
    \$start = microtime(true);
    \$redis->connect(getenv('REDIS_HOST'), getenv('REDIS_PORT'));
    \$elapsed = microtime(true) - \$start;
    echo \"✓ Redis connected in \" . round(\$elapsed, 2) . \" seconds\n\";
} catch (Exception \$e) {
    echo \"✗ Redis connection failed: \" . \$e->getMessage() . \"\n\";
}
" 2>&1 || echo "✗ Failed to test Redis"
echo ""

# 7. Test dashboard endpoint
echo -e "${GREEN}[7] Dashboard API Test${NC}"
echo ""
START_TIME=$(date +%s.%N)
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}|%{time_total}" http://192.168.123.172:9800/dashboard-service/api/health 2>&1)
HTTP_CODE=$(echo $RESPONSE | cut -d'|' -f1)
TIME_TOTAL=$(echo $RESPONSE | cut -d'|' -f2)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "✓ Dashboard health endpoint: ${GREEN}200 OK${NC} (${TIME_TOTAL}s)"
else
    echo -e "✗ Dashboard health endpoint: ${RED}$HTTP_CODE${NC} (${TIME_TOTAL}s)"
fi
echo ""

# 8. Test auth endpoint
echo -e "${GREEN}[8] Auth API Test${NC}"
echo ""
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}|%{time_total}" http://192.168.123.172:9800/auth-service/api/health 2>&1)
HTTP_CODE=$(echo $RESPONSE | cut -d'|' -f1)
TIME_TOTAL=$(echo $RESPONSE | cut -d'|' -f2)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "✓ Auth health endpoint: ${GREEN}200 OK${NC} (${TIME_TOTAL}s)"
else
    echo -e "✗ Auth health endpoint: ${RED}$HTTP_CODE${NC} (${TIME_TOTAL}s)"
fi
echo ""

# 9. Check Kong timeout config
echo -e "${GREEN}[9] Kong Timeout Configuration${NC}"
echo ""
docker exec myunila-kong-gateway env | grep -i timeout | sort
echo ""

# 10. Check database server load
echo -e "${GREEN}[10] Database Server Info${NC}"
echo ""
docker exec myunila-dashboard-service php -r "
try {
    \$pdo = new PDO(
        'sqlsrv:Server=' . getenv('DB_HOST') . ',' . getenv('DB_PORT') . ';Database=' . getenv('DB_DATABASE'),
        getenv('DB_USERNAME'),
        getenv('DB_PASSWORD')
    );
    \$result = \$pdo->query('SELECT @@VERSION AS version')->fetch();
    echo \"Database: \" . \$result['version'] . \"\n\";

    // Check active connections
    \$result = \$pdo->query(\"SELECT COUNT(*) as cnt FROM sys.dm_exec_sessions WHERE is_user_process = 1\")->fetch();
    echo \"Active connections: \" . \$result['cnt'] . \"\n\";
} catch (Exception \$e) {
    echo \"✗ Failed: \" . \$e->getMessage() . \"\n\";
}
" 2>&1 || echo "✗ Failed to query database info"
echo ""

# 11. Recent container logs
echo -e "${GREEN}[11] Recent Errors in Logs${NC}"
echo ""
echo "Dashboard errors:"
docker logs myunila-dashboard-service --tail 20 2>&1 | grep -i error | tail -5 || echo "No errors"
echo ""
echo "Auth errors:"
docker logs myunila-auth-service --tail 20 2>&1 | grep -i error | tail -5 || echo "No errors"
echo ""

# Summary
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Diagnostic Summary${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo -e "${YELLOW}If queries are slow (>5s):${NC}"
echo "  1. Check network latency between app server and database server"
echo "  2. Check database server CPU/memory usage"
echo "  3. Check if there are blocking queries: SELECT * FROM sys.dm_exec_requests WHERE blocking_session_id <> 0"
echo "  4. Consider adding database indexes"
echo ""
echo -e "${YELLOW}If connection failed:${NC}"
echo "  1. Check if database server is accessible: ping <DB_HOST>"
echo "  2. Check if SQL Server service is running"
echo "  3. Check firewall rules on database server"
echo ""
echo -e "${YELLOW}If timeout from Kong (504):${NC}"
echo "  1. Restart Kong: cd services/2-gateway && docker compose -f docker-compose.kong.yml restart"
echo "  2. Check Kong timeout is 180s (not 60s)"
echo ""
