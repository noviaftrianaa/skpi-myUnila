#!/bin/bash

###############################################################################
# Setup SOPS + age for Secret Management
# Install di setiap VM dan laptop developer
#
# Workflow:
#   1. Generate age key (sekali, simpan aman)
#   2. Encrypt .env → .env.encrypted (aman di-commit ke git)
#   3. Decrypt .env.encrypted → .env (saat deploy)
#
# Usage:
#   ./scripts/setup-sops.sh              # Install + generate key
#   ./scripts/setup-sops.sh --install    # Install only (key sudah ada)
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  SOPS + age Setup${NC}"
echo -e "${BLUE}  Secret Management for MyUnila${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

###############################################################################
# Step 1: Install age (encryption tool)
###############################################################################

echo -e "${BLUE}[1/4] Installing age...${NC}"
if command -v age &> /dev/null; then
    echo -e "  ${GREEN}age already installed: $(age --version 2>/dev/null || echo 'OK')${NC}"
else
    sudo apt install -y age 2>/dev/null || {
        # Fallback: install from GitHub release
        echo "  Installing age from GitHub..."
        AGE_VERSION="v1.2.0"
        curl -sLO "https://github.com/FiloSottile/age/releases/download/${AGE_VERSION}/age-${AGE_VERSION}-linux-amd64.tar.gz"
        tar -xzf "age-${AGE_VERSION}-linux-amd64.tar.gz"
        sudo mv age/age age/age-keygen /usr/local/bin/
        rm -rf age "age-${AGE_VERSION}-linux-amd64.tar.gz"
    }
    echo -e "  ${GREEN}age installed${NC}"
fi
echo ""

###############################################################################
# Step 2: Install SOPS
###############################################################################

echo -e "${BLUE}[2/4] Installing SOPS...${NC}"
if command -v sops &> /dev/null; then
    echo -e "  ${GREEN}SOPS already installed: $(sops --version 2>/dev/null)${NC}"
else
    SOPS_VERSION="v3.9.4"
    curl -sLO "https://github.com/getsops/sops/releases/download/${SOPS_VERSION}/sops-${SOPS_VERSION}.linux.amd64"
    sudo mv "sops-${SOPS_VERSION}.linux.amd64" /usr/local/bin/sops
    sudo chmod +x /usr/local/bin/sops
    echo -e "  ${GREEN}SOPS installed: $(sops --version 2>/dev/null)${NC}"
fi
echo ""

###############################################################################
# Step 3: Generate age key (jika belum ada)
###############################################################################

AGE_KEY_DIR="$HOME/.config/sops/age"
AGE_KEY_FILE="$AGE_KEY_DIR/keys.txt"

echo -e "${BLUE}[3/4] Setting up age key...${NC}"

if [ "$1" = "--install" ]; then
    echo -e "  ${YELLOW}--install mode: skip key generation${NC}"
    echo -e "  ${YELLOW}Copy key dari machine lain ke: $AGE_KEY_FILE${NC}"
elif [ -f "$AGE_KEY_FILE" ]; then
    echo -e "  ${YELLOW}age key already exists at $AGE_KEY_FILE${NC}"
    # Extract public key
    PUBLIC_KEY=$(grep "public key:" "$AGE_KEY_FILE" | sed 's/.*public key: //')
    echo -e "  Public key: ${GREEN}$PUBLIC_KEY${NC}"
else
    mkdir -p "$AGE_KEY_DIR"
    chmod 700 "$AGE_KEY_DIR"
    age-keygen -o "$AGE_KEY_FILE" 2>&1
    chmod 600 "$AGE_KEY_FILE"

    PUBLIC_KEY=$(grep "public key:" "$AGE_KEY_FILE" | sed 's/.*public key: //')
    echo -e "  ${GREEN}age key generated${NC}"
    echo -e "  Key file: $AGE_KEY_FILE"
    echo -e "  Public key: ${GREEN}$PUBLIC_KEY${NC}"
    echo ""
    echo -e "  ${RED}PENTING: Backup file key ini!${NC}"
    echo -e "  ${RED}Jika hilang, tidak bisa decrypt secrets!${NC}"
fi
echo ""

###############################################################################
# Step 4: Create .sops.yaml config
###############################################################################

