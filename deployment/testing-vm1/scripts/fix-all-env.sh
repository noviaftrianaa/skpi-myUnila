#!/bin/bash

###############################################################################
# Fix All Environment Variables and Restart Services
###############################################################################

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Fix Environment Variables${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

cd /var/www/my-unila/deployment/testing-vm1/scripts

echo -e "${GREEN}[1/4] Updating Dashboard environment...${NC}"
./update-dashboard-env.sh
echo ""

echo -e "${GREEN}[2/4] Updating Auth environment...${NC}"
./update-auth-env.sh
echo ""

echo -e "${GREEN}[3/4] Updating Sister environment...${NC}"
./update-sister-env.sh
echo ""

echo -e "${GREEN}[4/4] Restarting all services...${NC}"
./restart-all-services.sh

echo ""
echo -e "${GREEN}✓ Environment variables updated and services restarted!${NC}"
echo ""
echo -e "${YELLOW}Check status:${NC}"
echo "  docker ps --filter 'name=myunila' --format 'table {{.Names}}\t{{.Status}}'"
echo ""
