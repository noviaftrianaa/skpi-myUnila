# Deploy Production Plan — Updated 24 Maret 2026

## Overview
Deploy semua fitur baru dari staging (VM5) ke production (VM1-VM4) + setup VM6 replica + Kong LB.

## Status: PLAN ONLY — Mizar belum deploy, perlu testing staging dulu

## What Changed (17-24 Maret 2026)

### Fitur Baru
1. **RBAC Enforcement** — Redis permissions cache, matrix UI, Go + PHP middleware
2. **Project Management** — Full module (kanban, tasks, docs, sprints, charts, heatmap, org structure, pimpinan visibility)
3. **Data Unila Export Excel** — 17 halaman
4. **IKU 9 bug fix** — binding order drilldown per fakultas
5. **Dashboard Pimpinan + Data Unila** — portal fix (URL, a_terintegrasi)
6. **SIAKADU Integration** — Backend sync + frontend 9 pages (mahasiswa, kelas, kurikulum, matkul, KRS/KHS, transkrip, status kuliah, pegawai, wisuda)
7. **SIAKADU Schema** — 49 tables SQL Server script (siakadu.*)
8. **Contribution Charts** — Heatmap, activity timeline, burndown, team ranking, user profile
9. **Security Hardening** — fail2ban, SSH key-only, .env permissions, credentials dir

### Commits (17-24 Maret)
```
9028a33cd feat(siakadu): frontend 9 pages + service
20fbdecbb feat(siakadu): backend sync integration (3 modules + API client)
9c2ee858c feat(data-model): SIAKADU schema v1.0 (49 tables)
60ca20a60 feat: contribution charts, heatmap, analytics page
680b36d25 feat: pimpinan visibility, members, watchers, org structure
8eb38e07c fix(project-management): route mismatch fix
46b8ec6a6 feat(rbac): Go RBAC CRUD middleware
c70e6af7a feat(rbac): Permission Matrix Editor UI
cad3e26f1 feat(rbac): full CRUD permission enforcement
b9966081b fix(dashboard): IKU 9 binding order
0fe12ab73 feat(data-unila): Export Excel 17 pages
```

## Detailed Guides
- PostgreSQL VM3: `docs/VM3-POSTGRESQL-SETUP.md`
- VM6 Replica + Kong LB: `docs/VM6-REPLICA-SETUP.md`
- RBAC: `docs/RBAC-ENFORCEMENT-PLAN.md`
- SIAKADU Integration: `docs/SIAKADU-INTEGRATION-PLAN.md`
- SIAKADU Field Mapping: `docs/SIAKADU-FIELD-MAPPING.md`
- Project Contribution: `docs/PROJECT-CONTRIBUTION-PLAN.md`
- Org Structure: `docs/PROJECT-MANAGEMENT-ORG-PLAN.md`

## Config Files Ready
- `deployment/production/vm3-backend2/services/project/docker-compose.yml`
- `deployment/production/vm6-replica/docker-compose.yml` + `.env.example`
- `deployment/production/vm6-replica/scripts/sync-from-vm3.sh`
- `deployment/production/kong-lb/setup-upstreams.sh` + `check-health.sh`
- `deployment/production/ansible/playbooks/06-deploy-vm6-replica.yml`
- `data-model/script/sqlserver/siakadu/siakadu_schema_v1.0_fresh.sql`

---

## Pre-Deploy Checklist

### Sebelum deploy, pastikan testing staging:
- [ ] Login portal → semua apps accessible
- [ ] Data Unila → 18 halaman + Export Excel
- [ ] Dashboard Pimpinan → IKU (6 indikator, IKU 9 ≠ NULL)
- [ ] Project Management → create project, task, kanban, analytics
- [ ] RBAC → tab Permission Matrix, bulk save
- [ ] Manajemen Akses → tambah pengguna, WS Auth
- [ ] SIAKADU → sync mahasiswa (setelah API credentials di-setup)

---

## Phase 1: SQL Server Seed (Production DB)

### Pre-requisite: Backup
```bash
# Di SQL Server 119
BACKUP DATABASE pdut TO DISK = 'C:\SQLBackupShare\pdut_pre_deploy_20260324.bak'
```

### SIAKADU Schema (BARU)
```bash
# Jalankan script SIAKADU schema di SQL Server 119
# File: data-model/script/sqlserver/siakadu/siakadu_schema_v1.0_fresh.sql
# 49 tables di schema siakadu.*
```

