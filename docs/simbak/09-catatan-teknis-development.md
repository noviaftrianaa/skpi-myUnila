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

## 9. [REVISI] Alur Tahapan PM-ALIH (Alih Program / Pindah Studi)

### Alur Lama (Bug — Status Duplikat)

```
Tahap 1: Mahasiswa              → draft → diajukan
Tahap 2: Admin Fak. Asal        → diajukan → diverifikasi
Tahap 3: Admin Fak. Tujuan      → diverifikasi → menunggu_persetujuan
Tahap 4: Admin BAK              → menunggu_persetujuan → diverifikasi  ← DUPLIKAT!
Tahap 5: Pejabat                → diverifikasi → disetujui             ← AMBIGU!
Tahap 6: Admin BAK (terbit)     → disetujui → terbit
```

Bug: status `diverifikasi` duplikat → loop di tahap 4→5.

### Alur Revisi (Disederhanakan — Tahap 5 Dihapus)

Tahap 5 (Persetujuan Pejabat) **dihilangkan** karena proses persetujuan dilakukan di fakultas tujuan (tahap 3) dan melalui SAP (di luar sistem SIMBAK).

```
Tahap 1: Mahasiswa           → draft → diajukan
Tahap 2: Admin Fak. Asal     → diajukan → diverifikasi
Tahap 3: Admin Fak. Tujuan   → diverifikasi → menunggu_persetujuan
Tahap 4: Admin BAK            → menunggu_persetujuan → disetujui
Tahap 5: Admin BAK (terbit)   → disetujui → terbit
```

**5 tahapan** — tidak ada status duplikat, sama dengan PM-CUTI/PM-UNDUR.

### Detail Per Tahap

**Tahap 1 — Mahasiswa: Pengajuan**
- Pilih prodi tujuan + fakultas tujuan
- Validasi syarat akademik (IPK, SKS, semester)
- Upload 6 dokumen persyaratan
- Isi alasan pindah studi

**Tahap 2 — Admin Fakultas Asal: Verifikasi**
- Verifikasi kelengkapan dokumen
- Cek kesesuaian data akademik
- Upload surat pengantar dari Dekan/WD I kepada Rektor/WR I ke SIMBAK
- Jika tidak lengkap → minta perbaikan
- **Di luar sistem**: kirim surat pengantar dan dokumen melalui SAP ke Rektor/WR1
- **Di luar sistem**: WR1 mendisposisikan surat ke fakultas tujuan via SAP

**Tahap 3 — Admin Fakultas Tujuan: Proses Penerimaan**
- Menerima disposisi (di luar sistem, sudah via SAP)
- Verifikasi semua dokumen pengajuan
- Proses:
  - Wawancara (jika diperlukan) → hasil dicatat
  - **Keputusan**: diterima atau ditolak
  - Jika diterima: upload daftar konversi SKS
  - Jika ditolak: pengajuan ditolak + alasan
  - Buat surat balasan dari WR1 bahwa diterima/ditolak
- Upload ke SIMBAK:
  - Disposisi
  - Dokumen penilaian/hasil wawancara
  - Dokumen konversi SKS (jika diterima)
  - Surat pengantar bahwa mahasiswa diterima/ditolak
- Upload juga ke SAP (di luar sistem)
- Endpoint: `POST /approval/{id}/terima-tujuan`
- Data: `a_diterima_tujuan`, `hasil_wawancara`, `daftar_konversi_sks`

**Tahap 4 — Admin BAK: Verifikasi Akhir**
- Verifikasi seluruh dokumen dan hasil proses lintas fakultas
- Pastikan semua persyaratan administratif terpenuhi
- Jika diterima → buat SK Rektor
- Jika ditolak → buat Surat Penolakan Wakil Rektor

**Tahap 5 — Admin BAK: Penerbitan SK Rektor / Surat Penolakan**
- Jika disetujui:
  - Buat draf SK Rektor tentang Alih Program / Pindah Studi
  - Nama yang ditolak **tidak masuk** ke SK
  - Upload SK yang sudah ditandatangani (PDF)
- Jika ditolak:
  - Buat surat penolakan
  - Upload surat penolakan (PDF)
- Status → terbit, mahasiswa bisa download

### Output
- SK Rektor tentang Alih Program / Pindah Studi (untuk yang diterima)
- Surat Penolakan Wakil Rektor (untuk yang ditolak)

### Yang Perlu Diubah (Implementasi)

1. **Update seed data** `ref.tahapan_layanan` PM-ALIH → 5 tahapan (hapus tahap Pejabat)
2. **Tidak ada status duplikat** → bug loop sudah teratasi
3. **Endpoint `terima-tujuan`** perlu support upload multi-dokumen (disposisi, wawancara, konversi SKS, surat balasan)
4. **Halaman terbitkan** perlu support 2 jenis output: SK Rektor (diterima) dan Surat Penolakan (ditolak)
5. **Integrasi SAP** tidak masuk scope SIMBAK — hanya catatan bahwa proses disposisi dilakukan di luar sistem

