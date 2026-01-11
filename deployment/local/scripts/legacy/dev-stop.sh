#!/bin/bash

###############################################################################
# Stop All Services - Local Development
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOYMENT_DIR="$SCRIPT_DIR/.."

cd "$DEPLOYMENT_DIR"

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Stopping All Services - Local${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Stop all services
echo -e "${GREEN}Stopping Backend Services...${NC}"
docker compose --env-file .env -f services/3-backend/docker-compose.nginx.yml down
docker compose --env-file .env -f services/3-backend/docker-compose.auth.yml down
docker compose --env-file .env -f services/3-backend/docker-compose.dashboard.yml down
docker compose --env-file .env -f services/3-backend/docker-compose.sister.yml down

echo -e "${GREEN}Stopping Kong Gateway...${NC}"
docker compose --env-file .env -f services/2-gateway/docker-compose.kong.yml down

echo -e "${GREEN}Stopping Infrastructure...${NC}"
docker compose --env-file .env -f services/1-infrastructure/docker-compose.redis.yml down
docker compose --env-file .env -f services/1-infrastructure/docker-compose.meilisearch.yml down

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  All Services Stopped!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

# Show remaining containers
REMAINING=$(docker ps --filter "name=myunila" --format "{{.Names}}" | wc -l)
if [ $REMAINING -gt 0 ]; then
    echo -e "${YELLOW}Remaining containers:${NC}"
    docker ps --filter "name=myunila" --format "table {{.Names}}\t{{.Status}}"
else
    echo -e "${GREEN}✓ All MyUnila containers stopped${NC}"
fi
echo ""
