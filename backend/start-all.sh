#!/bin/bash

# ========================================
# Start All Backend Services - MyUnila
# ========================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  MyUnila Backend - Start All Services${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}! $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Check if docker is running
check_docker() {
    print_info "Checking Docker..."
    if ! docker ps &> /dev/null; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    print_success "Docker is running"
}

# Start main services
start_main() {
    print_header "Starting Main Services (Auth, Public, Nginx, Redis)"

    docker-compose up -d

    if [ $? -eq 0 ]; then
        print_success "Main services started"
    else
        print_error "Failed to start main services"
        exit 1
    fi
}

# Start Kong
start_kong() {
    print_header "Starting Kong API Gateway"

    docker-compose -f docker-compose-kong.yml up -d

    if [ $? -eq 0 ]; then
        print_success "Kong services started"
    else
        print_error "Failed to start Kong services"
        exit 1
    fi
}

# Wait for service to be ready
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=0

    print_info "Waiting for $name to be ready..."

    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            print_success "$name is ready!"
            return 0
        fi

        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done

    echo ""
    print_warning "$name might not be ready yet (timeout)"
    return 1
}

# Show status
show_status() {
    print_header "Services Status"

    echo ""
    docker-compose ps
    echo ""
    docker-compose -f docker-compose-kong.yml ps
}

# Configure Kong (optional)
configure_kong() {
    print_header "Configuring Kong Routes"

    # Configure auth-service
    if curl -s http://localhost:9801/services/auth-service 2>/dev/null | grep -q "auth-service"; then
        print_warning "Service 'auth-service' already configured"
    else
        print_info "Adding auth-service to Kong..."
        response=$(curl -s -X POST http://localhost:9801/services \
            --data name=auth-service \
            --data url=http://nginx:80)

        if echo "$response" | grep -q "auth-service"; then
            print_success "Auth service added"

            response=$(curl -s -X POST http://localhost:9801/services/auth-service/routes \
                --data "name=auth-route" \
                --data "paths[]=/auth-service" \
                --data strip_path=true)

            if echo "$response" | grep -q "auth-route"; then
                print_success "Auth route added"
            fi
        fi
    fi

    # Configure public-service
    if curl -s http://localhost:9801/services/public-service 2>/dev/null | grep -q "public-service"; then
        print_warning "Service 'public-service' already configured"
    else
        print_info "Adding public-service to Kong..."
        response=$(curl -s -X POST http://localhost:9801/services \
            --data name=public-service \
            --data url=http://nginx:81)

        if echo "$response" | grep -q "public-service"; then
            print_success "Public service added"

            response=$(curl -s -X POST http://localhost:9801/services/public-service/routes \
                --data "name=public-route" \
                --data "paths[]=/public-service" \
                --data strip_path=true)

            if echo "$response" | grep -q "public-route"; then
                print_success "Public route added"
            fi
        fi
    fi
}

# Test endpoints
test_endpoints() {
    print_header "Testing Endpoints"

    # Test Auth Direct
    print_info "Testing Auth Service (Direct - Port 8081)..."
    response=$(curl -s http://localhost:8081/api/v1/health)
    if echo "$response" | grep -q "success"; then
        print_success "Auth Service is working"
    else
        print_warning "Auth Service might not be ready"
    fi

    # Test Kong
    print_info "Testing Kong Admin API (Port 9801)..."
    response=$(curl -s http://localhost:9801)
    if echo "$response" | grep -q "version"; then
        print_success "Kong Admin API is working"
    else
        print_warning "Kong might not be ready yet"
    fi

    # Test Auth via Kong
    print_info "Testing Auth Service via Kong (Port 9800)..."
    response=$(curl -s http://localhost:9800/auth-service/api/v1/health)
    if echo "$response" | grep -q "success"; then
        print_success "Auth Service via Kong is working"
    else
        print_warning "Kong route might not be configured yet"
    fi
}

# Show URLs
show_urls() {
    print_header "Service URLs"

    echo ""
    echo -e "${GREEN}Main Services:${NC}"
    echo "  → Auth Service:           http://localhost:8081"
    echo "  → Public Service:         http://localhost:8082"
    echo "  → Redis:                  localhost:6379"
    echo ""
    echo -e "${GREEN}Kong API Gateway:${NC}"
    echo "  → Kong Proxy:             http://localhost:9800"
    echo "  → Kong Admin API:         http://localhost:9801"
    echo "  → Kong UI:                http://localhost:9803"
    echo ""
    echo -e "${GREEN}Auth Service Endpoints:${NC}"
    echo "  → Login:                  http://localhost:8081/api/v1/auth/login"
    echo "  → Login (via Kong):       http://localhost:9800/auth-service/api/v1/auth/login"
    echo "  → Swagger Docs:           http://localhost:8081/api/documentation"
    echo ""
    echo -e "${GREEN}Public Service Endpoints:${NC}"
    echo "  → University Profile:     http://localhost:8082/api/v1/university-profile"
    echo "  → Quick Facts:            http://localhost:8082/api/v1/university-profile/quick-facts"
    echo "  → Via Kong:               http://localhost:9800/public-service/api/v1/university-profile"
    echo ""
}

# Main execution
main() {
    check_docker
    echo ""

    start_main
    echo ""

    print_info "Waiting for main services to initialize..."
    sleep 5

    start_kong
    echo ""

    print_info "Waiting for Kong to initialize (this may take 30-60 seconds)..."
    sleep 10

    wait_for_service "http://localhost:8081/api/v1/health" "Auth Service"
    wait_for_service "http://localhost:9801" "Kong Admin API"

    echo ""
    configure_kong

    echo ""
    test_endpoints

    echo ""
    show_status

    echo ""
    show_urls

    echo ""
    print_success "All services started successfully!"
    echo ""
    print_info "Next steps:"
    echo "  1. Test login: curl -X POST http://localhost:8081/api/v1/auth/login -H 'Content-Type: application/json' -d '{\"username\":\"mizar.zulmi1073\",\"password\":\"makinjaya\"}'"
    echo "  2. Open Kong UI: http://localhost:9803"
    echo "  3. View logs: docker-compose logs -f"
    echo ""
    print_info "To stop all services: ./stop-all.sh"
    echo ""
}

# Run main
main
