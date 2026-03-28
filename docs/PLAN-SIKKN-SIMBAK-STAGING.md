# Plan: SI KKN & SIMBAK — PostgreSQL Staging (Full)

**Tanggal:** 2026-03-28
**Target:** Deploy kedua app full-stack di VM5 (staging) dengan PostgreSQL
**Backend:** Kedua app pakai **Laravel** (PHP) — service terpisah

---

## Inventory — Apa Yang Sudah Ada

### SI KKN (SIKNILA)

| Komponen | Status | Detail |
|---|---|---|
| DB Schema | ✅ Ready | `data-model/script/postgresql/si-kkn-schema.sql` — 1490 baris, 7 schema, 25 tabel, 68 index, 44 trigger |
| Frontend | ✅ 27 file .tsx | Dashboard, pendaftaran (2), kelompok, kegiatan (3), bimbingan, penilaian (3), manajemen (4), dokumen, monitoring, master-data (6 tab), layout, config |
| FE Types | ✅ | `lib/services/si-kkn/types.ts` — semua interface lengkap |
| FE Dummy Data | ✅ | `lib/services/si-kkn/dummyData.ts` |
| FE Menu Config | ✅ | 10 menu items, role-based (mahasiswa, dosen, admin_kkn, admin_lppm, pejabat) |
| Portal Seed | ✅ | 20 menu, 65 RBAC entries (pdut_staging) |
| Backend | ❌ BELUM ADA | Tidak ada `kkn-service` folder |
| Seeder JSON | ✅ | `auth-service/database/seeders/data/portal_menus/e-kkn.json` |

### SIMBAK (SIM-BAK)

| Komponen | Status | Detail |
|---|---|---|
| DB Schema | ✅ Ready | `data-model/script/postgresql/simbak_v1.0_fresh.sql` — 1383 baris, 4 schema, 15 tabel |
| Frontend | ✅ 25 file .tsx | Dashboard, surat-mandiri (2), permohonan (2), admin verifikasi (2), admin persetujuan (2), batch (4), riwayat (2), monitoring, master-data (4 tab), layout, config, components (2) |
| FE Types | ✅ | `lib/services/sim-bak/types.ts` — semua interface lengkap |
| FE Dummy Data | ✅ | `lib/services/sim-bak/dummyData.ts` |
| FE Service | ✅ | `lib/services/sim-bak/simBakService.ts` (basic) |
| FE Menu Config | ✅ | 9 menu items, role-based (mahasiswa, admin_bak, admin_fakultas, pejabat) |
| Portal Seed | ✅ | 13 menu, 42 RBAC entries (pdut_staging) |
| Backend Skeleton | ⚠️ Partial | `simbak-service/` — Laravel 11, Dockerfile ✅, dual DB config ✅, JWT middleware ✅, routes ✅, tapi 0 controllers (cuma HealthController) |
| Analisis Doc | ✅ | 2 dokumen lengkap: analisis (16 bab) + alur layanan (10 layanan) |
| Seeder JSON | ✅ | `auth-service/database/seeders/data/portal_menus/sim-bak.json` |

### Infrastructure Staging (VM5)

| Komponen | Status |
|---|---|
| PostgreSQL 16 | ✅ Running (localhost:5432) |
| Redis | ✅ Running (container myunila-redis-staging) |
| Kong Gateway | ✅ Running (admin:8001, proxy:9800/9801) |
| MinIO | ✅ VM7 (192.168.120.47:9000) |
| SQL Server | ✅ pdut_staging (192.168.123.119:1433) |
| Docker | ✅ Running |

### Port Map (Terpakai)

| Port | Service |
|---|---|
| 8081 | Auth (nginx→PHP-FPM) |
| 8082 | Public-service |
| 8083 | Keuangan-service (Go) |
| 8084 | API-service (Go) |
| 8085 | Sister-service (Go) |
| 8086 | Feeder-service (Go) |
| 8087 | MyUnila-service (Go) |
| 8088 | Dashboard-service (PHP) |
| 8089 | Monitoring-service (Go) |
| 8090 | Project-service (Go) |
| 8093 | MeiliSearch |
| 8095 | Project-service (native, non-docker) |
| 9090 | Prometheus |
| 9100 | Node Exporter |
| 9113 | Nginx Exporter |
| 9121 | Redis Exporter |
| 9800 | Kong Proxy |
| 9801 | Kong Admin |

