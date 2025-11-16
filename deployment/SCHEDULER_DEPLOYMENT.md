# Meilisearch Scheduler Deployment Guide

## Overview

This guide covers the deployment of the automated Meilisearch data sync scheduler for the MyUnila Dashboard Service. The scheduler automatically imports data from the database to Meilisearch every day at 02:00 WIB.

## Architecture

### Components

1. **Laravel Scheduler** - Configured in [backend/dashboard-service/routes/console.php](../backend/dashboard-service/routes/console.php)
   - Runs `search:import --model=all` daily at 02:00 WIB
   - Includes success/failure logging
   - Prevents overlapping executions

2. **Supervisor** - Process control system for running the scheduler
   - Configuration: [backend/dashboard-service/supervisord.conf](../backend/dashboard-service/supervisord.conf)
   - Monitors and auto-restarts the scheduler if it crashes
   - Runs every minute (standard Laravel schedule:run pattern)

3. **Docker Container** - Separate `dashboard-scheduler` container
   - Uses same image as `dashboard-service`
   - Installs Supervisor on startup
   - Runs independently from main service

### Data Flow

```
Database (SQL Server)
    ↓
ImportSearchData Command (Artisan)
    ↓
Meilisearch Indexes (7 categories)
    ↓
MeilisearchService (with SQL fallback)
    ↓
Search API Endpoints
```

### Categories Synced (7 total)

1. Mahasiswa (Students) - ~181K records
2. Dosen (Lecturers) - ~3.6K records
3. Prodi (Study Programs) - 191 records
4. Penelitian (Research)
5. Publikasi (Publications)
6. Pengabdian (Community Service)
7. Bidang Ilmu (Fields of Study)

## Deployment Instructions

### Prerequisites

- Docker and Docker Compose installed
- Meilisearch instance running and accessible
- Database credentials configured in `.env`
- Dashboard service image built

### Environment-Specific Deployments

#### 1. Local Development

**Location**: `deployment/local/services/3-backend/`

**Steps**:

```bash
# Navigate to local deployment directory
cd deployment/local/services/3-backend

# Stop existing scheduler (if running)
docker-compose -f docker-compose.dashboard.yml stop dashboard-scheduler
docker rm myunila-dashboard-scheduler

# Pull/rebuild images if needed
docker-compose -f docker-compose.dashboard.yml build dashboard-service

# Start the scheduler
docker-compose -f docker-compose.dashboard.yml up -d dashboard-scheduler

# Verify scheduler is running
docker ps | grep dashboard-scheduler
docker logs myunila-dashboard-scheduler

# Check Supervisor status
docker exec myunila-dashboard-scheduler supervisorctl status
```

**Expected Output**:
```
laravel-scheduler                RUNNING   pid 123, uptime 0:01:00
```

#### 2. Testing Environment (VM1)

**Location**: `deployment/testing-vm1/services/3-backend/`

**Steps**:

```bash
# SSH into VM1
ssh user@vm1-ip

# Navigate to deployment directory
cd /path/to/deployment/testing-vm1/services/3-backend

# Update code (if needed)
git pull

# Stop existing scheduler
docker-compose -f docker-compose.dashboard.yml stop dashboard-scheduler
docker rm myunila-dashboard-scheduler

# Rebuild image with new code
docker-compose -f docker-compose.dashboard.yml build dashboard-service

# Start scheduler
docker-compose -f docker-compose.dashboard.yml up -d dashboard-scheduler

# Monitor logs
docker logs -f myunila-dashboard-scheduler
```

#### 3. Production Environment (VM2-Backend1)

**Location**: `deployment/production/vm2-backend1/services/dashboard/`

**Image**: Uses `myunila/dashboard-service:production`

**Steps**:

```bash
# SSH into VM2-Backend1
ssh user@vm2-backend1-ip

# Navigate to deployment directory
cd /path/to/deployment/production/vm2-backend1/services/dashboard

# Update code
git pull

# Rebuild production image
cd ../../../../../../backend/dashboard-service
docker build -f Dockerfile.alpine-fixed -t myunila/dashboard-service:production --build-arg APP_ENV=production .

# Navigate back to deployment directory
cd ../../deployment/production/vm2-backend1/services/dashboard

# Stop existing scheduler
docker-compose stop dashboard-scheduler
docker rm myunila-dashboard-scheduler

# Start new scheduler
docker-compose up -d dashboard-scheduler

# Verify deployment
docker ps | grep dashboard-scheduler
docker logs myunila-dashboard-scheduler
docker exec myunila-dashboard-scheduler supervisorctl status
```

