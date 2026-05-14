-- Description: Restore menu_role assignments after PortalRbacSeeder incident
-- Author: mizar.zulmi (via Claude AI assist)
-- Date: 2026-05-13
-- Tested on: staging (VM5)
-- Incident: Seeder DELETE+INSERT cycle wiped menu_role for 14 apps, user
--           kehilangan akses ke Data Unila, Dashboard Pimpinan, dll.
-- Rollback: SELECT * FROM man_akses.menu_role_backup_20260513

BEGIN TRANSACTION;

-- ============================================================
-- STEP 0: Backup (sudah dijalankan; uncomment kalau perlu re-run)
-- ============================================================
-- SELECT * INTO man_akses.menu_role_backup_20260513 FROM man_akses.menu_role;

-- ============================================================
-- STEP 1: Define app → roles mapping (sesuai portal_menus/<app>.json)
-- ============================================================
DECLARE @apps TABLE (app_slug VARCHAR(100), id_peran INT);
INSERT INTO @apps VALUES
    -- data-unila
    ('data-unila', 1), ('data-unila', 107), ('data-unila', 42), ('data-unila', 43),
    ('data-unila', 46), ('data-unila', 33), ('data-unila', 38), ('data-unila', 34),
    ('data-unila', 35), ('data-unila', 36), ('data-unila', 37),
    ('data-unila', 6), ('data-unila', 44), ('data-unila', 47), ('data-unila', 106),
    -- dashboard-pimpinan
    ('dashboard-pimpinan', 1), ('dashboard-pimpinan', 107), ('dashboard-pimpinan', 33),
    ('dashboard-pimpinan', 38), ('dashboard-pimpinan', 37), ('dashboard-pimpinan', 36),
    ('dashboard-pimpinan', 35), ('dashboard-pimpinan', 34), ('dashboard-pimpinan', 43),
    -- e-kkn
    ('e-kkn', 1), ('e-kkn', 107), ('e-kkn', 39), ('e-kkn', 46), ('e-kkn', 106),
    ('e-kkn', 43), ('e-kkn', 111),
    -- feeder-integrator + sister-integrator + myunila-integrator (PIMPINAN_FULL)
    ('feeder-integrator', 1), ('feeder-integrator', 107), ('feeder-integrator', 33),
    ('feeder-integrator', 38), ('feeder-integrator', 37), ('feeder-integrator', 36),
    ('feeder-integrator', 35), ('feeder-integrator', 34),
    ('sister-integrator', 1), ('sister-integrator', 107), ('sister-integrator', 33),
    ('sister-integrator', 38), ('sister-integrator', 37), ('sister-integrator', 36),
    ('sister-integrator', 35), ('sister-integrator', 34),
    ('myunila-integrator', 1), ('myunila-integrator', 107), ('myunila-integrator', 33),
    ('myunila-integrator', 38), ('myunila-integrator', 37), ('myunila-integrator', 36),
    ('myunila-integrator', 35), ('myunila-integrator', 34),
    -- manajemen-akses + manajemen-konten + monitoring + webmon (DEVELOPER_ONLY)
    ('manajemen-akses', 1), ('manajemen-akses', 107),
    ('manajemen-konten', 1), ('manajemen-konten', 107),
    ('monitoring', 1), ('monitoring', 107),
    ('webmon', 1), ('webmon', 107),
    -- siakadu
    ('siakadu', 1), ('siakadu', 107), ('siakadu', 39), ('siakadu', 46),
    -- sim-bak
    ('sim-bak', 1), ('sim-bak', 107), ('sim-bak', 39), ('sim-bak', 106),
    ('sim-bak', 43), ('sim-bak', 111),
    -- si-prestasi
    ('si-prestasi', 1), ('si-prestasi', 107), ('si-prestasi', 106);

-- ============================================================
-- STEP 2: Idempotent INSERT (skip kalau sudah ada)
-- ============================================================
INSERT INTO man_akses.menu_role
    (id_peran, id_menu, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update,
     a_boleh_delete, a_boleh_sanggah, approval_menu, tgl_create, last_update,
     soft_delete, last_sync, id_updater)
SELECT
    ap.id_peran,
    m.id_menu,
    'full',
    1,
    CASE WHEN ap.id_peran IN (1, 107) THEN 1 ELSE 0 END,
    CASE WHEN ap.id_peran IN (1, 107) THEN 1 ELSE 0 END,
    CASE WHEN ap.id_peran IN (1, 107) THEN 1 ELSE 0 END,
    0,
    1,
    GETDATE(),
    GETDATE(),
    0,
    GETDATE(),
    '11111111-1111-1111-1111-111111111111'
FROM @apps ap
INNER JOIN man_akses.aplikasi a ON a.app_slug = ap.app_slug
INNER JOIN man_akses.menu m ON m.id_aplikasi = a.id_aplikasi
LEFT JOIN man_akses.menu_role mr
    ON mr.id_menu = m.id_menu AND mr.id_peran = ap.id_peran AND mr.soft_delete = 0
WHERE mr.id_menu IS NULL;

PRINT 'Inserted: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';

-- ============================================================
-- STEP 3: Verify summary
-- ============================================================
SELECT a.app_slug, COUNT(mr.id_peran) AS role_assignments
FROM man_akses.aplikasi a
LEFT JOIN man_akses.menu m ON m.id_aplikasi = a.id_aplikasi
LEFT JOIN man_akses.menu_role mr ON mr.id_menu = m.id_menu AND mr.soft_delete = 0
WHERE a.app_slug IN (SELECT DISTINCT app_slug FROM @apps)
GROUP BY a.app_slug
ORDER BY a.app_slug;

COMMIT TRANSACTION;
-- ROLLBACK TRANSACTION;  -- uncomment + comment COMMIT kalau ada masalah
