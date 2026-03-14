# VM5 Staging Server - Deployment Guide

Server staging MyUnila yang menjalankan **semua service** (VM1 + VM2 + VM3) dalam satu VM untuk testing.

## Server Info

| Item | Value |
|------|-------|
| IP | 192.168.120.45 |
| User | mystagging |
| OS | Ubuntu 24.04.1 LTS |
| CPU | 8 cores |
| RAM | 16 GB |
| Disk | 48 GB (39 GB available) |
| Role | Staging / Testing |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    VM5 - Staging (192.168.120.45)                │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  Frontend    │  │  Kong GW     │  │  PostgreSQL (Kong DB) │  │
│  │  :3000       │  │  :9800/:9801 │  │  :5432                │  │
│  └─────────────┘  └──────────────┘  └───────────────────────┘  │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  Redis       │  │  Meilisearch │  │  Nginx (PHP proxy)    │  │
│  │  :6379       │  │  :7700       │  │  :8081/:8082/:8087    │  │
│  └─────────────┘  └──────────────┘  └───────────────────────┘  │
│                                                                  │
│  PHP Services:                                                   │
│  ┌────────────┐  ┌────────────────┐  ┌──────────────────────┐  │
│  │ Auth       │  │ Dashboard      │  │ Public + Scheduler   │  │
│  │ :9000(int) │  │ :9000(int)     │  │ :9000(int)           │  │
│  └────────────┘  └────────────────┘  └──────────────────────┘  │
│                                                                  │
│  Go Services:                                                    │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌─────┐ ┌────────┐ ┌──────┐ │
│  │Sister  │ │Feeder  │ │MyUnila │ │ API │ │Keuangan│ │Monit │ │
│  │:8083   │ │:8084   │ │:8086   │ │:8085│ │:8088   │ │:8089 │ │
│  └────────┘ └────────┘ └────────┘ └─────┘ └────────┘ └──────┘ │
│                                                                  │
│                  Network: myunila-staging-network                │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
  ┌──────────────────────┐
  │ SQL Server (External) │
  │ 192.168.123.119:1433  │
  └──────────────────────┘
```

---

## Phase 0: Initial Server Setup

SSH ke server:

```bash
ssh mystagging@192.168.120.45
```

### 0.1 Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 0.2 Set Timezone

```bash
sudo timedatectl set-timezone Asia/Jakarta
timedatectl
```

### 0.3 Install Essential Packages

```bash
sudo apt install -y \
    curl wget git htop nano net-tools \
    apt-transport-https ca-certificates \
    gnupg lsb-release software-properties-common \
    unzip jq
```

### 0.4 Setup Swap (4GB)

Penting karena 16GB RAM harus menjalankan 15+ container:

```bash
# Check existing swap
sudo swapon --show

# Create 4GB swap file
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Optimize swappiness (prefer RAM, use swap only when needed)
sudo sysctl vm.swappiness=10
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf

# Verify
free -h
```

### 0.5 Setup UFW Firewall

> **PENTING:** Pastikan allow SSH SEBELUM enable UFW agar tidak ke-lock out dari server!

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH (WAJIB PERTAMA - agar tidak ke-lock out!)
sudo ufw allow OpenSSH
sudo ufw allow 22/tcp

# Frontend
sudo ufw allow 3000/tcp

# Kong Gateway
sudo ufw allow 9800/tcp
sudo ufw allow 9801/tcp

# Backend services
sudo ufw allow 8081/tcp
sudo ufw allow 8082/tcp
sudo ufw allow 8083/tcp
sudo ufw allow 8084/tcp
sudo ufw allow 8085/tcp
sudo ufw allow 8086/tcp
sudo ufw allow 8088/tcp
sudo ufw allow 8089/tcp

# Infrastructure (optional - hanya jika perlu akses dari luar)
# sudo ufw allow 6379/tcp   # Redis
# sudo ufw allow 7700/tcp   # Meilisearch
# sudo ufw allow 5432/tcp   # PostgreSQL

sudo ufw enable
sudo ufw status verbose
```

### 0.6 Optimize System Limits

