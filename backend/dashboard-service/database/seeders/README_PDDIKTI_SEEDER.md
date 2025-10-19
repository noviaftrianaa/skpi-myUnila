# PDDikti Akreditasi Seeder

Automated seeder untuk mengupdate data akreditasi Universitas Lampung dan Program Studi dari PDDikti API.

## 🎯 Tujuan

Update data akreditasi dari sumber official (PDDikti Kemdikbud) ke database secara otomatis menggunakan:
1. **Python script** - Fetch data dari PDDikti API
2. **Laravel Seeder** - Import data ke SQL Server database

## 📋 Prerequisites

### 1. Install Python Dependencies

```bash
cd backend/dashboard-service/scripts
pip install -r requirements.txt
```

atau install manual:

```bash
pip install pddiktipy requests
```

### 2. Verify Database Connection

Pastikan koneksi SQL Server sudah configured di `.env`:

```env
DB_CONNECTION=sqlsrv
DB_HOST=127.0.0.1
DB_PORT=1433
DB_DATABASE=pddikti_db
DB_USERNAME=sa
DB_PASSWORD=your_password
```

## 🚀 Cara Penggunaan

### Step 1: Fetch Data dari PDDikti

Jalankan Python script untuk fetch data:

```bash
cd backend/dashboard-service
python scripts/fetch_pddikti_data.py
```

**Output:**
- `database/data/pddikti_unila_akreditasi.json` - Data akreditasi universitas
- `database/data/pddikti_prodi_akreditasi.json` - Data akreditasi semua prodi
- `database/data/pddikti_summary.json` - Summary statistik

**Expected output:**
```
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
  ...

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

✅ Data fetch completed successfully!
```

### Step 2: Run Laravel Seeder

Setelah JSON files ter-generate, run seeder:

```bash
cd backend/dashboard-service
docker exec myunila-dashboard-service php artisan db:seed --class=PDDiktiAkreditasiSeeder
```

**Expected output:**
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

### Step 3: Verify Data

Check data di database:

```sql
-- Check university accreditation
SELECT
    sp.nm_lemb,
    na.nm_nilai_akred AS akreditasi,
    asp.sk_akred_sp,
    asp.tgl_sk_akred_sp,
    asp.tst_sk_akred_sp
FROM pdrd.akred_sp asp
JOIN pdrd.satuan_pendidikan sp ON sp.id_sp = asp.id_sp
JOIN ref.nilai_akred na ON na.id_akred = asp.id_akred
WHERE sp.nm_lemb LIKE '%Lampung%'
    AND asp.soft_delete = 0
ORDER BY asp.tst_sk_akred_sp DESC;

-- Check study program accreditation
SELECT
    sms.nm_lemb AS prodi,
    sms.nm_jenjang_didik AS jenjang,
    na.nm_nilai_akred AS akreditasi,
    ap.sk_akreditasi_prodi,
    ap.tgl_sk_akreditasi_prodi,
    ap.tst_sk_akreditasi_prodi
FROM pdrd.akreditasi_prodi ap
JOIN pdrd.sms sms ON sms.id_sms = ap.id_sms
JOIN ref.nilai_akred na ON na.id_akred = ap.id_akred
WHERE ap.soft_delete = 0
    AND ap.asal_data = 'P' -- P = PDDikti
ORDER BY ap.tst_sk_akreditasi_prodi DESC;
```

## 📁 File Structure

```
backend/dashboard-service/
├── scripts/
│   ├── fetch_pddikti_data.py       # Python script untuk fetch data
│   └── requirements.txt             # Python dependencies
├── database/
│   ├── data/
│   │   ├── pddikti_unila_akreditasi.json    # Output: Akreditasi PT
│   │   ├── pddikti_prodi_akreditasi.json    # Output: Akreditasi Prodi
│   │   └── pddikti_summary.json             # Output: Summary
│   └── seeders/
│       ├── PDDiktiAkreditasiSeeder.php      # Laravel seeder
│       └── README_PDDIKTI_SEEDER.md         # Dokumentasi ini
```

## 🔄 Update Workflow (Periodic)

Untuk update data secara berkala (misalnya setiap bulan):

### Manual Update:

```bash
# 1. Fetch latest data from PDDikti
python scripts/fetch_pddikti_data.py

# 2. Review JSON files
cat database/data/pddikti_summary.json

# 3. Run seeder
docker exec myunila-dashboard-service php artisan db:seed --class=PDDiktiAkreditasiSeeder

# 4. Clear cache
docker exec myunila-dashboard-service php artisan cache:clear
```

