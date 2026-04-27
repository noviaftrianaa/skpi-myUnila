#!/bin/bash

###############################################################################
# Script: rebuild.sh
# Description: Rebuild and restart all production services across VM1, VM2, VM3, VM5
# Usage: ./rebuild.sh [options]
#
# Options:
#   --help, -h       Show this help message
#   --vm1            Rebuild only VM1 (Frontend & Kong)
#   --vm2            Rebuild only VM2 (Dashboard, Auth & MyUnila services)
#   --vm3            Rebuild only VM3 (Sister, Feeder, MyUnila, Keuangan, API, Monitoring)
#   --vm5            Rebuild only VM5 Staging (All services)
#   --vm5 <service>  Rebuild specific service on VM5 (e.g. sister, frontend)
#   --check          Dry run - only check connections
#
# Examples:
#   ./rebuild.sh                 # Rebuild all production VMs (VM1-VM3)
#   ./rebuild.sh --vm1           # Rebuild only VM1
#   ./rebuild.sh --vm5           # Rebuild only VM5 Staging
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
    echo "  --vm5            Rebuild only VM5 Staging (All services)"
    echo "  --check          Dry run - only check connections"
    echo "  --cleanup        Clean up Docker resources on all VMs (no rebuild)"
    echo ""
    echo "Pre-rebuild cleanup:"
    echo "  Setiap target rebuild (--vm1, --vm2, --vm3, --vm5, atau no-args) otomatis"
    echo "  jalanin cleanup-docker.yml DULU di VM target supaya storage cukup."
    echo "  Volume tidak disentuh. Set SKIP_CLEANUP=1 untuk skip kalau emergency."
    echo ""
    echo "Examples:"
    echo "  $0                    # Rebuild all production VMs (VM1-VM3)"
    echo "  $0 --vm1              # Rebuild only VM1"
    echo "  $0 --vm2              # Rebuild only VM2"
    echo "  $0 --vm3              # Rebuild only VM3"
    echo "  $0 --vm5              # Rebuild only VM5 Staging (all)"
    echo "  $0 --vm5 sister       # Rebuild only sister on VM5"
    echo "  $0 --vm5 frontend     # Rebuild only frontend on VM5"
    echo "  $0 --vm5 auth dashboard  # Rebuild auth & dashboard on VM5"
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

# Run cleanup playbook BEFORE rebuild untuk hemat storage VM target.
# Set SKIP_CLEANUP=1 untuk skip kalau perlu (mis. emergency rebuild).
run_pre_rebuild_cleanup() {
    local limit=$1
    if [ "${SKIP_CLEANUP:-0}" = "1" ]; then
        echo -e "${YELLOW}⏭️  SKIP_CLEANUP=1, lewati pre-rebuild cleanup${NC}"
        echo ""
        return 0
    fi
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Pre-rebuild cleanup (hemat storage VM)${NC}"
    if [ -n "$limit" ]; then
        echo -e "${BLUE}  Targeting: $limit${NC}"
    fi
    echo -e "${BLUE}  Volume tetap aman — tidak di-prune.${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    if [ -n "$limit" ]; then
        ansible-playbook -i "$INVENTORY" "$PLAYBOOK_DIR/cleanup-docker.yml" --limit "$limit"
    else
        ansible-playbook -i "$INVENTORY" "$PLAYBOOK_DIR/cleanup-docker.yml"
    fi
    echo ""
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
            run_pre_rebuild_cleanup "frontend"
            run_playbook "$PLAYBOOK_DIR/rebuild-all-services.yml" "frontend"
            ;;
        --vm2)
            run_pre_rebuild_cleanup "backend1"
            run_playbook "$PLAYBOOK_DIR/rebuild-all-services.yml" "backend1"
            ;;
        --vm3)
            run_pre_rebuild_cleanup "backend2"
            run_playbook "$PLAYBOOK_DIR/rebuild-all-services.yml" "backend2"
            ;;
        --vm5)
            shift
            if [ $# -gt 0 ]; then
                # Rebuild specific service(s) on VM5 via Ansible
                SERVICES="$*"
                run_pre_rebuild_cleanup "staging"
                echo -e "${GREEN}========================================${NC}"
                echo -e "${GREEN}  Rebuilding on VM5: $SERVICES${NC}"
                echo -e "${GREEN}========================================${NC}"
                echo ""
                ansible-playbook -i "$INVENTORY" "$PLAYBOOK_DIR/rebuild-vm5-service.yml" \
                    --limit "staging" \
                    -e "services=$SERVICES"
            else
                run_pre_rebuild_cleanup "staging"
                run_playbook "$PLAYBOOK_DIR/rebuild-all-services.yml" "staging"
            fi
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

            run_pre_rebuild_cleanup ""
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
    echo -e "${BLUE}Access Points (Production):${NC}"
    echo "  Frontend:    http://192.168.120.41:3000"
    echo "  Kong Proxy:  http://192.168.120.41:9800"
    echo "  Kong Admin:  http://192.168.120.41:9801"
    echo ""
    echo -e "${BLUE}Access Points (Staging VM5):${NC}"
    echo "  Frontend:    http://192.168.120.45:3000"
    echo "  Kong Proxy:  http://192.168.120.45:9800"
    echo "  Kong Admin:  http://192.168.120.45:9801"
    echo ""
}

# Run main function
main "$@"
