#!/bin/bash
# Bump connect/read/write timeout SEMUA Kong service ke 180s.
# Default Kong 60s cap terlalu pendek utk IKU monitoring endpoint yg
# bisa 30-90s saat cache miss. Idempotent — bisa jalankan berulang.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
fi

KONG_ADMIN_URL="http://localhost:${KONG_ADMIN_PORT:-9801}"
TIMEOUT=180000  # 180s

echo "Bumping Kong service timeouts to ${TIMEOUT}ms..."

if command -v jq &> /dev/null; then
    SERVICE_NAMES=$(curl -s "$KONG_ADMIN_URL/services" | jq -r '.data[].name')
else
    SERVICE_NAMES=$(curl -s "$KONG_ADMIN_URL/services" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
fi

if [ -z "$SERVICE_NAMES" ]; then
    echo "  No services found in Kong."
    exit 0
fi

for name in $SERVICE_NAMES; do
    echo "  ${name}..."
    curl -s -X PATCH "$KONG_ADMIN_URL/services/$name" \
      -H "Content-Type: application/json" \
      -d "{\"connect_timeout\":${TIMEOUT},\"read_timeout\":${TIMEOUT},\"write_timeout\":${TIMEOUT}}" \
      > /dev/null
done

echo "Done. Verify with:"
echo "  curl -s $KONG_ADMIN_URL/services | jq '.data[] | {name, connect_timeout, read_timeout, write_timeout}'"