### Seeds
File: `data-model/script/sqlserver/seed_staging_to_production_20260317.sql`
- Data Unila: 23 menus, 11 roles
- Dashboard Pimpinan: `a_live=1`, `a_terintegrasi=1`, `url=/dashboard/pimpinan`
- Project Management: kategori Tools & Utilities, 10 menus
- WS Endpoint: 121 endpoints WS-MYUNILA
- SIAKADU Integrator: 10 menus (sudah ada di integrator app)

---

## Phase 2: Deploy VM2 — PHP Services

```bash
# Dari VM1
cd /var/www/my-unila && git pull origin master

# Deploy via Ansible atau SCP
ansible-playbook -i deployment/production/ansible/inventory/hosts.yml \
  deployment/production/ansible/playbooks/03-deploy-vm2-backend1.yml
```

### Changes di VM2:
| Service | Changes |
|---------|---------|
| **Auth** | RBAC permission caching, matrix API, tambah pengguna, WS Auth revamp |
| **Dashboard** | IKU 9 fix, Data Unila backend (semua modul + sub-pages + IKU) |
| **Public** | Minor |

### Verify:
```bash
docker exec myunila-auth php artisan route:list --path=matrix
docker exec myunila-auth php artisan cache:clear
```

---

## Phase 3: Deploy VM3 — Go Services

```bash
# SCP dari VM1 ke VM3
for svc in sister feeder myunila api keuangan monitoring; do
  scp -r backend/$svc-service/ mybackend2@192.168.120.43:/var/www/my-unila/backend/
done

# Rebuild semua
cd /var/www/my-unila/deployment/production/vm3-backend2
for svc in sister feeder myunila api keuangan monitoring; do
  docker compose -f services/$svc/docker-compose.yml --env-file .env up -d --build
done
```

### Changes di VM3:
| Service | Changes |
|---------|---------|
| **MyUnila** | SIAKADU sync modules (3 modules + API client), scheduler types |
| **API (ws-service)** | RBAC Go middleware, WS Auth enforcement |
| **Keuangan** | SIMPEDAM API |

### VM3 .env — tambah:
```env
RBAC_ENFORCEMENT_ENABLED=false
RBAC_ENFORCEMENT_MODE=permissive
WS_AUTH_ENABLED=true
WS_AUTH_APP_ID=<production-app-id>
SIAKADU_API_BASE_URL=http://192.168.120.37:4000/api/v1
SIAKADU_API_USERNAME=<credentials>
SIAKADU_API_PASSWORD=<credentials>
```

### SIAKADU API Config:
Tambah ke `setting.api_configs`:
```sql
INSERT INTO setting.api_configs (api_code, api_name, base_url, auth_type, ...)
VALUES ('SIAKADU', 'SIAKADU API', 'http://192.168.120.37:4000/api/v1', 'jwt', ...);
```
Atau insert via portal ManAkses → Settings → API Config.

---

## Phase 4: Install PostgreSQL + Project Service di VM3

### Panduan: `docs/VM3-POSTGRESQL-SETUP.md`
```bash
# Install PostgreSQL native
sudo apt install -y postgresql postgresql-contrib

# Create DB
sudo -u postgres psql -c "CREATE USER myunila_pm WITH PASSWORD '<PASSWORD>';"
sudo -u postgres psql -c "CREATE DATABASE myunila_project OWNER myunila_pm;"

# Import schema + migration
psql -U myunila_pm -d myunila_project -f project_management_v1.0_fresh.sql
# + migration tables (members, watchers, org, analytics)

# Deploy project-service
docker compose -f services/project/docker-compose.yml --env-file .env up -d --build
```

### Register di Kong:
```bash
curl -X POST http://localhost:9801/services/ \
  --data "name=project-service" --data "host=192.168.120.43" --data "port=8095"
curl -X POST http://localhost:9801/services/project-service/routes \
  --data "name=project-service-route" --data "paths[]=/project-service" --data "strip_path=true"
```

---

## Phase 5: Deploy VM1 — Frontend + Kong

```bash
cd /var/www/my-unila && git pull origin master
cd deployment/production/vm1-frontend-kong
docker compose --env-file .env -f services/frontend/docker-compose.yml up -d --build
```

### Frontend .env — tambah:
```env
NEXT_PUBLIC_PROJECT_API_URL=http://192.168.120.43:8095/api/v1
```

### Frontend Changes (summary):
| Feature | Files |
|---------|-------|
| Data Unila | 18 pages + Export Excel + IKU |
| Project Management | 19 pages + analytics + charts |
| RBAC Matrix | RBACMatrixEditor (766 lines) |
| SIAKADU | 9 sync pages + siakaduService |
| Pimpinan Visibility | Members, watchers, visibility |
| ManAkses | Tambah pengguna, responsive, WS Auth |
| Hooks | usePermission |

