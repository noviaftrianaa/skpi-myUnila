#!/bin/bash

# Quick Rebuild Frontend Script
# This script rebuilds the frontend container without git pull
# Useful when git permission issues occur

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "========================================="
echo "  Quick Rebuild Frontend (Skip Git Pull)"
echo "========================================="
echo ""

cd "$PROJECT_DIR"

echo "📍 Current directory: $(pwd)"
echo "📦 Building frontend image..."
docker-compose build frontend

echo ""
echo "🔄 Restarting frontend container..."
docker-compose up -d frontend

echo ""
echo "✅ Frontend rebuild complete!"
echo ""
echo "📊 Container status:"
docker-compose ps frontend

echo ""
echo "📝 Container logs (last 20 lines):"
docker-compose logs --tail=20 frontend

echo ""
echo "========================================="
echo "  Rebuild Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Hard refresh browser (Ctrl+Shift+R)"
echo "2. Logout and login again"
echo "3. Access feeder-integrator page"
echo ""
