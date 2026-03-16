# Database Plan — Mirroring & Staging
# MyUnila — SQL Server 2019 Enterprise

**Updated:** 2026-03-15  
**DB Source:** 192.168.123.119 (WIN-V01F3SG22V0) — SQL Server 2019 Enterprise  
**DB Target Mirror:** 192.168.123.190 (Windows Server baru)  
**Edition:** Enterprise → support semua fitur HA

---

## 📐 Arsitektur Target

```
┌──────────────────────────────────────────────────────────────┐
│  192.168.123.119 (Primary / Live)                            │
│  SQL Server 2019 Enterprise                                  │
│  Database: pdut (production)                                 │
│                    │                                         │
│                    │ Always On AG / Log Shipping             │
│                    ▼                                         │
│  192.168.123.190 (Secondary / Mirror)                        │
│  SQL Server 2019 Enterprise                                  │
│  Database: pdut (mirror - readable secondary)               │
│          + pdut_staging (untuk VM5 staging)                  │
└──────────────────────────────────────────────────────────────┘
                    ▲
                    │ connect
          VM5 Staging (192.168.120.45)
          → pdut_staging di 192.168.123.190
```

---

## 🎯 Dua Goal Terpisah

| Goal | Solusi | Prioritas |
|---|---|---|
| **Mirroring prod** | Always On AG atau Log Shipping | High |
| **DB Staging** | Restore backup ke pdut_staging | Medium |

---

## 📋 PLAN A — Log Shipping (Lebih Mudah, Rekomendasi Pertama)

**Kenapa Log Shipping dulu:**
- Lebih simple dari Always On
- Tidak butuh Windows Server Failover Cluster
- Recovery model cukup FULL (bukan SIMPLE seperti sekarang)
- Cocok untuk disaster recovery + read replica

### Step 1 — Ubah Recovery Model ke FULL

Di SSMS → Primary (192.168.123.119):

```sql
-- Ubah recovery model (wajib untuk Log Shipping)
ALTER DATABASE pdut SET RECOVERY FULL;

-- Verifikasi
SELECT name, recovery_model_desc 
FROM sys.databases 
WHERE name = 'pdut';
-- Hasil harus: FULL
```

### Step 2 — Backup Full pertama kali

```sql
-- Di Primary (119)
-- Sesuaikan path dengan folder yang ada di server
BACKUP DATABASE pdut 
TO DISK = 'C:\SQLBackup\pdut_full_initial.bak'
WITH FORMAT, INIT, 
     NAME = 'pdut-Full Backup Initial',
     COMPRESSION,
     STATS = 10;
```

### Step 3 — Restore di Secondary (190)

Di SSMS → connect ke 192.168.123.190, jalankan:

```sql
-- Restore dengan NORECOVERY (agar bisa terima log shipping)
RESTORE DATABASE pdut
FROM DISK = '\\192.168.123.119\SQLBackup\pdut_full_initial.bak'
-- ATAU copy file dulu ke 190, lalu:
FROM DISK = 'C:\SQLBackup\pdut_full_initial.bak'
WITH NORECOVERY,
     MOVE 'pdut' TO 'C:\SQLData\pdut.mdf',
     MOVE 'pdut_log' TO 'C:\SQLData\pdut.ldf',
     STATS = 10;
```

### Step 4 — Setup Log Shipping via SSMS (GUI)

1. Di SSMS, klik kanan database `pdut` → **Properties**
2. Pilih **Transaction Log Shipping**
3. Centang: **Enable this as a primary database**
4. **Backup Settings:**
   - Backup folder: `C:\SQLBackup\LogShipping\`
   - Backup share: `\\192.168.123.119\SQLBackup\LogShipping\`
   - Backup frequency: **setiap 15 menit**
   - Delete files older than: **48 jam**
5. **Add Secondary Server:** `192.168.123.190`
   - Restore mode: **Standby mode** (bisa dibaca) atau **No recovery** (tidak bisa dibaca)
   - Copy frequency: **15 menit**
   - Restore frequency: **15 menit**
6. Klik **OK** → SQL Agent jobs akan dibuat otomatis

### Step 5 — Verifikasi Log Shipping

```sql
-- Cek status log shipping
SELECT 
    primary_server,
    primary_database,
    last_backup_file,
    last_backup_date,
    last_copied_file,
    last_copied_date,
    last_restored_file,
    last_restored_date
FROM msdb.dbo.log_shipping_monitor_primary;

-- Di secondary:
SELECT * FROM msdb.dbo.log_shipping_monitor_secondary;
```

---

## 📋 PLAN B — Always On Availability Group (Lebih Robust)

**Kapan pakai ini:** Kalau butuh automatic failover dan minimal downtime.

**Syarat tambahan:**
- Windows Server Failover Cluster (WSFC) di kedua server
- Domain yang sama atau Workgroup (Server 2019 support)
- Sama SQL Server version & edition

### Overview Step (detail via Wizard SSMS):

1. **Setup Windows Failover Cluster** di kedua server
2. **Enable Always On** di SQL Server Configuration Manager
3. **Buat Availability Group** via SSMS Wizard
4. **Configure Listener** (virtual IP untuk koneksi)
5. **Test failover**

> Ini lebih kompleks — rekomendasikan **Log Shipping dulu** sambil belajar AG.

---

## 📋 PLAN C — DB Staging (pdut_staging)

### Opsi C1 — Restore dari backup (Simpel) ⭐

Buat job SQL Agent yang restore backup weekly ke `pdut_staging`:

```sql
-- Script untuk SQL Agent Job
-- Jalankan di: 192.168.123.190

USE [msdb]
GO

