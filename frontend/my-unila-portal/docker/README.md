# Docker Setup untuk My Unila Portal

Panduan untuk menjalankan aplikasi My Unila Portal menggunakan Docker.

## Prerequisites

- Docker Desktop atau Docker Engine (versi 20.10+)
- Docker Compose (versi 2.0+)

## 📁 Struktur File Docker

```
my-unila-portal/
├── docker/
│   ├── Dockerfile                 # Multi-stage build untuk production
│   ├── docker-compose.yml         # Orchestration container
│   ├── .dockerignore              # File yang diabaikan saat build
│   ├── start-production.bat       # Script Windows - Production
│   ├── start-development.bat      # Script Windows - Development
│   ├── start-production.sh        # Script Linux/Mac - Production
│   ├── start-development.sh       # Script Linux/Mac - Development
│   └── README.md                  # Dokumentasi ini
├── .env.example                   # Template environment variables
└── next.config.ts                 # Next.js config (standalone output enabled)
```

## 🚀 Quick Start

### Cara Termudah (Menggunakan Script)

**Windows:**
```bash
# Production Mode (port 3000)
cd docker
.\start-production.bat

# Development Mode (port 3001)
cd docker
.\start-development.bat
```

**Linux/Mac:**
```bash
# Production Mode (port 3000)
cd docker
./start-production.sh

# Development Mode (port 3001)
cd docker
./start-development.sh
```

Script ini akan otomatis:
- ✅ Stop container yang running
- ✅ Build image (jika ada perubahan)
- ✅ Start container
- ✅ Menampilkan status container

---

## 📝 Manual Setup

### 1. Setup Environment Variables

Buat file `.env` dari template di root project:

```bash
# Dari root project
cp .env.example .env
```

Edit file `.env` sesuai kebutuhan:

```env
NEXT_PUBLIC_APP_NAME=My Unila Portal
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NODE_ENV=production
```

### 2. Production Mode

**Cara Cepat (1 command):**
```bash
cd docker
docker-compose up -d --build frontend
```

**Atau Cara Manual:**
```bash
cd docker

# Build image
docker-compose build frontend

# Jalankan container
docker-compose up -d frontend
```

Aplikasi akan berjalan di **http://localhost:3000**

### 3. Development Mode

```bash
cd docker

# Jalankan dengan profile dev
docker-compose --profile dev up -d frontend-dev
```

Development server akan berjalan di **http://localhost:3001** dengan hot-reload.

---

## 🔧 Perintah Docker Berguna

### Build dan Management

```bash
cd docker

# Build ulang tanpa cache
docker-compose build --no-cache frontend

# Stop container
docker-compose stop frontend

# Stop dan hapus container
docker-compose down

# Stop dan hapus container beserta volumes
docker-compose down -v

# Restart container
docker-compose restart frontend
```

### Logs dan Monitoring

```bash
cd docker

# Lihat logs
docker-compose logs frontend

# Follow logs secara real-time
docker-compose logs -f frontend

# Lihat 100 baris terakhir
docker-compose logs --tail=100 frontend

# Lihat container yang berjalan
docker-compose ps

# Lihat resource usage
docker stats my-unila-portal-frontend
```

### Debugging

```bash
# Masuk ke dalam container
docker exec -it my-unila-portal-frontend sh

# Inspect container
docker inspect my-unila-portal-frontend

# Lihat logs container langsung
docker logs my-unila-portal-frontend
```

### Cleanup

```bash
# Hapus container yang stopped
docker container prune

# Hapus image yang tidak terpakai
docker image prune

# Hapus semua (hati-hati!)
docker system prune -a
```

---

## 📊 Struktur Multi-Stage Dockerfile

Dockerfile menggunakan 3 stage untuk optimasi:

1. **deps** - Install dependencies
2. **builder** - Build aplikasi Next.js
3. **runner** - Runtime minimal untuk production

**Keuntungan:**
- ✅ Image size lebih kecil (~150MB vs ~1GB)
- ✅ Security lebih baik (hanya runtime dependencies)
- ✅ Build time lebih cepat dengan caching

---

## 🌍 Environment Variables

### Build Time
- `NEXT_TELEMETRY_DISABLED` - Disable Next.js telemetry
- `NODE_ENV` - Environment mode

