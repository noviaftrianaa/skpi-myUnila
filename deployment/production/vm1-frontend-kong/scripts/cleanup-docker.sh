#!/usr/bin/env bash
# ============================================================================
# Cleanup Docker — VM1 (frontend + Kong)
# ============================================================================
# Hapus image dan build cache yang tidak terpakai untuk reclaim storage.
# Kalau VM1 storage hampir penuh akibat rebuild berulang, jalankan script
# ini. Aman by-default: tidak menyentuh volume, tidak menghapus image yang
# masih dipakai container running.
#
# Mode:
#   default      → dangling images + build cache + stopped containers
#   --aggressive → tambah: unused images >7 hari (yang tidak ditag :staging
#                  / :latest yang dipakai container running juga aman)
#   --yes        → skip konfirmasi prompt
#   --dry-run    → preview saja, tidak eksekusi
#
# Volume tidak pernah di-prune otomatis. Untuk volume cleanup, edit script
# lalu uncomment bagian VOLUME PRUNE setelah verifikasi list manual.
# ============================================================================
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Args
AGGRESSIVE=false
AUTO_YES=false
DRY_RUN=false
for arg in "$@"; do
    case "$arg" in
        --aggressive) AGGRESSIVE=true ;;
        --yes|-y)     AUTO_YES=true ;;
        --dry-run)    DRY_RUN=true ;;
        --help|-h)
            echo "Usage: $0 [--aggressive] [--yes] [--dry-run]"
            echo "  --aggressive  hapus juga unused images >7 hari (bukan dangling saja)"
            echo "  --yes / -y    skip konfirmasi"
            echo "  --dry-run     preview saja"
            exit 0
            ;;
    esac
done

confirm() {
    if [ "$AUTO_YES" = true ]; then return 0; fi
    read -rp "$1 [y/N] " ans
    [[ "$ans" =~ ^[Yy]$ ]]
}

run() {
    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY] $*${NC}"
    else
        eval "$@"
    fi
}

print_disk_usage() {
    echo -e "${BLUE}Disk usage:${NC}"
    docker system df 2>&1 | head -10
    echo ""
}

# ============================================================================
# 1. Pre-cleanup snapshot
# ============================================================================
echo -e "${GREEN}=== Docker Cleanup VM1 ===${NC}"
echo ""
echo -e "${BLUE}BEFORE:${NC}"
print_disk_usage

# ============================================================================
# 2. Safety — show running containers + named volumes (these will NOT be touched)
# ============================================================================
echo -e "${BLUE}Container running (tidak akan disentuh):${NC}"
docker ps --format "  {{.Names}} ({{.Image}})" | head -30
echo ""

VOLUMES=$(docker volume ls -q)
if [ -n "$VOLUMES" ]; then
    echo -e "${BLUE}Named volumes (tidak akan disentuh):${NC}"
    docker volume ls --format "  {{.Name}} ({{.Driver}})"
    echo ""
fi

if ! confirm "Lanjutkan cleanup?"; then
    echo "Aborted."
    exit 0
fi

# ============================================================================
# 3. Stopped containers — safe to remove
# ============================================================================
echo ""
echo -e "${GREEN}[1/4] Hapus stopped containers...${NC}"
STOPPED=$(docker ps -aq --filter "status=exited" --filter "status=created")
if [ -n "$STOPPED" ]; then
    run docker rm $STOPPED
else
    echo "  (tidak ada stopped container)"
fi

# ============================================================================
# 4. Dangling images (no tag, no parent) — always safe
# ============================================================================
echo ""
echo -e "${GREEN}[2/4] Hapus dangling images (image tanpa tag)...${NC}"
run docker image prune -f

# ============================================================================
# 5. Build cache — always safe (worst case: next build sedikit lebih lama)
# ============================================================================
echo ""
echo -e "${GREEN}[3/4] Hapus build cache...${NC}"
run docker builder prune -f

# ============================================================================
# 6. Unused images older than 7d — aggressive mode only
# ============================================================================
if [ "$AGGRESSIVE" = true ]; then
    echo ""
    echo -e "${YELLOW}[4/4] AGGRESSIVE: hapus unused images >7 hari...${NC}"
    echo -e "${YELLOW}  Image yang dipakai container running TIDAK ikut dihapus (Docker check by ref).${NC}"
    run docker image prune -a -f --filter "until=168h"
else
    echo ""
    echo -e "${BLUE}[4/4] Skip aggressive prune (unused image lama). Pakai --aggressive kalau perlu.${NC}"
fi

# ============================================================================
# 7. Volume — NEVER auto-prune. Show usage saja.
# ============================================================================
echo ""
echo -e "${YELLOW}Volume tidak di-prune otomatis (bisa menyebabkan data loss kalau ada${NC}"
echo -e "${YELLOW}volume yang sedang tidak di-mount tapi masih dipakai logikanya).${NC}"
echo -e "${YELLOW}Untuk cek volume yang dangling (tidak attached ke container manapun):${NC}"
echo "    docker volume ls -qf dangling=true"
echo -e "${YELLOW}Hapus manual hanya setelah verifikasi:${NC}"
echo "    docker volume rm <name>"
echo ""

# ============================================================================
# 8. Post-cleanup snapshot
# ============================================================================
echo -e "${BLUE}AFTER:${NC}"
print_disk_usage

echo -e "${GREEN}✓ Cleanup selesai.${NC}"
