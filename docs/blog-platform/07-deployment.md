# Blog Platform myUnila — Deployment

---

## 1. VM Allocation

**vm9-blog** (baru, sesuai instruksi "VM sendiri saja").

| Spec | Value (initial, scale later) |
|---|---|
| OS | Ubuntu 24.04 LTS |
| CPU | 4 vCPU |
| RAM | 8 GB |
| Disk | 80 GB SSD (system) + 200 GB (data: postgres + minio mount) |
| Network | 192.168.120.49 (internal), public via Cloudflare proxy |
| Hostname | `vm9-blog.lan.unila.ac.id` |
| User | `myblog` (sudo, docker group) |

---

## 2. Port Allocation

Verified via `deployment/production/PORTS-DOCUMENTATION.md`. Avoid conflicts.

| Port | Service | Akses |
|---|---|---|
| **80** | Nginx HTTP (redirect 301 → 443) | Public |
| **443** | Nginx HTTPS (terminate SSL wildcard) | Public |
| **3002** | Next.js `frontend-blog` | localhost (behind nginx) |
| **8091** | Go `blog-service` | localhost (behind nginx) |
| **5432** | PostgreSQL 16 (DB `blog_unila`) | localhost only |
| **6379** | Redis (cache trending, session) | localhost only |
| **9100** | Node exporter (Prometheus scrape from vm4) | 192.168.120.0/24 |
| **22** | SSH | Admin IPs only |

External services (shared, di VM lain):
- **MinIO** — `vm5-staging:9000` atau dedicated MinIO server (TBD)
- **Meilisearch** — `192.168.120.42:7700` (vm2 existing)
- **Kong Gateway** — `192.168.120.41:9800` (vm1)

---

## 3. DNS

| Record | Type | Value |
|---|---|---|
| `blog.unila.ac.id` | A | 192.168.120.49 (VM9) — atau Cloudflare proxied |
| `*.blog.unila.ac.id` | A | 192.168.120.49 (wildcard) |
| `_acme-challenge.blog.unila.ac.id` | TXT | (managed by acme.sh DNS-01) |

**Open question #1:** Tim Infra Unila perlu konfigurasi DNS API token untuk auto-renew Let's Encrypt DNS-01.

---

## 4. SSL

**Let's Encrypt wildcard** via DNS-01 challenge (acme.sh).

```bash
# One-time setup di VM9
curl https://get.acme.sh | sh
acme.sh --register-account -m admin@unila.ac.id

# Set DNS API credentials (Cloudflare contoh)
export CF_Token="xxx"
export CF_Account_ID="xxx"

# Issue wildcard cert
acme.sh --issue --dns dns_cf \
    -d blog.unila.ac.id \
    -d '*.blog.unila.ac.id' \
    --keylength ec-256

# Install ke nginx
acme.sh --install-cert -d blog.unila.ac.id --ecc \
    --key-file /etc/nginx/ssl/blog.unila.ac.id.key \
    --fullchain-file /etc/nginx/ssl/blog.unila.ac.id.crt \
    --reloadcmd "systemctl reload nginx"

# Auto-renew (acme.sh sets cron otomatis)
```

---

## 5. Nginx Config

`deployment/production/vm9-blog/configs/nginx/nginx.conf`:

```nginx
worker_processes auto;
events { worker_connections 4096; }

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    sendfile on;
    keepalive_timeout 65;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Limit body for upload
    client_max_body_size 50M;

    # Logs
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" "$http_user_agent" '
                    'host=$host';
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Upstream
    upstream frontend_blog { server 127.0.0.1:3002 keepalive 32; }
    upstream blog_service  { server 127.0.0.1:8091 keepalive 32; }

    include /etc/nginx/conf.d/*.conf;
}
```

`deployment/production/vm9-blog/configs/nginx/conf.d/blog.conf`:

