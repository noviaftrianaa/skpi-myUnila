# 📖 Contoh Penggunaan Script

## Contoh 1: Membuat Laravel Service "Notification"

### Step 1: Jalankan Script

```bash
$ bash deployment/local/scripts/create-new-service.sh
```

### Step 2: Output Menu

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

Pilihan [0-2]: 1
```

### Step 3: Input Service Name

```
════════════════════════════════════════════════════════
Laravel Service Configuration
════════════════════════════════════════════════════════

Service name (lowercase, e.g., 'example', 'integration'): notification
✓ Service name valid
```

### Step 4: Input Port

```
Available ports: 8085, 8087, 8088, 8089, etc.
Port number (e.g., 8085): 8085
✓ Port valid
```

### Step 5: Konfirmasi

```
Summary:
  Service: notification-service
  Type: Laravel (PHP 8.2 + Laravel 11)
  Port: 8085

Create service? (y/n): y
```

### Step 6: Proses Pembuatan

```
════════════════════════════════════════════════════════
Creating Laravel Service: notification-service
════════════════════════════════════════════════════════

[1/8] Creating Laravel project...
Created project in /c/laragon/www/my-unila/backend/notification-service
✓ Laravel project created

[2/8] Installing dependencies...
Installing firebase/php-jwt (^6.10)
Installing predis/predis (^2.2)
Installing darkaonline/l5-swagger
✓ Dependencies installed

[3/8] Creating folder structure...
✓ Folder structure created

[4/8] Creating .env.example...
✓ .env.example created

[5/8] Creating HealthController...
✓ HealthController created

[6/8] Creating API routes...
✓ API routes created

[7/8] Creating Dockerfile...
✓ Dockerfile created

[8/8] Creating supervisord.conf...
✓ supervisord.conf created

════════════════════════════════════════════════════════
✓ Laravel service 'notification-service' created successfully!
════════════════════════════════════════════════════════

Next steps:
  1. Edit .env file and configure database connection
  2. Generate application key: php artisan key:generate
  3. Add service to docker-compose.yml
  4. Build and run: docker-compose up -d

Location: /c/laragon/www/my-unila/backend/notification-service
```

---

## Contoh 2: Membuat Go Service "Integration"

### Step 1: Pilih Go Service

```
Pilihan [0-2]: 2
```

### Step 2: Input Details

```
════════════════════════════════════════════════════════
Go Service Configuration
════════════════════════════════════════════════════════

Service name (lowercase, e.g., 'example', 'integration'): integration

Available ports: 8085, 8087, 8088, 8089, etc.
Port number (e.g., 8085): 8087
```

### Step 3: Konfirmasi

```
Summary:
  Service: integration-service
  Type: Go (Go 1.22+ + Fiber v2)
  Port: 8087

Create service? (y/n): y
```

### Step 4: Proses Pembuatan

```
════════════════════════════════════════════════════════
Creating Go Service: integration-service
════════════════════════════════════════════════════════

[1/8] Creating directory structure...
✓ Directory structure created

[2/8] Initializing Go module...
go: creating new go.mod: module github.com/myunila/integration-service
✓ Go module initialized

[3/8] Installing dependencies (this may take a while)...
go: downloading github.com/gofiber/fiber/v2 v2.52.2
go: downloading github.com/jmoiron/sqlx v1.4.0
go: downloading github.com/microsoft/go-mssqldb v1.7.2
go: downloading github.com/golang-jwt/jwt/v5 v5.3.0
go: downloading github.com/go-redis/redis/v8 v8.11.5
go: downloading github.com/google/uuid v1.6.0
go: downloading github.com/joho/godotenv v1.5.1
go: downloading github.com/robfig/cron/v3 v3.0.1
✓ Dependencies installed

[4/8] Creating .env.example...
✓ .env.example created

[5/8] Creating config package...
✓ Config package created

[6/8] Creating database connection...
✓ Database connection created

[7/8] Creating main.go...
✓ main.go created

[8/8] Creating Dockerfile...
✓ Dockerfile created

════════════════════════════════════════════════════════
✓ Go service 'integration-service' created successfully!
════════════════════════════════════════════════════════

Next steps:
  1. Edit .env file and configure database connection
  2. Add service to docker-compose.yml
  3. Build and run: docker-compose up -d

