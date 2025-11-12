# MyUnila Production - Performance Tuning Guide

Panduan lengkap optimasi performa untuk server production dengan spesifikasi 8 CPU cores dan 16GB RAM.

## 📋 Table of Contents
- [System Specifications](#system-specifications)
- [VM1 - Frontend & Kong Tuning](#vm1---frontend--kong-tuning)
- [VM2 - Backend PHP Services Tuning](#vm2---backend-php-services-tuning)
- [VM3 - Sister Service (Go) Tuning](#vm3---sister-service-go-tuning)
- [Infrastructure Services Tuning](#infrastructure-services-tuning)
- [Applying the Tuning](#applying-the-tuning)
- [Monitoring & Validation](#monitoring--validation)

---

## 🖥️ System Specifications

**All VMs have identical specifications:**
- **CPU:** 8 cores
- **RAM:** 16GB
- **OS:** Ubuntu 22.04/23.04
- **Docker:** Latest stable version

---

## 🎯 VM1 - Frontend & Kong Tuning

### Frontend (Next.js) Configuration

**File:** `deployment/production/vm1-frontend-kong/services/frontend/docker-compose.yml`

```yaml
environment:
  NODE_OPTIONS: "--max-old-space-size=4096"  # 4GB heap for Node.js
  UV_THREADPOOL_SIZE: 16                      # 2x CPU cores

deploy:
  resources:
    limits:
      cpus: '6'        # Max 6 cores for frontend
      memory: 8G       # Max 8GB RAM
    reservations:
      cpus: '2'        # Min 2 cores guaranteed
      memory: 2G       # Min 2GB RAM guaranteed
```

**Rationale:**
- `NODE_OPTIONS`: Allocates 4GB for V8 heap (default is ~2GB)
- `UV_THREADPOOL_SIZE`: Increases I/O thread pool for better concurrency
- Resource limits prevent frontend from consuming all server resources

---

### Kong Gateway Configuration

**File:** `deployment/production/vm1-frontend-kong/services/kong/docker-compose.yml`

```yaml
environment:
  # Performance tuning for 8 CPU / 16GB RAM
  KONG_NGINX_WORKER_PROCESSES: "8"                    # 1 per CPU core
  KONG_NGINX_WORKER_CONNECTIONS: "10000"              # Max concurrent connections per worker
  KONG_MEM_CACHE_SIZE: "256m"                         # Shared dictionary cache
  KONG_PROXY_LISTEN_BACKLOG: "16384"                  # TCP backlog queue
  KONG_UPSTREAM_KEEPALIVE_POOL_SIZE: "256"            # Connection pool per worker
  KONG_UPSTREAM_KEEPALIVE_MAX_REQUESTS: "1000"        # Reuse connections
  KONG_UPSTREAM_KEEPALIVE_IDLE_TIMEOUT: "60"          # Keep idle connections

deploy:
  resources:
    limits:
      cpus: '6'        # Max 6 cores
      memory: 6G       # Max 6GB RAM
    reservations:
      cpus: '2'        # Min 2 cores
      memory: 1G       # Min 1GB RAM
```

**Rationale:**
- **Worker processes = CPU cores**: Maximum parallelism
- **High worker_connections**: Handle up to 80,000 concurrent connections (8 workers × 10,000)
- **Keepalive settings**: Reuse backend connections, reduce latency

**Expected Performance:**
- **Requests/sec:** 10,000+ (simple requests)
- **Latency:** <10ms (p50), <50ms (p95)
- **Concurrent connections:** 80,000+

---

## 🔧 VM2 - Backend PHP Services Tuning

### PHP-FPM Configuration

**Files:**
- `backend/dashboard-service/Dockerfile.alpine-fixed`
- `backend/auth-service/Dockerfile.alpine-fixed`

```ini
# PHP Configuration
memory_limit = 1024M                          # 1GB per process
max_execution_time = 300                      # 5 minutes timeout
opcache.enable = 1
opcache.memory_consumption = 512              # 512MB opcache
opcache.interned_strings_buffer = 32          # String cache
opcache.max_accelerated_files = 20000         # Cache more files
opcache.validate_timestamps = 0               # Disable timestamp checks (production)
realpath_cache_size = 8192K                   # Increase realpath cache
realpath_cache_ttl = 7200                     # 2 hours TTL

# PHP-FPM Pool Configuration
pm = dynamic                                  # Dynamic process management
pm.max_children = 150                         # Max processes (16GB ÷ 80MB per process ≈ 150)
pm.start_servers = 30                         # Start with 30 processes
pm.min_spare_servers = 20                     # Min idle processes
pm.max_spare_servers = 50                     # Max idle processes
pm.max_requests = 1000                        # Recycle after 1000 requests
pm.process_idle_timeout = 30s                 # Kill idle processes after 30s
request_terminate_timeout = 300               # Request timeout
```

**Memory Calculation:**
```
Total RAM: 16GB
Reserve for OS/Docker: 4GB
Available for PHP-FPM: 12GB
Estimated memory per PHP process: ~80MB
Max children: 12GB ÷ 80MB = 150 processes
```

**Rationale:**
- **High opcache**: Caches compiled PHP code, reduces CPU usage
- **validate_timestamps=0**: Production optimization (no file modification checks)
- **Dynamic PM**: Scales processes based on load, saves memory
- **150 max_children**: Can handle 150 concurrent PHP requests

**Docker Compose Resource Limits:**
```yaml
deploy:
  resources:
    limits:
      cpus: '4'        # 4 cores per service
      memory: 6G       # 6GB per service
    reservations:
      cpus: '2'
      memory: 2G
```

---

### Nginx Configuration

**File:** `deployment/production/vm2-backend1/configs/nginx/nginx.conf`

```nginx
# Main Configuration
worker_processes 8;                           # 1 per CPU core
worker_cpu_affinity auto;                     # Bind workers to CPUs
worker_rlimit_nofile 65535;                   # Max open files

events {
    worker_connections 10000;                 # Max connections per worker
    use epoll;                                # Linux-optimized event model
    multi_accept on;                          # Accept multiple connections at once
}

http {
    # Performance Settings
    keepalive_timeout 75;
    keepalive_requests 1000;
    reset_timedout_connection on;
    client_body_timeout 30;
    send_timeout 30;

    # FastCGI Buffers (for PHP-FPM)
    fastcgi_buffers 256 16k;                  # 256 buffers of 16KB each
    fastcgi_buffer_size 128k;                 # Buffer for response headers
    fastcgi_connect_timeout 30s;
    fastcgi_send_timeout 180s;
    fastcgi_read_timeout 180s;
    fastcgi_busy_buffers_size 256k;

    # Upstream Keepalive
    upstream_keepalive_connections 32;        # Keep 32 connections to PHP-FPM
    upstream_keepalive_timeout 60s;
    upstream_keepalive_requests 100;
}
```

**Expected Performance:**
- **Max connections:** 80,000 (8 workers × 10,000)
- **Requests/sec:** 5,000-10,000 (PHP requests)
- **Latency:** <50ms (p50), <200ms (p95)

---

## 🚀 VM3 - Sister Service (Go) Tuning

**File:** `deployment/production/vm3-backend2/services/sister/docker-compose.yml`

```yaml
environment:
  # Database Connection Pool
  DB_MAX_OPEN_CONNS: 100                      # Max connections to SQL Server
  DB_MAX_IDLE_CONNS: 20                       # Idle connections kept alive
  DB_CONN_MAX_LIFETIME: 5m                    # Connection lifetime

  # Go Runtime Settings
  GOMAXPROCS: 8                               # Use all 8 CPU cores
  GOGC: 100                                   # Default GC target (100%)

deploy:
  resources:
    limits:
      cpus: '8'        # Use all 8 cores
      memory: 12G      # 12GB RAM
    reservations:
      cpus: '4'        # Guarantee 4 cores
      memory: 4G       # Guarantee 4GB RAM
```

**Rationale:**
- **GOMAXPROCS=8**: Utilizes all CPU cores for Go routines
- **High DB pool**: 100 connections to handle concurrent database queries
- **12GB RAM**: Go applications are memory-efficient, can handle many goroutines

**Expected Performance:**
- **Requests/sec:** 20,000+ (Go is very fast)
- **Latency:** <5ms (p50), <20ms (p95)
- **Concurrent requests:** 10,000+

---

## 🗄️ Infrastructure Services Tuning

### PostgreSQL (Kong Database)

**File:** `deployment/production/vm2-backend1/services/infrastructure/docker-compose.postgres.yml`

**Recommended additions** (add as environment variables):
```yaml
environment:
  POSTGRES_SHARED_BUFFERS: "4GB"              # 25% of RAM
  POSTGRES_EFFECTIVE_CACHE_SIZE: "12GB"       # 75% of RAM
  POSTGRES_MAX_CONNECTIONS: "200"             # Max client connections
  POSTGRES_WORK_MEM: "16MB"                   # Memory per query operation
  POSTGRES_MAINTENANCE_WORK_MEM: "512MB"      # Memory for maintenance operations
```

---

### Redis

**Recommended:** Add `maxmemory` and `maxmemory-policy`

```yaml
command: >
  redis-server
  --maxmemory 2gb
  --maxmemory-policy allkeys-lru
  --save ""
```

---

### Meilisearch

**Fix master key** (needs 16+ characters):
```bash
MEILISEARCH_KEY=masterKey1234567890ABCDEF  # 32 characters
```

---

## 🔄 Applying the Tuning

### Step 1: Rebuild Docker Images

**VM2 - Rebuild PHP services with new PHP-FPM config:**
```bash
# On VM2
cd /var/www/my-unila/deployment/production/vm2-backend1

# Rebuild Dashboard
docker compose --env-file .env -f services/dashboard/docker-compose.yml build --no-cache

# Rebuild Auth
docker compose --env-file .env -f services/auth/docker-compose.yml build --no-cache
```

### Step 2: Restart Services with New Configs

**VM1 - Restart Frontend & Kong:**
```bash
# On VM1
cd /var/www/my-unila/deployment/production/vm1-frontend-kong

# Restart Kong (picks up new env vars)
docker compose --env-file .env -f services/kong/docker-compose.yml down
docker compose --env-file .env -f services/kong/docker-compose.yml up -d

# Rebuild and restart Frontend
docker compose --env-file .env -f services/frontend/docker-compose.yml build --no-cache
docker compose --env-file .env -f services/frontend/docker-compose.yml up -d
```

**VM2 - Restart all services:**
```bash
# On VM2
cd /var/www/my-unila/deployment/production/vm2-backend1

# Restart Nginx (new config)
docker compose -f services/nginx/docker-compose.yml down
docker compose -f services/nginx/docker-compose.yml up -d

# Restart Dashboard
docker compose --env-file .env -f services/dashboard/docker-compose.yml down
docker compose --env-file .env -f services/dashboard/docker-compose.yml up -d

# Restart Auth
docker compose --env-file .env -f services/auth/docker-compose.yml down
docker compose --env-file .env -f services/auth/docker-compose.yml up -d
```

**VM3 - Restart Sister Service:**
```bash
# On VM3
cd /var/www/my-unila/deployment/production/vm3-backend2

docker compose --env-file ../../.env -f services/sister/docker-compose.yml down
docker compose --env-file ../../.env -f services/sister/docker-compose.yml up -d
```

---

## 📊 Monitoring & Validation

### Check Resource Usage

**VM1:**
```bash
# Kong stats
docker stats myunila-kong

# Frontend stats
docker stats myunila-frontend-service
```

**VM2:**
```bash
# All services
docker stats myunila-dashboard-service myunila-auth-service myunila-nginx
```

**VM3:**
```bash
docker stats myunila-sister-service
```

### Verify PHP-FPM Configuration

```bash
# On VM2
docker exec myunila-dashboard-service php-fpm -tt 2>&1 | grep "pm\."
docker exec myunila-dashboard-service php -i | grep opcache
```

### Test Performance

**Kong Gateway:**
```bash
# Simple load test
ab -n 10000 -c 100 http://192.168.120.41:9800/dashboard-service/api/health
```

**Expected results:**
- Requests per second: >5,000
- No 5xx errors
- CPU usage: 40-60% under load

---

## 🎯 Performance Targets

| Service | Requests/sec | Latency (p95) | CPU Usage | Memory Usage |
|---------|-------------|---------------|-----------|--------------|
| Kong Gateway | 10,000+ | <50ms | 60% | 4GB |
| Frontend | 5,000+ | <100ms | 50% | 6GB |
| Dashboard API | 2,000+ | <200ms | 70% | 5GB |
| Auth API | 3,000+ | <150ms | 60% | 4GB |
| Sister API | 10,000+ | <50ms | 40% | 8GB |

---

## ⚠️ Important Notes

1. **After rebuilding images**, old images will be left behind. Clean up with:
   ```bash
   docker image prune -f
   ```

2. **Monitor memory usage** closely after applying tuning. Adjust `pm.max_children` if needed:
   - If OOM (Out of Memory) errors: Reduce `pm.max_children`
   - If low memory usage: Can increase `pm.max_children`

3. **opcache.validate_timestamps=0** means PHP won't detect code changes automatically. After deploying new code:
   ```bash
   docker restart myunila-dashboard-service
   docker restart myunila-auth-service
   ```

4. **Database connection pool** (Sister Service): 100 connections might be too high if SQL Server has connection limits. Adjust based on SQL Server configuration.

---

## 📝 Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-12 | 1.0 | Initial tuning for 8 CPU / 16GB RAM production servers |

---

## 🔗 Related Documentation

- [Port Documentation](./PORTS-DOCUMENTATION.md)
- [Production Deployment Guide](./README.md)
- [Ansible Playbooks](./ansible/)

---

**Maintained by:** Development Team
**Last Updated:** 2025-11-12
