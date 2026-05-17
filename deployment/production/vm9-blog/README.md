# vm9-blog — Blog Platform Production Deployment

VM dedicated untuk Blog Platform myUnila (`blog.unila.ac.id` + `*.blog.unila.ac.id`).

## Spesifikasi VM

| | |
|---|---|
| Hostname | vm9-blog.lan.unila.ac.id |
| IP | 192.168.120.49 |
| OS | Ubuntu 24.04 LTS |
| CPU | 4 vCPU (initial) |
| RAM | 8 GB (initial) |
| Disk | 80 GB (system) + 200 GB (data) |
| User | myblog (sudo, docker group) |

## Stack di VM ini

| Service | Port | Image |
|---|---|---|
| Nginx | 80 / 443 | nginx:alpine |
| Frontend-blog (Next.js) | 127.0.0.1:3002 | myunila-frontend-blog:latest |
| Blog-service (Go) | 127.0.0.1:8091 | myunila-blog-service:latest *(deferred — BE belum scaffold)* |
| PostgreSQL 16 | 127.0.0.1:5432 | postgres:16-alpine |
| Redis | 127.0.0.1:6379 | redis:7-alpine |

External (di VM lain):
- MinIO (shared): vm5 atau dedicated MinIO
- Meilisearch (shared): vm2 192.168.120.42:7700
- Kong Gateway: vm1 192.168.120.41:9800

## DNS Setup (one-time, via tim infra)

```
A     blog.unila.ac.id      → 192.168.120.49 (atau Cloudflare proxied)
A     *.blog.unila.ac.id    → 192.168.120.49 (wildcard)
A     api.blog.unila.ac.id  → 192.168.120.49 (kalau pakai subdomain api terpisah)
```

## SSL Wildcard (Let's Encrypt DNS-01)

```bash
# Install acme.sh (one-time)
curl https://get.acme.sh | sh
acme.sh --register-account -m admin@unila.ac.id

# Set DNS API token (Cloudflare contoh)
export CF_Token="xxx"
export CF_Account_ID="xxx"

# Issue wildcard cert
acme.sh --issue --dns dns_cf \
    -d blog.unila.ac.id \
    -d '*.blog.unila.ac.id' \
    --keylength ec-256

# Install ke /etc/nginx/ssl/
sudo mkdir -p /etc/nginx/ssl
acme.sh --install-cert -d blog.unila.ac.id --ecc \
    --key-file /etc/nginx/ssl/blog.unila.ac.id.key \
    --fullchain-file /etc/nginx/ssl/blog.unila.ac.id.crt \
    --reloadcmd "docker compose restart nginx"
```

## Deploy Steps

### 1. Initial setup (one-time)

```bash
# Clone monorepo
git clone <repo-url> /opt/myunila/my-unila
cd /opt/myunila/my-unila/deployment/production/vm9-blog

# Setup .env
cp .env.example .env
# Edit values production
vim .env

# Setup SSL (lihat di atas)
```

### 2. Deploy

```bash
docker compose pull
docker compose build
docker compose up -d
```

### 3. Verify

```bash
docker compose ps
docker compose logs -f frontend-blog
curl -I https://blog.unila.ac.id
curl -I https://demo-mhs.blog.unila.ac.id
```

## Port Allocation (verified, no conflict)

| Port | Pakai | Status di MyUnila ecosystem |
|---|---|---|
| 80 / 443 | Nginx HTTP/HTTPS | Standard |
| 3002 | Next.js frontend-blog | Free (3000=main FE, 3001=Grafana) |
| 8091 | Go blog-service | Free (8090=man-konten, 8095=project) |
| 5432 | PostgreSQL local | Bind localhost only |
| 6379 | Redis local | Bind localhost only |

⚠️ **9090 dipakai Prometheus** di vm4 — JANGAN dipakai di sini.

## Backup

```bash
# DB
docker exec blog-postgres pg_dump -U blog_user blog_unila | gzip > /backup/blog_unila_$(date +%F).sql.gz

# Sync ke S3/MinIO daily via cron
```

## Reference Docs

- `docs/blog-platform/00-overview.md` — Decision log
- `docs/blog-platform/02-database-schema.md` — Schema PostgreSQL
- `docs/blog-platform/04-architecture.md` — System architecture
- `docs/blog-platform/07-deployment.md` — Detail deployment + Kong + DNS
