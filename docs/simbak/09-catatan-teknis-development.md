# Catatan Teknis Development SIMBAK

Tanggal: 7 April 2026

Dokumen ini mencatat temuan teknis, konfigurasi, dan hal-hal penting yang ditemukan selama development SIMBAK agar tidak terulang.

---

## 1. PDUT Schema Mapping (CRITICAL)

Data di SQL Server (`pdut_staging`) tersebar di beberapa schema. Menggunakan schema yang salah akan menghasilkan query kosong tanpa error.

| Data | Schema yang BENAR | Schema yang SALAH (kosong/tidak cocok) |
|------|-------------------|---------------------------------------|
| Program Studi (prodi) | `pdrd.sms` | `siakadu.sms` (tabel kosong) |
| Jenjang Pendidikan | `ref.jenjang_pendidikan` | `siakadu.jenjang_pendidikan` (id hanya 1-16, pdrd.sms pakai id sampai 35+) |
| Fakultas/Organisasi | `man_akses.unit_organisasi` | `siakadu.ref_unit` (id format beda, bukan UUID) |
| Angkatan | `siakadu.reg_pd.angkatan` (kolom langsung) | `YEAR(siakadu.reg_pd.tgl_masuk_sp)` (bisa beda dari angkatan sebenarnya) |
| Status Mahasiswa | `siakadu.peserta_didik.id_stat_mhs` → `siakadu.status_mahasiswa` | `siakadu.reg_pd.id_status_mahasiswa` (sering null) |
| Registrasi Mahasiswa | `siakadu.reg_pd` | - |
| Biodata Mahasiswa | `siakadu.peserta_didik` | - |
| Kuliah per Semester | `siakadu.kuliah_mhs` | Mungkin kosong untuk beberapa mahasiswa |
| Semester Reference | `siakadu.semester` | - |
| Pembayaran UKT | `siakadu.spp_mhs` | - |

### Query Pattern yang Benar

```sql
SELECT
    rp.nipd AS nim,
    pd.nm_pd AS nm_mahasiswa,
    sms.nm_lemb AS nm_prodi,
    jp.nm_jenj_didik AS nm_jenjang,
    rp.angkatan,                          -- BUKAN YEAR(rp.tgl_masuk_sp)
    rp.ipk,
    COALESCE(rp.sks_lulus, rp.sks_total) AS sks_lulus,
    sm.nm_stat_mhs AS status_mahasiswa    -- dari peserta_didik, BUKAN reg_pd
FROM siakadu.reg_pd rp
JOIN siakadu.peserta_didik pd ON pd.id_pd = rp.id_pd
JOIN pdrd.sms sms ON sms.id_sms = rp.id_sms                    -- PDRD!
JOIN ref.jenjang_pendidikan jp ON jp.id_jenj_didik = sms.id_jenj_didik  -- REF!
LEFT JOIN siakadu.status_mahasiswa sm ON sm.id_stat_mhs = pd.id_stat_mhs
WHERE rp.nipd = ?
```

### Lookup Nama Fakultas

```sql
SELECT nm_lemb AS nm_fakultas
FROM man_akses.unit_organisasi            -- BUKAN siakadu.ref_unit
WHERE id_organisasi = ?                   -- UUID dari pdrd.sms.id_fak_unila
```

---

## 2. RBAC / Permission Middleware

### Struktur Tabel Permission di PDUT

```
man_akses.pengguna          -- user login
    ↓ id_pengguna
man_akses.role_pengguna     -- role assignment (TIDAK punya CRUD permission)
    ↓ id_peran
man_akses.menu_role         -- CRUD permission per menu per role
    kolom: a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu
    ↓ id_menu
man_akses.menu              -- menu definition
    ↓ id_aplikasi
man_akses.aplikasi          -- app definition
    kolom: app_slug (BUKAN slug_aplikasi)
```

### Kolom yang TIDAK ADA (sering salah)

| Middleware expect | Kolom yang benar | Tabel |
|-------------------|-----------------|-------|
| `slug_aplikasi` | `app_slug` | `man_akses.aplikasi` |
| `slug_peran` | tidak ada, pakai `nm_peran` | `man_akses.peran` |
| `role_pengguna.id_aplikasi` | tidak ada | join via `menu_role` → `menu` |
| `role_pengguna.a_aktif` | tidak ada, pakai `approval_peran` | `man_akses.role_pengguna` |
| `role_pengguna.a_show` | tidak ada | permission ada di `menu_role` |
| `role_pengguna.a_insert` | `a_boleh_insert` | `man_akses.menu_role` |

### Local Development: Bypass Permission

Saat development lokal, aktifkan bypass agar tidak perlu setup RBAC lengkap:

**File:** `deployment/local/.env`
```env
BYPASS_PERMISSION_CHECK=true
```

**File:** `backend/simbak-service/.env`
```env
BYPASS_PERMISSION_CHECK=true
```

**Kode:** `app/Http/Middleware/CheckCrudPermission.php` baris 30:
```php
if (env('BYPASS_PERMISSION_CHECK', false)) {
    // bypass semua permission check
}
```

### TODO: Fix Middleware untuk Production

Query permission yang benar untuk production harus join:
```sql
SELECT mr.a_boleh_insert, mr.a_boleh_show, mr.a_boleh_update, mr.a_boleh_delete, mr.a_boleh_sanggah, mr.approval_menu
FROM man_akses.role_pengguna rp
JOIN man_akses.menu_role mr ON mr.id_peran = rp.id_peran
JOIN man_akses.menu m ON m.id_menu = mr.id_menu
JOIN man_akses.aplikasi a ON a.id_aplikasi = m.id_aplikasi
WHERE rp.id_pengguna = ?
  AND a.app_slug = 'sim-bak'
  AND rp.approval_peran = 1
  AND (rp.soft_delete IS NULL OR rp.soft_delete = 0)
```

---

## 3. CORS Configuration

### Masalah
Browser mengirim OPTIONS preflight sebelum request GET/POST. Jika CORS config tidak lengkap, preflight gagal → request diblokir.

### Solusi
**File:** `backend/simbak-service/config/cors.php`
```php
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000', 'http://localhost:3001'],
    'allowed_headers' => ['*'],
    'max_age' => 86400,
    'supports_credentials' => true,
];
```

### Jangan Lupa
- Setelah ubah `config/cors.php` → `php artisan config:clear` + restart container
- Custom `Cors.php` middleware dan Laravel built-in `HandleCors` bisa bentrok — pastikan config di `config/cors.php` sudah lengkap

---

## 4. Frontend API Client (bakClient)

### URL Double `/api/v1`

**Masalah:** `bakClient.ts` otomatis menambahkan `/api/v1` ke base URL. Jika env sudah berisi `/api/v1`, URL jadi double.

**File:** `frontend/.env.local`
```env
# BENAR — tanpa /api/v1
NEXT_PUBLIC_BAK_API_URL=http://localhost:9002

# SALAH — double /api/v1
NEXT_PUBLIC_BAK_API_URL=http://localhost:9002/api/v1
```

**Kode fix di `bakClient.ts`:**
```ts
const rawUrl = process.env.NEXT_PUBLIC_BAK_API_URL || 'http://localhost:9002';
const BAK_API_URL = rawUrl.includes('/api/v1') ? rawUrl : `${rawUrl}/api/v1`;
```

### Setelah Ubah `.env.local`
- **Wajib restart** `npm run dev` (Next.js tidak hot-reload env)

---

## 5. Docker / PHP-FPM Cache

### Masalah
Source code PHP di-mount via Docker volume (read-only), tapi PHP-FPM opcache menyimpan kode lama di memory.

### Solusi
Setelah ubah file PHP:
```bash
# Cara 1: Restart container (paling reliable)
docker restart myunila-simbak-service

# Cara 2: Reload PHP-FPM (tanpa downtime)
docker exec myunila-simbak-service sh -c "kill -USR2 1"

# Cara 3: Clear config cache
docker exec myunila-simbak-service sh -c "php artisan config:clear && php artisan cache:clear"
```

---

## 6. Trigger PostgreSQL

### Masalah
Trigger `log.fn_catat_aktivitas_data()` memiliki fallback hardcoded `v_id_record := NEW.id_pengajuan` yang gagal di tabel `ref.*` (yang tidak punya kolom `id_pengajuan`).

### Solusi
Hapus baris fallback, gunakan hanya `EXECUTE format('SELECT ($1).%I', TG_ARGV[0])` yang mengambil PK secara dinamis.

**File:** `data-model/script/postgresql/simbak_v1.0_fresh.sql` (sudah diperbaiki)
**File:** `data-model/script/postgresql/fix-trigger.sql` (patch terpisah)

### Seed Data
Setelah jalankan schema, jalankan seed:
```bash
docker exec myunila-postgres sh -c "sed -i 's/\r$//' /tmp/seed.sql && psql -U myunila_bak -d simbak -f /tmp/seed.sql"
```
**Penting:** Fix trigger SEBELUM jalankan seed, jika tidak seed akan gagal silent (INSERT 0 0).

---

## 7. Filter `a_aktif` di Frontend

### Masalah
Halaman Surat Mandiri dan Permohonan Akademik filter `j.a_aktif` tapi endpoint public tidak mengembalikan field `a_aktif` (hanya field terbatas).

