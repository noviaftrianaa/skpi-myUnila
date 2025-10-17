# Quick Start - MyUnila Backend

## 🚀 Cara Menjalankan Semua Service Sekaligus

### Prerequisites

- ✅ Docker Desktop terinstall dan running
- ✅ Git Bash / Terminal / Command Prompt
- ✅ SQL Server running (untuk auth-service)
- ✅ Port 8081, 8082, 9800-9803, 6379, 5433 tersedia

---

## ⚡ Quick Start (One Command)

### Windows (Command Prompt / PowerShell)

```batch
cd C:\laragon\www\my-unila\backend
start-all.bat
```

### Linux / Mac / Git Bash

```bash
cd /c/laragon/www/my-unila/backend
./start-all.sh
```

**Tunggu 1-2 menit**, script akan otomatis:
1. ✅ Check Docker running
2. ✅ Start Auth Service
3. ✅ Start Dashboard Service
4. ✅ Start Nginx
5. ✅ Start Redis
6. ✅ Start Kong Gateway + PostgreSQL
7. ✅ Configure Kong routes
8. ✅ Test semua endpoints
9. ✅ Show service URLs

---

## 📋 Step-by-Step Guide

### Cara 1: Windows (Command Prompt / PowerShell)

#### 1. Buka Command Prompt atau PowerShell

```batch
# Masuk ke direktori backend
cd C:\laragon\www\my-unila\backend
```

#### 2. Jalankan Start Script

```batch
# Jalankan semua service
start-all.bat
```

**Atau double-click** file `start-all.bat` di Windows Explorer.

---

### Cara 2: Git Bash / WSL / Linux

#### 1. Buka Terminal (Git Bash)

```bash
# Masuk ke direktori backend
cd /c/laragon/www/my-unila/backend
```

#### 2. Jalankan Start Script

```bash
# Berikan permission (hanya sekali)
chmod +x start-all.sh stop-all.sh

# Jalankan semua service
./start-all.sh
```

---

### 3. Output yang Diharapkan

```
==========================================
  MyUnila Backend - Start All Services
==========================================

→ Checking Docker...
✓ Docker is running

=== Starting Main Services (Auth, Dashboard, Nginx, Redis) ===
✓ Main services started

→ Waiting for main services to initialize...

=== Starting Kong API Gateway ===
✓ Kong services started

→ Waiting for Kong to initialize (this may take 30-60 seconds)...
→ Waiting for Auth Service to be ready...
✓ Auth Service is ready!
→ Waiting for Kong Admin API to be ready...
✓ Kong Admin API is ready!

=== Configuring Kong Routes ===
✓ Auth service added
✓ Auth route added
✓ Dashboard service added
✓ Dashboard route added

=== Testing Endpoints ===
→ Testing Auth Service (Direct - Port 8081)...
✓ Auth Service is working
→ Testing Kong Admin API (Port 9801)...
✓ Kong Admin API is working
→ Testing Auth Service via Kong (Port 9800)...
✓ Auth Service via Kong is working

=== Services Status ===
NAME                        STATUS              PORTS
myunila-auth-service        Up                  9000/tcp
myunila-dashboard-service   Up                  9000/tcp
myunila-nginx               Up                  0.0.0.0:8081-8082->80-81/tcp
myunila-redis               Up (healthy)        0.0.0.0:6379->6379/tcp
myunila-kong-gateway        Up (healthy)        0.0.0.0:9800-9802->8000-8002/tcp
myunila-kong-db             Up (healthy)        0.0.0.0:5433->5432/tcp
myunila-kong-ui             Up                  0.0.0.0:9803->80/tcp

=== Service URLs ===

Main Services:
  → Auth Service:           http://localhost:8081
  → Dashboard Service:      http://localhost:8082
  → Redis:                  localhost:6379

Kong API Gateway:
  → Kong Proxy:             http://localhost:9800
  → Kong Admin API:         http://localhost:9801
  → Kong UI:                http://localhost:9803

Auth Service Endpoints:
  → Login:                  http://localhost:8081/api/v1/auth/login
  → Login (via Kong):       http://localhost:9800/auth-service/api/v1/auth/login
  → Swagger Docs:           http://localhost:8081/api/documentation

Dashboard Service Endpoints:
  → University Profile:     http://localhost:8082/api/v1/university-profile
  → Quick Facts:            http://localhost:8082/api/v1/university-profile/quick-facts
  → Via Kong:               http://localhost:9800/dashboard-service/api/v1/university-profile

✓ All services started successfully!

→ Next steps:
  1. Test login: curl -X POST http://localhost:8081/api/v1/auth/login -H 'Content-Type: application/json' -d '{"username":"mizar.zulmi1073","password":"makinjaya"}'
  2. Open Kong UI: http://localhost:9803
  3. View logs: docker-compose logs -f

→ To stop all services: ./stop-all.sh
```

