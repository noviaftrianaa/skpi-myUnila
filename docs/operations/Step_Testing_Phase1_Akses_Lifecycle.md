# Panduan Testing Phase 1 — Akses Lifecycle Management

**Versi**: 1.0 — 2026-05-08
**Lingkungan**: Staging (VM5 — pdut_staging)
**Tester**: UPT TIK Universitas Lampung
**PIC Implementasi**: UPT TIK Universitas Lampung

---

## 1. Ringkasan Phase 1

Phase 1 adalah implementasi pertama dari 7-phase plan **Tata Kelola Akses Pengguna myUnila** dengan model **Hybrid Centralized-Distributed**:

| Modul | Deskripsi |
|------|-----------|
| **Pilar 6** | Default Access Checklist per Aplikasi — peran identitas (Mhs/Dosen/Tendik) dapat akses default tanpa mapping menu_role |
| **Lifecycle Manual** | Tombol Perpanjang & Cabut Role di Manajemen Akses Pusat untuk peran fungsional |
| **Kandidat Detection** | List user yang perlu di-review by kategori (alumni lulus, mutasi, expired, akan expire, tanpa kadaluarsa) |
| **Bulk Import** | Upload CSV untuk assign role secara batch ke peran fungsional |

---

## 2. Persiapan Testing

### 2.1 Akun Tester
Login sebagai akun dengan peran **Developer** (id_peran = 107) atau peran lain dengan flag `a_universal = 1`.

URL staging: **http://192.168.120.45:3000** (atau domain staging Bapak)

### 2.2 Browser
Direkomendasikan: **Chrome / Edge** versi terbaru. Test juga di mobile responsive (DevTools).

### 2.3 Acceptance Criteria
Setiap step harus:
- ✅ **PASS** — perilaku sesuai expected
- ❌ **FAIL** — perilaku tidak sesuai → catat issue ke template di bagian akhir

---

## 3. Test Scenario 1: Tab "Akses Default" di Edit Aplikasi

**Modul**: Phase 1.3 — Frontend checkbox identitas
**Estimasi waktu**: 5 menit

### Step 1.1 Buka Daftar Aplikasi
1. Login → klik **Manajemen Akses** di portal myUnila
2. Sidebar → **Manajemen** → **Daftar Aplikasi**

**Expected**: Tabel daftar aplikasi tampil, sortir default `tgl_create DESC, nm_aplikasi ASC`.

### Step 1.2 Buka Edit Aplikasi
1. Cari aplikasi **SIAKADU** (search: "siakadu")
2. Klik kebab menu (**⋮**) → **Edit**

**Expected**: Modal "Edit Aplikasi" terbuka dengan tabs: Info Dasar, Portal, Pengaturan, Menu Aplikasi, **Akses Default**, (Akses Organisasi jika filter aktif).

### Step 1.3 Cek Tab Akses Default
1. Klik tab **Akses Default**

**Expected**:
- Header info "Akses Default Peran Identitas" dengan ikon shield biru
- 3 kartu peran:
  - **Mahasiswa** (biru, ikon academic-cap) — sudah dicentang ✓ (default seed)
  - **Dosen** (hijau, ikon user-group) — sudah dicentang ✓
  - **Tenaga Kependidikan** (ungu, ikon identification) — TIDAK dicentang
- Footer: "Pengaturan akses default tersimpan otomatis ketika di-Simpan"

### Step 1.4 Toggle Centang
1. Klik kartu **Tenaga Kependidikan** (centang)

**Expected**:
- Kartu Tendik berubah jadi ungu solid + ring + checkmark
- Footer berubah: "Ada perubahan belum disimpan" (warna amber)
- Tombol "Simpan Akses Default" enabled

### Step 1.5 Simpan Perubahan
1. Klik tombol **Simpan Akses Default**

**Expected**:
- Loading spinner muncul di tombol
- Sukses: muncul box hijau "Akses default berhasil disimpan."
- Footer kembali normal

### Step 1.6 Refresh & Verify
1. Tutup modal, buka lagi (Edit SIAKADU → tab Akses Default)

**Expected**: 3 peran tercentang semua (Mhs, Dosen, Tendik) — perubahan persistent.

### Step 1.7 Rollback (penting untuk testing berulang)
1. Uncentang kembali Tenaga Kependidikan
2. Simpan

**Expected**: Kembali ke kondisi awal (Mhs + Dosen saja).

---

## 4. Test Scenario 2: Akses Pengguna per Aplikasi (Read-Only)