### Automated (Cron Job):

Buat bash script untuk automation:

```bash
#!/bin/bash
# update_pddikti.sh

cd /path/to/my-unila/backend/dashboard-service

# Fetch data
echo "Fetching PDDikti data..."
python scripts/fetch_pddikti_data.py

# Check if successful
if [ $? -eq 0 ]; then
    echo "Running seeder..."
    docker exec myunila-dashboard-service php artisan db:seed --class=PDDiktiAkreditasiSeeder

    # Clear cache
    docker exec myunila-dashboard-service php artisan cache:clear

    echo "Update completed!"
else
    echo "Error fetching data!"
    exit 1
fi
```

Kemudian tambahkan ke crontab (jalankan setiap tanggal 1):

```cron
0 2 1 * * /path/to/update_pddikti.sh >> /var/log/pddikti_update.log 2>&1
```

## 🔍 Troubleshooting

### Error: pddiktipy not installed

```bash
pip install pddiktipy
```

### Error: No results found for Universitas Lampung

Kemungkinan:
1. API PDDikti sedang down
2. Network issue
3. Nama universitas berubah di PDDikti

Solusi: Cek manual di https://pddikti.kemdiktisaintek.go.id/

### Error: Program studi not found in database

Artinya nama prodi di PDDikti tidak match dengan nama di database lokal.

Solusi:
1. Check JSON file: `database/data/pddikti_prodi_akreditasi.json`
2. Bandingkan dengan data di `pdrd.sms`
3. Update nama prodi di database atau tambahkan alias mapping

### Warning: Akreditasi 'X' not mapped

Artinya nilai akreditasi dari PDDikti belum ada mapping ke `ref.nilai_akred`.

Solusi:
1. Check nilai akreditasi di JSON
2. Tambahkan mapping di method `getAkreditasiMapping()` di seeder
3. Atau tambahkan nilai baru di tabel `ref.nilai_akred`

## 📊 Data Mapping

### Akreditasi Mapping

PDDikti → Database (ref.nilai_akred):
- "A" / "Unggul" → id_akred: 1
- "B" / "Baik Sekali" → id_akred: 2
- "C" / "Baik" → id_akred: 3

### Field Mapping

#### University (pdrd.akred_sp):
| PDDikti Field | Database Field | Note |
|---------------|----------------|------|
| akreditasi | id_akred | Via mapping table |
| no_sk_ban_pt | sk_akred_sp | SK Number |
| tanggal_sk | tgl_sk_akred_sp | Decree date |
| tanggal_berakhir | tst_sk_akred_sp | Expiration date |

#### Study Program (pdrd.akreditasi_prodi):
| PDDikti Field | Database Field | Note |
|---------------|----------------|------|
| nama | id_sms | Match by name |
| jenjang | - | Used for matching |
| akreditasi | id_akred | Via mapping table |
| no_sk | sk_akreditasi_prodi | SK Number |
| tanggal_sk | tgl_sk_akreditasi_prodi | Decree date |
| tanggal_berakhir | tst_sk_akreditasi_prodi | Expiration date |

## 🔐 Security Notes

1. **API Rate Limiting**: Python script sudah implement rate limiting untuk avoid overload PDDikti server
2. **Data Validation**: Seeder melakukan validation sebelum insert
3. **Duplicate Prevention**: Check existing records sebelum insert (by SK number)
4. **Soft Delete**: Tidak delete data lama, hanya insert yang baru
5. **Audit Trail**: Semua insert di-track dengan `create_date`, `asal_data = 'P'`

## 📝 Notes

- **asal_data = 'P'**: Menandakan data berasal dari PDDikti (untuk tracking source)
- **id_lemb_akred = '00001'**: Default BAN-PT
- **soft_delete = 0**: Data aktif
- Data existing tidak akan di-overwrite, hanya insert yang baru
- Untuk re-seed, hapus data dengan `asal_data = 'P'` terlebih dahulu

## 🆘 Support

Jika ada masalah:
1. Check log output dari Python script
2. Check JSON files di `database/data/`
3. Verify database connection
4. Check Laravel logs: `storage/logs/laravel.log`

## 📚 References

- PDDikti API Library: https://github.com/IlhamriSKY/PDDIKTI-kemdikbud-API
- PDDikti Official: https://pddikti.kemdiktisaintek.go.id/
- BAN-PT: https://www.banpt.or.id/
