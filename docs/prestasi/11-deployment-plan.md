# Deployment Plan

Mirror pola SIMBAK secara langsung. Semua path, env var, dan volume diparallel dengan `myunila-simbak-staging`.

---

## Staging (VM5, dulu)

Deploy pertama kali ke VM5 untuk testing internal sebelum ke produksi.

### Path

```
deployment/production/vm5-staging/services/backend-php/docker-compose.si-prestasi.yml
```

### Struktur service (parallel docker-compose.simbak.yml)

```yaml
version: '3.8'

services:
  si-prestasi-service:
    build:
      context: ../../../../../backend/si-prestasi-service
      dockerfile: Dockerfile
      args:
        - APP_ENV=staging
    image: myunila/si-prestasi-service:staging
    container_name: myunila-si-prestasi-staging
    expose:
      - "9000"
    env_file:
      - ../../.env
    environment:
      APP_NAME: "${APP_NAME:-SI-Prestasi Service}"
      APP_ENV: staging
      APP_KEY: "${SI_PRESTASI_APP_KEY}"
      APP_DEBUG: "${APP_DEBUG:-true}"
      APP_URL: "${APP_URL}"
      APP_TIMEZONE: "${TIMEZONE:-Asia/Jakarta}"

      # PostgreSQL (si_prestasi — primary)
      DB_CONNECTION: pgsql
      DB_HOST: "${SI_PRESTASI_PG_HOST:-host.docker.internal}"
      DB_PORT: "${SI_PRESTASI_PG_PORT:-5432}"
      DB_DATABASE: "${SI_PRESTASI_PG_DATABASE:-si_prestasi}"
      DB_USERNAME: "${SI_PRESTASI_PG_USERNAME:-myunila_prestasi}"
      DB_PASSWORD: "${SI_PRESTASI_PG_PASSWORD}"

      # SQL Server (pdut — read only, same creds as simbak)
      SQLSRV_HOST: "${DB_MSSQL_HOST:-192.168.123.119}"
      SQLSRV_PORT: "${DB_MSSQL_PORT:-1433}"
      SQLSRV_DATABASE: "${API_DB_DATABASE:-pdut_staging}"
      SQLSRV_USERNAME: "${DB_MSSQL_USERNAME}"
      SQLSRV_PASSWORD: "${DB_MSSQL_PASSWORD}"
      SQLSRV_TRUST_SERVER_CERTIFICATE: "true"

      # JWT (validation only — shared secret dari auth-service)
      JWT_SECRET: "${JWT_SECRET}"
      JWT_ALGO: "${JWT_ALGORITHM:-HS256}"

      # Redis
      REDIS_HOST: "${REDIS_HOST}"
      REDIS_PORT: "${REDIS_PORT}"
      REDIS_PASSWORD: "${REDIS_PASSWORD}"
      CACHE_STORE: redis
      CACHE_PREFIX: prestasi_
      SESSION_DRIVER: redis
      QUEUE_CONNECTION: redis

      # SIMKATMAWA
      SIMKATMAWA_BASE_URL: "${SIMKATMAWA_BASE_URL:-https://simkatmawa.kemdiktisaintek.go.id}"
      SIMKATMAWA_EMAIL: "${SIMKATMAWA_EMAIL}"
      SIMKATMAWA_PASSWORD: "${SIMKATMAWA_PASSWORD}"
      SIMKATMAWA_KODE_PT: "${SIMKATMAWA_KODE_PT}"
      SIMKATMAWA_RATE_LIMIT_PER_MIN: "${SIMKATMAWA_RATE_LIMIT_PER_MIN:-30}"
      SIMKATMAWA_DRY_RUN: "${SIMKATMAWA_DRY_RUN:-true}"   # staging: default dry-run

      # File Storage (local volume default; switch ke minio kalau perlu)
      FILESYSTEM_DISK: "${SI_PRESTASI_FILESYSTEM_DISK:-siprestasi}"
      SIPRESTASI_STORAGE_PATH: "/data/siprestasi-storage"
      MINIO_ENDPOINT: "${MINIO_ENDPOINT:-http://192.168.120.47:9000}"
      MINIO_ACCESS_KEY: "${MINIO_ACCESS_KEY}"
      MINIO_SECRET_KEY: "${MINIO_SECRET_KEY}"
      MINIO_BUCKET: "${MINIO_BUCKET:-myunila-storage}"
      MINIO_USE_SSL: "false"

      # URL publik untuk dokumen (dikirim ke SIMKATMAWA sebagai url_*)
      PUBLIC_FILES_URL: "${SI_PRESTASI_PUBLIC_FILES_URL:-https://staging.unila.ac.id/prestasi-files}"

      TZ: "${TIMEZONE:-Asia/Jakarta}"

    volumes:
      - siprestasi-storage:/data/siprestasi-storage
    extra_hosts:
      - "host.docker.internal:host-gateway"
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.25'
          memory: 256M
    networks:
      - myunila-staging-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pgrep -f php-fpm || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "service=si-prestasi,vm=vm5-staging"

volumes:
  siprestasi-storage:
    driver: local
    name: siprestasi-storage

networks:
  myunila-staging-network:
    external: true
    name: myunila-staging-network
```

