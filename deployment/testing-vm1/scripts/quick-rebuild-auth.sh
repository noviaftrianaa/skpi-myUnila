#!/bin/bash

###############################################################################
# Quick Rebuild Auth Service - Fix Login Timeout
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}[1/7]${NC} Pull latest code..."
cd /var/www/my-unila
git pull

echo ""
echo -e "${GREEN}[2/7]${NC} Update environment variables..."
cd deployment/testing-vm1/scripts
./update-auth-env.sh

echo ""
echo -e "${GREEN}[3/7]${NC} Load environment variables..."
source ../../../.env

echo ""
echo -e "${GREEN}[4/7]${NC} Stop auth-service..."
cd ../services/3-backend
docker compose -f docker-compose.auth.yml down

echo ""
echo -e "${GREEN}[5/7]${NC} Rebuild with latest code (this takes 2-3 minutes)..."
docker compose -f docker-compose.auth.yml build --no-cache auth-service

echo ""
echo -e "${GREEN}[6/7]${NC} Start auth-service..."
docker compose -f docker-compose.auth.yml up -d

echo ""
echo -e "${GREEN}[7/7]${NC} Wait 20 seconds for service to start..."
sleep 20

echo ""
echo -e "${GREEN}✓ Rebuild complete!${NC}"
echo ""
echo "Container status:"
docker ps --filter "name=myunila-auth-service" --format "table {{.Names}}\t{{.Status}}"

echo ""
echo "Container logs (last 20 lines):"
docker logs myunila-auth-service --tail 20

echo ""
echo -e "${YELLOW}Test login now:${NC}"
echo ""
echo "curl -v -X POST http://192.168.123.172:9800/auth-service/api/v1/auth/login \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"username\":\"admin\",\"password\":\"Admin@2024\"}'"
echo ""
echo -e "${GREEN}Expected: 200 OK in < 5 seconds (not 504 timeout)${NC}"
echo ""