### Port Baru (Available)

| Port | Service |
|---|---|
| **9001** | **kkn-service** (SI KKN) |
| **9002** | **simbak-service** (SIMBAK) |

---

## Phase 1: Database Setup

**Estimasi: 1-2 jam**

### 1.1 Create Users & Databases

```sql
-- Sebagai postgres superuser
CREATE USER myunila_kkn WITH PASSWORD '<generate>';
CREATE DATABASE siknila OWNER myunila_kkn;
GRANT ALL PRIVILEGES ON DATABASE siknila TO myunila_kkn;

CREATE USER myunila_bak WITH PASSWORD '<generate>';
CREATE DATABASE simbak OWNER myunila_bak;
GRANT ALL PRIVILEGES ON DATABASE simbak TO myunila_bak;
```

### 1.2 Run Schema SQL

```bash
# SI KKN — 7 schema, 25 tabel
psql -U myunila_kkn -d siknila -f data-model/script/postgresql/si-kkn-schema.sql

# SIMBAK — 4 schema, 15 tabel
psql -U myunila_bak -d simbak -f data-model/script/postgresql/simbak_v1.0_fresh.sql
```

### 1.3 Seed Data Master

Buat file seed baru:

**`data-model/script/postgresql/si-kkn-seed-staging.sql`:**
- `ref.periode_kkn` — 1-2 periode (aktif + arsip)
- `ref.wilayah_kkn` — 5 wilayah Lampung
- `ref.lokasi_kkn` — 10-15 desa/kelurahan
- `ref.komponen_penilaian` — 5-6 komponen (logbook 20%, laporan 25%, pamong 15%, DPL 25%, absensi 15%)
- `ref.kriteria_penilaian` — skala A-E per komponen
- `ref.jenis_dokumen` — 8-10 jenis (proposal, laporan akhir, sertifikat, foto, surat tugas, dll)

**`data-model/script/postgresql/simbak-seed-staging.sql`:**
- `ref.jenis_layanan` — 10 layanan (sesuai doc analisis bab 4.1):
  1. Surat Keterangan Diterima / LoA (surat_mandiri)
  2. Surat Keterangan Pengganti KTM (surat_mandiri)
  3. Surat Keterangan Pengganti Sertifikat PKKMB (surat_mandiri)
  4. Surat Keterangan Herregistrasi (surat_mandiri)
  5. Cuti Akademik (permohonan_akademik)
  6. Undur Diri (permohonan_akademik)
  7. Alih Program / Pindah Studi (permohonan_akademik)
  8. Penetapan Habis Masa Mukim (batch_administrasi)
  9. Penetapan Putus Studi Akademik (batch_administrasi)
  10. Monitoring Mhs Aktif & Lulusan (monitoring)
- `ref.persyaratan_layanan` — per layanan sesuai doc alur (bab 2.1-2.9)
- `ref.tahapan_layanan` — workflow steps per layanan (status: draft → diajukan → verifikasi → dst)
- `ref.template_dokumen` — placeholder per jenis output

### Deliverable Phase 1:
- [x] 2 database PostgreSQL (siknila, simbak)
- [x] 2 user PostgreSQL (myunila_kkn, myunila_bak)
- [x] Schema applied (39 tabel total)
- [x] Seed data master

---

## Phase 2: Backend — kkn-service (Laravel Baru)

**Estimasi: 3-4 hari**

### 2.1 Scaffold Laravel Project

```bash
cd /var/www/my-unila/backend
composer create-project laravel/laravel kkn-service
```

Lalu setup mengikuti pola `simbak-service`:
- Copy & adapt: `Dockerfile`, `docker/supervisord.conf`, `.env.example`
- Copy middleware: `JwtAuthenticate.php`, `Cors.php`, `ForceJsonResponse.php`, `CheckCrudPermission.php`
- Copy traits: `ApiResponse.php`
- Copy services: `AuditService.php`, `MinioService.php`
- Copy repositories: `BaseRepository.php`
- Dual DB config: `pgsql` (siknila) + `sqlsrv` (pdut_staging)

### 2.2 Structure

