# Local Development Scripts

Script-script untuk memudahkan development di local environment.

## 📋 Daftar Script

### 1. Quick Start (Jalankan Semua Service)

```bash
bash deployment/local/scripts/dev-quick-start.sh
```

**Kapan digunakan:**
- Saat pertama kali mau development hari ini
- Setelah restart komputer
- Semua container sudah ter-build sebelumnya

**Apa yang dilakukan:**
- Start Redis & Meilisearch
- Start Kong Gateway
- Start Auth, Dashboard, Sister services
- Start Nginx backend proxy
- Setup Kong routes otomatis

---

### 2. Stop Semua Service

```bash
bash deployment/local/scripts/dev-stop.sh
```

**Kapan digunakan:**
- Mau shutdown komputer
- Selesai development untuk hari ini
- Mau bersih-bersih resource

---

### 3. Rebuild Service (Ada Perubahan Code)

```bash
# Rebuild service tertentu
bash deployment/local/scripts/rebuild-service.sh auth
bash deployment/local/scripts/rebuild-service.sh dashboard
bash deployment/local/scripts/rebuild-service.sh sister

# Rebuild semua service
bash deployment/local/scripts/rebuild-service.sh all
```

**Kapan digunakan:**
- ✅ Ada perubahan code di backend (PHP/Go)
- ✅ Install/update composer dependencies
- ✅ Install/update Go modules
- ✅ Perubahan Dockerfile

**Contoh skenario:**
```bash
# Contoh: Update code di dashboard service
# 1. Edit code di backend/dashboard-service/app/Http/Controllers/...
# 2. Rebuild dan restart:
bash deployment/local/scripts/rebuild-service.sh dashboard

# Contoh: Update code di auth service
# 1. Edit code di backend/auth-service/...
# 2. Rebuild dan restart:
bash deployment/local/scripts/rebuild-service.sh auth
```

---

### 4. Restart Service (Perubahan Environment Variable)

```bash
# Restart service tertentu
bash deployment/local/scripts/restart-service.sh auth
bash deployment/local/scripts/restart-service.sh dashboard
bash deployment/local/scripts/restart-service.sh sister
bash deployment/local/scripts/restart-service.sh nginx

# Restart semua service
bash deployment/local/scripts/restart-service.sh all
```

**Kapan digunakan:**
- ✅ Ubah file `.env` (di `deployment/local/.env`)
- ✅ Ubah konfigurasi database
- ✅ Ubah API keys
- ⚠️ **TIDAK perlu rebuild**, hanya restart container

**Contoh skenario:**
```bash
# Contoh: Ganti database password
# 1. Edit deployment/local/.env
# 2. Restart service yang pakai database:
bash deployment/local/scripts/restart-service.sh dashboard
bash deployment/local/scripts/restart-service.sh auth
```

---

### 5. Clean Rebuild All (Fresh Start)

```bash
bash deployment/local/scripts/clean-rebuild-all.sh
```

**Kapan digunakan:**
- 🔴 Ada masalah besar yang tidak bisa dijelaskan
- 🔴 Docker cache corrupt
- 🔴 Build error yang aneh
- 🔴 Mau start fresh dari awal

**Warning:** Script ini akan:
- Stop semua container
- Remove semua container
- Remove semua image
- Rebuild dari nol (butuh waktu lama ~10-15 menit)

---

### 6. Setup Kong Routes

```bash
bash deployment/local/scripts/setup-kong-routes.sh
```

**Kapan digunakan:**
- Setelah restart Kong Gateway
- Setelah clean rebuild
- Routes Kong hilang/error

**Apa yang dilakukan:**
- Setup route Dashboard service (protected & public)
- Setup route Auth service
- Setup route Sister service
- Enable CORS untuk semua routes

---

## 📊 Flow Chart Penggunaan

```
┌─────────────────────────────┐
│  Pertama Kali Development  │
│         atau Restart        │
└──────────┬──────────────────┘
           │
           ▼
    dev-quick-start.sh
           │
           ▼
    ┌──────────────┐
    │ Development  │◄──────┐
    └──────┬───────┘       │
           │               │
           ├───► Ubah Code ────► rebuild-service.sh [service]
           │                                │
           ├───► Ubah .env ────► restart-service.sh [service]
           │                                │
           └───► Selesai Development ────► dev-stop.sh
```

## 🎯 Quick Reference

| Skenario | Command |
|----------|---------|
| **Start development** | `bash deployment/local/scripts/dev-quick-start.sh` |
| **Edit PHP code** | Edit → `bash deployment/local/scripts/rebuild-service.sh dashboard` |
| **Edit Go code** | Edit → `bash deployment/local/scripts/rebuild-service.sh sister` |
| **Ubah .env** | Edit → `bash deployment/local/scripts/restart-service.sh all` |
| **Stop semua** | `bash deployment/local/scripts/dev-stop.sh` |
| **Ada masalah aneh** | `bash deployment/local/scripts/clean-rebuild-all.sh` |

## 📝 Tips

### 1. Monitoring Logs
```bash
# Lihat logs real-time
docker logs -f myunila-dashboard-service
docker logs -f myunila-auth-service
docker logs -f myunila-sister-service
docker logs -f myunila-nginx
```

### 2. Check Container Status
```bash
docker ps --filter "name=myunila"
```

### 3. Test API Endpoint
```bash
# Via Kong Gateway (recommended for frontend)
curl http://localhost:9800/dashboard-service/public/api/v1/unila/statistics

# Direct ke service
curl http://localhost:8082/api/v1/unila/statistics
```

### 4. Access Services
- **Frontend**: http://localhost:3000
- **Kong Gateway**: http://localhost:9800
- **Kong Admin**: http://localhost:9801
- **Kong UI**: http://localhost:9803
- **Auth Service**: http://localhost:8081
- **Dashboard Service**: http://localhost:8082
- **Sister Service**: http://localhost:8083
- **Meilisearch**: http://localhost:7700

## 🔧 Troubleshooting

### Problem: Container unhealthy
```bash
# Check logs
docker logs myunila-[service-name]

# Restart service
bash deployment/local/scripts/restart-service.sh [service]
```

### Problem: Port sudah dipakai
```bash
# Cek port yang bentrok
netstat -ano | findstr :9800

# Kill process atau ganti port di .env
```

### Problem: Database connection error
```bash
# Cek koneksi ke SQL Server
telnet 192.168.123.119 1433

# Restart service
bash deployment/local/scripts/restart-service.sh dashboard
```

### Problem: Kong routes hilang
```bash
# Setup ulang Kong routes
bash deployment/local/scripts/setup-kong-routes.sh
```

---

## 📚 Lokasi File Penting

- **Environment**: `deployment/local/.env`
- **Docker Compose**: `deployment/local/services/`
- **Nginx Config**: `deployment/local/configs/nginx/`
- **Backend Code**: `backend/[service-name]/`
- **Frontend Code**: `frontend/`

---

**Happy Coding! 🚀**
