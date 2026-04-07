# MyUnila — Master Plan: Database & RBAC

**Updated:** 2026-03-15  
**Server DB:** 192.168.123.119 (SQL Server 2019 Enterprise)  
**Server Mirror:** 192.168.123.190 (Windows Server — rencana)

---

## 🎯 2 Plan yang akan dieksekusi

| Plan | File Detail | Prioritas |
|---|---|---|
| **Plan 1 — Database** | DATABASE-PLAN.md | High — harus duluan |
| **Plan 2 — RBAC Organisasi** | RBAC-ORGANISASI-PLAN.md | High — setelah Plan 1 |

---

## 📋 PLAN 1 — Database (Staging + Mirroring + Scheduler)

### Phase 1A — Buat DB Staging (di server 119)

**Script:** `backend/auth-service/database/migrations/00_create_pdut_staging.sql`  
**Jalankan di:** SSMS → connect 192.168.123.119 → database master  
**Estimasi:** 10-15 menit

| Step | Action | Status |
|---|---|---|
| 1 | Backup pdut ke .bak (compressed) | ⬜ |
| 2 | Restore sebagai pdut_staging | ⬜ |
| 3 | Set recovery model SIMPLE | ⬜ |
| 4 | Shrink log file | ⬜ |
| 5 | Verifikasi pdut_staging online | ⬜ |

Setelah ini: VM5 staging bisa di-switch ke pdut_staging.

---

### Phase 1B — Setup Log Shipping (119 → 190)

**Syarat:** Server 192.168.123.190 sudah install SQL Server 2019  
**Jalankan di:** SSMS  

| Step | Action | Status |
|---|---|---|
| 1 | Ubah recovery model pdut → FULL | ⬜ |
| 2 | Full backup pdut di server 119 | ⬜ |
| 3 | Copy/restore backup ke server 190 (WITH NORECOVERY) | ⬜ |
| 4 | Setup Log Shipping via SSMS Wizard (klik kanan pdut → Properties → Transaction Log Shipping) | ⬜ |
| 5 | Verifikasi SQL Agent jobs otomatis terbuat | ⬜ |
| 6 | Monitor log shipping status | ⬜ |

**Script ubah recovery model:**
```sql
ALTER DATABASE pdut SET RECOVERY FULL;
```

**Script backup untuk log shipping:**
```sql
BACKUP DATABASE pdut 
TO DISK = 'C:\Program Files\Microsoft SQL Server\MSSQL15.MSSQLSERVER\MSSQL\Backup\pdut_logshipping_init.bak'
WITH FORMAT, INIT, COMPRESSION, STATS = 10;
```

**Script restore di server 190:**
```sql
RESTORE DATABASE pdut
FROM DISK = 'C:\SQLBackup\pdut_logshipping_init.bak'
WITH NORECOVERY,
     MOVE 'pdut' TO 'C:\SQLData\pdut.mdf',
     MOVE 'pdut_log' TO 'C:\SQLData\pdut_log.ldf',
     STATS = 10;
```

Setelah wizard selesai, Log Shipping akan:
- Backup transaction log setiap 15 menit di server 119
- Copy ke server 190
- Restore di server 190

---

### Phase 1C — Scheduler: Backup Harian + Restore Staging Mingguan

**Jalankan di:** SSMS → SQL Server Agent

#### Job 1: Daily Backup pdut (di server 119)