echo -e "${BLUE}[4/4] Creating SOPS config...${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../../.." && pwd)"
SOPS_CONFIG="$REPO_ROOT/.sops.yaml"

# Extract public key
PUBLIC_KEY=""
if [ -f "$AGE_KEY_FILE" ]; then
    PUBLIC_KEY=$(grep "public key:" "$AGE_KEY_FILE" | sed 's/.*public key: //')
fi

if [ -f "$SOPS_CONFIG" ]; then
    echo -e "  ${YELLOW}.sops.yaml already exists at $SOPS_CONFIG${NC}"
else
    if [ -n "$PUBLIC_KEY" ]; then
        cat > "$SOPS_CONFIG" <<EOF
# SOPS Configuration for MyUnila
# Encrypt .env files with age
#
# Usage:
#   Encrypt: sops --encrypt .env > .env.encrypted
#   Decrypt: sops --decrypt .env.encrypted > .env
#   Edit:    sops .env.encrypted

creation_rules:
  # VM5 Staging
  - path_regex: deployment/production/vm5-staging/\.env$
    age: >-
      ${PUBLIC_KEY}

  # VM1 Frontend & Kong
  - path_regex: deployment/production/vm1-frontend-kong/\.env$
    age: >-
      ${PUBLIC_KEY}

  # VM2 Backend 1
  - path_regex: deployment/production/vm2-backend1/\.env$
    age: >-
      ${PUBLIC_KEY}

  # VM3 Backend 2
  - path_regex: deployment/production/vm3-backend2/\.env$
    age: >-
      ${PUBLIC_KEY}

  # Catch-all for any .env file
  - path_regex: \.env$
    age: >-
      ${PUBLIC_KEY}
EOF
        echo -e "  ${GREEN}.sops.yaml created at $SOPS_CONFIG${NC}"
    else
        echo -e "  ${YELLOW}Skipped: no public key available. Run without --install first.${NC}"
    fi
fi
echo ""

###############################################################################
# Summary & Usage Guide
###############################################################################

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Setup Complete!${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo -e "${GREEN}=== WORKFLOW ===${NC}"
echo ""
echo -e "  ${YELLOW}1. Encrypt .env (sebelum commit):${NC}"
echo "     cd /var/www/my-unila/deployment/production/vm5-staging"
echo "     sops --encrypt .env > .env.encrypted"
echo "     git add .env.encrypted"
echo "     git commit -m 'chore: update encrypted env for staging'"
echo ""
echo -e "  ${YELLOW}2. Decrypt .env (saat deploy di VM):${NC}"
echo "     sops --decrypt .env.encrypted > .env"
echo ""
echo -e "  ${YELLOW}3. Edit secret langsung (tanpa decrypt manual):${NC}"
echo "     sops .env.encrypted"
echo "     # Buka editor, edit, save → otomatis re-encrypt"
echo ""
echo -e "  ${YELLOW}4. Copy key ke VM lain:${NC}"
echo "     # Dari VM5 ke VM1/VM2/VM3:"
echo "     scp $AGE_KEY_FILE myfrontend@192.168.120.41:~/.config/sops/age/keys.txt"
echo "     scp $AGE_KEY_FILE mybackend1@192.168.120.42:~/.config/sops/age/keys.txt"
echo "     scp $AGE_KEY_FILE mybackend2@192.168.120.43:~/.config/sops/age/keys.txt"
echo ""
echo -e "  ${YELLOW}5. Tambah public key baru (misal developer baru):${NC}"
echo "     # Edit .sops.yaml, tambah public key di field 'age'"
echo "     # Pisahkan multiple keys dengan koma"
echo "     # Re-encrypt: sops updatekeys .env.encrypted"
echo ""
echo -e "${RED}=== SECURITY RULES ===${NC}"
echo ""
echo "  - JANGAN commit .env (plaintext) ke git"
echo "  - BOLEH commit .env.encrypted ke git"
echo "  - JANGAN commit keys.txt ke git"
echo "  - Backup keys.txt di tempat aman (password manager)"
echo "  - Setiap VM butuh keys.txt untuk decrypt"
echo ""
echo -e "${GREEN}Files:${NC}"
echo "  Private key : $AGE_KEY_FILE (RAHASIA - jangan share sembarangan)"
echo "  SOPS config : $SOPS_CONFIG (boleh commit ke git)"
echo ""
