-- ============================================================================
-- Add tgl_kadaluarsa to man_akses.role_pengguna
-- ============================================================================
-- Date: 2026-05-08
-- Konteks: Pilar 2 (manual perpanjang) — peran fungsional perlu masa berlaku.
-- Default: NULL (artinya "tidak ada batas waktu" — backward compatible).
-- Admin TIK bisa set tgl_kadaluarsa via tombol "Perpanjang Role" di
-- Manajemen Akses Pusat. Default suggest +1 tahun dari tgl_sk_penugasan.
--
-- IDEMPOTENT: aman re-run.
-- ============================================================================

USE pdut;
GO

-- 1. Tambah kolom kalau belum ada
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'man_akses'
      AND TABLE_NAME = 'role_pengguna'
      AND COLUMN_NAME = 'tgl_kadaluarsa'
)
BEGIN
    ALTER TABLE man_akses.role_pengguna
        ADD tgl_kadaluarsa DATETIME NULL;
    PRINT '✓ Column tgl_kadaluarsa added to man_akses.role_pengguna';
END
ELSE
    PRINT '~ Column tgl_kadaluarsa sudah ada, skip';
GO

-- 2. Index untuk lookup cepat kandidat akan_expire & expired
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'idx_role_pengguna_kadaluarsa'
      AND object_id = OBJECT_ID('man_akses.role_pengguna')
)
BEGIN
    CREATE INDEX idx_role_pengguna_kadaluarsa
        ON man_akses.role_pengguna (tgl_kadaluarsa, soft_delete)
        INCLUDE (id_role_pengguna, id_pengguna, id_peran);
    PRINT '✓ Index idx_role_pengguna_kadaluarsa created';
END
ELSE
    PRINT '~ Index idx_role_pengguna_kadaluarsa sudah ada, skip';
GO

PRINT '';
PRINT '=== Sample row count by kadaluarsa status ===';
SELECT
    CASE
        WHEN tgl_kadaluarsa IS NULL                              THEN 'tanpa-batas'
        WHEN tgl_kadaluarsa < GETDATE()                          THEN 'expired'
        WHEN tgl_kadaluarsa < DATEADD(DAY, 30, GETDATE())        THEN 'akan-expire-30d'
        ELSE 'aktif'
    END AS kategori,
    COUNT(*) AS jumlah
FROM man_akses.role_pengguna
WHERE ISNULL(soft_delete, 0) = 0
GROUP BY
    CASE
        WHEN tgl_kadaluarsa IS NULL                              THEN 'tanpa-batas'
        WHEN tgl_kadaluarsa < GETDATE()                          THEN 'expired'
        WHEN tgl_kadaluarsa < DATEADD(DAY, 30, GETDATE())        THEN 'akan-expire-30d'
        ELSE 'aktif'
    END;
GO