```sql
USE [msdb]
GO

-- Hapus job lama jika ada
IF EXISTS (SELECT job_id FROM msdb.dbo.sysjobs WHERE name = N'MyUnila - Daily Backup pdut')
    EXEC sp_delete_job @job_name = N'MyUnila - Daily Backup pdut';
GO

-- Buat job baru
EXEC sp_add_job
    @job_name = N'MyUnila - Daily Backup pdut',
    @description = N'Backup harian pdut untuk staging restore dan disaster recovery';
GO

-- Step: Full backup
EXEC sp_add_jobstep
    @job_name = N'MyUnila - Daily Backup pdut',
    @step_name = N'Full Backup pdut',
    @subsystem = N'TSQL',
    @command = N'
BACKUP DATABASE pdut 
TO DISK = N''C:\Program Files\Microsoft SQL Server\MSSQL15.MSSQLSERVER\MSSQL\Backup\pdut_daily.bak''
WITH FORMAT, INIT,
     NAME = N''pdut - Daily Backup'',
     COMPRESSION,
     STATS = 10;
PRINT ''Backup selesai: '' + CONVERT(VARCHAR, GETDATE(), 120);
',
    @database_name = N'master';
GO

-- Schedule: Setiap hari jam 01:00
EXEC sp_add_schedule
    @schedule_name = N'MyUnila Daily 1AM',
    @freq_type = 4,              -- Daily
    @freq_interval = 1,
    @active_start_time = 010000; -- 01:00:00
GO

EXEC sp_attach_schedule
    @job_name = N'MyUnila - Daily Backup pdut',
    @schedule_name = N'MyUnila Daily 1AM';
GO

EXEC sp_add_jobserver
    @job_name = N'MyUnila - Daily Backup pdut';
GO

PRINT 'Job "MyUnila - Daily Backup pdut" created — schedule: daily 01:00';
```

#### Job 2: Weekly Restore pdut_staging (di server 119)

```sql
USE [msdb]
GO

-- Hapus job lama jika ada
IF EXISTS (SELECT job_id FROM msdb.dbo.sysjobs WHERE name = N'MyUnila - Weekly Restore pdut_staging')
    EXEC sp_delete_job @job_name = N'MyUnila - Weekly Restore pdut_staging';
GO

-- Buat job baru
EXEC sp_add_job
    @job_name = N'MyUnila - Weekly Restore pdut_staging',
    @description = N'Refresh pdut_staging dari backup harian setiap Minggu jam 02:00';
GO

-- Step: Restore
EXEC sp_add_jobstep
    @job_name = N'MyUnila - Weekly Restore pdut_staging',
    @step_name = N'Restore pdut ke pdut_staging',
    @subsystem = N'TSQL',
    @command = N'
-- Disconnect semua user dari pdut_staging
IF EXISTS (SELECT name FROM sys.databases WHERE name = N''pdut_staging'')
BEGIN
    ALTER DATABASE pdut_staging SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE pdut_staging;
END

-- Restore dari backup harian terbaru
RESTORE DATABASE pdut_staging
FROM DISK = N''C:\Program Files\Microsoft SQL Server\MSSQL15.MSSQLSERVER\MSSQL\Backup\pdut_daily.bak''
WITH RECOVERY,
     MOVE N''pdut'' TO N''C:\Program Files\Microsoft SQL Server\MSSQL15.MSSQLSERVER\MSSQL\DATA\pdut_staging.mdf'',
     MOVE N''pdut_log'' TO N''C:\Program Files\Microsoft SQL Server\MSSQL15.MSSQLSERVER\MSSQL\DATA\pdut_staging_log.ldf'',
     STATS = 10;

-- Set SIMPLE recovery untuk staging
ALTER DATABASE pdut_staging SET RECOVERY SIMPLE;

-- Shrink log
USE pdut_staging;
DBCC SHRINKFILE (pdut_log, 256);
USE master;

PRINT ''Restore pdut_staging selesai: '' + CONVERT(VARCHAR, GETDATE(), 120);
',
    @database_name = N'master';
GO

-- Schedule: Setiap Minggu jam 02:00
EXEC sp_add_schedule
    @schedule_name = N'MyUnila Weekly Sunday 2AM',
    @freq_type = 8,              -- Weekly
    @freq_interval = 1,          -- Sunday
    @freq_recurrence_factor = 1,
    @active_start_time = 020000; -- 02:00:00
GO

EXEC sp_attach_schedule
    @job_name = N'MyUnila - Weekly Restore pdut_staging',
    @schedule_name = N'MyUnila Weekly Sunday 2AM';
GO

EXEC sp_add_jobserver
    @job_name = N'MyUnila - Weekly Restore pdut_staging';
GO

PRINT 'Job "MyUnila - Weekly Restore pdut_staging" created — schedule: Sunday 02:00';
```

#### Job 3: Cleanup Backup Files (di server 119)

