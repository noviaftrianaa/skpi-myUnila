-- ============================================================================
-- Tabel: man_akses.aplikasi_default_role
-- ============================================================================
-- Date: 2026-05-08
-- Pilar 6: Default Access Checklist per Aplikasi
--
-- Tujuan: deklarasi tingkat aplikasi tentang peran identitas mana yang dapat
-- akses default (tanpa harus mapping menu_role per menu).
--
-- Konsep: tiap aplikasi punya 3 checkbox di UI (Mhs/Dosen/Tendik). Kalau
-- dicentang → entry di tabel ini, dan user dengan peran tsb otomatis dapat
-- akses ke aplikasi (tanpa perlu menu_role mapping).
--
-- Backend logic di UserContextService::checkAppAccess:
--   1. Cek dulu: apakah ada entry di aplikasi_default_role untuk
--      (id_aplikasi, id_peran, a_aktif=1, soft_delete=0)?
--   2. Kalau ada → AKSES DIIZINKAN (super-pass, bypass menu_role check)
--   3. Kalau tidak → fallback ke menu_role check (untuk peran fungsional)
--
-- IDEMPOTENT: aman re-run.
-- ============================================================================

USE pdut;
GO

-- ============================================================================
-- 1. Buat tabel kalau belum ada
-- ============================================================================
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi_default_role'
)
BEGIN
    CREATE TABLE man_akses.aplikasi_default_role (
        id_aplikasi    UNIQUEIDENTIFIER NOT NULL,
        id_peran       INT              NOT NULL,
        a_aktif        BIT              NOT NULL DEFAULT 1,
        soft_delete    BIT              NOT NULL DEFAULT 0,
        tgl_create     DATETIME         NOT NULL DEFAULT GETDATE(),
        last_update    DATETIME         NOT NULL DEFAULT GETDATE(),
        last_sync      DATETIME         NOT NULL DEFAULT GETDATE(),
        id_creator     UNIQUEIDENTIFIER NULL,
        id_updater     UNIQUEIDENTIFIER NULL,

        CONSTRAINT pk_aplikasi_default_role PRIMARY KEY (id_aplikasi, id_peran),
        CONSTRAINT fk_apdr_aplikasi FOREIGN KEY (id_aplikasi)
            REFERENCES man_akses.aplikasi(id_aplikasi),
        CONSTRAINT fk_apdr_peran FOREIGN KEY (id_peran)
            REFERENCES man_akses.peran(id_peran)
    );

    -- Index untuk lookup cepat saat user akses (per peran, scan semua app)
    CREATE INDEX idx_apdr_peran_aktif ON man_akses.aplikasi_default_role
        (id_peran, a_aktif, soft_delete) INCLUDE (id_aplikasi);

    PRINT '✓ Tabel man_akses.aplikasi_default_role berhasil dibuat';
END
ELSE
    PRINT '~ Tabel aplikasi_default_role sudah ada, skip create';
GO

PRINT '';
PRINT 'Tabel aplikasi_default_role siap. Run seed_aplikasi_default_role.sql untuk populate default mapping.'
GO