### Status

| Aspek | Status |
|-------|--------|
| Alur sudah direvisi | **Ya** (9 April 2026) |
| Seed data diupdate | **Belum** |
| Implementasi backend | **Belum** |
| Implementasi frontend | **Belum** |
| Bug status duplikat | **Teratasi** (alur baru tidak ada duplikat) |
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

---

## 11. [SUPERSEDED — lihat #17] Monitoring KTW (Kelulusan Tepat Waktu) + Exclusion Jalur Masuk

> **STATUS UPDATE (25 April 2026):** Implementasi KTW Exclusion sudah selesai.
> Lihat **section 17** untuk detail implementasi terkini.
> Section ini dipertahankan untuk konteks historis — saat itu blocker adalah data `id_jalur_daftar` kosong.
> Schema PDUT baru sudah punya `siakadu.mahasiswa.jalur_pendaftaran` (text) yang sudah terisi sebagian.

### Kebutuhan (dari docs `02-alur-layanan-simba-revisi.md` poin 2.10)

Admin BAK perlu:
- Memantau indikator **kelulusan tepat waktu (KTW)**
- **Meng-exclude** mahasiswa jalur tertentu dari perhitungan KTW agar analisis lebih akurat:
  - Jalur **Rekognisi Pembelajaran Lampau (RPL)**
  - Jalur **Studi Lanjut** (D3 ke S1 — transfer SKS, masa studi lebih pendek)

### Kriteria KTW
| Jenjang | Tepat Waktu |
|---------|-------------|
| D3 | ≤ 3 tahun (≤ 6 semester) |
| S1 | ≤ 4 tahun (≤ 8 semester) |
| S2 | ≤ 2 tahun (≤ 4 semester) |
| S3 | ≤ 3 tahun (≤ 6 semester) |

### Status Implementasi Saat Ini

| Fitur | Status |
|-------|--------|
| Indikator tepat waktu per mahasiswa (badge hijau/merah) | **Sudah** |
| Persentase tepat waktu di stat card | **Sudah** |
| Kriteria per jenjang di backend query | **Sudah** |
| Filter fakultas, prodi, jenjang, tahun lulus | **Sudah** |
| Export CSV | **Sudah** |
| **Filter exclusion jalur masuk** | **Belum** |
| **Mekanisme tandai/exclude dari perhitungan** | **Belum** |

### Blocker: Data Jalur Masuk Tidak Tersedia

Kolom `siakadu.reg_pd.id_jalur_daftar` → **kosong** (NULL untuk semua mahasiswa)
Tabel `siakadu.ref_jalur_daftar` → **kosong** (belum di-sync dari sumber data)

```sql
-- Kolom ada tapi data kosong
SELECT DISTINCT id_jalur_daftar FROM siakadu.reg_pd WHERE id_jalur_daftar IS NOT NULL;
-- Result: 0 rows

SELECT * FROM siakadu.ref_jalur_daftar;
-- Result: 0 rows
```

### Opsi Solusi

**Opsi A: Tunggu data jalur masuk di-sync ke PDUT**
- Koordinasi dengan tim SIAKADU agar `ref_jalur_daftar` dan `reg_pd.id_jalur_daftar` diisi
- Setelah data tersedia, tambah:
  - Dropdown filter jalur masuk di halaman monitoring
  - Checkbox "Exclude dari KTW" per jalur
  - Query backend yang filter `WHERE id_jalur_daftar NOT IN (...excluded...)`

**Opsi B: Filter berdasarkan jenjang (sementara)**
- Exclude jenjang Profesi (id_jenj_didik tertentu) dari perhitungan
- Tidak bisa exclude RPL/alih program karena jenjangnya sama (S1/S2)

**Opsi C: Tandai manual dari admin**
- Admin BAK bisa tandai mahasiswa tertentu sebagai "exclude KTW"
- Perlu tabel baru di PostgreSQL simbak: `monitoring_exclusion`
- Lebih fleksibel tapi operasional lebih berat

### Rekomendasi

Gunakan **Opsi A** sebagai solusi utama (tunggu data PDUT). Sementara menunggu, bisa implementasi **Opsi B** (filter jenjang Profesi) sebagai interim.

---

## 12. [PLAN] Notifikasi Kandidat Putus Studi — Peringatan UKT

### Kebutuhan (dari docs `02-alur-layanan-simba-revisi.md` poin 2.9)

Mahasiswa yang masuk daftar kandidat Putus Studi harus diberitahu **agar tidak melakukan pembayaran UKT** selama proses evaluasi berjalan.

### Tahap Notifikasi

**Saat kandidat ditarik (batch dibuat)** — setelah Admin BAK create batch dan kandidat muncul.

### Isi Notifikasi

> *"Anda masuk dalam daftar evaluasi akademik semester [semester]. Mohon TIDAK melakukan pembayaran UKT sampai ada keputusan resmi. Silakan hubungi BAK untuk informasi lebih lanjut."*

### Mekanisme (Plan)