```bash
# Increase file descriptor limits
sudo tee -a /etc/security/limits.conf <<EOF

# Docker container limits
* soft nofile 65535
* hard nofile 65535
* soft nproc 65535
* hard nproc 65535
EOF

# Optimize network settings
sudo tee -a /etc/sysctl.conf <<EOF

# Network optimizations for Docker
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.ip_local_port_range = 1024 65535
net.ipv4.tcp_tw_reuse = 1
net.core.netdev_max_backlog = 65535
fs.file-max = 2097152
EOF

sudo sysctl -p
```

---

## Phase 1: SSH & Git Setup

### 1.1 Generate SSH Key & Configure Git

```bash
# Jalankan script setup (jika repository sudah ada):
# bash /var/www/my-unila/deployment/production/vm5-staging/scripts/setup-ssh-bitbucket.sh

# Atau manual:
ssh-keygen -t ed25519 -C "mizarzulmiramadhan@gmail.com" -N ""
git config --global user.email "mizarzulmiramadhan@gmail.com"
git config --global user.name "Mizar"
```

### 1.2 Add SSH Key to Bitbucket

```bash
# Display public key
cat ~/.ssh/id_ed25519.pub
```

Copy output dan tambahkan ke:
**Bitbucket > Personal Settings > SSH Keys > Add Key**

### 1.3 Add Bitbucket to Known Hosts

```bash
ssh-keyscan -t rsa,ed25519 bitbucket.org >> ~/.ssh/known_hosts 2>/dev/null
```

### 1.4 Test SSH Connection

```bash
ssh -T git@bitbucket.org
# Expected output: "logged in as mahendraunila"
```

### 1.5 Clone Repository

```bash
sudo mkdir -p /var/www
sudo chown mystagging:mystagging /var/www
cd /var/www
git clone git@bitbucket.org:mahendraunila/my-unila.git
```

---

## Phase 2: Install Docker & Docker Compose

### 2.1 Install Docker CE

```bash
# Remove old versions
sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null

# Add Docker official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 2.2 Configure Docker

```bash
# Add user to docker group
sudo usermod -aG docker mystagging

# Start & enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Configure Docker daemon
sudo tee /etc/docker/daemon.json <<EOF
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "storage-driver": "overlay2",
    "default-address-pools": [
        {"base": "172.20.0.0/16", "size": 24}
    ]
}
EOF

sudo systemctl restart docker
```

### 2.3 Verify Installation

```bash
# Logout & login again (untuk apply docker group)
# Atau: newgrp docker

docker --version
docker compose version
docker run hello-world
```

---

## Phase 3: Configure Environment

### 3.1 Setup Environment File (Otomatis - Recommended)

Script ini akan SCP `.env` dari VM1, VM2, VM3 production, lalu merge credentials otomatis ke staging `.env`:

```bash
cd /var/www/my-unila/deployment/production/vm5-staging
chmod +x scripts/copy-env-from-production.sh
./scripts/copy-env-from-production.sh
```

Script melakukan:
1. `scp` `.env` dari VM1 (192.168.120.41), VM2 (192.168.120.42), VM3 (192.168.120.43)
2. Extract semua credentials (DB passwords, APP_KEYs, JWT_SECRET, API keys, dll)
3. Merge ke staging `.env` (base dari `.env.example`)
4. Override URL-URL agar mengarah ke VM5 lokal (bukan production IPs)

> **Prerequisite:** VM5 harus bisa SSH ke VM1/VM2/VM3. Jika tidak bisa, copy manual (lihat 3.1b).

### 3.1b Setup Environment File (Manual)

Jika script SCP gagal (misalnya tidak ada SSH access antar VM):

```bash
cd /var/www/my-unila/deployment/production/vm5-staging

# Start dari example
cp .env.example .env