**Modul**: Phase 1.4 — Per-app akses pengguna page
**Estimasi waktu**: 5 menit

### Step 2.1 Akses dari Tabel Aplikasi
1. Sidebar → **Manajemen** → **Daftar Aplikasi**
2. Cari aplikasi **SIAKADU**
3. Klik kebab menu (**⋮**) → **Akses Pengguna**

**Expected**: Halaman baru `/dashboard/manajemen-akses/manajemen/aplikasi/{id}/akses-pengguna`. Title bar tampilkan "SIAKADU" + breadcrumb Manajemen Akses › Aplikasi › Akses Pengguna.

### Step 2.2 Cek Summary Cards (4 kartu di atas)
**Expected**:
- **Total Pengguna**: angka besar (puluhan ribu)
- **Akses Identitas**: subset besar (mhs + dosen)
- **Akses Fungsional**: subset kecil (admin SIMBAK, dll)
- **Universal**: angka kecil (Developer + super role)

### Step 2.3 Filter by Peran
1. Lihat row chip "Peran dengan Akses" di bawah summary
2. Klik chip **Mahasiswa**

**Expected**:
- Tabel hanya tampil user dgn peran Mahasiswa
- Chip "Mahasiswa" highlight dengan ring + count badge

### Step 2.4 Filter by Sumber Akses
1. Klik dropdown **Semua sumber akses** → pilih **Identitas (default)**

**Expected**: Tabel filter ke baris dengan label "Identitas" (badge biru).

### Step 2.5 Search User
1. Ketik nama user di search box (mis. "AMANDA")

**Expected**: Tabel filter ke user yang nama/username/email mengandung kata kunci.

### Step 2.6 Pagination
1. Set "Per halaman" = 10
2. Klik **Berikutnya**

**Expected**: Halaman ganti, count info berubah, tombol "Sebelumnya" enable.

### Step 2.7 Cek Footer Info
**Expected**: Info banner biru di bawah dengan teks "Halaman ini bersifat read-only..."

---

## 5. Test Scenario 3: Sidebar Manajemen Akses

**Modul**: Phase 1.5 + 1.6 — Menu sidebar baru
**Estimasi waktu**: 1 menit

### Step 3.1 Cek Sidebar
1. Sidebar Manajemen Akses → expand grup **Manajemen**

**Expected**: 13 menu items dengan urutan:
| # | Menu |
|---|------|
| 1-11 | (existing menu — Daftar Pengguna, Daftar Aplikasi, dll) |
| **12** | **Kandidat Review Akses** (ikon user-circle) |
| **13** | **Bulk Import Akses** (ikon document-arrow-up) |

---

## 6. Test Scenario 4: Kandidat Review Akses

**Modul**: Phase 1.5 — Kandidat + Perpanjang/Revoke
**Estimasi waktu**: 15 menit

### Step 4.1 Buka Halaman
1. Sidebar → **Manajemen** → **Kandidat Review Akses**

**Expected**:
- Title "Kandidat Review Akses" + breadcrumb
- 5 kategori card di atas:
  - **Alumni Lulus** (biru) — id_jns_keluar=1 + sk_yudisium
  - **Keluar/Mutasi** (amber) — id_jns_keluar selain 1
  - **Sudah Expired** (merah) — tgl_kadaluarsa < hari ini
  - **Akan Expire** (orange) — tgl_kadaluarsa ≤ 30 hari
  - **Tanpa Tgl Kadaluarsa** (abu) — peran fungsional belum di-set
- Default kategori: **Alumni Lulus** (active state)

### Step 4.2 Tab Alumni
1. Pastikan kategori Alumni Lulus aktif

**Expected**:
- Loading spinner singkat
- Tabel muncul dengan **±48,172 data** kandidat alumni
- Kolom: checkbox, Pengguna (avatar inisial), Peran, Unit, **Tgl Lulus**, **SK Yudisium**
- Sample row: AMANDA PUTRA FEBRIANSYAH (2212011622), Mahasiswa, lulus 2026-04-02, SK 2094/UN26/PP.06.03/2026
- Pagination "1-25 dari 48172"

### Step 4.3 Search Alumni
1. Ketik "AMANDA" di search

**Expected**: Filter ke alumni dengan nama mengandung "AMANDA".

### Step 4.4 Bulk Select & Cabut Role
1. Centang checkbox 2-3 baris alumni
2. Tombol **"Cabut Role"** (merah, ikon no-symbol) muncul
3. Klik tombol

