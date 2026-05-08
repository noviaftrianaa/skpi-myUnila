-- ============================================================================
-- Set Universal Role — peran yang BYPASS permission check
-- ============================================================================
-- Date: 2026-05-08
--
-- Konteks: refactor isSuperRole() di auth-service dari hardcoded list
-- (config/auth.php) → DB-driven via kolom peran.a_universal.
--
-- Sebelum refactor:
--   super roles = [1 Administrator, 107 Developer] (hardcoded)
--
-- Setelah refactor:
--   super roles = peran WHERE a_universal = 1 (database-driven)
--
-- Saran setting:
--   - Developer (107) → a_universal=1   (tim TIK butuh akses semua app)
--   - Administrator (1) → a_universal=0  (harus ada menu_role mapping eksplisit)
--   - Super Admin (2009) → opsional (ingin tetap super atau tidak)
--
-- IDEMPOTENT: aman re-run.
-- ============================================================================

USE pdut;
GO

PRINT '=== State sebelum update ==='
SELECT id_peran, nm_peran, a_universal
FROM man_akses.peran
WHERE id_peran IN (1, 107, 2009) OR a_universal = 1
ORDER BY id_peran;
GO

-- ============================================================================
-- Set Developer (107) sebagai super role (a_universal=1)
-- Pertimbangan: tim UPT TIK selalu butuh akses developer ke semua app
-- untuk troubleshooting / development.
-- ============================================================================
UPDATE man_akses.peran
SET a_universal = 1, last_update = GETDATE()
WHERE id_peran = 107 AND a_universal != 1;
GO

-- ============================================================================
-- (OPSIONAL) Set Super Admin (2009) sebagai super role
-- Uncomment baris di bawah kalau Bapak ingin Super Admin tetap bypass:
-- ============================================================================
-- UPDATE man_akses.peran
-- SET a_universal = 1, last_update = GETDATE()
-- WHERE id_peran = 2009 AND a_universal != 1;
-- GO

-- ============================================================================
-- (OPSIONAL) Pastikan Administrator (1) BUKAN super role
-- Sehingga butuh menu_role mapping eksplisit untuk akses tiap app.
-- ============================================================================
-- UPDATE man_akses.peran
-- SET a_universal = 0, last_update = GETDATE()
-- WHERE id_peran = 1 AND a_universal != 0;
-- GO

PRINT '=== State setelah update ==='
SELECT id_peran, nm_peran, a_universal
FROM man_akses.peran
WHERE id_peran IN (1, 107, 2009) OR a_universal = 1
ORDER BY id_peran;
GO

PRINT 'Selesai. Restart auth-service ATAU clear Redis cache (super_role:*) supaya perubahan langsung berlaku.'
PRINT 'Auto-invalidate sudah ada di RolePenggunaController, tapi kalau update peran via SQL langsung, perlu manual:'
PRINT '   docker exec myunila-auth-staging php artisan cache:clear'
GO
