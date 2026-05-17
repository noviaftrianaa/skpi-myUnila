#!/bin/bash

###############################################################################
# MyUnila Frontend-Blog Hot Reload (Development Mode)
# Runs the Next.js dev server for the PUBLIC BLOG (blog.unila.ac.id apex + per-user tenant)
# at port 3002 (so it doesn't collide with main frontend at 3000).
###############################################################################

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

PORT=${1:-3002}

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   ${GREEN}Frontend-Blog Hot Reload — blog.unila.ac.id${CYAN}        ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}URLs untuk testing:${NC}"
echo "  ✓ Apex:       http://localhost:${PORT}"
echo "  ✓ Search:     http://localhost:${PORT}/search?q=next"
echo "  ✓ Kategori:   http://localhost:${PORT}/kategori/teknologi"
echo "  ✓ Trending:   http://localhost:${PORT}/trending"
echo "  ✓ Tentang:    http://localhost:${PORT}/tentang"
echo ""
echo -e "${YELLOW}Test tenant (per-user blog):${NC}"
echo "  ✓ Mhs (Mizar):  http://localhost:${PORT}?tenant=2117051070-mhs"
echo "  ✓ Dosen (Rina): http://localhost:${PORT}?tenant=rina-dosen"
echo "  ✓ Staf (Rektor): http://localhost:${PORT}?tenant=rektor-staf"
echo ""
echo -e "${YELLOW}Atau pakai hosts file (Windows):${NC}"
echo "  Edit C:\\Windows\\System32\\drivers\\etc\\hosts:"
echo "    127.0.0.1 blog.local"
echo "    127.0.0.1 2117051070-mhs.blog.local"
echo "    127.0.0.1 rina-dosen.blog.local"
echo "  Set NEXT_PUBLIC_APEX_HOST=blog.local di .env.local"
echo ""
echo -e "${BLUE}Starting Next.js dev server...${NC}"

FRONTEND_BLOG_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)/frontend-blog"

if [ ! -d "$FRONTEND_BLOG_DIR" ]; then
    echo -e "${RED}ERROR: frontend-blog/ directory not found at ${FRONTEND_BLOG_DIR}${NC}"
    exit 1
fi

# Kill any existing process on the port
EXISTING_PID=$(netstat -ano 2>/dev/null | grep ":${PORT}" | grep LISTEN | head -1 | awk '{print $NF}')
if [ -n "$EXISTING_PID" ] && [ "$EXISTING_PID" != "0" ]; then
    echo -e "${YELLOW}Killing existing process on port ${PORT} (PID: $EXISTING_PID)...${NC}"
    taskkill //PID "$EXISTING_PID" //F 2>/dev/null
    sleep 1
fi

cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping frontend-blog server...${NC}"
    FE_PID=$(netstat -ano 2>/dev/null | grep ":${PORT}" | grep LISTEN | head -1 | awk '{print $NF}')
    if [ -n "$FE_PID" ] && [ "$FE_PID" != "0" ]; then
        taskkill //PID "$FE_PID" //F 2>/dev/null
    fi
    echo -e "${GREEN}frontend-blog server stopped.${NC}"
}
trap cleanup EXIT INT TERM

cd "$FRONTEND_BLOG_DIR" || exit 1

# Create .env.local from .env.example if not exists
if [ ! -f ".env.local" ] && [ -f ".env.example" ]; then
    echo -e "${YELLOW}Creating .env.local from .env.example...${NC}"
    cp .env.example .env.local
fi

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing npm dependencies (first run, mungkin 1-2 menit)...${NC}"
    npm install
fi

echo -e "${GREEN}✓ Starting Next.js dev server on port ${PORT}${NC}"
PORT=${PORT} npm run dev
