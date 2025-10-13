#!/bin/bash
#
# Redis CLI Helper Script
# Usage: ./redis-cli.sh [command]
#

REDIS_CONTAINER="myunila-redis"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================${NC}"
echo -e "${BLUE}  My Unila Redis CLI Helper${NC}"
echo -e "${BLUE}====================================${NC}"
echo ""

# Function to check if container is running
check_container() {
    if ! docker ps | grep -q $REDIS_CONTAINER; then
        echo -e "${RED}Error: Container $REDIS_CONTAINER is not running${NC}"
        exit 1
    fi
}

# Show menu if no arguments
if [ $# -eq 0 ]; then
    echo "Available commands:"
    echo ""
    echo -e "${GREEN}1. Interactive CLI${NC}"
    echo "   ./redis-cli.sh interactive"
    echo ""
    echo -e "${GREEN}2. List all keys${NC}"
    echo "   ./redis-cli.sh keys"
    echo ""
    echo -e "${GREEN}3. List auth keys${NC}"
    echo "   ./redis-cli.sh auth-keys"
    echo ""
    echo -e "${GREEN}4. Database size${NC}"
    echo "   ./redis-cli.sh dbsize"
    echo ""
    echo -e "${GREEN}5. Flush all data${NC}"
    echo "   ./redis-cli.sh flush"
    echo ""
    echo -e "${GREEN}6. Redis info${NC}"
    echo "   ./redis-cli.sh info"
    echo ""
    echo -e "${GREEN}7. Monitor (real-time)${NC}"
    echo "   ./redis-cli.sh monitor"
    echo ""
    echo -e "${GREEN}8. Get key value${NC}"
    echo "   ./redis-cli.sh get <key>"
    echo ""
    echo -e "${GREEN}9. Delete key${NC}"
    echo "   ./redis-cli.sh del <key>"
    echo ""
    echo -e "${GREEN}10. Custom command${NC}"
    echo "   ./redis-cli.sh exec \"<redis-command>\""
    echo ""
    exit 0
fi

check_container

case "$1" in
    interactive)
        echo -e "${YELLOW}Opening Redis CLI (type 'exit' to quit)...${NC}"
        echo ""
        winpty docker exec -it $REDIS_CONTAINER redis-cli
        ;;

    keys)
        echo -e "${YELLOW}Listing all keys...${NC}"
        echo ""
        docker exec $REDIS_CONTAINER redis-cli KEYS "*"
        ;;

    auth-keys)
        echo -e "${YELLOW}Listing auth service keys...${NC}"
        echo ""
        docker exec $REDIS_CONTAINER redis-cli KEYS "auth_*"
        ;;

    dbsize)
        echo -e "${YELLOW}Database size:${NC}"
        docker exec $REDIS_CONTAINER redis-cli DBSIZE
        ;;

    flush)
        echo -e "${RED}WARNING: This will delete ALL data in Redis!${NC}"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            docker exec $REDIS_CONTAINER redis-cli FLUSHDB
            echo -e "${GREEN}Database flushed${NC}"
        else
            echo -e "${YELLOW}Cancelled${NC}"
        fi
        ;;

    info)
        echo -e "${YELLOW}Redis info:${NC}"
        echo ""
        docker exec $REDIS_CONTAINER redis-cli INFO
        ;;

    monitor)
        echo -e "${YELLOW}Monitoring Redis commands (Ctrl+C to stop)...${NC}"
        echo ""
        docker exec $REDIS_CONTAINER redis-cli MONITOR
        ;;

    get)
        if [ -z "$2" ]; then
            echo -e "${RED}Error: Please provide key name${NC}"
            echo "Usage: ./redis-cli.sh get <key>"
            exit 1
        fi
        echo -e "${YELLOW}Getting key: $2${NC}"
        docker exec $REDIS_CONTAINER redis-cli GET "$2"
        ;;

    del)
        if [ -z "$2" ]; then
            echo -e "${RED}Error: Please provide key name${NC}"
            echo "Usage: ./redis-cli.sh del <key>"
            exit 1
        fi
        echo -e "${YELLOW}Deleting key: $2${NC}"
        docker exec $REDIS_CONTAINER redis-cli DEL "$2"
        echo -e "${GREEN}Key deleted${NC}"
        ;;

    exec)
        if [ -z "$2" ]; then
            echo -e "${RED}Error: Please provide Redis command${NC}"
            echo "Usage: ./redis-cli.sh exec \"PING\""
            exit 1
        fi
        echo -e "${YELLOW}Executing: $2${NC}"
        docker exec $REDIS_CONTAINER redis-cli $2
        ;;

    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo "Run './redis-cli.sh' without arguments to see available commands"
        exit 1
        ;;
esac
