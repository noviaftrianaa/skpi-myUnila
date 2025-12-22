# myUnila Portal

Portal terpadu Universitas Lampung - Sistem Informasi terintegrasi berbasis microservices untuk manajemen akademik, kemahasiswaan, kepegawaian, dan layanan kampus.

## 📋 Daftar Isi

- [Arsitektur & Teknologi](#arsitektur--teknologi)
- [Prerequisites](#prerequisites)
- [Persiapan Awal](#persiapan-awal)
- [Cara Deploy di Local](#cara-deploy-di-local)
- [Development Workflow](#development-workflow)
- [Struktur Project](#struktur-project)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ Arsitektur & Teknologi

### Arsitektur Microservices

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                         │
│                    Next.js 15 + React 19                    │
│                  (Port: 3001 - Development)                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    API Gateway Layer                         │
│                Kong Gateway (Optional)                       │
│              Proxy: 9800 | Admin: 9801                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────┬──────────┬──────────┐
        ▼                  ▼          ▼          ▼          ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│Auth Service │  │Dashboard Svc│  │ Sister Svc  │  │Feeder Svc   │  │myUnila Svc  │
│Laravel 11   │  │Laravel 11   │  │Go + Fiber   │  │Go + Fiber   │  │Go + Fiber   │
│Port: 8081   │  │Port: 8082   │  │Port: 8083   │  │Port: 8084   │  │Port: 8085   │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │                │                │
       └────────────────┴────────────────┴────────────────┴────────────────┘
                                         │
                      ┌──────────────────┼──────────────────┐
                      ▼                  ▼                  ▼
                ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
                │     Redis     │  │  SQL Server   │  │  MeiliSearch  │
                │  Port: 6379   │  │  Port: 1433   │  │  Port: 7700   │
                │   (Cache &    │  │   (Primary    │  │  (Full-Text   │
                │    Session)   │  │   Database)   │  │    Search)    │
                └───────────────┘  └───────────────┘  └───────────────┘
```

### Tech Stack

#### Frontend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **Next.js** | 15.5.4 | React Framework (App Router) |
| **React** | 19.2.0 | UI Library |
| **TypeScript** | 5.x | Type Safety |
| **TailwindCSS** | 3.4.18 | Styling Framework |
| **Zustand** | 4.5.0 | State Management |
| **React Query** | 5.90.2 | Data Fetching & Caching |
| **Axios** | 1.12.2 | HTTP Client |
| **Framer Motion** | 12.23.22 | Animations |
| **HeroUI** | 2.8.5 | Component Library |
| **Heroicons** | 2.2.0 | Icon Set |
| **ECharts** | 5.6.0 | Data Visualization |
| **SweetAlert2** | 11.26.4 | Modal & Alerts |

#### Backend - Auth Service
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **Laravel** | 11.31 | PHP Framework |
| **PHP** | 8.2+ | Programming Language |
| **JWT** | 6.10 | Token Authentication |
| **Google 2FA** | 2.3 | Two-Factor Authentication |
| **Predis** | 2.2 | Redis Client |
| **Swagger** | Latest | API Documentation |

**Fitur Khusus:**
- JWT-based authentication
- SSO Unila integration
- Google 2FA (Multi-Factor Authentication)
- Role-Based Access Control (RBAC)
- Session management via Redis
- API documentation via Swagger

#### Backend - Dashboard Service
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **Laravel** | 11.31 | PHP Framework |
| **PHP** | 8.2+ | Programming Language |
| **Predis** | 2.2 | Redis Client |
| **MeiliSearch** | v1.5 | Full-Text Search Engine |

**Fitur Khusus:**
- Dashboard analytics & statistics
- Report generation
- Data visualization
- MeiliSearch integration untuk pencarian cepat

#### Backend - Sister Service (PDDIKTI Integration)
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **Go** | 1.22.6 | Programming Language |
| **Fiber** | 2.52.2 | Web Framework |
| **SQLX** | 1.4.0 | SQL Extensions |
| **go-mssqldb** | 1.7.2 | SQL Server Driver |
| **JWT** | 5.3.0 | Token Authentication |
| **Cron** | 3.0.1 | Scheduled Tasks |
| **Swagger** | 1.16.3 | API Documentation |

**Fitur Khusus:**
- Sinkronisasi data SISTER (PDDIKTI)
- Scheduled sync via cron jobs
- High-performance data processing
- REST API untuk integrasi data

#### Backend - Feeder Service (PDDikti Integration)
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **Go** | 1.23.3 | Programming Language |
| **Fiber** | 2.52.9 | Web Framework |
| **SQLX** | 1.4.0 | SQL Extensions |
| **go-mssqldb** | 1.9.4 | SQL Server Driver |
| **JWT** | 5.3.0 | Token Authentication |
| **Cron** | 3.0.1 | Scheduled Tasks |
| **Redis** | 8.11.5 | Cache Client |

**Fitur Khusus:**
- Sinkronisasi data Feeder PDDikti
- Data mahasiswa & nilai
- Scheduled synchronization via cron jobs
- High-performance data processing

#### Backend - myUnila Service (Legacy Apps Integration)
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **Go** | 1.21 | Programming Language |
| **Fiber** | 2.52.0 | Web Framework |
| **SQLX** | 1.3.5 | SQL Extensions |
| **go-mssqldb** | 1.6.0 | SQL Server Driver |
| **Cron** | 3.0.1 | Scheduled Tasks |

**Fitur Khusus:**
- Integrasi dengan aplikasi existing (SIAKADU, SIKEP, SIRANDU)
- Data aggregation & transformation
- Legacy system integration
- REST API untuk unified data access

#### Infrastructure
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **Docker** | Latest | Containerization |
| **Docker Compose** | Latest | Multi-container orchestration |
| **Redis** | 7-alpine | Cache & Session Store |
| **SQL Server** | 2019+ | Primary Database |
| **MeiliSearch** | v1.5 | Search Engine |
| **Nginx** | alpine | Web Server & Reverse Proxy |
| **Kong** | 3.4-alpine | API Gateway (Optional) |

---

## 🔧 Prerequisites

### Software yang Diperlukan

#### 1. Windows Environment
- **Laragon** (Recommended) atau XAMPP
- **Git for Windows** (Git Bash)
- **Docker Desktop for Windows**
  - Pastikan WSL 2 backend enabled
  - Minimum RAM: 8GB (Recommended: 16GB)

#### 2. Database Server
- **SQL Server 2019+**
  - Host: `192.168.123.119` (atau sesuai environment Anda)
  - Port: `1433`
  - Database: `pdut` (atau sesuai kebutuhan)
  - User dengan akses penuh untuk CREATE/ALTER tables

#### 3. Tools (Optional tapi Recommended)
- **VS Code** - Code editor
- **Postman** - API testing
- **DBeaver** atau **SQL Server Management Studio** - Database management
- **Redis Insight** - Redis GUI management

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 8 GB | 16 GB |
| CPU | 4 Cores | 8 Cores |
| Disk Space | 20 GB | 50 GB (SSD) |
| Docker Desktop | 4.0+ | Latest |
| Git | 2.30+ | Latest |

---

## 📦 Persiapan Awal

### 1. Clone Repository

```bash
git clone <repository-url>
cd my-unila
```

### 2. Setup Environment Variables

#### A. Backend Services

Setiap service memerlukan file `.env`. Copy dari `.env.example`:

```bash
# Auth Service
cd backend/auth-service
cp .env.example .env

# Edit .env dan sesuaikan:
# - APP_KEY (generate dengan: php artisan key:generate)
# - DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD
# - JWT_SECRET
# - Redis config
```

Ulangi untuk service lain:
- `backend/dashboard-service/.env`
- `backend/feeder-service/.env`
- `backend/sister-service/.env`
- `backend/myunila-service/.env`

#### B. Deployment Config

```bash
cd deployment/local
cp .env.example .env

# Edit deployment/local/.env:
# - Database credentials
# - JWT secrets
# - API keys
```

#### C. Frontend

```bash
cd frontend
cp .env.example .env.local

# Edit .env.local:
# - NEXT_PUBLIC_API_URL
# - Other frontend configs
```

### 3. Install Dependencies (Manual - untuk development)

#### Frontend
```bash
cd frontend
npm install
```

#### Backend Laravel Services (jika perlu development lokal)
```bash
cd backend/auth-service
composer install

cd ../dashboard-service
composer install

# Dst...
```

#### Go Services (Sister, Feeder, myUnila)
```bash
# Sister Service
cd backend/sister-service
go mod download

# Feeder Service
cd ../feeder-service
go mod download

# myUnila Service
cd ../myunila-service
go mod download
```

---

## 🚀 Cara Deploy di Local

### Metode 1: Menggunakan Deploy Script (Recommended)

Script `deploy.sh` menyediakan menu interaktif untuk berbagai operasi deployment.

#### Quick Start - Pertama Kali

```bash
cd deployment/local

# Jalankan deploy script
bash deploy.sh

# Pilih menu:
# 1) Clean Rebuild All - Untuk setup pertama kali
```

**Waktu yang dibutuhkan:** ~10-15 menit (pertama kali)

#### Menu Deploy Script

```
╔════════════════════════════════════════════════════════╗
║        MyUnila Local Deployment Helper            ║
╚════════════════════════════════════════════════════════╝

Pilih operasi:

  1) Clean Rebuild All (Hapus semua & rebuild)
  2) Quick Rebuild All Services
  3) Quick Rebuild - Dashboard Only
  4) Quick Rebuild - Auth Only
  5) Quick Rebuild - Sister Only
  6) Quick Rebuild - Feeder Only
  7) Quick Rebuild - MyUnila Only
  8) Quick Rebuild - Frontend Only
  9) Quick Rebuild - Nginx Only

  --- Quick Dev Rebuild (Dengan Cache, Lebih Cepat) ---
  22) Quick Dev Rebuild - All Laravel (auth + dashboard)
  23) Quick Dev Rebuild - Dashboard Only
  24) Quick Dev Rebuild - Auth Only

  10) Restart All Services
  11) Restart Dashboard Only
  12) Restart Auth Only
  13) Restart Sister Only
  14) Restart Feeder Only
  15) Restart MyUnila Only
  16) Restart Nginx Only

  17) Show Container Status
  18) Show Logs
  19) Test Endpoints
  20) Setup Kong Routes

  21) Cleanup Docker Resources

  --- Cache Management ---
  25) Clear All Cache (Redis + Laravel)
  26) Clear Redis Cache Only
  27) Clear Laravel Cache Only

  0) Exit
