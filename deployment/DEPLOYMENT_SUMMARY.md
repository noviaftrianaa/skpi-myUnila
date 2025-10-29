# 🚀 MY UNILA - DEPLOYMENT SUMMARY & QUICK GUIDE

**Tanggal:** 2025-10-29
**Versi:** 1.0
**Status:** Ready for Production
**Estimasi Waktu:** 3-4 Hari

---

## 📋 TABLE OF CONTENTS

1. [Infrastructure Overview](#infrastructure-overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Phase 1: Persiapan (Hari 1)](#phase-1-persiapan-hari-1)
4. [Phase 2: VM Ubuntu 1 - Frontend & Gateway (Hari 2)](#phase-2-vm-ubuntu-1---frontend--gateway-hari-2)
5. [Phase 3: VM Ubuntu 2 - Backend Services (Hari 2-3)](#phase-3-vm-ubuntu-2---backend-services-hari-2-3)
6. [Phase 4: Windows Server 1 - Monitoring (Hari 3)](#phase-4-windows-server-1---monitoring-hari-3)
7. [Phase 5: Integration & Testing (Hari 3-4)](#phase-5-integration--testing-hari-3-4)
8. [Post-Deployment Tasks](#post-deployment-tasks)
9. [Troubleshooting Common Issues](#troubleshooting-common-issues)

---

## 🏗️ INFRASTRUCTURE OVERVIEW

### **Server Allocation**

```
┌─────────────────────────────────────────────────────────────┐
│  VM UBUNTU 1 - Frontend & Gateway                           │
│  IP: 192.168.1.10 | 8C/16GB/100GB                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • Next.js Frontend (Production)                      │   │
│  │ • Kong API Gateway + PostgreSQL                      │   │
│  │ • Nginx (SSL Termination)                            │   │
│  │ • Monitoring Exporters (node-exporter, cadvisor)     │   │
│  └──────────────────────────────────────────────────────┘   │
│  RAM Usage: ~1.9GB (12%) | Headroom: 88%                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  VM UBUNTU 2 - Backend Services                             │
│  IP: 192.168.1.11 | 8C/16GB/100GB                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • Auth Service (Laravel) - Port 8081                 │   │
│  │ • Dashboard Service (Laravel) - Port 8082            │   │
│  │ • Sister Service (Go) - Port 8083                    │   │
│  │ • Redis (Cache/Session/Queue) - Port 6379           │   │
│  │ • Nginx (Internal Proxy)                             │   │
│  │ • Monitoring Exporters                               │   │
│  └──────────────────────────────────────────────────────┘   │
│  RAM Usage: ~400MB (2.5%) | Headroom: 97.5%                │
│  Ready for: 20+ additional microservices                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  WINDOWS SERVER 1 - Monitoring                              │
│  IP: 192.168.1.12 | 16GB/Xeon 5218R                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • Prometheus (Native Windows) - Port 9090            │   │
│  │ • Grafana (Native Windows) - Port 3002               │   │
│  │ • AlertManager (Optional) - Port 9093                │   │
│  └──────────────────────────────────────────────────────┘   │
│  RAM Usage: ~730MB (4.5%)                                   │
│  Monitors: All Ubuntu VMs + Windows Server 2                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  WINDOWS SERVER 2 - Database                                │
│  IP: 192.168.1.13 | 16GB/Xeon 5218R                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • SQL Server 2022 - Port 1433                        │   │
│  │ • Database: pdut_dev                                 │   │
│  │ • Automated Backups                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### **Network Architecture**

```
Internet → Firewall → VM Ubuntu 1 (Public DMZ)
                            ↓
                      Kong Gateway
                            ↓
            ┌───────────────┴───────────────┐
            ↓                               ↓
      VM Ubuntu 2                    Windows Server 1
   (Backend Services)                   (Monitoring)
            ↓
      Windows Server 2
        (Database)
```

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### **1. Domain & DNS** 🌐

- [ ] Domain sudah terdaftar (e.g., myunila.ac.id)
- [ ] DNS A Records configured:
  ```
  myunila.ac.id        → 192.168.1.10 (VM Ubuntu 1)
  api.myunila.ac.id    → 192.168.1.10 (VM Ubuntu 1)
  monitoring.myunila.ac.id → 192.168.1.12 (Windows Server 1)
  ```
- [ ] DNS propagation complete (check: `nslookup myunila.ac.id`)

### **2. Server Access** 🔑

- [ ] SSH access ke VM Ubuntu 1: `ssh user@192.168.1.10`
- [ ] SSH access ke VM Ubuntu 2: `ssh user@192.168.1.11`
- [ ] RDP access ke Windows Server 1: `192.168.1.12`
- [ ] RDP access ke Windows Server 2: `192.168.1.13`
- [ ] SSH key-based authentication setup (disable password auth)

### **3. IP Address Assignment** 📡

**Update all `.env.example` files dengan IP actual:**

| Server | Placeholder | Your IP | Status |
|--------|-------------|---------|--------|
| VM Ubuntu 1 | 192.168.1.10 | ____________ | ⬜ |
| VM Ubuntu 2 | 192.168.1.11 | ____________ | ⬜ |
| Windows Server 1 | 192.168.1.12 | ____________ | ⬜ |
| Windows Server 2 | 192.168.1.13 | ✅ (already set) | ✅ |

### **4. Generate Secrets** 🔐

**IMPORTANT:** Generate strong random passwords!

```bash
# 1. Kong PostgreSQL Password
openssl rand -base64 32
# Save as: KONG_PG_PASSWORD
# Example: xK8mP3vR9wL2jH4nQ7tY6uE5dA1sZ0bN

# 2. JWT Secret (untuk Auth Service)
openssl rand -base64 64
# Save as: JWT_SECRET
# Example: [long base64 string]

# 3. API Config Encryption Key (exactly 32 characters!)
openssl rand -base64 32 | cut -c1-32
# Save as: API_CONFIG_ENCRYPTION_KEY
# Example: abcdef1234567890abcdef1234567890

# 4. Laravel APP_KEY untuk Auth Service
# Run in Laravel container:
php artisan key:generate --show
# Example: base64:Xy3nM5kL8pQ2wR7vT4uE9dA6sZ1bN0cH

# 5. Laravel APP_KEY untuk Dashboard Service
php artisan key:generate --show
# Example: base64:Qw9rT6yU3eR8pL5kJ2hG4fD7sA1zX0cV

# 6. Redis Password (Optional - leave empty jika internal network)
openssl rand -base64 16
# Example: pL9kM6nR3tY2wQ5v
```

**⚠️ CRITICAL:** Simpan semua password ini di **Password Manager** (e.g., 1Password, LastPass, KeePass)!

### **5. SSL Certificates** 🔒

**Option A: Let's Encrypt (Recommended - Free)**
```bash
# Will be setup during VM Ubuntu 1 deployment
certbot certonly --standalone \
  -d myunila.ac.id \
  -d api.myunila.ac.id \
  --email admin@myunila.ac.id
```

**Option B: Commercial SSL (e.g., Comodo, DigiCert)**
- [ ] Certificate files ready: `fullchain.pem`, `privkey.pem`
- [ ] Upload to `/etc/letsencrypt/live/myunila.ac.id/`

### **6. Database Preparation** 💾

- [ ] SQL Server 2022 running di Windows Server 2
- [ ] Database `pdut_dev` sudah created
- [ ] User credentials ready:
  ```sql
  Username: ____________
  Password: ____________
  ```
- [ ] Firewall allows connection dari VM Ubuntu 2
  ```powershell
  # On Windows Server 2
  New-NetFirewallRule -DisplayName "SQL Server from VM2" `
    -Direction Inbound -LocalPort 1433 -Protocol TCP -Action Allow `
    -RemoteAddress 192.168.1.11
  ```
- [ ] Test connection dari VM Ubuntu 2:
  ```bash
  telnet 192.168.1.13 1433
  ```

### **7. SISTER API Credentials** 🎓

- [ ] ID Pengguna (UUID) dari portal SISTER
- [ ] Username (encrypted)
- [ ] Password (encrypted)

**Cara encrypt credentials:**
```bash
# Will be done via API Config UI setelah deployment
# Or manual encrypt menggunakan Sister Service API
```

### **8. Repository Access** 📦

- [ ] Git repository cloned atau ready untuk clone
- [ ] Repository URL: `https://bitbucket.org/mahendraunila/my-unila.git`
- [ ] Git credentials configured
- [ ] All deployment files verified:
  ```bash
  deployment/
  ├── README.md
  ├── DEPLOYMENT_SUMMARY.md
  ├── COMPLETE_FILE_LIST.md
  ├── docs/ARCHITECTURE.md
  ├── vm-ubuntu-1/
  ├── vm-ubuntu-2/
  └── windows-server-1/
  ```

---

## 📅 PHASE 1: PERSIAPAN (HARI 1)

**Durasi:** ~4 jam
**Objective:** Setup dasar semua server, install prerequisites

### **1.1 Setup VM Ubuntu 1 & 2** (Parallel - 1 jam)

**On BOTH Ubuntu VMs:**

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Docker & Docker Compose
sudo apt install -y docker.io docker-compose git curl wget ufw

# 3. Enable Docker
sudo systemctl enable docker
sudo systemctl start docker

# 4. Add user to docker group
sudo usermod -aG docker $USER

# 5. Verify installation
docker --version
docker-compose --version

# 6. Logout & login kembali untuk apply group
exit
```

**Login kembali:**
```bash
ssh user@192.168.1.10  # VM Ubuntu 1
ssh user@192.168.1.11  # VM Ubuntu 2
```

### **1.2 Install Monitoring Exporters** (Parallel pada VM1 & VM2 - 30 menit)

**On BOTH Ubuntu VMs:**

```bash
# Node Exporter (Host Metrics)
docker run -d \
  --name=node-exporter \
  --net="host" \
  --pid="host" \
  -v "/:/host:ro,rslave" \
  --restart=unless-stopped \
  prom/node-exporter:latest \
  --path.rootfs=/host

# cAdvisor (Container Metrics)
docker run -d \
  --name=cadvisor \
  --volume=/:/rootfs:ro \
  --volume=/var/run:/var/run:ro \
  --volume=/sys:/sys:ro \
  --volume=/var/lib/docker/:/var/lib/docker:ro \
  --volume=/dev/disk/:/dev/disk:ro \
  --publish=8090:8080 \
  --detach=true \
  --privileged \
  --device=/dev/kmsg \
  --restart=unless-stopped \
  --name=cadvisor \
  gcr.io/cadvisor/cadvisor:latest

# Verify
docker ps
curl http://localhost:9100/metrics
curl http://localhost:8090/metrics
```

### **1.3 Setup Windows Server 1 - Basic** (30 menit)

**RDP ke Windows Server 1:**

```powershell
# 1. Create monitoring directory
New-Item -ItemType Directory -Path "C:\monitoring" -Force

# 2. Check system requirements
systeminfo
Get-NetFirewallProfile

# 3. Enable Remote Desktop (if not enabled)
Set-ItemProperty -Path 'HKLM:\System\CurrentControlSet\Control\Terminal Server' -name "fDenyTSConnections" -value 0
Enable-NetFirewallRule -DisplayGroup "Remote Desktop"

# 4. Download Chocolatey installer (untuk later use)
Set-ExecutionPolicy Bypass -Scope Process -Force
```

### **1.4 Clone Repository ke Semua Server** (30 menit)

**On VM Ubuntu 1:**
```bash
sudo mkdir -p /opt/my-unila
cd /opt/my-unila
sudo git clone https://bitbucket.org/mahendraunila/my-unila.git .
sudo chown -R $USER:$USER /opt/my-unila
```

**On VM Ubuntu 2:**
```bash
sudo mkdir -p /opt/my-unila
cd /opt/my-unila
sudo git clone https://bitbucket.org/mahendraunila/my-unila.git .
sudo chown -R $USER:$USER /opt/my-unila
```

**On Windows Server 1:**
```powershell
cd C:\monitoring
# Copy deployment/windows-server-1/ folder dari local machine
# Or clone via Git for Windows
```

### **1.5 Network Testing** (30 menit)

**Test connectivity antara servers:**

```bash
# From VM Ubuntu 1
ping 192.168.1.11  # VM Ubuntu 2
ping 192.168.1.12  # Windows Server 1
ping 192.168.1.13  # Windows Server 2

# From VM Ubuntu 2
ping 192.168.1.10  # VM Ubuntu 1
ping 192.168.1.13  # Windows Server 2
telnet 192.168.1.13 1433  # SQL Server

# From Windows Server 1
ping 192.168.1.10
ping 192.168.1.11
```

**Expected Result:**
- ✅ All servers dapat saling ping
- ✅ VM Ubuntu 2 dapat connect ke SQL Server port 1433

---

## 🚀 PHASE 2: VM UBUNTU 1 - FRONTEND & GATEWAY (HARI 2)

**Durasi:** ~6 jam
**Objective:** Deploy frontend, Kong Gateway, Nginx dengan SSL

### **2.1 Configure Environment** (30 menit)

```bash
cd /opt/my-unila/deployment/vm-ubuntu-1

# Copy template
cp .env.example .env

# Edit dengan nilai production
nano .env
```

**Edit `.env` file:**
```env
# Frontend
NEXT_PUBLIC_APP_NAME=My Unila Portal
NEXT_PUBLIC_APP_URL=https://myunila.ac.id
NEXT_PUBLIC_API_URL=https://api.myunila.ac.id
NEXT_PUBLIC_SISTER_API_URL=http://192.168.1.11:8083/public

# Kong
KONG_PG_USER=kong
KONG_PG_DATABASE=kong
KONG_PG_PASSWORD=<GENERATED_PASSWORD>  # ← Paste dari Pre-Deployment

# Backend Services (untuk Kong routing)
BACKEND_AUTH_URL=http://192.168.1.11:8081
BACKEND_DASHBOARD_URL=http://192.168.1.11:8082
BACKEND_SISTER_URL=http://192.168.1.11:8083
```

**Save dan verify:**
```bash
cat .env | grep -v PASSWORD  # Verify (hide passwords)
```

### **2.2 Setup SSL Certificate** (1 jam)

```bash
# 1. Stop any service menggunakan port 80
sudo systemctl stop nginx 2>/dev/null || true
sudo systemctl stop apache2 2>/dev/null || true

# 2. Install Certbot
sudo apt install -y certbot

# 3. Get SSL certificate
sudo certbot certonly --standalone \
  -d myunila.ac.id \
  -d api.myunila.ac.id \
  --email admin@myunila.ac.id \
  --agree-tos \
  --non-interactive

# 4. Verify certificates
sudo ls -la /etc/letsencrypt/live/myunila.ac.id/
# Should see: fullchain.pem, privkey.pem

# 5. Setup auto-renewal (cron job)
sudo crontab -e
# Add this line:
0 3 * * * certbot renew --quiet --post-hook "cd /opt/my-unila/deployment/vm-ubuntu-1 && docker-compose restart nginx"
```

### **2.3 Configure Firewall** (30 menit)

```bash
# 1. Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 2. Allow SSH (CRITICAL - do this first!)
sudo ufw allow 22/tcp
sudo ufw allow OpenSSH

# 3. Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 4. Allow Kong Gateway
sudo ufw allow 9800/tcp
sudo ufw allow 9801/tcp

# 5. Allow monitoring dari Windows Server 1
sudo ufw allow from 192.168.1.12 to any port 9100
sudo ufw allow from 192.168.1.12 to any port 8090

# 6. Enable firewall
sudo ufw enable

# 7. Verify
sudo ufw status numbered
```

### **2.4 Deploy Services** (2 jam)

```bash
cd /opt/my-unila/deployment/vm-ubuntu-1

# 1. Pull base images
sudo docker-compose pull

# 2. Build frontend (production)
sudo docker-compose build frontend

# 3. Start all services
sudo docker-compose up -d

# 4. Wait for services to be healthy (2-3 minutes)
sleep 120

# 5. Check status
sudo docker-compose ps
```

**Expected Output:**
```
NAME                          STATUS              PORTS
myunila-kong-db-prod         Up (healthy)        5432/tcp
myunila-kong-migration-prod  Exited (0)
myunila-kong-prod            Up (healthy)        0.0.0.0:9800-9802->8000-8002/tcp
myunila-frontend-prod        Up (healthy)        3000/tcp
myunila-nginx-prod           Up (healthy)        0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
myunila-node-exporter-vm1    Up                  0.0.0.0:9100->9100/tcp
myunila-cadvisor-vm1         Up                  0.0.0.0:8090->8080/tcp
```

### **2.5 Verify Deployment** (1 jam)

```bash
# 1. Check logs
sudo docker-compose logs -f --tail=50

# 2. Test frontend (internal)
curl http://localhost:3000
# Expected: HTML response

# 3. Test Kong Gateway
curl http://localhost:9800
# Expected: {"message":"no Route matched with those values"}

# 4. Test Kong Admin API
curl http://localhost:9801/services
# Expected: {"data":[],...}

# 5. Test Nginx (HTTP)
curl http://localhost:80
# Expected: Redirect to HTTPS or frontend HTML

# 6. Test HTTPS (from external machine or use curl with SSL)
curl https://myunila.ac.id
# Expected: Frontend HTML

# 7. Test monitoring endpoints
curl http://localhost:9100/metrics | head -20
curl http://localhost:8090/metrics | head -20
```

### **2.6 Troubleshooting (if needed)**

**Issue: Frontend container restarting**
```bash
sudo docker-compose logs frontend
# Check for build errors or environment variable issues
```

**Issue: Kong tidak healthy**
```bash
sudo docker-compose logs kong
sudo docker exec myunila-kong-db-prod pg_isready
# Check database connection
```

**Issue: SSL certificate failed**
```bash
sudo certbot certificates
sudo certbot renew --dry-run
# Re-run certbot with --force-renewal if needed
```

---

## 🔧 PHASE 3: VM UBUNTU 2 - BACKEND SERVICES (HARI 2-3)

**Durasi:** ~4-5 jam
**Objective:** Deploy Auth, Dashboard, Sister services + Redis

### **3.1 Configure Environment** (1 jam)

```bash
cd /opt/my-unila/deployment/vm-ubuntu-2

# Copy template
cp .env.example .env

# Edit dengan nilai production
nano .env
```

**Edit `.env` file dengan detail:**
```env
# ==========================================
# DATABASE (Windows Server 2)
# ==========================================
DB_HOST=192.168.1.13
DB_PORT=1433
DB_DATABASE=pdut_dev
DB_USERNAME=<YOUR_SQL_USERNAME>
DB_PASSWORD=<YOUR_SQL_PASSWORD>

# ==========================================
# REDIS
# ==========================================
REDIS_PASSWORD=
# Leave empty jika internal network only

# ==========================================
# AUTH SERVICE (Laravel)
# ==========================================
AUTH_APP_NAME=Auth Service
AUTH_APP_KEY=<GENERATED_LARAVEL_KEY>  # base64:xxxxx
AUTH_APP_URL=http://192.168.1.11:8081

# JWT
JWT_SECRET=<GENERATED_JWT_SECRET>
JWT_TTL=60

# ==========================================
# DASHBOARD SERVICE (Laravel)
# ==========================================
DASHBOARD_APP_NAME=Dashboard Service
DASHBOARD_APP_KEY=<GENERATED_LARAVEL_KEY>  # base64:xxxxx
DASHBOARD_APP_URL=http://192.168.1.11:8082

AUTH_SERVICE_URL=http://auth-service:9000

# ==========================================
# SISTER SERVICE (Go)
# ==========================================
SISTER_API_BASE_URL=https://sister-api.kemdikbud.go.id/ws.php
SISTER_API_IDPENGGUNA=<YOUR_SISTER_ID_PENGGUNA>
SISTER_API_USERNAME=<YOUR_ENCRYPTED_USERNAME>
SISTER_API_PASSWORD=<YOUR_ENCRYPTED_PASSWORD>

# API Config Encryption (exactly 32 chars)
API_CONFIG_ENCRYPTION_KEY=<GENERATED_32_CHAR_KEY>

# ==========================================
# CORS
# ==========================================
CORS_ALLOWED_ORIGINS=https://myunila.ac.id,https://api.myunila.ac.id
```

**Verify:**
```bash
# Check all required variables are set
grep -E "DB_HOST|DB_USERNAME|JWT_SECRET|API_CONFIG_ENCRYPTION_KEY" .env
```

### **3.2 Configure Firewall** (30 menit)

```bash
# 1. Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 2. Allow SSH
sudo ufw allow 22/tcp

# 3. Allow backend services dari VM Ubuntu 1 only
sudo ufw allow from 192.168.1.10 to any port 8081  # Auth
sudo ufw allow from 192.168.1.10 to any port 8082  # Dashboard
sudo ufw allow from 192.168.1.10 to any port 8083  # Sister

# 4. Allow Redis dari VM Ubuntu 1 only
sudo ufw allow from 192.168.1.10 to any port 6379

# 5. Allow monitoring dari Windows Server 1
sudo ufw allow from 192.168.1.12 to any port 9100
sudo ufw allow from 192.168.1.12 to any port 8090
sudo ufw allow from 192.168.1.12 to any port 9121

# 6. Allow outbound ke database
sudo ufw allow out to 192.168.1.13 port 1433

# 7. Enable
sudo ufw enable

# 8. Verify
sudo ufw status numbered
```

### **3.3 Test Database Connection** (15 menit)

```bash
# Test from VM Ubuntu 2 to Windows Server 2
telnet 192.168.1.13 1433

# If telnet successful, proceed
# If failed:
# - Check Windows Server 2 firewall
# - Check SQL Server is listening on 1433
# - Check SQL Server allows remote connections
```

**On Windows Server 2 (if connection fails):**
```powershell
# Check SQL Server configuration
Get-Service -Name MSSQLSERVER
netstat -an | findstr 1433

# Allow firewall
New-NetFirewallRule -DisplayName "SQL Server from VM2" `
  -Direction Inbound -LocalPort 1433 -Protocol TCP -Action Allow `
  -RemoteAddress 192.168.1.11
```

### **3.4 Deploy Services** (2 jam)

```bash
cd /opt/my-unila/deployment/vm-ubuntu-2

# 1. Pull base images
sudo docker-compose pull

# 2. Build all services
sudo docker-compose build

# 3. Start services
sudo docker-compose up -d

# 4. Wait for services (1-2 minutes)
sleep 90

# 5. Check status
sudo docker-compose ps
```

**Expected Output:**
```
NAME                               STATUS              PORTS
myunila-redis-prod                Up (healthy)        0.0.0.0:6379->6379/tcp
myunila-auth-service-prod         Up (healthy)        9000/tcp
myunila-dashboard-service-prod    Up (healthy)        9000/tcp
myunila-sister-service-prod       Up (healthy)        0.0.0.0:8083->8083/tcp
myunila-nginx-backend-prod        Up (healthy)        0.0.0.0:8081-8082->8081-8082/tcp
myunila-node-exporter-vm2         Up                  0.0.0.0:9100->9100/tcp
myunila-cadvisor-vm2              Up                  0.0.0.0:8090->8080/tcp
myunila-redis-exporter-prod       Up                  0.0.0.0:9121->9121/tcp
```

### **3.5 Run Database Migrations** (30 menit)

```bash
# 1. Auth Service migrations
sudo docker exec myunila-auth-service-prod php artisan migrate --force

# Check for errors, if success:
sudo docker exec myunila-auth-service-prod php artisan db:seed --force

# 2. Dashboard Service migrations
sudo docker exec myunila-dashboard-service-prod php artisan migrate --force

# 3. Sister Service - verify database tables
sudo docker exec myunila-sister-service-prod wget -qO- http://localhost:8083/health
# Expected: {"status":"healthy"}
```

**If migration fails:**
```bash
# Check logs
sudo docker-compose logs auth-service
sudo docker-compose logs dashboard-service

# Common issues:
# - Database connection failed → Check DB credentials in .env
# - Table already exists → Normal, skip or use --force
# - Syntax error → Check migration files
```

### **3.6 Verify Deployment** (1 jam)

```bash
# 1. Test Redis
sudo docker exec myunila-redis-prod redis-cli ping
# Expected: PONG

# 2. Test Auth Service
curl http://localhost:8081/health
curl http://localhost:8081/api/v1/health

# 3. Test Dashboard Service
curl http://localhost:8082/health

# 4. Test Sister Service
curl http://localhost:8083/health
curl http://localhost:8083/public/monitoring/active

# 5. Check logs (no errors)
sudo docker-compose logs --tail=50 auth-service
sudo docker-compose logs --tail=50 dashboard-service
sudo docker-compose logs --tail=50 sister-service

# 6. Test monitoring endpoints
curl http://localhost:9100/metrics | head -20
curl http://localhost:8090/metrics | head -20
curl http://localhost:9121/metrics | head -20
```

### **3.7 Initial Configuration** (30 menit)

**Create test user in Auth Service:**
```bash
sudo docker exec -it myunila-auth-service-prod php artisan tinker

# In tinker:
User::create([
    'name' => 'Admin',
    'email' => 'admin@myunila.ac.id',
    'password' => bcrypt('password'),
    'email_verified_at' => now()
]);
exit
```

**Configure SISTER API credentials via UI (after Kong setup):**
- Access: https://myunila.ac.id/settings/api-config
- Add SISTER API configuration
- Input encrypted credentials

---

## 📊 PHASE 4: WINDOWS SERVER 1 - MONITORING (HARI 3)

**Durasi:** ~3 jam
**Objective:** Setup Prometheus + Grafana untuk monitoring

### **4.1 Automated Setup** ⭐ **RECOMMENDED** (1 jam)

```powershell
# 1. Open PowerShell as Administrator
# Right-click PowerShell → Run as Administrator

# 2. Navigate to monitoring directory
cd C:\monitoring

# 3. Copy setup files
# Ensure deployment/windows-server-1/ files are in C:\monitoring

# 4. Update IP addresses in setup script
notepad setup-monitoring.ps1
# Edit lines:
#   $vmUbuntu1IP = "192.168.1.10"  # ← Your actual IP
#   $vmUbuntu2IP = "192.168.1.11"  # ← Your actual IP

# 5. Set execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 6. Run setup script
.\setup-monitoring.ps1

# 7. Follow prompts
# Script will:
# - Install Chocolatey
# - Install NSSM
# - Download & install Prometheus
# - Download & install Grafana
# - Configure firewall
# - Start services

# 8. Verify services
Get-Service Prometheus
Get-Service Grafana

# 9. Open in browser
Start-Process "http://localhost:9090"  # Prometheus
Start-Process "http://localhost:3002"  # Grafana
```

### **4.2 Manual Setup** (Alternative - 2 jam)

**Only if automated setup fails**

**Step 1: Install Chocolatey**
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Verify
choco --version
```

**Step 2: Install NSSM**
```powershell
choco install nssm -y
```

**Step 3: Download & Install Prometheus**
```powershell
cd C:\monitoring

# Download
$prometheusVersion = "2.48.0"
$prometheusUrl = "https://github.com/prometheus/prometheus/releases/download/v$prometheusVersion/prometheus-$prometheusVersion.windows-amd64.zip"
Invoke-WebRequest -Uri $prometheusUrl -OutFile "prometheus.zip"

# Extract
Expand-Archive -Path "prometheus.zip" -DestinationPath "." -Force
Rename-Item "prometheus-$prometheusVersion.windows-amd64" "prometheus"

# Create config
notepad C:\monitoring\prometheus\prometheus.yml
```

**Prometheus config** (`prometheus.yml`):
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  # VM Ubuntu 1
  - job_name: 'vm-ubuntu-1-node'
    static_configs:
      - targets: ['192.168.1.10:9100']

  - job_name: 'vm-ubuntu-1-cadvisor'
    static_configs:
      - targets: ['192.168.1.10:8090']

  # VM Ubuntu 2
  - job_name: 'vm-ubuntu-2-node'
    static_configs:
      - targets: ['192.168.1.11:9100']

  - job_name: 'vm-ubuntu-2-cadvisor'
    static_configs:
      - targets: ['192.168.1.11:8090']

  - job_name: 'redis'
    static_configs:
      - targets: ['192.168.1.11:9121']

  # Kong Gateway
  - job_name: 'kong'
    static_configs:
      - targets: ['192.168.1.10:9801']

  # Backend Services
  - job_name: 'backend-services'
    static_configs:
      - targets:
          - '192.168.1.11:8081'
          - '192.168.1.11:8082'
          - '192.168.1.11:8083'
```

**Install Prometheus as service:**
```powershell
nssm install Prometheus "C:\monitoring\prometheus\prometheus.exe"
nssm set Prometheus AppDirectory "C:\monitoring\prometheus"
nssm set Prometheus AppParameters "--config.file=C:\monitoring\prometheus\prometheus.yml --storage.tsdb.path=C:\monitoring\prometheus\data --storage.tsdb.retention.time=30d"
nssm set Prometheus DisplayName "Prometheus Monitoring"
nssm set Prometheus Start SERVICE_AUTO_START
nssm start Prometheus
```

**Step 4: Download & Install Grafana**
```powershell
cd C:\monitoring

# Download
$grafanaVersion = "10.2.3"
$grafanaUrl = "https://dl.grafana.com/enterprise/release/grafana-enterprise-$grafanaVersion.windows-amd64.zip"
Invoke-WebRequest -Uri $grafanaUrl -OutFile "grafana.zip"

# Extract
Expand-Archive -Path "grafana.zip" -DestinationPath "." -Force
Rename-Item "grafana-$grafanaVersion" "grafana"

# Install as service
nssm install Grafana "C:\monitoring\grafana\bin\grafana-server.exe"
nssm set Grafana AppDirectory "C:\monitoring\grafana\bin"
nssm set Grafana DisplayName "Grafana Dashboards"
nssm set Grafana Start SERVICE_AUTO_START
nssm start Grafana
```

**Step 5: Configure Firewall**
```powershell
New-NetFirewallRule -DisplayName "Prometheus" -Direction Inbound -LocalPort 9090 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Grafana" -Direction Inbound -LocalPort 3002 -Protocol TCP -Action Allow
```

### **4.3 Configure Grafana** (1 jam)

**Access Grafana:**
```
http://localhost:3002
http://192.168.1.12:3002  (from external)
```

**Initial Setup:**
1. **Login:**
   - Username: `admin`
   - Password: `admin`
   - Change password when prompted (REQUIRED)

2. **Add Prometheus Data Source:**
   - Go to: Configuration → Data Sources
   - Click: Add data source
   - Select: Prometheus
   - URL: `http://localhost:9090`
   - Click: Save & Test
   - Expected: ✅ Data source is working

3. **Import Dashboards:**

   **Dashboard 1: Node Exporter Full (ID: 1860)**
   - Go to: Dashboards → Import
   - Enter ID: `1860`
   - Select Prometheus datasource
   - Click: Import

   **Dashboard 2: Docker Container & Host Metrics (ID: 193)**
   - Import ID: `193`

   **Dashboard 3: Redis Dashboard (ID: 11692)**
   - Import ID: `11692`

   **Dashboard 4: Kong API Gateway (ID: 7424)**
   - Import ID: `7424`

4. **Verify Data:**
   - Open each dashboard
   - Check data is flowing (not "No Data")
   - Adjust time range if needed (Last 15 minutes)

### **4.4 Verify Monitoring** (30 menit)

**Check Prometheus Targets:**
```
http://localhost:9090/targets
```

**Expected Status:**
```
✅ vm-ubuntu-1-node (1/1 up)
✅ vm-ubuntu-1-cadvisor (1/1 up)
✅ vm-ubuntu-2-node (1/1 up)
✅ vm-ubuntu-2-cadvisor (1/1 up)
✅ redis (1/1 up)
✅ kong (1/1 up)
✅ backend-services (3/3 up)
```

**If any target DOWN:**
- Check firewall pada target server
- Check exporter service running: `docker ps`
- Check network connectivity: `ping <IP>`

---

## 🧪 PHASE 5: INTEGRATION & TESTING (HARI 3-4)

**Durasi:** ~4 jam
**Objective:** Configure Kong routes, end-to-end testing

### **5.1 Configure Kong Routes** (1 jam)

**Create Kong services and routes untuk backend:**

```bash
# SSH to VM Ubuntu 1
ssh user@192.168.1.10

# Kong Admin API base
KONG_ADMIN="http://localhost:9801"

# 1. Create Auth Service
curl -i -X POST $KONG_ADMIN/services \
  --data name=auth-service \
  --data url=http://192.168.1.11:8081

# Create Route
curl -i -X POST $KONG_ADMIN/services/auth-service/routes \
  --data paths[]=/auth-service \
  --data strip_path=true

# 2. Create Dashboard Service
curl -i -X POST $KONG_ADMIN/services \
  --data name=dashboard-service \
  --data url=http://192.168.1.11:8082

curl -i -X POST $KONG_ADMIN/services/dashboard-service/routes \
  --data paths[]=/dashboard-service \
  --data strip_path=true

# 3. Create Sister Service
curl -i -X POST $KONG_ADMIN/services \
  --data name=sister-service \
  --data url=http://192.168.1.11:8083

curl -i -X POST $KONG_ADMIN/services/sister-service/routes \
  --data paths[]=/sister-service \
  --data strip_path=false

# 4. Verify routes
curl $KONG_ADMIN/services
curl $KONG_ADMIN/routes
```

**Enable Rate Limiting:**
```bash
# Apply to all services (100 requests per minute)
for service in auth-service dashboard-service sister-service; do
  curl -X POST $KONG_ADMIN/services/$service/plugins \
    --data "name=rate-limiting" \
    --data "config.minute=100"
done
```

### **5.2 End-to-End Testing** (2 jam)

**Test 1: Frontend Access**
```bash
# From external machine atau browser
curl https://myunila.ac.id
# Expected: HTML response dengan React app

# Browser test:
# https://myunila.ac.id
# Expected: Load aplikasi, no console errors
```

**Test 2: API through Kong**
```bash
# Test Auth Service
curl https://api.myunila.ac.id/auth-service/health
# Expected: {"status":"ok"}

curl -X POST https://api.myunila.ac.id/auth-service/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@myunila.ac.id","password":"password"}'
# Expected: {"token":"...","user":{...}}

# Test Sister Service
curl https://api.myunila.ac.id/sister-service/health
# Expected: {"status":"healthy"}

curl https://api.myunila.ac.id/sister-service/public/monitoring/active
# Expected: {"active":true}
```

**Test 3: SISTER API Integration**
```bash
# Login to frontend
# Go to: Settings → API Configuration
# Add SISTER API config
# Test sync: Dosen → Sync Data

# Or via API:
curl -X POST https://api.myunila.ac.id/sister-service/public/dosen/sync \
  -H "Authorization: Bearer <token>" \
  -d '{"id_sp":"xxx"}'

# Check sync logs:
curl https://api.myunila.ac.id/sister-service/public/sync-logs
```

**Test 4: Monitoring**
```bash
# Check Prometheus
curl http://192.168.1.12:9090/api/v1/targets
# Expected: All targets "up"

# Check Grafana
# Open: http://192.168.1.12:3002
# Verify dashboards showing data
```

**Test 5: Database Operations**
```bash
# Insert test data
# Login to frontend → Create user → Verify in database

# Or via API:
curl -X POST https://api.myunila.ac.id/auth-service/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@myunila.ac.id",
    "password":"password123",
    "password_confirmation":"password123"
  }'
```

### **5.3 Load Testing** (Optional - 1 jam)

**Install Apache Bench:**
```bash
sudo apt install apache2-utils -y
```

**Test Frontend:**
```bash
# 100 requests, 10 concurrent
ab -n 100 -c 10 https://myunila.ac.id/

# Check results:
# - Requests per second
# - Time per request
# - Failed requests (should be 0)
```

**Test API:**
```bash
ab -n 100 -c 10 https://api.myunila.ac.id/auth-service/health

# Expected:
# Requests per second: >50
# Failed requests: 0
```

**Monitor during load test:**
- Check Grafana dashboards
- CPU, Memory usage should be reasonable
- Response times should be consistent

### **5.4 Security Testing** (30 menit)

**Test 1: SSL Configuration**
```bash
# Check SSL certificate
openssl s_client -connect myunila.ac.id:443 -servername myunila.ac.id

# Or use online tool:
# https://www.ssllabs.com/ssltest/analyze.html?d=myunila.ac.id
# Expected grade: A or A+
```

**Test 2: Rate Limiting**
```bash
# Rapid requests (should get rate limited)
for i in {1..120}; do
  curl https://api.myunila.ac.id/auth-service/health
done
# Expected: After 100 requests, get 429 Too Many Requests
```

**Test 3: CORS**
```bash
curl -H "Origin: https://evil.com" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS https://api.myunila.ac.id/auth-service/api/v1/login

# Expected: No CORS headers (blocked)
```

---

## ✅ POST-DEPLOYMENT TASKS

### **1. Backup Configuration** 💾

**Backup semua `.env` files:**
```bash
# VM Ubuntu 1
cd /opt/my-unila/deployment/vm-ubuntu-1
sudo cp .env .env.backup.$(date +%Y%m%d)

# VM Ubuntu 2
cd /opt/my-unila/deployment/vm-ubuntu-2
sudo cp .env .env.backup.$(date +%Y%m%d)
```

**Upload to secure storage:**
- Store di password manager (1Password, LastPass)
- Or encrypted USB drive
- Or secure cloud storage (encrypted)

### **2. Setup Automated Backups** 🔄

**Database backup (Windows Server 2):**
```sql
-- Create maintenance plan di SQL Server Management Studio
-- Daily full backup
-- Hourly transaction log backup
-- Retention: 30 days
```

**Docker volumes backup:**
```bash
# Create backup script
sudo nano /opt/backup-volumes.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backup/docker-volumes"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup Redis data
docker run --rm -v myunila-redis-data:/data -v $BACKUP_DIR:/backup alpine \
  tar czf /backup/redis-$DATE.tar.gz -C /data .

# Backup Kong database
docker run --rm -v myunila-kong-db-data:/data -v $BACKUP_DIR:/backup alpine \
  tar czf /backup/kong-db-$DATE.tar.gz -C /data .

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

**Schedule dengan cron:**
```bash
sudo crontab -e
# Add:
0 2 * * * /opt/backup-volumes.sh
```

### **3. Documentation** 📝

**Update dengan actual values:**
```bash
cd /opt/my-unila/deployment/docs

# Create actual-ips.md
cat > actual-ips.md <<EOF
# Production Server IPs

- VM Ubuntu 1: <ACTUAL_IP>
- VM Ubuntu 2: <ACTUAL_IP>
- Windows Server 1: <ACTUAL_IP>
- Windows Server 2: <ACTUAL_IP>

Last Updated: $(date)
EOF
```

### **4. Team Training** 👥

**Prepare runbook untuk team:**
- How to restart services
- How to check logs
- How to deploy updates
- Emergency contacts
- Escalation procedures

### **5. Monitoring Alerts** 🔔

**Configure alerts di Grafana:**
```
Alert 1: High CPU
- Condition: CPU > 80% for 5 minutes
- Notification: Email/Slack

Alert 2: High Memory
- Condition: Memory > 90% for 5 minutes
- Notification: Email/Slack

Alert 3: Service Down
- Condition: Service down for 1 minute
- Notification: Email/Slack/PagerDuty

Alert 4: Disk Space
- Condition: Disk > 85%
- Notification: Email

Alert 5: High Error Rate
- Condition: 5xx errors > 5% for 5 minutes
- Notification: Email/Slack
```

### **6. Security Hardening** 🔒

**SSH hardening:**
```bash
# Disable password authentication
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart sshd
```

**Regular updates:**
```bash
# Setup unattended-upgrades
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

**Fail2Ban:**
```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 🚨 TROUBLESHOOTING COMMON ISSUES

### **Issue 1: Container won't start**

**Symptoms:**
```bash
sudo docker-compose ps
# Container in "Restarting" state
```

**Solution:**
```bash
# Check logs
sudo docker-compose logs <service-name>

# Common causes:
# 1. Environment variable missing
#    → Check .env file
# 2. Port already in use
#    → sudo lsof -i :<port>
# 3. Database connection failed
#    → Check DB_HOST, DB_PASSWORD
# 4. Out of memory
#    → Check: free -h
```

### **Issue 2: Cannot access frontend via HTTPS**

**Symptoms:**
- `curl https://myunila.ac.id` fails
- Browser shows "Connection refused"

**Solution:**
```bash
# 1. Check nginx container
sudo docker ps | grep nginx

# 2. Check nginx logs
sudo docker-compose logs nginx

# 3. Check SSL certificates
sudo ls -la /etc/letsencrypt/live/myunila.ac.id/

# 4. Check firewall
sudo ufw status | grep 443

# 5. Test from inside container
sudo docker exec myunila-nginx-prod curl -k https://localhost:443
```

### **Issue 3: Backend services 502 Bad Gateway**

**Symptoms:**
- Frontend loads but API calls fail
- Kong returns 502

**Solution:**
```bash
# 1. Check backend containers running
ssh user@192.168.1.11
sudo docker-compose ps

# 2. Test backend directly
curl http://localhost:8081/health
curl http://localhost:8082/health
curl http://localhost:8083/health

# 3. Check Kong routes
ssh user@192.168.1.10
curl http://localhost:9801/services
curl http://localhost:9801/routes

# 4. Check network connectivity
ping 192.168.1.11
telnet 192.168.1.11 8081
```

### **Issue 4: Database connection failed**

**Symptoms:**
```
SQLSTATE[HY000]: Connection refused
```

**Solution:**
```bash
# 1. Test connection from VM Ubuntu 2
telnet 192.168.1.13 1433

# 2. If fails, check Windows Server 2:
# - SQL Server running?
#   Get-Service MSSQLSERVER
# - Firewall allows VM2?
#   Get-NetFirewallRule | Where-Object {$_.LocalPort -eq 1433}
# - SQL Server listening on 1433?
#   netstat -an | findstr 1433

# 3. Check credentials in .env
cat .env | grep DB_
```

### **Issue 5: Monitoring shows no data**

**Symptoms:**
- Grafana dashboards empty
- Prometheus targets DOWN

**Solution:**
```bash
# 1. Check Prometheus targets
curl http://192.168.1.12:9090/targets

# 2. If target DOWN, check exporter
ssh user@192.168.1.10
docker ps | grep exporter
curl http://localhost:9100/metrics

# 3. Check firewall
sudo ufw status | grep 9100

# 4. Check network from Windows Server 1
ping 192.168.1.10
Test-NetConnection -ComputerName 192.168.1.10 -Port 9100
```

### **Issue 6: SSL certificate renewal fails**

**Symptoms:**
```
Certbot renewal failed
Certificate expired
```

**Solution:**
```bash
# 1. Check current certificates
sudo certbot certificates

# 2. Test renewal
sudo certbot renew --dry-run

# 3. If port 80 blocked:
sudo systemctl stop nginx
sudo docker-compose stop nginx
sudo certbot renew
sudo docker-compose start nginx

# 4. Manual renewal with force
sudo certbot renew --force-renewal

# 5. Check cron job
sudo crontab -l | grep certbot
```

---

## 📊 DEPLOYMENT CHECKLIST SUMMARY

### **Pre-Deployment** ⏰ 4 hours
- [x] Domain & DNS configured
- [x] SSH access to all servers
- [x] IP addresses assigned
- [x] Secrets generated
- [x] SSL certificates ready
- [x] Database prepared
- [x] SISTER API credentials ready
- [x] Repository cloned

### **Phase 1: Persiapan** ⏰ 4 hours
- [x] Ubuntu VMs basic setup
- [x] Docker installed
- [x] Monitoring exporters deployed
- [x] Windows Server 1 prepared
- [x] Repository cloned to all servers
- [x] Network connectivity tested

### **Phase 2: VM Ubuntu 1** ⏰ 6 hours
- [x] Environment configured
- [x] SSL certificates installed
- [x] Firewall configured
- [x] Services deployed
- [x] Verification passed

### **Phase 3: VM Ubuntu 2** ⏰ 4-5 hours
- [x] Environment configured
- [x] Firewall configured
- [x] Database connection tested
- [x] Services deployed
- [x] Migrations completed
- [x] Verification passed

### **Phase 4: Windows Server 1** ⏰ 3 hours
- [x] Prometheus installed
- [x] Grafana installed
- [x] Dashboards imported
- [x] All targets UP

### **Phase 5: Integration** ⏰ 4 hours
- [x] Kong routes configured
- [x] End-to-end testing passed
- [x] Load testing passed (optional)
- [x] Security testing passed

### **Post-Deployment** ⏰ 2 hours
- [x] Backups configured
- [x] Documentation updated
- [x] Team trained
- [x] Alerts configured
- [x] Security hardened

---

## 🎯 SUCCESS CRITERIA

**Deployment considered successful when:**

✅ Frontend accessible via HTTPS
✅ All backend services responding
✅ Authentication working
✅ SISTER sync functional
✅ All Prometheus targets UP
✅ Grafana showing metrics
✅ No errors in logs
✅ Load testing passed
✅ Security checks passed
✅ Backups configured
✅ Team can operate system

---

## 📞 SUPPORT CONTACTS

**Emergency Escalation:**
1. Check logs first
2. Restart affected service
3. Contact DevOps Lead
4. If critical: Page on-call engineer

**Documentation:**
- Master Guide: `/deployment/README.md`
- Architecture: `/deployment/docs/ARCHITECTURE.md`
- VM1 Guide: `/deployment/vm-ubuntu-1/README.md`
- VM2 Guide: `/deployment/vm-ubuntu-2/README.md`
- Windows Guide: `/deployment/windows-server-1/README.md`

---

## 🔄 UPDATING DEPLOYMENT

**For code updates:**
```bash
cd /opt/my-unila
sudo git pull origin master
cd deployment/<vm-name>
sudo docker-compose build
sudo docker-compose up -d
```

**For configuration updates:**
```bash
# Edit .env
nano .env

# Restart affected services
sudo docker-compose restart <service-name>
```

---

**Version:** 1.0
**Last Updated:** 2025-10-29
**Total Estimated Time:** 3-4 Days
**Confidence Level:** Production Ready

**🚀 Ready to deploy!**

---

**Key Points:**
1. ✅ Follow phases sequentially
2. ✅ Verify each phase before proceeding
3. ✅ Document actual IPs and passwords
4. ✅ Test thoroughly before go-live
5. ✅ Have rollback plan ready

**Good luck with your production deployment! 🎉**
