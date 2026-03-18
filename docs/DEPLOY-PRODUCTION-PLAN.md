# Deploy Production Plan — 18 Maret 2026

## Overview
Deploy semua fitur baru dari staging (VM5) ke production (VM1-VM4) + setup VM6 sebagai replica VM3 dengan Kong Load Balancing.

## Status: PLAN ONLY — Belum testing di staging
Phase 1 menunggu Mizar selesai testing fitur di staging.

## Detailed Guides
- PostgreSQL VM3: `docs/VM3-POSTGRESQL-SETUP.md`
- VM6 Replica + Kong LB: `docs/VM6-REPLICA-SETUP.md`

## Config Files Created
- `deployment/production/vm3-backend2/services/project/docker-compose.yml`
- `deployment/production/vm6-replica/docker-compose.yml`
- `deployment/production/vm6-replica/.env.example`
- `deployment/production/vm6-replica/scripts/sync-from-vm3.sh`
- `deployment/production/kong-lb/setup-upstreams.sh`
- `deployment/production/kong-lb/check-health.sh`
- `deployment/production/ansible/playbooks/06-deploy-vm6-replica.yml`

---

## Phase 1: Deploy Fitur Baru ke Production

### 1A. VM2 (mybackend1) — PHP Services
**Service:** Auth + Dashboard + Public

**Changes:**
- Auth: `POST /manakses/pengguna` (tambah pengguna), PJ Aplikasi fix (id_pengguna dari JWT), WS Authorization revamp (by-pengguna, sync-by-pengguna, endpoint/apps)
- Dashboard: Data Unila backend (8 modul + sub-pages + IKU + Keuangan), Dashboard Pimpinan
- Public: (minor changes if any)

**Steps:**
1. SSH ke VM1, `git pull origin master`
2. SCP updated files ke VM2:
   ```bash
   # Dari VM1
   cd /var/www/my-unila
   ansible-playbook deployment/production/ansible/playbooks/03-deploy-vm2-backend1.yml
   ```
3. Rebuild containers di VM2:
   ```bash
   docker compose -f services/auth/docker-compose.yml up -d --build
   docker compose -f services/dashboard/docker-compose.yml up -d --build
   docker compose -f services/public/docker-compose.yml up -d --build
   ```
4. Verify: health check semua container

**DB Seeds yang perlu dijalankan:**
- `seed_staging_to_production_20260317.sql` di pdut (SQL Server 119)
  - App "Data Unila": 23 menus, 11 roles
  - Dashboard Pimpinan: `a_coming_soon=0`, `a_live=1`
  - WS Endpoint: 121 endpoints WS-MYUNILA
  - Pengguna management permissions

### 1B. VM3 (mybackend2) — Go Services
**Service:** Sister + Feeder + MyUnila + API + Keuangan + Monitoring-svc

**Changes:**
- API (ws-service): Go middleware `ws_auth.go` (WS Authorization enforcement), `/v1/` migration
- Keuangan: SIMPEDAM API integration
- Monitoring-svc: (minor)

**Steps:**
1. SCP dari VM1 ke VM3:
   ```bash
   ansible-playbook deployment/production/ansible/playbooks/04-deploy-vm3-backend2.yml
   ```
2. Rebuild Go containers di VM3
3. Set env vars: `WS_AUTH_ENABLED=true`, `WS_AUTH_APP_ID=<production-app-id>`
4. Verify semua service healthy

### 1C. VM1 (myfrontend) — Frontend + Kong
**Service:** Next.js Frontend + Kong API Gateway

**Changes:**
- Frontend: Data Unila 18 halaman + Export Excel, Dashboard Pimpinan, Manajemen Akses (responsive modals, tambah pengguna), WS Authorization revamp, WS Endpoint filter
- Kong: admin port 9801

**Steps:**
1. `git pull origin master` di VM1
2. Rebuild frontend:
   ```bash
   cd /var/www/my-unila/deployment/production/vm1-frontend-kong
   docker compose --env-file .env -f services/frontend/docker-compose.yml up -d --build
   ```
3. Verify: `curl -s http://localhost:3000` → healthy

### 1D. VM4 (mybalancer) — Monitoring
**Changes:**
- Database alert rules (sudah deployed sebelumnya)
- No additional changes needed

---

## Phase 2: PostgreSQL + Project Management di VM3

### 2A. Install PostgreSQL Native di VM3
```bash
# SSH ke VM3
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Config
sudo -u postgres psql -c "CREATE USER myunila_pm WITH PASSWORD '<PASSWORD_DISINI>';"
sudo -u postgres psql -c "CREATE DATABASE myunila_project OWNER myunila_pm;"
sudo -u postgres psql -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" -d myunila_project

# Allow remote (untuk VM6 replica nanti)
echo "listen_addresses = '*'" | sudo tee -a /etc/postgresql/*/main/postgresql.conf
echo "host myunila_project myunila_pm 192.168.120.0/24 md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf
sudo systemctl restart postgresql
```

