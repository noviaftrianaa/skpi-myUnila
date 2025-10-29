#!/bin/bash

# ============================================================================
# Comprehensive Backup Script for MyUnila Production
# Backs up all Docker volumes, configurations, and databases
# ============================================================================

set -e

# Configuration
BACKUP_ROOT="${BACKUP_ROOT:-/backup}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_ROOT}/${TIMESTAMP}"
RETENTION_DAYS=${RETENTION_DAYS:-30}

# Database configuration
DB_HOST="${DB_HOST:-192.168.1.13}"
DB_PORT="${DB_PORT:-1433}"
DB_NAME="${DB_NAME:-pdut_dev}"
DB_USER="${DB_USER:-sa}"
DB_PASSWORD="${DB_PASSWORD}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Logging
log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Create backup directory
create_backup_dir() {
    log_info "Creating backup directory: ${BACKUP_DIR}"
    mkdir -p "${BACKUP_DIR}"/{volumes,configs,database,logs}
}

# Backup Docker volumes
backup_volumes() {
    log_info "Backing up Docker volumes..."

    local volumes=$(docker volume ls -q | grep -E "(kong|redis|frontend|auth|dashboard|sister)")

    for volume in $volumes; do
        log_info "Backing up volume: ${volume}"
        docker run --rm \
            -v "${volume}:/source:ro" \
            -v "${BACKUP_DIR}/volumes:/backup" \
            alpine \
            tar czf "/backup/${volume}.tar.gz" -C /source .

        if [ $? -eq 0 ]; then
            log_info "Volume ${volume} backed up successfully"
        else
            log_error "Failed to backup volume ${volume}"
        fi
    done
}

# Backup configuration files
backup_configs() {
    log_info "Backing up configuration files..."

    # VM Ubuntu 1 configs
    if [ -d "/opt/myunila/vm-ubuntu-1" ]; then
        log_info "Backing up VM Ubuntu 1 configs..."
        tar czf "${BACKUP_DIR}/configs/vm-ubuntu-1-configs.tar.gz" \
            -C /opt/myunila/vm-ubuntu-1 \
            --exclude=".env" \
            .
    fi

    # VM Ubuntu 2 configs
    if [ -d "/opt/myunila/vm-ubuntu-2" ]; then
        log_info "Backing up VM Ubuntu 2 configs..."
        tar czf "${BACKUP_DIR}/configs/vm-ubuntu-2-configs.tar.gz" \
            -C /opt/myunila/vm-ubuntu-2 \
            --exclude=".env" \
            .
    fi

    # Nginx configs
    if [ -d "/etc/nginx" ]; then
        log_info "Backing up Nginx configs..."
        tar czf "${BACKUP_DIR}/configs/nginx-configs.tar.gz" \
            -C /etc/nginx \
            .
    fi

    # SSL certificates
    if [ -d "/etc/letsencrypt" ]; then
        log_info "Backing up SSL certificates..."
        tar czf "${BACKUP_DIR}/configs/ssl-certificates.tar.gz" \
            -C /etc/letsencrypt \
            .
    fi
}

# Backup database (SQL Server)
backup_database() {
    log_info "Backing up SQL Server database..."

    if [ -z "$DB_PASSWORD" ]; then
        log_warn "DB_PASSWORD not set, skipping database backup"
        return 1
    fi

    # Using sqlcmd (requires mssql-tools installed)
    if command -v sqlcmd &> /dev/null; then
        log_info "Creating database backup via sqlcmd..."
        sqlcmd -S "${DB_HOST},${DB_PORT}" -U "${DB_USER}" -P "${DB_PASSWORD}" -d "${DB_NAME}" -Q \
            "BACKUP DATABASE [${DB_NAME}] TO DISK = N'/tmp/${DB_NAME}_${TIMESTAMP}.bak' WITH INIT, COMPRESSION"

        # Copy backup file
        scp "administrator@${DB_HOST}:/tmp/${DB_NAME}_${TIMESTAMP}.bak" \
            "${BACKUP_DIR}/database/" || log_warn "Failed to copy database backup"
    else
        log_warn "sqlcmd not found, using pg_dump for Kong database instead..."

        # Backup Kong PostgreSQL database
        docker exec kong-database pg_dump -U kong kong > \
            "${BACKUP_DIR}/database/kong-postgres-${TIMESTAMP}.sql"
    fi
}

