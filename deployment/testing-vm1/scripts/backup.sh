#!/bin/bash

###############################################################################
# MyUnila VM1 - Backup Script
# This script backs up Docker volumes and databases
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Backup directory
BACKUP_DIR="${BACKUP_DIR:-/opt/myunila/backups}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/$DATE"

###############################################################################
# Create backup directory
###############################################################################
prepare_backup_dir() {
    log_info "Creating backup directory: $BACKUP_PATH"
    mkdir -p "$BACKUP_PATH"
}

###############################################################################
# Backup Redis data
###############################################################################
backup_redis() {
    log_info "Backing up Redis data..."

    if docker ps --filter "name=myunila-redis" --filter "status=running" | grep -q myunila-redis; then
        docker run --rm \
            -v myunila-redis-data:/data:ro \
            -v "$BACKUP_PATH":/backup \
            alpine tar czf /backup/redis-data.tar.gz -C /data .

        log_success "Redis backup completed"
    else
        log_warning "Redis container not running, skipping"
    fi
}

###############################################################################
# Backup PostgreSQL (Kong database)
###############################################################################
backup_postgres() {
    log_info "Backing up PostgreSQL (Kong database)..."

    if docker ps --filter "name=myunila-postgres-kong" --filter "status=running" | grep -q postgres-kong; then
        docker exec myunila-postgres-kong \
            pg_dump -U kong kong > "$BACKUP_PATH/kong-database.sql"

        gzip "$BACKUP_PATH/kong-database.sql"

        log_success "PostgreSQL backup completed"
    else
        log_warning "PostgreSQL container not running, skipping"
    fi
}

###############################################################################
# Backup service configurations
###############################################################################
backup_configs() {
    log_info "Backing up configurations..."

    cd "$PROJECT_ROOT"

    # Backup configs directory
    tar czf "$BACKUP_PATH/configs.tar.gz" configs/

    # Backup .env (without secrets)
    if [ -f .env ]; then
        grep -v -E '(PASSWORD|SECRET|KEY)' .env > "$BACKUP_PATH/env.sample" || true
    fi

    log_success "Configuration backup completed"
}

###############################################################################
# Backup Docker volumes
###############################################################################
backup_volumes() {
    log_info "Backing up Docker volumes..."

    # Auth service storage
    if docker volume ls | grep -q myunila-auth-storage; then
        docker run --rm \
            -v myunila-auth-storage:/data:ro \
            -v "$BACKUP_PATH":/backup \
            alpine tar czf /backup/auth-storage.tar.gz -C /data .
    fi

    # Dashboard service storage
    if docker volume ls | grep -q myunila-dashboard-storage; then
        docker run --rm \
            -v myunila-dashboard-storage:/data:ro \
            -v "$BACKUP_PATH":/backup \
            alpine tar czf /backup/dashboard-storage.tar.gz -C /data .
    fi

    # Grafana data
    if docker volume ls | grep -q myunila-grafana-data; then
        docker run --rm \
            -v myunila-grafana-data:/data:ro \
            -v "$BACKUP_PATH":/backup \
            alpine tar czf /backup/grafana-data.tar.gz -C /data .
    fi

    # Prometheus data
    if docker volume ls | grep -q myunila-prometheus-data; then
        docker run --rm \
            -v myunila-prometheus-data:/data:ro \
            -v "$BACKUP_PATH":/backup \
            alpine tar czf /backup/prometheus-data.tar.gz -C /data .
    fi

    log_success "Volume backup completed"
}

###############################################################################
# Create backup manifest
###############################################################################
create_manifest() {
    log_info "Creating backup manifest..."

    cat > "$BACKUP_PATH/manifest.txt" <<EOF
MyUnila Backup Manifest
=======================
Date: $(date)
Hostname: $(hostname)
Backup Path: $BACKUP_PATH

Docker Containers:
$(docker ps --format "{{.Names}} - {{.Image}}")

Docker Volumes:
$(docker volume ls --filter name=myunila --format "{{.Name}}")

Backup Files:
$(ls -lh "$BACKUP_PATH")
EOF

    log_success "Manifest created"
}

###############################################################################
# Cleanup old backups
###############################################################################
cleanup_old_backups() {
    log_info "Cleaning up old backups (keeping last 7 days)..."

    find "$BACKUP_DIR" -maxdepth 1 -type d -mtime +7 -exec rm -rf {} \;

    log_success "Old backups cleaned up"
}

###############################################################################
# Main
###############################################################################
main() {
    echo ""
    echo "========================================"
    echo "  MyUnila VM1 - Backup"
    echo "========================================"
    echo ""

    prepare_backup_dir
    backup_redis
    backup_postgres
    backup_configs
    backup_volumes
    create_manifest
    cleanup_old_backups

    # Calculate backup size
    BACKUP_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)

    echo ""
    echo "========================================"
    log_success "Backup completed successfully!"
    echo "========================================"
    echo ""
    echo "Backup location: $BACKUP_PATH"
    echo "Backup size: $BACKUP_SIZE"
    echo ""
    echo "To restore this backup:"
    echo "  ./scripts/restore.sh $DATE"
    echo ""
}

main "$@"