### 2B. Deploy Project Service di VM3
```bash
# SCP project-service dari VM1
scp -r /var/www/my-unila/backend/project-service mybackend2@192.168.120.43:/var/www/my-unila/backend/

# Copy .env + Dockerfile
# Set env:
# PROJECT_PG_HOST=127.0.0.1
# PROJECT_PG_PORT=5432
# PROJECT_PG_DATABASE=myunila_project
# PROJECT_PG_USER=myunila_pm
# PROJECT_PG_PASSWORD=<PASSWORD>
# PROJECT_SQLSERVER_HOST=192.168.123.119
# PROJECT_SQLSERVER_PORT=1433
# PROJECT_SQLSERVER_DATABASE=pdut
# PROJECT_SQLSERVER_USER=<production-user>
# PROJECT_SQLSERVER_PASSWORD=<production-password>

# Build + run
docker compose -f services/project/docker-compose.yml up -d --build
```

### 2C. Run Migrations + Seed
```bash
# Import schema
psql -U myunila_pm -d myunila_project -f project_management_v1.0_fresh.sql

# Run seed (dummy data + referensi sync)
```

### 2D. Kong Route untuk Project Service
```bash
# Register project service di Kong (VM1)
curl -i -X POST http://localhost:9801/services/ \
  --data "name=project-service" \
  --data "url=http://192.168.120.43:8095"

curl -i -X POST http://localhost:9801/services/project-service/routes \
  --data "paths[]=/project-service" \
  --data "strip_path=true"
```

---

## Phase 3: VM6 Replica + Kong Load Balancing (Active-Active)

### Architecture
```
Client → Kong (VM1)
           ├── upstream: vm3-go-services
           │     ├─ target: 192.168.120.43:port (VM3 primary)
           │     └─ target: 192.168.120.46:port (VM6 replica)
           └── health_checks: active + passive
```

### 3A. Setup VM6 (myreplica)
```bash
# SSH ke VM6
# 1. Install Docker + Docker Compose
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker myreplica

# 2. Create network
docker network create myunila-prod-network

# 3. Copy service files dari VM3
scp -r mybackend2@192.168.120.43:/var/www/my-unila/backend/ /var/www/my-unila/backend/
scp mybackend2@192.168.120.43:/var/www/my-unila/deployment/production/vm3-backend2/.env /var/www/my-unila/deployment/production/vm6-replica/.env

# 4. Adjust .env — same config as VM3 (stateless, point to same DB + Redis)
```

### 3B. Deploy Services di VM6
Sama persis dengan VM3 — semua Go service:
- Sister (port 8091)
- Feeder (port 8092)
- MyUnila (port 8093)
- API/ws-service (port 8094)
- Keuangan (port 8096)
- Monitoring-svc (port 8097)
- Project (port 8095)

```bash
# Build semua service
docker compose -f docker-compose.yml up -d --build
```

### 3C. Kong Upstream + Load Balancing Config
```bash
KONG_ADMIN="http://localhost:9801"

# Untuk setiap service, buat upstream + 2 targets
# Contoh: API Service (ws-service)

# 1. Create upstream
curl -i -X POST $KONG_ADMIN/upstreams \
  --data "name=api-service-upstream" \
  --data "algorithm=round-robin" \
  --data "healthchecks.active.type=http" \
  --data "healthchecks.active.http_path=/health" \
  --data "healthchecks.active.healthy.interval=10" \
  --data "healthchecks.active.healthy.successes=3" \
  --data "healthchecks.active.unhealthy.interval=5" \
  --data "healthchecks.active.unhealthy.http_failures=3" \
  --data "healthchecks.passive.healthy.successes=5" \
  --data "healthchecks.passive.unhealthy.http_failures=3"

# 2. Add targets
curl -i -X POST $KONG_ADMIN/upstreams/api-service-upstream/targets \
  --data "target=192.168.120.43:8094" \
  --data "weight=100"

curl -i -X POST $KONG_ADMIN/upstreams/api-service-upstream/targets \
  --data "target=192.168.120.46:8094" \
  --data "weight=100"

# 3. Update service to use upstream
curl -i -X PATCH $KONG_ADMIN/services/api-service \
  --data "host=api-service-upstream" \
  --data "port=" \
  --data "path="

# Repeat untuk: sister, feeder, myunila, keuangan, monitoring, project
```