```

#### Workflow Umum

1. **Pertama kali setup:**
   ```bash
   bash deploy.sh
   # Pilih: 1 (Clean Rebuild All)
   ```

2. **Development harian:**
   ```bash
   bash deploy.sh
   # Pilih: 8 (Quick Rebuild Frontend) - jika edit frontend
   # Pilih: 23 (Quick Dev Rebuild Dashboard) - jika edit backend Laravel
   ```

3. **Restart service setelah edit .env:**
   ```bash
   bash deploy.sh
   # Pilih: 11 (Restart Dashboard Only)
   ```

4. **Lihat status:**
   ```bash
   bash deploy.sh
   # Pilih: 17 (Show Container Status)
   ```

5. **Clear cache:**
   ```bash
   bash deploy.sh
   # Pilih: 25 (Clear All Cache)
   ```

### Metode 2: Manual Docker Commands

Jika Anda ingin kontrol penuh:

#### Setup Pertama Kali

```bash
cd deployment/local

# 1. Create network (hanya sekali)
docker network create myunila-network

# 2. Build semua containers
docker-compose build

# 3. Start services
docker-compose up -d

# 4. Check status
docker ps --filter "name=myunila"
```

#### Development Commands

```bash
# Rebuild specific service
docker-compose build auth-service
docker-compose up -d auth-service

