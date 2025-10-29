#!/bin/bash

# ============================================================================
# Health Check Script for MyUnila Production
# Checks all services, databases, and infrastructure components
# ============================================================================

set -e

# Configuration
VM_UBUNTU_1_IP="${VM_UBUNTU_1_IP:-localhost}"
VM_UBUNTU_2_IP="${VM_UBUNTU_2_IP:-192.168.1.11}"
DB_HOST="${DB_HOST:-192.168.1.13}"
MONITORING_HOST="${MONITORING_HOST:-192.168.1.12}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
KONG_ADMIN_URL="${KONG_ADMIN_URL:-http://localhost:8001}"
KONG_PROXY_URL="${KONG_PROXY_URL:-http://localhost:9800}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Check result function
check_service() {
    local service_name=$1
    local check_command=$2
    local expected_status=${3:-0}

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    echo -n "Checking ${service_name}... "

    if eval "$check_command" > /dev/null 2>&1; then
        echo -e "${GREEN}OK${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}FAILED${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# Check HTTP endpoint
check_http() {
    local service_name=$1
    local url=$2
    local expected_code=${3:-200}

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    echo -n "Checking ${service_name} (${url})... "

    local status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || echo "000")

    if [ "$status_code" = "$expected_code" ]; then
        echo -e "${GREEN}OK (${status_code})${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}FAILED (${status_code}, expected ${expected_code})${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# Check Docker container
check_container() {
    local container_name=$1

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    echo -n "Checking container ${container_name}... "

    local status=$(docker inspect -f '{{.State.Status}}' "$container_name" 2>/dev/null || echo "not_found")

    if [ "$status" = "running" ]; then
        echo -e "${GREEN}Running${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}${status}${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# Print section header
section_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Main execution
echo ""
echo "============================================"
echo "MyUnila Production Health Check"
echo "============================================"
echo "Timestamp: $(date)"
echo ""

# VM Ubuntu 1 - Frontend & Gateway
section_header "VM Ubuntu 1 - Frontend & Gateway"

check_container "frontend"
check_container "kong"
check_container "kong-database"
check_container "nginx"

check_http "Frontend (Internal)" "${FRONTEND_URL}/api/health" 200
check_http "Kong Admin API" "${KONG_ADMIN_URL}/status" 200
check_http "Kong Proxy" "${KONG_PROXY_URL}/" 404

if command -v curl &> /dev/null; then
    check_http "Node Exporter (VM1)" "http://${VM_UBUNTU_1_IP}:9100/metrics" 200
fi

# VM Ubuntu 2 - Backend Services
section_header "VM Ubuntu 2 - Backend Services"

check_container "redis"
check_container "auth-service"
check_container "dashboard-service"
check_container "sister-service"

if [ "$VM_UBUNTU_2_IP" != "localhost" ]; then
    check_http "Auth Service" "http://${VM_UBUNTU_2_IP}:8081/health" 200
    check_http "Dashboard Service" "http://${VM_UBUNTU_2_IP}:8082/health" 200
    check_http "Sister Service" "http://${VM_UBUNTU_2_IP}:8083/health" 200
    check_http "Redis Exporter" "http://${VM_UBUNTU_2_IP}:9121/metrics" 200
    check_http "Node Exporter (VM2)" "http://${VM_UBUNTU_2_IP}:9100/metrics" 200
else
    check_http "Auth Service" "http://localhost:8081/health" 200
    check_http "Dashboard Service" "http://localhost:8082/health" 200
    check_http "Sister Service" "http://localhost:8083/health" 200
fi

# Database Server
section_header "Database Server (SQL Server)"

if command -v nc &> /dev/null; then
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -n "Checking SQL Server connectivity (${DB_HOST}:1433)... "
    if nc -z -w5 "$DB_HOST" 1433 2>/dev/null; then
        echo -e "${GREEN}OK${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}FAILED${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
fi

# Monitoring Server
section_header "Monitoring Server (Prometheus & Grafana)"

if [ "$MONITORING_HOST" != "localhost" ]; then
    check_http "Prometheus" "http://${MONITORING_HOST}:9090/-/healthy" 200
    check_http "Grafana" "http://${MONITORING_HOST}:3000/api/health" 200
fi

# Kong Routes Check
section_header "Kong API Gateway Routes"

if command -v curl &> /dev/null && command -v jq &> /dev/null; then
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -n "Checking Kong routes... "

    local route_count=$(curl -s "${KONG_ADMIN_URL}/routes" | jq '.data | length' 2>/dev/null || echo "0")

    if [ "$route_count" -gt 0 ]; then
        echo -e "${GREEN}OK (${route_count} routes configured)${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}FAILED (No routes configured)${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
fi

# Disk Space Check
section_header "System Resources"

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
echo -n "Checking disk space... "
local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')

if [ "$disk_usage" -lt 80 ]; then
    echo -e "${GREEN}OK (${disk_usage}% used)${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
elif [ "$disk_usage" -lt 90 ]; then
    echo -e "${YELLOW}WARNING (${disk_usage}% used)${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${RED}CRITICAL (${disk_usage}% used)${NC}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# Memory Check
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
echo -n "Checking memory usage... "
local mem_usage=$(free | awk 'NR==2 {printf "%.0f", $3/$2 * 100}')

if [ "$mem_usage" -lt 80 ]; then
    echo -e "${GREEN}OK (${mem_usage}% used)${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
elif [ "$mem_usage" -lt 90 ]; then
    echo -e "${YELLOW}WARNING (${mem_usage}% used)${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${RED}CRITICAL (${mem_usage}% used)${NC}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# Summary
echo ""
echo "============================================"
echo "Health Check Summary"
echo "============================================"
echo "Total Checks:  ${TOTAL_CHECKS}"
echo -e "Passed:        ${GREEN}${PASSED_CHECKS}${NC}"
echo -e "Failed:        ${RED}${FAILED_CHECKS}${NC}"

if [ $FAILED_CHECKS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}All systems operational!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}Some checks failed. Please investigate.${NC}"
    exit 1
fi
