#!/bin/bash

###############################################################################
# MyUnila VM1 - Health Check Script
# This script checks the health of all services
###############################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load environment variables
if [ -f "$PROJECT_ROOT/.env" ]; then
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
fi

VM_IP=${VM_IP:-localhost}
KONG_PROXY_PORT=${KONG_PROXY_PORT:-9800}
KONG_ADMIN_PORT=${KONG_ADMIN_PORT:-9801}
GRAFANA_PORT=${GRAFANA_PORT:-3002}
PROMETHEUS_PORT=${PROMETHEUS_PORT:-9090}

###############################################################################
# Check functions
###############################################################################

check_service() {
    local name=$1
    local url=$2
    local timeout=${3:-5}

    echo -n "Checking $name... "

    if curl -sf --max-time $timeout "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

check_container() {
    local name=$1
    echo -n "Checking container $name... "

    if docker ps --filter "name=$name" --filter "status=running" | grep -q "$name"; then
        echo -e "${GREEN}✓ Running${NC}"
        return 0
    else
        echo -e "${RED}✗ Not Running${NC}"
        return 1
    fi
}

###############################################################################
# Main health check
###############################################################################
main() {
    echo ""
    echo "========================================"
    echo "  MyUnila VM1 - Health Check"
    echo "========================================"
    echo ""

    FAILED=0

    # Check Docker containers
    echo -e "${BLUE}[1] Docker Containers${NC}"
    check_container "myunila-redis" || FAILED=$((FAILED+1))
    check_container "myunila-postgres-kong" || FAILED=$((FAILED+1))
    check_container "myunila-kong" || FAILED=$((FAILED+1))
    check_container "myunila-auth-service" || FAILED=$((FAILED+1))
    check_container "myunila-dashboard-service" || FAILED=$((FAILED+1))
    check_container "myunila-sister-service" || FAILED=$((FAILED+1))
    check_container "myunila-nginx" || FAILED=$((FAILED+1))
    check_container "myunila-frontend" || FAILED=$((FAILED+1))
    echo ""

    # Check service endpoints
    echo -e "${BLUE}[2] Service Endpoints${NC}"
    check_service "Kong Proxy" "http://${VM_IP}:${KONG_PROXY_PORT}/" || FAILED=$((FAILED+1))
    check_service "Kong Admin" "http://${VM_IP}:${KONG_ADMIN_PORT}/" || FAILED=$((FAILED+1))
    check_service "Sister Service" "http://${VM_IP}:8083/health" || FAILED=$((FAILED+1))
    check_service "Frontend" "http://${VM_IP}:3000/" 10 || FAILED=$((FAILED+1))
    echo ""

    # Check monitoring (if deployed)
    if docker ps --filter "name=myunila-prometheus" --filter "status=running" | grep -q "prometheus"; then
        echo -e "${BLUE}[3] Monitoring Stack${NC}"
        check_container "myunila-prometheus" || FAILED=$((FAILED+1))
        check_container "myunila-grafana" || FAILED=$((FAILED+1))
        check_container "myunila-loki" || FAILED=$((FAILED+1))
        check_service "Prometheus" "http://${VM_IP}:${PROMETHEUS_PORT}/" || FAILED=$((FAILED+1))
        check_service "Grafana" "http://${VM_IP}:${GRAFANA_PORT}/" || FAILED=$((FAILED+1))
        echo ""
    fi

    # Check resource usage
    echo -e "${BLUE}[4] Resource Usage${NC}"
    echo "Docker containers:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
    echo ""

    # Summary
    echo "========================================"
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}All checks passed ✓${NC}"
    else
        echo -e "${RED}Failed checks: $FAILED ✗${NC}"
        echo ""
        echo "To view logs of a failed service:"
        echo "  docker logs [container-name]"
        echo ""
        echo "To restart a service:"
        echo "  cd services/[service-dir]"
        echo "  docker compose -f docker-compose.[service].yml restart"
    fi
    echo "========================================"
    echo ""

    exit $FAILED
}

main "$@"