### Runtime
- `NEXT_PUBLIC_API_URL` - URL Backend API
- `NEXT_PUBLIC_APP_NAME` - Nama aplikasi
- `NEXT_PUBLIC_APP_URL` - URL aplikasi
- `PORT` - Port aplikasi (default: 3000)
- `HOSTNAME` - Hostname untuk binding (default: 0.0.0.0)

---

## 🔍 Troubleshooting

### Port sudah digunakan

```bash
# Cek process yang menggunakan port 3000 (Windows)
netstat -ano | findstr :3000

# Cek process yang menggunakan port 3000 (Linux/Mac)
lsof -i :3000

# Atau ubah port di docker-compose.yml
ports:
  - "3001:3000"  # Port host:container
```

### Build gagal karena memory

```bash
cd docker

# Tambahkan memory limit
docker-compose build --memory 4g frontend
```

### Hot reload tidak berfungsi di Windows

Sudah ditambahkan `WATCHPACK_POLLING=true` di development mode.

### Permission issues di Linux/Mac

```bash
# Pastikan ownership benar
sudo chown -R $USER:$USER .

# Atau berikan execute permission untuk scripts
chmod +x docker/*.sh
```

### Container crash atau tidak start

```bash
cd docker

# Lihat logs detail
docker-compose logs frontend

# Rebuild dari awal tanpa cache
docker-compose build --no-cache frontend
docker-compose up frontend
```

---

## 🔗 Integrasi dengan Backend

Jika backend juga menggunakan Docker, update `docker-compose.yml`:

```yaml
services:
  backend:
    image: your-backend-image
    container_name: my-unila-backend
    ports:
      - "8000:8000"
    networks:
      - my-unila-network

  frontend:
    # ... existing config
    depends_on:
      - backend
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000/api
```

---

## 🚀 Production Deployment

### Docker Hub

```bash
cd docker

# Tag image
docker tag my-unila-portal-frontend username/my-unila-portal:latest

# Push ke Docker Hub
docker push username/my-unila-portal:latest
```

### Docker Registry Pribadi

```bash
# Tag untuk registry pribadi
docker tag my-unila-portal-frontend registry.example.com/my-unila-portal:latest

# Push ke registry
docker push registry.example.com/my-unila-portal:latest
```

### Deploy ke Server

```bash
# Di server production
git pull
cd docker
docker-compose pull
docker-compose up -d --build frontend
```

---

## 🏥 Health Check

Container sudah dilengkapi health check yang akan memeriksa endpoint `/api/health` setiap 30 detik.

```bash
# Cek health status
docker inspect my-unila-portal-frontend --format='{{.State.Health.Status}}'
```

---

## ⚡ Performance Tips

1. **Layer Caching** - Dependencies di-cache untuk mempercepat rebuild
2. **Multi-stage Build** - Hanya file production yang masuk ke final image
3. **Non-root User** - Security best practice
4. **Standalone Output** - Next.js menghasilkan bundle minimal

---

## 🔒 Security

- ✅ Container berjalan sebagai non-root user (`nextjs`)
- ✅ Minimal dependencies di production image
- ✅ No source code di final image (hanya compiled files)
- ✅ Environment variables untuk sensitive data
- ✅ Health check untuk monitoring

---

## 📈 Monitoring

### Container Stats

```bash
# Real-time stats
docker stats my-unila-portal-frontend

# Stats semua container
docker stats
```

### Logs dengan Timestamp

```bash
cd docker

# Logs dengan timestamp
docker-compose logs -f -t frontend
```

---

## 🆘 Support

Untuk issues atau pertanyaan, silakan buka issue di repository project.

---

## 📌 Catatan Penting

1. **Semua perintah docker-compose harus dijalankan dari folder `docker/`**
2. **File `.env` tetap di root project** (satu level dengan `package.json`)
3. **Scripts otomatis masuk ke folder `docker/`** sebelum menjalankan perintah
4. **Build context tetap di root project** (untuk akses ke semua file Next.js)

---

## 🎯 Command Cheat Sheet

```bash
# Production
cd docker && docker-compose up -d --build frontend
cd docker && docker-compose logs -f frontend
cd docker && docker-compose down

# Development
cd docker && docker-compose --profile dev up -d frontend-dev
cd docker && docker-compose logs -f frontend-dev
cd docker && docker-compose --profile dev down

# Maintenance
cd docker && docker-compose restart frontend
cd docker && docker-compose ps
docker stats my-unila-portal-frontend
```