# Backup Redis data
backup_redis() {
    log_info "Backing up Redis data..."

    # Trigger Redis BGSAVE
    docker exec redis redis-cli BGSAVE

    # Wait for save to complete
    sleep 5

    # Copy dump.rdb
    docker cp redis:/data/dump.rdb "${BACKUP_DIR}/database/redis-dump-${TIMESTAMP}.rdb"
}

# Backup Docker container logs
backup_logs() {
    log_info "Backing up container logs..."

    local containers=$(docker ps --format "{{.Names}}" | grep -E "(kong|redis|frontend|auth|dashboard|sister|nginx)")

    for container in $containers; do
        log_info "Backing up logs for: ${container}"
        docker logs "${container}" > "${BACKUP_DIR}/logs/${container}-${TIMESTAMP}.log" 2>&1
    done
}

# Create backup manifest
create_manifest() {
    log_info "Creating backup manifest..."

    cat > "${BACKUP_DIR}/MANIFEST.txt" <<EOF
MyUnila Production Backup
========================

Timestamp: ${TIMESTAMP}
Date: $(date)
Hostname: $(hostname)

Backup Contents:
---------------
$(ls -lh "${BACKUP_DIR}")

Volume Backups:
--------------
$(ls -lh "${BACKUP_DIR}/volumes" 2>/dev/null || echo "No volumes backed up")

Configuration Backups:
---------------------
$(ls -lh "${BACKUP_DIR}/configs" 2>/dev/null || echo "No configs backed up")

Database Backups:
----------------
$(ls -lh "${BACKUP_DIR}/database" 2>/dev/null || echo "No database backed up")

Log Backups:
-----------
$(ls -lh "${BACKUP_DIR}/logs" 2>/dev/null || echo "No logs backed up")

Total Backup Size:
-----------------
$(du -sh "${BACKUP_DIR}")
EOF
}

# Compress entire backup
compress_backup() {
    log_info "Compressing backup archive..."

    cd "${BACKUP_ROOT}"
    tar czf "myunila-backup-${TIMESTAMP}.tar.gz" "${TIMESTAMP}/"

    if [ $? -eq 0 ]; then
        log_info "Backup compressed successfully"
        log_info "Archive: ${BACKUP_ROOT}/myunila-backup-${TIMESTAMP}.tar.gz"
        log_info "Size: $(du -sh myunila-backup-${TIMESTAMP}.tar.gz | cut -f1)"

        # Remove uncompressed directory
        rm -rf "${TIMESTAMP}/"
    else
        log_error "Failed to compress backup"
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    log_info "Cleaning up backups older than ${RETENTION_DAYS} days..."

    find "${BACKUP_ROOT}" -name "myunila-backup-*.tar.gz" -mtime +${RETENTION_DAYS} -delete

    local remaining=$(find "${BACKUP_ROOT}" -name "myunila-backup-*.tar.gz" | wc -l)
    log_info "Remaining backups: ${remaining}"
}

# Main execution
main() {
    log_info "========================================"
    log_info "MyUnila Production Backup Starting"
    log_info "========================================"

    create_backup_dir

    # Run backup operations
    backup_volumes
    backup_configs
    backup_database
    backup_redis
    backup_logs
    create_manifest

    # Compress and cleanup
    compress_backup
    cleanup_old_backups

    log_info "========================================"
    log_info "Backup completed successfully!"
    log_info "========================================"
    log_info "Backup location: ${BACKUP_ROOT}/myunila-backup-${TIMESTAMP}.tar.gz"
}

# Run main function
main

exit 0