### Env di `.env` (VM5)

Tambah ke `deployment/production/vm5-staging/.env` (tidak commit):
```
# SI-Prestasi
SI_PRESTASI_APP_KEY=base64:...
SI_PRESTASI_PG_HOST=host.docker.internal
SI_PRESTASI_PG_DATABASE=si_prestasi
SI_PRESTASI_PG_USERNAME=myunila_prestasi
SI_PRESTASI_PG_PASSWORD=...
SI_PRESTASI_FILESYSTEM_DISK=siprestasi
SI_PRESTASI_PUBLIC_FILES_URL=https://staging.unila.ac.id/prestasi-files

# SIMKATMAWA (dry-run di staging — TIDAK kirim ke DIKTI)
SIMKATMAWA_BASE_URL=https://simkatmawa.kemdiktisaintek.go.id
SIMKATMAWA_EMAIL=...        # encrypted di-app; plain di env file aman karena env tidak commit
SIMKATMAWA_PASSWORD=...
SIMKATMAWA_KODE_PT=000000   # ISI nilai PT Unila
SIMKATMAWA_DRY_RUN=true     # STAGING: true selalu. Produksi: false setelah QA lulus.
SIMKATMAWA_RATE_LIMIT_PER_MIN=30
```

### Bootstrap PostgreSQL si_prestasi di VM5

```bash
# masuk ke postgres container (atau host postgres)
PGPASSWORD=<admin-pass> psql -U postgres -h localhost <<'SQL'
CREATE DATABASE si_prestasi;
CREATE USER myunila_prestasi WITH PASSWORD '<pass>';
GRANT ALL PRIVILEGES ON DATABASE si_prestasi TO myunila_prestasi;
SQL

# apply DDL (raw SQL dari data-model, bukan Laravel migration)
PGPASSWORD=<pass> psql -U myunila_prestasi -h localhost -d si_prestasi \
  -f /var/www/my-unila/data-model/script/postgresql/si_prestasi/si_prestasi_v1.0_fresh.sql

# apply seed referensi
PGPASSWORD=<pass> psql -U myunila_prestasi -h localhost -d si_prestasi \
  -f /var/www/my-unila/data-model/script/postgresql/si_prestasi/si_prestasi_v1.0_seed.sql
```

### Rebuild command

```bash
cd /var/www/my-unila/deployment/production/vm5-staging
./scripts/rebuild-service.sh si-prestasi   # (perlu tambah case di script)
```

Atau manual:
```bash
docker compose --env-file .env -f services/backend-php/docker-compose.si-prestasi.yml build --no-cache
docker compose --env-file .env -f services/backend-php/docker-compose.si-prestasi.yml up -d
```

---

## Produksi (VM8 bareng SIMBAK atau VM baru)

### Rekomendasi: bareng VM8 SIMBAK

Kenapa:
- Resource pattern sama (Laravel + pgsql + sqlsrv + redis + storage)
- Postgres instance bisa shared (beda database)
- Storage volume terpisah `siprestasi-storage`
- Kalau load naik, baru pisah ke VM sendiri (VM9)

### Path produksi

```
deployment/production/vm8-simbak/services/si-prestasi/docker-compose.yml
```

(Atau rename folder jadi `vm8-layanan-akademik/` supaya tidak terdengar eksklusif SIMBAK — optional.)

Compose identik dengan staging tapi:
- Tag image: `myunila/si-prestasi-service:production`
- `APP_ENV: production`, `APP_DEBUG: false`
- `SIMKATMAWA_DRY_RUN: false` (setelah QA)
- Resource limit naik (2 CPU / 2G) kalau perlu
- Healthcheck interval lebih rapat (15s)

### Kong route VM1

