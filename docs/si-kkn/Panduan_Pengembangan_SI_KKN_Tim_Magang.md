# Panduan Pengembangan SI KKN — Tim Magang

**Universitas Lampung — MyUnila**
**Tanggal:** 7 Mei 2026
**Audien:** Tim magang yang akan melanjutkan pengembangan modul SI KKN
**Versi:** 1.0

---

## 1. Pengantar

SI KKN (Sistem Informasi Kuliah Kerja Nyata) adalah modul baru di ekosistem MyUnila yang akan mengelola seluruh siklus KKN: dari pendaftaran mahasiswa, pembentukan kelompok, kegiatan lapangan (logbook, program kerja), penilaian, hingga penerbitan sertifikat.

Base proyek **sudah disiapkan** (Laravel 11, JWT, dual-DB pgsql + sqlsrv, Redis, MinIO ready). Tugas tim magang adalah **menyelesaikan modul demi modul** (master data, pendaftaran, kelompok, kegiatan, penilaian, dokumen, dashboard) dan halaman frontend yang menjadi konsumen.

Pattern pengembangan **sudah dicontohkan lengkap** di modul `master-data/periode-kkn`. Tim magang cukup mengikuti pattern yang sama untuk modul lain.

---

## 2. Arsitektur

```
┌────────────────────────────────────────────────────────┐
│  Frontend (Next.js 15 — myunila/frontend/)             │
│  Path: src/app/dashboard/sim-kkn/*                     │
│  Service: src/lib/services/si-kkn/                     │
└──────────────────┬─────────────────────────────────────┘
                   │  HTTPS / Bearer JWT
                   ▼
┌────────────────────────────────────────────────────────┐
│  si-kkn-service (Laravel 11 — backend/si-kkn-service)  │
│  Port: 9004 (via nginx)                                │
│  Container: myunila-si-kkn-staging                     │
└────────┬──────────────────────────────────────┬────────┘
         │                                      │
         ▼                                      ▼
   PostgreSQL (siknila)                SQL Server (pdut)
   sikkn_myunila DB                    READ-ONLY
   • ref.*                             • man_akses.pengguna
   • pendaftaran.*                     • man_akses.peran
   • kelompok.*                        • man_akses.role_pengguna
   • kegiatan.*                        • man_akses.aplikasi
   • penilaian.*                       • siakadu.peserta_didik
   • dokumen.*                         • siakadu.reg_pd
   • log.*                             • siakadu.semester
                                       • keuangan.spp_mhs
```

### 2.1 Komponen Backend

- **Bahasa:** PHP 8.2 + Laravel 11
- **DB primer:** PostgreSQL `sikkn_myunila` (data transaksional KKN)
- **DB referensi:** SQL Server `pdut` (data master akses, mahasiswa, dosen — read-only)
- **Auth:** JWT (HS256, validate-only — token diterbitkan oleh `auth-service`)
- **Cache & Queue:** Redis
- **Storage:** Local disk default (path `/data/si-kkn-storage`), opsional ke MinIO via env

### 2.2 Komponen Frontend

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript + Tailwind
- **State:** Zustand
- **HTTP:** Axios via `src/lib/services/`
- **Component library:** Shared di `src/shared/components/`
- **DataTable & Forms:** Pakai pattern yang sudah ada di SIMBAK / SI Prestasi sebagai referensi

---

## 3. Setup Lokal Tim Magang

### 3.1 Akses Database PostgreSQL

```
Host:     localhost (atau 192.168.120.45 — VM5 staging)
Port:     5432
Database: sikkn_myunila
User:     magang_sikkn
Password: (diberikan terpisah ke ketua tim magang)
```

Test koneksi:
```bash
PGPASSWORD=<pwd> psql -h localhost -U magang_sikkn -d sikkn_myunila -c "\dt *.*"
```

