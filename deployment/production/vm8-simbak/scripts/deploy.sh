#!/bin/bash
# ============================================
# VM8 SIMBAK — Deploy Script
# ============================================
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VM8_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$VM8_DIR/services/simbak/docker-compose.yml"

echo "🚀 Deploying SIMBAK Service on VM8..."
echo "======================================"

# Check .env
if [ ! -f "$VM8_DIR/.env" ]; then
    echo "❌ .env not found! Copy from .env.example first."
    exit 1
fi

# Build
echo ""
echo "📦 Building SIMBAK service..."
docker compose -f "$COMPOSE_FILE" --env-file "$VM8_DIR/.env" build --no-cache simbak-service

# Start infrastructure first
echo ""
echo "🗄️ Starting PostgreSQL + Redis..."
docker compose -f "$COMPOSE_FILE" --env-file "$VM8_DIR/.env" up -d simbak-postgres simbak-redis

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10
docker compose -f "$COMPOSE_FILE" --env-file "$VM8_DIR/.env" exec simbak-postgres pg_isready -U myunila_bak -d simbak

# Start service + nginx
echo ""
echo "🔧 Starting SIMBAK service + Nginx..."
docker compose -f "$COMPOSE_FILE" --env-file "$VM8_DIR/.env" up -d --force-recreate simbak-service simbak-nginx

# Clean up
echo ""
echo "🧹 Cleaning up..."
docker image prune -f

# Health check
echo ""
echo "🏥 Health check..."
sleep 5
curl -sf http://localhost:9002/api/health && echo " ✅ SIMBAK is UP!" || echo " ❌ Health check failed"

echo ""
echo "======================================"
echo "✅ SIMBAK deployment complete!"
echo ""
echo "Services:"
echo "  - SIMBAK API:  http://localhost:9002/api"
echo "  - PostgreSQL:  localhost:5433 (container→5432)"
echo "  - Redis:       localhost:6380 (container→6379)"
echo ""
docker compose -f "$COMPOSE_FILE" ps
