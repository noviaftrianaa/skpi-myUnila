#!/bin/bash

# ========================================
# Stop All Backend Services - MyUnila
# ========================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  MyUnila Backend - Stop All Services${NC}"
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

# Stop Kong services
print_info "Stopping Kong services..."
docker-compose -f docker-compose-kong.yml down
if [ $? -eq 0 ]; then
    print_success "Kong services stopped"
else
    print_warning "Kong services might already be stopped"
fi

echo ""

# Stop main services
print_info "Stopping main services..."
docker-compose down
if [ $? -eq 0 ]; then
    print_success "Main services stopped"
else
    print_warning "Main services might already be stopped"
fi

echo ""

# Show remaining containers
print_info "Checking remaining containers..."
docker ps -a | grep myunila

echo ""
print_success "All services stopped"
echo ""
print_info "To remove volumes (CAUTION: will delete data): docker-compose down -v"
print_info "To start services again: ./start-all.sh"
echo ""