User `magang_sikkn` punya **full CRUD** ke seluruh schema (`ref`, `pendaftaran`, `kelompok`, `kegiatan`, `penilaian`, `dokumen`, `log`).

### 3.2 Endpoint Service Staging

- Health: `http://192.168.120.45:9004/api/health`
- API base: `http://192.168.120.45:9004/api/v1/`
- Profile aktif user: `GET /api/v1/me` (butuh JWT)

### 3.3 Cara Dapat JWT untuk Testing

Login ke `auth-service` MyUnila pakai akun staging, ambil access_token dari response, kirim ke endpoint si-kkn dgn header:

```
Authorization: Bearer <access_token>
```

Atau untuk test cepat lewat browser/Postman, pakai env `BYPASS_PERMISSION_CHECK=true` (dev only — JANGAN dipakai di production).

### 3.4 Workflow Pengembangan

1. **Clone & switch branch:** `git clone …`, lalu `git checkout -b feat/si-kkn-<nama-modul>`
2. **Tulis kode di** `backend/si-kkn-service/app/…` (PHP) atau `frontend/src/…` (TS)
3. **Test lokal:** rebuild container `./scripts/rebuild-service.sh si-kkn` di VM5
4. **Push:** PR ke branch `master`
5. **Review:** lead developer cek + approve

---

## 4. Database Schema Overview

### 4.1 Schema `ref` — Master Data Referensi (6 tabel)

| Tabel | Deskripsi | Estimasi prioritas |
|---|---|---|
| `periode_kkn` | Periode/gelombang KKN (tanggal, kuota) | **P1 — sudah dibuatkan contoh** |
| `lokasi_kkn` | Desa/dusun lokasi KKN | P1 |
| `wilayah_kkn` | Zona/wilayah pengelompokan lokasi | P1 |
| `jenis_dokumen` | Jenis dokumen (proposal, laporan, sertifikat) | P2 |
| `komponen_penilaian` | Komponen + bobot nilai | P2 |
| `kriteria_pendaftaran` | Syarat pendaftaran KKN (IPK, semester min, dll) | P2 |

### 4.2 Schema `pendaftaran` (3 tabel)

| Tabel | Deskripsi |
|---|---|
| `registrasi_kkn` | Registrasi mahasiswa per periode |
| `data_pemohon` | Snapshot data mhs saat daftar (IPK, prodi, dll) |
| `verifikasi_syarat` | Hasil verifikasi syarat per registrasi |

### 4.3 Schema `kelompok` (4 tabel)

| Tabel | Deskripsi |
|---|---|
| `kelompok_kkn` | Kelompok per lokasi |
| `anggota_kelompok` | Mhs anggota kelompok |
| `dpl_kelompok` | DPL pembimbing |
| `pamong_desa` | Pamong desa pendamping |

### 4.4 Schema `kegiatan` (5 tabel)

| Tabel | Deskripsi |
|---|---|
| `program_kerja` | Program kerja kelompok |
| `logbook_harian` | Logbook harian mhs |
| `absensi` | Absensi kegiatan |
| `catatan_bimbingan` | Catatan bimbingan dari DPL |
| `laporan_kelompok` | Laporan akhir kelompok |

### 4.5 Schema `penilaian` (3 tabel)

| Tabel | Deskripsi |
|---|---|
| `nilai_mahasiswa` | Nilai per komponen per mhs |
| `nilai_akhir` | Nilai akhir akumulasi |
| `penilaian_pamong` | Penilaian dari pamong desa |

### 4.6 Schema `dokumen` (2 tabel)

| Tabel | Deskripsi |
|---|---|
| `dokumen_kkn` | Dokumen umum KKN (proposal, laporan, foto) |
| `sertifikat` | Sertifikat selesai KKN |

### 4.7 Schema `log` (2 tabel — TIDAK perlu CRUD endpoint)

| Tabel | Deskripsi |
|---|---|
| `aktivitas_data` | Auto-populated via trigger `log.fn_catat_aktivitas_data` |
| `jejak_audit` | Audit trail manual via aplikasi |