## Verification & Testing

### 1. Check Scheduler Status

```bash
# View Supervisor status
docker exec myunila-dashboard-scheduler supervisorctl status

# View scheduler logs
docker exec myunila-dashboard-scheduler tail -f /var/www/storage/logs/scheduler.log

# View container logs
docker logs -f myunila-dashboard-scheduler
```

### 2. Manual Test Import

Test the import command manually before relying on the scheduler:

```bash
# Run import for single category
docker exec myunila-dashboard-service php artisan search:import --model=prodi

# Run full import (all 7 categories)
docker exec myunila-dashboard-service php artisan search:import --model=all
```

### 3. Verify Scheduler Configuration

```bash
# List all scheduled tasks
docker exec myunila-dashboard-service php artisan schedule:list

# Test scheduler (runs due tasks immediately)
docker exec myunila-dashboard-service php artisan schedule:run --verbose
```

**Expected Output**:
```
Running scheduled command: Artisan search:import --model=all
```

### 4. Check Meilisearch Indexes

```bash
# Check index stats via Meilisearch API
curl -X GET 'http://localhost:7700/indexes/mahasiswa/stats' -H 'Authorization: Bearer YOUR_MASTER_KEY'

# Or check all indexes
curl -X GET 'http://localhost:7700/indexes' -H 'Authorization: Bearer YOUR_MASTER_KEY'
```

### 5. Monitor Resource Usage

```bash
# Check container resource usage
docker stats myunila-dashboard-scheduler

# Check disk usage for logs
docker exec myunila-dashboard-scheduler du -sh /var/www/storage/logs
docker exec myunila-dashboard-scheduler du -sh /var/log/supervisor
```

## Scheduler Configuration Details

### Timing