### 4. Verifikasi Services Running

```bash
# Check container status
docker ps

# Atau gunakan docker-compose
docker-compose ps
```

---

## 🧪 Testing Services

### Test Auth Service

**Direct Access (Port 8081):**
```bash
# Login
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "mizar.zulmi1073",
    "password": "makinjaya"
  }'

# Get user info (setelah login, gunakan token yang didapat)
TOKEN="your_access_token_here"
curl -X GET http://localhost:8081/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Refresh token
curl -X POST http://localhost:8081/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"'$TOKEN'"}'
```

**Via Kong (Port 9800):**
```bash
# Login via Kong
curl -X POST http://localhost:9800/auth-service/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "mizar.zulmi1073",
    "password": "makinjaya"
  }'

# Get user info via Kong
curl -X GET http://localhost:9800/auth-service/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Test Dashboard Service

**Direct Access (Port 8082):**
```bash
# Health check
curl http://localhost:8082/api/health

# University profile
curl http://localhost:8082/api/v1/university-profile

# Quick facts
curl http://localhost:8082/api/v1/university-profile/quick-facts

# Contact info
curl http://localhost:8082/api/v1/university-profile/contact
```

**Via Kong (Port 9800):**
```bash
# Health check via Kong
curl http://localhost:9800/dashboard-service/api/health

# University profile via Kong
curl http://localhost:9800/dashboard-service/api/v1/university-profile

# Quick facts via Kong
curl http://localhost:9800/dashboard-service/api/v1/university-profile/quick-facts
```

### Access Kong UI

Buka browser:
```
http://localhost:9803
```

Kong UI akan menampilkan:
- 📊 Statistics (Services, Routes, Plugins)
- 🎴 Service Cards (Auth, Dashboard, dll)
- 📝 Configured Routes
- 🔌 Active Plugins

---

## 🛑 Stop Semua Services

### Windows (Command Prompt)
```batch
stop-all.bat
```

### Git Bash / Linux
```bash
./stop-all.sh
```

Output:
```
==========================================
  MyUnila Backend - Stop All Services
==========================================

→ Stopping Kong services...
✓ Kong services stopped

→ Stopping main services...
✓ Main services stopped

→ Checking remaining containers...

✓ All services stopped

→ To remove volumes (CAUTION: will delete data): docker-compose down -v
→ To start services again: ./start-all.sh
```

---

## 📊 Service Status

### Check Status
```bash
# Docker compose status
docker-compose ps

# All containers
docker ps

# Specific service
docker-compose ps auth-service
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service
docker-compose logs -f dashboard-service

# Kong
docker-compose -f docker-compose-kong.yml logs -f kong

# Last 50 lines
docker-compose logs --tail=50 auth-service
```

### Restart Service
```bash
# Restart specific service
docker-compose restart auth-service
docker-compose restart dashboard-service

# Restart nginx
docker-compose restart nginx

# Restart Kong
docker-compose -f docker-compose-kong.yml restart kong
```

---

## 🔧 Troubleshooting

### Problem: Docker not running

**Error:**
```
✗ Docker is not running. Please start Docker Desktop.
```

**Solution:**
1. Buka Docker Desktop
2. Tunggu sampai Docker fully running
3. Jalankan `./start-all.sh` lagi

---

### Problem: Port already in use

**Error:**
```
Error: Bind for 0.0.0.0:8081 failed: port is already allocated
```

**Solution:**
```bash
# Check port yang dipakai
netstat -ano | findstr 8081

# Stop process yang pakai port tersebut
# Atau restart Docker Desktop
```

---

### Problem: Container exit immediately

**Check logs:**
```bash
docker-compose logs auth-service
```

**Common causes:**
- SQL Server tidak running
- .env file salah konfigurasi
- Vendor dependencies belum terinstall

**Solution:**
```bash
# Rebuild container
docker-compose up -d --build auth-service

# Check env
cat auth-service/.env

