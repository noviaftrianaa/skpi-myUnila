#!/bin/bash
# ============================================
# Quick Start: SIMBAK Service (Local Dev)
# ============================================
# Prerequisites:
#   1. Docker network: docker network create myunila-network
#   2. Redis running: docker compose -f services/1-infrastructure/docker-compose.redis.yml up -d
#   3. PostgreSQL running: docker compose -f services/1-infrastructure/docker-compose.postgres.yml up -d
#   4. .env configured (copy from .env.example)
#
# Usage: ./scripts/start-simbak.sh [--rebuild]
# ============================================

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOCAL_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$LOCAL_DIR/services/3-backend/docker-compose.simbak.yml"
NGINX_FILE="$LOCAL_DIR/services/3-backend/docker-compose.nginx.yml"
ENV_FILE="$LOCAL_DIR/.env"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting SIMBAK Service (Local Dev)${NC}"
echo ""

# Check .env
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env not found! Copy from .env.example:"
    echo "   cp deployment/local/.env.example deployment/local/.env"
    exit 1
fi

# Check docker network
docker network inspect myunila-network >/dev/null 2>&1 || {
    echo -e "${YELLOW}Creating myunila-network...${NC}"
    docker network create myunila-network
}

# Check PostgreSQL
if ! docker ps --format '{{.Names}}' | grep -q myunila-postgres; then
    echo -e "${YELLOW}Starting PostgreSQL...${NC}"
    docker compose -f "$LOCAL_DIR/services/1-infrastructure/docker-compose.postgres.yml" --env-file "$ENV_FILE" up -d
    echo "Waiting for PostgreSQL..."
    sleep 5
fi

# Check Redis
if ! docker ps --format '{{.Names}}' | grep -q myunila-redis; then
    echo -e "${YELLOW}Starting Redis...${NC}"
    docker compose -f "$LOCAL_DIR/services/1-infrastructure/docker-compose.redis.yml" --env-file "$ENV_FILE" up -d
    sleep 3
fi

# Init SIMBAK schema if needed
echo -e "${YELLOW}Checking SIMBAK database...${NC}"
DB_EXISTS=$(docker exec myunila-postgres psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='simbak'" 2>/dev/null || echo "0")
if [ "$DB_EXISTS" != "1" ]; then
    echo -e "${YELLOW}Creating simbak database + schema...${NC}"
    docker exec myunila-postgres psql -U postgres -c "CREATE USER myunila_bak WITH PASSWORD 'myunila_bak_local';" 2>/dev/null || true
    docker exec myunila-postgres psql -U postgres -c "CREATE DATABASE simbak OWNER myunila_bak;" 2>/dev/null || true
    docker exec myunila-postgres psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE simbak TO myunila_bak;" 2>/dev/null || true
fi

SCHEMA_EXISTS=$(docker exec myunila-postgres psql -U myunila_bak -d simbak -tAc "SELECT 1 FROM pg_tables WHERE schemaname='ref' LIMIT 1" 2>/dev/null || echo "0")
if [ "$SCHEMA_EXISTS" != "1" ]; then
    echo -e "${YELLOW}Running SIMBAK schema...${NC}"
    docker cp "$(dirname "$LOCAL_DIR")/data-model/script/postgresql/simbak_v1.0_fresh.sql" myunila-postgres:/tmp/schema.sql
    docker exec myunila-postgres psql -U myunila_bak -d simbak -f /tmp/schema.sql
    echo -e "${YELLOW}Running seed data...${NC}"
    docker cp "$(dirname "$LOCAL_DIR")/data-model/script/postgresql/simbak-seed-staging.sql" myunila-postgres:/tmp/seed.sql
    docker exec myunila-postgres psql -U myunila_bak -d simbak -f /tmp/seed.sql
fi

# Build + start SIMBAK
if [ "$1" = "--rebuild" ]; then
    echo -e "${YELLOW}Rebuilding SIMBAK service...${NC}"
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache simbak-service
fi

echo -e "${YELLOW}Starting SIMBAK service...${NC}"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

# Restart nginx to pick up simbak.conf
echo -e "${YELLOW}Restarting Nginx...${NC}"
docker compose -f "$NGINX_FILE" --env-file "$ENV_FILE" up -d --force-recreate 2>/dev/null || true

sleep 5

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  SIMBAK Service Ready!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "  API:         http://localhost:9002/api/health"
echo "  Kong:        http://localhost:9800/simbak-service/api/health"
echo "  PostgreSQL:  localhost:5432 / simbak / myunila_bak"
echo ""
echo "  Public endpoint (no auth):"
echo "    GET http://localhost:9002/api/v1/layanan/jenis-layanan"
echo ""
echo "  Hot reload: app/, routes/, config/ mounted as volumes"
echo ""

# Health check
curl -sf http://localhost:9002/api/health 2>/dev/null && echo "✅ Service is healthy!" || echo "⚠️ Health check pending — try again in a few seconds"
