#!/usr/bin/env bash
# ============================================================================
# Setup SIKERMA Proxy — VM1
# ============================================================================
# Deploy nginx sidecar di VM1 untuk proxy ke sikerma.unila.ac.id.
# Solusi untuk VM3 yang ke-block Cloudflare TLS fingerprint discrimination.
#
# Run:
#   bash scripts/setup-sikerma-proxy.sh
# ============================================================================
set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BLUE='\033[0;34m'; NC='\033[0m'

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SVC_DIR="$HERE/services/sikerma-proxy"

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Setup SIKERMA Proxy (nginx sidecar)${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

cd "$SVC_DIR"

# ============================================================================
# Pre-flight checks — pastikan tidak ganggu service lain
# ============================================================================
echo -e "${GREEN}[1/5] Pre-flight safety check...${NC}"

# 1. Cek port 9803 tidak collision
if ss -tln 2>/dev/null | grep -q ":9803 " || netstat -tln 2>/dev/null | grep -q ":9803 "; then
    echo -e "${RED}  ✗ Port 9803 sudah dipakai service lain. Aborting.${NC}"
    ss -tln | grep ":9803 " 2>/dev/null || netstat -tln | grep ":9803 "
    exit 1
fi
echo "  ✓ Port 9803 free"

# 2. Cek container name tidak collision
if docker ps -a --format '{{.Names}}' | grep -q "^myunila-sikerma-proxy$"; then
    echo -e "${YELLOW}  ⚠ Container 'myunila-sikerma-proxy' sudah ada — akan di-recreate${NC}"
fi

# 3. Cek network myunila-prod-network ada
if ! docker network ls --format '{{.Name}}' | grep -q "^myunila-prod-network$"; then
    echo -e "${RED}  ✗ Network 'myunila-prod-network' tidak ada. Pastikan service utama VM1 sudah running dulu.${NC}"
    exit 1
fi
echo "  ✓ Network myunila-prod-network exists"

# 4. Snapshot existing containers (untuk rollback verification)
EXISTING_HEALTHY=$(docker ps --filter "health=healthy" --format '{{.Names}}' | sort | tr '\n' ',' | sed 's/,$//')
echo "  ✓ Existing healthy containers snapshot: $EXISTING_HEALTHY"
echo ""

echo -e "${GREEN}[2/5] Validating nginx config syntax...${NC}"
docker run --rm -v "$SVC_DIR/nginx.conf:/etc/nginx/nginx.conf:ro" nginx:alpine \
    nginx -t -c /etc/nginx/nginx.conf 2>&1 | head -5
echo ""

echo -e "${GREEN}[3/5] Starting sikerma-proxy container...${NC}"
docker compose up -d --force-recreate
echo ""

echo -e "${GREEN}[4/5] Waiting for healthcheck (max 30s)...${NC}"
for i in {1..30}; do
    STATUS=$(docker inspect myunila-sikerma-proxy --format='{{.State.Health.Status}}' 2>/dev/null || echo "unknown")
    if [ "$STATUS" = "healthy" ]; then
        echo "  ✓ healthy after ${i}s"
        break
    fi
    sleep 1
done
if [ "$STATUS" != "healthy" ]; then
    echo -e "${RED}  ✗ Container tidak healthy setelah 30s. Status: $STATUS${NC}"
    docker logs myunila-sikerma-proxy --tail 30
    exit 1
fi
echo ""

echo -e "${GREEN}[5/5] Verify existing services masih healthy...${NC}"
NEW_HEALTHY=$(docker ps --filter "health=healthy" --format '{{.Names}}' | sort | tr '\n' ',' | sed 's/,$//')
# Existing healthy containers harus tetap healthy (sikerma-proxy ditambah, bukan menggantikan)
LOST=""
IFS=',' read -ra OLD <<< "$EXISTING_HEALTHY"
for c in "${OLD[@]}"; do
    if [ -n "$c" ] && ! echo "$NEW_HEALTHY" | grep -q "$c"; then
        LOST="$LOST $c"
    fi
done
if [ -n "$LOST" ]; then
    echo -e "${RED}  ✗ Service lain berubah unhealthy: $LOST${NC}"
    echo -e "${YELLOW}     Cek logs + rollback kalau perlu:${NC}"
    echo "     docker compose -f $SVC_DIR/docker-compose.yml down"
    exit 1
fi
echo "  ✓ Semua existing healthy services tetap healthy"
echo ""

echo -e "${BLUE}=== Test from VM1 (local) ===${NC}"
curl -sS http://127.0.0.1:9803/health
echo ""
curl -sS "http://127.0.0.1:9803/sikerma/api/v1/unit-kerja" | head -c 300
echo ""
echo ""

echo -e "${BLUE}=== Test from VM3 ===${NC}"
echo "Run dari VM3:"
echo "  curl -sS http://192.168.120.41:9803/sikerma/api/v1/unit-kerja | head -c 300"
echo "  curl -sS http://192.168.120.41:9803/sikerma/api/v1/unit-kerja/161/kerjasama | head -c 300"
echo ""

echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "Backend integrator config (myunila-service di VM3):"
echo "  SIKERMA_BASE_URL=http://192.168.120.41:9803/sikerma/api/v1"
echo ""
