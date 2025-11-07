#!/bin/bash

###############################################################################
# MyUnila VM1 - Server Setup Script
# This script prepares Ubuntu 22.04 server for MyUnila deployment
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

###############################################################################
# 1. Check if running as root or with sudo
###############################################################################
check_root() {
    log_info "Checking user privileges..."
    if [[ $EUID -ne 0 ]]; then
       log_error "This script must be run as root or with sudo"
       exit 1
    fi
    log_success "Running with proper privileges"
}

###############################################################################
# 2. Update system packages
###############################################################################
update_system() {
    log_info "Updating system packages..."
    apt-get update
    apt-get upgrade -y
    apt-get autoremove -y
    log_success "System packages updated"
}

###############################################################################
# 3. Install required packages
###############################################################################
install_prerequisites() {
    log_info "Installing prerequisite packages..."
    apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release \
        git \
        wget \
        vim \
        htop \
        net-tools \
        ufw \
        fail2ban
    log_success "Prerequisites installed"
}

###############################################################################
# 4. Install Docker
###############################################################################
install_docker() {
    log_info "Installing Docker..."

    # Remove old versions
    apt-get remove -y docker docker-engine docker.io containerd runc || true

    # Add Docker's official GPG key
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    # Add Docker repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Install Docker Engine
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Start and enable Docker
    systemctl start docker
    systemctl enable docker

    log_success "Docker installed successfully"
    docker --version
}

###############################################################################
# 5. Configure Docker
###############################################################################
configure_docker() {
    log_info "Configuring Docker..."

    # Create daemon.json
    mkdir -p /etc/docker
    cat > /etc/docker/daemon.json <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "50m",
    "max-file": "5"
  },
  "storage-driver": "overlay2",
  "default-address-pools": [
    {
      "base": "172.17.0.0/16",
      "size": 24
    }
  ]
}
EOF

    systemctl restart docker
    log_success "Docker configured"
}

###############################################################################
# 6. Add user to docker group (if not root)
###############################################################################
configure_docker_user() {
    if [ -n "$SUDO_USER" ]; then
        log_info "Adding $SUDO_USER to docker group..."
        usermod -aG docker $SUDO_USER
        log_success "User $SUDO_USER added to docker group"
        log_warning "Please log out and log back in for group changes to take effect"
    fi
}

###############################################################################
# 7. Configure firewall (UFW)
###############################################################################
configure_firewall() {
    log_info "Configuring firewall..."

    # Enable UFW
    ufw --force enable

    # Allow SSH
    ufw allow 22/tcp comment "SSH"

    # Allow Kong Gateway
    ufw allow 9800/tcp comment "Kong Proxy HTTP"
    ufw allow 9801/tcp comment "Kong Admin API"
    ufw allow 9803/tcp comment "Kong UI"

    # Allow Backend Services
    ufw allow 8081/tcp comment "Auth Service"
    ufw allow 8082/tcp comment "Dashboard Service"
    ufw allow 8083/tcp comment "Sister Service"

    # Allow Frontend
    ufw allow 3000/tcp comment "Frontend"

    # Allow Monitoring
    ufw allow 3002/tcp comment "Grafana"
    ufw allow 9090/tcp comment "Prometheus"

    # Reload UFW
    ufw reload

    log_success "Firewall configured"
    ufw status
}

###############################################################################
# 8. Configure fail2ban
###############################################################################
configure_fail2ban() {
    log_info "Configuring fail2ban..."

    systemctl start fail2ban
    systemctl enable fail2ban

    log_success "Fail2ban configured and started"
}

###############################################################################
# 9. Create deployment directory
###############################################################################
create_directories() {
    log_info "Creating deployment directories..."

    DEPLOY_DIR="/opt/myunila"

    mkdir -p $DEPLOY_DIR/{services,configs,logs,backups}
    chmod 755 $DEPLOY_DIR

    log_success "Deployment directories created at $DEPLOY_DIR"
}

###############################################################################
# 10. Set system limits
###############################################################################
configure_system_limits() {
    log_info "Configuring system limits..."

    # Increase file descriptors
    cat >> /etc/security/limits.conf <<EOF
* soft nofile 65536
* hard nofile 65536
* soft nproc 65536
* hard nproc 65536
EOF

    # Increase vm.max_map_count for containers
    sysctl -w vm.max_map_count=262144
    echo "vm.max_map_count=262144" >> /etc/sysctl.conf

    log_success "System limits configured"
}

###############################################################################
# 11. Install monitoring tools
###############################################################################
install_monitoring_tools() {
    log_info "Installing monitoring tools..."

    apt-get install -y \
        iotop \
        iftop \
        nload \
        sysstat

    log_success "Monitoring tools installed"
}

###############################################################################
# 12. Set timezone
###############################################################################
set_timezone() {
    log_info "Setting timezone to Asia/Jakarta..."
    timedatectl set-timezone Asia/Jakarta
    log_success "Timezone set to $(timedatectl | grep 'Time zone')"
}

###############################################################################
# Main execution
###############################################################################
main() {
    echo ""
    echo "========================================"
    echo "  MyUnila VM1 - Server Setup"
    echo "  Ubuntu 22.04 LTS"
    echo "========================================"
    echo ""

    check_root
    update_system
    install_prerequisites
    install_docker
    configure_docker
    configure_docker_user
    configure_firewall
    configure_fail2ban
    create_directories
    configure_system_limits
    install_monitoring_tools
    set_timezone

    echo ""
    echo "========================================"
    log_success "Server setup completed successfully!"
    echo "========================================"
    echo ""
    echo "Next steps:"
    echo "1. Log out and log back in (for docker group to take effect)"
    echo "2. Clone the repository to /opt/myunila"
    echo "3. Configure .env file"
    echo "4. Run: ./scripts/deploy-all.sh"
    echo ""
    echo "System Information:"
    echo "- Docker version: $(docker --version)"
    echo "- Docker Compose version: $(docker compose version)"
    echo "- Deployment directory: /opt/myunila"
    echo ""
}

# Run main function
main "$@"