---

## 5. Role & Permission

### 5.1 Role yang Akan Digunakan (sudah ada di pdut.man_akses.peran)

| id_peran | nm_peran | Akses di SI KKN |
|---|---|---|
| 1 | Administrator | Full akses (super) |
| 2009 | Super Admin | Full akses (super) |
| 45 | LP2M UNILA | **Pengelola utama**: CRUD master data, kelola periode, monitor seluruh kegiatan |
| 106 | Admin Fakultas | Verifikasi syarat mhs prodi-nya, monitor mhs prodi-nya |
| 46 | Dosen | DPL: paraf logbook, beri nilai mhs bimbingan, isi catatan bimbingan |
| 39 | Mahasiswa | Daftar KKN, lihat status, isi logbook, upload dokumen, lihat sertifikat |

> **Pamong Desa**: belum ada role di pdut. Saat ini diakses lewat link/token khusus (mekanisme guest), atau dibuatkan role baru jika dibutuhkan login penuh.

### 5.2 Aplikasi di pdut.man_akses.aplikasi

Slug aplikasi yang dipakai middleware: **`si-kkn`**.

> **TODO admin pdut:** insert row `man_akses.aplikasi` dengan `slug_aplikasi = 'si-kkn'`, lalu mapping `man_akses.role_pengguna` per user untuk app ini. Kalau belum di-set up, gunakan `BYPASS_PERMISSION_CHECK=true` di env saat dev lokal.

### 5.3 Matrix Permission (CRUD per Endpoint per Role)

Notasi: `S=show, I=insert, U=update, D=delete, A=approve, R=reject`

| Modul / Endpoint | LP2M | Admin Fak | Dosen (DPL) | Mahasiswa |
|---|---|---|---|---|
| **MASTER DATA** (periode, lokasi, wilayah, dokumen, dll) | SIUD | S | S | S |
| **PENDAFTARAN** create (mhs daftar) | S | S | — | I (own) |
| PENDAFTARAN verifikasi | A/R | A/R (prodi sendiri) | — | S (own) |
| **KELOMPOK** assign mhs ke kelompok | SIUD | S (prodi) | S | S (own) |
| **KELOMPOK** assign DPL | SIUD | S | — | — |
| **KEGIATAN** logbook | S | — | S+approve | I/U (own) |
| KEGIATAN program kerja | S | — | S+approve | I/U (kelompok) |
| KEGIATAN catatan bimbingan | S | — | I/U (own) | S (own) |
| **PENILAIAN** input nilai | S | — | I/U (mhs bimbingan) | S (own) |
| PENILAIAN nilai akhir (calculate) | A | — | — | S (own) |
| **DOKUMEN** upload | I | — | I (own) | I (own) |
| **DASHBOARD** statistik | S | S (prodi) | S (kelompok bimbingan) | S (own) |

> **Convention:** controller cek role lewat middleware `permission:<aksi>,si-kkn`. Filter "milik sendiri" (own) dilakukan di repository pakai `WHERE id_creator = :userId` atau join ke `pendaftaran.registrasi_kkn` lalu cek `id_alumni`.

---

## 6. Endpoint yang Harus Dibangun

### 6.1 Master Data (Schema: `ref`) — **5 modul**

Semua endpoint mengikuti pattern `master-data/<resource>`:

```
GET    /api/v1/master-data/<resource>           List + filter + search + pagination
GET    /api/v1/master-data/<resource>/{id}      Detail
POST   /api/v1/master-data/<resource>           Create        [permission:insert,si-kkn]
PUT    /api/v1/master-data/<resource>/{id}      Update        [permission:update,si-kkn]
DELETE /api/v1/master-data/<resource>/{id}      Soft delete   [permission:delete,si-kkn]
```

