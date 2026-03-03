-- ============================================================
-- monitoring_alter_sites_add_sms_whatsapp.sql
-- Tambah kolom id_sms (mapping ke pdrd.sms) dan admin_whatsapp
-- pada tabel monitoring.sites untuk existing installations
-- ============================================================

-- 1. Tambah kolom id_sms (nullable UNIQUEIDENTIFIER, mapping ke pdrd.sms)
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'monitoring' AND TABLE_NAME = 'sites' AND COLUMN_NAME = 'id_sms'
)
BEGIN
    ALTER TABLE monitoring.sites ADD id_sms UNIQUEIDENTIFIER NULL
    PRINT '>> Column id_sms added to monitoring.sites'
END
ELSE
    PRINT '>> Column id_sms already exists on monitoring.sites'
go

-- 2. Tambah kolom admin_whatsapp (nullable NVARCHAR(50))
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'monitoring' AND TABLE_NAME = 'sites' AND COLUMN_NAME = 'admin_whatsapp'
)
BEGIN
    ALTER TABLE monitoring.sites ADD admin_whatsapp NVARCHAR(50) NULL
    PRINT '>> Column admin_whatsapp added to monitoring.sites'
END
ELSE
    PRINT '>> Column admin_whatsapp already exists on monitoring.sites'
go

-- 3. Tambah kolom snippet pada detected_threats (jika belum ada)
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'monitoring' AND TABLE_NAME = 'detected_threats' AND COLUMN_NAME = 'snippet'
)
BEGIN
    ALTER TABLE monitoring.detected_threats ADD snippet NVARCHAR(MAX) NULL
    PRINT '>> Column snippet added to monitoring.detected_threats'
END
ELSE
    PRINT '>> Column snippet already exists on monitoring.detected_threats'
go
