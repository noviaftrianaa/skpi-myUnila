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

echo -e "${GREEN}[1/3] Validating nginx config...${NC}"
docker run --rm -v "$SVC_DIR/nginx.conf:/etc/nginx/nginx.conf:ro" nginx:alpine \
    nginx -t -c /etc/nginx/nginx.conf 2>&1 | head -5
echo ""

echo -e "${GREEN}[2/3] Starting sikerma-proxy container...${NC}"
docker compose up -d --force-recreate
echo ""

echo -e "${GREEN}[3/3] Waiting for healthcheck...${NC}"
sleep 5
STATUS=$(docker inspect myunila-sikerma-proxy --format='{{.State.Health.Status}}' 2>/dev/null || echo "unknown")
echo "  Status: $STATUS"
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
