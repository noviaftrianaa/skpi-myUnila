-- Description: Ensure SEMUA role yg sudah punya akses Data Unila / Dashboard Pimpinan
--              meng-cover SEMUA menu (parent + child) di app tsb.
-- Author: mizar.zulmi
-- Date: 2026-05-18
--
-- Use case: setelah repair_menu_data_unila ADD parent "Data Lulusan" (#data-alumni)
-- baru, role yg sudah punya menu_role lain di app ini TIDAK otomatis dapat menu
-- baru. Akibatnya child di bawah parent baru tampil orphan di sidebar.
--
-- Logic: untuk tiap (app, role) yang sudah punya minimal 1 menu_role entry,
-- pastikan punya entry untuk SEMUA menu aktif di app tsb. INSERT WHERE NOT EXISTS.
-- Berlaku ke SEMUA role yang sudah punya akses (Administrator/Developer/Dekan/dst),
-- TIDAK ada hardcoded list.

BEGIN TRANSACTION;

-- ============================================================
-- STEP 0: Preview — berapa entry yg akan di-insert per (app, role)
-- ============================================================
SELECT
    a.app_slug,
    pe.id_peran,
    pe.nm_peran,
    (SELECT COUNT(*) FROM man_akses.menu mm
     WHERE mm.id_aplikasi = a.id_aplikasi AND mm.a_aktif = 1) AS total_menus,
    (SELECT COUNT(*) FROM man_akses.menu_role mr
     INNER JOIN man_akses.menu mm ON mm.id_menu = mr.id_menu
     WHERE mm.id_aplikasi = a.id_aplikasi AND mm.a_aktif = 1
       AND mr.id_peran = pe.id_peran AND ISNULL(mr.soft_delete, 0) = 0) AS current_covered,
    (SELECT COUNT(*) FROM man_akses.menu mm
     WHERE mm.id_aplikasi = a.id_aplikasi AND mm.a_aktif = 1
       AND NOT EXISTS (
         SELECT 1 FROM man_akses.menu_role mr
         WHERE mr.id_menu = mm.id_menu AND mr.id_peran = pe.id_peran
           AND ISNULL(mr.soft_delete, 0) = 0
       )) AS will_insert
FROM man_akses.aplikasi a
CROSS JOIN man_akses.peran pe
WHERE a.app_slug IN ('data-unila', 'dashboard-pimpinan')
  AND EXISTS (
    -- Role yg SUDAH punya minimal 1 menu_role di app tsb (target perluasan)
    SELECT 1 FROM man_akses.menu_role mr
    INNER JOIN man_akses.menu mm ON mm.id_menu = mr.id_menu
    WHERE mm.id_aplikasi = a.id_aplikasi AND mr.id_peran = pe.id_peran
      AND ISNULL(mr.soft_delete, 0) = 0
  )
ORDER BY a.app_slug, pe.id_peran;

-- ============================================================
-- STEP 1: INSERT menu_role untuk semua menu yang belum ter-cover
-- ============================================================
INSERT INTO man_akses.menu_role
    (id_peran, id_menu, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update,
     a_boleh_delete, a_boleh_sanggah, approval_menu, tgl_create, last_update,
     soft_delete, last_sync, id_updater)
SELECT
    existing.id_peran,
    m.id_menu,
    'full',
    1,    -- a_boleh_show
    0, 0, 0, 0,
    1,    -- approval_menu
    GETDATE(),
    GETDATE(),
    0,
    GETDATE(),
    '11111111-1111-1111-1111-111111111111'
FROM man_akses.menu m
INNER JOIN man_akses.aplikasi a ON a.id_aplikasi = m.id_aplikasi
-- Distinct role yg sudah ada di app ini
INNER JOIN (
    SELECT DISTINCT mr.id_peran, mm.id_aplikasi
    FROM man_akses.menu_role mr
    INNER JOIN man_akses.menu mm ON mm.id_menu = mr.id_menu
    WHERE ISNULL(mr.soft_delete, 0) = 0
) existing ON existing.id_aplikasi = a.id_aplikasi
WHERE a.app_slug IN ('data-unila', 'dashboard-pimpinan')
  AND m.a_aktif = 1
  AND NOT EXISTS (
    SELECT 1 FROM man_akses.menu_role mr
    WHERE mr.id_menu = m.id_menu AND mr.id_peran = existing.id_peran
      AND ISNULL(mr.soft_delete, 0) = 0
  );

DECLARE @inserted INT = @@ROWCOUNT;
PRINT 'menu_role entries inserted: ' + CAST(@inserted AS VARCHAR);

-- ============================================================
-- STEP 2: Verify post-state
-- ============================================================
SELECT
    a.app_slug,
    pe.id_peran,
    pe.nm_peran,
    COUNT(DISTINCT mr.id_menu) AS covered_menus
FROM man_akses.aplikasi a
INNER JOIN man_akses.menu m ON m.id_aplikasi = a.id_aplikasi AND m.a_aktif = 1
INNER JOIN man_akses.menu_role mr ON mr.id_menu = m.id_menu AND ISNULL(mr.soft_delete, 0) = 0
INNER JOIN man_akses.peran pe ON pe.id_peran = mr.id_peran
WHERE a.app_slug IN ('data-unila', 'dashboard-pimpinan')
GROUP BY a.app_slug, pe.id_peran, pe.nm_peran
ORDER BY a.app_slug, pe.id_peran;

COMMIT TRANSACTION;