**Expected**:
- Modal "Cabut Role Pengguna" terbuka
- Field "Alasan Pencabutan *" (textarea wajib)
- Tombol "Cabut" disabled hingga alasan diisi
4. Isi alasan: "Mhs sudah lulus pada periode wisuda 2026/I — testing"
5. Klik **Cabut**

**Expected**:
- Loading spinner
- Toast sukses: "X/Y role berhasil dicabut"
- Modal close, tabel refresh, baris yang dicabut hilang
- ⚠️ **CATATAN**: ini soft-delete, bisa restore manual via SSMS jika perlu

### Step 4.5 Tab Mutasi
1. Klik kartu **Keluar/Mutasi**

**Expected**:
- Tabel ±11,108 data
- Kolom extra: Tgl Keluar, **Jenis Keluar** (badge amber, contoh "Mengajukan pengunduran diri")
- Sample: YUMNA OWENA TIFFANI (2217031104), VASCO MARIO SIREGAR

### Step 4.6 Tab Akan Expire
1. Klik kartu **Akan Expire**

**Expected** (di staging mungkin kosong karena belum ada user di-set tgl_kadaluarsa):
- Empty state: ikon check-circle hijau + teks "Tidak ada kandidat di kategori 'Akan Expire'"
- Atau jika ada: kolom extra **Sisa** (misal "15 hari") badge orange

### Step 4.7 Tab Sudah Expired
1. Klik kartu **Sudah Expired**

**Expected** (mungkin kosong di staging):
- Empty state, atau jika ada: kolom **Overdue** (misal "30 hari") badge merah

### Step 4.8 Tab Tanpa Tgl Kadaluarsa (perpanjang flow)
1. Klik kartu **Tanpa Tgl Kadaluarsa**

**Expected**: Tabel ±3,496 row (peran fungsional belum punya masa berlaku).

### Step 4.9 Bulk Perpanjang
1. Centang 2 baris
2. Tombol **"Set Tgl Kadaluarsa"** (biru, ikon arrow-path) muncul
3. Klik tombol

**Expected**:
- Modal terbuka
- Field **Tanggal Kadaluarsa Baru** sudah pre-filled = hari ini + 1 tahun
- Field optional: Nomor SK, Tgl SK, Alasan
4. Edit Nomor SK: "SK-TEST/UN26/2026"
5. Klik **Simpan**

**Expected**:
- Toast sukses: "X/Y role berhasil diperpanjang"
- Modal close, tabel refresh, baris yg diperpanjang hilang dari kategori "Tanpa Tgl Kadaluarsa"
- Cek tab **Akan Expire** → baris tsb seharusnya pindah kesini

---

## 7. Test Scenario 5: Bulk Import Akses (CSV)

**Modul**: Phase 1.6 — Bulk import template
**Estimasi waktu**: 10 menit

### Step 5.1 Buka Halaman
1. Sidebar → **Manajemen** → **Bulk Import Akses**

**Expected**: Halaman 3 step (Pilih Aplikasi → Upload CSV → Preview).

### Step 5.2 Download Template
1. Step 1: dropdown "Aplikasi Target" → pilih **SI MBAK**
2. Klik **Download Template CSV**

**Expected**:
- Loading singkat
- File `template_import_role_si-mbak.csv` ter-download
- Toast sukses

### Step 5.3 Cek Isi Template
1. Buka file CSV di Excel / text editor

**Expected**:
- BOM UTF-8 di awal (Excel terbaca rapi)
- Comment lines diawali `#`:
  - "# Template Bulk Import Role Pengguna - SI MBAK"
  - "# Petunjuk: ..."
  - "# Daftar peran fungsional yg valid:"
  - "# id_peran=X : nama peran" (list peran SIMBAK)
- Header: `username,id_peran,id_organisasi,no_sk,tgl_sk,tgl_kadaluarsa,keterangan`
- 1 sample row

### Step 5.4 Edit Template & Upload (dummy data)
1. Hapus sample row
2. Isi 3 baris dummy:
```csv
mizar.zulmi,108,,SK-TEST-001,2026-05-08,2027-05-08,Test 1
nim_invalid,108,,SK-TEST-002,2026-05-08,2027-05-08,Test 2 (user invalid)
mizar.zulmi,108,,SK-TEST-003,2026-05-08,2027-05-08,Test 3 (duplikat)
```
3. Save sebagai CSV
4. Step 2: drag-drop atau klik upload box
5. Klik **Preview & Validasi**

