# Local Development Environment - MyUnila

Dokumentasi lengkap untuk setup dan menjalankan MyUnila di local development environment (Windows dengan Laragon).

## 📋 Table of Contents

- [Arsitektur](#arsitektur)
- [Prerequisites](#prerequisites)
- [Setup Awal](#setup-awal)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ Arsitektur

```
Frontend (Next.js) → Kong Gateway → Backend Services
                          ↓
                    Auth/Dashboard/Sister
                          ↓
                    Nginx → PHP-FPM/Go
                          ↓
                    Redis + SQL Server
```

## 🚀 Setup Awal - Quick Start

### Step 1: Clone & Setup
```bash
git clone <repo>
cd my-unila/deployment/local
```

### Step 2: Create Network
```bash
docker network create myunila-network
```

### Step 3: Build & Start (Pertama Kali)
```bash
bash scripts/clean-rebuild-all.sh
```
⏱️ ~10-15 menit

### Step 4: Verify
```bash
curl http://localhost:9800/dashboard-service/public/api/v1/unila/statistics
```

## 💻 Development Workflow

### Daily Workflow

```bash
# Pagi - Start
bash scripts/dev-quick-start.sh

# Development...
# Edit code → Rebuild service

# Sore - Stop
bash scripts/dev-stop.sh
```

### Available Scripts

#### 1. Quick Start
```bash
bash scripts/dev-quick-start.sh
```
Start semua services (sudah pernah build)

#### 2. Rebuild Service
```bash
bash scripts/rebuild-service.sh [auth|dashboard|sister|all]
```
Kapan: Ada perubahan code, install package

#### 3. Restart Service  
```bash
bash scripts/restart-service.sh [auth|dashboard|sister|nginx|all]
```
Kapan: Ubah .env, update config

#### 4. Stop All
```bash
bash scripts/dev-stop.sh
```

#### 5. Clean Rebuild
```bash
bash scripts/clean-rebuild-all.sh
```
Kapan: Ada masalah aneh, fresh start

## 📚 Common Tasks

### Edit PHP Code (Dashboard/Auth)
```bash
# 1. Edit code di backend/dashboard-service/
# 2. Rebuild
bash scripts/rebuild-service.sh dashboard
```

### Edit Go Code (Sister)
```bash
# 1. Edit code di backend/sister-service/
# 2. Rebuild  
bash scripts/rebuild-service.sh sister
```

### Ubah .env
```bash
# 1. Edit deployment/local/.env
# 2. Restart (no rebuild needed)
bash scripts/restart-service.sh all
```

## 🔍 Monitoring

### Check Status
```bash
docker ps --filter "name=myunila"
```

### View Logs
```bash
docker logs -f myunila-dashboard-service
docker logs -f myunila-auth-service
docker logs -f myunila-sister-service
```

### Test Endpoints
```bash
# Via Kong (recommended)
curl http://localhost:9800/dashboard-service/public/api/v1/unila/statistics
curl http://localhost:9800/auth-service/api/health
curl http://localhost:9800/sister-service/health
```

## 🌐 Available Endpoints

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Kong Proxy | http://localhost:9800 | 9800 |
| Kong Admin | http://localhost:9801 | 9801 |
| Kong UI | http://localhost:9803 | 9803 |
| Auth Direct | http://localhost:8081 | 8081 |
| Dashboard Direct | http://localhost:8082 | 8082 |
| Sister Direct | http://localhost:8083 | 8083 |
| Redis | localhost:6379 | 6379 |
| Meilisearch | http://localhost:7700 | 7700 |

## 🐛 Troubleshooting

### Container Unhealthy
```bash
docker logs myunila-[service]
bash scripts/restart-service.sh [service]
```

### Port Already Used
```bash
netstat -ano | findstr :9800
# Kill process or change port in .env
```

### Database Connection Error
```bash
# Check .env credentials
# Test connection: telnet 192.168.123.119 1433
bash scripts/restart-service.sh dashboard
```

### CORS Error
```bash
bash scripts/setup-kong-routes.sh
```

## 📁 File Structure

```
deployment/local/
├── .env                    # Environment variables
├── README.md              # This file
├── configs/
│   └── nginx/             # Nginx configs
├── scripts/
│   ├── dev-quick-start.sh
│   ├── dev-stop.sh
│   ├── rebuild-service.sh
│   ├── restart-service.sh
│   ├── clean-rebuild-all.sh
│   └── setup-kong-routes.sh
└── services/
    ├── 1-infrastructure/
    ├── 2-gateway/
    └── 3-backend/
```

## 📝 Quick Reference

| Skenario | Command |
|----------|---------|
| Start development | `bash scripts/dev-quick-start.sh` |
| Edit PHP code | `bash scripts/rebuild-service.sh dashboard` |
| Edit Go code | `bash scripts/rebuild-service.sh sister` |
| Ubah .env | `bash scripts/restart-service.sh all` |
| Stop semua | `bash scripts/dev-stop.sh` |
| Fresh rebuild | `bash scripts/clean-rebuild-all.sh` |

## 🆘 Need Help?

1. Check logs: `docker logs myunila-[service]`
2. Read [scripts/README.md](scripts/README.md)
3. Try clean rebuild if all else fails

---

**Happy Development! 🚀**

Last Updated: November 2025