# Restart service
docker-compose restart dashboard-service

# View logs
docker logs -f myunila-auth-service

# Stop all
docker-compose down

# Clean rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Frontend Development (Terpisah dari Docker)

Untuk development yang lebih cepat, frontend bisa dijalankan di luar Docker:

```bash
cd frontend

# Install dependencies (sekali saja)
npm install

# Run development server
npm run dev

# Akses di: http://localhost:3001
```

**Keuntungan:**
- Hot reload lebih cepat
- Debugging lebih mudah
- Tidak perlu rebuild container setiap perubahan

**Backend tetap di Docker** untuk database, Redis, dan API services.

---

## 💻 Development Workflow

### Skenario 1: Edit Frontend (React/Next.js)

```bash
# 1. Edit code di frontend/src/
# 2. Jika frontend di Docker:
cd deployment/local
bash deploy.sh
# Pilih: 8 (Quick Rebuild Frontend)

# 3. Jika frontend lokal (npm run dev):
# Otomatis hot reload, tidak perlu rebuild
```

### Skenario 2: Edit Backend Laravel (Auth/Dashboard)

```bash
# 1. Edit code di backend/auth-service/ atau backend/dashboard-service/
# 2. Rebuild service:
cd deployment/local
bash deploy.sh
# Pilih: 23 (Quick Dev Rebuild Dashboard) atau 24 (Auth)

# 3. Clear Laravel cache jika perlu:
docker exec myunila-auth-service php artisan cache:clear
docker exec myunila-auth-service php artisan config:clear
```

