-- Description: Grant akses menu Data Unila + Dashboard Pimpinan ke role-role berikut
-- Author: mizar.zulmi
-- Date: 2026-05-18
-- Tested on: staging (VM5) pdut_staging
--
-- Roles yang di-grant ke kedua aplikasi:
--   42  = Kaprodi
--   43  = Dekan
--   47  = Kajur
--   6   = Admin Prodi
--   44  = Admin Jurusan
--   106 = Admin Fakultas
--
-- Effect: 6 role × 2 app × N menu = grant akses full ke semua menu di Data Unila + Dashboard Pimpinan.
-- Idempotent: kalau menu_role kombinasi (id_peran, id_menu) sudah ada → SKIP.
--
-- Catatan filter scope: menu_role hanya define AKSES menu (boleh show/insert/update/delete).
-- Scope organisasi (fakultas/jurusan/prodi user) di-handle terpisah via role_pengguna +
-- middleware RoleScopeFilter di service Laravel/Go.

BEGIN TRANSACTION;

-- ============================================================
-- STEP 0: Bootstrap role 47 (Kajur) kalau belum ada di production
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM man_akses.peran WHERE id_peran = 47)
BEGIN
    INSERT INTO man_akses.peran
        (id_peran, nm_peran, a_perlu_sk, peran_pddikti, peran_unila,
         tgl_create, last_update, last_sync, a_universal, a_peran_identitas)
    VALUES
        (47, 'Kajur', 0, 0, 1, GETDATE(), GETDATE(), GETDATE(), 0, 0);
    PRINT '+ Bootstrap: role Kajur (id_peran=47) ditambahkan ke man_akses.peran';
END

-- ============================================================
-- STEP 1: Validate semua role wajib ada
-- ============================================================
DECLARE @missing VARCHAR(100) = '';
SELECT @missing = @missing + CAST(req.id_peran AS VARCHAR) + ' '
FROM (VALUES (42),(43),(47),(6),(44),(106)) AS req(id_peran)
LEFT JOIN man_akses.peran p ON p.id_peran = req.id_peran
WHERE p.id_peran IS NULL;

IF LEN(@missing) > 0
BEGIN
    PRINT 'ERROR: id_peran missing di man_akses.peran: ' + @missing;
    ROLLBACK TRANSACTION;
    RETURN;
END

-- ============================================================
-- STEP 2: Backup state menu_role utk 6 role (uncomment sekali per run)
-- ============================================================
-- SELECT * INTO man_akses.menu_role_backup_grant_20260518
-- FROM man_akses.menu_role
-- WHERE id_peran IN (42,43,47,6,44,106);

-- ============================================================
-- STEP 3: Build grant matrix — 6 role × semua menu di 2 app
-- ============================================================
DECLARE @target_roles TABLE (id_peran INT);
INSERT INTO @target_roles VALUES (42),(43),(47),(6),(44),(106);

DECLARE @target_apps TABLE (app_slug VARCHAR(100));
INSERT INTO @target_apps VALUES ('data-unila'),('dashboard-pimpinan');

-- Preview: berapa baris yg AKAN di-insert per (role × app)
SELECT
    r.id_peran,
    pe.nm_peran,
    a.app_slug,
    COUNT(m.id_menu) AS total_menu_existing,
    SUM(CASE WHEN mr.id_menu IS NULL THEN 1 ELSE 0 END) AS will_insert,
    SUM(CASE WHEN mr.id_menu IS NOT NULL THEN 1 ELSE 0 END) AS skip_already_exists
FROM @target_roles r
CROSS JOIN @target_apps a
INNER JOIN man_akses.peran pe ON pe.id_peran = r.id_peran
INNER JOIN man_akses.aplikasi app ON app.app_slug = a.app_slug
INNER JOIN man_akses.menu m ON m.id_aplikasi = app.id_aplikasi
LEFT JOIN man_akses.menu_role mr
    ON mr.id_menu = m.id_menu AND mr.id_peran = r.id_peran AND mr.soft_delete = 0
GROUP BY r.id_peran, pe.nm_peran, a.app_slug
ORDER BY a.app_slug, pe.nm_peran;

-- ============================================================
-- STEP 4: INSERT menu_role — idempotent WHERE NOT EXISTS
-- ============================================================
INSERT INTO man_akses.menu_role
    (id_peran, id_menu, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update,
     a_boleh_delete, a_boleh_sanggah, approval_menu, tgl_create, last_update,
     soft_delete, last_sync, id_updater)
SELECT
    r.id_peran,
    m.id_menu,
    'full',
    1,    -- a_boleh_show
    0,    -- a_boleh_insert
    0,    -- a_boleh_update
    0,    -- a_boleh_delete
    0,    -- a_boleh_sanggah
    1,    -- approval_menu = approved
    GETDATE(),
    GETDATE(),
    0,    -- soft_delete
    GETDATE(),
    '11111111-1111-1111-1111-111111111111'
FROM @target_roles r
CROSS JOIN @target_apps a
INNER JOIN man_akses.aplikasi app ON app.app_slug = a.app_slug
INNER JOIN man_akses.menu m ON m.id_aplikasi = app.id_aplikasi
WHERE NOT EXISTS (
    SELECT 1 FROM man_akses.menu_role mr
    WHERE mr.id_peran = r.id_peran
      AND mr.id_menu = m.id_menu
      AND mr.soft_delete = 0
);

DECLARE @mr_inserted INT = @@ROWCOUNT;

-- ============================================================
-- STEP 5: Verify final — count menu_role per (role × app)
-- ============================================================
PRINT 'Total menu_role inserted: ' + CAST(@mr_inserted AS VARCHAR);

SELECT
    pe.id_peran,
    pe.nm_peran,
    a.app_slug,
    COUNT(*) AS total_menu_granted
FROM man_akses.menu_role mr
INNER JOIN man_akses.peran pe ON pe.id_peran = mr.id_peran
INNER JOIN man_akses.menu m ON m.id_menu = mr.id_menu
INNER JOIN man_akses.aplikasi a ON a.id_aplikasi = m.id_aplikasi
WHERE mr.id_peran IN (42,43,47,6,44,106)
  AND a.app_slug IN ('data-unila','dashboard-pimpinan')
  AND mr.soft_delete = 0
GROUP BY pe.id_peran, pe.nm_peran, a.app_slug
ORDER BY a.app_slug, pe.nm_peran;

COMMIT TRANSACTION;