| Resource | Tabel | Field utama |
|---|---|---|
| `periode-kkn` ✅ | `ref.periode_kkn` | kode, nama, gelombang, tanggal, kuota |
| `lokasi-kkn` | `ref.lokasi_kkn` | kode, nama desa, kecamatan, kabupaten, koordinat |
| `wilayah-kkn` | `ref.wilayah_kkn` | nama zona, kabupaten |
| `jenis-dokumen` | `ref.jenis_dokumen` | kode, nama, mandatory, format file |
| `komponen-penilaian` | `ref.komponen_penilaian` | kode, nama, bobot persen |
| `kriteria-pendaftaran` | `ref.kriteria_pendaftaran` | nama, tipe, value (IPK min, semester min, dll) |

### 6.2 Pendaftaran (Schema: `pendaftaran`) — **2 modul utama**

```
GET    /api/v1/pendaftaran/registrasi              List (admin filter; mhs lihat sendiri)
POST   /api/v1/pendaftaran/registrasi              Mhs daftar KKN (snapshot data dari pdut)
GET    /api/v1/pendaftaran/registrasi/{id}         Detail
PUT    /api/v1/pendaftaran/registrasi/{id}         Edit data (sebelum verifikasi)
DELETE /api/v1/pendaftaran/registrasi/{id}         Batal daftar

GET    /api/v1/pendaftaran/verifikasi              Queue verifikasi
POST   /api/v1/pendaftaran/registrasi/{id}/verify  Verifikasi syarat [permission:approve,si-kkn]
POST   /api/v1/pendaftaran/registrasi/{id}/reject  Tolak             [permission:reject,si-kkn]
```

### 6.3 Kelompok (Schema: `kelompok`) — **3 modul**

```
GET    /api/v1/kelompok                       List
POST   /api/v1/kelompok                       Create kelompok                [permission:insert,si-kkn]
GET    /api/v1/kelompok/{id}                  Detail
PUT    /api/v1/kelompok/{id}                  Update                          [permission:update,si-kkn]
DELETE /api/v1/kelompok/{id}                  Delete                          [permission:delete,si-kkn]

POST   /api/v1/kelompok/{id}/anggota          Assign mhs ke kelompok          [permission:insert,si-kkn]
DELETE /api/v1/kelompok/{id}/anggota/{id_mhs} Lepas mhs dari kelompok         [permission:delete,si-kkn]

POST   /api/v1/kelompok/{id}/dpl              Assign DPL                       [permission:insert,si-kkn]
PUT    /api/v1/kelompok/{id}/dpl/{id_dpl}     Update DPL                       [permission:update,si-kkn]

POST   /api/v1/kelompok/{id}/pamong           Tambah pamong desa              [permission:insert,si-kkn]
```

### 6.4 Kegiatan (Schema: `kegiatan`) — **5 sub-modul**

```
# Program Kerja
GET    /api/v1/kegiatan/kelompok/{id}/program-kerja
POST   /api/v1/kegiatan/kelompok/{id}/program-kerja
PUT    /api/v1/kegiatan/program-kerja/{id}
DELETE /api/v1/kegiatan/program-kerja/{id}

# Logbook Harian (per mhs)
GET    /api/v1/kegiatan/logbook?id_anggota=...
POST   /api/v1/kegiatan/logbook              Mhs isi logbook
PUT    /api/v1/kegiatan/logbook/{id}
POST   /api/v1/kegiatan/logbook/{id}/approve [permission:approve,si-kkn]  DPL paraf

# Absensi
POST   /api/v1/kegiatan/absensi              Bulk insert absensi harian

# Catatan Bimbingan
GET    /api/v1/kegiatan/bimbingan?id_kelompok=...
POST   /api/v1/kegiatan/bimbingan            DPL isi catatan
PUT    /api/v1/kegiatan/bimbingan/{id}

# Laporan Kelompok
POST   /api/v1/kegiatan/kelompok/{id}/laporan
PUT    /api/v1/kegiatan/laporan/{id}
GET    /api/v1/kegiatan/laporan/{id}/download
```