```
kkn-service/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── HealthController.php
│   │   │   ├── MasterData/
│   │   │   │   ├── PeriodeController.php
│   │   │   │   ├── WilayahController.php
│   │   │   │   ├── LokasiController.php
│   │   │   │   ├── KomponenPenilaianController.php
│   │   │   │   ├── KriteriaPendaftaranController.php
│   │   │   │   └── JenisDokumenController.php
│   │   │   ├── Pendaftaran/
│   │   │   │   ├── RegistrasiController.php
│   │   │   │   └── VerifikasiController.php
│   │   │   ├── Kelompok/
│   │   │   │   ├── KelompokController.php
│   │   │   │   ├── AnggotaController.php
│   │   │   │   ├── DplController.php
│   │   │   │   └── PamongController.php
│   │   │   ├── Kegiatan/
│   │   │   │   ├── LogbookController.php
│   │   │   │   ├── AbsensiController.php
│   │   │   │   ├── ProkerController.php
│   │   │   │   └── BimbinganController.php
│   │   │   ├── Penilaian/
│   │   │   │   ├── NilaiController.php
│   │   │   │   ├── NilaiAkhirController.php
│   │   │   │   └── PenilaianPamongController.php
│   │   │   ├── Dokumen/
│   │   │   │   ├── DokumenController.php
│   │   │   │   └── SertifikatController.php
│   │   │   ├── Manajemen/
│   │   │   │   ├── ManajemenKelompokController.php
│   │   │   │   ├── PenempatanController.php
│   │   │   │   ├── DplManajemenController.php
│   │   │   │   └── VerifikasiManajemenController.php
│   │   │   └── Dashboard/
│   │   │       ├── DashboardController.php
│   │   │       └── MonitoringController.php
│   │   └── Middleware/
│   │       ├── JwtAuthenticate.php
│   │       ├── Cors.php
│   │       ├── ForceJsonResponse.php
│   │       └── CheckCrudPermission.php
│   ├── Models/ (25 models sesuai schema)
│   │   ├── Ref/
│   │   │   ├── PeriodeKkn.php
│   │   │   ├── WilayahKkn.php
│   │   │   ├── LokasiKkn.php
│   │   │   ├── KomponenPenilaian.php
│   │   │   ├── KriteriaPenilaian.php
│   │   │   └── JenisDokumen.php
│   │   ├── Pendaftaran/
│   │   │   ├── RegistrasiKkn.php
│   │   │   ├── DataPemohon.php
│   │   │   └── VerifikasiSyarat.php
│   │   ├── Kelompok/
│   │   │   ├── KelompokKkn.php
│   │   │   ├── AnggotaKelompok.php
│   │   │   ├── DplKelompok.php
│   │   │   └── PamongDesa.php
│   │   ├── Kegiatan/
│   │   │   ├── ProgramKerja.php
│   │   │   ├── LogbookHarian.php
│   │   │   ├── Absensi.php
│   │   │   ├── LaporanKelompok.php
│   │   │   └── CatatanBimbingan.php
│   │   ├── Penilaian/
│   │   │   ├── NilaiMahasiswa.php
│   │   │   ├── NilaiAkhir.php
│   │   │   └── PenilaianPamong.php
│   │   └── Dokumen/
│   │       ├── DokumenKkn.php
│   │       └── Sertifikat.php
│   ├── Repositories/
│   ├── Services/
│   └── Traits/
├── config/
│   ├── database.php  (pgsql + sqlsrv dual)
│   └── ...
├── routes/api.php
├── docker/supervisord.conf
├── Dockerfile
├── .env.example
└── docker-compose.yml
```

### 2.3 API Routes — kkn-service

