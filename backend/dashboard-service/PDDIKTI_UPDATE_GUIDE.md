# 🚀 Quick Start: Update Akreditasi dari PDDikti

Panduan cepat untuk update data akreditasi Universitas Lampung dan Program Studi menggunakan PDDikti API + Laravel Seeder.

---

## ⚡ Quick Start (Automated)

### Windows:

```bash
cd backend/dashboard-service
scripts\update_pddikti.bat
```

### Linux/Mac:

```bash
cd backend/dashboard-service
chmod +x scripts/update_pddikti.sh
./scripts/update_pddikti.sh
```

Script akan otomatis:
1. ✅ Check Python dependencies
2. ✅ Fetch data dari PDDikti API
3. ✅ Generate JSON files
4. ✅ Run Laravel Seeder
5. ✅ Clear cache

---

## 📝 Manual Step-by-Step

### 1. Install Python Dependencies

```bash
cd backend/dashboard-service/scripts
pip install -r requirements.txt
```

### 2. Fetch Data dari PDDikti

```bash
cd backend/dashboard-service
python scripts/fetch_pddikti_data.py
```

**Output:**
- `database/data/pddikti_unila_akreditasi.json`
- `database/data/pddikti_prodi_akreditasi.json`
- `database/data/pddikti_summary.json`

### 3. Review Data (Optional)

```bash
# Windows
type database\data\pddikti_summary.json

# Linux/Mac
cat database/data/pddikti_summary.json
```

### 4. Run Laravel Seeder

```bash
docker exec myunila-dashboard-service php artisan db:seed --class=PDDiktiAkreditasiSeeder
```

### 5. Clear Cache

```bash
docker exec myunila-dashboard-service php artisan cache:clear
```

### 6. Verify

Test API endpoint:

```bash
curl http://localhost:9800/dashboard-service/public/api/v1/unila/profile | jq '.data.akreditasi'
```

---

## 📊 Expected Output

### Python Script Output:

```
============================================================
🚀 PDDikti Data Fetcher for Universitas Lampung
============================================================
🔍 Searching for Universitas Lampung...
✓ Found 1 results
✓ Found: Universitas Lampung
🔍 Fetching detailed data for PT ID: xxxxx
✓ University data fetched successfully

🔍 Searching for Unila study programs...
✓ Found 89 study programs
  [1/89] Fetching: Teknik Sipil... ✓
  [2/89] Fetching: Ekonomi Pembangunan... ✓
  [3/89] Fetching: Ilmu Hukum... ✓
  ...
  [89/89] Fetching: Magister Manajemen... ✓

✓ Successfully fetched 89 study programs

📝 Exporting data to JSON...
✓ University data exported to: database/data/pddikti_unila_akreditasi.json
✓ Study programs data exported to: database/data/pddikti_prodi_akreditasi.json
✓ Summary exported to: database/data/pddikti_summary.json

📊 FETCH SUMMARY
============================================================

🏛️  Universitas Lampung:
   Nama: Universitas Lampung
   Akreditasi: A
   Status: Aktif

📚 Study Programs: 89

   By Accreditation:
   - A: 15
   - B: 45
   - C: 20
   - Belum Akreditasi: 9

   By Level:
   - S1: 65
   - S2: 18
   - S3: 6

============================================================

✅ Data fetch completed successfully!
📁 Output directory: database/data
```

### Seeder Output:

```
🚀 Starting PDDikti Akreditasi Seeder...

🏛️  Seeding University Accreditation...
   University: Universitas Lampung
   ✓ University accreditation inserted
     - Akreditasi: A (id_akred: 1)
     - SK: 1063/SK/BAN-PT/Ak-PPJ/PT/XII/2021
     - Valid until: 2026-12-21

📚 Seeding Study Program Accreditation...
   Found 89 study programs
 89/89 [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%
   ✓ Inserted: 85
   ℹ️  Skipped (already exists): 0
   ⚠️  Errors/Not Found: 4

✅ PDDikti Akreditasi Seeder completed successfully!
```

---

## 🔄 Jadwal Update Berkala

### Rekomendasi:
- **Bulanan**: Update setiap awal bulan
- **Semester**: Update setiap awal semester
- **On-demand**: Update ketika ada informasi perubahan akreditasi

### Setup Cron Job (Linux/Mac):

```bash
# Edit crontab
crontab -e

# Add line (run every 1st of month at 2 AM)
0 2 1 * * cd /path/to/my-unila/backend/dashboard-service && ./scripts/update_pddikti.sh >> /var/log/pddikti_update.log 2>&1
```

