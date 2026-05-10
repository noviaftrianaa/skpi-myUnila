-- ============================================================================
-- Add a_peran_identitas flag to man_akses.peran
-- ============================================================================
-- Date: 2026-05-08
-- Konteks: pisahkan "peran identitas" (Mahasiswa/Dosen/Tendik) yang lifecycle-nya
-- otomatis dari sumber data resmi (sso-radius sync) DARI peran fungsional yang
-- lifecycle-nya pakai SK + tgl_kadaluarsa manual.
--
-- Lifecycle script (auto-expire, recertification, dll) cek flag ini:
--   - a_peran_identitas = 1 → SKIP (auto-handled by data sync)
--   - a_peran_identitas = 0 → MASUK lifecycle (SK + expire date wajib)
--
-- IDEMPOTENT: aman re-run.
-- ============================================================================

USE pdut;
GO

-- ============================================================================
-- 1. Add column kalau belum ada
-- ============================================================================
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'man_akses'
      AND TABLE_NAME = 'peran'
      AND COLUMN_NAME = 'a_peran_identitas'
)
BEGIN
    ALTER TABLE man_akses.peran
        ADD a_peran_identitas BIT NOT NULL DEFAULT 0;
    PRINT '✓ Column a_peran_identitas added to man_akses.peran';
END
ELSE
    PRINT '~ Column a_peran_identitas sudah ada, skip';
GO

-- ============================================================================
-- 2. Set flag untuk peran identitas yang sudah ada
-- ============================================================================
-- Mahasiswa (39), Dosen (46), Tenaga Kependidikan (111)
UPDATE man_akses.peran
SET a_peran_identitas = 1, last_update = GETDATE()
WHERE id_peran IN (39, 46, 111)
  AND a_peran_identitas != 1;
PRINT '✓ Set a_peran_identitas=1 untuk peran 39 (Mahasiswa), 46 (Dosen), 111 (Tendik)';
GO

-- ============================================================================
-- 3. Verifikasi
-- ============================================================================
PRINT '';
PRINT '=== Peran Identitas (a_peran_identitas=1) ===';
SELECT id_peran, nm_peran, a_universal, a_peran_identitas
FROM man_akses.peran
WHERE a_peran_identitas = 1
ORDER BY id_peran;
GO