- Notifikasi dikirim otomatis ke mahasiswa yang masuk `batch.kandidat_batch`
- Channel: email / portal notification (tergantung notification service yang tersedia)
- Trigger: setelah `BatchController::store()` selesai insert kandidat
- Hanya untuk jenis batch `putus_studi`

### Blocker

Notification service **belum tersedia** di MyUnila (fitur global). Implementasi ditunda sampai notification service ready.

### Referensi Implementasi: SI Registrasi (`E:\laragon\www\si-registrasi`)

SI Registrasi sudah punya framework notifikasi yang bisa diadopsi:

#### Email
- **Provider**: SMTP dinamis dari database (`setting.smtp_config`)
- **Template**: Disimpan di database (`setting.template_pesan`) dengan placeholder `{{nama}}`, `{{npm}}`, dll
- **View**: Blade template HTML responsive (`resources/views/emails/reminder-registrasi.blade.php`)
- **Queue**: Redis-based job (`ProcessEmailNotifJob.php`) dengan delay 200ms per email
- **Logging**: `setting.smtp_log` — tracking status sent/failed per email
- **Rate limiting**: `daily_limit`, `monthly_limit`, `usage_today` per SMTP config

#### WhatsApp
- **Framework ada** tapi belum fully implemented
- Toggle `a_whatsapp` di `setting.notifikasi_config`
- API config generic di `setting.api_config` — support berbagai auth (bearer, api_key, oauth2)
- Bisa diintegrasikan dengan provider WA API (Fonnte, Wablas, dll)

#### Channel yang Tersedia
| Channel | Status di SI Registrasi |
|---------|------------------------|
| `a_email` | Sudah implementasi |
| `a_whatsapp` / `a_sms` | Framework ada, belum implementasi |
| `a_push` | Framework ada |
| `a_in_app` | Framework ada |

---

## 13. [PLAN] Notifikasi SIMBAK — Email & WhatsApp

### Layanan yang Perlu Notifikasi

#### A. Penetapan Putus Studi (BA-PUTUS) — Early Warning

**Trigger**: Setelah batch dibuat dan kandidat ditarik
**Penerima**: Mahasiswa yang masuk `batch.kandidat_batch` dengan `jenis_batch = putus_studi`
**Channel**: Email + WhatsApp

**Template Email**:
```
Subject: [PENTING] Evaluasi Akademik Semester {{semester}} — Universitas Lampung

Yth. {{nama}} (NPM: {{npm}})
Program Studi {{prodi}}, {{fakultas}}

Anda masuk dalam daftar evaluasi akademik semester {{semester}} berdasarkan
kriteria evaluasi yang berlaku (Pertor No. 12 Tahun 2025 tentang PA Pasal 48).

⚠️ MOHON TIDAK MELAKUKAN PEMBAYARAN UKT sampai ada keputusan resmi.

Silakan hubungi Biro Akademik dan Kemahasiswaan (BAK) untuk informasi
lebih lanjut atau klarifikasi.

Hormat kami,
Biro Akademik dan Kemahasiswaan
Universitas Lampung
```

**Template WhatsApp**:
```
[PENTING] Evaluasi Akademik — Universitas Lampung

Yth. {{nama}} ({{npm}})

Anda masuk daftar evaluasi akademik semester {{semester}}.

⚠️ MOHON TIDAK BAYAR UKT sampai ada keputusan resmi.

Hubungi BAK untuk info lebih lanjut.
```

#### B. Penetapan Habis Masa Mukim (BA-HMM) — Early Warning

**Trigger**: Setelah batch dibuat dan kandidat ditarik
**Penerima**: Mahasiswa yang masuk `batch.kandidat_batch` dengan `jenis_batch = habis_masa_mukim`
**Channel**: Email + WhatsApp

**Template Email**:
```
Subject: [PENTING] Evaluasi Masa Studi — Universitas Lampung

Yth. {{nama}} (NPM: {{npm}})
Program Studi {{prodi}}, {{fakultas}}

Anda masuk dalam daftar evaluasi masa studi berdasarkan
Pertor No. 12 Tahun 2025 tentang PA Pasal 24.

Data akademik Anda:
- Jenjang: {{jenjang}}
- Angkatan: {{angkatan}}
- Semester saat ini: {{semester}}
- Batas masa studi: {{batas_semester}} semester

Silakan hubungi Biro Akademik dan Kemahasiswaan (BAK) atau
fakultas Anda untuk informasi lebih lanjut.

Hormat kami,
Biro Akademik dan Kemahasiswaan
Universitas Lampung
```

**Template WhatsApp**:
```
[PENTING] Evaluasi Masa Studi — Universitas Lampung

Yth. {{nama}} ({{npm}})
Jenjang: {{jenjang}} | Semester: {{semester}}

Anda masuk daftar evaluasi masa studi (batas: {{batas_semester}} smt).

Hubungi BAK atau fakultas untuk info lebih lanjut.
```

#### C. Perubahan Status Pengajuan Layanan (Semua Layanan)

