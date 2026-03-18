# Deploy Production Plan — Updated 19 Maret 2026

## Overview
Deploy semua fitur baru dari staging (VM5) ke production (VM1-VM4) + setup VM6 replica + Kong LB.

## Status: PLAN ONLY — Tunggu Mizar testing staging + SSH access

## What Changed Since Last Plan
Banyak fitur baru ditambah di sesi 17-18 Maret 2026:
- RBAC Enforcement (Redis permissions, matrix UI, Go middleware)
- Project Management (backend, frontend, members, watchers, org structure, pimpinan visibility)
- Data Unila Export Excel (17 page)
- IKU 9 bug fix
- Dashboard Pimpinan + Data Unila portal fix
- Kong project-service registration

## Detailed Guides (files sudah ada)
- PostgreSQL VM3: `docs/VM3-POSTGRESQL-SETUP.md`
- VM6 Replica + Kong LB: `docs/VM6-REPLICA-SETUP.md`
- RBAC: `docs/RBAC-ENFORCEMENT-PLAN.md`
- Org Structure: `docs/PROJECT-MANAGEMENT-ORG-PLAN.md`

## Config Files Ready
- `deployment/production/vm3-backend2/services/project/docker-compose.yml`
- `deployment/production/vm6-replica/docker-compose.yml`
- `deployment/production/vm6-replica/.env.example`
- `deployment/production/vm6-replica/scripts/sync-from-vm3.sh`
- `deployment/production/kong-lb/setup-upstreams.sh`
- `deployment/production/kong-lb/check-health.sh`
- `deployment/production/ansible/playbooks/06-deploy-vm6-replica.yml`

---

## Phase 1: SQL Server Seed (Production DB)

### Pre-requisite: Backup DB production
```bash
# Di SQL Server 119, backup pdut dulu sebelum seed
BACKUP DATABASE pdut TO DISK = 'C:\SQLBackupShare\pdut_pre_deploy_20260319.bak'
```

### Seeds yang perlu dijalankan di pdut (production)
File: `data-model/script/sqlserver/seed_staging_to_production_20260317.sql`

Isi:
1. **Data Unila** — App seed: 23 menus, 11 roles, `a_live=1`, `a_coming_soon=0`, `a_terintegrasi=1`, `url=/dashboard/data-unila`
2. **Dashboard Pimpinan** — `a_live=1`, `a_coming_soon=0`, `a_terintegrasi=1`, `url=/dashboard/pimpinan`
3. **Project Management** — App seed: kategori `Tools & Utilities`, 10 menus, RBAC Admin+Developer, `url=/dashboard/project-management`
4. **WS Endpoint** — 121 endpoints WS-MYUNILA (`/v1/` prefix)
5. **WS Authorization** — sync per PJ Aplikasi
6. **Manajemen Akses** — pengguna management permissions, PJ Aplikasi fix

**⚠️ PENTING: Seed harus dijalankan SEBELUM deploy service, karena service baca menu/role dari DB**

---

## Phase 2: Deploy VM2 — PHP Services (Auth + Dashboard + Public)

### SSH ke VM1 dulu, lalu deploy via Ansible/SCP

```bash
# Dari VM1
cd /var/www/my-unila
git pull origin master

# Deploy ke VM2 via Ansible
ansible-playbook -i deployment/production/ansible/inventory/hosts.yml \
  deployment/production/ansible/playbooks/03-deploy-vm2-backend1.yml
```

### Atau manual SCP + rebuild:
```bash
# SCP dari VM1 ke VM2
scp -r backend/auth-service/ mybackend1@192.168.120.42:/var/www/my-unila/backend/auth-service/
scp -r backend/dashboard-service/ mybackend1@192.168.120.42:/var/www/my-unila/backend/dashboard-service/
scp -r backend/public-service/ mybackend1@192.168.120.42:/var/www/my-unila/backend/public-service/

# SSH ke VM2, rebuild
cd /var/www/my-unila/deployment/production/vm2-backend1
docker compose -f services/auth/docker-compose.yml up -d --build
docker compose -f services/dashboard/docker-compose.yml up -d --build
docker compose -f services/public/docker-compose.yml up -d --build
```

