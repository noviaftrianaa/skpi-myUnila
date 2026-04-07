# MyUnila - Panduan Setup Local Development

## Prasyarat

- **Docker Desktop** (Windows/Mac) atau Docker Engine (Linux)
- **Git Bash** (Windows) atau terminal (Mac/Linux)
- **Node.js 18+** (jika pakai `npm run dev` untuk frontend)
- **Akses ke SQL Server** database (minta credential ke admin)

## Quick Start (Minimal - Tanpa Kong)

Cara tercepat untuk mulai development. Tidak butuh Kong atau PostgreSQL.

```bash
# 1. Copy dan isi .env
cd deployment/local
cp .env.example .env

# 2. Edit .env - isi 3 field WAJIB:
#    DB_MSSQL_HOST=<IP_SQL_SERVER>
#    DB_MSSQL_USERNAME=<USERNAME_ANDA>
#    DB_MSSQL_PASSWORD=<PASSWORD_ANDA>

# 3. Jalankan (default: frontend + auth + public)
bash deploy-minimal.sh

# 4. Akses
#    Frontend:     http://localhost:3000
#    Auth API:     http://localhost:8081
#    Public API:   http://localhost:8082
```

## Menjalankan Service Tambahan

```bash
# Pilih service yang dibutuhkan
bash deploy-minimal.sh auth public sister

# Semua service tanpa Kong
bash deploy-minimal.sh --all

# Backend saja, frontend via npm run dev
bash deploy-minimal.sh --no-frontend auth public

# Stop semua
bash deploy-minimal.sh --stop
```

## Frontend Development

### Opsi A: Docker (otomatis via deploy-minimal.sh)

Frontend di-build jadi Docker image. API URL sudah di-set otomatis ke port service langsung (tanpa Kong).

```bash
bash deploy-minimal.sh  # sudah termasuk frontend
```

### Opsi B: npm run dev (Hot Reload, lebih cepat)

```bash
# 1. Jalankan backend tanpa frontend Docker
bash deploy-minimal.sh --no-frontend auth public

# 2. Setup frontend
cd ../../frontend
cp .env.local.example .env.local   # sekali saja
npm install                         # sekali saja
npm run dev
```

Frontend bisa diakses di http://localhost:3000 dengan hot reload.

## Full Stack (Dengan Kong)

Hanya diperlukan jika Anda butuh API Gateway (JWT validation di gateway, routing terpusat).

**Prasyarat tambahan:**
- PostgreSQL terinstall di mesin lokal
- Buat database `kong_local`

```bash
# 1. Isi Kong credential di .env:
#    KONG_PG_PASSWORD=<POSTGRES_PASSWORD>

# 2. Jalankan full deploy
bash deploy.sh
# Pilih opsi 1 (Clean Rebuild) atau 2 (Quick Rebuild)

# 3. Setup Kong routes
bash deploy.sh
# Pilih opsi 30 (Setup Kong Routes)
```

## Tabel Service & Port

| Service | Port | Wajib? | Teknologi | Keterangan |
|---------|------|--------|-----------|------------|
| Redis | 6379 | Ya | Redis 7 | Cache & session (otomatis start) |
| Nginx | 8081/8082/8087 | Ya* | Nginx Alpine | Reverse proxy untuk Laravel services |
| Auth | 8081 | Ya | Laravel/PHP | Login, JWT, RBAC |
| Public | 8082 | Opsional | Laravel/PHP | Data publik, visualisasi |
| Frontend | 3000 | Ya | Next.js | Web UI |
| MeiliSearch | 7700 | Opsional | MeiliSearch | Search (hanya untuk public-service) |
| Sister | 8083 | Opsional | Go/Fiber | Integrasi SISTER API |
| Feeder | 8084 | Opsional | Go/Fiber | Integrasi Feeder PDDIKTI |
| API Service | 8085 | Opsional | Go/Fiber | OneData service |
| MyUnila | 8086 | Opsional | Go/Fiber | Integrasi SIKEP/Radius |
| Dashboard | 8087 | Opsional | Laravel/PHP | Dashboard API |
| Keuangan | 8088 | Opsional | Go/Fiber | Integrasi SIMPEDAM UKT/SPP |
| Kong | 9800 | Tidak | Kong 3.4 | API Gateway (optional) |

\* Nginx otomatis start jika ada Laravel service yang dipilih.

## Menjalankan Service Manual (Per Service)

```bash
cd deployment/local

# Start satu service
docker compose --env-file .env \
  -f services/3-backend/docker-compose.keuangan.yml up -d

# Stop satu service
docker compose --env-file .env \
  -f services/3-backend/docker-compose.keuangan.yml down

# Lihat logs
docker logs myunila-keuangan-service --tail 50 -f
```

## Troubleshooting

### Service gagal start / unhealthy

```bash
# Cek logs
docker logs <nama-container> --tail 100

# Contoh:
docker logs myunila-auth-service --tail 100
docker logs myunila-nginx --tail 50
```

### Database connection error

- Pastikan `DB_MSSQL_HOST` di `.env` benar
- Pastikan SQL Server accessible dari mesin Anda
- Test koneksi: `telnet <IP_SQL_SERVER> 1433`

### Nginx gagal start (volume not found)

Nginx membutuhkan volume dari auth-service dan public-service. Pastikan service tersebut sudah start duluan.

```bash
# Restart nginx
docker compose -f services/3-backend/docker-compose.nginx.yml up -d
```

### Frontend tidak bisa akses API (CORS error)

Jika pakai `npm run dev`, pastikan `.env.local` sudah di-copy dari `.env.local.example`.

### Port sudah dipakai

```bash
# Cek port yang dipakai
netstat -ano | grep :8081

# Stop container yang pakai port tersebut
docker stop myunila-auth-service
```

## Struktur Deployment

```
deployment/local/
├── .env                    # Credential (JANGAN di-commit)
├── .env.example            # Template .env
├── deploy.sh               # Full deployment (dengan Kong)
├── deploy-minimal.sh       # Minimal deployment (tanpa Kong)
├── scripts/
│   ├── clean-rebuild-all.sh
│   ├── quick-rebuild.sh
│   ├── quick-dev-rebuild.sh
│   ├── restart-services.sh
│   ├── dev-mode.sh
│   ├── go-hot-reload.sh
│   ├── frontend-hot-reload.sh
│   ├── setup-kong-routes.sh
│   └── create-new-service.sh
├── services/
│   ├── 1-infrastructure/   # Redis, MeiliSearch
│   ├── 2-gateway/          # Kong (optional)
│   ├── 3-backend/          # Semua backend services + Nginx
│   └── 4-frontend/         # Next.js frontend
└── configs/
    ├── nginx/              # Nginx config files
    └── kong/               # Kong UI config
```