### 6.5 Penilaian (Schema: `penilaian`) — **3 modul**

```
GET    /api/v1/penilaian/komponen?id_periode=...
POST   /api/v1/penilaian/nilai-mahasiswa     DPL input nilai per komponen [permission:insert,si-kkn]
PUT    /api/v1/penilaian/nilai-mahasiswa/{id}
POST   /api/v1/penilaian/penilaian-pamong    Pamong isi nilai
POST   /api/v1/penilaian/calculate-akhir/{id_kelompok}  Hitung nilai akhir [permission:approve,si-kkn]
GET    /api/v1/penilaian/nilai-akhir?id_periode=...
```

### 6.6 Dokumen (Schema: `dokumen`) — **2 modul**

```
GET    /api/v1/dokumen?parent_tipe=...&parent_id=...
POST   /api/v1/dokumen/upload                Upload (multipart) ke MinIO/local disk
GET    /api/v1/dokumen/{id}/download
DELETE /api/v1/dokumen/{id}

POST   /api/v1/sertifikat/generate/{id_kelompok}    Generate PDF batch sertifikat
GET    /api/v1/sertifikat/{id}/download
```

### 6.7 Dashboard (custom, tidak per-tabel) — **1 modul**

```
GET /api/v1/dashboard/overview               Total mhs aktif, kelompok, lokasi per periode
GET /api/v1/dashboard/per-fakultas           Distribusi mhs per fakultas
GET /api/v1/dashboard/sla-laporan            % kelompok sudah submit laporan
GET /api/v1/dashboard/aktivitas-terbaru      Log aktivitas terkini
```

**Total endpoint: ~85 endpoint**, terbagi 7 modul. Dengan tim 3-4 magang, target 1-2 modul per orang dalam 4-6 minggu.

---

## 7. Contoh CRUD Lengkap: `periode_kkn`

Modul ini **sudah selesai** dan jadi acuan. Lokasi file:

```
backend/si-kkn-service/
├── app/
│   ├── Repositories/MasterData/PeriodeKknRepository.php
│   └── Http/Controllers/Api/MasterData/PeriodeKknController.php
└── routes/api.php   (entry sudah didaftarkan)
```

### 7.1 Repository (`PeriodeKknRepository.php`)

Pola: `extends BaseRepository`, semua method DB lewat `pgSelect / pgUpdate / pgInsertReturning` yang sudah disediakan parent.

Method wajib:
- `list(array $filters): array` — pagination + filter + search
- `findById(string $id): ?object`
- `existsByKode(string $kode, ?string $exceptId = null): bool` — validasi unique
- `create(array $data, ?string $idCreator): ?object`
- `update(string $id, array $data, ?string $idUpdater): ?object`
- `softDelete(string $id, ?string $idUpdater): int`

### 7.2 Controller (`PeriodeKknController.php`)

- `use ApiResponse` trait → method bantuan `successResponse / errorResponse / paginatedResponse`
- Validation pakai `Validator::make($request->all(), [...])`
- Ambil user dari `$request->attributes->get('auth_user')` → `$user->id_pengguna`

### 7.3 Routes Registration (`routes/api.php`)

Lihat block `master-data/periode-kkn` di file. Pattern:

```php
Route::get   ('/periode-kkn',      [PeriodeKknController::class, 'index']);
Route::get   ('/periode-kkn/{id}', [PeriodeKknController::class, 'show']);
Route::post  ('/periode-kkn',      [PeriodeKknController::class, 'store'])
        ->middleware('permission:insert,si-kkn');
Route::put   ('/periode-kkn/{id}', [PeriodeKknController::class, 'update'])
        ->middleware('permission:update,si-kkn');
Route::delete('/periode-kkn/{id}', [PeriodeKknController::class, 'destroy'])
        ->middleware('permission:delete,si-kkn');
```

### 7.4 Test Manual

