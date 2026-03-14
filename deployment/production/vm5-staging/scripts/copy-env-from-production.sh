#!/bin/bash

###############################################################################
# Copy .env credentials from Production VMs (VM1, VM2, VM3) to VM5 Staging
# Run this on VM5 (192.168.120.45) as user mystagging
#
# Usage:
#   ./scripts/copy-env-from-production.sh
#
# Prerequisites:
#   - SSH access from VM5 ke VM1, VM2, VM3
#   - Atau jalankan manual scp dari masing-masing VM
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
STAGING_ENV="$BASE_DIR/.env"
STAGING_EXAMPLE="$BASE_DIR/.env.example"
TMP_DIR="/tmp/myunila-env-copy"

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Copy Production .env to VM5 Staging${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Production VM info
VM1_HOST="myfrontend@192.168.120.41"
VM2_HOST="mybackend1@192.168.120.42"
VM3_HOST="mybackend2@192.168.120.43"

VM1_ENV_PATH="/var/www/my-unila/deployment/production/vm1-frontend-kong/.env"
VM2_ENV_PATH="/var/www/my-unila/deployment/production/vm2-backend1/.env"
VM3_ENV_PATH="/var/www/my-unila/deployment/production/vm3-backend2/.env"

mkdir -p "$TMP_DIR"

###############################################################################
# Step 1: Copy .env from each VM
###############################################################################

echo -e "${BLUE}[1/3] Copying .env files from production VMs...${NC}"
echo ""

# VM1
echo -e "  ${YELLOW}VM1 (192.168.120.41) - Frontend & Kong...${NC}"
if scp -o ConnectTimeout=5 "$VM1_HOST:$VM1_ENV_PATH" "$TMP_DIR/vm1.env" 2>/dev/null; then
    echo -e "  ${GREEN}VM1 .env copied${NC}"
else
    echo -e "  ${RED}Failed to copy from VM1. Manual alternative:${NC}"
    echo "    scp $VM1_HOST:$VM1_ENV_PATH $TMP_DIR/vm1.env"
fi

# VM2
echo -e "  ${YELLOW}VM2 (192.168.120.42) - Backend1...${NC}"
if scp -o ConnectTimeout=5 "$VM2_HOST:$VM2_ENV_PATH" "$TMP_DIR/vm2.env" 2>/dev/null; then
    echo -e "  ${GREEN}VM2 .env copied${NC}"
else
    echo -e "  ${RED}Failed to copy from VM2. Manual alternative:${NC}"
    echo "    scp $VM2_HOST:$VM2_ENV_PATH $TMP_DIR/vm2.env"
fi

# VM3
echo -e "  ${YELLOW}VM3 (192.168.120.43) - Backend2...${NC}"
if scp -o ConnectTimeout=5 "$VM3_HOST:$VM3_ENV_PATH" "$TMP_DIR/vm3.env" 2>/dev/null; then
    echo -e "  ${GREEN}VM3 .env copied${NC}"
else
    echo -e "  ${RED}Failed to copy from VM3. Manual alternative:${NC}"
    echo "    scp $VM3_HOST:$VM3_ENV_PATH $TMP_DIR/vm3.env"
fi

echo ""

###############################################################################
# Step 2: Start from .env.example and merge credentials
###############################################################################

echo -e "${BLUE}[2/3] Merging credentials into staging .env...${NC}"

# Start with .env.example as base
cp "$STAGING_EXAMPLE" "$STAGING_ENV"

# Helper function: extract value from a .env file
get_env_val() {
    local file=$1
    local key=$2
    if [ -f "$file" ]; then
        grep -E "^${key}=" "$file" 2>/dev/null | head -1 | cut -d'=' -f2-
    fi
}

# Helper function: set value in staging .env
set_env_val() {
    local key=$1
    local value=$2
    if [ -n "$value" ]; then
        # Escape special characters for sed
        local escaped_value=$(printf '%s\n' "$value" | sed 's/[&/\]/\\&/g')
        if grep -qE "^${key}=" "$STAGING_ENV"; then
            sed -i "s|^${key}=.*|${key}=${escaped_value}|" "$STAGING_ENV"
            echo -e "    ${GREEN}${key}${NC} = (set from production)"
        fi
    fi
}

echo ""
echo -e "  ${YELLOW}Extracting from VM1 (Kong, Frontend)...${NC}"
if [ -f "$TMP_DIR/vm1.env" ]; then
    set_env_val "KONG_PG_PASSWORD" "$(get_env_val "$TMP_DIR/vm1.env" "KONG_PG_PASSWORD")"
    set_env_val "REDIS_PASSWORD" "$(get_env_val "$TMP_DIR/vm1.env" "REDIS_PASSWORD")"
fi

echo ""
echo -e "  ${YELLOW}Extracting from VM2 (Auth, Dashboard, Public)...${NC}"
if [ -f "$TMP_DIR/vm2.env" ]; then
    # Database credentials
    set_env_val "DB_MSSQL_USERNAME" "$(get_env_val "$TMP_DIR/vm2.env" "DB_MSSQL_USERNAME")"
    set_env_val "DB_MSSQL_PASSWORD" "$(get_env_val "$TMP_DIR/vm2.env" "DB_MSSQL_PASSWORD")"

    # Auth DB
    set_env_val "AUTH_DB_USERNAME" "$(get_env_val "$TMP_DIR/vm2.env" "AUTH_DB_USERNAME")"
    set_env_val "AUTH_DB_PASSWORD" "$(get_env_val "$TMP_DIR/vm2.env" "AUTH_DB_PASSWORD")"

    # Public DB
    set_env_val "PUBLIC_DB_USERNAME" "$(get_env_val "$TMP_DIR/vm2.env" "PUBLIC_DB_USERNAME")"
    set_env_val "PUBLIC_DB_PASSWORD" "$(get_env_val "$TMP_DIR/vm2.env" "PUBLIC_DB_PASSWORD")"

    # Dashboard DB
    set_env_val "DASHBOARD_DB_USERNAME" "$(get_env_val "$TMP_DIR/vm2.env" "DASHBOARD_DB_USERNAME")"
    set_env_val "DASHBOARD_DB_PASSWORD" "$(get_env_val "$TMP_DIR/vm2.env" "DASHBOARD_DB_PASSWORD")"

    # APP Keys
    set_env_val "AUTH_APP_KEY" "$(get_env_val "$TMP_DIR/vm2.env" "AUTH_APP_KEY")"
    set_env_val "PUBLIC_APP_KEY" "$(get_env_val "$TMP_DIR/vm2.env" "PUBLIC_APP_KEY")"
    set_env_val "DASHBOARD_APP_KEY" "$(get_env_val "$TMP_DIR/vm2.env" "DASHBOARD_APP_KEY")"

    # JWT
    set_env_val "JWT_SECRET" "$(get_env_val "$TMP_DIR/vm2.env" "JWT_SECRET")"

    # Meilisearch
    set_env_val "MEILISEARCH_KEY" "$(get_env_val "$TMP_DIR/vm2.env" "MEILISEARCH_KEY")"

    # Radius
    set_env_val "RADIUS_DB_PASSWORD" "$(get_env_val "$TMP_DIR/vm2.env" "RADIUS_DB_PASSWORD")"
    set_env_val "RADIUS_DB_USERNAME" "$(get_env_val "$TMP_DIR/vm2.env" "RADIUS_DB_USERNAME")"
fi

echo ""
echo -e "  ${YELLOW}Extracting from VM3 (Sister, Feeder, MyUnila, API, Keuangan, Monitoring)...${NC}"
if [ -f "$TMP_DIR/vm3.env" ]; then
    # Sister
    set_env_val "SISTER_DB_USERNAME" "$(get_env_val "$TMP_DIR/vm3.env" "SISTER_DB_USERNAME")"
    set_env_val "SISTER_DB_PASSWORD" "$(get_env_val "$TMP_DIR/vm3.env" "SISTER_DB_PASSWORD")"
    set_env_val "SISTER_API_IDPENGGUNA" "$(get_env_val "$TMP_DIR/vm3.env" "SISTER_API_IDPENGGUNA")"
    set_env_val "SISTER_API_USERNAME" "$(get_env_val "$TMP_DIR/vm3.env" "SISTER_API_USERNAME")"
    set_env_val "SISTER_API_PASSWORD" "$(get_env_val "$TMP_DIR/vm3.env" "SISTER_API_PASSWORD")"

    # Encryption
    set_env_val "API_CONFIG_ENCRYPTION_KEY" "$(get_env_val "$TMP_DIR/vm3.env" "API_CONFIG_ENCRYPTION_KEY")"
    set_env_val "LARAVEL_APP_KEY" "$(get_env_val "$TMP_DIR/vm3.env" "LARAVEL_APP_KEY")"

    # Feeder
    set_env_val "FEEDER_DB_USERNAME" "$(get_env_val "$TMP_DIR/vm3.env" "FEEDER_DB_USERNAME")"
    set_env_val "FEEDER_DB_PASSWORD" "$(get_env_val "$TMP_DIR/vm3.env" "FEEDER_DB_PASSWORD")"
    set_env_val "FEEDER_API_USERNAME" "$(get_env_val "$TMP_DIR/vm3.env" "FEEDER_API_USERNAME")"
    set_env_val "FEEDER_API_PASSWORD" "$(get_env_val "$TMP_DIR/vm3.env" "FEEDER_API_PASSWORD")"

    # MyUnila
    set_env_val "MYUNILA_DB_USERNAME" "$(get_env_val "$TMP_DIR/vm3.env" "MYUNILA_DB_USERNAME")"
    set_env_val "MYUNILA_DB_PASSWORD" "$(get_env_val "$TMP_DIR/vm3.env" "MYUNILA_DB_PASSWORD")"
    set_env_val "SIKEP_API_USERNAME" "$(get_env_val "$TMP_DIR/vm3.env" "SIKEP_API_USERNAME")"
    set_env_val "SIKEP_API_PASSWORD" "$(get_env_val "$TMP_DIR/vm3.env" "SIKEP_API_PASSWORD")"
    set_env_val "RADIUS_API_APP_KEY" "$(get_env_val "$TMP_DIR/vm3.env" "RADIUS_API_APP_KEY")"
    set_env_val "RADIUS_API_USERNAME" "$(get_env_val "$TMP_DIR/vm3.env" "RADIUS_API_USERNAME")"

    # API Service
    set_env_val "API_DB_USERNAME" "$(get_env_val "$TMP_DIR/vm3.env" "API_DB_USERNAME")"
    set_env_val "API_DB_PASSWORD" "$(get_env_val "$TMP_DIR/vm3.env" "API_DB_PASSWORD")"

    # Keuangan
    set_env_val "KEUANGAN_DB_USERNAME" "$(get_env_val "$TMP_DIR/vm3.env" "KEUANGAN_DB_USERNAME")"
    set_env_val "KEUANGAN_DB_PASSWORD" "$(get_env_val "$TMP_DIR/vm3.env" "KEUANGAN_DB_PASSWORD")"

    # Monitoring
    set_env_val "MONITORING_DB_USERNAME" "$(get_env_val "$TMP_DIR/vm3.env" "MONITORING_DB_USERNAME")"
    set_env_val "MONITORING_DB_PASSWORD" "$(get_env_val "$TMP_DIR/vm3.env" "MONITORING_DB_PASSWORD")"
    set_env_val "BLOGGER_API_KEY" "$(get_env_val "$TMP_DIR/vm3.env" "BLOGGER_API_KEY")"

    # MinIO
    set_env_val "MINIO_SECRET_KEY" "$(get_env_val "$TMP_DIR/vm3.env" "MINIO_SECRET_KEY")"
    set_env_val "MINIO_ACCESS_KEY" "$(get_env_val "$TMP_DIR/vm3.env" "MINIO_ACCESS_KEY")"

    # JWT (fallback jika VM2 tidak punya)
    if ! grep -q "JWT_SECRET=.\+" "$STAGING_ENV"; then
        set_env_val "JWT_SECRET" "$(get_env_val "$TMP_DIR/vm3.env" "JWT_SECRET")"
    fi
fi

echo ""

###############################################################################
# Step 3: Set staging-specific values (override production URLs)
###############################################################################

echo -e "${BLUE}[3/3] Setting staging-specific overrides...${NC}"

# These MUST be staging values, not production
sed -i "s|^VM_IP=.*|VM_IP=192.168.120.45|" "$STAGING_ENV"
sed -i "s|^APP_ENV=.*|APP_ENV=staging|" "$STAGING_ENV"
sed -i "s|^APP_DEBUG=.*|APP_DEBUG=true|" "$STAGING_ENV"
sed -i "s|^NETWORK_NAME=.*|NETWORK_NAME=myunila-staging-network|" "$STAGING_ENV"

# Redis & Meilisearch must be local container names (not production IPs)
sed -i "s|^REDIS_HOST=.*|REDIS_HOST=myunila-redis-staging|" "$STAGING_ENV"
sed -i "s|^MEILISEARCH_HOST=.*|MEILISEARCH_HOST=http://myunila-meilisearch-staging:7700|" "$STAGING_ENV"

# Kong PG must be local
sed -i "s|^KONG_PG_HOST=.*|KONG_PG_HOST=myunila-kong-postgres-staging|" "$STAGING_ENV"

# All frontend URLs point to self (192.168.120.45)
sed -i "s|^NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://192.168.120.45:9800|" "$STAGING_ENV"
sed -i "s|^NEXT_PUBLIC_AUTH_API_URL=.*|NEXT_PUBLIC_AUTH_API_URL=http://192.168.120.45:9800/auth-service/api/v1|" "$STAGING_ENV"
sed -i "s|^NEXT_PUBLIC_PUBLIC_API_URL=.*|NEXT_PUBLIC_PUBLIC_API_URL=http://192.168.120.45:9800/public-service/api/v1|" "$STAGING_ENV"
sed -i "s|^NEXT_PUBLIC_SISTER_API_URL=.*|NEXT_PUBLIC_SISTER_API_URL=http://192.168.120.45:9800/sister-service|" "$STAGING_ENV"
sed -i "s|^NEXT_PUBLIC_FEEDER_API_URL=.*|NEXT_PUBLIC_FEEDER_API_URL=http://192.168.120.45:9800/feeder-service|" "$STAGING_ENV"
sed -i "s|^NEXT_PUBLIC_MYUNILA_API_URL=.*|NEXT_PUBLIC_MYUNILA_API_URL=http://192.168.120.45:9800/myunila-service|" "$STAGING_ENV"
sed -i "s|^NEXT_PUBLIC_DASHBOARD_API_URL=.*|NEXT_PUBLIC_DASHBOARD_API_URL=http://192.168.120.45:9800/dashboard-service|" "$STAGING_ENV"
sed -i "s|^NEXT_PUBLIC_ONEDATA_API_URL=.*|NEXT_PUBLIC_ONEDATA_API_URL=http://192.168.120.45:9800/api-service|" "$STAGING_ENV"
sed -i "s|^NEXT_PUBLIC_WEBMON_API_URL=.*|NEXT_PUBLIC_WEBMON_API_URL=http://192.168.120.45:9800/webmon-service|" "$STAGING_ENV"

# Backend upstream URLs point to local container names
sed -i "s|^AUTH_SERVICE_URL=.*|AUTH_SERVICE_URL=http://myunila-nginx-staging:80|" "$STAGING_ENV"
sed -i "s|^PUBLIC_SERVICE_URL=.*|PUBLIC_SERVICE_URL=http://myunila-nginx-staging:81|" "$STAGING_ENV"
sed -i "s|^DASHBOARD_SERVICE_URL=.*|DASHBOARD_SERVICE_URL=http://myunila-nginx-staging:82|" "$STAGING_ENV"
sed -i "s|^SISTER_SERVICE_URL=.*|SISTER_SERVICE_URL=http://myunila-sister-staging:8083|" "$STAGING_ENV"
sed -i "s|^FEEDER_SERVICE_URL=.*|FEEDER_SERVICE_URL=http://myunila-feeder-staging:8084|" "$STAGING_ENV"
sed -i "s|^API_SERVICE_URL=.*|API_SERVICE_URL=http://myunila-api-staging:8085|" "$STAGING_ENV"
sed -i "s|^MYUNILA_SERVICE_URL=.*|MYUNILA_SERVICE_URL=http://myunila-myunila-staging:8086|" "$STAGING_ENV"
sed -i "s|^KEUANGAN_SERVICE_URL=.*|KEUANGAN_SERVICE_URL=http://myunila-keuangan-staging:8088|" "$STAGING_ENV"
sed -i "s|^WEBMON_SERVICE_URL=.*|WEBMON_SERVICE_URL=http://myunila-monitoring-staging:8089|" "$STAGING_ENV"

echo -e "  ${GREEN}Staging overrides applied${NC}"
echo ""

###############################################################################
# Cleanup
###############################################################################

echo -e "${YELLOW}Production .env copies saved at: $TMP_DIR/${NC}"
echo "  vm1.env, vm2.env, vm3.env (for reference)"
echo ""

###############################################################################
# Summary
###############################################################################

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Done!${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo -e "${GREEN}Staging .env created at: $STAGING_ENV${NC}"
echo ""
echo -e "${YELLOW}PENTING: Review .env dan pastikan:${NC}"
echo "  1. KONG_PG_PASSWORD sudah diisi (set password baru untuk staging)"
echo "  2. Semua DB credentials terisi (tidak kosong)"
echo "  3. JWT_SECRET terisi"
echo "  4. APP_KEY untuk auth, public, dashboard terisi"
echo ""
echo "  nano $STAGING_ENV"
echo ""
echo -e "${YELLOW}Jika ada credential yang gagal di-copy (kosong), isi manual dari production:${NC}"
echo "  # Cek credential kosong:"
echo "  grep '=$' $STAGING_ENV | grep -v '^#'"
echo ""