- **Scheduled Time**: 02:00 WIB (Asia/Jakarta timezone)
- **Frequency**: Daily
- **Execution**: Background process
- **Overlap Prevention**: Enabled (won't start if previous run still active)

### Environment Variables

The scheduler container inherits environment variables from the main service:

```yaml
# Database
DB_CONNECTION: sqlsrv
DB_HOST: ${DASHBOARD_DB_HOST}
DB_PORT: ${DASHBOARD_DB_PORT}
DB_DATABASE: ${DASHBOARD_DB_DATABASE}
DB_USERNAME: ${DASHBOARD_DB_USERNAME}
DB_PASSWORD: ${DASHBOARD_DB_PASSWORD}

# Meilisearch
MEILISEARCH_HOST: ${MEILISEARCH_HOST}
MEILISEARCH_KEY: ${MEILISEARCH_KEY}

# Redis
REDIS_HOST: ${REDIS_HOST}
REDIS_PORT: ${REDIS_PORT}
REDIS_PASSWORD: ${REDIS_PASSWORD}

# Timezone
TZ: ${TIMEZONE:-Asia/Jakarta}
```

### Resource Limits

**Production** (VM2):
```yaml
limits:
  cpus: '1'
  memory: 1G
reservations:
  cpus: '0.5'
  memory: 512M
```

**Local/Testing**: No explicit limits (uses defaults)

### Logging

**Supervisor Logs**:
- Location: `/var/log/supervisor/supervisord.log`
- Max size: No limit (managed by Docker)

**Scheduler Logs**:
- Location: `/var/www/storage/logs/scheduler.log`
- Max size: 10MB
- Backups: 5 files
- Rotation: Automatic

**Container Logs**:
- Driver: json-file
- Max size: 10m
- Max files: 3
- Labels: `service=dashboard-scheduler,vm=<vm-name>`

## Troubleshooting

### Issue: Scheduler Container Keeps Restarting

**Symptoms**: Container restarts every few seconds

**Diagnosis**:
```bash
docker logs myunila-dashboard-scheduler
```

**Common Causes**:
1. Supervisor not installed - Check if `apk add supervisor` (Alpine) or `apt-get install supervisor` (Debian) failed
2. Config file not mounted - Verify volume mount for `supervisord.conf`
3. Missing dependencies - Check if PHP/Artisan is available

**Solution**:
```bash
# Check if supervisor is installed
docker exec myunila-dashboard-scheduler which supervisord

# Check config file exists
docker exec myunila-dashboard-scheduler cat /etc/supervisor/conf.d/supervisord.conf

# Manually start supervisor for debugging
docker exec -it myunila-dashboard-scheduler /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
```

### Issue: Scheduled Tasks Not Running

**Symptoms**: No imports happening at scheduled time

**Diagnosis**:
```bash
# Check if scheduler is actually running
docker exec myunila-dashboard-scheduler supervisorctl status

# Check scheduler logs
docker exec myunila-dashboard-scheduler tail -100 /var/www/storage/logs/scheduler.log

# Verify schedule configuration
docker exec myunila-dashboard-service php artisan schedule:list
```

**Common Causes**:
1. Wrong timezone - Container timezone doesn't match expected
2. Code not updated - Old code without scheduler definition
3. Supervisor process crashed - Check supervisor logs

**Solution**:
```bash
# Verify timezone
docker exec myunila-dashboard-scheduler date
docker exec myunila-dashboard-scheduler cat /etc/timezone

# Force run schedule to test
docker exec myunila-dashboard-scheduler php /var/www/artisan schedule:run --verbose

# Restart supervisor
docker exec myunila-dashboard-scheduler supervisorctl restart laravel-scheduler
```

### Issue: Import Command Fails

**Symptoms**: Scheduler runs but import fails

**Diagnosis**:
```bash
# Check application logs
docker exec myunila-dashboard-service tail -100 /var/www/storage/logs/laravel.log

# Check scheduler logs
docker exec myunila-dashboard-scheduler tail -100 /var/www/storage/logs/scheduler.log

# Test import manually
docker exec myunila-dashboard-service php artisan search:import --model=mahasiswa -vvv
```

**Common Causes**:
1. Meilisearch unavailable - Check connection to Meilisearch
2. Database connection issues - Verify DB credentials
3. Memory limit exceeded - Increase container memory
4. Timeout on large datasets - Consider chunking or increasing timeout

**Solution**:
```bash
# Test Meilisearch connection
docker exec myunila-dashboard-service php artisan tinker
>>> app(\App\Services\MeilisearchService::class)->testConnection();

# Test database connection
docker exec myunila-dashboard-service php artisan db:show

# Increase memory limit in docker-compose.yml
# Then recreate container
docker-compose up -d dashboard-scheduler
```

### Issue: High Memory Usage

**Symptoms**: Container using excessive memory

**Diagnosis**:
```bash
# Monitor real-time usage
docker stats myunila-dashboard-scheduler

# Check PHP memory limit
docker exec myunila-dashboard-scheduler php -i | grep memory_limit
```

**Solution**:
```bash
# Increase PHP memory limit (if needed)
# Add to docker-compose.yml environment:
PHP_MEMORY_LIMIT: 512M

# Or optimize import chunk size in ImportSearchData command
# Reduce chunk size from 100 to 50
```

### Issue: Logs Not Appearing

**Symptoms**: No logs in expected locations

**Diagnosis**:
```bash
# Check if log directory exists
docker exec myunila-dashboard-scheduler ls -la /var/www/storage/logs

# Check permissions
docker exec myunila-dashboard-scheduler ls -la /var/www/storage

# Check if supervisor log directory exists
docker exec myunila-dashboard-scheduler ls -la /var/log/supervisor
```

**Solution**:
```bash
# Create log directories if missing
docker exec myunila-dashboard-scheduler mkdir -p /var/www/storage/logs
docker exec myunila-dashboard-scheduler mkdir -p /var/log/supervisor

# Fix permissions
docker exec myunila-dashboard-scheduler chown -R www-data:www-data /var/www/storage

# Restart supervisor
docker restart myunila-dashboard-scheduler
```

## Maintenance

### Updating Scheduler Configuration

If you need to change the scheduled time or add new scheduled tasks:

1. Edit [backend/dashboard-service/routes/console.php](../backend/dashboard-service/routes/console.php)
2. Commit the changes
3. Rebuild the dashboard-service image
4. Restart the scheduler container

```bash
# Local example
cd deployment/local/services/3-backend
docker-compose -f docker-compose.dashboard.yml build dashboard-service
docker-compose -f docker-compose.dashboard.yml restart dashboard-scheduler
```

### Monitoring Scheduler Health

Set up a monitoring script to verify scheduler is working:

```bash
#!/bin/bash
# check-scheduler.sh

CONTAINER="myunila-dashboard-scheduler"

# Check if container is running
if ! docker ps | grep -q $CONTAINER; then
    echo "ERROR: Scheduler container not running"
    exit 1
fi

# Check if supervisor is running
if ! docker exec $CONTAINER supervisorctl status | grep -q "RUNNING"; then
    echo "ERROR: Supervisor not running"
    exit 1
fi

# Check if scheduler ran in last 24 hours
LAST_RUN=$(docker exec $CONTAINER find /var/www/storage/logs -name "scheduler.log" -mtime -1)
if [ -z "$LAST_RUN" ]; then
    echo "WARNING: Scheduler hasn't run in 24 hours"
    exit 1
fi

echo "OK: Scheduler healthy"
exit 0
```

### Log Rotation

Logs are automatically rotated by:
- **Supervisor**: Rotates scheduler.log (10MB max, 5 backups)
- **Docker**: Rotates container logs (10MB max, 3 files)

Manual cleanup if needed:
```bash
# Clean old scheduler logs
docker exec myunila-dashboard-scheduler find /var/www/storage/logs -name "scheduler.log.*" -mtime +30 -delete

# Clean old supervisor logs
docker exec myunila-dashboard-scheduler find /var/log/supervisor -name "*.log.*" -mtime +30 -delete
```

## Performance Tuning

### Import Optimization

For large datasets, consider these optimizations:

1. **Chunk Size**: Adjust in `ImportSearchData` command (default: 100 records/chunk)
2. **Memory Limit**: Increase PHP memory_limit if needed
3. **Timeout**: Increase max_execution_time for very large imports
4. **Indexing**: Run import during low-traffic hours (currently 02:00 WIB)

### Resource Allocation

Adjust container resources based on monitoring:

```yaml
# In docker-compose.yml
deploy:
  resources:
    limits:
      cpus: '2'      # Increase if CPU-bound
      memory: 2G     # Increase if memory-bound
    reservations:
      cpus: '1'
      memory: 1G
```

## Rollback Procedure

If scheduler deployment fails:

```bash
# Stop new scheduler
docker-compose stop dashboard-scheduler
docker rm myunila-dashboard-scheduler

# Revert code changes
git checkout HEAD~1 -- backend/dashboard-service/routes/console.php
git checkout HEAD~1 -- backend/dashboard-service/supervisord.conf
git checkout HEAD~1 -- deployment/*/docker-compose*.yml

# Rebuild with old code
docker-compose -f docker-compose.dashboard.yml build dashboard-service

# Start with old configuration
docker-compose -f docker-compose.dashboard.yml up -d dashboard-scheduler
```

## Production Checklist

Before deploying to production:

- [ ] Test manual import in production environment
- [ ] Verify Meilisearch connection and credentials
- [ ] Verify database connection and credentials
- [ ] Check container resource limits are appropriate
- [ ] Configure monitoring/alerting for scheduler failures
- [ ] Test scheduler runs at expected time (may need to wait 24h)
- [ ] Verify logs are being written correctly
- [ ] Document rollback procedure for team
- [ ] Set up automated health checks
- [ ] Test supervisor auto-restart functionality

## Support & Contact

For issues or questions:
1. Check application logs: `/var/www/storage/logs/laravel.log`
2. Check scheduler logs: `/var/www/storage/logs/scheduler.log`
3. Check supervisor logs: `/var/log/supervisor/supervisord.log`
4. Review this documentation
5. Contact DevOps team

---

**Last Updated**: 2025-11-16
**Version**: 1.0
**Author**: MyUnila DevOps Team