```
Base: /api

Public:
  GET  /health

Protected (JWT):
  # Master Data (admin)
  GET|POST          /v1/master/periode
  GET|PUT|DELETE     /v1/master/periode/{id}
  GET|POST          /v1/master/wilayah
  GET|PUT|DELETE     /v1/master/wilayah/{id}
  GET|POST          /v1/master/lokasi
  GET|PUT|DELETE     /v1/master/lokasi/{id}
  GET|POST          /v1/master/komponen-penilaian
  GET|PUT|DELETE     /v1/master/komponen-penilaian/{id}
  GET|POST          /v1/master/kriteria
  GET|PUT|DELETE     /v1/master/kriteria/{id}
  GET|POST          /v1/master/jenis-dokumen
  GET|PUT|DELETE     /v1/master/jenis-dokumen/{id}

  # Pendaftaran (mahasiswa + admin)
  GET               /v1/pendaftaran
  POST              /v1/pendaftaran
  GET               /v1/pendaftaran/{id}
  PUT               /v1/pendaftaran/{id}
  POST              /v1/pendaftaran/{id}/ajukan
  GET               /v1/pendaftaran/{id}/syarat
  POST              /v1/pendaftaran/{id}/verifikasi  (admin)

  # Kelompok
  GET|POST          /v1/kelompok
  GET|PUT           /v1/kelompok/{id}
  GET|POST|DELETE   /v1/kelompok/{id}/anggota
  GET|POST|PUT      /v1/kelompok/{id}/dpl
  GET|POST|PUT      /v1/kelompok/{id}/pamong

  # Kegiatan
  GET|POST          /v1/kegiatan/logbook
  GET|PUT           /v1/kegiatan/logbook/{id}
  POST              /v1/kegiatan/logbook/{id}/approve  (DPL)
  GET|POST          /v1/kegiatan/absensi
  GET|POST          /v1/kegiatan/proker
  GET|PUT           /v1/kegiatan/proker/{id}

  # Bimbingan
  GET|POST          /v1/bimbingan
  GET               /v1/bimbingan/{id}

  # Penilaian
  GET|POST          /v1/penilaian/nilai
  PUT               /v1/penilaian/nilai/{id}
  GET               /v1/penilaian/rekap
  GET               /v1/penilaian/rekap/{id_anggota}
  GET               /v1/penilaian/nilai-akhir
  GET|POST          /v1/penilaian/pamong
  PUT               /v1/penilaian/pamong/{id}

  # Dokumen
  GET|POST          /v1/dokumen
  GET|DELETE        /v1/dokumen/{id}
  GET               /v1/dokumen/{id}/download
  GET               /v1/sertifikat
  GET               /v1/sertifikat/{id}
  GET               /v1/sertifikat/{id}/download

  # Manajemen (admin)
  GET               /v1/manajemen/kelompok
  POST              /v1/manajemen/kelompok/generate
  POST              /v1/manajemen/penempatan
  GET|POST|PUT|DEL  /v1/manajemen/dpl
  GET               /v1/manajemen/verifikasi
  POST              /v1/manajemen/verifikasi/{id}

  # Dashboard & Monitoring
  GET               /v1/dashboard/overview
  GET               /v1/dashboard/statistik
  GET               /v1/monitoring
  GET               /v1/monitoring/export
```

### 2.4 .env.example — kkn-service

```env
APP_NAME="KKN Service"
APP_ENV=staging
APP_KEY=
APP_DEBUG=true
APP_TIMEZONE=Asia/Jakarta
APP_URL=http://localhost:9001

# PostgreSQL (siknila - PRIMARY)
DB_CONNECTION=pgsql
DB_HOST=host.docker.internal
DB_PORT=5432
DB_DATABASE=siknila
DB_USERNAME=myunila_kkn
DB_PASSWORD=

# SQL Server (pdut - READ ONLY)
SQLSRV_HOST=192.168.123.119
SQLSRV_PORT=1433
SQLSRV_DATABASE=pdut_staging
SQLSRV_USERNAME=
SQLSRV_PASSWORD=
SQLSRV_TRUST_SERVER_CERTIFICATE=true

# MinIO
MINIO_ENDPOINT=http://192.168.120.47:9000
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=myunila-storage
MINIO_REGION=us-east-1

# Redis
REDIS_HOST=host.docker.internal
REDIS_PORT=6379
CACHE_STORE=redis
CACHE_PREFIX=kkn_
QUEUE_CONNECTION=redis

# JWT (validation only)
JWT_SECRET=
JWT_ALGO=HS256

LOG_CHANNEL=stack
LOG_LEVEL=debug
```

### Deliverable Phase 2:
- [x] `kkn-service/` Laravel project with dual DB
- [x] 25 Models (matching schema)
- [x] ~25 Controllers
- [x] All API routes
- [x] Dockerfile + supervisord.conf
- [x] Health check endpoint working

---

## Phase 3: Backend — simbak-service (Lanjutkan Skeleton)

**Estimasi: 2-3 hari**

### 3.1 What Already Exists

✅ Project structure (Laravel 11)
✅ Dockerfile (Alpine, PHP-FPM, SQL Server driver, PostgreSQL driver, Redis)
✅ supervisord.conf (PHP-FPM + Queue Worker)
✅ config/database.php (pgsql + sqlsrv dual connection)
✅ .env.example (lengkap)
✅ Middleware: JwtAuthenticate, Cors, ForceJsonResponse, CheckCrudPermission
✅ Services: AuditService, MinioService
✅ Traits: ApiResponse
✅ Repositories: BaseRepository
✅ routes/api.php (LENGKAP — semua route sudah didefinisikan!)

