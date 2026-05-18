# Production Deployment — Phase A/B/C/D Canonical (2026-05-18)

**Scope:** 25 commits di `master`, fix canonical data + UX polish + simbak schema + RBAC + MinIO proxy.
**Risk:** LOW — code-only changes (no DDL pdut). DDL SIMBAK postgres opsional via `RECREATE-SIMBAK-DB.md`.

## Commits to deploy

```
5738fd5e4 fix(iku): expose persentaseResponden ke API response IKU 2
6052037da feat(pimpinan): warmer command + IKU2 dual metric
7f37a14ab fix(data-unila/dosen): show() validate UUID format → 404 not 500
b8fd52181 fix(data-unila/akademik): prodi list+stats filter id_jns_sms='3' + id_fak NOT NULL
62592f7c3 fix(fe/dockerfile): add MINIO_STORAGE_URL ARG/ENV utk build-time rewrite
1d49b8cc0 fix(fe): proxy /myunila-storage/* via Next.js rewrite (foto blank fix)
e9a4de74a fix(pimpinan): sebaranFakultas anchor strategy — SUM ≤ total
6c0ae6e0a docs(simbak): RECREATE-SIMBAK-DB.md panduan
f51fbb3f0 fix(fe/scope): dashboardClient inject id_jurusan Kajur/Admin Jurusan
4cd642417 fix(scope): RoleScopeFilter Kajur/Admin Jurusan handler
208bb3990 feat(rbac/sql): repair menu Data Unila + grant 6 role
6c950fbe4 fix(rbac/sql): bootstrap Kajur peran (id=47)
ec3926bc2 feat(rbac/sql): grant 4 user (Dekan+Kajur+Kaprodi)
5c5bb330c feat(rbac/sql): grant mizar.zulmi single
1bb11d254 fix(rbac/sql): NEWID() utk uniqueidentifier columns
85cf836b8 chore(rbac/sql): sync menu Dashboard Pimpinan + Data Unila
670e9ea95 fix(pimpinan+data-unila): canonical alignment 37.181 + 1.536 + 1.116 + 132 + Rp 1,95M
```

## Pre-deploy checklist

- [ ] Backup `man_akses.menu_role` (sqlserver pdut): `SELECT * INTO menu_role_backup_20260518 FROM man_akses.menu_role`
- [ ] Note env yang baru: `MINIO_STORAGE_URL` di `.env` VM1 (default ke `http://192.168.120.47:9000`, OVERRIDE kalau MinIO di IP lain)
- [ ] Verify SSH access ke VM1, VM2, VM8

## Step 1 — VM2 (backend1: auth + public + dashboard + nginx)

```bash
ssh mybackend1@192.168.120.42
cd /var/www/my-unila
git pull origin master
cd deployment/production/vm2-backend1
./scripts/deploy.sh
```

**Verify after rebuild:**
```bash
# Mahasiswa Aktif canonical
curl -s http://localhost:9800/dashboard-service/api/v1/dashboard/beranda | jq '.data.summaryStats.mahasiswa.active'
# Expected: 37181

# Dosen + Tendik
curl -s http://localhost:9800/dashboard-service/api/v1/dashboard/beranda | jq '.data.summaryStats.sdm'
# Expected: {"dosen":1536, "tendik":1116, ...}

# Public service mahasiswa
curl -s http://localhost:9800/public-service/api/v1/unila/statistics | jq '.data.mahasiswa_aktif'
# Expected: 37181

# Pimpinan warmer
docker exec myunila-dashboard-service php artisan pimpinan:warm-cache --year=2025
docker exec myunila-dashboard-service php artisan iku:warm-cache --year=2025
```

## Step 2 — VM1 (frontend + Kong)

```bash
ssh myfrontend@192.168.120.41
cd /var/www/my-unila
git pull origin master

# Tambah MINIO_STORAGE_URL di .env (kalau belum ada)
grep -q "^MINIO_STORAGE_URL=" deployment/production/vm1-frontend-kong/.env \
  || echo "MINIO_STORAGE_URL=http://192.168.120.47:9000" >> deployment/production/vm1-frontend-kong/.env

cd deployment/production/vm1-frontend-kong
./scripts/deploy.sh
```

**Verify after rebuild:**
```bash
# Foto proxy
curl -sI https://my.unila.ac.id/myunila-storage/photos/sdm/<any-uuid>.jpg
# Expected: 200 atau 404 (not 502, tidak timeout)

# Dashboard Pimpinan accessible
curl -sI https://my.unila.ac.id/dashboard/pimpinan
# Expected: 200
```

## Step 3 — RBAC SQL scripts (sequential)

Run via **DBeaver/mssql-cli** ke SQL Server pdut production (BUKAN via artisan):

```sql
-- 1) Sync menu Dashboard Pimpinan
@backend/auth-service/database/sql/rbac/20260518_sync_menu_dashboard_pimpinan.sql

-- 2) Sync menu Data Unila + repair structure
@backend/auth-service/database/sql/rbac/20260518_repair_menu_data_unila_structure.sql

-- 3) Grant menu_role akses 6 role ke 2 app
@backend/auth-service/database/sql/rbac/20260518_grant_menu_role_data_unila_dashboard_pimpinan.sql

-- 4) Grant role_pengguna 4 user spesifik (edit dulu kalau perlu)
@backend/auth-service/database/sql/rbac/20260518_grant_dekan_kajur_kaprodi_4users.sql
```

Setiap script ada BEGIN TRANSACTION + verify SELECT. Review hasil sebelum COMMIT.

## Step 4 — VM8 (SIMBAK) — opsional

Kalau ingin upgrade schema SIMBAK ke v1.2:

**Opsi A: fresh recreate** (destructive, data hilang):
Lihat `data-model/script/postgresql/simbak/RECREATE-SIMBAK-DB.md` section "Opsi A".

**Opsi B: incremental alter** (safe):
```bash
ssh mybak@192.168.120.48
cd /var/www/my-unila && git pull origin master
# Backup + apply alter 07-19 sequential
# Detail: RECREATE-SIMBAK-DB.md section "Opsi B"
```

## Step 5 — Production smoke test

```bash
# Headline canonical match
curl -s https://my.unila.ac.id/dashboard-service/api/v1/dashboard/beranda \
  | jq '.data.summaryStats | {mhs: .mahasiswa.active, dosen: .sdm.dosen, tendik: .sdm.tendik, prodi: .akademik.prodi}'

# Expected:
# {"mhs": 37181, "dosen": 1536, "tendik": 1116, "prodi": 132}
```

## Rollback (if needed)

- **Code:** `git reset --hard <previous-commit> && rebuild`
- **menu/menu_role:** restore dari backup table — script di RBAC SQL files
- **simbak:** restore pg_dump backup

## Post-deploy

- Monitor `docker logs -f myunila-dashboard-service` minimal 30 menit
- Cek IKU page response time <500ms setelah cache warm
- Telegram notify users untuk hard-refresh browser (FE cache)
