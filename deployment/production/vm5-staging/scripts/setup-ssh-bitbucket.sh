#!/bin/bash

###############################################################################
# Setup SSH Key & Git Configuration for Bitbucket
# VM5 Staging: 192.168.120.45
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

EMAIL="mizarzulmiramadhan@gmail.com"
GIT_NAME="Mizar"

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  SSH & Git Setup for Bitbucket${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

###############################################################################
# Step 1: Configure Git
###############################################################################

echo -e "${BLUE}[1/4] Configuring Git...${NC}"
git config --global user.email "$EMAIL"
git config --global user.name "$GIT_NAME"
echo -e "  Email: ${GREEN}$EMAIL${NC}"
echo -e "  Name:  ${GREEN}$GIT_NAME${NC}"
echo ""

###############################################################################
# Step 2: Generate SSH Key
###############################################################################

SSH_KEY="$HOME/.ssh/id_ed25519"

echo -e "${BLUE}[2/4] Setting up SSH key...${NC}"
if [ -f "$SSH_KEY" ]; then
    echo -e "  ${YELLOW}SSH key already exists at $SSH_KEY${NC}"
    echo -e "  Skipping key generation"
else
    mkdir -p "$HOME/.ssh"
    chmod 700 "$HOME/.ssh"
    ssh-keygen -t ed25519 -C "$EMAIL" -f "$SSH_KEY" -N ""
    echo -e "  ${GREEN}SSH key generated at $SSH_KEY${NC}"
fi
echo ""

###############################################################################
# Step 3: Add Bitbucket to known_hosts
###############################################################################

echo -e "${BLUE}[3/4] Adding Bitbucket to known_hosts...${NC}"
if grep -q "bitbucket.org" "$HOME/.ssh/known_hosts" 2>/dev/null; then
    echo -e "  ${YELLOW}Bitbucket already in known_hosts${NC}"
else
    ssh-keyscan -t rsa,ed25519 bitbucket.org >> "$HOME/.ssh/known_hosts" 2>/dev/null
    echo -e "  ${GREEN}Bitbucket added to known_hosts${NC}"
fi
echo ""

###############################################################################
# Step 4: Configure SSH
###############################################################################

echo -e "${BLUE}[4/4] Configuring SSH...${NC}"
SSH_CONFIG="$HOME/.ssh/config"
if grep -q "bitbucket.org" "$SSH_CONFIG" 2>/dev/null; then
    echo -e "  ${YELLOW}SSH config for Bitbucket already exists${NC}"
else
    cat >> "$SSH_CONFIG" <<EOF

Host bitbucket.org
    HostName bitbucket.org
    User git
    IdentityFile $SSH_KEY
    IdentitiesOnly yes
EOF
    chmod 600 "$SSH_CONFIG"
    echo -e "  ${GREEN}SSH config updated${NC}"
fi
echo ""

###############################################################################
# Display Public Key & Instructions
###############################################################################

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  SSH Public Key${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo -e "${YELLOW}Copy the key below and add it to Bitbucket:${NC}"
echo -e "${YELLOW}  Bitbucket > Personal Settings > SSH Keys > Add Key${NC}"
echo ""
echo -e "${GREEN}--- START KEY ---${NC}"
cat "${SSH_KEY}.pub"
echo -e "${GREEN}--- END KEY ---${NC}"
echo ""
echo -e "${BLUE}After adding the key to Bitbucket, test with:${NC}"
echo "  ssh -T git@bitbucket.org"
echo ""
echo -e "${BLUE}Then clone the repository:${NC}"
echo "  cd /var/www"
echo "  git clone git@bitbucket.org:mahendraunila/my-unila.git"
echo ""
echo -e "${GREEN}Setup complete!${NC}"
