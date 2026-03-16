#!/bin/bash
# ============================================================
# MyUnila DB Failover Script — VM5 Staging
# ============================================================
# Usage:
#   ./db-failover.sh status       — Cek koneksi DB saat ini
#   ./db-failover.sh switch 190   — Switch ke server 190
#   ./db-failover.sh switch 119   — Switch balik ke server 119
#   ./db-failover.sh test         — Test koneksi DB tanpa switch
#   ./db-failover.sh dry-run 190  — Preview perubahan tanpa apply
# ============================================================

set -e

ENV_FILE="/var/www/my-unila/deployment/production/vm5-staging/.env"
BACKUP_DIR="/root/.backup-credentials"
COMPOSE_DIR="/var/www/my-unila/deployment/production/vm5-staging"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# DB Server mapping
DB_PRIMARY="192.168.123.119"
DB_REPLICA="192.168.123.190"

# All services with DB connection
SERVICES=(
    "backend-php/docker-compose.auth.yml"
    "backend-php/docker-compose.dashboard.yml"
    "backend-php/docker-compose.public.yml"
    "backend-php/docker-compose.nginx.yml"
    "backend-go/docker-compose.api.yml"
    "backend-go/docker-compose.sister.yml"
    "backend-go/docker-compose.feeder.yml"
    "backend-go/docker-compose.myunila.yml"
    "backend-go/docker-compose.keuangan.yml"
    "backend-go/docker-compose.monitoring.yml"
)

# Health check endpoints
HEALTH_CHECKS=(
    "http://localhost:8081/health|Auth"
    "http://localhost:8085/health|WS-Service"
    "http://localhost:8083/health|Sister"
    "http://localhost:8084/health|Feeder"
    "http://localhost:8086/health|MyUnila"
    "http://localhost:8088/health|Keuangan"
)

log_info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ============================================================
# STATUS — Show current DB configuration
# ============================================================
cmd_status() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║        MyUnila DB Connection Status          ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════╝${NC}"
    echo ""

    # Read current DB_HOST
    local current_host=$(grep "^AUTH_DB_HOST=" "$ENV_FILE" | cut -d'=' -f2)
    local current_db=$(grep "^AUTH_DB_DATABASE=" "$ENV_FILE" | cut -d'=' -f2)

    if [ "$current_host" = "$DB_PRIMARY" ]; then
        log_ok "DB Host: ${GREEN}$current_host${NC} (PRIMARY)"
    elif [ "$current_host" = "$DB_REPLICA" ]; then
        log_warn "DB Host: ${YELLOW}$current_host${NC} (REPLICA)"
    else
        log_error "DB Host: $current_host (UNKNOWN)"
    fi
    
    log_info "DB Name: $current_db"
    echo ""

    # Check all service DB_HOST values are consistent
    local hosts=$(grep "_DB_HOST=" "$ENV_FILE" | grep -v "^#" | grep -v "RADIUS\|REDIS\|MSSQL" | cut -d'=' -f2 | sort -u)
    local host_count=$(echo "$hosts" | wc -l)
    
    if [ "$host_count" -eq 1 ]; then
        log_ok "All services point to same DB host ✓"
    else
        log_error "INCONSISTENT! Services pointing to different hosts:"
        grep "_DB_HOST=" "$ENV_FILE" | grep -v "^#" | grep -v "RADIUS\|REDIS\|MSSQL"
    fi

    echo ""
    log_info "Services health:"
    for check in "${HEALTH_CHECKS[@]}"; do
        local url=$(echo "$check" | cut -d'|' -f1)
        local name=$(echo "$check" | cut -d'|' -f2)
        local code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$url" 2>/dev/null || echo "000")
        if [ "$code" = "200" ]; then
            echo -e "  ${GREEN}✓${NC} $name ($url) — HTTP $code"
        else
            echo -e "  ${RED}✗${NC} $name ($url) — HTTP $code"
        fi
    done
    echo ""
}

