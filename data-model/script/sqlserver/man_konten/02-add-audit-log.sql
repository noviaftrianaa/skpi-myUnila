-- ============================================================================
-- Schema migration — man_konten: tambah table audit_log
-- ============================================================================
-- Tujuan:
--   Track admin action (create/update/delete/publish) di tabel pengumuman,
--   kategori, notifikasi. Untuk akuntabilitas + recovery (siapa edit kapan,
--   apa diubah).
--
-- Idempotent: pakai IF NOT EXISTS check.
-- Run: SSMS connect ke pdut / pdut_staging.
-- ============================================================================

USE pdut_staging;  -- Ubah ke `pdut` untuk produksi
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name='audit_log' AND schema_id=SCHEMA_ID('man_konten'))
BEGIN
    CREATE TABLE man_konten.audit_log (
        id_log         UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        id_pengguna    UNIQUEIDENTIFIER NOT NULL,                 -- siapa
        username       VARCHAR(255)     NULL,                     -- snapshot username
        action         VARCHAR(20)      NOT NULL,                 -- create|update|delete|publish|archive
        entity_type    VARCHAR(20)      NOT NULL,                 -- pengumuman|berita|artikel|kategori|notif|upload
        entity_id      UNIQUEIDENTIFIER NULL,                     -- which row
        entity_label   VARCHAR(255)     NULL,                     -- judul/nama untuk display
        before_value   NVARCHAR(MAX)    NULL,                     -- JSON snapshot before (null untuk create)
        after_value    NVARCHAR(MAX)    NULL,                     -- JSON snapshot after (null untuk delete)
        ip_address     VARCHAR(45)      NULL,
        user_agent     VARCHAR(500)     NULL,
        create_date    DATETIME         NOT NULL DEFAULT GETDATE()
    );
    CREATE INDEX IX_audit_log_pengguna ON man_konten.audit_log(id_pengguna, create_date DESC);
    CREATE INDEX IX_audit_log_entity ON man_konten.audit_log(entity_type, entity_id, create_date DESC);
    CREATE INDEX IX_audit_log_create_date ON man_konten.audit_log(create_date DESC);
    PRINT 'Created table man_konten.audit_log';
END
ELSE
BEGIN
    PRINT 'man_konten.audit_log already exists, skipped';
END
GO

SELECT
    (SELECT COUNT(*) FROM sys.tables WHERE name='audit_log' AND schema_id=SCHEMA_ID('man_konten')) AS audit_log_table;

PRINT 'Migration 02-add-audit-log complete. Expected: audit_log_table=1';
