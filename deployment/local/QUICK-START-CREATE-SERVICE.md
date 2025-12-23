# 🚀 Quick Start - Create New Service

## Cara Tercepat Membuat Service Baru

### 1️⃣ Jalankan Script

```bash
cd /c/laragon/www/my-unila
bash deployment/local/deploy.sh
```

**Atau langsung:**

```bash
bash deployment/local/scripts/create-new-service.sh
```

### 2️⃣ Pilih Tipe Service

```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║        MyUnila - Create New Service                   ║
║                                                        ║
╚════════════════════════════════════════════════════════╝

Pilih tipe service yang akan dibuat:

  1) Laravel Service (PHP 8.2 + Laravel 11)
  2) Go Service (Go 1.22+ + Fiber v2)

  0) Exit

Pilihan [0-2]:
```

### 3️⃣ Input Informasi Service

**Service Name:**
```
Service name (lowercase, e.g., 'example', 'integration'): notification
```

**Port:**
```
Available ports: 8085, 8087, 8088, 8089, etc.
Port number (e.g., 8085): 8085
```

**Konfirmasi:**
```
Summary:
  Service: notification-service
  Type: Laravel (PHP 8.2 + Laravel 11)
  Port: 8085

Create service? (y/n): y
```

### 4️⃣ Output yang Dihasilkan

#### Laravel Service:
```
✓ Laravel project created
✓ Dependencies installed
✓ Folder structure created
✓ .env.example created
✓ HealthController created
✓ API routes created
✓ Dockerfile created
✓ supervisord.conf created

✓ Laravel service 'notification-service' created successfully!

Location: /c/laragon/www/my-unila/backend/notification-service
```

#### Go Service:
```
✓ Directory structure created
✓ Go module initialized
✓ Dependencies installed
✓ .env.example created
✓ Config package created
✓ Database connection created
✓ main.go created
✓ Dockerfile created

✓ Go service 'notification-service' created successfully!

Location: /c/laragon/www/my-unila/backend/notification-service
```

---

## ⚡ Next Steps (Cepat!)

### 1. Configure Database

```bash
cd backend/notification-service
nano .env  # atau editor favorit
```

Edit:
```env
DB_HOST=your_host
DB_DATABASE=your_db
DB_USERNAME=your_user
DB_PASSWORD=your_pass
```

### 2. Generate Key (Laravel)

```bash
php artisan key:generate
```

### 3. Add to Docker Compose

Edit `backend/docker-compose.yml`:

```yaml
  notification-service:
    build: ./notification-service
    container_name: myunila-notification-service
    volumes:
      - ./notification-service:/var/www
      - notification_vendor:/var/www/vendor
    depends_on: [redis]
    extra_hosts:
      - "host.docker.internal:host-gateway"
    networks:
      - myunila-network
```

Tambah volume:
```yaml
volumes:
  notification_vendor:
```

### 4. Build & Run

```bash
docker-compose build notification-service
docker-compose up -d notification-service
docker logs myunila-notification-service -f
```

### 5. Test

```bash
curl http://localhost:8085/api/health
```

---

## 📦 Apa yang Sudah Terinstall?

### Laravel Service ✅

- ✅ Laravel 11.31
- ✅ PHP 8.2
- ✅ firebase/php-jwt (JWT auth)
- ✅ predis/predis (Redis)
- ✅ darkaonline/l5-swagger (API docs)
- ✅ SQL Server driver (sqlsrv)
- ✅ Supervisor (PHP-FPM + Queue)
- ✅ Health check endpoint
- ✅ Dockerfile production-ready

### Go Service ✅

- ✅ Go 1.22.6
- ✅ Fiber v2 (web framework)
- ✅ sqlx (SQL extensions)
- ✅ go-mssqldb (SQL Server)
- ✅ jwt/v5 (JWT auth)
- ✅ go-redis (Redis client)
- ✅ godotenv (.env support)
- ✅ cron/v3 (scheduler)
- ✅ Health check endpoint
- ✅ Multi-stage Dockerfile

---

## 🎯 Pattern yang Digunakan

Script mengikuti **exact pattern** dari service yang ada:

### Laravel Pattern dari:
- `auth-service`
- `dashboard-service`

### Go Pattern dari:
- `sister-service`
- `feeder-service`
- `myunila-service`

**Semua pattern, struktur, dan konfigurasi sama persis!**

---

## 🔥 Tips

1. **Pilih port yang belum dipakai:** 8085, 8087, 8088, 8089
2. **Nama service lowercase:** gunakan format `notification`, `reporting`, `integration`
3. **Database remote:** tidak perlu setup database local, cukup config `.env`
4. **Clean project:** semua dependency minimal, tambahkan sesuai kebutuhan

---

## 📞 Need Help?

Lihat dokumentasi lengkap: `CREATE-SERVICE-README.md`

Happy coding! 🚀
