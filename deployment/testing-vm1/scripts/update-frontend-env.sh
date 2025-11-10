#!/bin/bash

###############################################################################
# Update Frontend Environment Variables
# This script updates .env file with frontend-specific configurations
###############################################################################

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging functions
log_info() {
    echo -e "${GREEN}$1${NC}"
}

log_warning() {
    echo -e "${YELLOW}$1${NC}"
}

log_section() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOYMENT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$DEPLOYMENT_DIR/.env"

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: .env file not found at $ENV_FILE"
    exit 1
fi

log_section "Updating Frontend Environment Variables"

# Get VM_IP from .env or use default
VM_IP=$(grep "^VM_IP=" "$ENV_FILE" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
if [ -z "$VM_IP" ]; then
    VM_IP="192.168.123.172"
    log_warning "VM_IP not found in .env, using default: $VM_IP"
fi

log_info "Using VM_IP: $VM_IP"

# Update FRONTEND_PORT
if grep -q "^FRONTEND_PORT=" "$ENV_FILE"; then
    sed -i "s|^FRONTEND_PORT=.*|FRONTEND_PORT=3000|" "$ENV_FILE"
    log_info "✓ Updated FRONTEND_PORT=3000"
else
    echo "FRONTEND_PORT=3000" >> "$ENV_FILE"
    log_info "✓ Added FRONTEND_PORT=3000"
fi

# Update NEXT_PUBLIC_API_URL
if grep -q "^NEXT_PUBLIC_API_URL=" "$ENV_FILE"; then
    sed -i "s|^NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://$VM_IP:9800|" "$ENV_FILE"
    log_info "✓ Updated NEXT_PUBLIC_API_URL=http://$VM_IP:9800"
else
    echo "NEXT_PUBLIC_API_URL=http://$VM_IP:9800" >> "$ENV_FILE"
    log_info "✓ Added NEXT_PUBLIC_API_URL=http://$VM_IP:9800"
fi

# Update NEXT_PUBLIC_AUTH_API_URL
if grep -q "^NEXT_PUBLIC_AUTH_API_URL=" "$ENV_FILE"; then
    sed -i "s|^NEXT_PUBLIC_AUTH_API_URL=.*|NEXT_PUBLIC_AUTH_API_URL=http://$VM_IP:9800/auth-service/api/v1|" "$ENV_FILE"
    log_info "✓ Updated NEXT_PUBLIC_AUTH_API_URL=http://$VM_IP:9800/auth-service/api/v1"
else
    echo "NEXT_PUBLIC_AUTH_API_URL=http://$VM_IP:9800/auth-service/api/v1" >> "$ENV_FILE"
    log_info "✓ Added NEXT_PUBLIC_AUTH_API_URL=http://$VM_IP:9800/auth-service/api/v1"
fi

# Update NEXT_PUBLIC_DASHBOARD_API_URL
if grep -q "^NEXT_PUBLIC_DASHBOARD_API_URL=" "$ENV_FILE"; then
    sed -i "s|^NEXT_PUBLIC_DASHBOARD_API_URL=.*|NEXT_PUBLIC_DASHBOARD_API_URL=http://$VM_IP:9800/dashboard-service/api/v1|" "$ENV_FILE"
    log_info "✓ Updated NEXT_PUBLIC_DASHBOARD_API_URL=http://$VM_IP:9800/dashboard-service/api/v1"
else
    echo "NEXT_PUBLIC_DASHBOARD_API_URL=http://$VM_IP:9800/dashboard-service/api/v1" >> "$ENV_FILE"
    log_info "✓ Added NEXT_PUBLIC_DASHBOARD_API_URL=http://$VM_IP:9800/dashboard-service/api/v1"
fi

# Update NEXT_PUBLIC_SISTER_API_URL
if grep -q "^NEXT_PUBLIC_SISTER_API_URL=" "$ENV_FILE"; then
    sed -i "s|^NEXT_PUBLIC_SISTER_API_URL=.*|NEXT_PUBLIC_SISTER_API_URL=http://$VM_IP:9800/sister-service|" "$ENV_FILE"
    log_info "✓ Updated NEXT_PUBLIC_SISTER_API_URL=http://$VM_IP:9800/sister-service"
else
    echo "NEXT_PUBLIC_SISTER_API_URL=http://$VM_IP:9800/sister-service" >> "$ENV_FILE"
    log_info "✓ Added NEXT_PUBLIC_SISTER_API_URL=http://$VM_IP:9800/sister-service"
fi

echo ""
log_info "✅ Frontend environment variables updated successfully!"
echo ""

# Show current frontend env vars
log_section "Current Frontend Environment Variables"
grep -E "^FRONTEND_PORT=|^NEXT_PUBLIC_" "$ENV_FILE"
echo ""