```bash
# Health check (no auth)
curl http://192.168.120.45:9004/api/health

# List (butuh JWT)
TOKEN="<bearer_dari_auth-service>"
curl -H "Authorization: Bearer $TOKEN" \
     "http://192.168.120.45:9004/api/v1/master-data/periode-kkn?limit=5"

# Create (butuh permission:insert,si-kkn)
curl -X POST -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "kode_periode": "KKN-GASAL-2026",
       "nm_periode": "KKN Reguler Gasal 2025/2026",
       "tahun_akademik": "2025/2026",
       "gelombang": 1,
       "tgl_pelaksanaan_mulai": "2026-07-01",
       "tgl_pelaksanaan_selesai": "2026-08-10",
       "durasi_hari": 40,
       "kuota_total": 1500,
       "a_aktif": true
     }' \
     http://192.168.120.45:9004/api/v1/master-data/periode-kkn
```

### 7.5 Cara Mengembangkan Modul Lain (Step-by-step)

1. **Tentukan tabel target.** Lihat schema, catat semua kolom + relasi.
2. **Copy-paste `PeriodeKknRepository`** → ganti nama jadi `LokasiKknRepository.php`. Update:
   - Class name & namespace
   - Tabel di SQL (`ref.periode_kkn` → `ref.lokasi_kkn`)
   - Whitelist kolom sort
   - Field di `create()` & `update()`
   - Filter parameter di `list()`
3. **Copy-paste `PeriodeKknController`** → `LokasiKknController.php`. Update:
   - Validation rules
   - Inject `LokasiKknRepository`
4. **Daftarkan routes** di `routes/api.php` di block `master-data` yang sudah ada (uncomment TODO).
5. **Rebuild container:** `./scripts/rebuild-service.sh si-kkn` di VM5.
6. **Test pakai curl/Postman.** Pastikan happy-path (list/create/update/delete) + edge cases (validation, unique constraint, not-found).

---

## 8. Frontend Tasks (Tim Magang Frontend)

### 8.1 Lokasi File

```
frontend/
├── src/
│   ├── app/dashboard/sim-kkn/                      ← buat baru
│   │   ├── page.tsx                                Overview/dashboard
│   │   ├── master-data/
│   │   │   ├── periode/page.tsx                    DataTable + Modal CRUD
│   │   │   ├── lokasi/page.tsx
│   │   │   ├── wilayah/page.tsx
│   │   │   └── ...
│   │   ├── pendaftaran/
│   │   │   ├── daftar/page.tsx                     Form mhs daftar
│   │   │   └── verifikasi/page.tsx                 Queue verifikasi (admin)
│   │   ├── kelompok/page.tsx
│   │   ├── kegiatan/
│   │   │   ├── logbook/page.tsx
│   │   │   ├── program-kerja/page.tsx
│   │   │   └── bimbingan/page.tsx
│   │   ├── penilaian/page.tsx
│   │   ├── dokumen/page.tsx
│   │   └── laporan/page.tsx
│   ├── lib/services/si-kkn/                        ← buat baru
│   │   ├── kknService.ts                           HTTP wrapper utama
│   │   ├── periodeKknService.ts                    Per-modul service (contoh)
│   │   ├── lokasiKknService.ts
│   │   └── ...
│   └── shared/api/endpoints.ts                     ← tambah block SI_KKN
```

### 8.2 Pattern Referensi

Pakai pattern yang sama seperti **SI Prestasi** atau **SIMBAK**:

- DataTable dengan server-side pagination, search, filter, sort
- Modal CRUD (Create/Edit) — pakai `react-hook-form` + Zod validation
- Konfirmasi dialog untuk Delete
- Toast notifikasi (success/error)
- Loading state per fetch

### 8.3 Endpoint Konfigurasi

Tambah di `frontend/src/shared/api/endpoints.ts`:

