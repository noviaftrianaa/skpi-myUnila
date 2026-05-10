# Plan — Tata Kelola Akses Pengguna MyUnila

**Universitas Lampung — MyUnila Portal**
**Tanggal:** 8 Mei 2026
**Status:** PLAN (belum diimplementasikan)
**Penyusun:** Tim Pengembangan Sistem Informasi dan Integrasi Data MyUnila

---

## 1. Executive Summary

Saat ini Manajemen Akses MyUnila masih bersifat **per-akun manual** — admin TIK harus menambah peran satu-persatu untuk setiap pengguna ke setiap aplikasi. Untuk universitas dengan 10.000+ pengguna dan 30+ aplikasi, ini sangat tidak skalabel dan rawan kesalahan.

Tambahan masalah:
- **Tidak ada masa berlaku** — peran yang sudah tidak relevan (mis. Kepala Bagian yang pindah unit) tetap aktif sampai admin manual revoke
- **Tidak ada SK tracking** — sulit audit dasar penugasan peran
- **Tidak ada notifikasi** — admin tidak tahu kapan pegawai berpindah unit, lulus, atau pensiun
- **Setiap aplikasi punya admin sendiri** — duplikasi entry, inkonsistensi data

**Plan ini mengusulkan 6 pilar transformasi:**

1. **Bulk Import berbasis Template per Aplikasi** — admin upload Excel berisi daftar pengguna + peran + SK, sistem auto-validasi & assign batch
2. **Lifecycle Management dengan Tanggal Berlaku + Auto-Expire** — setiap penugasan peran fungsional punya `tgl_mulai`, `tgl_kadaluarsa`, reminder otomatis
3. **Hybrid Centralized-Distributed** — master di Manajemen Akses (UPT TIK), UI read-only + request per aplikasi untuk admin app
4. **Auto-Detect Mutasi/Lulusan/Pensiun** — cron baca pdrd, auto-revoke peran identitas saat status keluar; flag review untuk peran fungsional
5. **Audit & Periodic Recertification** — log aktivitas, dashboard akses, recertify per 6 bulan
6. **Default Access Checklist per Aplikasi** (BARU) — checkbox per app: "Mahasiswa/Dosen/Tendik bisa akses default?" — menggantikan menu_role manual mapping untuk peran identitas

**Klasifikasi penting:**
- **Peran Identitas** (Mahasiswa/Dosen/Tendik) = di-derive dari sumber data resmi, lifecycle = mengikuti status aktif. **Di luar** lifecycle SK manual.
- **Peran Fungsional** (Admin, Kepala Bagian, Operator, dll) = SK + tgl_kadaluarsa wajib. **Masuk** lifecycle management.

**Estimasi total effort:** 5-7 minggu (Phase 1-2), 3-4 bulan kalau full implementasi.

---

## 2. Konteks Saat Ini

### 2.1 Manajemen Akses sekarang

- **Tabel inti:** `man_akses.role_pengguna` (kolom: `id_pengguna`, `id_peran`, `id_organisasi`, `sk_penugasan`, `tgl_sk_penugasan`, `tgl_kadarluasa`, `approval_peran`, `last_active`)
- **Fitur sudah ada:** kolom `sk_penugasan`, `tgl_sk_penugasan`, dan `tgl_kadarluasa` **tersedia di skema**, tapi:
  - Banyak baris yang `sk_penugasan` & `tgl_sk_penugasan` kosong (belum di-isi)
  - `tgl_kadarluasa` jarang dipakai — tidak ada cron yang auto-revoke peran ekspired
  - Tidak ada UI bulk-edit / template import
  - Tidak ada audit untuk perpindahan unit
- **Pengelolaan:** dilakukan satu-persatu via UI Manajemen Akses → Daftar Pengguna → assign role per user manual.

### 2.2 Pain Points

| # | Masalah | Dampak |
|---|---|---|
| 1 | Penambahan peran satu-persatu | Time-consuming saat penugasan baru (mis. wisuda admin baru, rotasi pejabat) |
| 2 | Tidak ada masa berlaku otomatis | Pegawai yang sudah pindah/pensiun masih bisa akses sistem |
| 3 | SK penugasan tidak konsisten dicatat | Sulit audit, sulit verifikasi dasar hukum penugasan |
| 4 | Tidak ada notifikasi expiry | Admin tidak tahu peran mana yang segera kadaluarsa |
| 5 | Setiap admin app punya copy data peran | Inkonsistensi antar aplikasi (e.g. admin SIMBAK lupa update saat pegawai pindah) |
| 6 | Tidak ada workflow approval | Setiap admin TIK bisa langsung set peran, tanpa pengecekan oleh atasan |

### 2.3 Statistik Penggunaan (estimasi)

- ~10.000 pengguna terdaftar
- ~30 aplikasi terintegrasi MyUnila
- ~50.000 baris `role_pengguna` aktif
- Penambahan baru per bulan: ~200-500 entry
- Perubahan/rotasi: ~50-100 entry per bulan

---

## 3. Best Practice Industry (Referensi)

### 3.1 NIST 800-53 (Access Control)

- **AC-2 Account Management** — sistem harus track joining, modification, termination
- **AC-2(2) Removal of Temporary/Emergency Accounts** — auto-deactivate setelah masa kerja
- **AC-2(3) Disable Accounts** — disable saat pegawai tidak aktif (cuti panjang, pensiun)
- **AC-6 Least Privilege** — kasih akses minimal yang dibutuhkan

