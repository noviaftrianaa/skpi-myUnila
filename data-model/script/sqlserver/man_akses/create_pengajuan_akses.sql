-- ============================================================================
-- CREATE TABLE man_akses.pengajuan_akses
-- ============================================================================
-- Date: 2026-05-12
--
-- Tujuan: tabel utk Self-Service Access Request (SSAR) — user submit
-- pengajuan akses aplikasi, admin TIK validate via dashboard, approve →
-- auto-create row di role_pengguna.
--
-- Schema: man_akses (sesuai konvensi tabel RBAC lainnya)
--
-- IDEMPOTENT: aman re-run.
-- ============================================================================

USE pdut;
GO

-- 1. CREATE TABLE
IF NOT EXISTS (
    SELECT 1 FROM sys.tables t
    INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
    WHERE s.name = 'man_akses' AND t.name = 'pengajuan_akses'
)
BEGIN
    CREATE TABLE man_akses.pengajuan_akses (
        id_pengajuan        UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

        -- Pemohon (snapshot identitas saat submit — utk audit kalau user mutasi)
        id_pengguna         UNIQUEIDENTIFIER NOT NULL,
        nama_pemohon        VARCHAR(200),
        nip_pemohon         VARCHAR(50),
        homebase_pemohon    VARCHAR(200),

        -- Pengajuan
        id_aplikasi         UNIQUEIDENTIFIER NOT NULL,
        id_peran            INT NOT NULL,
        id_organisasi       UNIQUEIDENTIFIER NOT NULL,

        -- SK Penugasan (file)
        sk_url              VARCHAR(500),
        sk_filename         VARCHAR(255),
        sk_filesize         INT,
        sk_mimetype         VARCHAR(100),

        -- SK Penugasan (metadata)
        no_sk               VARCHAR(100),
        tgl_sk              DATE,
        tgl_kadaluarsa      DATE NOT NULL,

        -- Konten
        catatan_pemohon     NVARCHAR(MAX),

        -- Status (pending / approved / rejected / cancelled / expired)
        status              VARCHAR(20) NOT NULL DEFAULT 'pending',

        -- Validasi
        id_validator        UNIQUEIDENTIFIER,
        nama_validator      VARCHAR(200),
        tgl_validasi        DATETIME,
        alasan_tolak        NVARCHAR(MAX),
        catatan_validator   NVARCHAR(MAX),

        -- Audit
        auto_flags          NVARCHAR(MAX),  -- JSON array warning
        id_role_pengguna_created UNIQUEIDENTIFIER,

        -- Timestamps
        tgl_create          DATETIME DEFAULT GETDATE(),
        last_update         DATETIME DEFAULT GETDATE(),
        soft_delete         BIT DEFAULT 0,

        -- Foreign keys
        CONSTRAINT FK_pengajuan_akses_pengguna
            FOREIGN KEY (id_pengguna) REFERENCES man_akses.pengguna(id_pengguna),
        CONSTRAINT FK_pengajuan_akses_aplikasi
            FOREIGN KEY (id_aplikasi) REFERENCES man_akses.aplikasi(id_aplikasi),
        CONSTRAINT FK_pengajuan_akses_peran
            FOREIGN KEY (id_peran) REFERENCES man_akses.peran(id_peran),
        CONSTRAINT FK_pengajuan_akses_unit
            FOREIGN KEY (id_organisasi) REFERENCES man_akses.unit_organisasi(id_organisasi),
        CONSTRAINT FK_pengajuan_akses_validator
            FOREIGN KEY (id_validator) REFERENCES man_akses.pengguna(id_pengguna),

        -- Check constraint enum status
        CONSTRAINT CK_pengajuan_akses_status
            CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'expired'))
    );

    PRINT '✓ Tabel man_akses.pengajuan_akses created';
END
ELSE
    PRINT '~ Tabel man_akses.pengajuan_akses sudah ada, skip';
GO

-- 2. INDEX utk query yang sering dipakai
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'idx_pengajuan_status' AND object_id = OBJECT_ID('man_akses.pengajuan_akses')
)
    CREATE INDEX idx_pengajuan_status
        ON man_akses.pengajuan_akses(status, tgl_create DESC);

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'idx_pengajuan_pengguna' AND object_id = OBJECT_ID('man_akses.pengajuan_akses')
)
    CREATE INDEX idx_pengajuan_pengguna
        ON man_akses.pengajuan_akses(id_pengguna, status);

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'idx_pengajuan_aplikasi' AND object_id = OBJECT_ID('man_akses.pengajuan_akses')
)
    CREATE INDEX idx_pengajuan_aplikasi
        ON man_akses.pengajuan_akses(id_aplikasi, status);

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'idx_pengajuan_kadaluarsa' AND object_id = OBJECT_ID('man_akses.pengajuan_akses')
)
    CREATE INDEX idx_pengajuan_kadaluarsa
        ON man_akses.pengajuan_akses(tgl_kadaluarsa)
        WHERE status = 'approved';

PRINT '✓ Index created';
GO

-- 3. Verifikasi
PRINT '';
PRINT '=== VERIFIKASI ===';
SELECT
    c.COLUMN_NAME,
    c.DATA_TYPE,
    c.CHARACTER_MAXIMUM_LENGTH AS max_len,
    c.IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS c
WHERE c.TABLE_SCHEMA = 'man_akses' AND c.TABLE_NAME = 'pengajuan_akses'
ORDER BY c.ORDINAL_POSITION;
GO

PRINT '';
PRINT '✓ DDL pengajuan_akses applied. Siap konsumsi backend SSAR endpoint.';

-- ============================================================================
-- ROLLBACK (kalau perlu undo)
-- ============================================================================
-- DROP TABLE man_akses.pengajuan_akses;
-- ============================================================================
