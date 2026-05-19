-- Description: Grant role "Kepala Bagian/ Koordinator/ PJ" (id_peran=4006) akses
--              ke aplikasi `data-unila` dan `dashboard-pimpinan`.
-- Author: mizar.zulmi
-- Date: 2026-05-19
--
-- State sebelum (staging 2026-05-19): role 4006 a_universal=1 tapi 0 menu_role
-- di kedua app target. Karena Developer (107) sudah di-off a_universal (lihat
-- 20260518_restrict_portal_apps_via_whitelist.sql), konsisten kalau role 4006
-- juga TIDAK universal — pakai mekanisme menu_role + whitelist standar.
--
-- IDEMPOTENT: pakai NOT EXISTS check, aman re-run.
-- Hak: a_boleh_show=1 (read-only), a_boleh_insert/update/delete=0 (Kabag/Koord
-- biasanya tidak edit data Pimpinan/Data Unila, hanya view).

BEGIN TRANSACTION;

DECLARE @creator UNIQUEIDENTIFIER = '11111111-1111-1111-1111-111111111111';
DECLARE @role_id INT = 4006;

-- ============================================================
-- STEP 1: Turn off a_universal (konsisten dgn Developer & policy mekanisme
--          whitelist per-app organisasi).
-- ============================================================
UPDATE man_akses.peran
SET a_universal = 0, last_update = GETDATE()
WHERE id_peran = @role_id
  AND ISNULL(a_universal, 0) = 1;
PRINT 'STEP 1: peran 4006 a_universal di-off (rows affected: ' + CAST(@@ROWCOUNT AS VARCHAR) + ')';

-- ============================================================
-- STEP 2: INSERT menu_role untuk semua menu aktif di data-unila +
--          dashboard-pimpinan (49 menu total = 13 + 36).
-- ============================================================
INSERT INTO man_akses.menu_role
    (id_peran, id_menu, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update,
     a_boleh_delete, a_boleh_sanggah, approval_menu, tgl_create, last_update,
     soft_delete, last_sync, id_updater)
SELECT
    @role_id, m.id_menu, 'view',
    1,  -- a_boleh_show
    0, 0, 0, 0,
    1,  -- approval_menu
    GETDATE(), GETDATE(), 0, GETDATE(), @creator
FROM man_akses.menu m
INNER JOIN man_akses.aplikasi a ON a.id_aplikasi = m.id_aplikasi
WHERE a.app_slug IN ('data-unila', 'dashboard-pimpinan')
  AND m.a_aktif = 1
  AND NOT EXISTS (
      SELECT 1 FROM man_akses.menu_role mr
      WHERE mr.id_menu = m.id_menu
        AND mr.id_peran = @role_id
        AND ISNULL(mr.soft_delete, 0) = 0
  );

DECLARE @inserted INT = @@ROWCOUNT;
PRINT 'STEP 2: menu_role entries inserted: ' + CAST(@inserted AS VARCHAR);

-- ============================================================
-- STEP 3: Verify final state
-- ============================================================
PRINT '--- VERIFICATION ---';
SELECT
    a.app_slug,
    COUNT(DISTINCT m.id_menu) AS total_menu,
    COUNT(DISTINCT mr.id_menu) AS covered_for_role_4006
FROM man_akses.aplikasi a
INNER JOIN man_akses.menu m ON m.id_aplikasi = a.id_aplikasi AND m.a_aktif = 1
LEFT JOIN man_akses.menu_role mr ON mr.id_menu = m.id_menu
    AND mr.id_peran = 4006 AND ISNULL(mr.soft_delete, 0) = 0
WHERE a.app_slug IN ('data-unila', 'dashboard-pimpinan')
GROUP BY a.app_slug;

SELECT id_peran, nm_peran, ISNULL(a_universal,0) AS universal
FROM man_akses.peran WHERE id_peran = 4006;

COMMIT TRANSACTION;
-- ROLLBACK TRANSACTION; -- gunakan kalau STEP 3 verification tidak sesuai

-- ============================================================
-- CATATAN tambahan:
-- 1. Setelah grant menu_role di sini, user yg punya peran 4006 PERLU
--    organisasinya whitelisted di aplikasi_organisasi data-unila +
--    dashboard-pimpinan (sudah ter-populate 17 unit dari script
--    20260518_restrict_portal_apps_via_whitelist.sql). Kalau Kabag
--    organisasinya bukan salah satu dari 17 unit itu, akses tetap BLOCKED
--    oleh filter. Solusi: tambah unit-nya ke whitelist.
-- 2. Cache invalidate session — clear Redis (FLUSHALL) atau user re-login
--    supaya menu_role baru ke-fetch.
-- ============================================================