### 3.2 ITIL Service Management

- **Joiner-Mover-Leaver (JML) process** — tiga state lifecycle pengguna:
  - **Joiner**: pegawai baru → assign template peran sesuai posisi
  - **Mover**: pindah unit/posisi → revoke peran lama, assign peran baru
  - **Leaver**: pensiun/keluar → revoke semua, archive akun

### 3.3 OWASP Application Security Verification

- **V14.5.x** — "verify that all access controls are enforced on the server side"
- **V14.5.4** — "verify that access decisions are made on a per-request basis"
- **V14.6.5** — "verify the system has the ability to revoke access immediately"

### 3.4 Pattern Industri (contoh implementasi)

| Pattern | Penjelasan | Contoh |
|---|---|---|
| **Bulk Import** | Admin upload CSV/Excel dgn daftar user+role | Microsoft 365, Google Workspace |
| **Role Templates** | Template peran per posisi (Kepala Bagian → 5 role tertentu) | Okta, Auth0 |
| **Expiry Workflow** | Reminder 30 hari, 7 hari, 1 hari sebelum expired | Salesforce |
| **Approval Chain** | Atasan harus approve sebelum role granted | ServiceNow |
| **Periodic Recertification** | Admin re-confirm role aktif setiap 6/12 bulan | SAP GRC |
| **Single Source of Truth** | Master di 1 tempat, aplikasi pull/sync | Active Directory + SAML |

---

## 3.5 Peran Identitas vs Peran Fungsional (Klasifikasi Penting)

Sebelum masuk ke solusi, perlu pisahkan dua kategori peran karena lifecycle-nya beda:

### 🟢 Peran Identitas (DI LUAR Lifecycle Management)

Peran berikut **otomatis & inherent** — dikelola dari sumber data resmi, BUKAN dari SK manual:

| Peran | Sumber Data | Lifecycle |
|---|---|---|
| **Mahasiswa** (id_peran=39) | `pdrd.peserta_didik` + `reg_pd` | Aktif sampai `tgl_lulus` (auto-derive) |
| **Dosen** (id_peran=46) | `pdrd.sdm` (id_jns_sdm=12) + `reg_ptk` | Aktif selama `id_jns_keluar IS NULL` |
| **Tenaga Kependidikan** (id_peran=111) | `pdrd.sdm` (id_jns_sdm=13) + `reg_ptk` | Aktif selama belum keluar |

**Karakteristik:**
- ✅ Auto-assigned dari sumber data resmi (SIAKADU, SISTER, PDDIKTI sync)
- ✅ Unit kerja = homebase (sudah ada di pdrd)
- ✅ Tidak perlu SK terpisah
- ✅ "Universal" — berlaku selama status aktif, tanpa expire date manual
- ✅ Auto-revoke saat status keluar (lulus/resign/pensiun) — tertangani via Auto-Detect (Pilar 4)

### 🟡 Peran Fungsional (MASUK Lifecycle Management)

Peran yang ditambah secara eksplisit lewat SK dan butuh tracking:

| Kategori | Contoh | Default Lama Berlaku |
|---|---|---|
| **Pejabat Struktural** | Rektor, Wakil Rektor, Dekan, Wakil Dekan, Kepala Biro, Kepala Bagian, Kajur, Sekjur, KaProdi | Sesuai SK (biasanya 4 tahun) |
| **Admin / Operator Aplikasi** | Admin SIMBAK, Admin Fakultas, Admin Prodi, Admin SIKERMA, Operator Tracer, dll | 1 tahun (renewal annual) |
| **Tim TIK / Helpdesk** | Developer, Helpdesk One Data, IT Support | 2 tahun |
| **Pejabat Penjamin Mutu** | LP3M, SPMI, GKM, GJM | Sesuai SK |
| **Pejabat Penelitian / Pengabdian** | LP2M, Tim Reviewer, Validator | Sesuai SK |
| **Magang / Tenaga Sementara** | Asisten dosen, magang IT, peserta MBKM | 6 bulan / sesuai kontrak |
| **PJ Aplikasi WS API** | PIC Web Service per aplikasi | 2 tahun |

**Karakteristik:**
- ⚠️ WAJIB punya SK + tgl_sk_penugasan + tgl_kadaluarsa
- ⚠️ Bisa berakhir lebih cepat dari status pegawai (mis. Dekan habis masa jabatan tapi tetap dosen)
- ⚠️ Butuh approval workflow + audit trail
- ⚠️ Cocok untuk bulk import via template (mis. 50 admin fakultas baru)

### Implikasi ke Plan

| Pilar | Berlaku untuk Identitas | Berlaku untuk Fungsional |
|---|:---:|:---:|
| 1 — Bulk Import Template | ❌ (auto dari pdrd) | ✅ |
| 2 — Auto-Expire dgn `tgl_kadaluarsa` | ❌ (selama status aktif) | ✅ |
| 3 — Hybrid Centralized-Distributed | (auto) | ✅ |
| 4 — Auto-Detect Mutasi/Lulus/Pensiun | ✅ (auto-revoke) | ✅ (flag review) |
| 5 — Periodic Recertification | ❌ (auto-update sumber data) | ✅ |
| 6 — Default Access Checklist (Pilar baru) | ✅ (yang utama!) | ❌ (tetap pakai menu_role) |