### Skenario 3: Edit Backend Go (Sister/Feeder/myUnila Service)

```bash
# 1. Edit code di backend/sister-service/ atau backend/feeder-service/ atau backend/myunila-service/
# 2. Rebuild service:
cd deployment/local
bash deploy.sh
# Pilih: 5 (Quick Rebuild Sister) atau 6 (Feeder) atau 7 (myUnila)

# Note: Go services perlu rebuild setiap perubahan code (tidak seperti Laravel yang hot-reload)
```

### Skenario 4: Ubah .env Configuration

```bash
# 1. Edit .env file:
#    - deployment/local/.env (orchestration)
#    - backend/xxx-service/.env (service specific)

# 2. Restart service (NO rebuild needed):
cd deployment/local
bash deploy.sh
# Pilih: 10 (Restart All) atau specific service

# 3. Clear cache jika perlu:
# Pilih: 25 (Clear All Cache)
```

### Skenario 5: Clear Cache

```bash
# Via deploy script:
bash deploy.sh
# Pilih: 25 (Clear All Cache)

# Atau manual:
# Redis cache
docker exec myunila-redis redis-cli FLUSHALL

# Laravel cache (per service)
docker exec myunila-auth-service php artisan cache:clear
docker exec myunila-auth-service php artisan config:clear
docker exec myunila-auth-service php artisan route:clear
```

---

## 📂 Struktur Project

```
my-unila/
├── frontend/                          # Next.js 15 Frontend
│   ├── src/
│   │   ├── app/                      # App Router pages
│   │   │   ├── portal/               # Portal page
│   │   │   └── dashboard/            # Dashboard pages
│   │   ├── components/               # Reusable components
│   │   ├── contexts/                 # React contexts
│   │   ├── lib/                      # Utils & services
│   │   └── shared/                   # Shared components
│   ├── public/                       # Static files
│   ├── package.json
│   └── .env.local
│
├── backend/                          # Backend Microservices
│   ├── auth-service/                 # Laravel - Authentication
│   │   ├── app/
│   │   ├── database/
│   │   ├── routes/
│   │   ├── composer.json
│   │   ├── .env
│   │   └── Dockerfile
│   │
│   ├── dashboard-service/            # Laravel - Dashboard & Analytics
│   │   ├── app/
│   │   ├── database/
│   │   └── .env
│   │
│   ├── sister-service/               # Go - SISTER Integration
│   │   ├── cmd/
│   │   ├── internal/
│   │   ├── go.mod
│   │   ├── .env
│   │   └── Dockerfile
│   │
│   ├── feeder-service/               # Go - Feeder PDDikti
│   │   ├── cmd/
│   │   ├── internal/
│   │   ├── go.mod
│   │   ├── .env
│   │   └── Dockerfile
│   │
│   ├── myunila-service/              # Go - Apps Integration
│   │   ├── cmd/
│   │   ├── internal/
│   │   ├── go.mod
│   │   ├── .env
│   │   └── Dockerfile
│   │
│   ├── .env                          # Shared backend config (reference)
│   ├── .env.shared                   # Shared config template
│   └── docker-compose.yml            # Backend services orchestration
│
├── deployment/                       # Deployment Configs
│   ├── local/                        # Local development
│   │   ├── .env                      # Local environment config
│   │   ├── .env.example              # Environment template
│   │   ├── deploy.sh                 # Main deployment script ⭐
│   │   ├── scripts/                  # Helper scripts
│   │   │   ├── clean-rebuild-all.sh
│   │   │   ├── dev-quick-start.sh
│   │   │   ├── rebuild-service.sh
│   │   │   └── restart-service.sh
│   │   ├── configs/                  # Config files
│   │   │   └── nginx/
│   │   └── services/                 # Docker compose files
│   │       ├── 1-infrastructure/
│   │       ├── 2-gateway/
│   │       └── 3-backend/
│   │
│   ├── production/                   # Production deployment
│   │   ├── vm1-frontend-kong/
│   │   ├── vm2-backend1/
│   │   └── vm3-backend2/
│   │
│   └── testing-vm1/                  # Testing environment
│
└── README.md                         # This file
```

