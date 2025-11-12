# MyUnila Production - Troubleshooting Guide

Panduan lengkap troubleshooting untuk production deployment.

## 📋 Table of Contents
- [Common Issues](#common-issues)
- [502 Bad Gateway](#502-bad-gateway)
- [Service Timeouts](#service-timeouts)
- [Database Connection](#database-connection)
- [Docker Networking](#docker-networking)
- [Performance Issues](#performance-issues)

---

## 🔥 Common Issues

### Issue 1: 502 Bad Gateway from Kong

**Symptoms:**
```json
{
  "message": "An invalid response was received from the upstream server"
}
```

**Root Causes:**
1. Backend service down or unhealthy
2. Nginx misconfiguration causing restart loop
3. Network connectivity issues
4. Upstream timeout

**Diagnosis Steps:**

```bash
# 1. Check Kong status
ssh myfrontend@192.168.120.41 "docker ps --filter 'name=kong'"

# 2. Check backend service status
ssh mybackend1@192.168.120.42 "docker ps --filter 'name=dashboard'"

# 3. Check Nginx status (should not be restarting)
ssh mybackend1@192.168.120.42 "docker ps --filter 'name=nginx'"

# 4. If Nginx is restarting, check logs
ssh mybackend1@192.168.120.42 "docker logs myunila-nginx-vm2 --tail 50"
```

**Common Nginx Errors:**

```nginx
# ERROR: unknown directive "upstream_keepalive_connections"
# CAUSE: Invalid directive in http block
# FIX: Remove these lines from nginx.conf:
upstream_keepalive_connections 32;
upstream_keepalive_timeout 60s;
upstream_keepalive_requests 100;
```

**Solution:**
```bash
# Fix nginx.conf and restart
cd /var/www/my-unila/deployment/production/vm2-backend1
docker compose -f services/nginx/docker-compose.yml restart
```

---

### Issue 2: Service Timeout / Operation Timed Out

**Symptoms:**
```json
{
  "success": false,
  "message": "Operation timed out"
}
```

**Root Cause:** Docker containers cannot reach Redis/Meilisearch using host IP.

**Why This Happens:**

```
Container → 192.168.120.42:6379 ❌ FAIL (no route from inside container)
Container → redis:6379         ✅ SUCCESS (Docker DNS resolves to 172.18.0.5)
```

**Diagnosis:**

```bash
# Check container network
docker inspect myunila-dashboard-service | grep Networks -A 10

# Test Redis connectivity by IP (will fail)
docker exec myunila-dashboard-service nc -zv 192.168.120.42 6379

# Test Redis connectivity by hostname (will succeed)
docker exec myunila-dashboard-service nc -zv redis 6379
docker exec myunila-dashboard-service ping -c 2 redis
```

**Solution:**

For services **in the same Docker network**, use Docker hostnames:

```env
# ❌ WRONG - Using host IP
REDIS_HOST=192.168.120.42
MEILISEARCH_HOST=http://192.168.120.42:7700

# ✅ CORRECT - Using Docker hostname
REDIS_HOST=redis
MEILISEARCH_HOST=http://meilisearch:7700
```

For **external services** (not in Docker), use IP:

```env
# ✅ CORRECT - External database
DB_HOST=192.168.123.119
```

**Apply Fix:**

```bash
# Edit .env file
cd /var/www/my-unila/deployment/production/vm2-backend1
sed -i 's/^REDIS_HOST=192.168.120.42/REDIS_HOST=redis/' .env
sed -i 's|^MEILISEARCH_HOST=http://192.168.120.42:7700|MEILISEARCH_HOST=http://meilisearch:7700|' .env

# Restart services
docker compose --env-file .env -f services/dashboard/docker-compose.yml restart
docker compose --env-file .env -f services/auth/docker-compose.yml restart
```

---

### Issue 3: Kong Upstream Timeout

**Symptoms:**
```json
{
  "message": "The upstream server is timing out"
}
```

**Cause:** Query takes longer than Kong's default 60-second timeout.

**Check Current Timeout:**

```bash
ssh myfrontend@192.168.120.41 "curl -s http://localhost:9801/services/dashboard-service" | grep timeout
```

**Increase Timeout:**

```bash
# Increase to 5 minutes (300 seconds)
ssh myfrontend@192.168.120.41 "curl -s -X PATCH http://localhost:9801/services/dashboard-service \
  -d 'read_timeout=300000' \
  -d 'write_timeout=300000' \
  -d 'connect_timeout=120000'"

# Verify
ssh myfrontend@192.168.120.41 "curl -s http://localhost:9801/services/dashboard-service" | grep timeout
```

**Expected Output:**
```json
{
  "read_timeout": 300000,
  "write_timeout": 300000,
  "connect_timeout": 120000
}
```

---

### Issue 4: Database Connection Failed

**Symptoms:**
```
SQLSTATE[HY000]: Could not find driver
SQLSTATE[08001]: Connection refused
```

**Diagnosis Steps:**

```bash
# 1. Test network connectivity from each VM
for vm in 41 42 43; do
  echo "Testing from VM 192.168.120.$vm..."
  ssh user@192.168.120.$vm "nc -zv 192.168.123.119 1433 2>&1"
done

# 2. Check if SQL Server driver is installed
docker exec myunila-dashboard-service php -m | grep sqlsrv

# 3. Test actual database connection
docker exec myunila-dashboard-service php artisan db:show
```

**Expected Output:**
```
SQL Server: 15.00.2000
Database: pdut
Tables: 301
Connection: SUCCESS
```

**Common Fixes:**

```bash
# If driver missing, rebuild container
cd /var/www/my-unila/deployment/production/vm2-backend1
docker compose --env-file .env -f services/dashboard/docker-compose.yml build --no-cache
docker compose --env-file .env -f services/dashboard/docker-compose.yml up -d

# If network blocked, contact infrastructure team
# Request: Allow traffic from 192.168.120.0/24 to 192.168.123.119:1433
```

---

## 🐳 Docker Networking Rules

### Rule 1: Same Network = Use Hostname

If containers are in the **same Docker network** (`myunila-prod-network`):

```yaml
# ✅ CORRECT
REDIS_HOST=redis
DB_HOST=postgres
MEILISEARCH_HOST=http://meilisearch:7700

# ❌ WRONG
REDIS_HOST=192.168.120.42
DB_HOST=192.168.120.42
```

### Rule 2: Different Network or External = Use IP

If service is **external** or on **different VM**:

```yaml
# ✅ CORRECT
DB_HOST=192.168.123.119              # External SQL Server
KONG_PROXY=http://192.168.120.41:9800   # Kong on VM1 accessed from VM2

# VM1 accessing Redis on VM2 (different VMs)
REDIS_HOST=192.168.120.42            # Must use IP
```

### Verification Commands

```bash
# Check which network a container is on
docker inspect <container-name> | grep -A 10 Networks

# Check if containers can reach each other
docker exec <container-1> ping -c 2 <container-2-hostname>

# List all containers in a network
docker network inspect myunila-prod-network
```

---

## 🚀 Performance Issues

### Slow Query Response

**Symptoms:** Endpoint takes >60 seconds to respond

**Diagnosis:**

```bash
# Monitor query execution time
time curl -s http://192.168.120.41:9800/dashboard-service/public/api/v1/unila/statistics

# Check database query logs
docker exec myunila-dashboard-service tail -f /var/www/html/storage/logs/laravel.log

# Check PHP-FPM process count
docker exec myunila-dashboard-service ps aux | grep php-fpm | wc -l
```

**Solutions:**

1. **Add Redis Caching**
   ```php
   // In controller
   return Cache::remember('unila_statistics', 300, function () {
       return $this->getStatistics();
   });
   ```

2. **Optimize SQL Queries**
   - Add indexes
   - Use query result caching
   - Implement pagination

3. **Increase PHP-FPM Workers** (already optimized for 8 CPU / 16GB RAM)
   ```ini
   pm.max_children = 150
   pm.start_servers = 30
   pm.min_spare_servers = 20
   pm.max_spare_servers = 50
   ```

---

## 📊 Health Checks

### Quick System Status Check

```bash
# Check all services
for vm in 41 42 43; do
  echo "=== VM $vm ==="
  ssh user@192.168.120.$vm "docker ps --format 'table {{.Names}}\t{{.Status}}' --filter 'name=myunila'"
  echo ""
done

# Check resource usage
for vm in 41 42 43; do
  echo "=== VM $vm Resources ==="
  ssh user@192.168.120.$vm "docker stats --no-stream --filter 'name=myunila'"
  echo ""
done
```

### Test All Endpoints

```bash
# Frontend
curl -s http://192.168.120.41:3000/api/health

# Kong
curl -s http://192.168.120.41:9800

# Dashboard (via Kong)
curl -s http://192.168.120.41:9800/dashboard-service/api/health

# Auth (via Kong)
curl -s http://192.168.120.41:9800/auth-service/api/health

# Sister (via Kong)
curl -s http://192.168.120.41:9800/sister-service/health
```

---

## 🔄 Quick Fixes

### Restart All Services

```bash
cd /var/www/my-unila/deployment/production/ansible
bash rebuild.sh --check   # Test connections first
bash rebuild.sh           # Rebuild everything
```

### Restart Single Service

```bash
# Dashboard
cd /var/www/my-unila/deployment/production/vm2-backend1
docker compose --env-file .env -f services/dashboard/docker-compose.yml restart

# Nginx
docker compose -f services/nginx/docker-compose.yml restart

# Kong
cd /var/www/my-unila/deployment/production/vm1-frontend-kong
docker compose --env-file .env -f services/kong/docker-compose.yml restart
```

### Clear All Caches

```bash
# Laravel cache
docker exec myunila-dashboard-service php artisan cache:clear
docker exec myunila-dashboard-service php artisan config:clear
docker exec myunila-dashboard-service php artisan route:clear
docker exec myunila-dashboard-service php artisan view:clear

# Redis cache
docker exec myunila-redis-vm2 redis-cli FLUSHALL

# OPcache (restart PHP-FPM)
docker compose --env-file .env -f services/dashboard/docker-compose.yml restart
```

---

## 🆘 Emergency Contacts

**Infrastructure Team:**
- Network/Firewall issues
- Database connectivity
- Server resources

**Development Team:**
- Application errors
- API issues
- Code bugs

---

## 📚 Related Documentation

- [DEPLOYMENT-STEPS.md](./DEPLOYMENT-STEPS.md) - Step-by-step deployment
- [TUNING-GUIDE.md](./TUNING-GUIDE.md) - Performance optimization
- [PORTS-DOCUMENTATION.md](./PORTS-DOCUMENTATION.md) - Network configuration
- [ansible/REBUILD-GUIDE.md](./ansible/REBUILD-GUIDE.md) - Rebuild automation

---

**Version:** 1.0
**Last Updated:** 2025-11-12
**Maintained by:** Development Team