### Rekomendasi Schema

Tambah kolom `a_peran_identitas BIT` di `man_akses.peran`:
- Mahasiswa (39), Dosen (46), Tenaga Kependidikan (111) → `a_peran_identitas=1`
- Semua peran lain → `a_peran_identitas=0` (default)

Lifecycle management script tinggal cek flag ini untuk skip peran identitas.

---

## 4. Proposed Solution

### 4.1 Pilar 1 — Bulk Import via Template per Aplikasi

**Fitur:**
- Setiap aplikasi punya **template Excel** standar yang bisa di-download admin
- Template berisi kolom wajib:
  - `username` atau `nip`/`nidn` (identifier pengguna)
  - `nm_peran` (label peran target di app tsb)
  - `nm_organisasi` (unit kerja saat ini)
  - `nomor_sk_penugasan`
  - `tgl_sk_penugasan`
  - `tgl_mulai_berlaku`
  - `tgl_kadaluarsa`
  - `keterangan` (opsional)

**Flow user:**
1. Admin TIK / admin app buka menu "Import Akses Massal"
2. Pilih aplikasi target (mis. SIMBAK)
3. Download template Excel → isi daftar (mis. 50 admin fakultas + 1 kepala biro)
4. Upload kembali
5. Sistem **validasi**:
   - Username/NIP exist di pdut?
   - Peran valid untuk app tsb?
   - Unit organisasi valid?
   - Tanggal logis (tgl_mulai < tgl_kadaluarsa)?
   - Tidak ada duplikat (username+peran+app sudah ada aktif)?
6. Sistem tampilkan preview: ✓ valid / ⚠ warning / ❌ error per baris
7. Admin konfirmasi → batch insert dengan transaksi
8. Notifikasi email/in-app ke pengguna ybs ("Anda dapat akses baru di SIMBAK sebagai Admin Fakultas, berlaku sampai 31 Des 2026")

**Manfaat:**
- 1 jam input → 50 user (vs sebelumnya 50 menit untuk 50 user)
- Konsistensi format SK + tanggal
- Audit trail otomatis (siapa import, kapan, file apa)

### 4.2 Pilar 2 — Lifecycle Management dengan Auto-Expire

**Fitur:**
- Field `tgl_kadarluasa` di `man_akses.role_pengguna` — diisi WAJIB saat assign
- **Cron job harian** (tengah malam) yang:
  - Cari role_pengguna dengan `tgl_kadarluasa <= TODAY` AND `a_aktif = 1`
  - Soft-deactivate (`approval_peran = 0` atau buat kolom `tgl_dinonaktifkan`)
  - Log ke `log.aktivitas_data`
  - Kirim notifikasi ke pengguna + admin app: "Akses [peran] di [app] sudah berakhir per tanggal X"
- **Reminder otomatis** sebelum expire:
  - 30 hari sebelum: notifikasi via email/Telegram/in-app
  - 7 hari sebelum: notifikasi ulang
  - Hari-H: peran auto-deactivate
- **Renewal flow**:
  - Pengguna/atasan bisa request perpanjangan via UI
  - Admin TIK review + extend `tgl_kadarluasa`
  - Atau batch renew via template Excel "Perpanjangan SK"

**Default policy expiry per kategori peran:**

| Kategori Peran | Default Lama Berlaku |
|---|---|
| Mahasiswa | Sampai tgl_lulus (auto-derive dari pdrd) |
| Dosen / Tendik tetap | 5 tahun (review periodik) |
| Pejabat struktural (Kepala Biro, Wadek, dst) | Sesuai SK (biasanya 4 tahun) |
| Admin/Operator aplikasi | 1 tahun (renewal annual) |
| Magang / Tenaga sementara | 6 bulan (sesuai kontrak) |
| Developer / IT support | 2 tahun |

### 4.3 Pilar 3 — Sentralisasi vs Desentralisasi (Hybrid Model)

**Saran arsitektur:** **Hybrid** — bukan full centralized, bukan full distributed.

| Aspek | Pengelolaan |
|---|---|
| **Master peran & user-role mapping** | Di Manajemen Akses (terpusat, hanya UPT TIK) |
| **Operator per aplikasi** | Tiap app punya admin lokal yang bisa lihat & request perubahan, TIDAK langsung edit |
| **Workflow approval** | Admin app submit request → UPT TIK review → approve → DB updated |
| **Bulk import per app** | Admin app bisa upload template, tapi VALIDASI + COMMIT oleh sistem (tidak butuh approval kalau via template terstandar) |

**Mengapa hybrid?**
- **Fully centralized** → bottleneck di UPT TIK, admin app frustasi nunggu request
- **Fully distributed** → tidak konsisten, tiap admin app punya copy data, sulit audit
- **Hybrid** → master di tengah, admin app punya tools self-service yang validated

**Tab "Manajemen Akses" per aplikasi:**
- Setiap aplikasi (SIMBAK, SI Prestasi, Tracer, SI KKN, dll) punya menu "Manajemen Pengguna App Ini" sendiri
- Menu ini **read-only** untuk admin app (lihat siapa punya akses ke app-nya)
- Tombol "Request Tambah Pengguna" → buka form yang submit ke UPT TIK
- Tombol "Import via Template" → upload Excel, validasi, batch commit
- Tombol "Export Daftar" → download Excel current state
- **TIDAK ada** edit langsung peran user — itu hanya bisa via Manajemen Akses pusat