### Changes di VM2:
| Service | Changes |
|---------|---------|
| Auth | RBAC permission caching (`cacheUserPermissions`), matrix API (`GET/POST /matrix`), tambah pengguna, PJ fix, WS Auth revamp |
| Dashboard | IKU 9 binding fix, Data Unila backend (semua modul + sub-pages), Keuangan data |
| Public | Minor |

### Auth Service — Verify after deploy:
```bash
# Test routes
docker exec myunila-auth php artisan route:list --path=matrix
# Harus ada: GET /matrix, POST /matrix/bulk

# Clear cache
docker exec myunila-auth php artisan cache:clear
docker exec myunila-auth php artisan route:clear
```

---

## Phase 3: Deploy VM3 — Go Services

```bash
# SCP dari VM1 ke VM3
scp -r backend/api-service/ mybackend2@192.168.120.43:/var/www/my-unila/backend/api-service/
scp -r backend/sister-service/ mybackend2@192.168.120.43:/var/www/my-unila/backend/sister-service/
scp -r backend/feeder-service/ mybackend2@192.168.120.43:/var/www/my-unila/backend/feeder-service/
scp -r backend/myunila-service/ mybackend2@192.168.120.43:/var/www/my-unila/backend/myunila-service/
scp -r backend/keuangan-service/ mybackend2@192.168.120.43:/var/www/my-unila/backend/keuangan-service/
scp -r backend/monitoring-service/ mybackend2@192.168.120.43:/var/www/my-unila/backend/monitoring-service/

# Rebuild semua Go services di VM3
cd /var/www/my-unila/deployment/production/vm3-backend2
for svc in sister feeder myunila api keuangan monitoring; do
  docker compose -f services/$svc/docker-compose.yml --env-file .env up -d --build
done
```

### Changes di VM3:
| Service | Changes |
|---------|---------|
| API (ws-service) | RBAC Go middleware (`rbac_permission.go`), WS Auth enforcement (`ws_auth.go`), `/v1/` migration |
| Keuangan | SIMPEDAM API integration |
| Others | Minor |

### VM3 .env — tambah env vars baru:
```env
# RBAC (default off — aktifkan setelah verified)
RBAC_ENFORCEMENT_ENABLED=false
RBAC_ENFORCEMENT_MODE=permissive

# WS Auth
WS_AUTH_ENABLED=true
WS_AUTH_APP_ID=<production-app-id>
AUTH_CACHE_PREFIX=myunila_database_myunila_cache_
API_REDIS_DB=1
```

---

## Phase 4: Install PostgreSQL + Project Service di VM3

### Panduan lengkap: `docs/VM3-POSTGRESQL-SETUP.md`

Ringkasan:
```bash
# SSH ke VM3
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE USER myunila_pm WITH PASSWORD '<PASSWORD>';"
sudo -u postgres psql -c "CREATE DATABASE myunila_project OWNER myunila_pm;"
sudo -u postgres psql -d myunila_project -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

# Config: listen_addresses = '*', pg_hba allow 192.168.120.0/24
sudo systemctl restart postgresql

# Import schema
psql -U myunila_pm -d myunila_project -f data-model/script/postgresql/project_management_v1.0_fresh.sql

# Migration tabel baru (members, watchers, org)
psql -U myunila_pm -d myunila_project << 'SQL'
CREATE TABLE IF NOT EXISTS project_members (...);
CREATE TABLE IF NOT EXISTS project_watchers (...);
CREATE TABLE IF NOT EXISTS project_org_nodes (...);
CREATE TABLE IF NOT EXISTS project_org_edges (...);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS id_unit VARCHAR(50);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS nm_unit VARCHAR(200);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'private';
SQL

# Deploy project-service
scp -r backend/project-service/ mybackend2@192.168.120.43:/var/www/my-unila/backend/
cd /var/www/my-unila/deployment/production/vm3-backend2
docker compose -f services/project/docker-compose.yml --env-file .env up -d --build
```

