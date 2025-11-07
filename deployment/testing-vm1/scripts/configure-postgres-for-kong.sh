#!/bin/bash

###############################################################################
# Script: configure-postgres-for-kong.sh
# Description: Configure PostgreSQL to allow connections from Docker containers
# Usage: sudo ./configure-postgres-for-kong.sh
###############################################################################

set -e

echo "=========================================="
echo "Configuring PostgreSQL for Kong Gateway"
echo "=========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "ERROR: This script must be run as root (use sudo)"
    exit 1
fi

# PostgreSQL version detection
PG_VERSION=$(psql --version | grep -oP '\d+' | head -1)
echo "Detected PostgreSQL version: $PG_VERSION"

PG_CONF_DIR="/etc/postgresql/${PG_VERSION}/main"
PG_HBA_FILE="${PG_CONF_DIR}/pg_hba.conf"
PG_CONF_FILE="${PG_CONF_DIR}/postgresql.conf"

# Backup configuration files
echo "Creating backup of PostgreSQL configuration files..."
cp ${PG_HBA_FILE} ${PG_HBA_FILE}.backup.$(date +%Y%m%d_%H%M%S)
cp ${PG_CONF_FILE} ${PG_CONF_FILE}.backup.$(date +%Y%m%d_%H%M%S)

# Check if Docker network rule already exists
if grep -q "# Docker network for Kong" ${PG_HBA_FILE}; then
    echo "Docker network rule already exists in pg_hba.conf"
else
    echo "Adding Docker network rule to pg_hba.conf..."
    # Add rule before the last line
    sed -i '/^# IPv4 local connections:/a # Docker network for Kong\nhost    kong            kong            172.17.0.0/16           md5' ${PG_HBA_FILE}
fi

# Check if listen_addresses is configured
if grep -q "^listen_addresses = '\*'" ${PG_CONF_FILE}; then
    echo "PostgreSQL is already configured to listen on all addresses"
else
    echo "Configuring PostgreSQL to listen on all addresses..."
    # Uncomment and set listen_addresses
    sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" ${PG_CONF_FILE}
    sed -i "s/listen_addresses = 'localhost'/listen_addresses = '*'/" ${PG_CONF_FILE}
fi

# Restart PostgreSQL
echo "Restarting PostgreSQL..."
systemctl restart postgresql

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 3

# Test connection
echo "Testing PostgreSQL connection..."
if pg_isready -h localhost -U postgres > /dev/null 2>&1; then
    echo "✓ PostgreSQL is ready and accepting connections"
else
    echo "✗ PostgreSQL is not ready. Please check the logs."
    exit 1
fi

echo ""
echo "=========================================="
echo "PostgreSQL Configuration Complete!"
echo "=========================================="
echo ""
echo "Configuration files backed up with timestamp"
echo "PostgreSQL is now configured to accept connections from Docker containers"
echo ""
echo "Next steps:"
echo "1. Test connection from Docker:"
echo "   docker run --rm postgres:15-alpine psql -h 192.168.123.172 -U kong -d kong -c 'SELECT 1;'"
echo ""
echo "2. Deploy Kong Gateway:"
echo "   cd /opt/my-unila/deployment/testing-vm1"
echo "   ./scripts/deploy-all.sh"
echo ""
