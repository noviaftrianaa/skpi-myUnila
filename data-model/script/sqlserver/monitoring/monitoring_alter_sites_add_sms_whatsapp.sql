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

-- 4. Seed whatsapp_template setting (jika belum ada)
IF OBJECT_ID('monitoring.settings', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM monitoring.settings
        WHERE key_group = 'alert' AND setting_key = 'whatsapp_template' AND soft_delete = 0
    )
    BEGIN
        INSERT INTO monitoring.settings
            (key_group, setting_key, setting_value, description, is_sensitive, create_date, id_creator, last_update, soft_delete)
        VALUES (
            'alert', 'whatsapp_template',
            'Yth. {nama_pj},' + CHAR(10) + CHAR(10)
            + 'Kami dari Tim Monitoring Web Universitas Lampung menginformasikan bahwa website *{nama_situs}* ({url_situs}) terdeteksi memerlukan perhatian.' + CHAR(10) + CHAR(10)
            + 'Mohon segera lakukan pengecekan dan penanganan:' + CHAR(10)
            + '1. Periksa konten website dari sisipan ilegal (judi online, dll)' + CHAR(10)
            + '2. Ganti password admin & FTP' + CHAR(10)
            + '3. Update CMS dan plugin ke versi terbaru' + CHAR(10)
            + '4. Scan malware dan hapus file mencurigakan' + CHAR(10) + CHAR(10)
            + 'Detail lengkap dapat dilihat di dashboard monitoring.' + CHAR(10) + CHAR(10)
            + 'Terima kasih.',
            'Template pesan WhatsApp ke PJ situs. Placeholder: {nama_pj}, {nama_situs}, {url_situs}',
            0, GETDATE(), '00000000-0000-0000-0000-000000000001', GETDATE(), 0
        )
        PRINT '>> Setting whatsapp_template seeded'
    END
    ELSE
        PRINT '>> Setting whatsapp_template already exists'
END
go