```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name blog.unila.ac.id *.blog.unila.ac.id;
    return 301 https://$host$request_uri;
}

# HTTPS — frontend (apex + tenant)
server {
    listen 443 ssl http2;
    server_name blog.unila.ac.id *.blog.unila.ac.id;

    ssl_certificate     /etc/nginx/ssl/blog.unila.ac.id.crt;
    ssl_certificate_key /etc/nginx/ssl/blog.unila.ac.id.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;

    location / {
        proxy_pass http://frontend_blog;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 60s;
    }

    # Static assets cache
    location /_next/static/ {
        proxy_pass http://frontend_blog;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# HTTPS — API (api.blog.unila.ac.id) — opsional, bisa juga tetap via Kong
server {
    listen 443 ssl http2;
    server_name api.blog.unila.ac.id;

    ssl_certificate     /etc/nginx/ssl/blog.unila.ac.id.crt;
    ssl_certificate_key /etc/nginx/ssl/blog.unila.ac.id.key;

    location / {
        proxy_pass http://blog_service;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

---

## 6. Docker Compose

`deployment/production/vm9-blog/docker-compose.yml`:

```yaml
version: "3.9"

services:
  postgres:
    image: postgres:16-alpine
    container_name: blog-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: blog_unila
      POSTGRES_USER: blog_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      TZ: Asia/Jakarta
    volumes:
      - blog_postgres_data:/var/lib/postgresql/data
      - ../../../data-model/script/postgresql/blog:/docker-entrypoint-initdb.d:ro
    ports:
      - "127.0.0.1:5432:5432"
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "blog_user", "-d", "blog_unila"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks: [blog-net]

  redis:
    image: redis:7-alpine
    container_name: blog-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - blog_redis_data:/data
    ports:
      - "127.0.0.1:6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
    networks: [blog-net]

  blog-service:
    build:
      context: ../../../backend/blog-service
      dockerfile: Dockerfile
    image: myunila-blog-service:latest
    container_name: myunila-blog-service
    restart: unless-stopped
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_healthy }
    environment:
      APP_ENV: production
      APP_PORT: ":8091"
      DB_HOST: postgres
      DB_PORT: "5432"
      DB_NAME: blog_unila
      DB_USER: blog_user
      DB_PASSWORD: ${POSTGRES_PASSWORD}
      REDIS_HOST: redis
      REDIS_PORT: "6379"
      JWT_SECRET: ${JWT_SECRET}
      MINIO_ENDPOINT: ${MINIO_ENDPOINT}
      MINIO_ACCESS_KEY: ${MINIO_ACCESS_KEY}
      MINIO_SECRET_KEY: ${MINIO_SECRET_KEY}
      MINIO_BUCKET: blog-media
      MEILI_HOST: ${MEILI_HOST}
      MEILI_API_KEY: ${MEILI_API_KEY}
      PDUT_DB_HOST: ${PDUT_DB_HOST}
      PDUT_DB_USER: ${PDUT_DB_USER}
      PDUT_DB_PASSWORD: ${PDUT_DB_PASSWORD}
      TZ: Asia/Jakarta
    ports:
      - "127.0.0.1:8091:8091"
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8091/health"]
      interval: 30s
      timeout: 5s
      retries: 3
    networks: [blog-net]

  frontend-blog:
    build:
      context: ../../../frontend-blog
      dockerfile: Dockerfile
    image: myunila-frontend-blog:latest
    container_name: myunila-frontend-blog
    restart: unless-stopped
    depends_on:
      blog-service: { condition: service_healthy }
    environment:
      NODE_ENV: production
      PORT: "3002"
      NEXT_PUBLIC_BLOG_API: https://api.blog.unila.ac.id
      NEXT_PUBLIC_MEILI_HOST: ${MEILI_HOST}
      NEXT_PUBLIC_MEILI_SEARCH_KEY: ${MEILI_SEARCH_KEY}
      REVALIDATE_SECRET: ${REVALIDATE_SECRET}
    ports:
      - "127.0.0.1:3002:3002"
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3002/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3
    networks: [blog-net]

  nginx:
    image: nginx:alpine
    container_name: blog-nginx
    restart: unless-stopped
    depends_on: [frontend-blog, blog-service]
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./configs/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./configs/nginx/conf.d:/etc/nginx/conf.d:ro
      - /etc/nginx/ssl:/etc/nginx/ssl:ro
      - blog_nginx_logs:/var/log/nginx
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
    networks: [blog-net]

