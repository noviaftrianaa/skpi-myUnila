#!/bin/bash

###############################################################################
# Fix SOPS/age key permissions on all VMs
# Run from VM5 (root@mystagging) or any VM with SSH access to others
#
# Usage:
#   ./scripts/fix-sops-permissions.sh          # Fix all VMs
#   ./scripts/fix-sops-permissions.sh --local   # Fix local VM only
###############################################################################

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Fix SOPS/age Key Permissions${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Fix permissions on local machine
fix_local() {
    local label=$1
    echo -e "${BLUE}[$label] Fixing local permissions...${NC}"

    if [ -d "$HOME/.config/sops" ]; then
        chmod 700 "$HOME/.config/sops"
        echo "  chmod 700 ~/.config/sops"
    fi

    if [ -d "$HOME/.config/sops/age" ]; then
        chmod 700 "$HOME/.config/sops/age"
        echo "  chmod 700 ~/.config/sops/age"
    fi

    if [ -f "$HOME/.config/sops/age/keys.txt" ]; then
        chmod 600 "$HOME/.config/sops/age/keys.txt"
        echo "  chmod 600 ~/.config/sops/age/keys.txt"
        echo -e "  ${GREEN}OK${NC}"
    else
        echo -e "  ${YELLOW}keys.txt not found - skipped${NC}"
    fi
    echo ""
}

# Fix permissions on remote VM via SSH
fix_remote() {
    local user=$1
    local host=$2
    local label=$3

    echo -e "${BLUE}[$label] Fixing $user@$host...${NC}"

    ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$user@$host" bash -s <<'REMOTE_SCRIPT'
        if [ -d "$HOME/.config/sops" ]; then
            chmod 700 "$HOME/.config/sops"
            echo "  chmod 700 ~/.config/sops"
        fi

        if [ -d "$HOME/.config/sops/age" ]; then
            chmod 700 "$HOME/.config/sops/age"
            echo "  chmod 700 ~/.config/sops/age"
        fi

        if [ -f "$HOME/.config/sops/age/keys.txt" ]; then
            chmod 600 "$HOME/.config/sops/age/keys.txt"
            echo "  chmod 600 ~/.config/sops/age/keys.txt"
            echo "  OK"
        else
            echo "  keys.txt not found - skipped"
        fi
REMOTE_SCRIPT

    if [ $? -eq 0 ]; then
        echo -e "  ${GREEN}Done${NC}"
    else
        echo -e "  ${RED}Failed to connect${NC}"
    fi
    echo ""
}

if [ "$1" = "--local" ]; then
    fix_local "LOCAL"
else
    # VM5 - Local (staging)
    fix_local "VM5 - mystagging (local)"

    # VM1 - Frontend & Kong
    fix_remote "myfrontend" "192.168.120.41" "VM1 - myfrontend"

    # VM2 - Backend 1
    fix_remote "mybackend1" "192.168.120.42" "VM2 - mybackend1"

    # VM3 - Backend 2
    fix_remote "mybackend2" "192.168.120.43" "VM3 - mybackend2"
fi

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Permission Summary${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo "  Expected permissions:"
echo "    ~/.config/sops/     → 700 (drwx------)"
echo "    ~/.config/sops/age/ → 700 (drwx------)"
echo "    keys.txt            → 600 (-rw-------)"
echo ""
echo -e "${GREEN}Done!${NC}"
echo ""