**Trigger**: Setiap kali status pengajuan berubah
**Penerima**: Mahasiswa pemohon
**Channel**: Email (opsional WhatsApp)

| Status Baru | Notifikasi | Kirim? |
|-------------|-----------|:------:|
| `diajukan` | - | Tidak |
| `perlu_perbaikan` | "Pengajuan Anda perlu diperbaiki. Catatan: {{catatan}}" | **Ya** |
| `diverifikasi` | - | Tidak |
| `menunggu_persetujuan` | - | Tidak |
| `disetujui` | - | Tidak |
| `ditolak` | "Pengajuan Anda ditolak. Alasan: {{catatan}}" | **Ya** |
| `terbit` | "Surat/SK Anda telah terbit. Silakan download di portal SIMBAK" | **Ya** |

### Arsitektur (Adopsi dari SI Registrasi)

```
SIMBAK Backend
  ↓ (trigger event)
Notification Job (Redis Queue)
  ↓
Email: SMTP dari setting.smtp_config
WhatsApp: API dari setting.api_config
  ↓
Log ke setting.smtp_log / tabel log SIMBAK
```

### Implementasi (Bertahap)

| Fase | Scope | Prioritas |
|------|-------|-----------|
| Fase 1 | Notifikasi email BA-PUTUS (early warning UKT) | **Tinggi** |
| Fase 2 | Notifikasi email BA-HMM (early warning masa studi) | **Tinggi** |
| Fase 3 | Notifikasi email perubahan status pengajuan | Sedang |
| Fase 4 | Integrasi WhatsApp untuk semua notifikasi | Rendah |

### Prasyarat

1. Tabel `setting.smtp_config` sudah diisi (SMTP server Unila)
2. Template disimpan di `setting.template_pesan` atau tabel khusus SIMBAK
3. Redis queue worker berjalan di container SIMBAK
4. Untuk WhatsApp: API provider sudah dikonfigurasi di `setting.api_config`

### Status

| Aspek | Status |
|-------|--------|
| Plan dicatat | **Ya** (9 April 2026) |
| Referensi framework (SI Registrasi) | **Tersedia** |
| SMTP config tersedia | **Perlu dicek** — apakah `setting.smtp_config` sudah ada di pdut_staging |
| WhatsApp API tersedia | **Belum** — perlu setup provider |
| Implementasi | **Belum** |

---

## 14. [PLAN] PM-ALIH Dari Luar Unila — Implementasi Opsi B (Flag `a_dari_luar`)

### Keputusan Desain (12 April 2026)

**Opsi yang dipilih: Opsi B** — Satu jenis layanan `ALIH_PROGRAM` + flag `a_dari_luar` di tabel `layanan.pengajuan`.

**Alasan:**
- Alur PM-ALIH internal dan luar Unila substansinya hampir identik
- Yang berbeda hanya tahap 1 (siapa yang input) dan skip Fakultas Asal
- Proses persetujuan sama — tahap Pejabat dihilangkan (via SAP di luar sistem)
- Tidak perlu duplikasi konfigurasi persyaratan & tahapan di `ref.*`
- Maintenance lebih mudah (update 1 tempat)
- Reporting lebih sederhana (query 1 tabel, filter by flag)

### Proses di Luar Sistem (Sebelum Masuk SIMBAK)

1. Calon mahasiswa mengirimkan surat permohonan pindah ke Rektor/WR I
2. Rektor/WR I mendisposisikan surat ke BAK (melalui SAP)
3. BAK menerima disposisi → mulai input ke SIMBAK

### Perbedaan Alur Internal vs Luar Unila

| Aspek | Internal (5 tahap) | Luar Unila (4 tahap) |
|-------|----------|------------|
| Proses sebelum SIMBAK | - | Surat ke Rektor → disposisi ke BAK via SAP |
| Inisiator tahap 1 | Mahasiswa (punya SSO) | Admin BAK (pemohon tidak punya SSO) |
| Data pemohon | Otomatis dari PDUT | Input manual oleh Admin BAK |
| Validasi syarat akademik | Auto-check IPK/SKS/semester | Manual (dari transkrip PT asal) |
| Tahap Fakultas Asal | Ada (tahap 2) | Tidak ada — skip, langsung Fak Tujuan |
| Tahap Pejabat | Tidak ada (via SAP) | Tidak ada (sama — via SAP) |
| Notifikasi ke pemohon | Email otomatis | Manual (pemohon tidak punya akun) |
| Output | SK Alih Program | SK Penerimaan Pindah Studi |

### ALTER Tabel yang Dibutuhkan

#### 1. `layanan.pengajuan` — flag + data PT asal

