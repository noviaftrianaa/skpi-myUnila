#!/bin/bash

###############################################################################
# Script: rebuild.sh
# Description: Rebuild and restart all production services across VM1, VM2, VM3
# Usage: ./rebuild.sh [options]
#
# Options:
#   --help, -h       Show this help message
#   --vm1            Rebuild only VM1 (Frontend & Kong)
#   --vm2            Rebuild only VM2 (Dashboard, Auth & MyUnila services)
#   --vm3            Rebuild only VM3 (Sister, Feeder, MyUnila, Keuangan, API, Monitoring)
#   --check          Dry run - only check connections
#
# Examples:
#   ./rebuild.sh                 # Rebuild all VMs
#   ./rebuild.sh --vm1           # Rebuild only VM1
#   ./rebuild.sh --check         # Check connections only
###############################################################################

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLAYBOOK_DIR="$SCRIPT_DIR/playbooks"
INVENTORY="$SCRIPT_DIR/inventory/hosts.yml"

# Function to display help
show_help() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  MyUnila Production Rebuild Script${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --help, -h       Show this help message"
    echo "  --vm1            Rebuild only VM1 (Frontend & Kong)"
    echo "  --vm2            Rebuild only VM2 (Dashboard, Auth & MyUnila services)"
    echo "  --vm3            Rebuild only VM3 (Sister, Feeder, MyUnila, Keuangan, API, Monitoring)"
    echo "  --check          Dry run - only check connections"
    echo "  --cleanup        Clean up Docker resources on all VMs (no rebuild)"
    echo ""
    echo "Examples:"
    echo "  $0                    # Rebuild all VMs"
    echo "  $0 --vm1              # Rebuild only VM1"
    echo "  $0 --vm2              # Rebuild only VM2"
    echo "  $0 --vm3              # Rebuild only VM3"
    echo "  $0 --check            # Check connections only"
    echo "  $0 --cleanup          # Clean up Docker resources"
    echo ""
    exit 0
}

# Function to check if Ansible is installed
check_ansible() {
    if ! command -v ansible-playbook &> /dev/null; then
        echo -e "${RED}Error: ansible-playbook not found${NC}"
        echo "Please install Ansible first:"
        echo "  pip install ansible"
        exit 1
    fi
}

# Function to check inventory file
check_inventory() {
    if [ ! -f "$INVENTORY" ]; then
        echo -e "${RED}Error: Inventory file not found: $INVENTORY${NC}"
        exit 1
    fi
}

# Function to run playbook
run_playbook() {
    local playbook=$1
    local limit=$2

    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  Running: $(basename $playbook)${NC}"
    if [ -n "$limit" ]; then
        echo -e "${GREEN}  Targeting: $limit${NC}"
    else
        echo -e "${GREEN}  Targeting: All VMs${NC}"
    fi
    echo -e "${GREEN}========================================${NC}"
    echo ""

    if [ -n "$limit" ]; then
        ansible-playbook -i "$INVENTORY" "$playbook" --limit "$limit"
    else
        ansible-playbook -i "$INVENTORY" "$playbook"
    fi
}

# Function to check connections
check_connections() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Checking Connections${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""

    ansible all -i "$INVENTORY" -m ping

    echo ""
    echo -e "${GREEN}✓ Connection check complete${NC}"
    echo ""
}

# Main script
main() {
    # Check prerequisites
    check_ansible
    check_inventory

    # Parse command line arguments
    case "${1:-}" in
        --help|-h)
            show_help
            ;;
        --check)
            check_connections
            exit 0
            ;;
        --cleanup)
            echo -e "${BLUE}========================================${NC}"
            echo -e "${BLUE}  Cleaning up Docker resources${NC}"
            echo -e "${BLUE}========================================${NC}"
            echo ""
            run_playbook "$PLAYBOOK_DIR/cleanup-docker.yml"
            exit 0
            ;;
        --vm1)
            run_playbook "$PLAYBOOK_DIR/rebuild-all-services.yml" "frontend"
            ;;
        --vm2)
            run_playbook "$PLAYBOOK_DIR/rebuild-all-services.yml" "backend1"
            ;;
        --vm3)
            run_playbook "$PLAYBOOK_DIR/rebuild-all-services.yml" "backend2"
            ;;
        "")
            # No arguments - rebuild all
            echo -e "${YELLOW}========================================${NC}"
            echo -e "${YELLOW}  WARNING: Rebuilding ALL VMs${NC}"
            echo -e "${YELLOW}  This will rebuild services on:${NC}"
            echo -e "${YELLOW}  - VM1 (Frontend & Kong)${NC}"
            echo -e "${YELLOW}  - VM2 (Dashboard, Auth & MyUnila)${NC}"
            echo -e "${YELLOW}  - VM3 (Sister, Feeder, MyUnila, Keuangan, API, Monitoring)${NC}"
            echo -e "${YELLOW}========================================${NC}"
            echo ""
            read -p "Continue? (yes/no): " confirm

            if [ "$confirm" != "yes" ]; then
                echo "Cancelled."
                exit 0
            fi

            run_playbook "$PLAYBOOK_DIR/rebuild-all-services.yml"
            ;;
        *)
            echo -e "${RED}Error: Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac

    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  Rebuild Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}Access Points:${NC}"
    echo "  Frontend:    http://192.168.120.41:3000"
    echo "  Kong Proxy:  http://192.168.120.41:9800"
    echo "  Kong Admin:  http://192.168.120.41:9801"
    echo ""
}

# Run main function
main "$@"
