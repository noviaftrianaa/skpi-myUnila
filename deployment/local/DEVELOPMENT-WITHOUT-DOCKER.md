# MyUnila - Panduan Development Tanpa Docker

Panduan ini untuk menjalankan service langsung di mesin lokal (Laragon/XAMPP/standalone)
tanpa Docker dan tanpa Kong.

## Prasyarat

| Software | Versi | Untuk |
|----------|-------|-------|
| PHP | 8.2+ | Laravel services (auth, public, dashboard) |
| Composer | 2.x | PHP dependency manager |
| Go | 1.23+ | Go services (sister, feeder, keuangan, myunila, api) |
| Node.js | 18+ | Frontend (Next.js) |
| Redis | 7+ | Cache & session (semua service) |

### PHP Extension Wajib (untuk SQL Server)

Laragon: buka `Menu > PHP > php.ini`, uncomment atau tambahkan:
```ini
extension=pdo_sqlsrv
extension=sqlsrv
```

Download driver dari: https://learn.microsoft.com/en-us/sql/connect/php/download-drivers-php-sql-server

### Install Redis

**Windows (Laragon):** `Menu > Tools > Quick Add > Redis`

**Windows (manual):** Download dari https://github.com/tporadowski/redis/releases

**Verifikasi:** `redis-cli ping` harus balas `PONG`

---

## Arsitektur (Tanpa Docker)

```
Browser (localhost:3000)
   │
   ├── Auth Service     (php artisan serve --port=8081)
   ├── Public Service   (php artisan serve --port=8082)
   ├── Sister Service   (go run cmd/api/main.go  → :8083)
   ├── Feeder Service   (go run cmd/api/main.go  → :8084)
   ├── API Service      (go run cmd/api/main.go  → :8085)
   ├── MyUnila Service  (go run cmd/api/main.go  → :8086)
   ├── Dashboard Service(php artisan serve --port=8087)
   └── Keuangan Service (go run cmd/api/main.go  → :8088)

Infrastruktur:
   ├── Redis            (localhost:6379)
   └── SQL Server       (192.168.x.x:1433)
```

**Tidak diperlukan:** Docker, Kong, Nginx, MeiliSearch (opsional)

---

## Quick Start

### 1. Setup .env untuk Setiap Service

Setiap service punya `.env.example`. Copy dan isi credential:

```bash
# Laravel services
cd backend/auth-service && cp .env.example .env
cd backend/public-service && cp .env.example .env
cd backend/dashboard-service && cp .env.example .env

# Go services
cd backend/keuangan-service && cp .env.example .env
cd backend/sister-service && cp .env.example .env
cd backend/feeder-service && cp .env.example .env
cd backend/api-service && cp .env.example .env
cd backend/myunila-service && cp .env.example .env

# Frontend
cd frontend && cp .env.local.example .env.local
```

**Yang WAJIB diisi di setiap .env:**
- `DB_HOST` = IP SQL Server
- `DB_USERNAME` = username database Anda
- `DB_PASSWORD` = password database Anda
- `REDIS_HOST` = `127.0.0.1` (bukan `redis`, karena tanpa Docker)

### 2. Jalankan Service yang Dibutuhkan

Buka terminal terpisah untuk setiap service.

---

## Laravel Services

### Auth Service (Port 8081) - WAJIB

```bash
cd backend/auth-service
composer install                     # sekali saja
php artisan key:generate             # sekali saja
php artisan serve --port=8081
```

### Public Service (Port 8082)

```bash
cd backend/public-service
composer install
php artisan key:generate
php artisan serve --port=8082
```

### Dashboard Service (Port 8087)

```bash
cd backend/dashboard-service
composer install
php artisan key:generate
php artisan serve --port=8087
```

### Catatan Penting untuk Laravel

- **REDIS_HOST harus `127.0.0.1`** (bukan `redis` yang untuk Docker)
- **DB_TRUST_SERVER_CERTIFICATE=yes** jika pakai ODBC Driver 18
- Jalankan `php artisan optimize:clear` jika ada error setelah ubah .env
- Queue worker (opsional): `php artisan queue:work redis --tries=3`

---

## Go Services

### Opsi A: go run (langsung)