### Solusi
Hapus filter `a_aktif` di frontend — endpoint public sudah hanya return layanan yang aktif (`WHERE a_aktif = true` di backend).

```ts
// BENAR
const filtered = allLayanan.filter(j => j.kategori === "surat_mandiri");

// SALAH (a_aktif undefined → semua terfilter)
const filtered = allLayanan.filter(j => j.kategori === "surat_mandiri" && j.a_aktif);
```

---

## 8. User Object dari JWT

### Backend (`$request->user()`)
Properti dari `man_akses.pengguna`:
- `$user->id_pengguna` — UUID user
- `$user->username` — NIM (untuk mahasiswa)
- `$user->nm_pengguna` — nama lengkap

### Frontend (`useAuth().user`)
Tipe `User` di `lib/types/authTypes.ts`:
- `user.id` — UUID
- `user.username` — NIM
- `user.name` — nama lengkap (BUKAN `nm_pengguna` atau `nama`)

---

## 9. [PERLU DIBAHAS] Alur Tahapan PM-ALIH (Alih Program / Pindah Studi)

### Masalah

Status `diverifikasi` dipakai ulang di 2 tahapan berbeda pada seed data `ref.tahapan_layanan` untuk layanan PM-ALIH:

```
Tahap 1: Mahasiswa              → draft → diajukan
Tahap 2: Admin Fak. Asal        → diajukan → diverifikasi        ← pertama kali
Tahap 3: Admin Fak. Tujuan      → diverifikasi → menunggu_persetujuan
Tahap 4: Admin BAK              → menunggu_persetujuan → diverifikasi  ← DUPLIKAT!
Tahap 5: Pejabat                → diverifikasi → disetujui             ← AMBIGU!
Tahap 6: Admin BAK (terbit)     → disetujui → terbit
```

### Dampak

1. Setelah **tahap 4** (Admin BAK verifikasi), status kembali ke `diverifikasi`
2. `getCurrentTahapan()` mencari tahapan dengan `status_masuk = diverifikasi` → menemukan **tahap 3** (Admin Fak. Tujuan), bukan **tahap 5** (Pejabat)
3. Akibatnya: setelah Admin BAK verifikasi, sistem **kembali ke tahap 3** (loop) — bukan lanjut ke tahap 5
4. Progress stepper juga kacau karena `statusOrder` tidak bisa membedakan `diverifikasi` tahap 2 vs tahap 4

### Opsi Solusi (Perlu Dibahas dengan Tim BAK)

**Opsi A: Status unik per tahapan**
```
Tahap 4: menunggu_persetujuan → diverifikasi_bak
Tahap 5: diverifikasi_bak → disetujui
```
- Perlu tambah status baru `diverifikasi_bak` di database + frontend
- Paling bersih tapi perlu update banyak tempat

**Opsi B: Tracking posisi berbasis urutan (bukan status)**
- Tambah kolom `tahapan_saat_ini` (urutan number) di tabel `layanan.pengajuan`
- Transisi berdasarkan urutan, bukan cocokkan status
- Lebih fleksibel tapi perlu refactor `WorkflowService`

**Opsi C: Sederhanakan alur PM-ALIH**
- Gabung tahap 3 (Fak. Tujuan) dan 4 (Admin BAK) jadi satu tahapan
- Kurangi kompleksitas tapi mungkin tidak sesuai SOP

### Status Saat Ini

- PM-ALIH **belum bisa digunakan secara penuh** karena bug loop di tahap 4→5
- PM-CUTI dan PM-UNDUR (5 tahapan) **berfungsi normal** karena tidak ada status duplikat
- Semua layanan surat mandiri (3 tahapan) **berfungsi normal**

### Layanan yang Perlu Perhatian

| Layanan | Tahapan | Status |
|---------|---------|--------|
| SK-LOA, SK-KTM, SK-PKKMB, SK-HERREG | 3 tahapan | **OK** |
| PM-CUTI | 5 tahapan | **OK** |
| PM-UNDUR | 5 tahapan | **OK** |
| PM-ALIH | 6 tahapan | **BUG** — perlu dibahas |
| BA-HMM, BA-PUTUS | 5 tahapan | Belum ditest |

---

## 10. Auth Service — APLIKASI_ID Config

### Masalah

Login loop (portal → login → portal) karena `APLIKASI_ID` di auth service bernilai `1` (bukan UUID).

### Penyebab

Docker compose auth service: `APLIKASI_ID: "${AUTH_APLIKASI_ID:-1}"` — fallback ke `1`.
Kolom `id_aplikasi` di SQL Server bertipe `uniqueidentifier` → error convert.

### Fix

Tambah di `deployment/local/.env`:
```env
AUTH_APLIKASI_ID=6df39588-e4d7-4e92-b3b1-e7b5078a3832
```