### Setup Task Scheduler (Windows):

1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Monthly, 1st day, 2:00 AM
4. Action: Run `C:\path\to\backend\dashboard-service\scripts\update_pddikti.bat`
5. Settings: Run whether user is logged on or not

---

## 🔍 Troubleshooting

### ❌ Error: pddiktipy not installed

```bash
pip install pddiktipy
```

### ❌ Error: No module named 'pddiktipy'

Install menggunakan Python 3:

```bash
python3 -m pip install pddiktipy
```

### ❌ Error: Connection timeout

- Check internet connection
- PDDikti API might be down
- Try again later

### ⚠️ Warning: Program not found in database

Beberapa nama prodi di PDDikti mungkin berbeda dengan database lokal.

**Solusi:**
1. Check JSON file untuk lihat nama lengkap
2. Update nama di database atau tambahkan alias
3. Manual insert untuk yang tidak cocok

### ⚠️ Warning: Akreditasi already exists

Data sudah ada di database, tidak akan di-duplicate.

**Normal behavior** - seeder skip data yang sudah ada.

---

## 📁 File Structure

```
backend/dashboard-service/
├── scripts/
│   ├── fetch_pddikti_data.py       ← Python fetcher
│   ├── requirements.txt             ← Python deps
│   ├── update_pddikti.sh           ← Auto script (Linux/Mac)
│   └── update_pddikti.bat          ← Auto script (Windows)
├── database/
│   ├── data/
│   │   ├── pddikti_unila_akreditasi.json    ← Output: PT
│   │   ├── pddikti_prodi_akreditasi.json    ← Output: Prodi
│   │   └── pddikti_summary.json             ← Output: Summary
│   └── seeders/
│       ├── PDDiktiAkreditasiSeeder.php      ← Laravel seeder
│       └── README_PDDIKTI_SEEDER.md         ← Detail docs
└── PDDIKTI_UPDATE_GUIDE.md                  ← This file
```

---

## ✅ Verification

### Check Database:

```sql
-- University accreditation
SELECT
    sp.nm_lemb,
    na.nm_nilai_akred,
    asp.sk_akred_sp,
    asp.tst_sk_akred_sp
FROM pdrd.akred_sp asp
JOIN pdrd.satuan_pendidikan sp ON sp.id_sp = asp.id_sp
JOIN ref.nilai_akred na ON na.id_akred = asp.id_akred
WHERE sp.nm_lemb LIKE '%Lampung%'
    AND asp.asal_data = 'P'  -- From PDDikti
    AND asp.soft_delete = 0;

-- Study programs count by accreditation
SELECT
    na.nm_nilai_akred,
    COUNT(*) AS total
FROM pdrd.akreditasi_prodi ap
JOIN ref.nilai_akred na ON na.id_akred = ap.id_akred
WHERE ap.asal_data = 'P'
    AND ap.soft_delete = 0
GROUP BY na.nm_nilai_akred
ORDER BY total DESC;
```

### Check API Response:

```bash
# University profile
curl -s http://localhost:9800/dashboard-service/public/api/v1/unila/profile | jq '.data | {akreditasi, sk_akreditasi, tanggal_berakhir_akreditasi}'

# Program Studi statistics
curl -s http://localhost:9800/dashboard-service/public/api/v1/program-studi/statistics | jq '.data.akreditasi_count'
```

### Check Frontend:

1. Buka browser: `http://localhost:3000`
2. Navigasi ke halaman Profil Universitas
3. Verify akreditasi badge menampilkan data terbaru
4. Check halaman Program Studi menampilkan akreditasi

---

## 🆘 Need Help?

1. **Detailed Documentation**: `database/seeders/README_PDDIKTI_SEEDER.md`
2. **Check Logs**: `storage/logs/laravel.log`
3. **Python Script Debug**: Jalankan dengan verbose: `python -v scripts/fetch_pddikti_data.py`

---

## 🔐 Important Notes

- ✅ **Aman**: Seeder tidak delete data existing, hanya insert yang baru
- ✅ **Tracked**: Semua data dari PDDikti ditandai dengan `asal_data = 'P'`
- ✅ **No Duplicates**: Check SK number sebelum insert
- ✅ **Audit Trail**: Semua record ada timestamp create/update

---

**Last Updated**: 2025-01-19

Untuk detail lengkap dan advanced usage, lihat: `database/seeders/README_PDDIKTI_SEEDER.md`
