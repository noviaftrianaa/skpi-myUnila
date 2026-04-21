#!/bin/bash

###############################################################################
# Kong Config Backup — VM1 Production
#
# Backup Kong declarative config + raw postgres dump.
# Meant to be run weekly by cron as safety net against volume corruption
# or accidental container/volume removal.
#
# Primary source of truth is still the git-tracked setup-kong-routes.sh —
# this backup captures any runtime drift (e.g. manual admin API changes).
#
# Install:
#   chmod +x backup-kong.sh
#   crontab -e
#   # Run every Sunday 03:00
#   0 3 * * 0 /var/www/my-unila/deployment/production/vm1-frontend-kong/scripts/backup-kong.sh >> /var/log/kong-backup.log 2>&1
###############################################################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"
BACKUP_DIR="/var/www/my-unila/backups/kong"
TIMESTAMP="$(date +%Y%m%d_%H%M)"
RETENTION_DAYS=30

KONG_CONTAINER="${KONG_CONTAINER:-myunila-kong}"
KONG_PG_CONTAINER="${KONG_PG_CONTAINER:-myunila-kong-postgres}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

if [ -f "$ENV_FILE" ]; then
    # shellcheck disable=SC1090
    source "$ENV_FILE"
else
    log "WARN: .env not found at $ENV_FILE — relying on defaults / env"
fi

: "${KONG_PG_USER:?KONG_PG_USER not set}"
: "${KONG_PG_DATABASE:?KONG_PG_DATABASE not set}"

mkdir -p "$BACKUP_DIR"

log "=== Kong backup started ==="
log "Backup dir: $BACKUP_DIR"
log "Timestamp:  $TIMESTAMP"

# 1. Declarative YAML export (human-readable, re-importable)
YAML_FILE="$BACKUP_DIR/kong-config-$TIMESTAMP.yaml"
log "Exporting declarative config to $YAML_FILE"
if docker exec "$KONG_CONTAINER" kong config db_export /tmp/kong-export.yaml >/dev/null 2>&1; then
    docker cp "$KONG_CONTAINER:/tmp/kong-export.yaml" "$YAML_FILE"
    docker exec "$KONG_CONTAINER" rm -f /tmp/kong-export.yaml || true
    log "OK: declarative YAML saved ($(wc -l <"$YAML_FILE") lines)"
else
    log "WARN: kong config db_export failed — skipping YAML"
fi

# 2. Raw postgres dump (complete, includes plugins/consumers/secrets)
SQL_FILE="$BACKUP_DIR/kong-postgres-$TIMESTAMP.sql"
log "Dumping postgres to $SQL_FILE"
docker exec "$KONG_PG_CONTAINER" pg_dump -U "$KONG_PG_USER" "$KONG_PG_DATABASE" > "$SQL_FILE"
gzip "$SQL_FILE"
log "OK: postgres dump saved ($(du -h "$SQL_FILE.gz" | cut -f1))"

# 3. Rotate — delete backups older than retention
log "Rotating backups older than ${RETENTION_DAYS} days"
DELETED=$(find "$BACKUP_DIR" -type f \( -name 'kong-config-*.yaml' -o -name 'kong-postgres-*.sql.gz' \) -mtime +${RETENTION_DAYS} -print -delete | wc -l)
log "Deleted $DELETED old file(s)"

log "=== Kong backup finished ==="
log "Current backups:"
ls -lh "$BACKUP_DIR" | tail -20 | while IFS= read -r line; do log "  $line"; done