```sql
USE [msdb]
GO

IF EXISTS (SELECT job_id FROM msdb.dbo.sysjobs WHERE name = N'MyUnila - Cleanup Old Backups')
    EXEC sp_delete_job @job_name = N'MyUnila - Cleanup Old Backups';
GO

EXEC sp_add_job
    @job_name = N'MyUnila - Cleanup Old Backups',
    @description = N'Hapus backup files yang lebih dari 7 hari';
GO

EXEC sp_add_jobstep
    @job_name = N'MyUnila - Cleanup Old Backups',
    @step_name = N'Delete old backup files',
    @subsystem = N'TSQL',
    @command = N'
DECLARE @DeleteDate DATETIME = DATEADD(DAY, -7, GETDATE());
EXEC xp_delete_files 
    N''C:\Program Files\Microsoft SQL Server\MSSQL15.MSSQLSERVER\MSSQL\Backup\'',
    N''bak'',
    @DeleteDate;
PRINT ''Cleanup selesai: '' + CONVERT(VARCHAR, GETDATE(), 120);
',
    @database_name = N'master';
GO

EXEC sp_add_schedule
    @schedule_name = N'MyUnila Daily 3AM Cleanup',
    @freq_type = 4,
    @freq_interval = 1,
    @active_start_time = 030000;
GO

EXEC sp_attach_schedule
    @job_name = N'MyUnila - Cleanup Old Backups',
    @schedule_name = N'MyUnila Daily 3AM Cleanup';
GO

EXEC sp_add_jobserver
    @job_name = N'MyUnila - Cleanup Old Backups';
GO

PRINT 'Job "MyUnila - Cleanup Old Backups" created — schedule: daily 03:00';
```

---

### Phase 1D — Update VM5 Staging ke pdut_staging

Setelah pdut_staging siap:

```bash
# Di VM5, update .env
nano /var/www/my-unila/deployment/production/vm5-staging/.env

# Ubah:
# DB_DATABASE=pdut → DB_DATABASE=pdut_staging
# Untuk SEMUA service yang pakai DB (auth, sister, keuangan, dll)

# Restart semua services
cd /var/www/my-unila/deployment/production/vm5-staging
# Restart via docker compose masing-masing service
```

---

## 📋 PLAN 2 — RBAC Organisasi & API Access

### Phase 2A — Test Migration di pdut_staging

**Script:** `backend/auth-service/database/migrations/rbac_organisasi_access.sql`  
**Jalankan di:** SSMS → database **pdut_staging**

| Step | Action | Status |
|---|---|---|
| 1 | ALTER aplikasi: add a_filter_organisasi | ⬜ |
| 2 | ALTER peran: add a_universal + seed 14 roles | ⬜ |
| 3 | CREATE TABLE aplikasi_organisasi | ⬜ |
| 4 | Create indexes | ⬜ |
| 5 | ALTER ws_authorization: add id_peran | ⬜ |
| 6 | Verifikasi semua output OK | ⬜ |

### Phase 2B — Deploy ke Production (pdut)

Jalankan script yang sama di database **pdut** (production).

### Phase 2C — Update Auth Service

Update `checkAppAccess` agar cek organisasi filter.

### Phase 2D — Update API Service

Tambah `RequireRole` middleware ke endpoint sensitif.

### Phase 2E — Update Frontend

Enforce CRUD permissions di semua page.

---

## ⏱️ Estimasi Waktu Total

| Phase | Estimasi |
|---|---|
| 1A — Buat pdut_staging | 15 menit |
| 1B — Log Shipping (119→190) | 30 menit |
| 1C — Scheduler jobs | 10 menit |
| 1D — Update VM5 .env | 5 menit |
| 2A — Test migration staging | 5 menit |
| 2B — Deploy ke production | 5 menit |
| 2C — Update auth service | 2-3 jam (implementasi) |
| 2D — Update API service | 1-2 jam (implementasi) |
| 2E — Update frontend | 2-3 jam (implementasi) |

---

## 📁 Semua Script SQL (urutan eksekusi)

```
backend/auth-service/database/migrations/
├── 00_create_pdut_staging.sql         ← PERTAMA (buat staging DB)
├── rbac_organisasi_access.sql         ← KEDUA (di staging, lalu production)
└── portal_aplikasi_schema.sql         ← sudah dijalankan sebelumnya
```

Script scheduler SQL Agent → copy dari MASTER-PLAN.md ini langsung ke SSMS.

---

*Simpan file ini. Eksekusi step by step sesuai urutan.*
