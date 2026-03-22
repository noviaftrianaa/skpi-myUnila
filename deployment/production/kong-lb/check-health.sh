#!/bin/bash
# ============================================
# Kong Upstream Health Check
# Quick check all upstreams + targets health
# ============================================
# Usage: bash check-health.sh [KONG_ADMIN_URL]
# ============================================

KONG_ADMIN="${1:-http://localhost:9801}"

UPSTREAMS=(
  "sister-service-upstream"
  "feeder-service-upstream"
  "myunila-service-upstream"
  "api-service-upstream"
  "project-service-upstream"
  "keuangan-service-upstream"
  "monitoring-service-upstream"
)

echo "🏥 Kong Upstream Health Check"
echo "   Admin: $KONG_ADMIN"
echo "================================================"

for upstream in "${UPSTREAMS[@]}"; do
  echo ""
  echo "📦 $upstream:"
  health=$(curl -s "$KONG_ADMIN/upstreams/$upstream/health" 2>/dev/null)

  if [ $? -ne 0 ] || echo "$health" | grep -q "Not found"; then
    echo "   ❌ Upstream not found"
    continue
  fi

  echo "$health" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    for t in data.get('data', []):
        target = t.get('target', 'unknown')
        health = t.get('health', 'unknown')
        weight = t.get('weight', 0)
        icon = '✅' if health == 'HEALTHY' else '❌' if health == 'UNHEALTHY' else '⚠️'
        print(f'   {icon} {target} (weight={weight}) → {health}')
except:
    print('   ⚠️  Could not parse response')
" 2>/dev/null || echo "   ⚠️  python3 not available, raw response: $(echo $health | head -c 200)"
done

echo ""
echo "================================================"
echo "💡 Quick commands:"
echo "   Disable target:  curl -X POST $KONG_ADMIN/upstreams/<upstream>/targets/<target>/unhealthy"
echo "   Enable target:   curl -X POST $KONG_ADMIN/upstreams/<upstream>/targets/<target>/healthy"
echo "   Remove target:   curl -X DELETE $KONG_ADMIN/upstreams/<upstream>/targets/<target_id>"