Location: /c/laragon/www/my-unila/backend/integration-service
```

---

## Struktur File yang Dihasilkan

### Laravel Service

```
notification-service/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── Controller.php
│   │   │       └── HealthController.php  ← Health check dengan DB & Redis check
│   │   └── Middleware/
│   ├── Repositories/  ← Siap untuk Repository pattern
│   └── Services/      ← Siap untuk Service layer
├── docker/
│   └── supervisord.conf  ← PHP-FPM + Queue Worker
├── routes/
│   └── api.php  ← API routes dengan /api/v1 prefix
├── .env.example  ← Configured untuk SQL Server + Redis
├── .env          ← Copy dari .env.example
├── Dockerfile    ← PHP 8.2 + SQL Server + Redis + Supervisor
├── composer.json ← Laravel 11 + JWT + Redis + Swagger
└── README.md
```

### Go Service

```
integration-service/
├── cmd/
│   └── api/
│       └── main.go  ← Entry point dengan Fiber + middleware
├── apps/
│   └── example/  ← Template untuk module baru
├── internal/
│   ├── config/
│   │   └── config.go  ← Configuration management
│   └── middleware/
├── external/
│   └── database/
│       └── sqlserver.go  ← SQL Server connection pool
├── pkg/
│   └── response/  ← Response helpers
├── database/
│   └── migrations/  ← SQL migration scripts
├── docs/  ← Swagger documentation
├── .env.example  ← Configured untuk SQL Server + Redis
├── .env          ← Copy dari .env.example
├── go.mod        ← Go dependencies
├── go.sum
├── Dockerfile    ← Multi-stage build optimized
└── README.md
```

---

## Test Health Check

### Laravel Service

```bash
$ curl http://localhost:8085/api/health

{
  "service": "Notification Service",
  "status": "healthy",
  "timestamp": "2025-01-25T10:30:00+07:00",
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "ok",
      "message": "Database connected"
    },
    "redis": {
      "status": "ok",
      "message": "Redis connected"
    }
  }
}
```

### Go Service

```bash
$ curl http://localhost:8087/health

{
  "status": "ok",
  "service": "Integration Service",
  "version": "1.0.0"
}

$ curl http://localhost:8087/

{
  "service": "Integration Service",
  "version": "1.0.0",
  "message": "Integration Service API",
  "endpoints": {
    "health": "/health",
    "api": "/api/v1"
  }
}
```

---

## Docker Compose Example

Setelah service dibuat, tambahkan ke `backend/docker-compose.yml`:

```yaml
services:
  # ... existing services ...

  notification-service:
    build: ./notification-service
    container_name: myunila-notification-service
    volumes:
      - ./notification-service:/var/www
      - notification_vendor:/var/www/vendor
    depends_on:
      - redis
    extra_hosts:
      - "host.docker.internal:host-gateway"
    networks:
      - myunila-network

  integration-service:
    build: ./integration-service
    container_name: myunila-integration-service
    ports:
      - "8087:8087"
    depends_on:
      - redis
    extra_hosts:
      - "host.docker.internal:host-gateway"
    networks:
      - myunila-network

volumes:
  # ... existing volumes ...
  notification_vendor:

networks:
  myunila-network:
    driver: bridge
```

---

## Build & Run

```bash
# Build service
cd backend
docker-compose build notification-service integration-service

# Start services
docker-compose up -d notification-service integration-service

# Check logs
docker logs myunila-notification-service -f
docker logs myunila-integration-service -f

# Check container status
docker ps | grep myunila

# Test endpoints
curl http://localhost:8085/api/health
curl http://localhost:8087/health
```

---

## 🎉 Success!

Jika semua berjalan lancar, Anda akan melihat:

✅ Container running dengan status "Up"
✅ Health check endpoint return status "ok" atau "healthy"
✅ Logs tidak ada error critical
✅ Database & Redis connected

---

## Troubleshooting

### Error: "Service already exists"

```
✗ Service 'notification-service' sudah ada!
```

**Solusi:** Gunakan nama service yang berbeda atau hapus service yang ada.

### Error: "Port already in use"

```
⚠ Port 8085 mungkin sudah digunakan!
```

**Solusi:** Gunakan port yang berbeda atau stop service yang menggunakan port tersebut.

### Error: "Composer install failed"

**Solusi:**
```bash
cd backend/notification-service
composer install --no-scripts
composer run-script post-autoload-dump
```

### Error: "Go dependencies download failed"

**Solusi:**
```bash
cd backend/integration-service
go mod download
go mod tidy
```

---

**Happy Coding! 🚀**