```typescript
export const SI_KKN_BASE = `${process.env.NEXT_PUBLIC_KONG_URL}/si-kkn-service/api/v1`;

export const SI_KKN_ENDPOINTS = {
  // Master Data
  periode: {
    list: () => `${SI_KKN_BASE}/master-data/periode-kkn`,
    detail: (id: string) => `${SI_KKN_BASE}/master-data/periode-kkn/${id}`,
    create: () => `${SI_KKN_BASE}/master-data/periode-kkn`,
    update: (id: string) => `${SI_KKN_BASE}/master-data/periode-kkn/${id}`,
    delete: (id: string) => `${SI_KKN_BASE}/master-data/periode-kkn/${id}`,
  },
  // tambah modul lain di sini ...
};
```

> **Catatan:** Akses production lewat **Kong API Gateway** (otomatis attach JWT dari cookie). Jangan hit langsung ke port 9004 dari frontend production.

### 8.4 Service Layer Contoh (`periodeKknService.ts`)

```typescript
import axios from "@/lib/axios";
import { SI_KKN_ENDPOINTS } from "@/shared/api/endpoints";

export interface PeriodeKkn {
  id_periode_kkn: string;
  kode_periode: string;
  nm_periode: string;
  tahun_akademik?: string;
  gelombang: number;
  tgl_daftar_mulai?: string;
  tgl_pelaksanaan_mulai?: string;
  durasi_hari: number;
  kuota_total?: number;
  a_aktif: boolean;
  created_at: string;
  updated_at: string;
}

export interface PeriodeKknListResponse {
  success: boolean;
  data: PeriodeKkn[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export const periodeKknService = {
  async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
    tahun_akademik?: string;
    gelombang?: number;
    a_aktif?: boolean;
  }): Promise<PeriodeKknListResponse> {
    const { data } = await axios.get(SI_KKN_ENDPOINTS.periode.list(), { params });
    return data;
  },

  async detail(id: string): Promise<{ success: boolean; data: PeriodeKkn }> {
    const { data } = await axios.get(SI_KKN_ENDPOINTS.periode.detail(id));
    return data;
  },

  async create(payload: Partial<PeriodeKkn>): Promise<{ success: boolean; data: PeriodeKkn }> {
    const { data } = await axios.post(SI_KKN_ENDPOINTS.periode.create(), payload);
    return data;
  },

  async update(id: string, payload: Partial<PeriodeKkn>): Promise<{ success: boolean; data: PeriodeKkn }> {
    const { data } = await axios.put(SI_KKN_ENDPOINTS.periode.update(id), payload);
    return data;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const { data } = await axios.delete(SI_KKN_ENDPOINTS.periode.delete(id));
    return data;
  },
};
```

### 8.5 Halaman Periode KKN (referensi UI)

`frontend/src/app/dashboard/sim-kkn/master-data/periode/page.tsx`:

- Header: Judul + tombol "Tambah Periode" (cek role lewat `useAuth().permissions.can_insert`)
- DataTable kolom: Kode, Nama, Gelombang, Tahun Ajaran, Tgl Pelaksanaan, Kuota, Status, Aksi
- Search di header DataTable
- Filter: dropdown tahun akademik, gelombang, a_aktif
- Modal Create/Edit dengan form react-hook-form
- Konfirmasi delete via shared `<ConfirmDialog />`

### 8.6 Daftar Halaman yang Harus Dibuat

| # | Halaman | Estimasi |
|---|---|---|
| 1 | Dashboard SI KKN (overview chart) | 2 hari |
| 2 | Master Data: Periode KKN | 2 hari (referensi) |
| 3 | Master Data: Lokasi KKN | 2 hari |
| 4 | Master Data: Wilayah KKN | 1 hari |
| 5 | Master Data: Jenis Dokumen, Komponen Penilaian, Kriteria | 2 hari |
| 6 | Pendaftaran KKN (mhs) | 3 hari |
| 7 | Verifikasi Pendaftaran (admin) | 3 hari |
| 8 | Manajemen Kelompok | 4 hari |
| 9 | Assign DPL & Pamong Desa | 2 hari |
| 10 | Logbook Harian (mhs) | 3 hari |
| 11 | Program Kerja (kelompok) | 2 hari |
| 12 | Catatan Bimbingan (DPL) | 2 hari |
| 13 | Laporan Kelompok | 2 hari |
| 14 | Input Nilai (DPL) | 3 hari |
| 15 | Nilai Akhir & Sertifikat | 3 hari |
| 16 | Upload/Download Dokumen | 2 hari |
| 17 | Dashboard Statistik | 2 hari |

