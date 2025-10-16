# myUnila Backend Services

Microservices architecture untuk backend Portal myUnila - Sistem informasi terintegrasi Universitas Lampung yang menghubungkan 70+ aplikasi dalam satu ekosistem.

![Laravel](https://img.shields.io/badge/Laravel-11.31-FF2D20?logo=laravel)
![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?logo=php)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)
![Kong](https://img.shields.io/badge/Kong-3.4-003459?logo=kong)

## 📋 Daftar Isi

- [Arsitektur](#-arsitektur)
- [Tech Stack](#-tech-stack)
- [Services](#-services)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Cara Menjalankan](#-cara-menjalankan)
- [API Gateway (Kong)](#-api-gateway-kong)
- [Database Configuration](#-database-configuration)
- [Monitoring](#-monitoring)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)

---

## 🏗 Arsitektur

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
│                   http://localhost:3000                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP Requests
                     ↓
┌─────────────────────────────────────────────────────────┐
│              Kong API Gateway (Port 9800)               │
│            ┌─────────────────────────────┐              │
│            │   JWT Authentication        │              │
│            │   Rate Limiting             │              │
│            │   CORS Handling             │              │
│            │   Request Routing           │              │
│            └─────────────────────────────┘              │
└──────┬──────────────────┬──────────────────┬───────────┘
       │                  │                  │
       │                  │                  │
   ┌───▼────┐       ┌────▼─────┐      ┌────▼─────┐
   │ Auth   │       │Dashboard │      │  Other   │
   │Service │       │ Service  │      │ Services │
   │Port    │       │Port      │      │  ...     │
   │8081    │       │8082      │      │          │
   └───┬────┘       └────┬─────┘      └────┬─────┘
       │                 │                  │
       └─────────────────┼──────────────────┘
                         │
                         │ External Databases
                         │
            ┌────────────┴────────────┐
            │                         │
    ┌───────▼────────┐      ┌────────▼──────┐
    │  SQL Server    │      │  PostgreSQL   │
    │  (External)    │      │  (External)   │
    │  Port 1433     │      │  Port 5432    │
    └────────────────┘      └───────────────┘
            │
            │ Shared Infrastructure
            │
    ┌───────▼────────┐
    │     Redis      │
    │  Cache/Queue   │
    │  Port 6379     │
    └────────────────┘
```

### Alur Request:

1. **Frontend** → Kirim request ke Kong Gateway (`:9800`)
2. **Kong Gateway** → Validasi JWT, routing ke service yang tepat
3. **Service** (auth/dashboard) → Process request, akses database
4. **Database** → SQL Server (eksternal) untuk data persistence
5. **Redis** → Caching & queue management

---

## 🚀 Tech Stack

### Core Framework
- **Laravel** `11.31` - PHP framework dengan modern architecture
- **PHP** `8.2+` - Latest PHP features & performance

### API Gateway
- **Kong Gateway** `3.4` - Cloud-native API Gateway
- **Konga** - Kong admin GUI untuk management
- **PostgreSQL** `15` - Kong database

### Infrastructure
- **Docker** & **Docker Compose** - Containerization
- **Nginx** `alpine` - Web server & reverse proxy
- **Redis** `7-alpine` - Cache & queue backend

### Database Drivers
- **SQL Server PDO** - Primary database (Microsoft SQL Server)
- **PostgreSQL** - Kong Gateway database

### Security & Auth
- **Firebase JWT** `^6.10` - JSON Web Token authentication
- **Laravel Sanctum** - API token authentication
- **Google2FA** `^2.3` - Two-factor authentication (MFA)
- **Kong JWT Plugin** - Gateway-level auth

### API Documentation
- **L5-Swagger** - OpenAPI/Swagger documentation generator
- **Postman Collections** - Pre-configured API testing

### Development Tools
- **Laravel Pint** - Code style fixer
- **Laravel Pail** - Real-time log viewer
- **PHPUnit** `^11.0` - Unit & feature testing

---

## 🎯 Services

### 1. **Auth Service** (Port 8081)
**Responsibility**: Authentication & Authorization

**Features**:
- ✅ JWT-based authentication
- ✅ Login/Logout/Refresh Token
- ✅ SSO Unila integration
- ✅ Multi-Factor Authentication (MFA/2FA)
- ✅ Password management
- ✅ Session management
- ✅ User verification

**Endpoints**:
```
GET  /api/v1/health           - Health check
POST /api/v1/auth/login       - Login
POST /api/v1/auth/logout      - Logout
POST /api/v1/auth/refresh     - Refresh token
GET  /api/v1/auth/me          - Get user info
POST /api/v1/auth/verify      - Verify token
POST /api/v1/auth/sso/login   - SSO login
```

**Database**: SQL Server (auth_db)

**Tech Stack**:
- Laravel 11.31
- Firebase JWT
- Google2FA (MFA)
- Redis (sessions)

---

### 2. **Dashboard Service** (Port 8082)
**Responsibility**: User dashboard & application catalog

**Features**:
- ✅ User dashboard data
- ✅ 70+ Application catalog
- ✅ Favorite applications
- ✅ Announcements management
- ✅ Statistics & analytics
- ✅ Profile management
- ✅ Role-based access

**Endpoints**:
```
GET  /api/v1/health            - Health check
GET  /api/v1/dashboard         - Dashboard data
GET  /api/v1/applications      - List applications
POST /api/v1/favorites         - Add favorite
GET  /api/v1/announcements     - List announcements
GET  /api/v1/statistics        - Get statistics
```

**Database**: SQL Server (dashboard_db)

**Tech Stack**:
- Laravel 11.31
- JWT Authentication
- Redis (caching)

---

### 3. **Kong API Gateway** (Port 9800)
**Responsibility**: API Gateway & Traffic Management

**Features**:
- ✅ Request routing to microservices
- ✅ JWT authentication verification
- ✅ Rate limiting (100 req/minute)
- ✅ CORS handling
- ✅ Request/Response transformation
- ✅ Load balancing
- ✅ Health checking
- ✅ Logging & monitoring

**Admin Ports**:
- `9800` - Proxy (API Gateway)
- `9801` - Admin API
- `9802` - Kong Manager GUI
- `9803` - Konga Admin Panel

**Routes Configuration**:
```
/auth-service/*      → auth-service:8081
/dashboard-service/* → dashboard-service:8082
```

---

### 4. **Infrastructure Services**

#### Redis (Port 6379)
- Session storage
- Cache management
- Queue backend
- Rate limiting data

#### Nginx (Ports 8081-8082)
- Reverse proxy untuk services
- Static file serving
- Load balancing
- SSL termination (production)

---

## 📦 Prerequisites

### Required
- **Docker Desktop** (Latest version) - [Download](https://www.docker.com/products/docker-desktop)
- **Docker Compose** v2.0+ (included with Docker Desktop)
- **Git** - [Download](https://git-scm.com/downloads)

### External Services (Must be running)
- **SQL Server** - Primary database
  - Host: `localhost` or `host.docker.internal`
  - Port: `1433`
  - Databases: `auth_db`, `dashboard_db`
- **PostgreSQL** (Optional) - For Kong Gateway
  - Host: `localhost`
  - Port: `5432`
  - Databases: `kong`, `konga`

### System Requirements
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: 10GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux

### Ports yang Dibutuhkan
Pastikan ports berikut tersedia:
- `6379` - Redis
- `8081` - Auth Service (Nginx)
- `8082` - Dashboard Service (Nginx)
- `9800` - Kong Proxy (API Gateway)
- `9801` - Kong Admin API
- `9802` - Kong Manager
- `9803` - Konga Admin Panel

---

## ⚡ Quick Start

### 1. Clone Repository

```bash
git clone https://bitbucket.org/mahendraunila/my-unila.git
cd my-unila/backend
```

### 2. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file dengan database credentials Anda
# IMPORTANT: Set DB_SQLSRV_PASSWORD dan connection details
```

### 3. Generate App Keys & JWT Secrets

```bash
# Auth Service
cd auth-service
php artisan key:generate
cd ..

# Dashboard Service
cd dashboard-service
php artisan key:generate
cd ..

# Generate JWT Secret
openssl rand -base64 32
# Copy output ke JWT_SECRET di .env
```

### 4. Setup Database

Pastikan SQL Server sudah running, lalu create databases:

```sql
-- Run di SQL Server Management Studio atau Azure Data Studio
CREATE DATABASE auth_db;
CREATE DATABASE dashboard_db;
GO
```

### 5. Start All Services (One Command)

#### Windows:
```batch
start-all.bat
```

#### Linux/Mac/Git Bash:
```bash
chmod +x start-all.sh
./start-all.sh
```

Script akan otomatis:
- ✅ Check Docker running
- ✅ Start Redis
- ✅ Start Auth Service
- ✅ Start Dashboard Service
- ✅ Start Nginx
- ✅ Start Kong Gateway + PostgreSQL
- ✅ Configure Kong routes
- ✅ Run database migrations
- ✅ Test all endpoints

### 6. Verify Installation

Buka browser dan akses:
- **Kong Gateway**: http://localhost:9800/auth-service/api/v1/health
- **Auth Service**: http://localhost:8081/api/v1/health
- **Dashboard Service**: http://localhost:8082/api/v1/health
- **Kong Manager**: http://localhost:9802
- **Konga Admin**: http://localhost:9803

Expected response:
```json
{
  "status": "ok",
  "service": "auth-service",
  "timestamp": "2025-10-16T12:00:00.000000Z"
}
```

---

## ⚙️ Konfigurasi Environment

### Backend Root `.env`

```bash
# =============================================
# Application Environment
# =============================================
APP_ENV=local
APP_DEBUG=true

# =============================================
# SQL Server Database Configuration
# =============================================
DB_SQLSRV_HOST=host.docker.internal    # Use localhost jika local
DB_SQLSRV_PORT=1433
DB_AUTH_DATABASE=auth_db
DB_DASHBOARD_DATABASE=dashboard_db
DB_SQLSRV_USERNAME=sa
DB_SQLSRV_PASSWORD=YourStrong@Passw0rd

# =============================================
# JWT Configuration
# =============================================
JWT_SECRET=your_generated_jwt_secret_here
JWT_TTL=60                              # Token TTL (minutes)
JWT_REFRESH_TTL=10080                   # Refresh token TTL (7 days)

# =============================================
# Redis Configuration
# =============================================
REDIS_HOST=redis                         # Use 'redis' in Docker, 'localhost' local
REDIS_PORT=6379
REDIS_PASSWORD=null

# =============================================
# SSO Unila Configuration (Optional)
# =============================================
SSO_UNILA_BASE_URL=https://akses.unila.ac.id
SSO_UNILA_APP_KEY=
SSO_UNILA_JWT_SECRET=
SSO_UNILA_CALLBACK_URL=http://localhost:9800/auth-service/api/v1/auth/sso/callback

# =============================================
# Kong Gateway (Optional - for Kong setup)
# =============================================
DB_PGSQL_HOST=host.docker.internal
DB_PGSQL_PORT=5432
DB_PGSQL_USERNAME=postgres
DB_PGSQL_PASSWORD=postgres
DB_KONG_DATABASE=kong
DB_KONGA_DATABASE=konga
```

### Service-Specific `.env`

Setiap service memiliki `.env` sendiri di folder masing-masing:

#### `auth-service/.env`:
```bash
APP_NAME="MyUnila Auth Service"
APP_URL=http://localhost:8081

DB_CONNECTION=sqlsrv
DB_HOST=host.docker.internal
DB_PORT=1433
DB_DATABASE=auth_db
DB_USERNAME=sa
DB_PASSWORD=YourStrong@Passw0rd

CACHE_STORE=redis
REDIS_HOST=redis
REDIS_PORT=6379

JWT_SECRET=same_as_root_env
JWT_TTL=60
```

#### `dashboard-service/.env`:
```bash
APP_NAME="MyUnila Dashboard Service"
APP_URL=http://localhost:8082

DB_CONNECTION=sqlsrv
DB_HOST=host.docker.internal
DB_PORT=1433
DB_DATABASE=dashboard_db
DB_USERNAME=sa
DB_PASSWORD=YourStrong@Passw0rd

CACHE_STORE=redis
REDIS_HOST=redis
REDIS_PORT=6379
```

---

## 🎯 Cara Menjalankan

### A. Development (Recommended)

Untuk development dengan hot-reload dan debugging:

#### 1. Start Infrastructure (Redis)
```bash
docker-compose up -d redis
```

#### 2. Start Services Locally
```bash
# Terminal 1: Auth Service
cd auth-service
composer install
php artisan migrate
php artisan serve --host=0.0.0.0 --port=8081

# Terminal 2: Dashboard Service
cd dashboard-service
composer install
php artisan migrate
php artisan serve --host=0.0.0.0 --port=8082
```

#### 3. Start Kong (Optional)
```bash
# Uncomment Kong services di docker-compose.yml
docker-compose up -d kong konga
./setup-kong-jwt.sh
```

**Advantages**:
- ✅ Fast reload (no container rebuild)
- ✅ Easy debugging dengan Xdebug
- ✅ Direct file editing
- ✅ Artisan commands langsung tersedia

---

### B. Production (Docker)

Untuk production atau staging environment:

#### 1. Setup Environment
```bash
# Copy production env
cp .env.example .env.production

# Edit dengan production credentials
# Set APP_ENV=production, APP_DEBUG=false
```

#### 2. Build & Start All Services
```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f
```

#### 3. Run Migrations
```bash
# Auth Service
docker exec -it myunila-auth-service php artisan migrate --force

# Dashboard Service
docker exec -it myunila-dashboard-service php artisan migrate --force
```

#### 4. Setup Kong Gateway
```bash
# Wait for Kong to be healthy
docker-compose ps

# Configure Kong routes
./setup-kong-jwt.sh
```

**Advantages**:
- ✅ Production-ready setup
- ✅ Consistent environment
- ✅ Easy scaling
- ✅ Automatic restarts

---

### C. Hybrid (Services in Docker, DB Local)

Best untuk development dengan external databases:

```bash
# Start only services (not databases)
docker-compose up -d auth-service dashboard-service nginx redis

# Access databases via host.docker.internal
```

---

## 🌐 API Gateway (Kong)

### Kong Configuration

Kong Gateway menyediakan centralized API management untuk semua services.

#### Service Routes

```
# Auth Service
http://localhost:9800/auth-service/*
→ Forward ke auth-service:8081

# Dashboard Service
http://localhost:9800/dashboard-service/*
→ Forward ke dashboard-service:8082
```

#### Kong Admin Endpoints

```bash
# List all services
curl http://localhost:9801/services

# List all routes
curl http://localhost:9801/routes

# Check Kong status
curl http://localhost:9801/status
```

#### JWT Authentication Plugin

Kong secara otomatis memvalidasi JWT tokens untuk protected routes.

**Flow**:
1. User login → Auth Service generates JWT
2. Client attach JWT di header: `Authorization: Bearer <token>`
3. Kong validates JWT sebelum forward request
4. Jika valid → forward ke service
5. Jika invalid → return 401 Unauthorized

**Setup JWT Plugin**:
```bash
# Automated via setup-kong-jwt.sh
./setup-kong-jwt.sh

# Manual setup
curl -X POST http://localhost:9801/services/auth-service/plugins \
  --data "name=jwt" \
  --data "config.secret_is_base64=false"
```

#### Rate Limiting

Kong menerapkan rate limiting untuk mencegah abuse:

```
- Limit: 100 requests per minute
- Scope: Per consumer (authenticated user)
- Response: 429 Too Many Requests jika exceeded
```

**Configure Rate Limit**:
```bash
curl -X POST http://localhost:9801/services/auth-service/plugins \
  --data "name=rate-limiting" \
  --data "config.minute=100" \
  --data "config.policy=local"
```

#### CORS Configuration

Kong menangani CORS untuk frontend:

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
```

---

## 💾 Database Configuration

### SQL Server Setup

#### Windows (Local SQL Server)

```sql
-- 1. Enable TCP/IP
-- SQL Server Configuration Manager → SQL Server Network Configuration
-- → Protocols → TCP/IP → Enable

-- 2. Set Port 1433
-- TCP/IP Properties → IP Addresses → IPAll → TCP Port: 1433

-- 3. Restart SQL Server service

-- 4. Create databases
CREATE DATABASE auth_db;
CREATE DATABASE dashboard_db;
GO

-- 5. Create login (jika belum ada)
CREATE LOGIN sa WITH PASSWORD = 'YourStrong@Passw0rd';
ALTER SERVER ROLE sysadmin ADD MEMBER sa;
GO
```

#### Docker SQL Server

```bash
# Start SQL Server in Docker
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Passw0rd" \
  -p 1433:1433 --name sqlserver \
  -d mcr.microsoft.com/mssql/server:2022-latest

# Create databases
docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong@Passw0rd" \
  -Q "CREATE DATABASE auth_db; CREATE DATABASE dashboard_db;"
```

### Connection String

**From Host Machine**:
```
Server=localhost,1433;Database=auth_db;User Id=sa;Password=YourStrong@Passw0rd
```

**From Docker Container**:
```
Server=host.docker.internal,1433;Database=auth_db;User Id=sa;Password=YourStrong@Passw0rd
```

### PostgreSQL (Kong Gateway)

```bash
# Start PostgreSQL
docker run -d \
  --name postgres-kong \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=kong \
  -p 5432:5432 \
  postgres:15-alpine

# Create Kong database
docker exec -it postgres-kong psql -U postgres -c "CREATE DATABASE kong;"
docker exec -it postgres-kong psql -U postgres -c "CREATE DATABASE konga;"
```

### Migrations

```bash
# Auth Service
cd auth-service
php artisan migrate
php artisan db:seed  # Optional: seed sample data

# Dashboard Service
cd dashboard-service
php artisan migrate
php artisan db:seed

# Check migration status
php artisan migrate:status

# Rollback last migration
php artisan migrate:rollback

# Fresh migration (DANGER: drops all tables)
php artisan migrate:fresh
```

---

## 📊 Monitoring

### Service Health Checks

```bash
# Auth Service
curl http://localhost:8081/api/v1/health

# Dashboard Service
curl http://localhost:8082/api/v1/health

# Via Kong Gateway
curl http://localhost:9800/auth-service/api/v1/health
curl http://localhost:9800/dashboard-service/api/v1/health

# Kong Gateway
curl http://localhost:9801/status
```

### Docker Health Status

```bash
# Check all containers
docker-compose ps

# Service-specific health
docker inspect --format='{{json .State.Health}}' myunila-auth-service | jq

# View logs
docker-compose logs -f auth-service
docker-compose logs -f dashboard-service
docker-compose logs -f kong
```

### Laravel Logs

```bash
# Real-time logs dengan Pail (recommended)
cd auth-service
php artisan pail

# Traditional tail
tail -f auth-service/storage/logs/laravel.log
tail -f dashboard-service/storage/logs/laravel.log

# In Docker
docker logs -f myunila-auth-service
```

### Kong Admin Dashboard

**Kong Manager** (GUI):
- URL: http://localhost:9802
- Features: Services, Routes, Plugins, Consumers

**Konga** (Advanced GUI):
- URL: http://localhost:9803
- Features: Full Kong management, monitoring, analytics

**Setup Konga**:
1. Open http://localhost:9803
2. Create admin account
3. Add connection:
   - Name: `Kong`
   - URL: `http://kong:8001`
4. Click "Activate"

---

## 📖 API Documentation

### Swagger/OpenAPI

Setiap service memiliki interactive API documentation:

**Auth Service**:
- Swagger UI: http://localhost:8081/api/documentation
- OpenAPI JSON: http://localhost:8081/api/documentation/json

**Dashboard Service**:
- Swagger UI: http://localhost:8082/api/documentation
- OpenAPI JSON: http://localhost:8082/api/documentation/json

### Generate/Update Documentation

```bash
cd auth-service
php artisan l5-swagger:generate

cd ../dashboard-service
php artisan l5-swagger:generate
```

### Postman Collections

Pre-configured Postman collections tersedia di:
```
auth-service/postman/Auth-Service.postman_collection.json
dashboard-service/postman/Dashboard-Service.postman_collection.json
```

**Import ke Postman**:
1. Open Postman
2. File → Import
3. Select collection file
4. Setup environment variables:
   - `base_url`: http://localhost:9800
   - `auth_service_url`: http://localhost:8081
   - `dashboard_service_url`: http://localhost:8082

---

## 🧪 Testing

### Unit & Feature Tests

```bash
# Auth Service
cd auth-service
./vendor/bin/phpunit

# Atau dengan artisan
php artisan test

# Dengan coverage
php artisan test --coverage

# Specific test file
php artisan test tests/Feature/AuthTest.php

# Dashboard Service
cd dashboard-service
php artisan test
```

### API Testing dengan Postman

1. Import collection dari `postman/` folder
2. Setup environment
3. Run collection:
   - Postman → Collections → Auth Service → Run
   - View test results

### Manual Testing

```bash
# Test Auth Service
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password"
  }'

# Test with JWT
TOKEN="your_jwt_token_here"
curl http://localhost:8081/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Test via Kong Gateway
curl -X POST http://localhost:9800/auth-service/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password"
  }'
```

---

## 🐛 Troubleshooting

### 1. Container Won't Start

**Problem**: Service exits immediately
```bash
# Check logs
docker-compose logs auth-service

# Common issues:
# - Database connection failed
# - Missing .env file
# - Port already in use
```

**Solution**:
```bash
# Check .env file exists
ls -la auth-service/.env

# Check database connection
docker exec -it myunila-auth-service php artisan tinker
>>> DB::connection()->getPdo();

# Check port availability
netstat -ano | findstr :8081  # Windows
lsof -i :8081                 # Linux/Mac
```

### 2. Database Connection Failed

**Problem**: SQLSTATE[08001] Connection refused

**Solution**:
```bash
# Check SQL Server running
# Windows: Services → SQL Server (MSSQLSERVER) → Running
# Docker: docker ps | grep sqlserver

# Check connection from container
docker exec -it myunila-auth-service php artisan tinker
>>> DB::connection()->getPdo();

# Verify host.docker.internal works
docker exec -it myunila-auth-service ping host.docker.internal

# Alternative: Use container IP
docker inspect sqlserver | grep IPAddress
# Update DB_HOST in .env with IP
```

### 3. Kong Gateway Not Working

**Problem**: 502 Bad Gateway dari Kong

**Solution**:
```bash
# Check Kong healthy
docker-compose ps kong

# Check Kong logs
docker-compose logs kong

# Verify routes configured
curl http://localhost:9801/routes

# Re-setup Kong
./setup-kong-jwt.sh

# Check service connectivity
curl http://localhost:9801/services/auth-service/health
```

### 4. JWT Token Invalid

**Problem**: 401 Unauthorized dengan valid token

**Solution**:
```bash
# Check JWT_SECRET sama di semua services
# Root .env
grep JWT_SECRET .env

# Auth Service .env
grep JWT_SECRET auth-service/.env

# Dashboard Service .env
grep JWT_SECRET dashboard-service/.env

# Generate new JWT secret
openssl rand -base64 32

# Update semua .env files dengan secret yang sama
# Restart services
docker-compose restart
```

### 5. Permission Denied (Storage)

**Problem**: Laravel can't write to storage/logs

**Solution**:
```bash
# Fix permissions
cd auth-service
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Or in Docker
docker exec -it myunila-auth-service chmod -R 775 storage bootstrap/cache
docker exec -it myunila-auth-service chown -R www-data:www-data storage bootstrap/cache
```

### 6. Redis Connection Failed

**Problem**: Connection to redis:6379 failed

**Solution**:
```bash
# Check Redis running
docker-compose ps redis

# Test Redis connection
docker exec -it myunila-redis redis-cli ping
# Should return: PONG

# Restart Redis
docker-compose restart redis

# Check Redis from service
docker exec -it myunila-auth-service php artisan tinker
>>> Cache::put('test', 'value', 60);
>>> Cache::get('test');
```

### 7. Composer Dependencies Missing

**Problem**: Class not found errors

**Solution**:
```bash
# Install dependencies
cd auth-service
composer install

# Clear cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# Rebuild autoload
composer dump-autoload
```

### 8. Port Already in Use

**Problem**: Bind for 0.0.0.0:8081 failed: port is already allocated

**Solution**:
```bash
# Find process using port (Windows)
netstat -ano | findstr :8081
taskkill /PID <process_id> /F

# Find process using port (Linux/Mac)
lsof -ti:8081 | xargs kill -9

# Or change port di docker-compose.yml
ports:
  - "8091:80"  # Change 8081 to 8091
```

---

## 📚 Additional Documentation

- **[QUICK-START.md](QUICK-START.md)** - Panduan cepat start all services
- **[WINDOWS-GUIDE.md](WINDOWS-GUIDE.md)** - Panduan khusus Windows
- **[KONG-JWT-TESTING.md](KONG-JWT-TESTING.md)** - Testing Kong JWT authentication
- **Auth Service**: [auth-service/README.md](auth-service/README.md)
- **Dashboard Service**: [dashboard-service/README.md](dashboard-service/README.md)

---

## 🤝 Contributing

### Development Workflow

1. Create feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make changes & test
   ```bash
   php artisan test
   ```

3. Commit dengan conventional commits
   ```bash
   git commit -m "feat(auth): add SSO integration"
   ```

4. Push & create Pull Request
   ```bash
   git push origin feature/your-feature-name
   ```

### Coding Standards

- Follow PSR-12 coding standards
- Use Laravel Pint for formatting:
  ```bash
  ./vendor/bin/pint
  ```
- Write tests for new features
- Document API endpoints dengan OpenAPI annotations

### Branch Strategy

- `master` - Production-ready code
- `develop` - Development branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Production hotfixes

---

## 📄 License

Copyright © 2025 UPA TIK Universitas Lampung. All rights reserved.

---

## 📞 Support

**Tim UPA TIK Universitas Lampung**

- 📧 Email: dev@unila.ac.id
- 🌐 Website: https://www.unila.ac.id
- 📍 Alamat: Universitas Lampung, Bandar Lampung

---

**Built with ❤️ by UPA TIK Universitas Lampung**