# Edit dan isi credentials manual
nano .env
```

### 3.2 Credentials yang HARUS diisi

Ambil dari production `.env` di VM2/VM3 (jika pakai cara manual):

```
# Database (sama dengan production)
DB_MSSQL_USERNAME=<dari_production>
DB_MSSQL_PASSWORD=<dari_production>
AUTH_DB_USERNAME=<dari_production>
AUTH_DB_PASSWORD=<dari_production>
PUBLIC_DB_USERNAME=<dari_production>
PUBLIC_DB_PASSWORD=<dari_production>
DASHBOARD_DB_USERNAME=<dari_production>
DASHBOARD_DB_PASSWORD=<dari_production>
SISTER_DB_USERNAME=<dari_production>
SISTER_DB_PASSWORD=<dari_production>
FEEDER_DB_USERNAME=<dari_production>
FEEDER_DB_PASSWORD=<dari_production>
MYUNILA_DB_USERNAME=<dari_production>
MYUNILA_DB_PASSWORD=<dari_production>
API_DB_USERNAME=<dari_production>
API_DB_PASSWORD=<dari_production>
KEUANGAN_DB_USERNAME=<dari_production>
KEUANGAN_DB_PASSWORD=<dari_production>
MONITORING_DB_USERNAME=<dari_production>
MONITORING_DB_PASSWORD=<dari_production>

# Auth
JWT_SECRET=<dari_production>
AUTH_APP_KEY=<dari_production>
PUBLIC_APP_KEY=<dari_production>
DASHBOARD_APP_KEY=<dari_production>

# API keys
API_CONFIG_ENCRYPTION_KEY=<dari_production>
LARAVEL_APP_KEY=<dari_production>

# Sister API
SISTER_API_IDPENGGUNA=<dari_production>
SISTER_API_USERNAME=<dari_production>
SISTER_API_PASSWORD=<dari_production>

# Feeder API
FEEDER_API_USERNAME=<dari_production>
FEEDER_API_PASSWORD=<dari_production>

# Kong
KONG_PG_PASSWORD=<pilih_password_baru>

# Meilisearch
MEILISEARCH_KEY=<pilih_key_baru_min_16_chars>

# Redis (kosongkan jika tanpa password)
REDIS_PASSWORD=

# MinIO
MINIO_SECRET_KEY=<dari_production>

# Radius
RADIUS_DB_PASSWORD=<dari_production>
```

### 3.3 Setup Secrets Directory

```bash
mkdir -p secrets/

# Jika butuh GSC (Google Search Console), copy dari VM3:
# scp mybackend2@192.168.120.43:/var/www/my-unila/deployment/production/vm3-backend2/secrets/gsc-service-account.json ./secrets/
```

---

## Phase 3.5: Setup SOPS Secret Management (Optional)

SOPS + age untuk encrypt `.env` files sebelum commit ke git. Install di **host VM** (bukan container).

### 3.5.1 Jalankan Setup Script

```bash
cd /var/www/my-unila/deployment/production/vm5-staging
chmod +x scripts/setup-sops.sh
./scripts/setup-sops.sh
```

Script ini akan:
1. Install `age` (encryption tool)
2. Install `sops` (secret management CLI)
3. Generate age keypair di `~/.config/sops/age/keys.txt`
4. Create `.sops.yaml` config di root repo

### 3.5.2 Encrypt .env (sebelum commit)

```bash
cd /var/www/my-unila/deployment/production/vm5-staging
sops --encrypt .env > .env.encrypted
git add .env.encrypted
git commit -m "chore: add encrypted env for staging"
```

### 3.5.3 Decrypt .env (saat deploy di VM baru)

```bash
sops --decrypt .env.encrypted > .env
```

### 3.5.4 Copy Key ke VM Lain

Semua VM yang perlu decrypt harus punya key yang sama:

```bash
# Buat folder di VM tujuan dulu
ssh myfrontend@192.168.120.41 "mkdir -p ~/.config/sops/age && chmod 700 ~/.config/sops/age"
ssh mybackend1@192.168.120.42 "mkdir -p ~/.config/sops/age && chmod 700 ~/.config/sops/age"
ssh mybackend2@192.168.120.43 "mkdir -p ~/.config/sops/age && chmod 700 ~/.config/sops/age"

# Copy key
scp ~/.config/sops/age/keys.txt myfrontend@192.168.120.41:~/.config/sops/age/keys.txt
scp ~/.config/sops/age/keys.txt mybackend1@192.168.120.42:~/.config/sops/age/keys.txt
scp ~/.config/sops/age/keys.txt mybackend2@192.168.120.43:~/.config/sops/age/keys.txt

# Fix permissions di semua VM (atau jalankan script)
./scripts/fix-sops-permissions.sh
```

### 3.5.5 Fix Permissions SOPS Key

Permission yang benar: folder `700`, file `600`.

```bash
# Otomatis semua VM:
./scripts/fix-sops-permissions.sh