# ============================================================
# TEST — Test DB connection without switching
# ============================================================
cmd_test() {
    local target=${1:-$DB_PRIMARY}
    echo ""
    log_info "Testing connection to $target..."

    # Test via docker (sqlcmd or mssql-tools might not be on host)
    local result=$(docker exec myunila-auth-staging php -r "
        try {
            \$pdo = new PDO('sqlsrv:Server=$target,1433;Database=pdut_staging;TrustServerCertificate=true', 'mizarzulmi', '__REDACTED_DB_PASSWORD__');
            echo 'OK';
        } catch (Exception \$e) {
            echo 'FAIL: ' . \$e->getMessage();
        }
    " 2>/dev/null)

    if [[ "$result" == "OK" ]]; then
        log_ok "Connection to $target:1433/pdut_staging — ${GREEN}SUCCESS${NC}"
    else
        log_error "Connection to $target:1433/pdut_staging — ${RED}FAILED${NC}"
        log_error "$result"
    fi
    echo ""
}

# ============================================================
# SWITCH — Change DB host for all services
# ============================================================
cmd_switch() {
    local target_short=$1
    local target_host=""
    local target_label=""

    case "$target_short" in
        119|primary)
            target_host=$DB_PRIMARY
            target_label="PRIMARY ($DB_PRIMARY)"
            ;;
        190|replica)
            target_host=$DB_REPLICA
            target_label="REPLICA ($DB_REPLICA)"
            ;;
        *)
            log_error "Usage: $0 switch [119|190]"
            exit 1
            ;;
    esac

    local current_host=$(grep "^AUTH_DB_HOST=" "$ENV_FILE" | cut -d'=' -f2)

    if [ "$current_host" = "$target_host" ]; then
        log_warn "Already pointing to $target_label — nothing to do"
        exit 0
    fi

    echo ""
    echo -e "${YELLOW}╔══════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║          DB FAILOVER — SWITCHING             ║${NC}"
    echo -e "${YELLOW}╚══════════════════════════════════════════════╝${NC}"
    echo ""
    log_info "Current: $current_host"
    log_info "Target:  $target_host ($target_label)"
    echo ""

    # Confirmation
    read -p "⚠️  Proceed with failover? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        log_warn "Aborted."
        exit 0
    fi

    # Step 1: Backup .env
    log_info "Step 1/4: Backing up .env..."
    cp "$ENV_FILE" "$BACKUP_DIR/vm5-staging.env.$(date +%Y%m%d_%H%M%S)"
    log_ok "Backup saved"

    # Step 2: Update .env
    log_info "Step 2/4: Updating DB_HOST in .env..."
    
    # Update all *_DB_HOST entries (except RADIUS, REDIS)
    sed -i "s|AUTH_DB_HOST=$current_host|AUTH_DB_HOST=$target_host|g" "$ENV_FILE"
    sed -i "s|API_DB_HOST=$current_host|API_DB_HOST=$target_host|g" "$ENV_FILE"
    sed -i "s|SISTER_DB_HOST=$current_host|SISTER_DB_HOST=$target_host|g" "$ENV_FILE"
    sed -i "s|FEEDER_DB_HOST=$current_host|FEEDER_DB_HOST=$target_host|g" "$ENV_FILE"
    sed -i "s|MYUNILA_DB_HOST=$current_host|MYUNILA_DB_HOST=$target_host|g" "$ENV_FILE"
    sed -i "s|KEUANGAN_DB_HOST=$current_host|KEUANGAN_DB_HOST=$target_host|g" "$ENV_FILE"
    sed -i "s|MONITORING_DB_HOST=$current_host|MONITORING_DB_HOST=$target_host|g" "$ENV_FILE"
    sed -i "s|DASHBOARD_DB_HOST=$current_host|DASHBOARD_DB_HOST=$target_host|g" "$ENV_FILE"
    sed -i "s|PUBLIC_DB_HOST=$current_host|PUBLIC_DB_HOST=$target_host|g" "$ENV_FILE"
    sed -i "s|DB_MSSQL_HOST=$current_host|DB_MSSQL_HOST=$target_host|g" "$ENV_FILE"

    log_ok ".env updated"

    # Step 3: Restart all services
    log_info "Step 3/4: Restarting all services..."
    cd "$COMPOSE_DIR"

    for svc_file in "${SERVICES[@]}"; do
        local svc_name=$(basename "$svc_file" .yml | sed 's/docker-compose\.//')
        printf "  Restarting %-20s" "$svc_name..."
        docker compose --env-file "$ENV_FILE" -f "services/$svc_file" up -d --force-recreate 2>/dev/null
        echo -e " ${GREEN}✓${NC}"
    done

    # Wait for services to start
    log_info "Waiting 10s for services to initialize..."
    sleep 10

    # Step 4: Health check
    log_info "Step 4/4: Health check..."
    local all_ok=true
    for check in "${HEALTH_CHECKS[@]}"; do
        local url=$(echo "$check" | cut -d'|' -f1)
        local name=$(echo "$check" | cut -d'|' -f2)
        local code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || echo "000")
        if [ "$code" = "200" ]; then
            echo -e "  ${GREEN}✓${NC} $name — OK"
        else
            echo -e "  ${RED}✗${NC} $name — HTTP $code"
            all_ok=false
        fi
    done

    echo ""
    if $all_ok; then
        echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║     FAILOVER COMPLETE — ALL SERVICES OK     ║${NC}"
        echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
    else
        echo -e "${YELLOW}╔══════════════════════════════════════════════╗${NC}"
        echo -e "${YELLOW}║   FAILOVER DONE — SOME SERVICES MAY NEED   ║${NC}"
        echo -e "${YELLOW}║   TIME TO INITIALIZE. CHECK AGAIN SHORTLY.  ║${NC}"
        echo -e "${YELLOW}╚══════════════════════════════════════════════╝${NC}"
    fi
    echo ""
    log_info "New DB Host: $target_host"
    log_info "Rollback: $0 switch $([ \"$target_short\" = \"190\" ] && echo \"119\" || echo \"190\")"
    echo ""
}

