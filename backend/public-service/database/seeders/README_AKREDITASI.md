# Akreditasi Data Management - Panduan Penggunaan

## Overview

System ini mengelola data akreditasi dari 3 sumber:
1. **BANPT API** - Data akreditasi terlengkap dan terupdate
2. **PDDikti API** - Data deskripsi prodi (visi, misi, deskripsi_singkat, capaian_belajar)
3. **SISTER Database** - Database produksi Unila

## Workflow Rekomendasi

### Best Practice: One Command Workflow

Jalankan seeder dengan flag `--fetch` dan `--update` untuk proses lengkap:

```bash
php artisan db:seed --class=AkreditasiMergeSeeder --fetch --update
```

Workflow ini akan:
1. ✅ **Fetch** data terbaru dari BANPT API (otomatis)
2. ✅ **Load** data dari PDDikti (jika ada)
3. ✅ **Merge** data BANPT + PDDikti
4. ✅ **Compare** dengan data SISTER
5. ✅ **Preview** perubahan (sampling)
6. ✅ **Konfirmasi** sebelum update
7. ✅ **Update** database jika disetujui

## Mode Penggunaan

### 1. Preview Only (Default)

Hanya melihat perubahan tanpa update database:

```bash
php artisan db:seed --class=AkreditasiMergeSeeder
```

**Output:**
- Preview perubahan (sampling 5 record pertama)
- Summary total perubahan
- Export ke JSON untuk review detail
- Generate laporan lengkap

### 2. Fetch + Preview

Fetch data terbaru dari API, lalu preview:

```bash
php artisan db:seed --class=AkreditasiMergeSeeder --fetch
```

**Proses:**
1. Jalankan `scripts/fetch_banpt_api.py` otomatis
2. Check file PDDikti (warn jika > 30 hari)
3. Load semua data
4. Preview perubahan

### 3. Preview + Update (dengan Konfirmasi)

Preview lalu tanya konfirmasi sebelum update:

```bash
php artisan db:seed --class=AkreditasiMergeSeeder --update
```

**Proses:**
1. Preview perubahan
2. Tampilkan summary
3. **Konfirmasi: "Do you want to update the database?"**
4. Jika YES → update database
5. Jika NO → batalkan

### 4. Full Workflow (Fetch + Update)

Fetch data baru + preview + update dengan konfirmasi:

```bash
php artisan db:seed --class=AkreditasiMergeSeeder --fetch --update
```

## Output Files

Setiap kali dijalankan, system akan generate 2 file:

### 1. prodi_merged_data.json
File JSON berisi data gabungan BANPT + PDDikti

**Location:** `database/data/prodi_merged_data.json`

**Content:**
```json
[
  {
    "nama_prodi": "Teknik Informatika",
    "jenjang": "S1",
    "akreditasi": "Unggul",
    "no_sk": "12345/SK/BAN-PT/...",
    "tahun_sk": "2023",
    "tanggal_kadaluarsa": "2028-12-31",
    "deskripsi_singkat": "...",
    "visi": "...",
    "misi": "...",
    "capaian_belajar": "...",
    "source_akreditasi": "banpt_api",
    "source_deskripsi": "pddikti_api"
  }
]
```

### 2. akreditasi_changes_report.txt
Laporan detail perubahan dalam format text readable

**Location:** `database/data/akreditasi_changes_report.txt`

**Content:**
- **Statistik** - Total perubahan, prodi baru, tidak berubah
- **Detail UPDATED** - Semua prodi dengan perubahan akreditasi
- **Detail NEW** - Prodi baru di BANPT yang belum ada di SISTER
- **Detail NOT MATCHED** - Prodi di SISTER tapi tidak di BANPT

**Example Output:**
```
================================================================================
LAPORAN PERUBAHAN AKREDITASI
Comparison: BANPT (New) vs SISTER (Current)
Generated: 2025-11-13 22:03:15
================================================================================

STATISTIK:
--------------------------------------------------------------------------------
Total prodi di BANPT                   :   122
Akreditasi berubah (UPDATED)            :    91
Prodi baru di BANPT (NEW)               :    23
Akreditasi tidak berubah                :     8
Prodi di SISTER tapi tidak di BANPT     :    29
```

## Preview Output (Terminal)

### Sample Preview di Terminal:

```
=================================================================
PREVIEW PERUBAHAN AKREDITASI (SAMPLING)
=================================================================

Akreditasi yang Berubah (showing 5 of 91):

  1. Teknik Informatika (S1)
     Kode: 55201
     Akreditasi: Baik Sekali → UNGGUL
     No SK: 1234/SK... → 5678/SK...
     Kadaluarsa: 2026-05-15 → 2029-12-31

  2. Ilmu Hukum (S1)
     Kode: 62201
     Akreditasi: B → A
     No SK: 3456/SK... → 7890/SK...
     Kadaluarsa: 2025-06-20 → 2028-06-20

  ... dan 86 lainnya

Prodi Baru di BANPT (showing 3 of 23):

  1. Data Science (S1) - Unggul
  2. Cyber Security (S1) - Baik Sekali
  3. AI dan Machine Learning (S1) - Baik
  ... dan 20 lainnya

=================================================================
SUMMARY
=================================================================
Total prodi from BANPT: 122
  - Updated (changed):     91
  - New (not in SISTER):   23
  - Unchanged (same):      8
  - Not matched (in SISTER but not in BANPT): 29
```

