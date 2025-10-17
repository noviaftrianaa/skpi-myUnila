# MyUnila Backend - Windows Guide

Panduan lengkap menjalankan MyUnila Backend di Windows (Command Prompt / PowerShell).

---

## 🎯 Cara Tercepat (Windows)

### 1. Pastikan Docker Desktop Running

Buka **Docker Desktop** dan tunggu sampai icon Docker di system tray berwarna hijau.

### 2. Jalankan Script

**Opsi A: Double-click di Windows Explorer**
- Buka folder `C:\laragon\www\my-unila\backend`
- Double-click file `start-all.bat`

**Opsi B: Via Command Prompt**
```batch
cd C:\laragon\www\my-unila\backend
start-all.bat
```

**Opsi C: Via PowerShell**
```powershell
cd C:\laragon\www\my-unila\backend
.\start-all.bat
```

### 3. Tunggu 1-2 Menit

Script akan otomatis:
- ✅ Check Docker running
- ✅ Start semua services (Auth, Dashboard, Nginx, Redis, Kong)
- ✅ Configure Kong routes
- ✅ Test endpoints
- ✅ Show service URLs

---

## 📦 Files untuk Windows

Di folder backend, ada 2 file utama:

| File | Fungsi |
|------|--------|
| `start-all.bat` | Start semua services |
| `stop-all.bat` | Stop semua services |

---

## 🚀 Start Services

### Via Command Prompt

```batch
cd C:\laragon\www\my-unila\backend
start-all.bat
```

### Output yang Diharapkan

```
========================================
  MyUnila Backend - Start All Services
========================================

[INFO] Checking Docker...
[OK] Docker is running

========================================
=== Starting Main Services ===
========================================
[INFO] Starting Auth Service, Dashboard Service, Nginx, Redis...
[OK] Main services started

[INFO] Waiting for main services to initialize...

========================================
=== Starting Kong API Gateway ===
========================================
[INFO] Starting Kong Gateway, PostgreSQL, Kong UI...
[OK] Kong services started

[INFO] Waiting for Kong to initialize (this may take 30-60 seconds)...
[INFO] Waiting for Auth Service to be ready...
[OK] Auth Service is ready!
[INFO] Waiting for Kong Admin API to be ready...
[OK] Kong Admin API is ready!

========================================
=== Configuring Kong Routes ===
========================================
[INFO] Adding auth-service to Kong...
[OK] Auth service added
[OK] Auth route added
[INFO] Adding dashboard-service to Kong...
[OK] Dashboard service added
[OK] Dashboard route added

========================================
=== Testing Endpoints ===
========================================
[INFO] Testing Auth Service (Direct - Port 8081)...
[OK] Auth Service is working
[INFO] Testing Dashboard Service (Direct - Port 8082)...
[OK] Dashboard Service is working
[INFO] Testing Kong Admin API (Port 9801)...
[OK] Kong Admin API is working
[INFO] Testing Auth Service via Kong (Port 9800)...
[OK] Auth Service via Kong is working

========================================
=== Services Status ===
========================================

Main Services:
NAME                        STATUS              PORTS
myunila-auth-service        Up                  9000/tcp
myunila-dashboard-service   Up                  9000/tcp
myunila-nginx               Up                  0.0.0.0:8081-8082->80-81/tcp
myunila-redis               Up (healthy)        0.0.0.0:6379->6379/tcp

Kong Services:
NAME                       STATUS              PORTS
myunila-kong-gateway       Up (healthy)        0.0.0.0:9800-9802->8000-8002/tcp
myunila-kong-db            Up (healthy)        0.0.0.0:5433->5432/tcp
myunila-kong-ui            Up                  0.0.0.0:9803->80/tcp

========================================
=== Service URLs ===
========================================

Main Services:
  - Auth Service:           http://localhost:8081
  - Dashboard Service:      http://localhost:8082
  - Redis:                  localhost:6379

Kong API Gateway:
  - Kong Proxy:             http://localhost:9800
  - Kong Admin API:         http://localhost:9801
  - Kong UI:                http://localhost:9803

Auth Service Endpoints:
  - Login:                  http://localhost:8081/api/v1/auth/login
  - Login (via Kong):       http://localhost:9800/auth-service/api/v1/auth/login
  - Health Check:           http://localhost:8081/api/v1/health

Dashboard Service Endpoints:
  - University Profile:     http://localhost:8082/api/v1/university-profile
  - Quick Facts:            http://localhost:8082/api/v1/university-profile/quick-facts
  - Via Kong:               http://localhost:9800/dashboard-service/api/v1/university-profile

========================================
[OK] All services started successfully!
========================================

Next steps:
  1. Open Kong UI: http://localhost:9803
  2. Test login: curl -X POST http://localhost:8081/api/v1/auth/login -H "Content-Type: application/json" -d "{\"username\":\"mizar.zulmi1073\",\"password\":\"makinjaya\"}"
  3. View logs: docker-compose logs -f

To stop all services: stop-all.bat

Press any key to continue . . .
```

