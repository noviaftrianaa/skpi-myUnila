#!/usr/bin/env bash
# ============================================================================
# Test script: SIKERMA API connectivity dari VM
# ============================================================================
# Tujuan: Cek apakah VM ini bisa hit SIKERMA API tanpa kena Cloudflare block.
#
# Run di VM target:
#   bash test-sikerma-curl.sh
#
# Akan:
# 1. Test endpoint /unit-kerja (list)
# 2. Test endpoint /unit-kerja/161/kerjasama (sample S2 Pend Fis)
# 3. Test 2-3 unit-kerja id lain (acak)
# 4. Save semua response ke /tmp/sikerma-test-*.json
# 5. Print summary: status code, content-type, ukuran, deteksi Cloudflare
# ============================================================================

set -uo pipefail

BASE_URL="${SIKERMA_BASE_URL:-https://sikerma.unila.ac.id/api/v1}"
OUT_DIR="${OUT_DIR:-/tmp}"
TS=$(date +%Y%m%d-%H%M%S)

# Colors
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

# User-Agent realistic browser (Cloudflare friendly)
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

call_api() {
    local label="$1"
    local path="$2"
    local outfile="$OUT_DIR/sikerma-${label}-${TS}.json"

    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}TEST: ${label}${NC}"
    echo -e "${BLUE}URL : ${BASE_URL}${path}${NC}"
    echo ""

    # Save full response with status + headers
    HTTP_CODE=$(curl -sS -o "$outfile" -w "%{http_code}" \
        -A "$UA" \
        -H "Accept: application/json" \
        -H "Accept-Language: en-US,en;q=0.9" \
        -H "Cache-Control: no-cache" \
        --connect-timeout 10 \
        --max-time 30 \
        "${BASE_URL}${path}" 2>&1)

    SIZE=$(wc -c < "$outfile" 2>/dev/null || echo 0)
    CONTENT_TYPE=$(file -b --mime-type "$outfile" 2>/dev/null || echo "unknown")
    FIRST_BYTES=$(head -c 200 "$outfile" 2>/dev/null)

    echo -e "  HTTP code     : ${HTTP_CODE}"
    echo -e "  Response size : ${SIZE} bytes"
    echo -e "  Saved to      : ${outfile}"

    # Detect Cloudflare challenge
    if echo "$FIRST_BYTES" | grep -q "Just a moment"; then
        echo -e "  ${RED}✗ BLOCKED — Cloudflare bot challenge${NC}"
        echo -e "    Pertama 200 char:"
        echo "$FIRST_BYTES" | head -c 100
        echo ""
        return 1
    fi

    # Check JSON valid
    if echo "$FIRST_BYTES" | head -c 1 | grep -q '{'; then
        # Parse status field
        STATUS=$(python3 -c "import json,sys; d=json.load(open('$outfile')); print(d.get('status','-'))" 2>/dev/null || echo "-")
        TOTAL=$(python3 -c "import json,sys; d=json.load(open('$outfile')); print(d.get('total_data',d.get('data','[]') if isinstance(d.get('data'),list) else len(d.get('data',[]))))" 2>/dev/null || echo "-")
        echo -e "  ${GREEN}✓ JSON valid${NC} — status=${STATUS}, total_data=${TOTAL}"
        # Show first 500 char preview
        echo -e "  Preview:"
        echo "$FIRST_BYTES" | head -c 400 | python3 -m json.tool 2>/dev/null || echo "$FIRST_BYTES" | head -c 400
        echo ""
        return 0
    else
        echo -e "  ${YELLOW}⚠ Response bukan JSON — preview:${NC}"
        echo "$FIRST_BYTES" | head -c 300
        echo ""
        return 1
    fi
}

# ============================================================================
echo -e "${GREEN}=== SIKERMA Connectivity Test ===${NC}"
echo "Server source IP    : $(curl -s --max-time 5 https://ifconfig.me 2>/dev/null || echo 'unknown')"
echo "Hostname            : $(hostname)"
echo "Base URL            : $BASE_URL"
echo "Timestamp           : $TS"
echo ""

# ============================================================================
# Test 1 — List unit-kerja
# ============================================================================
call_api "01-unit-kerja-list" "/unit-kerja" || true

# ============================================================================
# Test 2 — Kerjasama untuk unit 161 (S2 Pend Fis, sample dari user)
# ============================================================================
call_api "02-kerjasama-unit-161" "/unit-kerja/161/kerjasama" || true

# ============================================================================
# Test 3 — Kerjasama untuk unit 152 (saran user)
# ============================================================================
call_api "03-kerjasama-unit-152" "/unit-kerja/152/kerjasama" || true

# ============================================================================
# Test 4 — Coba unit kerja id 1 + 100 (random sample buat coverage)
# ============================================================================
call_api "04-kerjasama-unit-1"   "/unit-kerja/1/kerjasama"   || true
call_api "05-kerjasama-unit-100" "/unit-kerja/100/kerjasama" || true

# ============================================================================
# Summary
# ============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}=== Summary ===${NC}"
ls -la "$OUT_DIR"/sikerma-*-${TS}.json 2>/dev/null
echo ""
echo "Cek isi file:"
echo "  cat ${OUT_DIR}/sikerma-01-unit-kerja-list-${TS}.json | head -50"
echo ""
echo "Kalau ada response yang valid JSON, kirim isinya ke saya untuk lanjut design integrator."