**Expected**:
- Loading spinner
- Step 3 muncul dengan summary:
  - Total Baris: 3
  - Valid: 1 (baris pertama)
  - Error: 1 (baris ke-2 — username tidak ditemukan)
  - Duplikat: 1 (baris ke-3 jika user sudah punya peran 108)
- Tabel preview dengan badge status warna-warni
- Tombol **Commit Import** menampilkan "Commit Import (1 baris OK)"

### Step 5.5 Filter Preview
1. Klik tab filter **Error**

**Expected**: Hanya tampil baris dengan status error + pesan error di kolom "Pesan".

2. Klik tab **Duplikat**

**Expected**: Hanya tampil baris dengan status duplikat.

### Step 5.6 Commit Import (testing)
1. Klik **Commit Import (1 baris OK)**

**Expected**:
- Confirm dialog: "Commit import 1 baris OK ke database?"
- Klik OK
- Toast: "1 role berhasil di-import!"
- Preview hilang, file ter-reset

### Step 5.7 Verify Insert
1. Sidebar → **Daftar Pengguna** → cari "mizar.zulmi"
2. Buka detail user

**Expected**: Daftar role-pengguna user tsb sekarang ada peran 108 dengan SK-TEST-001 + tgl_kadaluarsa 2027-05-08.

### Step 5.8 Cleanup (penting!)
1. Hapus role test yg baru di-insert (via UI Daftar Pengguna → Edit role → Delete)

**Expected**: Role test ter-hapus, kembali ke kondisi awal user.

---

## 8. Bonus Test: Peran Identitas Auto-Sync

**Konteks**: Peran Mhs/Dosen/Tendik OUT-OF-SCOPE lifecycle (auto-sync via SSO/Radius cron malam). Validasi flag `a_peran_identitas` mencegah pemanggilan tidak sengaja.

### Step 6.1 Coba Hapus Peran Identitas via Bulk Import
1. Buat CSV dengan id_peran=39 (Mahasiswa)

**Expected**:
- Validasi error: "id_peran=39 adalah peran identitas — tidak boleh di-import (auto via SSO)"
- Status row: **error**

### Step 6.2 Coba Set tgl_kadaluarsa untuk Peran Identitas
1. Di halaman Kandidat Review Akses → tab **Tanpa Tgl Kadaluarsa**

**Expected**: Daftar tidak include peran identitas (filter `a_peran_identitas = 0` di backend).

---

## 9. Bug / Issue Reporting Template

Jika ditemukan bug saat testing, mohon catat dengan format:

```
[BUG #X]
Step: [contoh: 4.4 Bulk Cabut Role]
Expected: [yang seharusnya terjadi]
Actual: [yang terjadi]
Browser: [Chrome 130 / Firefox / dll]
Screenshot: [attach]
Console error: [F12 → Console tab, copy text error jika ada]
Network response: [F12 → Network tab, klik request gagal, copy response]
```

Kirim ke chat Telegram atau https://helpdesktik.unila.ac.id

---

## 10. Sign-Off Checklist

Setelah semua scenario selesai, tester centang:

- [ ] Scenario 1: Tab Akses Default — semua 7 step PASS
- [ ] Scenario 2: Akses Pengguna read-only — semua 7 step PASS
- [ ] Scenario 3: Sidebar 2 menu baru tampil — PASS
- [ ] Scenario 4: Kandidat Review Akses — semua 9 step PASS
- [ ] Scenario 5: Bulk Import — semua 8 step PASS
- [ ] Scenario 6 (Bonus): Validasi peran identitas — PASS

**Tester**: _________________________________
**Tanggal**: ________________________________
**Tanda tangan**: ___________________________

---

## 11. Rencana Setelah Sign-Off Staging

1. ✅ Staging UAT signed
2. Backup pdut production via SQL Server backup
3. Apply 5 DDL SQL ke pdut production:
   - alter_peran_add_a_peran_identitas.sql
   - create_aplikasi_default_role.sql
   - seed_aplikasi_default_role.sql
   - alter_role_pengguna_add_tgl_kadaluarsa.sql
   - insert_menu_kandidat_akses.sql
4. Rebuild auth-service di VM1
5. Rebuild frontend di VM2
6. Smoke test 5 scenario di production
7. Tutorial untuk admin TIK lainnya (15 menit walkthrough)

---

**Dokumen ini auto-generated oleh tools internal — versi terkini selalu di**
**`/var/www/my-unila/docs/operations/Step_Testing_Phase1_Akses_Lifecycle.md`**
