-- Description: Grant menu_role utk Developer (id_peran=107) ke SEMUA menu aktif
--              di SEMUA aplikasi aktif. Sebelumnya Developer pakai
--              `peran.a_universal=1` (bypass menu_role check). Setelah
--              a_universal=0 (script 20260518), Developer kehilangan akses
--              karena tidak punya menu_role explicit.
-- Author: mizar.zulmi
-- Date: 2026-05-19
--
-- Logic: kombinasi mekanisme yang user inginkan:
--   - Developer punya menu_role di SEMUA app (akses generic, sebelumnya via universal)
--   - Tapi tunduk ke filter aplikasi_organisasi:
--     * data-unila + dashboard-pimpinan: whitelist 17 unit (sudah ada)
--     * 10 Tools+DataPelaporan: whitelist UPT TIK only (sudah ada)
--     * App lain: tidak ada filter — Developer tetap akses semua
--
-- Akhirnya, Developer @ FEB akan:
--   - Akses data-unila/dashboard-pimpinan: PASS (FEB di whitelist)
--   - Akses 10 Tools+Data: BLOCKED (cuma UPT TIK)
--   - Akses app lain (Helpdesk, Beasiswa, dll): PASS
--   = sesuai requirement user.
--
-- IDEMPOTENT: NOT EXISTS check, aman re-run.

BEGIN TRANSACTION;

DECLARE @creator UNIQUEIDENTIFIER = '11111111-1111-1111-1111-111111111111';
DECLARE @role_id INT = 107;

INSERT INTO man_akses.menu_role
    (id_peran, id_menu, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update,
     a_boleh_delete, a_boleh_sanggah, approval_menu, tgl_create, last_update,
     soft_delete, last_sync, id_updater)
SELECT
    @role_id, m.id_menu, 'full',
    1, 1, 1, 1, 1,  -- Developer = full CRUD (sebelumnya via a_universal)
    1,
    GETDATE(), GETDATE(), 0, GETDATE(), @creator
FROM man_akses.menu m
INNER JOIN man_akses.aplikasi a ON a.id_aplikasi = m.id_aplikasi
WHERE m.a_aktif = 1
  AND ISNULL(a.a_aktif, 0) = 1
  AND NOT EXISTS (
      SELECT 1 FROM man_akses.menu_role mr
      WHERE mr.id_menu = m.id_menu
        AND mr.id_peran = @role_id
        AND ISNULL(mr.soft_delete, 0) = 0
  );

DECLARE @inserted INT = @@ROWCOUNT;
PRINT 'menu_role inserted for Developer (107): ' + CAST(@inserted AS VARCHAR);

-- ============================================================
-- Verify: count menu_role Developer per app aktif
-- ============================================================
SELECT
    a.app_slug,
    ISNULL(a.a_filter_organisasi, 0) AS filter_aktif,
    COUNT(DISTINCT m.id_menu) AS total_menu,
    COUNT(DISTINCT mr.id_menu) AS dev_covered
FROM man_akses.aplikasi a
INNER JOIN man_akses.menu m ON m.id_aplikasi = a.id_aplikasi AND m.a_aktif = 1
LEFT JOIN man_akses.menu_role mr ON mr.id_menu = m.id_menu
    AND mr.id_peran = 107 AND ISNULL(mr.soft_delete, 0) = 0
WHERE ISNULL(a.a_aktif, 0) = 1
  AND ISNULL(a.a_tampil_portal, 0) = 1
GROUP BY a.app_slug, a.a_filter_organisasi
ORDER BY a.app_slug;

COMMIT TRANSACTION;
