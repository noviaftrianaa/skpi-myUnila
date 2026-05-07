#!/bin/bash
# ============================================
# VM8 SI KKN — Deploy Script
# ============================================
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VM8_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$VM8_DIR/services/si-kkn/docker-compose.yml"

echo "🚀 Deploying SI KKN Service on VM8..."
echo "======================================"

# Check .env
if [ ! -f "$VM8_DIR/.env" ]; then
    echo "❌ .env not found! Copy from .env.example first."
    exit 1
fi

# Build
echo ""
echo "📦 Building SI KKN service..."
docker compose -f "$COMPOSE_FILE" --env-file "$VM8_DIR/.env" build --no-cache si-kkn-service

# Start infrastructure first
echo ""
echo "🗄️ Starting PostgreSQL + Redis..."
docker compose -f "$COMPOSE_FILE" --env-file "$VM8_DIR/.env" up -d si-kkn-postgres si-kkn-redis

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10
docker compose -f "$COMPOSE_FILE" --env-file "$VM8_DIR/.env" exec si-kkn-postgres pg_isready -U "${SI_KKN_PG_USERNAME:-myunila_kkn}" -d "${SI_KKN_PG_DATABASE:-sikkn_myunila}"

# Start service + nginx
echo ""
echo "🔧 Starting SI KKN service + Nginx..."
docker compose -f "$COMPOSE_FILE" --env-file "$VM8_DIR/.env" up -d --force-recreate si-kkn-service si-kkn-nginx

# Clean up
echo ""
echo "🧹 Cleaning up..."
docker image prune -f

# Health check
echo ""
echo "🏥 Health check..."
sleep 5
curl -sf http://localhost:9004/api/health && echo " ✅ SI KKN is UP!" || echo " ❌ Health check failed"

echo ""
echo "======================================"
echo "✅ SI KKN deployment complete!"
echo ""
echo "Services:"
echo "  - SI KKN API:  http://localhost:9004/api"
echo "  - PostgreSQL:  localhost:5434 (container→5432)"
echo "  - Redis:       localhost:6381 (container→6379)"
echo ""
docker compose -f "$COMPOSE_FILE" ps