### Register di Kong (VM1):
```bash
curl -X POST http://localhost:9801/services/ \
  --data "name=project-service" \
  --data "host=192.168.120.43" \
  --data "port=8095"

curl -X POST http://localhost:9801/services/project-service/routes \
  --data "name=project-service-route" \
  --data "paths[]=/project-service" \
  --data "strip_path=true"
```

**Note:** Di staging, UFW perlu allow Docker→Host traffic (`ufw allow from 172.20.0.0/16 to any port 8095`). Di production, project-service mungkin on Docker network — check dulu.

---

## Phase 5: Deploy VM1 — Frontend + Kong

```bash
# SSH ke VM1
cd /var/www/my-unila
git pull origin master

# Rebuild frontend
cd deployment/production/vm1-frontend-kong
docker compose --env-file .env -f services/frontend/docker-compose.yml up -d --build
```

### Frontend Changes:
| Feature | Files |
|---------|-------|
| Data Unila | 18 halaman + Export Excel (xlsx) |
| IKU | Dashboard IKU (473 lines) |
| Dashboard Pimpinan | IKU components (IKUCard, IKUDetailModal) |
| Project Management | 19 TSX (kanban, board, tasks, docs, sprints, timeline, settings) |
| RBAC Matrix | RBACMatrixEditor.tsx (766 lines) |
| Pimpinan Visibility | ProjectCard badge, settings tabs (members/watchers/visibility) |
| ManAkses | Tambah pengguna, responsive modals, WS Auth revamp |
| Hooks | usePermission.ts |
| Services | rbacMatrixService, ikuDataService, projectService (updated), exportExcel |

### Frontend .env — tambah:
```env
NEXT_PUBLIC_PROJECT_API_URL=http://192.168.120.43:8095/api/v1
# Atau via Kong: http://192.168.120.41:9800/project-service/api/v1
```

### Frontend Dockerfile — pastikan build args ada:
```dockerfile
ARG NEXT_PUBLIC_PROJECT_API_URL
ENV NEXT_PUBLIC_PROJECT_API_URL=$NEXT_PUBLIC_PROJECT_API_URL
```

**⚠️ JANGAN pakai `docker build` langsung — SELALU via compose + env file!**

---

## Phase 6: VM6 Replica + Kong Load Balancing

### Panduan lengkap: `docs/VM6-REPLICA-SETUP.md`

Ringkasan:
1. Install Docker di VM6
2. Clone repo / SCP files
3. Copy .env dari VM3 (sama persis — semua service stateless)
4. Project service: `PG_HOST=192.168.120.43` (remote ke VM3 PostgreSQL)
5. `docker compose up -d --build`
6. Run `deployment/production/kong-lb/setup-upstreams.sh` di VM1
7. Verify: `deployment/production/kong-lb/check-health.sh`
8. Test failover: stop VM6 → traffic ke VM3 only → start VM6 → both active

---

## Deployment Order (WAJIB URUT!)

```
1. Backup DB production (SQL Server 119)
2. Run SQL seed di production DB
3. Deploy VM2 (PHP services) → verify auth routes + dashboard
4. Deploy VM3 (Go services) → verify health all services
5. Install PostgreSQL di VM3 + deploy project-service → verify
6. Deploy VM1 (Frontend) → verify portal + all apps accessible
7. Register project-service di Kong (VM1)
8. Smoke test semua fitur
9. [Optional] Setup VM6 replica + Kong LB
10. Monitor 30 menit, check Grafana (VM4)
```

---

## Smoke Test Checklist

### Portal
- [ ] Login SSO
- [ ] Portal tampil semua apps (Data Unila, Dashboard Pimpinan, Project Management)
- [ ] Klik Data Unila → masuk (bukan "Belum Tersedia")
- [ ] Klik Dashboard Pimpinan → masuk
- [ ] Klik Project Management → masuk