**Total estimasi:** ~40 hari kerja (≈ 8 minggu kalau 5 hari/minggu).

---

## 9. Konvensi & Tips

### 9.1 Naming

- **Backend (PHP):** `camelCase` untuk method, `PascalCase` untuk class.
- **Database (PostgreSQL):** `snake_case` untuk tabel/kolom.
- **API Endpoint:** `kebab-case` untuk path (`/master-data/periode-kkn`), `snake_case` untuk query params.
- **Frontend (TypeScript):** `camelCase` untuk function, `PascalCase` untuk component & type/interface.

### 9.2 Soft Delete

Semua tabel transaksional pakai kolom `soft_delete BOOLEAN DEFAULT false`. **JANGAN pakai `DELETE FROM`**, selalu `UPDATE … SET soft_delete = true`.

### 9.3 Audit Trail

Trigger `log.fn_catat_aktivitas_data` otomatis log ke `log.aktivitas_data` setiap INSERT/UPDATE/DELETE. Untuk dapat info user di log, panggil `pgBeginTransaction($userId, $ipAddress)` di repository sebelum write operation. Contoh ada di `BaseRepository::pgBeginTransaction`.

### 9.4 Validation

Tiap request harus divalidasi di controller pakai `Validator::make`. Aturan umum:
- Required field di-`required`
- Length pakai `max:N`
- Tanggal pakai `date_format:Y-m-d`
- Foreign key dari pdut: validate format UUID `regex:/^[0-9a-f]{8}-/` (jangan join ke pdut, mahal)
- Cek unique constraint di repository (`existsByKode`), JANGAN pakai `unique:` Laravel rule (perlu Eloquent)

### 9.5 Error Handling

- 400: bad input format
- 401: token tidak ada / invalid
- 403: punya token tapi role tidak boleh
- 404: resource tidak ada
- 422: validation error (return field-by-field error)
- 500: server error (DB down, dll)

### 9.6 Performance

- Selalu pakai pagination (default `limit=10`, max `100`)
- Index sudah dibuat di kolom yang sering di-query (lihat `\d table_name` di psql)
- Hindari N+1: gunakan JOIN di query SQL daripada loop fetch
- Cache list yang jarang berubah (master data) di Redis dengan TTL 5-10 menit

---

## 10. Checklist Sebelum PR

- [ ] Code mengikuti pattern `periode_kkn` (Repository + Controller + Routes)
- [ ] Validation rules lengkap di controller
- [ ] Permission middleware terpasang (`permission:<aksi>,si-kkn`)
- [ ] Soft delete bukan hard delete
- [ ] Pagination + search + filter di endpoint list
- [ ] Test manual via Postman/curl: happy path + edge cases
- [ ] Frontend service + page selesai (kalau full-stack task)
- [ ] No hardcoded password / secret
- [ ] Documentation update di OpenAPI / README jika perlu

---

## 11. Kontak

| Peran | Nama | Kontak |
|---|---|---|
| Lead Developer | Mizar | (telegram) |
| DBA | (TBD) | — |
| LP2M (PIC bisnis) | (TBD) | — |

---

*Dokumen ini akan terus diperbarui seiring perkembangan proyek. Versi terbaru selalu ada di repo: `docs/si-kkn/Panduan_Pengembangan_SI_KKN_Tim_Magang.md`*