```sql
-- Flag penanda pengajuan dari luar Unila
ALTER TABLE layanan.pengajuan
  ADD COLUMN a_dari_luar BOOLEAN NOT NULL DEFAULT FALSE;

-- Nama PT asal (untuk kasus luar Unila)
ALTER TABLE layanan.pengajuan
  ADD COLUMN nm_pt_asal VARCHAR(200) NULL;

-- id_pemohon nullable (pemohon luar tidak ada di man_akses.pengguna)
ALTER TABLE layanan.pengajuan
  ALTER COLUMN id_pemohon DROP NOT NULL;

COMMENT ON COLUMN layanan.pengajuan.a_dari_luar
  IS 'TRUE jika pengajuan alih program dari luar Unila (pemohon tidak punya SSO)';
COMMENT ON COLUMN layanan.pengajuan.nm_pt_asal
  IS 'Nama perguruan tinggi asal (khusus alih program dari luar Unila)';
```

#### 2. `layanan.data_pemohon` — data manual untuk pemohon luar

```sql
-- id_mahasiswa nullable (pemohon luar belum terdaftar di PDUT)
ALTER TABLE layanan.data_pemohon
  ALTER COLUMN id_mahasiswa DROP NOT NULL;

-- nim nullable (NIM asal dari PT luar, format berbeda)
ALTER TABLE layanan.data_pemohon
  ALTER COLUMN nim DROP NOT NULL;

-- Nama PT asal + akreditasi
ALTER TABLE layanan.data_pemohon
  ADD COLUMN nm_pt_asal VARCHAR(200) NULL;

ALTER TABLE layanan.data_pemohon
  ADD COLUMN akreditasi_prodi_asal VARCHAR(50) NULL;

COMMENT ON COLUMN layanan.data_pemohon.nm_pt_asal
  IS 'Nama PT asal pemohon (khusus alih program dari luar Unila)';
COMMENT ON COLUMN layanan.data_pemohon.akreditasi_prodi_asal
  IS 'Akreditasi prodi asal: A, B, Unggul, Baik Sekali, Baik, dll';
```

#### 3. `ref.tahapan_layanan` — strategi tahapan

Tidak perlu ALTER tabel. Satu `id_jenis_layanan` (ALIH_PROGRAM) punya 2 varian alur. Strategi: **branching di WorkflowService** (bukan duplikasi seed).

- Tetap 5 tahapan ALIH_PROGRAM yang ada di database
- WorkflowService branching berdasarkan `a_dari_luar`:
  - Tahap 1: skip validasi `kode_role = 'mahasiswa'`, allow `admin_bak` sebagai inisiator
  - Tahap 2 (Fakultas Asal): **di-skip**, langsung ke tahap 3 (Fakultas Tujuan)
  - Tahap Pejabat: tetap tidak ada (sama dengan internal — approval via SAP)
- Pro: tidak perlu duplikasi seed data, flow approval konsisten
- Con: logic WorkflowService sedikit lebih kompleks (1 branching point: skip fak asal)

### Perubahan Backend

#### `WorkflowService.php`

```php
// Tambah method untuk detect alur luar Unila
public function isFromExternalUniversity($pengajuan): bool
{
    return $pengajuan->a_dari_luar ?? false;
}

// Modifikasi findTahapanForActor() — allow admin_bak di tahap 1
// jika a_dari_luar = true
public function findTahapanForActor($pengajuan, $kodeRole)
{
    // Existing logic...

    // Tambahan: jika dari luar Unila dan tahap 1, admin_bak = inisiator
    if ($this->isFromExternalUniversity($pengajuan)
        && $kodeRole === 'admin_bak'
        && $pengajuan->status === 'draft') {
        // Return tahapan pertama (yang normalnya untuk mahasiswa)
        return $this->getFirstTahapan($pengajuan);
    }
}

// Modifikasi getNextTahapan() — skip fakultas asal untuk luar Unila
// Setelah tahap 1 (diajukan), langsung ke tahap 3 (Fakultas Tujuan)
// bukan tahap 2 (Fakultas Asal)
public function getNextTahapan($pengajuan, $currentTahapan)
{
    // Existing logic...

    // Jika dari luar Unila dan tahap berikutnya = admin_fakultas_asal
    // maka skip ke tahap setelahnya (admin_fakultas_tujuan)
    if ($this->isFromExternalUniversity($pengajuan)
        && $nextTahapan->kode_role === 'admin_fakultas_asal') {
        return $this->getTahapanAfter($pengajuan, $nextTahapan);
    }
}
```

#### `PengajuanController.php`

```php
// Modifikasi store() untuk kasus a_dari_luar = true:
//   - Tidak query PDUT untuk data pemohon
//   - Data pemohon dari request body (input manual admin)
//   - Skip validasi syarat akademik otomatis

public function store(Request $request): JsonResponse
{
    $isDariLuar = $request->boolean('a_dari_luar', false);

    if ($isDariLuar) {
        // Validate manual input: nama, nim_asal, nm_pt_asal, dll
        $data = $request->validate([
            'nm_mahasiswa' => 'required|string|max:200',
            'nim_asal' => 'required|string|max:20',
            'nm_pt_asal' => 'required|string|max:200',
            'nm_prodi_asal' => 'required|string|max:200',
            'akreditasi_prodi_asal' => 'nullable|string|max:50',
            'ipk' => 'required|numeric|min:0|max:4',
            'sks_lulus' => 'required|integer|min:0',
            // ... field lain
        ]);
        // Simpan ke data_pemohon manual (tanpa query PDUT)
        // id_pemohon = NULL (pemohon tidak ada di man_akses.pengguna)
        // a_dari_luar = TRUE
        // nm_pt_asal = dari input
    } else {
        // Existing flow: query PDUT, auto-populate data_pemohon
    }
}
```

