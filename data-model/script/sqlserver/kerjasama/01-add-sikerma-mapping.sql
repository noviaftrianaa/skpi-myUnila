-- ============================================================================
-- Schema migration — kerjasama: tambah kolom + table mapping unit SIKERMA
-- ============================================================================
-- Tujuan:
--  1. Tambah `id_sikerma` di kerjasama.mou + pdrd.dudi → idempotent upsert by SIKERMA id
--  2. Tambah `id_jenis_dokumen` di kerjasama.mou → simpan IA/MoA/MoU value
--  3. Buat table baru `kerjasama.unit_mapping` → audit + manual override mapping
--     SIKERMA unit_id ↔ pdrd.sms.id_sms supaya admin bisa lihat unit yang
--     belum termapping + perbaiki manual via CRUD frontend.
--
-- Idempotent: pakai IF NOT EXISTS check.
-- Run: SSMS connect ke pdut / pdut_staging.
-- ============================================================================

USE pdut_staging;  -- Ubah ke `pdut` untuk produksi
GO

-- Required untuk filtered indexes
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET NUMERIC_ROUNDABORT OFF;
GO

-- ============================================================================
-- 1. ALTER kerjasama.mou — tambah id_sikerma + id_jenis_dokumen
-- ============================================================================
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE Name = 'id_sikerma' AND Object_ID = Object_ID('kerjasama.mou')
)
BEGIN
    ALTER TABLE kerjasama.mou ADD id_sikerma INT NULL;
    PRINT 'Added kerjasama.mou.id_sikerma';
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE Name = 'id_jenis_dokumen' AND Object_ID = Object_ID('kerjasama.mou')
)
BEGIN
    ALTER TABLE kerjasama.mou ADD id_jenis_dokumen VARCHAR(10) NULL;
    PRINT 'Added kerjasama.mou.id_jenis_dokumen';
END
GO

-- Index for fast SIKERMA-id lookup (idempotent upsert)
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_mou_id_sikerma' AND object_id = OBJECT_ID('kerjasama.mou')
)
BEGIN
    EXEC('CREATE INDEX IX_mou_id_sikerma ON kerjasama.mou(id_sikerma) WHERE id_sikerma IS NOT NULL');
    PRINT 'Created index IX_mou_id_sikerma';
END
GO

-- ============================================================================
-- 2. ALTER pdrd.dudi — tambah id_sikerma
-- ============================================================================
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE Name = 'id_sikerma' AND Object_ID = Object_ID('pdrd.dudi')
)
BEGIN
    ALTER TABLE pdrd.dudi ADD id_sikerma INT NULL;
    PRINT 'Added pdrd.dudi.id_sikerma';
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_dudi_id_sikerma' AND object_id = OBJECT_ID('pdrd.dudi')
)
BEGIN
    EXEC('CREATE INDEX IX_dudi_id_sikerma ON pdrd.dudi(id_sikerma) WHERE id_sikerma IS NOT NULL');
    PRINT 'Created index IX_dudi_id_sikerma';
END
GO

-- ============================================================================
-- 3. CREATE kerjasama.unit_mapping — audit table sikerma_unit ↔ pdrd.sms
-- ============================================================================
IF NOT EXISTS (
    SELECT 1 FROM sys.tables
    WHERE name = 'unit_mapping' AND schema_id = SCHEMA_ID('kerjasama')
)
BEGIN
    CREATE TABLE kerjasama.unit_mapping (
        id_unit_mapping     UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        sikerma_unit_id     INT              NOT NULL UNIQUE,
        kode_unit           VARCHAR(20)      NULL,    -- "UN26", "UN26.01", "57201"
        jenjang             VARCHAR(10)      NULL,    -- "S1", "S2", "D3", "N", ""
        unit_nama           VARCHAR(255)     NULL,    -- Nama lengkap dari SIKERMA
        nama_pendek         VARCHAR(50)      NULL,    -- Singkatan
        id_sms              UNIQUEIDENTIFIER NULL,    -- mapped pdrd.sms (NULL = unmapped/univ-level)
        strategy            VARCHAR(20)      NULL,    -- "kode_prodi", "fakultas", "manual", "univ", "skip"
        notes               VARCHAR(500)     NULL,    -- Catatan admin (manual override reason)
        last_check          DATETIME2        NULL,    -- Last sync verifikasi mapping
        last_match          DATETIME2        NULL,    -- Last successful match
        soft_delete         BIT              NOT NULL DEFAULT 0,
        create_date         DATETIME2        NOT NULL DEFAULT GETDATE(),
        last_update         DATETIME2        NOT NULL DEFAULT GETDATE()
    );
    CREATE INDEX IX_unit_mapping_id_sms ON kerjasama.unit_mapping(id_sms) WHERE soft_delete = 0;
    CREATE INDEX IX_unit_mapping_strategy ON kerjasama.unit_mapping(strategy) WHERE soft_delete = 0;
    PRINT 'Created kerjasama.unit_mapping table + indexes';
END
ELSE
BEGIN
    PRINT 'kerjasama.unit_mapping already exists, skipped';
END

-- ============================================================================
-- Verification
-- ============================================================================
SELECT
    (SELECT COUNT(*) FROM sys.columns WHERE Object_ID = Object_ID('kerjasama.mou') AND Name IN ('id_sikerma', 'id_jenis_dokumen'))   AS mou_new_cols,
    (SELECT COUNT(*) FROM sys.columns WHERE Object_ID = Object_ID('pdrd.dudi') AND Name = 'id_sikerma')                              AS dudi_new_cols,
    (SELECT COUNT(*) FROM sys.tables WHERE name = 'unit_mapping' AND schema_id = SCHEMA_ID('kerjasama'))                            AS unit_mapping_table;

PRINT 'Migration complete. Cek output: mou_new_cols=2, dudi_new_cols=1, unit_mapping_table=1';
