#!/bin/bash

###############################################################################
# MyUnila Frontend Hot Reload (Development Mode)
# Runs the Next.js dev server with hot module replacement (HMR)
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Parse port argument
PORT=${1:-3000}

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     ${GREEN}Frontend Hot Reload Mode (Next.js Dev Server)${CYAN}     ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Features:${NC}"
echo "  ✓ Instant hot reload on file save"
echo "  ✓ No need to rebuild Docker container"
echo "  ✓ Fast Refresh for React components"
echo "  ✓ Error overlay in browser"
echo ""
echo -e "${BLUE}Starting Next.js development server...${NC}"
echo -e "${GREEN}URL: http://localhost:${PORT}${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server.${NC}"
echo ""

# Detect if running in Git Bash on Windows
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    FRONTEND_DIR="/c/laragon/www/my-unila/frontend"
else
    FRONTEND_DIR="$(cd "$(dirname "$0")/../../.." && pwd)/frontend"
fi

# Kill any existing process on the port
EXISTING_PID=$(netstat -ano 2>/dev/null | grep ":${PORT}" | grep LISTEN | head -1 | awk '{print $NF}')
if [ -n "$EXISTING_PID" ] && [ "$EXISTING_PID" != "0" ]; then
    echo -e "${YELLOW}Killing existing process on port ${PORT} (PID: $EXISTING_PID)...${NC}"
    taskkill //PID "$EXISTING_PID" //F 2>/dev/null
    sleep 1
fi

# Cleanup on exit
cleanup_frontend() {
    echo ""
    echo -e "${YELLOW}Stopping frontend server...${NC}"
    FE_PID=$(netstat -ano 2>/dev/null | grep ":${PORT}" | grep LISTEN | head -1 | awk '{print $NF}')
    if [ -n "$FE_PID" ] && [ "$FE_PID" != "0" ]; then
        taskkill //PID "$FE_PID" //F 2>/dev/null
    fi
    echo -e "${GREEN}Frontend server stopped.${NC}"
}
trap cleanup_frontend EXIT INT TERM

# Check if npm dependencies are installed
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo -e "${YELLOW}Installing npm dependencies...${NC}"
    cd "$FRONTEND_DIR" && npm install
fi

# Run dev server with hot reload
cd "$FRONTEND_DIR" && npm run dev -- -p $PORT