Tambah di `deployment/production/vm1-frontend-kong/scripts/setup-kong-routes.sh`:

```bash
# --- SI-Prestasi ---
curl -i -X POST http://localhost:9801/services/ \
  --data "name=si-prestasi-service" \
  --data "url=http://192.168.120.48:9002/api"   # port si-prestasi di VM8 (adjust)

curl -i -X POST http://localhost:9801/services/si-prestasi-service/routes \
  --data "paths[]=/si-prestasi-service" \
  --data "strip_path=true" \
  --data "name=si-prestasi-route"

# Tambah JWT plugin consumer sama seperti service lain
curl -i -X POST http://localhost:9801/services/si-prestasi-service/plugins \
  --data "name=jwt"
```

### Frontend env VM1

Tambah di `deployment/production/vm1-frontend-kong/services/frontend/docker-compose.yml`:

```yaml
- NEXT_PUBLIC_SI_PRESTASI_API_URL=${NEXT_PUBLIC_SI_PRESTASI_API_URL}
```

Dan di `.env` VM1:
```
NEXT_PUBLIC_SI_PRESTASI_API_URL=https://myunila.unila.ac.id/si-prestasi-service
```

Rebuild frontend VM1 setelah env tersedia:
```bash
./scripts/rebuild-service.sh frontend
```

---

## Rollout checklist

### Staging (VM5)

- [ ] Postgres database `si_prestasi` + user created
- [ ] DDL `si_prestasi_v1.0_fresh.sql` applied
- [ ] Laravel migrations sync (kalau ada seeder tambahan)
- [ ] RefPrestasiSeeder dijalankan
- [ ] `.env` VM5 diisi (termasuk SIMKATMAWA creds — atau mock/dry-run)
- [ ] Docker compose build + up
- [ ] Health check pass (`curl http://localhost:9000/api/health`)
- [ ] Test login SIMKATMAWA (dry-run mode)
- [ ] Frontend staging rebuild dengan NEXT_PUBLIC_SI_PRESTASI_API_URL
- [ ] E2E test: create draft → submit (dry-run) → lihat sync-log

### Produksi (VM8)

- [ ] QA staging selesai, sign-off dari ops
- [ ] `SIMKATMAWA_KODE_PT` produksi Unila dikonfirmasi dan diisi
- [ ] Credentials SIMKATMAWA produksi valid (test login ke staging SIMKATMAWA dulu kalau DIKTI menyediakan)
- [ ] Network firewall VM8 → simkatmawa.kemdiktisaintek.go.id:443 buka
- [ ] Postgres production database created
- [ ] DDL applied
- [ ] Frontend + Kong route di VM1 ditambah
- [ ] DNS untuk subdomain files (kalau pakai) sudah resolve
- [ ] TLS cert valid
- [ ] Monitoring scrape target ditambah di prometheus
- [ ] Grafana dashboard dibuat
- [ ] Alert rules Telegram diset
- [ ] `SIMKATMAWA_DRY_RUN=false` diset **terakhir**, setelah 1 QA run manual
- [ ] Ops book / runbook ditulis (lihat docs/prestasi/)

---

## Rollback

- Stop container: `docker compose -f services/si-prestasi/docker-compose.yml down` — data PostgreSQL dan volume file tetap.
- Disable Kong route: `curl -X PATCH http://localhost:9801/routes/si-prestasi-route --data "enabled=false"`.
- Kalau perlu revert schema: `php artisan migrate:rollback` (per migration) atau restore backup DB.
- **Data yang sudah dikirim ke SIMKATMAWA produksi** tidak bisa di-rollback dari sisi DIKTI (API tidak ada DELETE). Catat di log untuk kontak DIKTI manual kalau perlu.

---

## Observability

Scrape target tambah di prometheus (sama VM stack monitoring):
```
- job_name: 'si-prestasi-service'
  static_configs:
    - targets: ['192.168.120.48:9000']
      labels:
        service: si-prestasi
        env: production
```

Metrics yang diexport backend:
- `siprestasi_submissions_total{tipe,status}` counter
- `siprestasi_submit_duration_seconds{tipe}` histogram
- `siprestasi_queue_depth` gauge
- `siprestasi_http_requests_total` + standard Laravel metrics

Alert rules Telegram (pakai bot existing):
- submit failure > 5/10 menit → P2
- queue depth > 100 untuk > 5 menit → P2
- health endpoint down > 2 menit → P1
- Postgres connection error → P1