```bash
# Keuangan Service (port 8088)
cd backend/keuangan-service
go run cmd/api/main.go

# Sister Service (port 8083)
cd backend/sister-service
go run cmd/api/main.go

# Feeder Service (port 8084)
cd backend/feeder-service
go run cmd/api/main.go

# API Service (port 8085)
cd backend/api-service
go run cmd/api/main.go

# MyUnila Service (port 8086)
cd backend/myunila-service
go run cmd/api/main.go
```

### Opsi B: air (hot reload - otomatis rebuild saat file berubah)

Install air sekali:
```bash
go install github.com/air-verse/air@latest
```

Jalankan:
```bash
cd backend/keuangan-service && air
cd backend/sister-service && air
# dll.
```

Setiap service sudah punya `.air.toml` yang terkonfigurasi.

### Catatan Penting untuk Go

- **REDIS_HOST harus `127.0.0.1`** (bukan `redis`)
- Port sudah di-set di `.env` masing-masing (contoh: `APP_PORT=:8088`)
- `go mod download` otomatis jalan saat pertama kali `go run`

---

## Frontend (Port 3000)

```bash
cd frontend
cp .env.local.example .env.local     # sekali saja
npm install                           # sekali saja
npm run dev
```

Buka http://localhost:3000

File `.env.local.example` sudah di-set untuk mode tanpa Kong:
```env
NEXT_PUBLIC_AUTH_API_URL=http://localhost:8081/api/v1
NEXT_PUBLIC_PUBLIC_API_URL=http://localhost:8082/api/v1
NEXT_PUBLIC_SISTER_API_URL=http://localhost:8083
...
```

---

## Tabel Service & Port

| Service | Port | Bahasa | Command | Wajib? |
|---------|------|--------|---------|--------|
| Redis | 6379 | - | `redis-server` | Ya |
| Auth | 8081 | PHP | `php artisan serve --port=8081` | Ya |
| Public | 8082 | PHP | `php artisan serve --port=8082` | Opsional |
| Sister | 8083 | Go | `go run cmd/api/main.go` | Opsional |
| Feeder | 8084 | Go | `go run cmd/api/main.go` | Opsional |
| API | 8085 | Go | `go run cmd/api/main.go` | Opsional |
| MyUnila | 8086 | Go | `go run cmd/api/main.go` | Opsional |
| Dashboard | 8087 | PHP | `php artisan serve --port=8087` | Opsional |
| Keuangan | 8088 | Go | `go run cmd/api/main.go` | Opsional |
| Frontend | 3000 | Node | `npm run dev` | Ya |

**Minimum untuk mulai:** Redis + Auth + Frontend

---

## Contoh: Tim Hanya Butuh Auth + Frontend

**Terminal 1 - Redis:**
```bash
redis-server
```

**Terminal 2 - Auth Service:**
```bash
cd backend/auth-service
composer install
php artisan serve --port=8081
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

Selesai! Buka http://localhost:3000

---

## Contoh: Tim Butuh Auth + Public + Keuangan + Frontend

**Terminal 1:** `redis-server`
**Terminal 2:** `cd backend/auth-service && php artisan serve --port=8081`
**Terminal 3:** `cd backend/public-service && php artisan serve --port=8082`
**Terminal 4:** `cd backend/keuangan-service && go run cmd/api/main.go`
**Terminal 5:** `cd frontend && npm run dev`

---

## Troubleshooting

### PHP: "could not find driver" (SQL Server)

Extension `pdo_sqlsrv` belum aktif. Cek:
```bash
php -m | grep sqlsrv
```

Jika kosong, download driver PHP SQL Server dan aktifkan di `php.ini`:
```ini
extension=pdo_sqlsrv
extension=sqlsrv
```

### PHP: "Connection refused" ke database

- Pastikan SQL Server TCP/IP enabled di port 1433
- Cek IP: `telnet <IP_SQL_SERVER> 1433`
- Pastikan firewall tidak block

### Go: "connection refused" ke Redis

- Pastikan Redis jalan: `redis-cli ping`
- Pastikan `.env` pakai `REDIS_HOST=127.0.0.1` (bukan `redis`)

### Frontend: API calls gagal (CORS)

`php artisan serve` sudah handle CORS via Laravel middleware.
Pastikan URL di `frontend/.env.local` sesuai port service yang jalan.

### Port sudah dipakai

```bash
# Windows
netstat -ano | findstr :8081

# Linux/Mac
lsof -i :8081
```

### Laravel: "Class not found" atau error setelah pull

```bash
composer install
php artisan optimize:clear
```
