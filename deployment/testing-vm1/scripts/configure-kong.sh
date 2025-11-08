#!/bin/bash

###############################################################################
# Kong Gateway Configuration Script
# Configure services and routes for MyUnila application
###############################################################################

set -e

KONG_ADMIN_URL="http://localhost:9801"

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

###############################################################################
# Create or Update Service
###############################################################################
create_or_update_service() {
    local service_name=$1
    local service_host=$2
    local service_port=$3
    local service_path=${4:-"/"}

    log_info "Configuring service: $service_name"

    # Check if service exists
    SERVICE_ID=$(curl -s "${KONG_ADMIN_URL}/services/${service_name}" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

    if [ -n "$SERVICE_ID" ]; then
        log_warn "Service $service_name already exists, updating..."
        curl -s -X PATCH "${KONG_ADMIN_URL}/services/${service_name}" \
            -d "host=${service_host}" \
            -d "port=${service_port}" \
            -d "path=${service_path}" \
            -d "protocol=http" > /dev/null
    else
        log_info "Creating new service: $service_name"
        curl -s -X POST "${KONG_ADMIN_URL}/services" \
            -d "name=${service_name}" \
            -d "host=${service_host}" \
            -d "port=${service_port}" \
            -d "path=${service_path}" \
            -d "protocol=http" > /dev/null
    fi

    log_info "Service $service_name configured successfully"
}

###############################################################################
# Create or Update Route
###############################################################################
create_or_update_route() {
    local service_name=$1
    local route_name=$2
    local route_path=$3
    local strip_path=${4:-true}

    log_info "Configuring route: $route_name for service $service_name"

    # Check if route exists
    ROUTE_ID=$(curl -s "${KONG_ADMIN_URL}/routes/${route_name}" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

    if [ -n "$ROUTE_ID" ]; then
        log_warn "Route $route_name already exists, updating..."
        curl -s -X PATCH "${KONG_ADMIN_URL}/routes/${route_name}" \
            -d "paths[]=${route_path}" \
            -d "strip_path=${strip_path}" \
            -d "preserve_host=false" > /dev/null
    else
        log_info "Creating new route: $route_name"
        curl -s -X POST "${KONG_ADMIN_URL}/services/${service_name}/routes" \
            -d "name=${route_name}" \
            -d "paths[]=${route_path}" \
            -d "strip_path=${strip_path}" \
            -d "preserve_host=false" > /dev/null
    fi

    log_info "Route $route_name configured successfully"
}

###############################################################################
# Enable CORS Plugin
###############################################################################
enable_cors_plugin() {
    local service_name=$1

    log_info "Enabling CORS plugin for service: $service_name"

    # Check if CORS plugin already exists
    PLUGIN_ID=$(curl -s "${KONG_ADMIN_URL}/services/${service_name}/plugins" | grep -o '"name":"cors"' | head -1)

    if [ -n "$PLUGIN_ID" ]; then
        log_warn "CORS plugin already enabled for $service_name"
    else
        curl -s -X POST "${KONG_ADMIN_URL}/services/${service_name}/plugins" \
            -d "name=cors" \
            -d "config.origins=*" \
            -d "config.methods=GET" \
            -d "config.methods=POST" \
            -d "config.methods=PUT" \
            -d "config.methods=PATCH" \
            -d "config.methods=DELETE" \
            -d "config.methods=OPTIONS" \
            -d "config.headers=Accept" \
            -d "config.headers=Accept-Version" \
            -d "config.headers=Content-Length" \
            -d "config.headers=Content-MD5" \
            -d "config.headers=Content-Type" \
            -d "config.headers=Date" \
            -d "config.headers=Authorization" \
            -d "config.headers=X-Auth-Token" \
            -d "config.exposed_headers=X-Auth-Token" \
            -d "config.credentials=true" \
            -d "config.max_age=3600" > /dev/null
        log_info "CORS plugin enabled for $service_name"
    fi
}

###############################################################################
# Main Configuration
###############################################################################
main() {
    log_info "Starting Kong Gateway configuration..."
    echo ""

    # Wait for Kong to be ready
    log_info "Checking Kong availability..."
    for i in {1..30}; do
        if curl -s "${KONG_ADMIN_URL}" > /dev/null 2>&1; then
            log_info "Kong is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            log_error "Kong is not responding after 30 seconds"
            exit 1
        fi
        sleep 1
    done
    echo ""

    # Configure Frontend Service
    log_info "=== Configuring Frontend Service ==="
    create_or_update_service "frontend-service" "myunila-frontend" "3000" "/"
    create_or_update_route "frontend-service" "frontend-route" "/" "false"
    echo ""

    # Configure Auth Service (via Nginx)
    log_info "=== Configuring Auth Service ==="
    create_or_update_service "auth-service" "myunila-nginx" "80" "/"
    create_or_update_route "auth-service" "auth-route" "/auth-service" "true"
    enable_cors_plugin "auth-service"
    echo ""

    # Configure Dashboard Service (via Nginx)
    log_info "=== Configuring Dashboard Service ==="
    create_or_update_service "dashboard-service" "myunila-nginx" "81" "/"
    create_or_update_route "dashboard-service" "dashboard-route" "/dashboard-service" "true"
    enable_cors_plugin "dashboard-service"
    echo ""

    # Configure Sister Service
    log_info "=== Configuring Sister Service ==="
    create_or_update_service "sister-service" "myunila-sister-service" "8083" "/"
    create_or_update_route "sister-service" "sister-route" "/sister-service" "true"
    enable_cors_plugin "sister-service"
    echo ""

    log_info "Kong Gateway configuration completed successfully!"
    echo ""
    log_info "Configured routes:"
    log_info "  - http://\${VM_IP}:9800/                  -> Frontend (Next.js)"
    log_info "  - http://\${VM_IP}:9800/auth-service      -> Auth Service (Laravel)"
    log_info "  - http://\${VM_IP}:9800/dashboard-service -> Dashboard Service (Laravel)"
    log_info "  - http://\${VM_IP}:9800/sister-service    -> Sister Service (Go Fiber)"
    echo ""
    log_info "Test the configuration:"
    log_info "  curl http://localhost:9800/"
    log_info "  curl http://localhost:9800/sister-service/health"
    echo ""
}

# Run main function
main "$@"
