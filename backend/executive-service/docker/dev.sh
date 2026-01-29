#!/bin/bash

# ============================================================================
# MyUnila Executive Service - Development Script
# Script untuk menjalankan executive service dengan hot reload di development
# Menggunakan docker-compose.dev.yml (port 9000)
# ============================================================================

set -e

# Docker compose file untuk development
COMPOSE_FILE="docker-compose.dev.yml"

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function untuk print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function untuk check network
check_network() {
    print_info "Checking docker network 'myunila-network'..."
    if docker network ls | grep -q "myunila-network"; then
        print_success "Network 'myunila-network' already exists"
    else
        print_warning "Network 'myunila-network' not found. Creating..."
        docker network create myunila-network
        print_success "Network 'myunila-network' created"
    fi
}

# Function untuk build dan start service
start_service() {
    print_info "Starting Executive Service (Development)..."
    check_network
    docker-compose -f "$COMPOSE_FILE" --env-file .env up -d --build
    print_success "Executive Service (Development) started!"
    print_info "Container name: myunila-executive-service-dev"
    print_info "Port: 9000"
    print_info "View logs: $0 logs"
    print_info "Stop service: $0 stop"
}

# Function untuk stop service
stop_service() {
    print_info "Stopping Executive Service (Development)..."
    docker-compose -f "$COMPOSE_FILE" down
    print_success "Executive Service (Development) stopped!"
}

# Function untuk restart service
restart_service() {
    print_info "Restarting Executive Service (Development)..."
    docker-compose -f "$COMPOSE_FILE" restart
    print_success "Executive Service (Development) restarted!"
}

# Function untuk view logs
view_logs() {
    print_info "Showing logs (Ctrl+C to exit)..."
    docker-compose -f "$COMPOSE_FILE" logs -f executive-service-dev
}

# Function untuk exec ke container
exec_container() {
    print_info "Entering container shell..."
    docker-compose -f "$COMPOSE_FILE" exec executive-service-dev /bin/bash
}

# Function untuk run artisan command
artisan() {
    if [ -z "$1" ]; then
        print_error "Please provide an artisan command"
        echo "Usage: $0 artisan [command]"
        echo "Example: $0 artisan migrate"
        exit 1
    fi
    print_info "Running artisan command: artisan $@"
    docker-compose -f "$COMPOSE_FILE" exec executive-service-dev php artisan "$@"
}

# Function untuk run composer
composer() {
    if [ -z "$1" ]; then
        print_error "Please provide a composer command"
        echo "Usage: $0 composer [command]"
        echo "Example: $0 composer install"
        exit 1
    fi
    print_info "Running composer command: composer $@"
    docker-compose -f "$COMPOSE_FILE" exec executive-service-dev composer "$@"
}

# Function untuk run tests
run_tests() {
    print_info "Running tests..."
    docker-compose -f "$COMPOSE_FILE" exec executive-service-dev php artisan test --parallel
}

# Function untuk clear cache
clear_cache() {
    print_info "Clearing application cache..."
    docker-compose -f "$COMPOSE_FILE" exec executive-service-dev php artisan cache:clear
    docker-compose -f "$COMPOSE_FILE" exec executive-service-dev php artisan config:clear
    docker-compose -f "$COMPOSE_FILE" exec executive-service-dev php artisan route:clear
    docker-compose -f "$COMPOSE_FILE" exec executive-service-dev php artisan view:clear
    print_success "Cache cleared!"
}

# Function untuk fresh migration
fresh_migration() {
    print_warning "This will drop all tables and re-migrate!"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        print_info "Running fresh migration..."
        docker-compose -f "$COMPOSE_FILE" exec executive-service-dev php artisan migrate:fresh --seed
        print_success "Migration completed!"
    else
        print_info "Migration cancelled"
    fi
}

# Function untuk check status
check_status() {
    print_info "Checking service status (Development)..."
    docker-compose -f "$COMPOSE_FILE" ps
}

# Function untuk rebuild service
rebuild_service() {
    print_info "Rebuilding Executive Service (Development)..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    docker-compose -f "$COMPOSE_FILE" up -d
    print_success "Executive Service (Development) rebuilt!"
}

# Function untuk show help
show_help() {
    echo "MyUnila Executive Service - Development Script"
    echo ""
    echo "Using: docker-compose.dev.yml (Port 9000)"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start           Start service (build if needed)"
    echo "  stop            Stop service"
    echo "  restart         Restart service"
    echo "  logs            Show service logs (follow mode)"
    echo "  shell           Enter container shell"
    echo "  artisan         Run artisan command (e.g., $0 artisan migrate)"
    echo "  composer        Run composer command (e.g., $0 composer install)"
    echo "  test            Run tests"
    echo "  cache:clear     Clear all cache"
    echo "  migrate:fresh   Drop all tables and re-migrate"
    echo "  status          Check service status"
    echo "  rebuild         Rebuild service (no cache)"
    echo "  help            Show this help message"
    echo ""
    echo "Hot Reload Info:"
    echo "  Changes to all source files will be reflected immediately"
    echo "  No need to rebuild when modifying source code"
    echo ""
}

# Main script logic
case "${1:-help}" in
    start)
        start_service
        ;;
    stop)
        stop_service
        ;;
    restart)
        restart_service
        ;;
    logs)
        view_logs
        ;;
    shell)
        exec_container
        ;;
    artisan)
        shift
        artisan "$@"
        ;;
    composer)
        shift
        composer "$@"
        ;;
    test)
        run_tests
        ;;
    cache:clear)
        clear_cache
        ;;
    migrate:fresh)
        fresh_migration
        ;;
    status)
        check_status
        ;;
    rebuild)
        rebuild_service
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