### 4.4 Pilar 4 — Auto-Detect Perpindahan Unit / Lulusan / Pensiun

**Sumber data:**
- Mahasiswa: `pdrd.peserta_didik` + `pdrd.reg_pd` (status mahasiswa, tgl_lulus)
- Dosen/Tendik: `pdrd.sdm` + `pdrd.reg_ptk` (status pegawai, tgl_keluar)

**Cron harian:**
- Cek `pdrd.reg_pd.tgl_keluar IS NOT NULL` → set `role_pengguna.tgl_kadarluasa = tgl_keluar` untuk mahasiswa lulus
- Cek `pdrd.reg_ptk.tgl_keluar IS NOT NULL` → soft-deactivate semua role_pengguna pegawai
- Cek perubahan `id_organisasi` (mutasi unit kerja) → flag role_pengguna lama dengan warning
- Notifikasi admin app: "5 dosen di prodi X mutasi → review akses mereka"

**Catatan:** auto-detect tidak otomatis revoke (krn bisa false positive). Tapi flag sebagai "needs review", admin TIK approve baru deactivate.

### 4.5 Pilar 5 — Audit & Compliance

**Fitur:**
- Log setiap perubahan akses (siapa, kapan, dari/ke peran apa, alasan, SK ref)
- Dashboard audit untuk:
  - Top 10 admin paling sering modify
  - Penugasan terbaru (last 7/30 days)
  - Penugasan yang akan expire (next 30/60/90 days)
  - User dengan banyak peran (>5 peran aktif → mungkin perlu review)
  - User aktif tapi tidak login >90 hari → kandidat dormant account
- **Periodic recertification** (per 6 bulan):
  - Admin tiap aplikasi diminta confirm "user X masih perlu akses Y?"
  - Yang tidak di-confirm dalam 30 hari → auto soft-deactivate
- **Export audit log** untuk audit eksternal (SPI, BPK, dll)

### 4.6 Pilar 6 — Default Access Checklist per Aplikasi (BARU)

**Latar belakang:** Saat ini, akses peran identitas (Mahasiswa/Dosen/Tendik) ke aplikasi ditentukan via tabel `man_akses.menu_role` — mapping per (peran × menu × aplikasi) secara MANUAL. Akibatnya:

- Untuk app yang harusnya "auto-akses semua mahasiswa" (mis. SIAKADU, Beasiswa, V-Class), admin TIK harus mapping menu satu-satu untuk peran Mahasiswa
- Kalau ada menu baru ditambah, harus update menu_role mapping ulang
- Tidak ada deklarasi tingkat aplikasi — semua di tingkat menu
- Sulit lihat "app ini dipakai siapa saja by design" tanpa query menu_role

**Solusi:** Setiap aplikasi dapat **3 checkbox default access** untuk peran identitas:

```
☐ Default akses untuk Mahasiswa (peran 39)
☐ Default akses untuk Dosen (peran 46)
☐ Default akses untuk Tenaga Kependidikan (peran 111)
```

Kalau dicentang → semua user dengan peran identitas tsb otomatis dapat akses ke app, tanpa perlu mapping menu_role per menu. Untuk peran fungsional (Admin, Kepala Bagian, dll), tetap pakai menu_role mapping (granular per menu).

**Backend logic** di `UserContextService::checkAppAccess()`:

```
SEBELUM cek menu_role table, cek dulu:
  Kalau user.peran adalah peran identitas (39/46/111) dan
  aplikasi.default_access_<peran> = 1 → AKSES DIIZINKAN

Kalau tidak match → fallback ke menu_role check seperti sekarang.
```

**Schema:** Tabel baru `man_akses.aplikasi_default_role` (many-to-many):
```
id_aplikasi   UNIQUEIDENTIFIER FK
id_peran      INT FK (39/46/111 — peran identitas)
a_aktif       BIT
tgl_create, last_update, soft_delete
PK (id_aplikasi, id_peran)
```

**Default Mapping yang Disarankan (untuk seed awal):**