# Atau manual per VM:
chmod 700 ~/.config/sops ~/.config/sops/age
chmod 600 ~/.config/sops/age/keys.txt
```

> **PENTING:** Backup `keys.txt` di password manager. Jika hilang, tidak bisa decrypt!

---

## Phase 4: Deploy All Services

### 4.1 Make Scripts Executable

```bash
chmod +x scripts/*.sh
```

### 4.2 Run Full Deployment

```bash
./scripts/deploy.sh
```

Script ini akan:
1. Create Docker network `myunila-staging-network`
2. Start PostgreSQL, Redis, Meilisearch
3. Start Kong Gateway + run migrations
4. Build & start PHP services (auth, dashboard, public)
5. Start Nginx reverse proxy
6. Build & start Go services (sister, feeder, myunila, api, keuangan, monitoring)
7. Build & start Frontend
8. Setup Kong routes
9. Display status summary

### 4.3 Monitor Deployment

```bash
# Watch container status
watch docker ps

# Check logs of specific service
docker logs -f myunila-auth-staging
docker logs -f myunila-frontend-staging

# Check resource usage
docker stats
```

### 4.4 Manual Deploy (jika deploy.sh gagal)

Deploy per-layer secara manual:

```bash
cd /var/www/my-unila/deployment/production/vm5-staging
ENV_FILE=.env

# 1. Create network
docker network create myunila-staging-network

# 2. Infrastructure
docker compose --env-file $ENV_FILE -f services/infrastructure/docker-compose.postgres.yml up -d
docker compose --env-file $ENV_FILE -f services/infrastructure/docker-compose.redis.yml up -d
docker compose --env-file $ENV_FILE -f services/infrastructure/docker-compose.meilisearch.yml up -d

# Wait 10s for infra to be ready
sleep 10

# 3. Kong
docker compose --env-file $ENV_FILE -f services/gateway/docker-compose.kong.yml up -d

# Wait 15s for Kong migrations
sleep 15

# 4. PHP services
docker compose --env-file $ENV_FILE -f services/backend-php/docker-compose.auth.yml up -d --build
docker compose --env-file $ENV_FILE -f services/backend-php/docker-compose.dashboard.yml up -d --build
docker compose --env-file $ENV_FILE -f services/backend-php/docker-compose.public.yml up -d --build
docker compose --env-file $ENV_FILE -f services/backend-php/docker-compose.nginx.yml up -d

# 5. Go services
docker compose --env-file $ENV_FILE -f services/backend-go/docker-compose.sister.yml up -d --build
docker compose --env-file $ENV_FILE -f services/backend-go/docker-compose.feeder.yml up -d --build
docker compose --env-file $ENV_FILE -f services/backend-go/docker-compose.myunila.yml up -d --build
docker compose --env-file $ENV_FILE -f services/backend-go/docker-compose.api.yml up -d --build
docker compose --env-file $ENV_FILE -f services/backend-go/docker-compose.keuangan.yml up -d --build
docker compose --env-file $ENV_FILE -f services/backend-go/docker-compose.monitoring.yml up -d --build

# 6. Frontend
docker compose --env-file $ENV_FILE -f services/frontend/docker-compose.frontend.yml up -d --build

# 7. Kong routes
./scripts/setup-kong-routes.sh
```

---

## Phase 5: Install Claude Code + Remote Vibe Coding

### 5.1 Jalankan Setup Script (Otomatis)

```bash
cd /var/www/my-unila/deployment/production/vm5-staging
chmod +x scripts/setup-claude-code.sh
./scripts/setup-claude-code.sh
```

Script ini akan install Node.js 20, Claude Code, tmux, setup API key, dan buat helper scripts.

### 5.2 Manual Installation (jika script gagal)

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Install tmux
sudo apt install -y tmux

# Setup API Key
# Dapatkan dari: https://console.anthropic.com/settings/keys
echo 'export ANTHROPIC_API_KEY="sk-ant-xxxxx"' >> ~/.bashrc
source ~/.bashrc
```

### 5.3 Verify Installation

```bash
node --version     # v20.x.x
claude --version   # Claude Code vX.X.X
```

### 5.4 Cara Pakai - Interactive Mode (di VM langsung)

```bash
cd /var/www/my-unila
claude
```

### 5.5 Cara Pakai - Remote dari Device Lain via SSH

Dari laptop/PC/HP manapun yang bisa SSH:

```bash
# SSH ke staging server
ssh mystagging@192.168.120.45

# Start Claude Code dalam tmux (persistent session)
~/claude-start.sh
```

**Keuntungan tmux:** session tetap berjalan walau koneksi SSH terputus.

```bash
# Detach dari session (tanpa mematikan Claude):
#   Tekan Ctrl+B, lalu tekan D

# Re-attach ke session yang sudah ada:
tmux attach -t claude-code

# List semua sessions:
tmux ls
```

### 5.6 Cara Pakai - VS Code Remote SSH (GUI)

Untuk pengalaman visual terbaik:

1. **Di VS Code lokal**, install extension:
   - `Remote - SSH` (Microsoft)
   - `Claude Code` (Anthropic)

2. **Connect ke VM staging:**
   - `Ctrl+Shift+P` > `Remote-SSH: Connect to Host`
   - Masukkan: `mystagging@192.168.120.45`

3. **Open project folder:** `/var/www/my-unila`

4. **Buka Claude Code:**
   - `Ctrl+Shift+P` > `Claude Code: Open`
   - Atau klik icon Claude di sidebar

5. **Vibe coding!** Claude akan berjalan di VM staging dengan akses penuh ke semua file dan Docker containers.

### 5.7 Cara Pakai - Headless Mode (Non-Interactive / Scripting)

Untuk automation atau one-shot commands:

```bash
# Jalankan prompt langsung, output ke terminal
claude -p "find all API endpoints in the Go services"

# Dengan izin tool otomatis
claude -p "fix the login bug" --allowedTools "Read,Edit,Bash"

# Output format JSON (untuk scripting)
claude -p "list all docker containers" --output-format json

# Helper script
~/claude-run.sh "explain the auth flow in this project"
```

### 5.8 Multiple Sessions (Kerja Paralel)

Bisa jalankan beberapa Claude Code session sekaligus:

```bash
# Session 1: fix bug di auth
~/claude-start.sh fix-auth

# Buka terminal baru (Ctrl+B, lalu C di tmux)
# Session 2: tambah feature dashboard
~/claude-start.sh feature-dashboard

# List semua sessions
tmux ls

# Switch antar session
tmux attach -t fix-auth
tmux attach -t feature-dashboard
```

### 5.9 Tips Remote Vibe Coding

1. **Koneksi SSH stabil:** Gunakan `ServerAliveInterval` di SSH config lokal:
   ```
   # ~/.ssh/config di laptop/PC lokal
   Host staging
       HostName 192.168.120.45
       User mystagging
       ServerAliveInterval 60
       ServerAliveCountMax 3
   ```
   Setelah ini cukup: `ssh staging` lalu `~/claude-start.sh`

2. **Persistent session:** Selalu pakai tmux agar session tidak hilang saat disconnect

3. **Monitor resources:** Claude Code + 15 containers butuh RAM. Monitor dengan:
   ```bash
   htop              # Live resource monitor
   docker stats      # Container resource usage
   ```

4. **Auto-approve permissions:** Edit `~/.claude/settings.json` untuk tambah permission yang sering dipakai agar tidak perlu approve manual terus

---

## Phase 6: Verification Checklist

### 6.1 Check All Containers Running

```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep staging
```

Expected: 16 containers semua `Up` dan `(healthy)`.

### 6.2 Health Check Endpoints

```bash
# Frontend
curl -s http://192.168.120.45:3000 | head -20

# Kong Gateway
curl -s http://192.168.120.45:9800 | head -5

# Auth Service
curl -s http://192.168.120.45:8081/health
# Expected: OK

# Public Service
curl -s http://192.168.120.45:8082/health

# Sister Service
curl -s http://192.168.120.45:8083/health

# Feeder Service
curl -s http://192.168.120.45:8084/health

# API Service
curl -s http://192.168.120.45:8085/health

# Dashboard Service (via Nginx port 8087)
curl -s http://localhost:8087/health

# Keuangan Service
curl -s http://192.168.120.45:8088/health

# Monitoring Service
curl -s http://192.168.120.45:8089/health
```

### 6.3 Test Kong Routes

```bash
# Auth via Kong
curl -s http://192.168.120.45:9800/auth-service/api/v1/health

# Public via Kong
curl -s http://192.168.120.45:9800/public-service/api/v1/health

# Sister via Kong
curl -s http://192.168.120.45:9800/sister-service/health
```

### 6.4 Test Login Flow

Buka browser: `http://192.168.120.45:3000`

1. Halaman login harus muncul
2. Login dengan credentials
3. Dashboard harus tampil data dari SQL Server

### 6.5 Resource Usage

```bash
# Check memory usage
docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.CPUPerc}}"

# Check disk usage
df -h
docker system df
```

---

## Troubleshooting

### Container tidak start

```bash
# Check logs
docker logs myunila-<service>-staging

# Common issues:
# - .env belum diisi -> fill credentials
# - Port conflict -> check `sudo lsof -i :<port>`
# - Network not found -> `docker network create myunila-staging-network`
```

### Database connection error

```bash
# Test SQL Server connectivity
docker exec -it myunila-auth-staging bash -c "apt-get install -y telnet && telnet 192.168.123.119 1433"

# Atau dari host
sudo apt install -y telnet
telnet 192.168.123.119 1433
```

### Kong routes tidak work

```bash
# Check Kong services
curl -s http://localhost:9801/services | jq .

# Check Kong routes
curl -s http://localhost:9801/routes | jq .

# Re-run route setup
./scripts/setup-kong-routes.sh
```

### Out of Memory

```bash
# Check memory
free -h
docker stats --no-stream

# Restart services dengan high memory
docker restart myunila-frontend-staging
docker restart myunila-sister-staging

# Jika masih OOM, tambah swap
sudo fallocate -l 4G /swapfile2
sudo chmod 600 /swapfile2
sudo mkswap /swapfile2
sudo swapon /swapfile2
```

### Rebuild single service

```bash
cd /var/www/my-unila/deployment/production/vm5-staging

# Via script (recommended)
./scripts/rebuild-service.sh sister

# Rebuild beberapa service sekaligus
./scripts/rebuild-service.sh auth dashboard nginx

# Lihat daftar service yang tersedia
./scripts/rebuild-service.sh --list

# Via docker compose langsung
docker compose --env-file .env -f services/backend-go/docker-compose.sister.yml up -d --build --force-recreate
```

### Rebuild via Ansible (dari VM manapun)

```bash
cd /var/www/my-unila/deployment/production/ansible

# Rebuild 1 service di VM5
./rebuild.sh --vm5 sister

# Rebuild beberapa service
./rebuild.sh --vm5 auth dashboard frontend

# Rebuild semua service di VM5
./rebuild.sh --vm5
```

### Rebuild semua setelah git pull

```bash
cd /var/www/my-unila
git pull origin master

cd deployment/production/vm5-staging
./scripts/deploy.sh

# Atau rebuild semua via script
./scripts/rebuild-service.sh --all
```

---

## Quick Reference

| Action | Command |
|--------|---------|
| Start all | `./scripts/deploy.sh` |
| Stop all | `docker stop $(docker ps -q --filter name=staging)` |
| Restart all | `docker restart $(docker ps -q --filter name=staging)` |
| Check status | `docker ps --filter name=staging` |
| Check logs | `docker logs -f myunila-<service>-staging` |
| Resource usage | `docker stats --filter name=staging` |
| Rebuild 1 service | `./scripts/rebuild-service.sh sister` |
| Rebuild beberapa | `./scripts/rebuild-service.sh auth dashboard nginx` |
| Rebuild semua | `./scripts/rebuild-service.sh --all` |
| Rebuild via Ansible | `./rebuild.sh --vm5 sister` |
| List services | `./scripts/rebuild-service.sh --list` |
| Kong routes | `./scripts/setup-kong-routes.sh` |
| Encrypt .env | `sops --encrypt .env > .env.encrypted` |
| Decrypt .env | `sops --decrypt .env.encrypted > .env` |
| Fix SOPS perms | `./scripts/fix-sops-permissions.sh` |
| Clean all | `docker stop $(docker ps -q --filter name=staging) && docker system prune -f` |