### Perubahan Frontend

#### `frontend/src/app/dashboard/sim-bak/permohonan/[kode]/page.tsx`

- Tambah toggle/checkbox "Pengajuan dari Luar Unila" (hanya visible untuk role Admin BAK)
- Jika dicentang:
  - Sembunyikan card "Data Akademik Pemohon" (yang dari PDUT)
  - Tampilkan form input manual: nama, NIM asal, PT asal, prodi asal, akreditasi, IPK, SKS
  - Sembunyikan card "Syarat Akademik" (validasi auto)
  - Tampilkan info: "Validasi syarat akademik dilakukan manual berdasarkan transkrip"
  - Tambah field upload "Disposisi dari Rektor/WR I"

#### `frontend/src/app/dashboard/sim-bak/admin/verifikasi/[id]/page.tsx`

- Tampilkan badge "Dari Luar Unila" di header jika `a_dari_luar = true`
- Data pemohon card menampilkan PT asal + akreditasi prodi asal
- WorkflowStepper menyesuaikan (skip tahap Fakultas Asal, langsung Fakultas Tujuan)

### Status Implementasi

| Aspek | Status |
|-------|--------|
| Plan & alur dicatat | **Ya** (12 April 2026) |
| Keputusan desain (Opsi B + tanpa Pejabat) | **Ya** |
| ALTER tabel | **Belum** |
| Backend WorkflowService branching (skip fak asal) | **Belum** |
| Backend PengajuanController manual input | **Belum** |
| Frontend toggle "Dari Luar Unila" | **Belum** |
| Testing end-to-end | **Belum** |

---

## 15. [PLAN] Alasan Exclude Kandidat Batch — Select Dropdown + Upload Dokumen Meninggal

### Keputusan Desain (12 April 2026)

Alasan exclude kandidat batch menggunakan **select dropdown** (bukan text input bebas), dengan opsi **berbeda per jenis batch**. Opsi "Lainnya" menampilkan text input tambahan.

### Opsi Alasan Per Jenis Batch

#### BA-HMM (Habis Masa Mukim)
| # | Opsi | Dokumen Wajib |
|---|------|---------------|
| 1 | Sudah mengajukan undur diri | - |
| 2 | Meninggal dunia | **Surat Keterangan Meninggal Dunia dari RS / Aparat Desa** (PDF) |
| 3 | Lainnya → text input | - |

#### BA-PUTUS (Putus Studi)
| # | Opsi | Dokumen Wajib |
|---|------|---------------|
| 1 | Mahasiswa double degree | - |
| 2 | Jalur RPL (Rekognisi Pembelajaran Lampau) | - |
| 3 | Diberi kesempatan lanjut studi | - |
| 4 | Sudah mengajukan undur diri | - |
| 5 | Meninggal dunia | **Surat Keterangan Meninggal Dunia dari RS / Aparat Desa** (PDF) |
| 6 | Lainnya → text input | - |

### Rule Khusus: Upload Dokumen Meninggal Dunia

- Berlaku untuk **BA-HMM dan BA-PUTUS**
- Trigger: saat admin memilih opsi "Meninggal dunia" dari dropdown
- Muncul field upload wajib di bawah select
- Validasi: tidak bisa konfirmasi exclude tanpa upload dokumen
- File disimpan di MinIO: `simbak/batch/{id_batch}/kandidat/{id_kandidat}/surat_meninggal.pdf`

### Perubahan Database

```sql
-- Tambah kolom untuk menyimpan path dokumen pendukung exclude
ALTER TABLE batch.verifikasi_batch
  ADD COLUMN path_dokumen_exclude VARCHAR(1000) NULL;

COMMENT ON COLUMN batch.verifikasi_batch.path_dokumen_exclude
  IS 'Path file dokumen pendukung exclude (misal: surat keterangan meninggal dunia)';
```

### Perubahan Backend

#### `BatchController::verifikasiKandidat()`

```php
// Tambah validasi: jika alasan = "Meninggal dunia", file wajib
$rules = [
    'hasil' => 'required|in:dikonfirmasi,dikeluarkan',
    'catatan' => 'nullable|string',
    'alasan_exclude' => 'required_if:hasil,dikeluarkan|string',
    'alasan_exclude_lainnya' => 'required_if:alasan_exclude,Lainnya|string',
    'dokumen_exclude' => 'required_if:alasan_exclude,Meninggal dunia|file|mimes:pdf|max:10240',
];

// Simpan alasan final
$alasanFinal = $data['alasan_exclude'] === 'Lainnya'
    ? $data['alasan_exclude_lainnya']
    : $data['alasan_exclude'];

// Upload dokumen jika ada
if ($request->hasFile('dokumen_exclude')) {
    $path = $this->minioService->uploadDokumenExclude($idBatch, $idKandidat, $file);
    // Simpan path ke verifikasi_batch
}
```