### 3.2 What Needs to Be Built

Routes sudah ada tapi reference controllers yang belum exist:

```
Controllers needed (from routes/api.php):
├── Api/MasterData/
│   ├── JenisLayananController.php      (7 methods)
│   ├── PersyaratanController.php       (CRUD)
│   ├── TahapanController.php           (CRUD)
│   └── TemplateDokumenController.php   (CRUD)
├── Api/Layanan/
│   ├── PengajuanController.php         (5 methods: index, store, show, uploadDokumen, ajukan, myPengajuan)
│   ├── VerifikasiController.php        (3 methods: verifikasi, mintaPerbaikan, terbitkan)
│   ├── PersetujuanController.php       (3 methods: queue, approve, reject)
│   └── DokumenController.php           (3 methods: download, downloadHasil, destroy)
├── Api/Batch/
│   └── BatchController.php             (6 methods: index, store, show, candidates, verifikasiKandidat, finalize)
└── Api/Dashboard/
    ├── DashboardController.php         (4 methods: overview, sla, activityLog, trends)
    └── MonitoringController.php        (3 methods: mahasiswaAktif, lulusan, export)
```

Models needed (15 sesuai schema):
```
├── Ref/
│   ├── JenisLayanan.php
│   ├── PersyaratanLayanan.php
│   ├── TahapanLayanan.php
│   └── TemplateDokumen.php
├── Layanan/
│   ├── Pengajuan.php
│   ├── DataPemohon.php
│   ├── DokumenPengajuan.php
│   ├── RiwayatPengajuan.php
│   ├── PersetujuanPengajuan.php
│   └── DokumenHasil.php
├── Batch/
│   ├── BatchPenetapan.php
│   ├── KandidatBatch.php
│   └── VerifikasiBatch.php
└── Log/
    ├── JejakAudit.php
    └── AktivitasData.php
```

### 3.3 .env Staging Update

Ubah port dari default 8091 (di .env.example) ke **9002**:
```env
APP_URL=http://localhost:9002
```

Nginx config internal: listen 9002, proxy ke PHP-FPM 9000.

### Deliverable Phase 3:
- [x] 15 Models
- [x] 11 Controllers (34 methods total)
- [x] Repositories per domain
- [x] Services per domain
- [x] Migrations (optional — schema SQL sudah ada)
- [x] Health check working

---

## Phase 4: Docker & Kong Routing

**Estimasi: 2-3 jam**

### 4.1 Docker Compose Updates

Tambah ke `backend/docker-compose.yml`:

```yaml
  # ============================================
  # SI KKN Service (Laravel + PHP-FPM + Nginx)
  # ============================================
  kkn-service:
    build:
      context: ./kkn-service
      dockerfile: Dockerfile
    container_name: myunila-kkn-staging
    restart: unless-stopped
    extra_hosts:
      - "host.docker.internal:host-gateway"
    environment:
      - APP_ENV=staging
      - DB_HOST=host.docker.internal
      - DB_PORT=5432
      - DB_DATABASE=siknila
      - DB_USERNAME=myunila_kkn
      - DB_PASSWORD=${PG_KKN_PASSWORD}
      - SQLSRV_HOST=${MSSQL_HOST:-192.168.123.119}
      - SQLSRV_DATABASE=pdut_staging
      - SQLSRV_USERNAME=${MSSQL_USERNAME}
      - SQLSRV_PASSWORD=${MSSQL_PASSWORD}
      - REDIS_HOST=host.docker.internal
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - redis
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:9001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - myunila-network

  kkn-nginx:
    image: nginx:alpine
    container_name: myunila-kkn-nginx-staging
    restart: unless-stopped
    ports:
      - "9001:9001"
    volumes:
      - ./kkn-service:/var/www
      - ./kkn-service/docker/nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - kkn-service
    networks:
      - myunila-network

  # ============================================
  # SIMBAK Service (Laravel + PHP-FPM + Nginx)
  # ============================================
  simbak-service:
    build:
      context: ./simbak-service
      dockerfile: Dockerfile
    container_name: myunila-simbak-staging
    restart: unless-stopped
    extra_hosts:
      - "host.docker.internal:host-gateway"
    environment:
      - APP_ENV=staging
      - DB_HOST=host.docker.internal
      - DB_PORT=5432
      - DB_DATABASE=simbak
      - DB_USERNAME=myunila_bak
      - DB_PASSWORD=${PG_BAK_PASSWORD}
      - SQLSRV_HOST=${MSSQL_HOST:-192.168.123.119}
      - SQLSRV_DATABASE=pdut_staging
      - SQLSRV_USERNAME=${MSSQL_USERNAME}
      - SQLSRV_PASSWORD=${MSSQL_PASSWORD}
      - REDIS_HOST=host.docker.internal
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - redis
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:9002/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - myunila-network

  simbak-nginx:
    image: nginx:alpine
    container_name: myunila-simbak-nginx-staging
    restart: unless-stopped
    ports:
      - "9002:9002"
    volumes:
      - ./simbak-service:/var/www
      - ./simbak-service/docker/nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - simbak-service
    networks:
      - myunila-network
```