## Python Scripts

### 1. fetch_banpt_api.py
**Location:** `scripts/fetch_banpt_api.py`

**Function:** Fetch data akreditasi dari BANPT JSON API

**Manual Run:**
```bash
cd backend/dashboard-service
python scripts/fetch_banpt_api.py
```

**Output:** `database/data/banpt_akreditasi_unila.json`

### 2. fetch_pddikti_desc.py
**Location:** `scripts/fetch_pddikti_desc.py`

**Function:** Fetch deskripsi prodi dari PDDikti API

**Manual Run:**
```bash
cd backend/dashboard-service
python scripts/fetch_pddikti_desc.py
```

**Output:** `database/data/pddikti_prodi_deskripsi.json`

**Note:** File ini jarang berubah, tidak perlu di-fetch setiap kali. Seeder akan warn jika file > 30 hari.

## Database Update Strategy

### What Gets Updated?

Seeder hanya update tabel: **`pdrd.akreditasi_prodi`**

**Fields yang diupdate:**
- `id_akred` - ID akreditasi (mapping dari nama akreditasi)
- `sk_akreditasi_prodi` - Nomor SK
- `tanggal_sk_akreditasi_prodi` - Tanggal SK
- `tst_sk_akreditasi_prodi` - Tanggal kadaluarsa
- `a_aktif` - Status aktif (set ke 1)
- `last_update` - Timestamp update

### What Does NOT Get Updated?

❌ **Deskripsi data (visi, misi, deskripsi_singkat, capaian_belajar)**
- Alasan: Table `pdrd.sms` tidak memiliki kolom untuk data ini
- Solusi: Data ini di-export ke JSON untuk reference

❌ **Prodi baru yang belum ada di SISTER**
- Alasan: Insert prodi baru butuh data lengkap dari SISTER (fakultas, dll)
- Solusi: Review manual diperlukan untuk prodi baru

### Update Logic

**Scenario 1: Prodi sudah punya akreditasi**
```php
UPDATE pdrd.akreditasi_prodi
SET id_akred = ?, sk_akreditasi_prodi = ?, ...
WHERE id_akreditasi_prodi = ?
```

**Scenario 2: Prodi belum punya akreditasi**
```php
INSERT INTO pdrd.akreditasi_prodi
(id_akreditasi_prodi, id_sms, id_akred, sk_akreditasi_prodi, ...)
VALUES (?, ?, ?, ?, ...)
```

## Troubleshooting

### Error: "BANPT data not found"
**Solution:**
```bash
python scripts/fetch_banpt_api.py
```

### Error: "PDDikti description data not found"
**Solution:**
```bash
python scripts/fetch_pddikti_desc.py
```

### Error: "Array to string conversion"
**Problem:** Bug di seeder (sudah diperbaiki)
**Check:** Pastikan semua `count()` sudah dalam variable sebelum di-print

### Perubahan tidak sesuai
**Check:**
1. Review file `akreditasi_changes_report.txt`
2. Review file `prodi_merged_data.json`
3. Jika ada masalah matching, check function `makeKey()` di seeder

## Data Matching Strategy

### Matching Key Format
```
NAMA_PRODI|JENJANG
```

**Example:**
- `TEKNIK INFORMATIKA|S1`
- `ILMU HUKUM|S2`
- `MANAJEMEN INFORMATIKA|D-III`

### Jenjang Normalization
```php
D3 → D-III
D4 → D-IV
Sarjana → S1
Magister → S2
Doktor → S3
```

### Case Insensitive Matching
- Semua nama prodi di-uppercase
- Spasi multiple di-normalize

## Maintenance

### Regular Tasks

**Monthly:**
```bash
# Fetch data terbaru + update
php artisan db:seed --class=AkreditasiMergeSeeder --fetch --update
```

**Quarterly (atau jika banyak perubahan kurikulum):**
```bash
# Re-fetch deskripsi prodi
python scripts/fetch_pddikti_desc.py
```

### Cleanup Old Files

Files yang aman dihapus (generated setiap run):
- `database/data/prodi_merged_data.json`
- `database/data/akreditasi_changes_report.txt`

Files yang harus dijaga (source data):
- `database/data/banpt_akreditasi_unila.json`
- `database/data/pddikti_prodi_deskripsi.json`

## FAQ

### Q: Berapa lama proses fetch dari BANPT?
**A:** ~5-10 detik (API endpoint, bukan scraping)

### Q: Apakah bisa rollback setelah update?
**A:** Ya, gunakan transaction rollback atau restore backup database

### Q: Kenapa ada prodi yang "Not Matched"?
**A:** Kemungkinan:
1. Prodi sudah tidak aktif di BANPT
2. Nama prodi berbeda antara SISTER dan BANPT
3. Prodi baru di SISTER belum terakreditasi

### Q: Bagaimana handle prodi baru?
**A:** Review manual diperlukan. Check file `akreditasi_changes_report.txt` section "PRODI BARU DI BANPT"

## Contact & Support

Untuk pertanyaan atau issue, hubungi tim IT Unila.

---

**Last Updated:** 2025-11-13
**Version:** 1.0