### Perubahan Frontend

#### `frontend/src/app/dashboard/sim-bak/batch/[id]/page.tsx`

Modal exclude kandidat:
```
┌─────────────────────────────────────────┐
│ Keluarkan Kandidat                       │
│                                          │
│ Alasan: [▼ Pilih alasan           ]     │
│                                          │
│ (jika "Lainnya" dipilih:)               │
│ Keterangan: [________________]           │
│                                          │
│ (jika "Meninggal dunia" dipilih:)       │
│ ⚠️ Wajib upload Surat Keterangan        │
│    Meninggal Dunia dari RS/Aparat Desa   │
│ [📎 Upload PDF _______________]          │
│                                          │
│            [Batal] [Konfirmasi]           │
└─────────────────────────────────────────┘
```

- Opsi dropdown di-populate berdasarkan `jenis_batch` (HMM vs PUTUS)
- State conditional: `alasan === "Lainnya"` → tampil text input
- State conditional: `alasan === "Meninggal dunia"` → tampil file upload + warning
- Tombol "Konfirmasi" disabled jika meninggal dunia tapi belum upload

### Status Implementasi

| Aspek | Status |
|-------|--------|
| Plan dicatat | **Ya** (12 April 2026) |
| ALTER tabel verifikasi_batch | **Belum** |
| Backend validasi + upload | **Belum** |
| Frontend select dropdown + conditional upload | **Belum** |
| Testing | **Belum** |

---

## 16. [DONE] Pivot PdutRepository ke `siakadu.mahasiswa`

### Konteks (25 April 2026)

Schema PDUT di-restructure besar. Tabel `peserta_didik` & `reg_pd` **tidak ada lagi**, diganti dengan `siakadu.mahasiswa` (denormalized, 125k+ rows).

### Mapping Pivot

| Sebelumnya | Sekarang |
|-----------|----------|
| `siakadu.peserta_didik pd` + `siakadu.reg_pd rp` | `siakadu.mahasiswa m` (single table) |
| `pdrd.sms` (untuk nm_prodi) | `m.nm_prodi` (text langsung) |
| `man_akses.unit_organisasi` (untuk fakultas) | `m.nm_fakultas` (text — id_fakultas tidak ada lagi) |
| `pd.id_stat_mhs → siakadu.status_mahasiswa` | `m.status_mahasiswa` (text langsung) |
| `YEAR(rp.tgl_masuk_sp)` | `m.angkatan` |

### Bonus Field di siakadu.mahasiswa

- `email`, `email_kampus`, `hp` → untuk notifikasi
- `is_transfer`, `univ_asal`, `prodi_asal` → untuk PM-ALIH dari luar Unila
- `jalur_pendaftaran` (text) → untuk KTW exclusion
- `tgl_keluar`, `id_jns_keluar`, `ket_keluar` → status mahasiswa keluar

### Fallback untuk Data NULL

Karena banyak data masih NULL di mahasiswa (status, semester):

- `semester_aktif` NULL → pakai `masa_studi_semester` (dihitung dari angkatan)
- `status_registrasi` NULL & `id_jns_keluar` NULL → asumsikan **'Aktif'**

### Catatan Keterbatasan Data (per 25 April 2026)

- `status_mahasiswa` hanya 441 dari 125k yang terisi (sisanya NULL)
- `tgl_keluar` & `id_jns_keluar` semua NULL → tidak bisa filter by tahun lulus
- `kuliah_mhs` kosong → tidak bisa get IPS per semester
- `jalur_pendaftaran` ~342 yang terisi (cukup untuk testing KTW exclusion)

### File yang Diubah

- `backend/simbak-service/app/Repositories/PdutRepository.php` (full rewrite)

---

## 17. [DONE] KTW (Kelulusan Tepat Waktu) Exclusion

### Konteks

Mahasiswa dengan jalur tertentu (Pindahan/Transfer, RPL, Studi Lanjut, Mahasiswa Asing) tidak fair dibandingkan jalur reguler dalam perhitungan masa studi. Perlu di-exclude dari KTW.

### Solusi

Tabel `ref.ktw_exclude_jalur` di PostgreSQL menyimpan daftar jalur yang di-exclude. Admin BAK bisa CRUD via UI.

### Tabel Database (PostgreSQL simbak)

```sql
CREATE TABLE ref.ktw_exclude_jalur (
    id_exclude UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jalur_pendaftaran VARCHAR(200) NOT NULL UNIQUE,
    deskripsi TEXT NULL,
    a_aktif BOOLEAN NOT NULL DEFAULT TRUE,
    id_creator UUID NULL, id_updater UUID NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Default Seed (5 jalur)

1. Pindahan/Transfer
2. Mahasiswa Asing
3. Permata Sakti/Pertukaran Mahasiswa
4. RPL (Rekognisi Pembelajaran Lampau)
5. Studi Lanjut (D3 ke S1)

### Logic di PdutRepository

```php
public function getKtwExcludedJalur(): array  // ambil list jalur aktif
public function isJalurExcludedFromKtw($jalur, $excludedList): bool