| Aplikasi | Mhs | Dosen | Tendik | Catatan |
|---|:-:|:-:|:-:|---|
| SIAKADU | ✅ | ✅ | ✅ | Akademik universal |
| V-Class | ✅ | ✅ | ❌ | LMS — mhs+dosen |
| Wali | ✅ | ❌ | ❌ | Khusus mhs (lihat data wali) |
| Beasiswa | ✅ | ❌ | ❌ | Pengajuan beasiswa |
| Berdampak (MBKM) | ✅ | ❌ | ❌ | Mhs MBKM |
| Presensi (SIRANDU) | ✅ | ✅ | ❌ | Presensi kuliah |
| Ormawa | ✅ | ❌ | ❌ | Organisasi mahasiswa |
| Minat Bakat | ✅ | ❌ | ❌ | Talent mhs |
| SI KKN | ✅ | ✅ | ❌ | Mhs+DPL |
| SI Penelitian | ❌ | ✅ | ❌ | Riset dosen |
| SI Pengabdian | ❌ | ✅ | ❌ | Pengabdian dosen |
| SI Publikasi | ❌ | ✅ | ❌ | Publikasi dosen |
| Tracer Alumni | ❌ | ❌ | ❌ | Khusus alumni (peran terpisah) |
| Tracer Study (admin) | ❌ | ❌ | ❌ | Hanya admin tracer |
| SIKEP | ❌ | ❌ | ✅ | Kepegawaian — tendik |
| SIKEBAS | ❌ | ❌ | ✅ | Bebas UKT — staff keuangan |
| SIKERMA | ❌ | ❌ | ✅ | LP2M Kerjasama — staff |
| Project Management | ❌ | ✅ | ✅ | Proyek dosen+pegawai |
| SI MBAK (SIMBAK) | ✅ | ❌ | ✅ | Mhs ajukan + admin BAK proses |
| SI Prestasi | ✅ | ✅ | ✅ | Submit prestasi mhs+dosen+tendik |
| Helpdesk TIK | ✅ | ✅ | ✅ | Semua user bisa lapor masalah |
| Blog Unila | ❌ | ❌ | ❌ | Hanya admin konten |
| Service Layanan (ULT) | ✅ | ❌ | ❌ | Layanan untuk mhs |
| myUnila Integrator | ❌ | ❌ | ❌ | Hanya pejabat/admin |
| Dashboard Pimpinan | ❌ | ❌ | ❌ | Hanya pejabat (peran fungsional) |
| Manajemen Akses | ❌ | ❌ | ❌ | Hanya UPT TIK Developer |
| Feeder Integrator | ❌ | ❌ | ❌ | Hanya admin TIK |
| SISTER Integrator | ❌ | ❌ | ❌ | Hanya admin TIK |
| Web Monitoring | ❌ | ❌ | ❌ | Hanya admin webmon |
| Manajemen Konten | ❌ | ❌ | ❌ | Hanya admin konten |

**UI sederhana** (di Manajemen Akses → Daftar Aplikasi → Edit App):

```
┌─────────────────────────────────────────────────┐
│ Edit Aplikasi: SIAKADU                            │
├─────────────────────────────────────────────────┤
│ Nama: SIAKADU                                     │
│ App Slug: siakadu                                 │
│ ...                                                │
│                                                    │
│ Default Akses Peran Identitas:                    │
│   ☑ Mahasiswa  (semua mhs aktif otomatis akses)  │
│   ☑ Dosen      (semua dosen aktif otomatis akses)│
│   ☑ Tendik     (semua tendik aktif otomatis akses│
│                                                    │
│ Catatan: Untuk peran fungsional (Admin Fakultas,  │
│ Operator, dll), gunakan menu Role-Menu Matrix     │
│ untuk akses granular per menu.                    │
│                                                    │
│ [Save]                                            │
└─────────────────────────────────────────────────┘
```

**Manfaat:**
- ✅ Admin TIK tidak perlu mapping menu_role untuk peran identitas — cuma cek 3 checkbox
- ✅ Visibility tinggi — sekali lihat tahu app dipakai siapa
- ✅ Konsistensi — kalau ada menu baru, otomatis accessible (kalau peran identitas dapat default)
- ✅ Backward compatible — menu_role tetap ada untuk peran fungsional & granular permission

**Effort: 3-4 hari** (DB + backend access check + UI checkbox + seed default mapping).

---

## 5. Database Schema Additions

### 5.1 Tabel baru / kolom baru

**Tabel `man_akses.role_pengguna_template`** (template peran per app):
```
id_template        UUID PK
id_aplikasi        UUID FK
nm_template        VARCHAR (e.g. "Admin Fakultas SIMBAK")
default_id_peran   INT
default_lama_hari  INT (e.g. 365 = 1 tahun)
deskripsi          TEXT
tgl_create, last_update, soft_delete
```

**Tabel `man_akses.role_pengguna_import`** (audit import bulk):
```
id_import          UUID PK
id_aplikasi        UUID FK
id_pengimpor       UUID FK
nama_file          VARCHAR
total_baris        INT
total_sukses       INT
total_gagal        INT
tgl_import         DATETIME
status             VARCHAR (pending/processing/done/failed)
detail_log         TEXT (JSON)
```

**Kolom tambahan di `role_pengguna`** (kalau belum ada):
- `tgl_mulai_berlaku DATETIME` (sudah ada tgl_sk_penugasan, bisa reuse)
- `tgl_dinonaktifkan DATETIME` (timestamp saat auto-deactivate)
- `alasan_nonaktif VARCHAR` (auto: "expired"/"mutasi"/"manual")
- `id_pengganti UUID` (kalau peran ini di-handover ke user lain)

### 5.2 Enhancement existing

- Index baru: `idx_role_pengguna_kadaluarsa` di `tgl_kadarluasa` (untuk cron query cepat)
- Index baru: `idx_role_pengguna_pengguna_app` composite (id_pengguna, id_aplikasi)
- Kolom baru di `man_akses.peran`: `a_peran_identitas BIT DEFAULT 0`
  - Set ke 1 untuk peran 39 (Mahasiswa), 46 (Dosen), 111 (Tenaga Kependidikan)
  - Lifecycle script skip peran dgn flag ini

### 5.3 Tabel `man_akses.aplikasi_default_role` (Pilar 6)

