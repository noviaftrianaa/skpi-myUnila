#!/bin/bash

###############################################################################
# Setup Claude Code on VM5 Staging Server
# Enables remote vibe coding via SSH from any device
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Claude Code Setup - VM5 Staging${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

###############################################################################
# Step 1: Install Node.js 20 (jika belum)
###############################################################################

echo -e "${BLUE}[1/6] Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "  Node.js already installed: ${GREEN}$NODE_VERSION${NC}"
else
    echo -e "  Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    echo -e "  ${GREEN}Node.js installed: $(node --version)${NC}"
fi
echo ""

###############################################################################
# Step 2: Install Claude Code
###############################################################################

echo -e "${BLUE}[2/6] Installing Claude Code...${NC}"
if command -v claude &> /dev/null; then
    CLAUDE_VERSION=$(claude --version 2>/dev/null || echo "installed")
    echo -e "  Claude Code already installed: ${GREEN}$CLAUDE_VERSION${NC}"
else
    echo -e "  Installing via npm..."
    npm install -g @anthropic-ai/claude-code
    echo -e "  ${GREEN}Claude Code installed${NC}"
fi
echo ""

###############################################################################
# Step 3: Install tmux (untuk persistent sessions)
###############################################################################

echo -e "${BLUE}[3/6] Installing tmux...${NC}"
if command -v tmux &> /dev/null; then
    echo -e "  tmux already installed: ${GREEN}$(tmux -V)${NC}"
else
    sudo apt install -y tmux
    echo -e "  ${GREEN}tmux installed${NC}"
fi
echo ""

###############################################################################
# Step 4: Setup API Key
###############################################################################

echo -e "${BLUE}[4/6] Setting up API Key...${NC}"

BASHRC="$HOME/.bashrc"
PROFILE="$HOME/.profile"

if grep -q "ANTHROPIC_API_KEY" "$BASHRC" 2>/dev/null; then
    echo -e "  ${YELLOW}ANTHROPIC_API_KEY already configured in .bashrc${NC}"
else
    echo ""
    echo -e "${YELLOW}  Masukkan Anthropic API Key Anda:${NC}"
    echo -e "${YELLOW}  (Dapatkan dari: https://console.anthropic.com/settings/keys)${NC}"
    echo -n "  API Key: "
    read -r API_KEY

    if [ -n "$API_KEY" ]; then
        echo "" >> "$BASHRC"
        echo "# Claude Code API Key" >> "$BASHRC"
        echo "export ANTHROPIC_API_KEY=\"$API_KEY\"" >> "$BASHRC"
        export ANTHROPIC_API_KEY="$API_KEY"
        echo -e "  ${GREEN}API Key saved to .bashrc${NC}"
    else
        echo -e "  ${YELLOW}Skipped. Set manually later:${NC}"
        echo '  echo '"'"'export ANTHROPIC_API_KEY="your-key"'"'"' >> ~/.bashrc'
    fi
fi
echo ""

###############################################################################
# Step 5: Configure Claude Code settings
###############################################################################

echo -e "${BLUE}[5/6] Configuring Claude Code...${NC}"

CLAUDE_DIR="$HOME/.claude"
mkdir -p "$CLAUDE_DIR"

# Create settings.json if not exists
SETTINGS_FILE="$CLAUDE_DIR/settings.json"
if [ ! -f "$SETTINGS_FILE" ]; then
    cat > "$SETTINGS_FILE" <<'EOF'
{
  "permissions": {
    "allow": [
      "Bash(git *)",
      "Bash(docker *)",
      "Bash(docker compose *)",
      "Bash(npm *)",
      "Bash(go *)",
      "Bash(php *)",
      "Bash(composer *)",
      "Bash(curl *)",
      "Bash(ls *)",
      "Bash(cat *)",
      "Bash(grep *)",
      "Bash(find *)",
      "Bash(head *)",
      "Bash(tail *)",
      "Bash(wc *)",
      "Bash(mkdir *)",
      "Bash(cp *)",
      "Bash(mv *)",
      "Read",
      "Write",
      "Edit",
      "Glob",
      "Grep"
    ],
    "deny": []
  }
}
EOF
    echo -e "  ${GREEN}Settings configured with common permissions${NC}"
else
    echo -e "  ${YELLOW}Settings already exist at $SETTINGS_FILE${NC}"
fi
echo ""

###############################################################################
# Step 6: Create tmux helper scripts
###############################################################################

echo -e "${BLUE}[6/6] Creating helper scripts...${NC}"

# Create tmux config for better experience
TMUX_CONF="$HOME/.tmux.conf"
if [ ! -f "$TMUX_CONF" ]; then
    cat > "$TMUX_CONF" <<'EOF'
# Mouse support
set -g mouse on

# Increase scrollback buffer
set -g history-limit 50000

# Better terminal colors
set -g default-terminal "screen-256color"
set-option -sa terminal-overrides ",xterm*:Tc"

# Status bar
set -g status-style bg=colour235,fg=colour136
set -g status-left '#[fg=colour46] #S '
set -g status-right '#[fg=colour136] %Y-%m-%d %H:%M '

# Easy reload
bind r source-file ~/.tmux.conf \; display "Reloaded"

# Start windows at 1 instead of 0
set -g base-index 1
setw -g pane-base-index 1
EOF
    echo -e "  ${GREEN}tmux config created${NC}"
fi

# Create claude-start helper script
CLAUDE_START="$HOME/claude-start.sh"
cat > "$CLAUDE_START" <<'SCRIPT'
#!/bin/bash
###############################################################################
# claude-start.sh - Start Claude Code in a persistent tmux session
# Usage:
#   ~/claude-start.sh              # Start/attach to default session
#   ~/claude-start.sh my-feature   # Start/attach to named session
###############################################################################

SESSION_NAME="${1:-claude-code}"
PROJECT_DIR="/var/www/my-unila"

# Check if session already exists
if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    echo "Attaching to existing session: $SESSION_NAME"
    tmux attach -t "$SESSION_NAME"
else
    echo "Creating new Claude Code session: $SESSION_NAME"
    tmux new-session -d -s "$SESSION_NAME" -c "$PROJECT_DIR"
    tmux send-keys -t "$SESSION_NAME" "cd $PROJECT_DIR && claude" Enter
    tmux attach -t "$SESSION_NAME"
fi
SCRIPT
chmod +x "$CLAUDE_START"
echo -e "  ${GREEN}claude-start.sh created at ~/claude-start.sh${NC}"

# Create claude-headless helper script
CLAUDE_HEADLESS="$HOME/claude-run.sh"
cat > "$CLAUDE_HEADLESS" <<'SCRIPT'
#!/bin/bash
###############################################################################
# claude-run.sh - Run Claude Code in headless mode (non-interactive)
# Usage:
#   ~/claude-run.sh "fix the bug in auth service"
#   ~/claude-run.sh "add unit tests for UserController" --allowedTools "Read,Edit,Bash"
###############################################################################

PROJECT_DIR="/var/www/my-unila"

if [ -z "$1" ]; then
    echo "Usage: ~/claude-run.sh \"your prompt here\" [extra-args]"
    echo ""
    echo "Examples:"
    echo '  ~/claude-run.sh "list all API endpoints"'
    echo '  ~/claude-run.sh "fix the login bug" --allowedTools "Read,Edit,Bash"'
    echo '  ~/claude-run.sh "explain the auth flow" --output-format json'
    exit 1
fi

PROMPT="$1"
shift

cd "$PROJECT_DIR"
claude -p "$PROMPT" "$@"
SCRIPT
chmod +x "$CLAUDE_HEADLESS"
echo -e "  ${GREEN}claude-run.sh created at ~/claude-run.sh${NC}"

echo ""

###############################################################################
# Summary
###############################################################################

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Setup Complete!${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo -e "${GREEN}Cara Pakai:${NC}"
echo ""
echo -e "  ${YELLOW}1. Interactive Mode (langsung di VM):${NC}"
echo "     cd /var/www/my-unila && claude"
echo ""
echo -e "  ${YELLOW}2. Persistent Session (tidak hilang walau disconnect):${NC}"
echo "     ~/claude-start.sh"
echo "     # Detach: Ctrl+B, lalu D"
echo "     # Re-attach: tmux attach -t claude-code"
echo ""
echo -e "  ${YELLOW}3. Headless Mode (non-interactive, untuk scripting):${NC}"
echo '     ~/claude-run.sh "fix the login bug"'
echo ""
echo -e "  ${YELLOW}4. Remote dari Device Lain:${NC}"
echo "     ssh mystagging@192.168.120.45"
echo "     ~/claude-start.sh"
echo ""
echo -e "  ${YELLOW}5. VS Code Remote SSH:${NC}"
echo "     - Install extension 'Remote - SSH' di VS Code"
echo "     - Connect ke mystagging@192.168.120.45"
echo "     - Install extension 'Claude Code' di remote"
echo "     - Open folder /var/www/my-unila"
echo "     - Ctrl+Shift+P > Claude Code: Open"
echo ""
echo -e "  ${YELLOW}6. Multiple Sessions (untuk kerja paralel):${NC}"
echo "     ~/claude-start.sh feature-auth     # Session 1"
echo "     ~/claude-start.sh feature-dashboard # Session 2"
echo "     tmux ls                             # List sessions"
echo "     tmux attach -t feature-auth         # Switch session"
echo ""
echo -e "${GREEN}Reload shell untuk apply API key:${NC}"
echo "  source ~/.bashrc"
echo ""
