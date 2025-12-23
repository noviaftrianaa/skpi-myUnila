# Create New Service Script

Script untuk membuat backend service baru (Laravel atau Go) dengan pattern yang sama seperti service yang sudah ada di project MyUnila.

## 🚀 Cara Penggunaan

### Melalui Deploy Menu (Recommended)

1. Jalankan deployment script:
   ```bash
   bash deployment/local/deploy.sh
   ```

2. Pilih menu **28) Create New Service (Laravel atau Go)**

3. Ikuti instruksi interaktif

### Langsung Menjalankan Script

```bash
bash deployment/local/scripts/create-new-service.sh
```

## 📋 Proses Pembuatan Service

### Option 1: Laravel Service (PHP 8.2 + Laravel 11)

Script akan membuat:

1. **Fresh Laravel 11 Project**
2. **Dependencies yang sudah terinstall:**
   - `firebase/php-jwt` (^6.10) - JWT authentication
   - `predis/predis` (^2.2) - Redis client
   - `darkaonline/l5-swagger` - API documentation

3. **Folder Structure:**
   ```
   service-name/
   ├── app/
   │   ├── Http/
   │   │   ├── Controllers/
   │   │   │   └── Api/
   │   │   │       └── HealthController.php
   │   │   └── Middleware/
   │   ├── Repositories/
   │   └── Services/
   ├── docker/
   │   └── supervisord.conf
   ├── routes/
   │   └── api.php
   ├── .env.example
   ├── .env
   ├── Dockerfile
   └── README.md
   ```

4. **Health Check Endpoint:** `/api/health`
5. **Supervisor Config:** PHP-FPM + Queue Worker
6. **Database Support:** SQL Server (via sqlsrv driver)
7. **Redis Support:** Cache, Session, Queue

### Option 2: Go Service (Go 1.22+ + Fiber v2)

Script akan membuat:

1. **Go Module dengan dependencies:**
   - `github.com/gofiber/fiber/v2` - Web framework
   - `github.com/jmoiron/sqlx` - SQL extensions
   - `github.com/microsoft/go-mssqldb` - SQL Server driver
   - `github.com/golang-jwt/jwt/v5` - JWT authentication
   - `github.com/go-redis/redis/v8` - Redis client
   - `github.com/google/uuid` - UUID generation
   - `github.com/joho/godotenv` - .env support
   - `github.com/robfig/cron/v3` - Cron scheduler

2. **Folder Structure:**
   ```
   service-name/
   ├── cmd/
   │   └── api/
   │       └── main.go
   ├── apps/
   │   └── example/
   ├── internal/
   │   ├── config/
   │   │   └── config.go
   │   └── middleware/
   ├── external/
   │   └── database/
   │       └── sqlserver.go
   ├── pkg/
   │   └── response/
   ├── database/
   │   └── migrations/
   ├── docs/
   ├── .env.example
   ├── .env
   ├── go.mod
   ├── go.sum
   └── Dockerfile
   ```

3. **Health Check Endpoint:** `/health`
4. **Multi-stage Dockerfile:** Builder + Runtime
5. **Database Support:** SQL Server connection pool
6. **Redis Support:** Caching layer

## 🎯 Apa yang Dihasilkan

### Laravel Service Output:

✅ Clean Laravel 11 project
✅ Health check controller dengan database & redis check
✅ API routes dengan v1 prefix
✅ Dockerfile dengan PHP 8.2 + SQL Server driver
✅ Supervisor config untuk PHP-FPM + Queue Worker
✅ .env.example sesuai pattern yang ada

### Go Service Output:

✅ Clean Go project dengan Fiber v2
✅ Config management dengan godotenv
✅ SQL Server connection dengan sqlx
✅ Health check endpoint
✅ Multi-stage Dockerfile optimized
✅ .env.example sesuai pattern yang ada

## 📝 Input yang Diperlukan

Saat menjalankan script, Anda akan diminta:

1. **Service Name**
   - Format: lowercase, hyphens allowed
   - Contoh: `integration`, `notification`, `reporting`
   - Script akan otomatis menambahkan suffix `-service`

2. **Port Number**
   - Range: 1024-65535
   - Rekomendasi: 8085, 8087, 8088, 8089, dst
   - Script akan validasi port tidak bentrok

## 🔧 Langkah Setelah Service Dibuat

### 1. Konfigurasi Database

Edit file `.env` di service folder:

