#!/bin/bash
# ============================================================
# Setup Script VM4 — MyUnila Monitoring Stack
# Jalankan sebagai: bash setup-vm4.sh
# VM: 192.168.120.44 (mybalancer)
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  MyUnila VM4 Monitoring Setup${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
MONITORING_DIR="$BASE_DIR/services/monitoring"
ENV_FILE="$MONITORING_DIR/.env"

# ─── 1. Cek .env ───────────────────────────────────────────
echo -e "${YELLOW}[1/6] Checking .env...${NC}"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}  .env tidak ditemukan!${NC}"
    echo "  Copy dulu: cp $MONITORING_DIR/.env.example $ENV_FILE"
    echo "  Lalu isi GRAFANA_ADMIN_PASSWORD, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID"
    exit 1
fi

# Validasi variabel wajib
source "$ENV_FILE"
MISSING=()
[ -z "$GRAFANA_ADMIN_PASSWORD" ] && MISSING+=("GRAFANA_ADMIN_PASSWORD")
[ -z "$TELEGRAM_BOT_TOKEN" ] && MISSING+=("TELEGRAM_BOT_TOKEN")
[ -z "$TELEGRAM_CHAT_ID" ] && MISSING+=("TELEGRAM_CHAT_ID")

if [ ${#MISSING[@]} -gt 0 ]; then
    echo -e "${RED}  Variabel belum diisi di .env:${NC}"
    for v in "${MISSING[@]}"; do echo "  - $v"; done
    exit 1
fi
echo -e "  ${GREEN}✅ .env OK${NC}"

# ─── 2. Install Docker (jika belum) ────────────────────────
echo -e "${YELLOW}[2/6] Checking Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo "  Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker $USER
    echo -e "  ${GREEN}✅ Docker installed${NC}"
else
    echo -e "  ${GREEN}✅ Docker already installed: $(docker --version)${NC}"
fi

# ─── 3. Create Docker network ──────────────────────────────
echo -e "${YELLOW}[3/6] Creating Docker network...${NC}"
docker network create myunila-monitoring-network 2>/dev/null && \
    echo -e "  ${GREEN}✅ Network created${NC}" || \
    echo -e "  ${GREEN}✅ Network already exists${NC}"

# ─── 4. Setup firewall ─────────────────────────────────────
echo -e "${YELLOW}[4/6] Setting up firewall...${NC}"
if command -v ufw &> /dev/null; then
    # Grafana & Prometheus — VPN admin only
    ufw allow from 10.10.110.0/24 to any port 3001 comment "Grafana VPN"
    ufw allow from 10.10.110.0/24 to any port 9090 comment "Prometheus VPN"
    ufw allow from 10.10.110.0/24 to any port 9093 comment "Alertmanager VPN"
    # Loki — internal only (VM1-VM3 push logs)
    ufw allow from 192.168.120.0/23 to any port 3100 comment "Loki internal"
    # Exporters — internal only
    ufw allow from 192.168.120.0/23 to any port 9100 comment "NodeExporter internal"
    ufw allow from 192.168.120.0/23 to any port 18080 comment "cAdvisor internal"
    echo -e "  ${GREEN}✅ Firewall rules added${NC}"
else
    echo -e "  ${YELLOW}⚠️  ufw tidak ditemukan, skip firewall setup${NC}"
fi

# ─── 4b. Generate alertmanager config dengan nilai dari .env ──
echo -e "${YELLOW}[4b] Generating alertmanager config...${NC}"
ALERTMANAGER_CONFIG="$MONITORING_DIR/config/alertmanager/config.yml"
sed -i \
    "s|\${TELEGRAM_BOT_TOKEN}|${TELEGRAM_BOT_TOKEN}|g" \
    "$ALERTMANAGER_CONFIG"
sed -i \
    "s|\${TELEGRAM_CHAT_ID}|${TELEGRAM_CHAT_ID}|g" \
    "$ALERTMANAGER_CONFIG"
echo -e "  ${GREEN}✅ Alertmanager config generated${NC}"

# ─── 5. Pull images ────────────────────────────────────────
echo -e "${YELLOW}[5/6] Pulling Docker images...${NC}"
cd "$MONITORING_DIR"
docker compose -f docker-compose.monitoring.yml pull
echo -e "  ${GREEN}✅ Images pulled${NC}"

# ─── 6. Start stack ────────────────────────────────────────
echo -e "${YELLOW}[6/6] Starting monitoring stack...${NC}"
docker compose -f docker-compose.monitoring.yml up -d
echo -e "  ${GREEN}✅ Stack started${NC}"

# ─── Verifikasi ────────────────────────────────────────────
echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Verifikasi${NC}"
echo -e "${GREEN}=========================================${NC}"
sleep 15

check_service() {
    local name=$1
    local url=$2
    if curl -sf "$url" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ $name OK${NC}"
    else
        echo -e "  ${RED}❌ $name belum ready (coba lagi dalam 30 detik)${NC}"
    fi
}

check_service "Prometheus" "http://localhost:9090/-/healthy"
check_service "Grafana" "http://localhost:3001/api/health"
check_service "Loki" "http://localhost:3100/ready"
check_service "Alertmanager" "http://localhost:9093/-/healthy"

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Selesai! Akses:${NC}"
echo -e "  Grafana:      http://192.168.120.44:3001"
echo -e "  Prometheus:   http://192.168.120.44:9090"
echo -e "  Alertmanager: http://192.168.120.44:9093"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${YELLOW}Langkah selanjutnya:${NC}"
echo "  1. Buka Grafana → Login dengan password di .env"
echo "  2. Import dashboards (ID: 1860, 14282, 7424, 763)"
echo "  3. Deploy exporters di VM1, VM2, VM3"
echo "     (lihat: services/vm1-exporters/, vm2-exporters/, vm3-exporters/)"
echo ""