Many-to-many mapping default akses peran identitas per aplikasi:

```
id_aplikasi    UNIQUEIDENTIFIER FK → man_akses.aplikasi
id_peran       INT FK → man_akses.peran (peran identitas: 39/46/111)
a_aktif        BIT DEFAULT 1
tgl_create     DATETIME
last_update    DATETIME
soft_delete    BIT DEFAULT 0
PRIMARY KEY (id_aplikasi, id_peran)
```

Index: `(id_peran, a_aktif)` untuk query cepat saat user login.

---

## 6. UI/UX Wireframe (Konsep)

### 6.1 Halaman "Import Akses Massal" (UPT TIK / Admin App)

```
┌─────────────────────────────────────────────────────────┐
│ Import Akses Massal                                       │
├─────────────────────────────────────────────────────────┤
│ Pilih Aplikasi: [SIMBAK ▼]                                │
│                                                            │
│ Step 1 — Download template:                                │
│ [📥 Download Template Excel SIMBAK]                        │
│                                                            │
│ Step 2 — Upload file yang sudah diisi:                     │
│ [📤 Upload .xlsx]   atau drag-and-drop                      │
│                                                            │
│ Step 3 — Preview & Validasi:                                │
│ ┌──┬─────────────┬─────────────┬──────────┬─────────┐    │
│ │ #│ Username    │ Peran       │ Unit     │ Status  │    │
│ ├──┼─────────────┼─────────────┼──────────┼─────────┤    │
│ │ 1│ admin.smb   │ Admin SIMBAK│ MIPA     │ ✓ Valid │    │
│ │ 2│ user.x      │ Kepala Biro │ -        │ ⚠ Warn  │    │
│ │ 3│ unknown.usr │ Admin App   │ -        │ ❌ Error│    │
│ └──┴─────────────┴─────────────┴──────────┴─────────┘    │
│                                                            │
│ Total: 50 baris  |  Valid: 47  |  Warn: 2  |  Error: 1    │
│                                                            │
│ [Import 47 Valid]  [Cancel]                                │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Halaman "Manajemen Pengguna" per Aplikasi (read-only untuk admin app)

```
┌─────────────────────────────────────────────────────────┐
│ Manajemen Pengguna SIMBAK                                  │
├─────────────────────────────────────────────────────────┤
│ Total: 142 pengguna aktif | Akan expire 30 hari: 8        │
│                                                            │
│ [📥 Export Daftar] [📤 Import Template] [+ Request Akses] │
│                                                            │
│ Filter: [Peran ▼] [Unit ▼] [Status ▼] [Search...]         │
│                                                            │
│ ┌─────┬──────────────┬────────────────┬─────────┬────────┐│
│ │ NIP │ Nama         │ Peran          │ Berlaku │ Aksi   ││
│ ├─────┼──────────────┼────────────────┼─────────┼────────┤│
│ │ ... │ Mizar Z.     │ Developer      │ ∞       │ Lihat ││
│ │ ... │ Admin S.     │ Admin SIMBAK   │ 31/12/26│ Lihat ││
│ │ ... │ Kepala B.    │ Kepala Biro    │ 12/05/26│ ⚠ Lihat││
│ └─────┴──────────────┴────────────────┴─────────┴────────┘│
│                                                            │
│ Catatan: untuk edit/revoke akses, hubungi UPT TIK          │
└─────────────────────────────────────────────────────────┘
```

### 6.3 Notifikasi Otomatis (sample)

**Email/Telegram (30 hari sebelum expire):**
> Yth. Bapak Mizar,
> Akses Bapak sebagai **Admin Fakultas** di aplikasi **SIMBAK** akan berakhir pada tanggal **31 Desember 2026** (30 hari lagi).
> Kalau peran ini masih dibutuhkan, mohon koordinasi dengan UPT TIK untuk perpanjangan SK + extend masa berlaku.
> [Tombol: Ajukan Perpanjangan]

**Email ke admin TIK (mingguan, summary):**
> Daftar peran yang akan expire dalam 30 hari (5 user):
> 1. Admin Fakultas MIPA — Mizar Z. — expire 31/12/26
> 2. Kepala Biro — Y. — expire 15/12/26
> 3. ... 

---

## 7. Roadmap Implementasi

### Phase 1 — Foundation (target: 2.5 minggu)

**P1.0 Klasifikasi Peran Identitas vs Fungsional** (1 hari)
- Tambah kolom `a_peran_identitas` di `man_akses.peran`
- Update flag untuk peran 39/46/111
- Adjust lifecycle script: skip peran dgn flag identitas

**P1.1 Default Access Checklist per Aplikasi** (3-4 hari) — **Pilar 6**
- Buat tabel `man_akses.aplikasi_default_role`
- Backend: modifikasi `checkAppAccess()` cek default access dulu sebelum menu_role
- Frontend: tambah 3 checkbox di Edit Aplikasi modal
- Seed default mapping berdasarkan tabel rekomendasi (~22 app)
- Migrasi: hapus menu_role redundant untuk peran identitas

**P1.2 Bulk Import Template** (5 hari)
- Backend: endpoint `/manakses/import-template/{appId}` (validasi + commit batch)
- Backend: generate template Excel per app (kolom dinamis, ONLY untuk peran fungsional)
- Frontend: halaman upload + preview + commit

**P1.3 Cron Auto-Expire** (1 hari)
- Cron job harian (00:00 WIB)
- Query role_pengguna WHERE tgl_kadarluasa <= TODAY AND a_aktif = 1
   AND peran.a_peran_identitas = 0  -- skip peran identitas
- Soft-deactivate + log + notifikasi

**P1.4 Notifikasi Pre-Expire** (2 hari)
- Cron harian — query expire dalam 30/7/1 hari (hanya peran fungsional)
- Kirim email + Telegram (via existing channel) + in-app

**P1.5 UI per Aplikasi (read-only)** (3 hari)
- Setiap app dapat menu "Manajemen Pengguna [App]"
- Read-only list + filter + search + export
- Tampilkan default access (Mhs/Dosen/Tendik) + assignment fungsional

### Phase 2 — Self-Service & Workflow (target: 2 minggu)

**P2.1 Request Akses dari Admin App** (3 hari)
- Form: pilih user, peran, unit, SK, tgl mulai, tgl expire
- Submit ke queue UPT TIK

**P2.2 Approval UI di UPT TIK** (3 hari)
- Inbox request — list pending dengan filter app
- One-click approve / reject + alasan
- Auto-create role_pengguna setelah approve

**P2.3 Auto-Detect Mutasi/Lulusan** (5 hari)
- Cron baca pdrd.reg_pd.tgl_keluar (mahasiswa lulus → auto-revoke)
- Cron baca pdrd.reg_ptk perubahan id_sms/id_organisasi (mutasi → flag review)
- Notifikasi ke admin app + UPT TIK

**P2.4 Renewal Flow** (3 hari)
- Pengguna bisa request perpanjangan via /portal/profile
- Admin TIK approve → extend tgl_kadarluasa

### Phase 3 — Audit & Compliance (target: 1-2 minggu)

**P3.1 Periodic Recertification** (5 hari)
- Tiap 6 bulan, admin app dapat list user yang harus di-confirm
- Confirm → renewal otomatis, no-confirm → flag deactivation

**P3.2 Audit Dashboard** (3 hari)
- Statistik (top admin modify, penugasan terbaru, akan expire)
- Export audit log

**P3.3 Role Templates** (2 hari)
- Define template per posisi (e.g. "Kepala Bagian" template = role A + B + C)
- Saat assign, admin pilih template, auto-fill fields

### Phase 4 — Advanced (opsional, kuartal berikutnya)

- **SSO Group Sync** dari LDAP/Active Directory (kalau Unila punya)
- **Privileged Access Management** (PAM) untuk akun super
- **Just-in-Time Access** — request akses temporary dengan auto-revoke
- **Anomaly Detection** — peran tidak login 90 hari → kandidat dormant

---

## 8. Effort Estimation

| Phase | Items | Total Effort | Owner |
|---|---|---|---|
| 1.0 Klasifikasi Peran | Flag a_peran_identitas | 1 hari | 1 backend |
| 1.1 Default Access (Pilar 6) | Tabel + checkbox UI + seed mapping | 3-4 hari | 1 backend + 1 frontend |
| 1.2 Bulk Import | Template + endpoint + UI | 5 hari | 1 backend + 1 frontend |
| 1.3 Cron Expire | DB cron + script | 1 hari | 1 backend |
| 1.4 Notifikasi | Email/TG channel | 2 hari | 1 backend |
| 1.5 UI per App | Read-only list | 3 hari | 1 frontend |
| **Phase 1 Total** | | **~2.5-3 minggu** | 2 dev paralel |
| 2.1-2.4 Self-Service | Request + Approve + Auto + Renew | ~14 hari | 2 dev |
| **Phase 2 Total** | | **~2 minggu** | 2 dev paralel |
| 3.1-3.3 Audit | Recert + Dashboard + Templates | ~10 hari | 1 dev + 1 designer |
| **Phase 3 Total** | | **~1-2 minggu** | |
| **TOTAL** | All phases | **~5-7 minggu** | |

---

## 9. Decision Points

Sebelum implementasi, perlu konfirmasi:

1. **Klasifikasi Peran Identitas** — peran 39 (Mhs), 46 (Dosen), 111 (Tendik) ditandai sebagai identitas (di luar SK manual lifecycle). Apakah ada peran identitas lain yang perlu di-include? (mis. Alumni)

2. **Default Access Checklist** (Pilar 6 baru) — setuju implementasi 3 checkbox per app + seed default mapping berdasarkan tabel rekomendasi?

3. **Setiap app punya menu Manajemen Pengguna sendiri (read-only) — setuju?**
   - Pro: admin app tahu siapa punya akses, bisa request perubahan
   - Con: development effort tambah (perlu integrasi UI di tiap app)

2. **Default lama berlaku peran admin/operator: 1 tahun atau 2 tahun?**

3. **Auto-revoke saat mahasiswa lulus / pegawai keluar — langsung atau perlu konfirmasi admin?**
   - Saran: langsung untuk leaver yang clear; flag untuk mover yang ambigu

4. **Notifikasi via apa?**
   - Email — pasti sampai, formal
   - Telegram bot — sudah ada, instan
   - In-app notification — ada di MyUnila, perlu develop bell icon

5. **Approval workflow — per aplikasi ada PIC tersendiri atau semua ke UPT TIK?**
   - Per app: lebih tersebar, scalable
   - Centralized: konsisten, single point of authority

6. **Periodic recertification — per 6 bulan atau 1 tahun?**

7. **Apa fokus prioritas? (kalau resource terbatas)**
   - A: Bulk import dulu (mengurangi beban admin TIK saat onboarding banyak user)
   - B: Auto-expire dulu (mengurangi risiko akses dormant)
   - C: Hybrid UI dulu (visibility per app)

---

## 10. Risk & Mitigation

| Risk | Severity | Mitigation |
|---|---|---|
| User tidak bisa login karena role auto-expire saat masih perlu | High | Notifikasi 30/7/1 hari sebelum, approval renewal cepat |
| Bulk import error → ratusan user dapat akses salah | High | Preview & validasi WAJIB sebelum commit, transaction rollback kalau error |
| Admin app salah submit request → akses palsu approved | Medium | Two-eye principle: requester ≠ approver |
| Auto-detect false positive (mutasi tapi masih butuh akses lama) | Medium | Flag sebagai review, bukan langsung revoke |
| Admin TIK overwhelmed dengan request | Medium | Self-service template (no approval needed kalau via template terstandar) |
| Data SK tidak konsisten | Low | Wajib field saat input, validasi tanggal |

---

## 11. Komparasi Pendekatan

### A. Manual Per User (sekarang)
- ✅ Sederhana, no infrastruktur tambahan
- ❌ Tidak skalabel
- ❌ Rawan lupa revoke
- ❌ Tidak ada audit

### B. Bulk Import + Auto-Expire (Phase 1)
- ✅ Hemat waktu admin TIK
- ✅ Otomatis revoke
- ✅ Konsisten format data
- ⚠ Perlu develop UI + cron + template

### C. Hybrid Self-Service (Phase 1+2)
- ✅ Admin app tidak perlu nunggu UPT TIK
- ✅ Workflow approval terstruktur
- ✅ Audit trail otomatis
- ⚠ Perlu integrasi UI per app + workflow engine

### D. Full Automation (Phase 1+2+3+4)
- ✅ Mandiri, minimal manual intervention
- ✅ Compliance-ready
- ⚠ Perlu LDAP/AD sync (kalau ada)
- ⚠ Effort 3-4 bulan

**Saran:** Mulai dengan **B+C** (Phase 1+2) — sweet spot effort-vs-value. **D** kalau Unila siap full transformasi compliance.

---

## 12. Centralized vs Distributed — Pertanyaan Bapak

> "Apakah setiap apps ada menu manajemen akses atau di apps manajemen akses aja terpusat dan hanya bisa diakses oleh dev tik?"

**Saran: HYBRID** (kombinasi — bukan salah satu).

| Tempat | Yang bisa dilakukan | Akses |
|---|---|---|
| **Manajemen Akses (terpusat)** | CRUD master peran, role_pengguna, approval workflow, bulk import, audit | UPT TIK Developer + admin TIK |
| **Per Aplikasi (read-only + request)** | Lihat list pengguna app-nya, export daftar, request tambah/revoke, import via template | Admin app (PIC fakultas/biro) |

**Mengapa hybrid?**
- ✅ **Sentralisasi master data** — single source of truth, audit konsisten
- ✅ **Operational visibility** — admin app tahu siapa yang punya akses ke app-nya tanpa perlu nanya UPT TIK
- ✅ **Self-service via template** — admin app bisa import 50 user sendiri (validated by system) tanpa nunggu UPT TIK approve satu-satu
- ✅ **Tetap aman** — direct edit (revoke/grant individual) hanya di Manajemen Akses pusat dengan workflow

---

## 13. Kesimpulan

**Rekomendasi:** Implementasikan **Phase 1 (~2.5-3 minggu) sebagai prioritas tertinggi** karena:

1. **Klasifikasi peran identitas vs fungsional** memperjelas scope lifecycle management — yang inherent (mhs/dosen/tendik) tidak perlu SK + expire manual
2. **Default Access Checklist** (Pilar 6 baru) — admin TIK tinggal centang 3 box per app, gak perlu mapping menu_role satu-satu untuk peran identitas
3. **Bulk import** untuk peran fungsional mengurangi beban admin TIK 80% saat penugasan baru
4. **Auto-expire** mengurangi risiko akses dormant tanpa effort tambahan
5. **Notifikasi pre-expire** mencegah disrupsi mendadak (user tidak bisa login)
6. **UI read-only per app** memberi visibility ke admin app tanpa breaking permission boundary

**Phase 2 (~2 minggu)** menambahkan self-service + workflow approval untuk full hybrid model.

**Phase 3-4** untuk compliance jangka panjang (audit, recertification).

Total **~5-7 minggu** untuk transformasi end-to-end Manajemen Akses MyUnila dari per-akun manual ke modern lifecycle management dengan default access otomatis.

**Quick win paling impactful:** Pilar 6 (Default Access Checklist, ~3-4 hari) — langsung menyederhanakan management akses peran identitas yang selama ini jadi pain point utama.

---

*Dokumen ini disusun oleh **Tim Pengembangan Sistem Informasi dan Integrasi Data MyUnila** untuk pertimbangan pimpinan UPT TIK / Wakil Rektor 4 dalam tata kelola akses pengguna sistem MyUnila.*