### Data Unila
- [ ] Dashboard overview
- [ ] Mahasiswa list + Export Excel
- [ ] Dosen list + Export Excel
- [ ] IKU dashboard (6 IKU wajib ada data)
- [ ] Keuangan UKT + SPP

### Dashboard Pimpinan
- [ ] Beranda
- [ ] IKU (6 indikator, termasuk IKU 9 ≠ NULL)
- [ ] Mahasiswa, Dosen, Litabmas tabs

### Project Management
- [ ] Project list (global stats)
- [ ] Kanban board (drag & drop)
- [ ] Task detail modal
- [ ] Documents (upload, preview, version)
- [ ] Settings (members, watchers, visibility tabs)
- [ ] Sprint management

### Manajemen Akses
- [ ] Tambah pengguna
- [ ] RBAC → tab "Permission Matrix"
- [ ] WS Authorization (per PJ Aplikasi)
- [ ] WS Endpoint (filter per aplikasi)

### RBAC Enforcement (setelah verified)
- [ ] Set `RBAC_ENFORCEMENT_ENABLED=true` di VM3
- [ ] Test: non-super role → restricted actions
- [ ] Test: super role → full access

---

## Rollback Plan
1. Frontend: `git stash` + rebuild commit sebelumnya
2. Backend PHP: revert SCP files, restart containers
3. Backend Go: revert SCP files, restart containers
4. PostgreSQL: `dropdb myunila_project` + uninstall jika perlu
5. SQL Server: restore dari backup
6. Kong: remove project-service (`curl -X DELETE http://localhost:9801/services/project-service`)

---

## Estimasi Waktu
| Phase | Estimasi |
|-------|----------|
| Phase 1 (SQL Seed) | 15 menit |
| Phase 2 (VM2 PHP) | 30-45 menit |
| Phase 3 (VM3 Go) | 30-45 menit |
| Phase 4 (PostgreSQL + Project) | 30 menit |
| Phase 5 (VM1 Frontend) | 15-20 menit |
| Phase 6 (VM6 + Kong LB) | 1-2 jam |
| Smoke Test | 30 menit |
| **Total tanpa VM6** | **~2-3 jam** |
| **Total dengan VM6** | **~4-5 jam** |

---

## Environment Summary

### Staging (VM5) — Verified Working ✅
| Service | Port | Status |
|---------|------|--------|
| Frontend | 3000 | ✅ healthy |
| Kong | 9800/9801 | ✅ healthy |
| Auth | via nginx:80 | ✅ healthy |
| Dashboard | via nginx:82 | ✅ healthy |
| Public | via nginx:81 | ✅ healthy |
| Project | 8095 | ✅ healthy |
| Sister | 8083 | ✅ healthy |
| Feeder | 8084 | ✅ healthy |
| WS/API | 8085 | ✅ healthy |
| MyUnila | 8086 | ✅ healthy |
| Keuangan | 8088 | ✅ healthy |
| Monitoring | 8089 | ✅ healthy |
| PostgreSQL | 5432 | ✅ (native) |
| Redis | 6379 | ✅ healthy |
| MeiliSearch | 7700 | ✅ healthy |

### Production Target
| VM | Services | IP |
|----|----------|-----|
| VM1 | Frontend + Kong | 192.168.120.41 |
| VM2 | Auth + Dashboard + Public + Nginx + Redis + MeiliSearch | 192.168.120.42 |
| VM3 | Sister + Feeder + MyUnila + API + Keuangan + Monitoring + **Project** + **PostgreSQL** | 192.168.120.43 |
| VM4 | Prometheus + Grafana + Loki + Alertmanager | 192.168.120.44 |
| VM6 | Replica VM3 (active-active) | 192.168.120.46 |
| DB | SQL Server 2019 | 192.168.123.119 |