# Install dependencies
docker-compose exec auth-service composer install
```

---

### Problem: Kong migration failed

**Error:**
```
Kong migration failed
```

**Solution:**
```bash
# Stop semua
docker-compose down
docker-compose -f docker-compose-kong.yml down

# Remove Kong database volume
docker volume rm backend_kong-db-data

# Start lagi
./start-all.sh
```

---

### Problem: Cannot access services

**Check:**
```bash
# 1. Container running?
docker ps

# 2. Nginx running?
docker-compose logs nginx

# 3. Service healthy?
curl http://localhost:8081/api/health
curl http://localhost:8082/api/health

# 4. Kong working?
curl http://localhost:9801
```

---

## 📦 Manual Commands (Alternative)

Jika tidak mau pakai script, bisa manual:

### Start Services
```bash
# 1. Start main services
docker-compose up -d

# 2. Start Kong
docker-compose -f docker-compose-kong.yml up -d

# 3. Wait for Kong ready (30-60 seconds)
sleep 60

# 4. Configure Kong routes
# Auth service
curl -X POST http://localhost:9801/services \
  --data name=auth-service \
  --data url=http://nginx:80

curl -X POST http://localhost:9801/services/auth-service/routes \
  --data "name=auth-route" \
  --data "paths[]=/auth-service" \
  --data strip_path=true

# Dashboard service
curl -X POST http://localhost:9801/services \
  --data name=dashboard-service \
  --data url=http://nginx:81

curl -X POST http://localhost:9801/services/dashboard-service/routes \
  --data "name=dashboard-route" \
  --data "paths[]=/dashboard-service" \
  --data strip_path=true
```

### Stop Services
```bash
docker-compose down
docker-compose -f docker-compose-kong.yml down
```

---

## 🎨 Useful Aliases

Tambahkan ke `.bashrc` atau `.bash_profile`:

```bash
# MyUnila Backend Aliases
alias myunila-start='cd /c/laragon/www/my-unila/backend && ./start-all.sh'
alias myunila-stop='cd /c/laragon/www/my-unila/backend && ./stop-all.sh'
alias myunila-logs='cd /c/laragon/www/my-unila/backend && docker-compose logs -f'
alias myunila-status='cd /c/laragon/www/my-unila/backend && docker ps | grep myunila'
alias myunila-restart='cd /c/laragon/www/my-unila/backend && ./stop-all.sh && ./start-all.sh'

# Individual services
alias myunila-auth-logs='cd /c/laragon/www/my-unila/backend && docker-compose logs -f auth-service'
alias myunila-dashboard-logs='cd /c/laragon/www/my-unila/backend && docker-compose logs -f dashboard-service'
alias myunila-kong-logs='cd /c/laragon/www/my-unila/backend && docker-compose -f docker-compose-kong.yml logs -f kong'
```

Kemudian reload:
```bash
source ~/.bashrc
```

Sekarang bisa langsung:
```bash
myunila-start    # Start all
myunila-stop     # Stop all
myunila-logs     # View logs
myunila-status   # Check status
```

---

## 📚 Related Documentation

- [SERVICES-SUMMARY.md](./SERVICES-SUMMARY.md) - Overview semua services
- [DOCKER-RUN-GUIDE.md](./DOCKER-RUN-GUIDE.md) - Detailed Docker guide
- [KONG-SETUP.md](./KONG-SETUP.md) - Kong setup guide
- [auth-service/README.md](./auth-service/README.md) - Auth service docs
- [dashboard-service/README.md](./dashboard-service/README.md) - Dashboard service docs
- [TEST-AUTH-ENDPOINTS.md](./TEST-AUTH-ENDPOINTS.md) - Auth testing guide

---

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| **Auth Service** | http://localhost:8081 |
| **Dashboard Service** | http://localhost:8082 |
| **Kong Proxy** | http://localhost:9800 |
| **Kong Admin** | http://localhost:9801 |
| **Kong UI** | http://localhost:9803 |
| **Swagger (Auth)** | http://localhost:8081/api/documentation |

---

## 🎯 Next Steps

Setelah semua running:

1. ✅ Test login di auth-service
2. ✅ Cek university profile di dashboard-service
3. ✅ Buka Kong UI untuk melihat service cards
4. ✅ Test endpoints via Kong (port 9800)
5. ✅ Integrate dengan frontend

---

**Happy Coding! 🎉**

**Last Updated**: October 16, 2025
**Maintainer**: MyUnila Backend Team
