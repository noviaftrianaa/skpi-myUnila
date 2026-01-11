#!/bin/bash

###############################################################################
# Test Kong Logging Implementation
# Tests centralized logging via Kong HTTP Log plugin
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test JWT token (replace with real token)
JWT_TOKEN="${1:-eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODEiLCJpYXQiOjE3NjY0OTAyNDAsImV4cCI6MTc2NjU0NDI0MCwibmJmIjoxNzY2NDkwMjQwLCJzdWIiOiIyNjAwNDQxNy02RTkyLTQ2M0MtQkYzNS1GNzQxODE3MTIxREMiLCJqdGkiOiI0MjA4MjY2MS1mOGJlLTRmZGEtOTBmMC1hZWY2YmQwYzFmZDciLCJ0eXBlIjoiYWNjZXNzIiwidXNlciI6eyJpZCI6IjI2MDA0NDE3LTZFOTItNDYzQy1CRjM1LUY3NDE4MTcxMjFEQyIsInVzZXJuYW1lIjoibWl6YXIuenVsbWkiLCJlbWFpbCI6Im1pemFyLnp1bG1pQHN0YWZmLnVuaWxhLmFjLmlkIiwibmFtZSI6Ik1pemFyIFp1bG1pIFJhbWFkYWhhbiwgUy5Lb20iLCJyb2xlIjoiRGV2ZWxvcGVyIn19.-rlHkDicZLg_bIEtwELVbc2Xgl5n6RvgbAqWCp6tXfQ}"

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Kong Logging Test${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

###############################################################################
# Test 1: Health Check - Kong Log Receiver
###############################################################################
echo -e "${YELLOW}[Test 1/5] Testing Kong Log Receiver Health...${NC}"

HEALTH_RESPONSE=$(curl -s http://localhost:8081/api/v1/internal/kong-logs/health)

if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}  ✓ Kong log receiver is healthy${NC}"
    echo "$HEALTH_RESPONSE" | python -m json.tool 2>/dev/null || echo "$HEALTH_RESPONSE"
else
    echo -e "${RED}  ✗ Kong log receiver health check failed${NC}"
    echo "$HEALTH_RESPONSE"
fi

echo ""

###############################################################################
# Test 2: Direct Test - Send Mock Log to Receiver
###############################################################################
echo -e "${YELLOW}[Test 2/5] Testing Direct Log Submission...${NC}"

MOCK_LOG='{
  "request": {
    "method": "GET",
    "uri": "/api/v1/test/logging",
    "headers": {
      "user-agent": ["Kong-Test-Script"]
    },
    "querystring": {"test": "true"},
    "size": 123
  },
  "response": {
    "status": 200,
    "size": 456
  },
  "latencies": {
    "request": 25
  },
  "service": {
    "name": "test-service"
  },
  "route": {
    "name": "test-route"
  },
  "client_ip": "127.0.0.1"
}'

DIRECT_RESPONSE=$(curl -s -X POST http://localhost:8081/api/v1/internal/kong-logs \
  -H "Content-Type: application/json" \
  -d "$MOCK_LOG")

if echo "$DIRECT_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}  ✓ Direct log submission successful${NC}"
    echo "$DIRECT_RESPONSE" | python -m json.tool 2>/dev/null || echo "$DIRECT_RESPONSE"
else
    echo -e "${RED}  ✗ Direct log submission failed${NC}"
    echo "$DIRECT_RESPONSE"
fi

echo ""

###############################################################################
# Test 3: Test via Kong - Dashboard Service (Public)
###############################################################################
echo -e "${YELLOW}[Test 3/5] Testing via Kong - Dashboard Public Endpoint...${NC}"

DASHBOARD_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  http://localhost:9800/dashboard-service/public/api/v1/unila/statistics)

HTTP_STATUS=$(echo "$DASHBOARD_RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
RESPONSE_BODY=$(echo "$DASHBOARD_RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}  ✓ Dashboard endpoint successful (HTTP $HTTP_STATUS)${NC}"
    echo "  Response preview:"
    echo "$RESPONSE_BODY" | python -m json.tool 2>/dev/null | head -20 || echo "$RESPONSE_BODY" | head -10
else
    echo -e "${RED}  ✗ Dashboard endpoint failed (HTTP $HTTP_STATUS)${NC}"
    echo "$RESPONSE_BODY"
fi

echo ""

###############################################################################
# Test 4: Test via Kong - Auth Service (Protected)
###############################################################################
echo -e "${YELLOW}[Test 4/5] Testing via Kong - Auth Service Protected Endpoint...${NC}"

AUTH_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:9800/auth-service/api/v1/auth/me)

HTTP_STATUS=$(echo "$AUTH_RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
RESPONSE_BODY=$(echo "$AUTH_RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}  ✓ Auth endpoint successful (HTTP $HTTP_STATUS)${NC}"
    echo "  Response preview:"
    echo "$RESPONSE_BODY" | python -m json.tool 2>/dev/null | head -20 || echo "$RESPONSE_BODY" | head -10
else
    echo -e "${RED}  ✗ Auth endpoint failed (HTTP $HTTP_STATUS)${NC}"
    echo "$RESPONSE_BODY"
fi

echo ""

###############################################################################
# Test 5: Check Database Logs
###############################################################################
echo -e "${YELLOW}[Test 5/5] Checking Database Logs...${NC}"

echo "  Querying last 5 logs from logger.log_akses_jwt..."
echo ""

# Note: This requires access to database - adjust connection string
# For now, just show the SQL query
echo -e "${BLUE}  Run this SQL to check logs:${NC}"
echo ""
echo "  SELECT TOP 5"
echo "      waktu_akses,"
echo "      method,"
echo "      menu_akses,"
echo "      a_berhasil,"
echo "      ket,"
echo "      JSON_VALUE(request_list, '\$.service') as service_name"
echo "  FROM logger.log_akses_jwt"
echo "  ORDER BY waktu_akses DESC;"
echo ""

###############################################################################
# Summary
###############################################################################
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Test Summary${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo -e "${YELLOW}What to verify:${NC}"
echo "  1. Kong log receiver is healthy"
echo "  2. Direct log submission works"
echo "  3. Requests through Kong return valid responses"
echo "  4. Logs appear in database table logger.log_akses_jwt"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Check database to confirm logs are recorded"
echo "  2. Verify log data contains correct information"
echo "  3. Test frontend logger pages:"
echo "     - http://localhost:3001/dashboard/manajemen-akses/logger/log-akses"
echo "     - http://localhost:3001/dashboard/manajemen-akses/logger/log-akses-jwt"
echo ""
echo -e "${YELLOW}If logs are not appearing:${NC}"
echo "  1. Check auth-service logs: docker logs myunila-auth-service --tail 100"
echo "  2. Check Kong plugins: curl http://localhost:9801/routes | python -m json.tool"
echo "  3. Verify HTTP Log plugin is enabled on routes"
echo "  4. Run: bash kong-setup-logging.sh to enable logging on all routes"
echo ""