### 4.2 Nginx Config (per service)

**`kkn-service/docker/nginx.conf`:**
```nginx
server {
    listen 9001;
    server_name _;
    root /var/www/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass kkn-service:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

**`simbak-service/docker/nginx.conf`:** (sama, port 9002, fastcgi_pass simbak-service:9000)

### 4.3 Kong Routes (Staging)

```bash
# SI KKN
curl -s -X POST http://localhost:9801/services \
  -d name=kkn-service \
  -d url=http://host.docker.internal:9001

curl -s -X POST http://localhost:9801/services/kkn-service/routes \
  -d name=kkn-route \
  -d 'paths[]=/kkn-service' \
  -d strip_path=true

# SIMBAK
curl -s -X POST http://localhost:9801/services \
  -d name=simbak-service \
  -d url=http://host.docker.internal:9002

curl -s -X POST http://localhost:9801/services/simbak-service/routes \
  -d name=simbak-route \
  -d 'paths[]=/simbak-service' \
  -d strip_path=true
```

### 4.4 Frontend Environment

Tambah di `.env`:
```env
NEXT_PUBLIC_KKN_API_URL=http://localhost:9800/kkn-service
NEXT_PUBLIC_SIMBAK_API_URL=http://localhost:9800/simbak-service
```

> ⚠️ WAJIB tambah juga di:
> - `frontend/docker-compose.yml` → build args
> - `frontend/Dockerfile` → ARG + ENV

### Deliverable Phase 4:
- [x] Docker containers running (kkn + simbak)
- [x] Kong routes configured
- [x] Health check via Kong: `GET /kkn-service/api/health` ✅
- [x] Health check via Kong: `GET /simbak-service/api/health` ✅
- [x] Frontend env vars set

---

## Phase 5: Frontend API Integration

**Estimasi: 3-5 hari**

### 5.1 API Clients

**`lib/services/si-kkn/kknClient.ts`:**
```typescript
import axios from 'axios';
const kknClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_KKN_API_URL || 'http://localhost:9001',
});
// interceptors: JWT token, error handling
export default kknClient;
```

**`lib/services/sim-bak/bakClient.ts`:** (sama, beda baseURL)

### 5.2 Service Files Baru

**SI KKN** — buat di `lib/services/si-kkn/`:
```
kknClient.ts
periodeService.ts
wilayahService.ts
lokasiService.ts
komponenService.ts
pendaftaranService.ts
kelompokService.ts
logbookService.ts
absensiService.ts
prokerService.ts
bimbinganService.ts
nilaiService.ts
dokumenService.ts
manajemenService.ts
dashboardService.ts
monitoringService.ts
```

**SIMBAK** — update `lib/services/sim-bak/`:
```
bakClient.ts              (baru — axios instance)
simBakService.ts          (sudah ada, perlu update)
jenisLayananService.ts    (baru)
pengajuanService.ts       (baru)
verifikasiService.ts      (baru)
persetujuanService.ts     (baru)
batchService.ts           (baru)
monitoringService.ts      (baru)
dashboardService.ts       (baru)
```

### 5.3 Frontend Page Update Order

**SI KKN (27 files) — Prioritas:**

| # | Page | File | Complexity |
|---|---|---|---|
| 1 | Dashboard | `page.tsx` | Medium (replace dummyData → API) |
| 2 | Master Data | `master-data/page.tsx` + 6 tabs | Medium (6 CRUD tabs) |
| 3 | Pendaftaran | `pendaftaran/page.tsx` + `daftar/page.tsx` | High (form + validasi + upload) |
| 4 | Manajemen Kelompok | `manajemen/kelompok/page.tsx` | Medium |
| 5 | Manajemen DPL | `manajemen/dpl/page.tsx` | Medium |
| 6 | Manajemen Penempatan | `manajemen/penempatan/page.tsx` | Medium |
| 7 | Manajemen Verifikasi | `manajemen/verifikasi/page.tsx` | Medium |
| 8 | Kelompok | `kelompok/page.tsx` | Medium (view kelompok + anggota) |
| 9 | Kegiatan Logbook | `kegiatan/logbook/page.tsx` | High (CRUD + DPL approve) |
| 10 | Kegiatan Absensi | `kegiatan/absensi/page.tsx` | Medium |
| 11 | Kegiatan Proker | `kegiatan/proker/page.tsx` | Medium |
| 12 | Bimbingan | `bimbingan/page.tsx` | Medium |
| 13 | Penilaian Komponen | `penilaian/komponen/page.tsx` | High (input nilai per komponen) |
| 14 | Penilaian Pamong | `penilaian/pamong/page.tsx` | Medium |
| 15 | Penilaian Rekap | `penilaian/rekap/page.tsx` | Medium (read-only rekap) |
| 16 | Dokumen | `dokumen/page.tsx` | Medium (upload/download) |
| 17 | Monitoring | `monitoring/page.tsx` | Medium (dashboard + filter) |

**SIMBAK (25 files) — Prioritas:**

| # | Page | File | Complexity |
|---|---|---|---|
| 1 | Dashboard | `page.tsx` | Medium (stats dari API) |
| 2 | Master Data | `master-data/page.tsx` + 4 tabs | Medium (4 CRUD tabs) |
| 3 | Surat Mandiri | `surat-mandiri/page.tsx` + `[kode]/page.tsx` | High (form + upload + workflow) |
| 4 | Permohonan | `permohonan/page.tsx` + `[kode]/page.tsx` | High (multi-step form, complex) |
| 5 | Admin Verifikasi | `admin/verifikasi/page.tsx` + `[id]/page.tsx` | High (review + approve/reject) |
| 6 | Admin Persetujuan | `admin/persetujuan/page.tsx` + `[id]/page.tsx` | Medium |
| 7 | Batch | `batch/page.tsx` + `create/page.tsx` + `[id]/page.tsx` + `verifikasi/page.tsx` | High (batch flow) |
| 8 | Riwayat | `riwayat/page.tsx` + `[id]/page.tsx` | Low (read-only timeline) |
| 9 | Monitoring | `monitoring/page.tsx` | Medium |

### Deliverable Phase 5:
- [x] All dummy data replaced with real API calls
- [x] CRUD operations working
- [x] File upload working (MinIO)
- [x] Pagination working
- [x] Error handling + loading states

---

## Phase 6: Integration & Testing

**Estimasi: 2-3 hari**

### 6.1 Auth & RBAC
- [ ] JWT validation working (token dari auth-service)
- [ ] Role-based menu visibility (mahasiswa vs admin vs dosen)
- [ ] Permission check middleware (CheckCrudPermission)
- [ ] Portal menu check (20 menus KKN + 13 menus SIMBAK di pdut_staging)

### 6.2 Dual DB Integration
- [ ] Read mahasiswa data dari pdut_staging.siakadu.peserta_didik
- [ ] Read pengguna data dari pdut_staging.man_akses.pengguna
- [ ] Snapshot data pemohon saat pengajuan (copy ke PG)
- [ ] KKN: validasi IPK, SKS, semester dari pdut

### 6.3 File Storage (MinIO)
- [ ] Upload dokumen persyaratan (SIMBAK)
- [ ] Upload logbook foto (KKN)
- [ ] Upload laporan + sertifikat (KKN)
- [ ] Download dokumen hasil
- [ ] File validation (tipe, ukuran)

### 6.4 End-to-End Flows
- [ ] **KKN:** Buat periode → mahasiswa daftar → verifikasi → bentuk kelompok → isi logbook → beri nilai → terbit sertifikat
- [ ] **SIMBAK Surat Mandiri:** Mahasiswa ajukan → admin verifikasi → terbit surat
- [ ] **SIMBAK Permohonan:** Mahasiswa ajukan → fakultas verifikasi → BAK approve → terbit SK
- [ ] **SIMBAK Batch:** Admin tarik data → fakultas verifikasi → finalize → terbit SK

### 6.5 Edge Cases
- [ ] Null-safe data access (lesson from project-service)
- [ ] Empty state handling
- [ ] Concurrent access (Redis lock for batch)
- [ ] Pagination + filter + search

### Deliverable Phase 6:
- [x] All flows E2E tested
- [x] Auth + RBAC verified
- [x] File upload/download working
- [x] No crash on empty/null data

---

## Phase 7: Production Prep (Opsional — Setelah Staging OK)

- [ ] Deploy script Ansible (VM2 untuk SIMBAK, VM3 untuk KKN, atau dedicated)
- [ ] Kong routes production
- [ ] PostgreSQL di VM3 (atau dedicated PG server)
- [ ] Firewall rules
- [ ] DB seed production (pdut)
- [ ] a_live=1 di portal_aplikasi production

---

## Timeline Summary

| Phase | Task | Estimasi | Paralel? |
|---|---|---|---|
| **1** | DB Setup (PG users + schema + seed) | **1-2 jam** | — |
| **2** | kkn-service backend (Laravel baru) | **3-4 hari** | ↕ |
| **3** | simbak-service backend (lanjut skeleton) | **2-3 hari** | ↕ Paralel Phase 2 |
| **4** | Docker + Kong + Frontend env | **2-3 jam** | Setelah Phase 2/3 |
| **5** | Frontend integration (27 + 25 files) | **3-5 hari** | Setelah Phase 4 |
| **6** | Integration testing + polish | **2-3 hari** | Setelah Phase 5 |
| **Total** | | **~10-15 hari kerja** | |

### Critical Path

```
Phase 1 ──→ Phase 2 (kkn-service)    ──→ Phase 4 ──→ Phase 5a (FE KKN)   ──→ Phase 6
         ──→ Phase 3 (simbak-service) ──↗          ──→ Phase 5b (FE SIMBAK) ──↗