---

## 🌐 Endpoints & Ports

### Frontend
| Service | URL | Port | Keterangan |
|---------|-----|------|------------|
| Portal | http://localhost:3001 | 3001 | Landing page portal |
| Dashboard | http://localhost:3001/dashboard | 3001 | Admin dashboard |

### Backend Services (Direct Access)
| Service | URL | Port | Keterangan |
|---------|-----|------|------------|
| Auth Service | http://localhost:8081 | 8081 | Authentication API |
| Dashboard Service | http://localhost:8082 | 8082 | Dashboard API |
| Sister Service | http://localhost:8083 | 8083 | SISTER Integration |
| Feeder Service | http://localhost:8084 | 8084 | Feeder PDDikti |
| myUnila Service | http://localhost:8085 | 8085 | Apps Integration |

### Infrastructure
| Service | URL | Port | Keterangan |
|---------|-----|------|------------|
| Redis | localhost:6379 | 6379 | Cache & Session |
| MeiliSearch | http://localhost:7700 | 7700 | Search Engine |
| Kong Proxy (Optional) | http://localhost:9800 | 9800 | API Gateway |
| Kong Admin (Optional) | http://localhost:9801 | 9801 | Kong Admin API |
| Kong UI (Optional) | http://localhost:9803 | 9803 | Konga Dashboard |

### API Testing Examples

```bash
# Health check
curl http://localhost:8081/api/health

# Portal aplikasi list
curl http://localhost:8081/api/v1/portal/aplikasi

# Login
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Dashboard stats
curl http://localhost:8082/api/v1/unila/statistics \
  -H "Authorization: Bearer <token>"
```

---

## 🐛 Troubleshooting

### 1. Container Tidak Bisa Start

**Gejala:** Container exit atau status unhealthy

```bash
# Cek logs
docker logs myunila-auth-service

# Common issues:
# - Database connection failed → Check .env DB credentials
# - Port already in use → Change port or kill conflicting process
# - Permission denied → Run Docker as admin
```

**Solusi:**
```bash
# Restart container
docker restart myunila-auth-service

# Atau rebuild
cd deployment/local
bash deploy.sh
# Pilih: 4 (Quick Rebuild Auth)
```

### 2. Database Connection Error

**Gejala:** `SQLSTATE[HY000] Connection refused` atau `Cannot connect to SQL Server`

**Cek:**
1. SQL Server running?
   ```bash
   telnet 192.168.123.119 1433
   ```

2. Credentials benar di `.env`?
   ```bash
   DB_HOST=192.168.123.119
   DB_DATABASE=pdut
   DB_USERNAME=mizarzulmi
   DB_PASSWORD=YourPassword
   ```

3. Firewall blocking?
   - Allow port 1433 di Windows Firewall
   - Allow Docker IP di SQL Server