// getMonitoringStats() → lulusan dengan jalur excluded TIDAK dihitung di persen tepat_waktu
// getLulusanPaginated() → tambah flag is_excluded_ktw per row
```

### Endpoint Backend

| Method | Path | Fungsi |
|--------|------|--------|
| GET | `/v1/monitoring/ktw-exclusions` | List + daftar jalur unique dari PDUT |
| POST | `/v1/monitoring/ktw-exclusions` | Tambah jalur ke exclusion |
| PUT | `/v1/monitoring/ktw-exclusions/{id}` | Toggle aktif/nonaktif |
| DELETE | `/v1/monitoring/ktw-exclusions/{id}` | Hapus exclusion |

### Frontend

- Tab Lulusan di Monitoring → kolom baru "Jalur" + badge "Excluded" (kuning) untuk yang ke-exclude
- Tombol "Pengaturan KTW" (sebelah Export CSV) → modal dengan form Tambah + Daftar exclusion
- Stats card menampilkan: total lulus, dihitung KTW, di-exclude, persen tepat waktu

### Output Stats Baru

```json
{
  "total_aktif": 224,
  "total_lulus": 171,
  "total_lulus_dihitung_ktw": 168,
  "total_lulus_excluded_ktw": 3,
  "persen_tepat_waktu": 15.8,
  "rata_masa_studi": 6.5,
  "jalur_di_exclude": ["Pindahan/Transfer", "RPL ..."]
}
```

### Status Implementasi

| Aspek | Status |
|-------|--------|
| Tabel `ref.ktw_exclude_jalur` + 5 seed default | ✅ |
| Backend logic di PdutRepository | ✅ |
| Backend CRUD endpoints di MonitoringController | ✅ |
| Frontend kolom Jalur + badge Excluded di tabel lulusan | ✅ |
| Frontend info card di stats | ✅ |
| Frontend modal "Pengaturan KTW" | ✅ |
| Auto-refresh tabel + stats setelah perubahan exclusion | ✅ |
| Export CSV include kolom Jalur + Status KTW | ✅ |

---

## 18. [DONE] Hapus Batch + Tarik Ulang Kandidat

### Aturan Status untuk Hapus Batch

| Status | Bisa Dihapus? | Alasan Wajib? |
|--------|:-------------:|:-------------:|
| `draft` | ✅ Ya | Tidak |
| `kandidat_ditarik` | ✅ Ya | Tidak |
| `verifikasi_fakultas` | ✅ Ya | **Wajib (min 10 char)** — sudah ada verifikasi |
| `sk_dekan_terbit` | ❌ Tidak | Data terkunci |
| `finalisasi` | ❌ Tidak | Dalam proses BAK |
| `terbit` | ❌ Tidak | SK Rektor sudah terbit, legal binding |

### Cascade Soft Delete

- `batch.batch_penetapan` → soft_delete = true
- `batch.kandidat_batch` → soft_delete = true (cascade)
- `batch.verifikasi_batch` → hard delete (tidak punya kolom soft_delete)
- File dokumen exclude di MinIO → best-effort delete

### Tarik Ulang Kandidat

| Aspek | Detail |
|-------|--------|
| **Endpoint** | `POST /batch/{id}/pull-candidates` (sudah ada sejak awal) |
| **Status allowed** | `draft` & `kandidat_ditarik` |
| **Cara kerja** | Soft delete kandidat lama → re-query PDUT → insert ulang dengan status `masuk` |
| **Frontend tombol** | "Tarik Ulang" (warna primary, icon refresh) di header batch detail |
| **Modal konfirmasi** | Warning: kandidat saat ini akan dihapus, status verifikasi reset |

### Endpoints Backend

| Method | Path | Fungsi |
|--------|------|--------|
| POST | `/v1/batch/{id}/pull-candidates` | Re-pull kandidat dari PDUT |
| DELETE | `/v1/batch/{id}` | Hapus batch (cascade) |

### File yang Diubah

- `app/Http/Controllers/Api/Batch/BatchController.php` — method `destroy()` baru
- `app/Repositories/Batch/BatchRepository.php` — `softDeleteCascade()`, `getDokumenExcludePaths()`
- `routes/api.php` — `Route::delete('/{id}', ...)`
- `frontend/.../batch/page.tsx` & `batch/[id]/page.tsx` — tombol + modal

### Status Implementasi

| Aspek | Status |
|-------|--------|
| Backend destroy + cascade soft delete | ✅ |
| Backend pull candidates (existing) | ✅ |
| Frontend tombol Hapus di batch list & detail | ✅ |
| Frontend tombol Tarik Ulang di batch detail | ✅ |
| Modal konfirmasi (native button, bukan HeroUI) | ✅ |
