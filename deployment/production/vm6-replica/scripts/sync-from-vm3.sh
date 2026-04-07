#!/bin/bash
# ============================================
# Sync & Deploy dari VM3 ke VM6
# Run dari VM3 atau VM1 yang punya SSH access ke keduanya
# ============================================
# Usage: bash sync-from-vm3.sh [service_name|all]
# Example: bash sync-from-vm3.sh api-service
#          bash sync-from-vm3.sh all
# ============================================

VM3_USER="mybackend2"
VM3_HOST="192.168.120.43"
VM6_USER="myreplica"
VM6_HOST="192.168.120.46"

REPO_DIR="/var/www/my-unila"
VM6_DEPLOY_DIR="$REPO_DIR/deployment/production/vm6-replica"

SERVICE="${1:-all}"

echo "🔄 Sync VM3 → VM6"
echo "   Service: $SERVICE"
echo "================================================"

# Method 1: Docker save/load (if building on VM3)
sync_via_docker() {
  local svc_name=$1
  local image_name="myunila/${svc_name}:production"

  echo "  📦 Saving image: $image_name"
  docker save "$image_name" | ssh "$VM6_USER@$VM6_HOST" "docker load"
  echo "  ✅ Image synced"
}

# Method 2: Git pull + rebuild (if VM6 has repo access)
sync_via_git() {
  echo "  📥 Git pull on VM6..."
  ssh "$VM6_USER@$VM6_HOST" "cd $REPO_DIR && git pull origin master"

  if [ "$SERVICE" = "all" ]; then
    echo "  🔨 Rebuilding all services on VM6..."
    ssh "$VM6_USER@$VM6_HOST" "cd $VM6_DEPLOY_DIR && docker compose --env-file .env up -d --build"
  else
    echo "  🔨 Rebuilding $SERVICE on VM6..."
    ssh "$VM6_USER@$VM6_HOST" "cd $VM6_DEPLOY_DIR && docker compose --env-file .env up -d --build $SERVICE"
  fi
  echo "  ✅ Rebuild complete"
}

# Method 3: SCP source + rebuild (if VM6 has no git)
sync_via_scp() {
  local svc_name=$1

  echo "  📤 SCP source code to VM6..."

  if [ "$svc_name" = "all" ]; then
    # Sync all Go service directories
    for dir in sister-service feeder-service myunila-service api-service project-service keuangan-service monitoring-service; do
      echo "    → $dir"
      rsync -az --delete "$REPO_DIR/backend/$dir/" "$VM6_USER@$VM6_HOST:$REPO_DIR/backend/$dir/"
    done

    # Sync deployment config
    rsync -az "$VM6_DEPLOY_DIR/" "$VM6_USER@$VM6_HOST:$VM6_DEPLOY_DIR/"

    echo "  🔨 Rebuilding all services..."
    ssh "$VM6_USER@$VM6_HOST" "cd $VM6_DEPLOY_DIR && docker compose --env-file .env up -d --build"
  else
    echo "    → $svc_name"
    rsync -az --delete "$REPO_DIR/backend/$svc_name/" "$VM6_USER@$VM6_HOST:$REPO_DIR/backend/$svc_name/"

    echo "  🔨 Rebuilding $svc_name..."
    ssh "$VM6_USER@$VM6_HOST" "cd $VM6_DEPLOY_DIR && docker compose --env-file .env up -d --build ${svc_name%-service}-service"
  fi

  echo "  ✅ SCP + rebuild complete"
}

echo ""
echo "Choose sync method:"
echo "  1) Docker save/load (fastest, no rebuild on VM6)"
echo "  2) Git pull + rebuild (VM6 needs git repo access)"
echo "  3) SCP source + rebuild (VM6 no git, rebuild from source)"
echo ""
read -p "Method [1/2/3]: " METHOD

case $METHOD in
  1)
    if [ "$SERVICE" = "all" ]; then
      for svc in sister-service feeder-service myunila-service api-service project-service keuangan-service monitoring-service; do
        sync_via_docker "$svc"
      done
      ssh "$VM6_USER@$VM6_HOST" "cd $VM6_DEPLOY_DIR && docker compose --env-file .env up -d"
    else
      sync_via_docker "$SERVICE"
      ssh "$VM6_USER@$VM6_HOST" "cd $VM6_DEPLOY_DIR && docker compose --env-file .env up -d $SERVICE"
    fi
    ;;
  2) sync_via_git ;;
  3) sync_via_scp "$SERVICE" ;;
  *) echo "❌ Invalid method"; exit 1 ;;
esac

echo ""
echo "================================================"
echo "📋 Verify on VM6:"
echo "   ssh $VM6_USER@$VM6_HOST 'docker ps --format \"table {{.Names}}\t{{.Status}}\"'"
echo ""
echo "📋 Check Kong health:"
echo "   bash /var/www/my-unila/deployment/production/kong-lb/check-health.sh"