# ============================================================
# DRY-RUN — Preview changes without applying
# ============================================================
cmd_dryrun() {
    local target_short=$1
    local target_host=""

    case "$target_short" in
        119) target_host=$DB_PRIMARY ;;
        190) target_host=$DB_REPLICA ;;
        *) log_error "Usage: $0 dry-run [119|190]"; exit 1 ;;
    esac

    local current_host=$(grep "^AUTH_DB_HOST=" "$ENV_FILE" | cut -d'=' -f2)

    echo ""
    log_info "DRY RUN — No changes will be made"
    echo ""
    log_info "Current DB Host: $current_host"
    log_info "Target DB Host:  $target_host"
    echo ""
    log_info "Changes that would be made in .env:"
    grep "_DB_HOST=$current_host" "$ENV_FILE" | grep -v "^#" | while read line; do
        local key=$(echo "$line" | cut -d'=' -f1)
        echo -e "  ${RED}- $key=$current_host${NC}"
        echo -e "  ${GREEN}+ $key=$target_host${NC}"
    done
    echo ""
    log_info "Services that would be restarted:"
    for svc_file in "${SERVICES[@]}"; do
        local svc_name=$(basename "$svc_file" .yml | sed 's/docker-compose\.//')
        echo "  - $svc_name"
    done
    echo ""
}

# ============================================================
# MAIN
# ============================================================
case "${1:-}" in
    status)
        cmd_status
        ;;
    test)
        cmd_test "${2:-$DB_PRIMARY}"
        ;;
    switch)
        cmd_switch "${2:-}"
        ;;
    dry-run)
        cmd_dryrun "${2:-}"
        ;;
    *)
        echo ""
        echo "MyUnila DB Failover Script"
        echo ""
        echo "Usage:"
        echo "  $0 status         — Show current DB connection"
        echo "  $0 test [119|190] — Test DB connection"
        echo "  $0 dry-run 190    — Preview failover changes"
        echo "  $0 switch 190     — Execute failover to 190"
        echo "  $0 switch 119     — Failback to 119"
        echo ""
        echo "Servers:"
        echo "  119 = $DB_PRIMARY (PRIMARY)"
        echo "  190 = $DB_REPLICA (REPLICA)"
        echo ""
        ;;
esac
