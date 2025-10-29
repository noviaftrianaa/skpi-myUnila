#!/bin/bash

# ============================================================================
# Kong Gateway Configuration Script
# Automatically registers all backend services and creates routes
# ============================================================================

set -e  # Exit on any error

# Configuration
KONG_ADMIN_URL="${KONG_ADMIN_URL:-http://localhost:8001}"
VM_UBUNTU_2_IP="${VM_UBUNTU_2_IP:-192.168.1.11}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "============================================"
echo "Kong Gateway Configuration"
echo "============================================"
echo ""

# Function to check if Kong is ready
check_kong_ready() {
    echo -n "Checking Kong availability... "
    for i in {1..30}; do
        if curl -s -f "${KONG_ADMIN_URL}/status" > /dev/null 2>&1; then
            echo -e "${GREEN}Ready!${NC}"
            return 0
        fi
        sleep 2
    done
    echo -e "${RED}Failed!${NC}"
    echo "Kong Admin API is not accessible at ${KONG_ADMIN_URL}"
    exit 1
}

# Function to create or update service
create_service() {
    local service_name=$1
    local service_url=$2

    echo -n "Creating service: ${service_name}... "

    # Check if service exists
    if curl -s -f "${KONG_ADMIN_URL}/services/${service_name}" > /dev/null 2>&1; then
        # Update existing service
        curl -s -X PATCH "${KONG_ADMIN_URL}/services/${service_name}" \
            -d "url=${service_url}" > /dev/null
        echo -e "${YELLOW}Updated${NC}"
    else
        # Create new service
        curl -s -X POST "${KONG_ADMIN_URL}/services" \
            -d "name=${service_name}" \
            -d "url=${service_url}" > /dev/null
        echo -e "${GREEN}Created${NC}"
    fi
}

# Function to create or update route
create_route() {
    local service_name=$1
    local route_path=$2
    local route_name="${service_name}-route"

    echo -n "Creating route: ${route_name} (${route_path})... "

    # Check if route exists by name
    local existing_route=$(curl -s "${KONG_ADMIN_URL}/routes" | grep -o "\"name\":\"${route_name}\"" || true)

    if [ -n "$existing_route" ]; then
        # Update existing route
        curl -s -X PATCH "${KONG_ADMIN_URL}/routes/${route_name}" \
            -d "paths[]=${route_path}" \
            -d "strip_path=true" \
            -d "preserve_host=false" > /dev/null
        echo -e "${YELLOW}Updated${NC}"
    else
        # Create new route
        curl -s -X POST "${KONG_ADMIN_URL}/services/${service_name}/routes" \
            -d "name=${route_name}" \
            -d "paths[]=${route_path}" \
            -d "strip_path=true" \
            -d "preserve_host=false" > /dev/null
        echo -e "${GREEN}Created${NC}"
    fi
}

# Function to add rate limiting plugin
add_rate_limiting() {
    local service_name=$1
    local requests_per_second=${2:-100}

    echo -n "Adding rate limiting to ${service_name}... "

    # Check if plugin already exists
    if curl -s "${KONG_ADMIN_URL}/services/${service_name}/plugins" | grep -q "rate-limiting"; then
        echo -e "${YELLOW}Already exists${NC}"
    else
        curl -s -X POST "${KONG_ADMIN_URL}/services/${service_name}/plugins" \
            -d "name=rate-limiting" \
            -d "config.second=${requests_per_second}" \
            -d "config.policy=local" > /dev/null
        echo -e "${GREEN}Added${NC}"
    fi
}

# Function to add CORS plugin
add_cors() {
    local service_name=$1

    echo -n "Adding CORS to ${service_name}... "

    # Check if plugin already exists
    if curl -s "${KONG_ADMIN_URL}/services/${service_name}/plugins" | grep -q "cors"; then
        echo -e "${YELLOW}Already exists${NC}"
    else
        curl -s -X POST "${KONG_ADMIN_URL}/services/${service_name}/plugins" \
            -d "name=cors" \
            -d "config.origins=*" \
            -d "config.methods=GET,POST,PUT,DELETE,PATCH,OPTIONS" \
            -d "config.headers=Accept,Authorization,Content-Type,X-Requested-With" \
            -d "config.credentials=true" \
            -d "config.max_age=3600" > /dev/null
        echo -e "${GREEN}Added${NC}"
    fi
}

# Main execution
check_kong_ready

echo ""
echo "Configuring Backend Services..."
echo "================================"

# Auth Service
create_service "auth-service" "http://${VM_UBUNTU_2_IP}:8081"
create_route "auth-service" "/api/auth"
add_rate_limiting "auth-service" 50
add_cors "auth-service"

# Dashboard Service
create_service "dashboard-service" "http://${VM_UBUNTU_2_IP}:8082"
create_route "dashboard-service" "/api/dashboard"
add_rate_limiting "dashboard-service" 100
add_cors "dashboard-service"

# Sister Service
create_service "sister-service" "http://${VM_UBUNTU_2_IP}:8083"
create_route "sister-service" "/api/sister"
add_rate_limiting "sister-service" 50
add_cors "sister-service"

echo ""
echo "============================================"
echo -e "${GREEN}Kong Configuration Complete!${NC}"
echo "============================================"
echo ""
echo "Service Endpoints:"
echo "  - Auth:      http://api.myunila.ac.id/api/auth"
echo "  - Dashboard: http://api.myunila.ac.id/api/dashboard"
echo "  - Sister:    http://api.myunila.ac.id/api/sister"
echo ""
echo "Admin API:     ${KONG_ADMIN_URL}"
echo ""

# Verify configuration
echo "Verifying routes..."
curl -s "${KONG_ADMIN_URL}/routes" | grep -o '"name":"[^"]*"' | sed 's/"name":"/ - /' | sed 's/"$//'
echo ""
echo -e "${GREEN}Done!${NC}"
