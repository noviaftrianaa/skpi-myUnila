#!/bin/bash

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

echo "========================================"
echo " My Unila Portal - Docker Development"
echo "========================================"
echo ""

echo "[1/3] Stopping any running containers..."
docker-compose down

echo ""
echo "[2/3] Starting development container..."
docker-compose --profile dev up -d frontend-dev

echo ""
echo "[3/3] Checking container status..."
sleep 3
docker-compose ps

echo ""
echo "========================================"
echo " Development Server Started!"
echo " Access: http://localhost:3001"
echo "========================================"
echo ""
echo "To view logs: cd docker && docker-compose logs -f frontend-dev"
echo "To stop: cd docker && docker-compose --profile dev down"
echo ""
