#!/bin/bash
# ============================================================
# Setup Exporters di VM1 / VM2 / VM3
# Jalankan di VM yang bersangkutan:
#   bash setup-exporters.sh vm1
#   bash setup-exporters.sh vm2
#   bash setup-exporters.sh vm3
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

VM=${1:-}
if [ -z "$VM" ]; then
    echo -e "${RED}Usage: bash setup-exporters.sh [vm1|vm2|vm3]${NC}"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXPORTER_DIR="$SCRIPT_DIR/../services/${VM}-exporters"

if [ ! -d "$EXPORTER_DIR" ]; then
    echo -e "${RED}Direktori tidak ditemukan: $EXPORTER_DIR${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Deploy Exporters — $VM${NC}"
echo -e "${GREEN}=========================================${NC}"

# Cek network
echo -e "${YELLOW}[1/4] Checking Docker network...${NC}"
docker network create myunila-prod-network 2>/dev/null && \
    echo -e "  ${GREEN}✅ Network created${NC}" || \
    echo -e "  ${GREEN}✅ Network exists${NC}"

# Firewall
echo -e "${YELLOW}[2/4] Firewall rules...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow from 192.168.120.44 to any port 9100 comment "Prometheus node-exporter"
    ufw allow from 192.168.120.44 to any port 18080 comment "Prometheus cadvisor"
    [ "$VM" = "vm1" ] && ufw allow from 192.168.120.44 to any port 9113 comment "Prometheus nginx-exporter"
    [ "$VM" = "vm2" ] && ufw allow from 192.168.120.44 to any port 9121 comment "Prometheus redis-exporter"
    echo -e "  ${GREEN}✅ Firewall rules added${NC}"
fi

# Pull images
echo -e "${YELLOW}[3/4] Pulling images...${NC}"
cd "$EXPORTER_DIR"
docker compose -f docker-compose.exporters.yml pull
echo -e "  ${GREEN}✅ Images pulled${NC}"

# Start
echo -e "${YELLOW}[4/4] Starting exporters...${NC}"
docker compose -f docker-compose.exporters.yml up -d
echo -e "  ${GREEN}✅ Exporters started${NC}"

sleep 5
echo ""
echo -e "${GREEN}Status:${NC}"
docker ps | grep "myunila-node-exporter\|myunila-cadvisor\|myunila-redis-exporter\|myunila-nginx-exporter\|myunila-promtail" | \
    awk '{print "  "$NF, $7}' || true

echo ""
echo -e "${GREEN}Done! Prometheus di VM4 akan mulai scrape ${VM} dalam ~15 detik.${NC}"