```

---

## Summary Keputusan

| # | Keputusan | Jawaban |
|---|---|---|
| 1 | Backend kedua app | **Laravel** (service terpisah) |
| 2 | Port KKN | **9001** |
| 3 | Port SIMBAK | **9002** |
| 4 | Database | PostgreSQL 16 (siknila + simbak) |
| 5 | DB User | myunila_kkn + myunila_bak |
| 6 | MinIO bucket | Shared `myunila-storage` (prefix `siknila/*` dan `simbak/*`) |
| 7 | Schema | SQL script langsung (bukan Laravel migration) |
| 8 | Dual DB | PG (default/write) + SQL Server pdut (read-only) |
| 9 | Redis prefix | `kkn_` dan `bak_` |
| 10 | Urutan | SIMBAK dulu (skeleton ada) → KKN |

---

## Files Yang Akan Dibuat/Dimodifikasi

### Baru
```
backend/kkn-service/                    (seluruh project Laravel baru)
data-model/script/postgresql/si-kkn-seed-staging.sql
data-model/script/postgresql/simbak-seed-staging.sql
backend/kkn-service/docker/nginx.conf
backend/simbak-service/docker/nginx.conf
frontend/src/lib/services/si-kkn/kknClient.ts
frontend/src/lib/services/si-kkn/periodeService.ts
frontend/src/lib/services/si-kkn/... (16 service files)
frontend/src/lib/services/sim-bak/bakClient.ts
frontend/src/lib/services/sim-bak/... (8 service files)
```

### Dimodifikasi
```
backend/docker-compose.yml              (tambah kkn + simbak containers)
backend/.env                            (tambah PG_KKN_PASSWORD, PG_BAK_PASSWORD)
backend/simbak-service/app/             (tambah 11 controllers, 15 models, repositories, services)
frontend/.env                           (tambah NEXT_PUBLIC_KKN_API_URL, NEXT_PUBLIC_SIMBAK_API_URL)
frontend/docker-compose.yml             (tambah build args)
frontend/Dockerfile                     (tambah ARG/ENV)
frontend/src/app/dashboard/si-kkn/      (27 files: dummy → real API)
frontend/src/app/dashboard/sim-bak/     (25 files: dummy → real API)
```