```bash
# Laravel
DB_HOST=your_sql_server_host
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Go (sama)
DB_HOST=your_sql_server_host
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 2. Generate Application Key (Laravel Only)

```bash
cd backend/service-name
php artisan key:generate
```

### 3. Add to Docker Compose

Edit `backend/docker-compose.yml` dan tambahkan service:

**Untuk Laravel:**
```yaml
  service-name:
    build: ./service-name
    container_name: myunila-service-name
    volumes:
      - ./service-name:/var/www
      - service_vendor:/var/www/vendor
    depends_on:
      - redis
    extra_hosts:
      - "host.docker.internal:host-gateway"
    networks:
      - myunila-network
```

**Untuk Go:**
```yaml
  service-name:
    build: ./service-name
    container_name: myunila-service-name
    ports:
      - "8085:8085"  # sesuaikan port
    depends_on:
      - redis
    extra_hosts:
      - "host.docker.internal:host-gateway"
    networks:
      - myunila-network
```

**Tambahkan volume (Laravel):**
```yaml
volumes:
  service_vendor:
```

### 4. Add Nginx Config (Laravel Only)

Create `backend/docker/nginx/conf.d/service-name.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /var/www/public;

    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass service-name:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

Update `docker-compose.yml` nginx ports:
```yaml
  nginx:
    ports:
      - "8081:80"
      - "8082:81"
      - "8085:82"  # tambahkan port baru
```

### 5. Build dan Run

```bash
# Build service
cd backend
docker-compose build service-name

# Start service
docker-compose up -d service-name

# Check logs
docker logs myunila-service-name -f

# Test health endpoint
curl http://localhost:8085/api/health
```

## 🧪 Testing Service

### Laravel Service

```bash
# Health check
curl http://localhost:8085/api/health

# Expected response:
{
  "service": "Service Name",
  "status": "healthy",
  "timestamp": "2025-01-25T10:00:00Z",
  "version": "1.0.0",
  "checks": {
    "database": {"status": "ok", "message": "Database connected"},
    "redis": {"status": "ok", "message": "Redis connected"}
  }
}
```

### Go Service

```bash
# Health check
curl http://localhost:8085/health

# Expected response:
{
  "status": "ok",
  "service": "Service Name",
  "version": "1.0.0"
}

# Welcome endpoint
curl http://localhost:8085/

# API v1
curl http://localhost:8085/api/v1/
```

## 📚 Next Steps

Setelah service berhasil dibuat dan running:

1. **Develop Features**
   - Laravel: Buat Controller, Service, Repository di folder yang sudah ada
   - Go: Buat module baru di `apps/` folder

2. **Add API Endpoints**
   - Laravel: Edit `routes/api.php`
   - Go: Create router di module dan register di `main.go`

3. **Database Migrations**
   - Laravel: `php artisan make:migration`
   - Go: Buat SQL script di `database/migrations/`

4. **Add to Deployment Scripts**
   - Update `quick-rebuild.sh` untuk support service baru
   - Update `restart-services.sh` untuk support service baru

5. **Documentation**
   - Laravel: Gunakan L5 Swagger untuk API docs
   - Go: Gunakan Swagger annotations

## ⚠️ Troubleshooting

### Laravel - Composer Install Failed

```bash
# Jika composer install gagal, coba manual:
cd backend/service-name
composer install --no-scripts
composer run-script post-autoload-dump
```

### Go - Dependencies Download Failed

```bash
# Jika go get gagal, coba manual:
cd backend/service-name
go mod download
go mod tidy
```

### Docker Build Failed

```bash
# Clear Docker cache dan rebuild:
docker system prune -af
cd backend
docker-compose build --no-cache service-name
```

### Port Already in Use

```bash
# Check port usage:
netstat -an | grep :8085

# Pilih port lain atau stop service yang menggunakan port tersebut
```

## 📖 Pattern Reference

Script ini mengikuti pattern dari service yang sudah ada:

- **Laravel Pattern:** `auth-service`, `dashboard-service`
- **Go Pattern:** `sister-service`, `feeder-service`, `myunila-service`

Semua konfigurasi, struktur folder, dan dependencies mengikuti best practices dari service-service tersebut.

## 🎉 Success Indicators

Service berhasil dibuat jika:

✅ Folder service terbuat di `backend/service-name/`
✅ Dependencies terinstall dengan baik
✅ `.env` file terbuat dari `.env.example`
✅ Dockerfile siap untuk build
✅ Health check endpoint bisa diakses
✅ Database & Redis connection berfungsi

---

**Happy Coding! 🚀**