### 3D. Service Upstream Map
| Service | Upstream Name | VM3 Target | VM6 Target | Health Path |
|---------|--------------|------------|------------|-------------|
| Sister | sister-upstream | 192.168.120.43:8091 | 192.168.120.46:8091 | /health |
| Feeder | feeder-upstream | 192.168.120.43:8092 | 192.168.120.46:8092 | /health |
| MyUnila | myunila-upstream | 192.168.120.43:8093 | 192.168.120.46:8093 | /health |
| API/WS | api-service-upstream | 192.168.120.43:8094 | 192.168.120.46:8094 | /health |
| Project | project-upstream | 192.168.120.43:8095 | 192.168.120.46:8095 | /health |
| Keuangan | keuangan-upstream | 192.168.120.43:8096 | 192.168.120.46:8096 | /health |
| Monitoring | monitoring-upstream | 192.168.120.43:8097 | 192.168.120.46:8097 | /health |

### 3E. Verify Load Balancing
```bash
# Check upstream health
curl -s $KONG_ADMIN/upstreams/api-service-upstream/health | jq '.data[].health'

# Test: hit endpoint beberapa kali, check distributed
for i in $(seq 1 10); do
  curl -s http://localhost:8000/api-service/health -o /dev/null -w "%{http_code}\n"
done

# Check Kong logs for upstream distribution
docker logs myunila-kong --tail 20 | grep upstream
```

---

## Phase 4: Sync Script (VM3 → VM6)

### Auto-sync Docker Images
```bash
# Cron di VM3: sync images ke VM6 setelah rebuild
#!/bin/bash
# /usr/local/bin/sync-to-vm6.sh

SERVICES="sister feeder myunila api keuangan monitoring project"
for svc in $SERVICES; do
  docker save myunila/$svc:latest | ssh myreplica@192.168.120.46 "docker load"
  ssh myreplica@192.168.120.46 "docker compose -f /var/www/my-unila/deployment/production/vm6-replica/docker-compose.yml up -d $svc"
done
```

---

## Checklist

### Pre-deploy
- [ ] Backup pdut production (SQL Server 119)
- [ ] Confirm git master is clean dan semua commit sudah pushed
- [ ] Test semua fitur di staging (VM5) — final round
- [ ] Catat current state production (docker ps semua VM)

### Deploy Phase 1
- [ ] Run SQL seed di production DB (pdut)
- [ ] Deploy VM2 (auth + dashboard + public)
- [ ] Deploy VM1 (frontend rebuild)
- [ ] Deploy VM3 (Go services)
- [ ] Smoke test: login, Data Unila, Dashboard Pimpinan, WS Auth, ManAkses

### Deploy Phase 2
- [ ] Install PostgreSQL native di VM3
- [ ] Deploy project-service di VM3
- [ ] Run migrations + seed
- [ ] Register Kong route
- [ ] Test: Project Management portal

### Deploy Phase 3
- [ ] Setup VM6 (Docker, network)
- [ ] Copy + deploy semua service dari VM3
- [ ] Configure Kong upstreams + targets
- [ ] Enable health checks
- [ ] Test failover: stop VM3 → verify VM6 handles traffic
- [ ] Test failback: start VM3 → verify both active

### Post-deploy
- [ ] Monitor logs 30 menit
- [ ] Check Grafana dashboards (VM4)
- [ ] Update MEMORY.md
- [ ] Notify Mizar: deployment complete

---

## Rollback Plan
Kalau ada masalah:
1. Frontend: `git stash` + rebuild dengan commit sebelumnya
2. Backend PHP: revert SCP files, restart containers
3. Backend Go: revert SCP files, restart containers
4. Kong: remove upstream targets VM6, revert to single target
5. PostgreSQL: drop database, uninstall jika perlu
6. SQL Server: restore from backup

---

## Estimasi Waktu
| Phase | Estimasi |
|-------|----------|
| Phase 1 (Deploy fitur) | 1-2 jam |
| Phase 2 (PostgreSQL + Project) | 30-45 menit |
| Phase 3 (VM6 + Kong LB) | 1-2 jam |
| Phase 4 (Sync script) | 15 menit |
| Testing + verify | 30 menit |
| **Total** | **3-5 jam** |

---

## Notes
- VM2/VM3 tidak ada git repo — deploy via SCP dari VM1
- Ansible playbooks tersedia di `/var/www/my-unila/deployment/production/ansible/`
- Kong admin port production: **9801** (bukan 8001)
- PostgreSQL VM2 adalah KHUSUS untuk Kong — jangan campur dengan app data
- Semua Go service stateless — state di SQL Server 119 + Redis VM2
- VM6 harus bisa akses: SQL Server 119, Redis VM2, PostgreSQL VM3