volumes:
  blog_postgres_data:
  blog_redis_data:
  blog_nginx_logs:

networks:
  blog-net:
    driver: bridge
```

---

## 7. Environment Variables

`deployment/production/vm9-blog/.env.example`:

```bash
# Database
POSTGRES_PASSWORD=__set_in_production__

# JWT shared dengan auth-service MyUnila
JWT_SECRET=__same_as_auth_service__

# MinIO (object storage shared)
MINIO_ENDPOINT=https://minio.unila.ac.id
MINIO_ACCESS_KEY=__set__
MINIO_SECRET_KEY=__set__

# Meilisearch (shared di vm2)
MEILI_HOST=http://192.168.120.42:7700
MEILI_API_KEY=__admin_key__
MEILI_SEARCH_KEY=__public_search_only_key__

# pdut (cross-DB read-only)
PDUT_DB_HOST=192.168.123.119
PDUT_DB_USER=__readonly_user__
PDUT_DB_PASSWORD=__set__

# Webhook secret untuk revalidate ISR
REVALIDATE_SECRET=__random_64char__
```

---

## 8. Kong Gateway Setup

Tambah service & route di vm1 Kong Admin (`192.168.120.41:9801`).

`deployment/production/vm1-frontend-kong/scripts/setup-blog-service-route.sh`:

```bash
#!/bin/bash
set -e
KONG_ADMIN="${KONG_ADMIN:-http://localhost:9801}"

# Create service
curl -i -X POST $KONG_ADMIN/services/ \
  --data "name=blog-service" \
  --data "url=http://192.168.120.49:8091"

# Create route
curl -i -X POST $KONG_ADMIN/services/blog-service/routes \
  --data "name=blog-service-route" \
  --data "paths[]=/blog-service" \
  --data "strip_path=true"

# Enable JWT plugin
curl -i -X POST $KONG_ADMIN/services/blog-service/plugins \
  --data "name=jwt"

# Enable rate limiting
curl -i -X POST $KONG_ADMIN/services/blog-service/plugins \
  --data "name=rate-limiting" \
  --data "config.minute=600" \
  --data "config.policy=local"

# Enable CORS
curl -i -X POST $KONG_ADMIN/services/blog-service/plugins \
  --data "name=cors" \
  --data "config.origins=https://myunila.unila.ac.id" \
  --data "config.origins=https://*.unila.ac.id"

echo "✅ Blog service Kong route configured"
```

---

## 9. Local Development

### 9.1 `deployment/local/deploy.sh` — tambah menu

```
--- Blog Platform Service ---
50) Quick Rebuild - Blog Service Only
51) Quick Rebuild - Frontend Blog Only
52) Restart Blog Service
53) Restart Frontend Blog
54) Go Hot Reload - Blog Service
55) Frontend Blog Hot Reload (npm dev)
```

Implementasi script entries di `deployment/local/scripts/`:
- `quick-rebuild-blog-service.sh`
- `quick-rebuild-frontend-blog.sh`
- `restart-blog-service.sh`
- `restart-frontend-blog.sh`
- `go-hot-reload-blog.sh`
- `frontend-blog-hot-reload.sh`

### 9.2 `deployment/local/docker-compose.yml` — tambah service

```yaml
blog-postgres:
  image: postgres:16-alpine
  container_name: myunila-blog-postgres
  environment:
    POSTGRES_DB: blog_unila
    POSTGRES_USER: blog_user
    POSTGRES_PASSWORD: blogpass
  ports: ["5433:5432"]  # 5432 mungkin bentrok dgn local postgres
  volumes:
    - blog_pg_data:/var/lib/postgresql/data
    - ../../data-model/script/postgresql/blog:/docker-entrypoint-initdb.d:ro

blog-service:
  build:
    context: ../../backend/blog-service
  container_name: myunila-blog-service
  environment:
    DB_HOST: blog-postgres
    DB_PORT: "5432"
    # ... (mirror production .env)
  ports: ["8091:8091"]
  depends_on: [blog-postgres]

