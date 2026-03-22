#!/bin/bash
# ============================================
# Kong Active-Active Load Balancing Setup
# VM3 (192.168.120.43) + VM6 (192.168.120.46)
# ============================================
# Run from VM1 (myfrontend) where Kong admin is accessible
# Usage: bash setup-upstreams.sh [KONG_ADMIN_URL]
# ============================================

KONG_ADMIN="${1:-http://localhost:9801}"

echo "🔧 Kong Admin: $KONG_ADMIN"
echo "================================================"

# Service definitions: name|vm3_port|vm6_port|health_path|route_path
SERVICES=(
  "sister-service|8091|8091|/health|/sister-service"
  "feeder-service|8092|8092|/health|/feeder-service"
  "myunila-service|8093|8093|/health|/myunila-service"
  "api-service|8094|8094|/health|/api-service"
  "project-service|8095|8095|/health|/project-service"
  "keuangan-service|8096|8096|/health|/keuangan-service"
  "monitoring-service|8097|8097|/health|/monitoring-service"
)

VM3="192.168.120.43"
VM6="192.168.120.46"

for svc_def in "${SERVICES[@]}"; do
  IFS='|' read -r SVC_NAME VM3_PORT VM6_PORT HEALTH_PATH ROUTE_PATH <<< "$svc_def"
  UPSTREAM_NAME="${SVC_NAME}-upstream"

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📦 Setting up: $SVC_NAME → $UPSTREAM_NAME"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # 1. Create upstream with health checks
  echo "  → Creating upstream..."
  curl -s -X POST "$KONG_ADMIN/upstreams" \
    --data "name=$UPSTREAM_NAME" \
    --data "algorithm=round-robin" \
    --data "hash_on=none" \
    --data "healthchecks.active.type=http" \
    --data "healthchecks.active.http_path=$HEALTH_PATH" \
    --data "healthchecks.active.timeout=5" \
    --data "healthchecks.active.concurrency=5" \
    --data "healthchecks.active.healthy.interval=10" \
    --data "healthchecks.active.healthy.successes=3" \
    --data "healthchecks.active.healthy.http_statuses=200,302" \
    --data "healthchecks.active.unhealthy.interval=5" \
    --data "healthchecks.active.unhealthy.http_failures=3" \
    --data "healthchecks.active.unhealthy.timeouts=3" \
    --data "healthchecks.active.unhealthy.http_statuses=429,500,503" \
    --data "healthchecks.passive.type=http" \
    --data "healthchecks.passive.healthy.successes=5" \
    --data "healthchecks.passive.healthy.http_statuses=200,201,202,204,302" \
    --data "healthchecks.passive.unhealthy.http_failures=3" \
    --data "healthchecks.passive.unhealthy.timeouts=3" \
    --data "healthchecks.passive.unhealthy.http_statuses=429,500,503" \
    -o /dev/null -w "HTTP %{http_code}"
  echo ""

  # 2. Add VM3 target (primary, weight=100)
  echo "  → Adding target VM3 ($VM3:$VM3_PORT)..."
  curl -s -X POST "$KONG_ADMIN/upstreams/$UPSTREAM_NAME/targets" \
    --data "target=$VM3:$VM3_PORT" \
    --data "weight=100" \
    --data "tags=vm3,primary" \
    -o /dev/null -w "HTTP %{http_code}"
  echo ""

  # 3. Add VM6 target (replica, weight=100)
  echo "  → Adding target VM6 ($VM6:$VM6_PORT)..."
  curl -s -X POST "$KONG_ADMIN/upstreams/$UPSTREAM_NAME/targets" \
    --data "target=$VM6:$VM6_PORT" \
    --data "weight=100" \
    --data "tags=vm6,replica" \
    -o /dev/null -w "HTTP %{http_code}"
  echo ""

  # 4. Update existing service to use upstream (or create if not exists)
  echo "  → Updating service to use upstream..."
  # Try PATCH first (update existing)
  HTTP_CODE=$(curl -s -X PATCH "$KONG_ADMIN/services/$SVC_NAME" \
    --data "host=$UPSTREAM_NAME" \
    --data "port=" \
    --data "path=" \
    -o /dev/null -w "%{http_code}")

  if [ "$HTTP_CODE" = "404" ]; then
    # Create new service
    echo "  → Service not found, creating..."
    curl -s -X POST "$KONG_ADMIN/services/" \
      --data "name=$SVC_NAME" \
      --data "host=$UPSTREAM_NAME" \
      -o /dev/null -w "HTTP %{http_code}"
    echo ""

    # Create route
    echo "  → Creating route..."
    curl -s -X POST "$KONG_ADMIN/services/$SVC_NAME/routes" \
      --data "name=${SVC_NAME}-route" \
      --data "paths[]=$ROUTE_PATH" \
      --data "strip_path=true" \
      -o /dev/null -w "HTTP %{http_code}"
    echo ""
  else
    echo "  HTTP $HTTP_CODE"
  fi

  echo "  ✅ $SVC_NAME configured"
done

echo ""
echo "================================================"
echo "🎉 All upstreams configured!"
echo ""
echo "📋 Verify health:"
echo "  curl -s $KONG_ADMIN/upstreams | jq '.data[].name'"
echo ""
echo "📋 Check targets per upstream:"
for svc_def in "${SERVICES[@]}"; do
  IFS='|' read -r SVC_NAME _ _ _ _ <<< "$svc_def"
  echo "  curl -s $KONG_ADMIN/upstreams/${SVC_NAME}-upstream/health | jq '.data[] | {target, health}'"
done
echo ""
echo "📋 Test failover:"
echo "  1. Stop VM6 containers: ssh myreplica@$VM6 'docker compose down'"
echo "  2. Check health: curl -s $KONG_ADMIN/upstreams/api-service-upstream/health | jq"
echo "  3. Traffic should auto-route to VM3 only"
echo "  4. Start VM6 back: ssh myreplica@$VM6 'docker compose up -d'"
echo "================================================"
