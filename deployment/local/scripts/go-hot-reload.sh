#!/bin/bash

###############################################################################
# MyUnila Go Service Hot Reload (Development Mode)
# Runs Go services with air for automatic rebuild on file changes
#
# Usage:
#   bash go-hot-reload.sh [service|all]
#
# Examples:
#   bash go-hot-reload.sh keuangan      # Run keuangan-service only
#   bash go-hot-reload.sh sister        # Run sister-service only
#   bash go-hot-reload.sh all           # Run ALL Go services
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Ensure GOPATH/bin is in PATH (for air)
export PATH="$PATH:$(go env GOPATH 2>/dev/null)/bin:$HOME/go/bin"

# Auto-detect paths (works on any machine/OS)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

BACKEND_DIR="$PROJECT_ROOT/backend"
ENV_FILE="$PROJECT_ROOT/deployment/local/.env"

# Service definitions: name -> directory, port
declare -A SERVICE_DIRS=(
    ["keuangan"]="keuangan-service"
    ["sister"]="sister-service"
    ["feeder"]="feeder-service"
    ["api"]="api-service"
    ["myunila"]="myunila-service"
)

declare -A SERVICE_PORTS=(
    ["keuangan"]="8088"
    ["sister"]="8083"
    ["feeder"]="8084"
    ["api"]="8085"
    ["myunila"]="8086"
)

declare -A SERVICE_DOCKER=(
    ["keuangan"]="myunila-keuangan-service"
    ["sister"]="myunila-sister-service"
    ["feeder"]="myunila-feeder-service"
    ["api"]="myunila-api-service"
    ["myunila"]="myunila-service"
)

# Track background PIDs for cleanup
PIDS=()

cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping all Go services...${NC}"
    for pid in "${PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null
            wait "$pid" 2>/dev/null
        fi
    done
    echo -e "${GREEN}All services stopped.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Check if air is installed
check_air() {
    if ! command -v air &> /dev/null; then
        echo -e "${RED}Error: 'air' is not installed.${NC}"
        echo -e "${YELLOW}Install it with:${NC}"
        echo -e "  go install github.com/air-verse/air@latest"
        echo ""
        echo -e "${YELLOW}Make sure \$GOPATH/bin is in your PATH.${NC}"
        exit 1
    fi
    echo -e "${GREEN}air found: $(which air)${NC}"
}

# Setup .env for a service
setup_env() {
    local service_name=$1
    local service_dir="$BACKEND_DIR/${SERVICE_DIRS[$service_name]}"
    local service_env="$service_dir/.env"

    if [ ! -f "$service_env" ]; then
        if [ -f "$ENV_FILE" ]; then
            echo -e "${YELLOW}Creating .env for $service_name from deployment .env...${NC}"
            cp "$ENV_FILE" "$service_env"
        else
            echo -e "${RED}Warning: No .env file found for $service_name${NC}"
        fi
    fi
}

# Stop Docker container for a service (to free the port)
stop_docker_container() {
    local service_name=$1
    local container="${SERVICE_DOCKER[$service_name]}"

    if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${container}$"; then
        echo -e "${YELLOW}Stopping Docker container: $container (freeing port ${SERVICE_PORTS[$service_name]})...${NC}"
        docker stop "$container" 2>/dev/null
    fi
}

# Start a single service with air
start_service() {
    local service_name=$1
    local service_dir="$BACKEND_DIR/${SERVICE_DIRS[$service_name]}"
    local port="${SERVICE_PORTS[$service_name]}"

    if [ ! -d "$service_dir" ]; then
        echo -e "${RED}Error: Directory not found: $service_dir${NC}"
        return 1
    fi

    # Setup env
    setup_env "$service_name"

    # Stop Docker container if running
    stop_docker_container "$service_name"

    echo -e "${GREEN}Starting ${service_name}-service on port $port with air...${NC}"
    cd "$service_dir" && air &
    PIDS+=($!)
    echo -e "${CYAN}  PID: ${PIDS[-1]}${NC}"
}

# Show usage
show_usage() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║      ${GREEN}Go Service Hot Reload (air)${CYAN}                      ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC} bash go-hot-reload.sh [service|all]"
    echo ""
    echo -e "${YELLOW}Available services:${NC}"
    echo -e "  ${GREEN}keuangan${NC}  - Keuangan Service (port 8088)"
    echo -e "  ${GREEN}sister${NC}    - Sister Service (port 8083)"
    echo -e "  ${GREEN}feeder${NC}    - Feeder Service (port 8084)"
    echo -e "  ${GREEN}api${NC}       - API Service (port 8085)"
    echo -e "  ${GREEN}myunila${NC}   - MyUnila Service (port 8086)"
    echo -e "  ${GREEN}all${NC}       - ALL Go services"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  bash go-hot-reload.sh keuangan"
    echo -e "  bash go-hot-reload.sh all"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop.${NC}"
    echo ""
}

# Main
SERVICE=$1

if [ -z "$SERVICE" ]; then
    show_usage
    exit 0
fi

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║      ${GREEN}Go Service Hot Reload (air)${CYAN}                      ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check air
check_air

if [ "$SERVICE" == "all" ]; then
    echo -e "${MAGENTA}Starting ALL Go services with hot reload...${NC}"
    echo ""
    for svc in keuangan sister feeder api myunila; do
        start_service "$svc"
        sleep 1  # stagger starts
    done
    echo ""
    echo -e "${GREEN}All Go services started!${NC}"
    echo -e "${YELLOW}Services:${NC}"
    for svc in keuangan sister feeder api myunila; do
        echo -e "  ${CYAN}${svc}${NC} -> http://localhost:${SERVICE_PORTS[$svc]}"
    done
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop all services.${NC}"
    echo ""
    # Wait for all background processes
    wait
elif [ -n "${SERVICE_DIRS[$SERVICE]}" ]; then
    start_service "$SERVICE"
    echo ""
    echo -e "${GREEN}${SERVICE}-service started!${NC}"
    echo -e "  URL: http://localhost:${SERVICE_PORTS[$SERVICE]}"
    echo -e "  Health: http://localhost:${SERVICE_PORTS[$SERVICE]}/health"
    echo ""
    echo -e "${YELLOW}Watching for file changes... Press Ctrl+C to stop.${NC}"
    echo ""
    wait
else
    echo -e "${RED}Unknown service: $SERVICE${NC}"
    show_usage
    exit 1
fi