---

## 🛑 Stop Services

### Via Command Prompt

```batch
cd C:\laragon\www\my-unila\backend
stop-all.bat
```

### Output

```
========================================
  MyUnila Backend - Stop All Services
========================================

[INFO] Stopping Kong services...
[OK] Kong services stopped

[INFO] Stopping main services...
[OK] Main services stopped

========================================
[OK] All services stopped successfully!
========================================

Press any key to continue . . .
```

---

## 🧪 Testing dengan curl (Windows)

### Install curl (jika belum ada)

Windows 10/11 sudah include `curl` by default. Test dengan:

```batch
curl --version
```

Jika belum ada, download dari: https://curl.se/windows/

### Test Login

```batch
curl -X POST http://localhost:8081/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"mizar.zulmi1073\",\"password\":\"makinjaya\"}"
```

**Note:** Di Windows Command Prompt, gunakan `^` untuk line continuation, bukan `\`.

### Test dengan PowerShell

```powershell
$body = @{
    username = "mizar.zulmi1073"
    password = "makinjaya"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8081/api/v1/auth/login" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

### Test Dashboard Service

```batch
curl http://localhost:8082/api/v1/university-profile
curl http://localhost:8082/api/v1/university-profile/quick-facts
curl http://localhost:8082/api/v1/university-profile/contact
```

---

## 📊 Docker Commands (Windows)

### Check Container Status

```batch
docker ps
```

### View Logs

```batch
REM All services
docker-compose logs -f

REM Specific service
docker-compose logs -f auth-service
docker-compose logs -f dashboard-service

REM Kong
docker-compose -f docker-compose-kong.yml logs -f kong

REM Last 50 lines
docker-compose logs --tail=50 auth-service
```

### Restart Service

```batch
REM Restart specific service
docker-compose restart auth-service
docker-compose restart dashboard-service

REM Restart nginx
docker-compose restart nginx

REM Restart Kong
docker-compose -f docker-compose-kong.yml restart kong
```

### Enter Container Shell

```batch
REM Enter auth-service container
docker-compose exec auth-service bash

REM Enter dashboard-service container
docker-compose exec dashboard-service bash

REM Enter Kong container
docker-compose -f docker-compose-kong.yml exec kong sh
```

### Clean Up (Rebuild from Scratch)

```batch
REM Stop all
stop-all.bat

REM Remove containers and volumes
docker-compose down -v
docker-compose -f docker-compose-kong.yml down -v

REM Remove images (optional)
docker rmi backend_auth-service
docker rmi backend_dashboard-service

REM Start fresh
start-all.bat
```

---

## 🔧 Troubleshooting (Windows)

### Problem 1: "Docker is not running"

**Solution:**
1. Buka **Docker Desktop**
2. Tunggu sampai Docker fully running (icon hijau di system tray)
3. Jalankan `start-all.bat` lagi

---

### Problem 2: Port already in use

**Error:**
```
Error: Bind for 0.0.0.0:8081 failed: port is already allocated
```

**Check port yang dipakai:**
```batch
netstat -ano | findstr 8081
```

**Kill process:**
```batch
REM Find PID from netstat output (last column)
taskkill /PID <PID> /F

REM Or restart Docker Desktop
```

---

### Problem 3: Permission denied di Git Bash

Jika Anda pakai Git Bash di Windows dan error "Permission denied":

```bash
chmod +x start-all.sh stop-all.sh
./start-all.sh
```

---

### Problem 4: curl tidak ditemukan

**Check curl:**
```batch
curl --version
```

**Jika tidak ada:**
1. Download dari: https://curl.se/windows/
2. Atau install via Chocolatey: `choco install curl`
3. Atau gunakan PowerShell `Invoke-RestMethod` (lihat contoh di atas)

---

### Problem 5: Container exit immediately

**Check logs:**
```batch
docker-compose logs auth-service
docker-compose logs dashboard-service
```

**Common causes:**
- SQL Server tidak running
- .env file salah konfigurasi
- Vendor dependencies belum terinstall

**Solution:**
```batch
REM Rebuild container
docker-compose up -d --build auth-service

REM Install dependencies
docker-compose exec auth-service composer install
```

---

### Problem 6: Kong migration failed

**Solution:**
```batch
REM Stop all
stop-all.bat

REM Remove Kong database volume
docker volume rm backend_kong-db-data

REM Start fresh
start-all.bat
```

---

## 🎯 Akses Services di Browser

Setelah services running, buka di browser:

| Service | URL |
|---------|-----|
| **Kong UI** | http://localhost:9803 |
| **Auth Service Health** | http://localhost:8081/api/v1/health |
| **Dashboard Service** | http://localhost:8082/api/v1/university-profile |
| **Kong Admin API** | http://localhost:9801 |

---

## 🔗 Testing dengan Postman (Windows)

### Import Collection

1. Buka **Postman**
2. Import collection dari `postman/myunila-backend.postman_collection.json` (jika ada)
3. Atau buat request manual:

### Login Request

```
Method: POST
URL: http://localhost:8081/api/v1/auth/login
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "username": "mizar.zulmi1073",
  "password": "makinjaya"
}
```

### Get User Info

```
Method: GET
URL: http://localhost:8081/api/v1/auth/me
Headers:
  Authorization: Bearer <your_token_here>
```

### University Profile

```
Method: GET
URL: http://localhost:8082/api/v1/university-profile
```

---

## 📱 Access from Other Devices (Same Network)

Jika mau akses dari HP/laptop lain di network yang sama:

### 1. Get Your IP Address

```batch
ipconfig
```

Cari IPv4 Address, contoh: `192.168.1.100`

### 2. Allow Firewall (Windows Defender)

```batch
REM Allow port 8081-8082
netsh advfirewall firewall add rule name="MyUnila Auth" dir=in action=allow protocol=TCP localport=8081
netsh advfirewall firewall add rule name="MyUnila Dashboard" dir=in action=allow protocol=TCP localport=8082

REM Allow Kong
netsh advfirewall firewall add rule name="MyUnila Kong" dir=in action=allow protocol=TCP localport=9800-9803
```

### 3. Access from Other Device

```
http://192.168.1.100:8081  (Auth Service)
http://192.168.1.100:8082  (Dashboard Service)
http://192.168.1.100:9803  (Kong UI)
```

---

## 📚 Related Documentation

- [QUICK-START.md](./QUICK-START.md) - Quick start guide (all platforms)
- [DOCKER-COMMANDS.md](./DOCKER-COMMANDS.md) - Detailed Docker commands
- [SERVICES-SUMMARY.md](./SERVICES-SUMMARY.md) - Services overview
- [README-DOCKER.md](./README-DOCKER.md) - Docker setup guide

---

## 🎉 Next Steps

Setelah semua running:

1. ✅ Buka Kong UI: http://localhost:9803
2. ✅ Test login dengan Postman
3. ✅ Test dashboard endpoints
4. ✅ Integrate dengan frontend

---

**Happy Coding! 🚀**

**Platform**: Windows 10/11
**Last Updated**: October 16, 2025
**Maintainer**: MyUnila Backend Team