frontend-blog:
  build:
    context: ../../frontend-blog
  container_name: myunila-frontend-blog
  environment:
    NEXT_PUBLIC_BLOG_API: http://localhost:8091
    NEXT_PUBLIC_USE_MOCK: "true"  # mock data sampai backend ready
  ports: ["3002:3002"]
```

### 9.3 Local URL untuk test subdomain

Di `C:\Windows\System32\drivers\etc\hosts` (Windows) atau `/etc/hosts`:

```
127.0.0.1 blog.local
127.0.0.1 demo-mhs.blog.local
127.0.0.1 rektor-staf.blog.local
```

Akses: `http://blog.local:3002` (apex), `http://demo-mhs.blog.local:3002` (tenant).

Atau pakai query param fallback: `http://localhost:3002/?tenant=demo-mhs`.

---

## 10. CI/CD (Future)

Phase 1: manual deploy via Ansible playbook (sama dgn vm5-staging).

`deployment/production/ansible/playbooks/07-deploy-vm9-blog.yml` (skeleton):

```yaml
---
- name: Deploy Blog Platform to vm9-blog
  hosts: vm9_blog
  become: yes
  tasks:
    - name: Sync blog-service code
      synchronize:
        src: ../../../backend/blog-service/
        dest: /opt/myunila/blog-service/
        delete: yes
        rsync_opts:
          - "--exclude=.env"
          - "--exclude=node_modules"

    - name: Sync frontend-blog code
      synchronize:
        src: ../../../frontend-blog/
        dest: /opt/myunila/frontend-blog/

    - name: Sync deployment configs
      synchronize:
        src: ../../vm9-blog/
        dest: /opt/myunila/deployment/

    - name: Run docker-compose
      command: docker-compose -f /opt/myunila/deployment/docker-compose.yml up -d --build
```

Phase 2: GitHub Actions / GitLab CI dengan ansible-playbook trigger.

---

## 11. Monitoring

- **Prometheus** (vm4): scrape `192.168.120.49:8091/metrics` (P2 implement endpoint), `9100/metrics` (node)
- **Loki** (vm4): logs forward via Promtail di vm9-blog
- **Grafana**: dashboard `Blog Platform` — request rate, p95 latency, DB pool, Redis hit ratio, top errors
- **Alertmanager**: 5xx > 1%, p95 > 1s, DB conn saturation, disk > 80%

---

## 12. Backup

| Item | Cara | Frekuensi | Retention |
|---|---|---|---|
| `blog_unila` DB | `pg_dump` ke S3/MinIO | Daily 02:00 | 30 days |
| MinIO `blog-media` | Versioning enabled + lifecycle policy | Real-time + 7 days noncurrent | 90 days delete |
| Configs (nginx, .env) | Git (encrypted via SOPS) | Per change | Git history |
| Logs | Loki retention | 30 days |

---

## 13. Disaster Recovery

| Scenario | Recovery Steps | RTO | RPO |
|---|---|---|---|
| VM9 hardware fail | Restore from latest pg_dump + MinIO sync ke VM lain | < 4 jam | < 24 jam |
| DB corruption | Restore last good pg_dump | < 1 jam | < 24 jam |
| Code rollback | `git checkout` + `docker-compose up -d --build` | < 15 menit | 0 |
| SSL expired | acme.sh manual renew | < 30 menit | 0 |

---

## 14. Cost Estimate

| Item | Initial | Scale |
|---|---|---|
| VM9 (4vCPU/8GB) | (existing infra) | upgrade ke 8vCPU/16GB if 50k MAU |
| MinIO storage | 500GB allocated | scale to 5TB |
| Cloudflare Free | $0 | Cloudflare Pro $20/mo (open question #5) |
| Wildcard SSL | Free (Let's Encrypt) | Free |
| External libs | Open source (TipTap MIT, Meilisearch MIT) | Free |
| **Total external** | **~$0–20/mo** | **~$50–100/mo** |