-- Buat job
EXEC sp_add_job
    @job_name = N'Weekly Restore pdut_staging';

-- Step 1: Restore database
EXEC sp_add_jobstep
    @job_name = N'Weekly Restore pdut_staging',
    @step_name = N'Restore pdut ke pdut_staging',
    @command = N'
-- Drop existing staging DB
IF EXISTS (SELECT name FROM sys.databases WHERE name = N''pdut_staging'')
BEGIN
    ALTER DATABASE pdut_staging SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE pdut_staging;
END

-- Restore dari backup terbaru
RESTORE DATABASE pdut_staging
FROM DISK = ''C:\SQLBackup\pdut_full_latest.bak''
WITH RECOVERY,
     MOVE ''pdut'' TO ''C:\SQLData\pdut_staging.mdf'',
     MOVE ''pdut_log'' TO ''C:\SQLData\pdut_staging.ldf'',
     STATS = 10;

-- Ubah recovery model ke SIMPLE untuk staging
ALTER DATABASE pdut_staging SET RECOVERY SIMPLE;

PRINT ''Restore pdut_staging selesai: '' + CONVERT(VARCHAR, GETDATE(), 120);
';

-- Schedule: Setiap Minggu jam 02:00 dini hari
EXEC sp_add_schedule
    @schedule_name = N'Weekly Sunday 2AM',
    @freq_type = 8,              -- Weekly
    @freq_interval = 1,          -- Sunday
    @freq_recurrence_factor = 1,
    @active_start_time = 020000; -- 02:00:00

EXEC sp_attach_schedule
    @job_name = N'Weekly Restore pdut_staging',
    @schedule_name = N'Weekly Sunday 2AM';

EXEC sp_add_jobserver
    @job_name = N'Weekly Restore pdut_staging';
GO
```

### Opsi C2 — Backup otomatis dari Primary dulu

```sql
-- Job di Primary (119): backup pdut setiap malam
USE [msdb]
GO

EXEC sp_add_job @job_name = N'Daily Backup pdut for Staging';

EXEC sp_add_jobstep
    @job_name = N'Daily Backup pdut for Staging',
    @step_name = N'Full Backup',
    @command = N'
BACKUP DATABASE pdut 
TO DISK = ''C:\SQLBackup\pdut_staging_restore.bak''
WITH FORMAT, INIT,
     NAME = ''pdut-Backup for Staging'',
     COMPRESSION,
     STATS = 10;
PRINT ''Backup selesai: '' + CONVERT(VARCHAR, GETDATE(), 120);
';

EXEC sp_add_schedule
    @schedule_name = N'Daily 1AM',
    @freq_type = 4,           -- Daily
    @freq_interval = 1,
    @active_start_time = 010000; -- 01:00:00

EXEC sp_attach_schedule
    @job_name = N'Daily Backup pdut for Staging',
    @schedule_name = N'Daily 1AM';

EXEC sp_add_jobserver
    @job_name = N'Daily Backup pdut for Staging';
GO
```

---

## 🔧 Setup VM5 Staging ke pdut_staging

Setelah `pdut_staging` ada di 192.168.123.190, update keuangan service di VM5:

```bash
# Di VM5 — update .env staging
nano /var/www/my-unila/deployment/production/vm5-staging/.env

# Ubah DB connection ke staging DB:
KEUANGAN_DB_HOST=192.168.123.190
KEUANGAN_DB_DATABASE=pdut_staging
# (dan service lainnya)

# Restart services
cd /var/www/my-unila/deployment/production/vm5-staging/services
docker compose -f backend-go/docker-compose.keuangan.yml --env-file ../.env up -d
```

---

## 🔒 Keamanan

### User untuk Staging (read-write terbatas)
```sql
-- Buat user khusus untuk staging di pdut_staging
-- Jangan pakai mizarzulmi (akun prod) untuk staging!
CREATE LOGIN staging_user WITH PASSWORD = 'password_kuat_staging';
USE pdut_staging;
CREATE USER staging_user FOR LOGIN staging_user;

-- Berikan akses read + write hanya ke schema tertentu
ALTER ROLE db_datareader ADD MEMBER staging_user;
ALTER ROLE db_datawriter ADD MEMBER staging_user;

-- TAPI deny akses ke data sensitif jika perlu
-- DENY SELECT ON SCHEMA::keuangan TO staging_user;
```

---

## ✅ Urutan Implementasi yang Disarankan

**Minggu 1:**
- [ ] Setup Log Shipping dari 119 → 190
- [ ] Verifikasi log shipping berjalan

**Minggu 2:**
- [ ] Buat job backup harian di Primary (119)
- [ ] Buat job restore mingguan ke pdut_staging di Secondary (190)
- [ ] Test restore berhasil

**Minggu 3:**
- [ ] Buat user `staging_user` di pdut_staging
- [ ] Update VM5 staging `.env` untuk connect ke pdut_staging@190
- [ ] Restart services VM5 & verifikasi

**Opsional nanti:**
- [ ] Upgrade ke Always On AG jika butuh auto failover

---

## 📌 Catatan Penting

1. **Recovery model HARUS FULL** untuk Log Shipping — saat ini SIMPLE, wajib diubah dulu
2. **Path backup folder** sesuaikan dengan yang ada di server (cek via SSMS atau `xp_cmdshell`)
3. **Share network folder** antara 119 dan 190 perlu dibuka untuk copy log files
4. **SQL Server Agent** harus berjalan di kedua server
5. **Sama SQL Server version** — pastikan 190 juga SQL Server 2019

---

*Plan ini dibuat berdasarkan SQL Server 2019 Enterprise di 192.168.123.119*
