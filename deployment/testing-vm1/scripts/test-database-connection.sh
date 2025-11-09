#!/bin/bash

###############################################################################
# Test Database Connection from App Server to Database Server
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Database Connection Testing${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Load environment variables
if [ -f /var/www/my-unila/deployment/testing-vm1/.env ]; then
    source /var/www/my-unila/deployment/testing-vm1/.env
else
    echo -e "${RED}✗ .env file not found${NC}"
    exit 1
fi

# Get DB credentials
DB_HOST="${DB_MSSQL_HOST:-10.10.110.111}"
DB_PORT="${DB_MSSQL_PORT:-1433}"
DB_USERNAME="${DB_MSSQL_USERNAME}"
DB_PASSWORD="${DB_MSSQL_PASSWORD}"
DB_DATABASE="${DB_MSSQL_DATABASE}"

echo -e "${BLUE}Database Server Info:${NC}"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_DATABASE"
echo "  Username: $DB_USERNAME"
echo ""

# Test 1: Ping database server
echo -e "${GREEN}[1/7] Ping Database Server${NC}"
echo ""
if ping -c 3 $DB_HOST > /dev/null 2>&1; then
    echo -e "  ✓ Server is ${GREEN}reachable${NC}"
    ping -c 3 $DB_HOST | tail -2
else
    echo -e "  ✗ Server is ${RED}NOT reachable${NC}"
    echo -e "  ${YELLOW}Issue: Network problem or server is down${NC}"
fi
echo ""

# Test 2: Test port 1433 connectivity
echo -e "${GREEN}[2/7] Test SQL Server Port (1433)${NC}"
echo ""
if timeout 5 bash -c "cat < /dev/null > /dev/tcp/$DB_HOST/$DB_PORT" 2>/dev/null; then
    echo -e "  ✓ Port $DB_PORT is ${GREEN}OPEN${NC}"
else
    echo -e "  ✗ Port $DB_PORT is ${RED}CLOSED or FILTERED${NC}"
    echo -e "  ${YELLOW}Issue: Firewall blocking or SQL Server not listening on this port${NC}"
fi
echo ""

# Test 3: Test with nc (netcat)
echo -e "${GREEN}[3/7] Test with Netcat${NC}"
echo ""
if command -v nc &> /dev/null; then
    if nc -zv -w 5 $DB_HOST $DB_PORT 2>&1 | grep -q succeeded; then
        echo -e "  ✓ Connection ${GREEN}successful${NC}"
    else
        echo -e "  ✗ Connection ${RED}failed${NC}"
    fi
else
    echo "  ⚠ netcat not installed, skipping"
fi
echo ""

# Test 4: Test with telnet
echo -e "${GREEN}[4/7] Test with Telnet${NC}"
echo ""
if command -v telnet &> /dev/null; then
    timeout 5 telnet $DB_HOST $DB_PORT 2>&1 | head -3
else
    echo "  ⚠ telnet not installed, skipping"
fi
echo ""

# Test 5: Test connection from container using PHP PDO
echo -e "${GREEN}[5/7] Test SQL Server Connection (PHP PDO)${NC}"
echo ""
docker run --rm mcr.microsoft.com/mssql/server:2019-latest \
    /bin/bash -c "apt-get update -qq && apt-get install -y -qq iputils-ping telnet > /dev/null 2>&1 && \
    ping -c 2 $DB_HOST && \
    telnet $DB_HOST $DB_PORT" 2>&1 | tail -10 || echo "Container test failed"
echo ""

# Test 6: Test with sqlcmd
echo -e "${GREEN}[6/7] Test with sqlcmd (SQL Server CLI)${NC}"
echo ""
echo "Attempting connection with sqlcmd..."
docker run --rm mcr.microsoft.com/mssql-tools \
    /opt/mssql-tools/bin/sqlcmd \
    -S "$DB_HOST,$DB_PORT" \
    -U "$DB_USERNAME" \
    -P "$DB_PASSWORD" \
    -d "$DB_DATABASE" \
    -Q "SELECT @@VERSION AS Version, GETDATE() AS CurrentTime" \
    -t 10 \
    2>&1

SQLCMD_EXIT=$?
if [ $SQLCMD_EXIT -eq 0 ]; then
    echo -e "  ✓ SQL Server connection ${GREEN}successful${NC}"
else
    echo -e "  ✗ SQL Server connection ${RED}failed${NC} (exit code: $SQLCMD_EXIT)"
    echo ""
    echo -e "${YELLOW}Possible issues:${NC}"
    echo "  1. Wrong credentials (username/password)"
    echo "  2. Database doesn't exist"
    echo "  3. User doesn't have permission to this database"
    echo "  4. SQL Server not accepting remote connections"
    echo "  5. SQL Server authentication mode is Windows-only"
fi
echo ""

# Test 7: Test from actual container
echo -e "${GREEN}[7/7] Test from Dashboard Container${NC}"
echo ""
docker exec myunila-dashboard-service php -r "
echo \"Testing from dashboard-service container...\n\";
echo \"DB_HOST: \" . getenv('DB_HOST') . \"\n\";
echo \"DB_PORT: \" . getenv('DB_PORT') . \"\n\";
echo \"DB_DATABASE: \" . getenv('DB_DATABASE') . \"\n\";
echo \"\n\";

try {
    \$start = microtime(true);
    echo \"Attempting PDO connection...\n\";

    \$dsn = 'sqlsrv:Server=' . getenv('DB_HOST') . ',' . getenv('DB_PORT') . ';Database=' . getenv('DB_DATABASE');
    \$pdo = new PDO(\$dsn, getenv('DB_USERNAME'), getenv('DB_PASSWORD'), [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 10
    ]);

    \$elapsed = microtime(true) - \$start;
    echo \"✓ Connected in \" . round(\$elapsed, 2) . \" seconds\n\";

    // Test query
    \$result = \$pdo->query('SELECT @@VERSION AS version, GETDATE() AS current_time')->fetch();
    echo \"SQL Server Version: \" . substr(\$result['version'], 0, 100) . \"...\n\";
    echo \"Current Time: \" . \$result['current_time'] . \"\n\";

} catch (PDOException \$e) {
    echo \"✗ Connection failed: \" . \$e->getMessage() . \"\n\";
    echo \"Error Code: \" . \$e->getCode() . \"\n\";
}
" 2>&1
echo ""

# Summary
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Summary & Recommendations${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo -e "${YELLOW}If ping failed:${NC}"
echo "  → Network issue or server is down"
echo "  → Check if database server IP is correct: $DB_HOST"
echo "  → Check if database server is powered on"
echo ""
echo -e "${YELLOW}If port test failed:${NC}"
echo "  → Firewall is blocking port 1433"
echo "  → Run on database server: sudo firewall-cmd --add-port=1433/tcp --permanent"
echo "  → Or Windows: New-NetFirewallRule -DisplayName \"SQL Server\" -LocalPort 1433 -Protocol TCP -Action Allow"
echo "  → SQL Server might not be listening on 0.0.0.0 (check SQL Server Configuration Manager)"
echo ""
echo -e "${YELLOW}If sqlcmd connection failed:${NC}"
echo "  → Wrong username/password"
echo "  → Database doesn't exist or user has no permission"
echo "  → SQL Server is in Windows Authentication mode only"
echo "  → Enable SQL Server Authentication (mixed mode):"
echo "    1. SQL Server Management Studio → Server Properties → Security"
echo "    2. Select 'SQL Server and Windows Authentication mode'"
echo "    3. Restart SQL Server service"
echo ""
echo -e "${YELLOW}If PDO connection failed with timeout:${NC}"
echo "  → Encryption/certificate issue"
echo "  → Try adding these to DSN: TrustServerCertificate=true;Encrypt=optional"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Fix the issues above based on test results"
echo "  2. Restart the services: cd /var/www/my-unila/deployment/testing-vm1/services/3-backend"
echo "  3. Restart dashboard: docker compose -f docker-compose.dashboard.yml restart"
echo "  4. Restart auth: docker compose -f docker-compose.auth.yml restart"
echo ""