---

## Phase 6: VM6 Replica (Optional)

### Panduan: `docs/VM6-REPLICA-SETUP.md`
1. Install Docker di VM6
2. Clone repo
3. Copy .env dari VM3 (PROJECT_PG_HOST=192.168.120.43)
4. `docker compose up -d --build`
5. Run `kong-lb/setup-upstreams.sh`
6. Verify: `kong-lb/check-health.sh`

---

## Deployment Order (WAJIB URUT!)

```
1. Backup DB (SQL Server 119)
2. Run SIAKADU schema script di SQL Server
3. Run SQL seed di production DB
4. Insert SIAKADU API config ke setting.api_configs
5. Deploy VM2 (PHP) → verify
6. Deploy VM3 (Go) → verify
7. Install PostgreSQL + project-service di VM3 → verify
8. Deploy VM1 (Frontend) → verify
9. Register project-service di Kong
10. Smoke test semua fitur
11. [Optional] VM6 replica + Kong LB
```

---

## Smoke Test Checklist

### Portal
- [ ] Login SSO
- [ ] Data Unila → buka, bukan "Belum Tersedia"
- [ ] Dashboard Pimpinan → buka
- [ ] Project Management → buka

### Data Unila
- [ ] Dashboard overview
- [ ] Mahasiswa + Export Excel
- [ ] IKU (6 indikator, IKU 9 ada data)

### Dashboard Pimpinan
- [ ] IKU chart
- [ ] Mahasiswa, Dosen, Litabmas

### Project Management
- [ ] Project list + create
- [ ] Kanban board
- [ ] Task CRUD
- [ ] Analytics (charts + heatmap)
- [ ] Settings (members, watchers, visibility)

### SIAKADU Integrator
- [ ] Mahasiswa sync page (no ComingSoon)
- [ ] Kelas sync page
- [ ] KRS/KHS sync page
- [ ] Sync button works (setelah credentials OK)

### Manajemen Akses
- [ ] RBAC → Permission Matrix tab
- [ ] Tambah pengguna
- [ ] WS Authorization (per PJ Aplikasi)

---

## Rollback Plan
1. Frontend: rebuild commit sebelumnya
2. Backend PHP: revert SCP, restart
3. Backend Go: revert SCP, restart
4. SIAKADU schema: `DROP SCHEMA siakadu CASCADE` (kalau perlu)
5. PostgreSQL: `dropdb myunila_project`
6. SQL Server: restore from backup
7. Kong: remove project-service

---

## Estimasi Waktu
| Phase | Estimasi |
|-------|----------|
| Phase 1 (DB seed + SIAKADU schema) | 20 menit |
| Phase 2 (VM2 PHP) | 30-45 menit |
| Phase 3 (VM3 Go) | 30-45 menit |
| Phase 4 (PostgreSQL + Project) | 30 menit |
| Phase 5 (VM1 Frontend) | 15-20 menit |
| Smoke Test | 30 menit |
| **Total tanpa VM6** | **~2.5-3.5 jam** |
| Phase 6 (VM6 + Kong LB) | 1-2 jam |

---

## Environment — Staging Verified ✅

| Service | Port | Status |
|---------|------|--------|
| Frontend | 3000 | ✅ healthy |
| Kong | 9800/9801 | ✅ healthy |
| Auth | via nginx:80 | ✅ healthy |
| Dashboard | via nginx:82 | ✅ healthy |
| Project | 8095 | ✅ healthy |
| MyUnila | 8086 | ✅ healthy (SIAKADU modules loaded) |
| All Go services | 8083-8089 | ✅ healthy |
| PostgreSQL | 5432 | ✅ native |
| Redis | 6379 | ✅ healthy |

### Production Target
| VM | Services | IP |
|----|----------|-----|
| VM1 | Frontend + Kong | 192.168.120.41 |
| VM2 | Auth + Dashboard + Public + Redis + MeiliSearch | 192.168.120.42 |
| VM3 | Go services + PostgreSQL + **Project** + **SIAKADU sync** | 192.168.120.43 |
| VM4 | Monitoring stack | 192.168.120.44 |
| VM6 | Replica VM3 (optional) | 192.168.120.46 |
| DB | SQL Server 2019 | 192.168.123.119 |
| SIAKADU | SIAKADU API | 192.168.120.37 |