**Solusi:**
```bash
# Test connection dari container
docker exec myunila-auth-service php artisan tinker
# >>> DB::connection()->getPdo();

# Restart service setelah fix .env
bash deploy.sh
# Pilih: 12 (Restart Auth)
```

### 3. Frontend Tidak Bisa Load

**Gejala:** White screen, connection refused, atau CORS error

**Cek:**
1. Container running?
   ```bash
   docker ps | grep frontend
   ```

2. API URL benar di `.env.local`?
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8081
   ```

3. CORS configured di backend?
   ```php
   // backend/auth-service/config/cors.php
   'allowed_origins' => ['http://localhost:3001']
   ```

**Solusi:**
```bash
# Rebuild frontend
bash deploy.sh
# Pilih: 8 (Quick Rebuild Frontend)

# Atau run lokal untuk debugging:
cd frontend
npm run dev
```

### 4. Redis Connection Error

**Gejala:** `Connection refused to redis:6379`

**Solusi:**
```bash
# Check Redis container
docker ps | grep redis

# Restart Redis
docker restart myunila-redis

# Test connection
docker exec myunila-redis redis-cli ping
# Should return: PONG

# Clear Redis cache
docker exec myunila-redis redis-cli FLUSHALL
```

### 5. Port Already in Use

**Gejala:** `Bind for 0.0.0.0:3001 failed: port is already allocated`

**Solusi:**
```bash
# Windows - Find process using port
netstat -ano | findstr :3001

# Kill process
taskkill /PID <PID> /F

# Atau ubah port di .env
# FRONTEND_PORT=3002
```

### 6. Composer/NPM Install Error

**Gejala:** Package installation failed

**Solusi:**
```bash
# Rebuild dengan --no-cache
docker-compose build --no-cache auth-service

# Atau masuk ke container dan install manual
docker exec -it myunila-auth-service bash
composer install
composer update
```

### 7. Migration Error

**Gejala:** `Migration table not found` atau `Syntax error in migration`

**Solusi:**
```bash
# Fresh migrate (HATI-HATI: akan drop semua table)
docker exec myunila-auth-service php artisan migrate:fresh

# Atau migrate step by step
docker exec myunila-auth-service php artisan migrate:status
docker exec myunila-auth-service php artisan migrate --step
```

### 8. Cache Issue

**Gejala:** Config tidak berubah, route tidak update

**Solusi:**
```bash
# Via deploy script
bash deploy.sh
# Pilih: 25 (Clear All Cache)

# Manual
docker exec myunila-auth-service php artisan cache:clear
docker exec myunila-auth-service php artisan config:clear
docker exec myunila-auth-service php artisan route:clear
docker exec myunila-auth-service php artisan view:clear
```

### 9. Docker Disk Full

**Gejala:** `no space left on device`

**Solusi:**
```bash
# Clean unused images
docker system prune -a

# Remove all stopped containers
docker container prune

# Remove unused volumes
docker volume prune

# Via deploy script
bash deploy.sh
# Pilih: 21 (Cleanup Docker Resources)
```

### 10. Fresh Start (Nuclear Option)

Jika semua cara di atas gagal:

```bash
# Stop semua
docker-compose down -v

# Hapus semua container & images myunila
docker rm $(docker ps -aq --filter "name=myunila")
docker rmi $(docker images --filter "reference=myunila*" -q)

# Clean rebuild all
cd deployment/local
bash deploy.sh
# Pilih: 1 (Clean Rebuild All)
```

---

## 📚 Referensi

- **Laravel Documentation:** https://laravel.com/docs/11.x
- **Next.js Documentation:** https://nextjs.org/docs
- **Go Fiber Documentation:** https://docs.gofiber.io
- **Docker Documentation:** https://docs.docker.com
- **Redis Documentation:** https://redis.io/docs

---

## 📞 Support & Contribution

Untuk pertanyaan atau issue, silakan hubungi:
- **Team:** UPT TIK Universitas Lampung
- **Email:** dev@unila.ac.id

---

**Last Updated:** December 2025
**Version:** 1.0.0
