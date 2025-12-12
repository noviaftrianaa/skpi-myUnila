-- ============================================================================
-- SEEDER: Portal Menu & Menu Role
-- Description: Create menus for portal apps and assign roles
-- Prerequisite: Run portal_aplikasi_seeder.sql first!
-- Date: 2025-12-11
-- ============================================================================

-- ============================================================================
-- STEP 1: Define Role Constants
-- ============================================================================
DECLARE @ROLE_ADMINISTRATOR INT = 1;
DECLARE @ROLE_DEVELOPER INT = 107;
DECLARE @ROLE_MAHASISWA INT = 2;
DECLARE @ROLE_DOSEN INT = 3;
DECLARE @ROLE_TENDIK INT = 111;
DECLARE @ROLE_REKTOR INT = 38;
DECLARE @ROLE_WAKIL_REKTOR_1 INT = 33;
DECLARE @ROLE_WAKIL_REKTOR_2 INT = 34;
DECLARE @ROLE_WAKIL_REKTOR_3 INT = 35;
DECLARE @ROLE_WAKIL_REKTOR_4 INT = 36;
DECLARE @ROLE_DEKAN INT = 40;
DECLARE @ROLE_KAPRODI INT = 5;
DECLARE @ROLE_ADMIN_PRODI INT = 6;
DECLARE @ROLE_ADMIN_FAKULTAS INT = 106;
DECLARE @ROLE_LP3M INT = 33;
DECLARE @ROLE_HELPDESK INT = 32;

PRINT 'Starting Portal Menu Seeder...';

-- ============================================================================
-- STEP 2: Create Temp Table for App-Role Mapping
-- ============================================================================
CREATE TABLE #AppRoleMapping (
    app_slug VARCHAR(100),
    role_id INT
);

-- Developer/Admin only tools
INSERT INTO #AppRoleMapping VALUES ('api-gateway', @ROLE_ADMINISTRATOR);
INSERT INTO #AppRoleMapping VALUES ('api-gateway', @ROLE_DEVELOPER);
INSERT INTO #AppRoleMapping VALUES ('monitoring', @ROLE_ADMINISTRATOR);
INSERT INTO #AppRoleMapping VALUES ('monitoring', @ROLE_DEVELOPER);
INSERT INTO #AppRoleMapping VALUES ('manajemen-akses', @ROLE_ADMINISTRATOR);
INSERT INTO #AppRoleMapping VALUES ('manajemen-akses', @ROLE_DEVELOPER);

-- Pimpinan dashboard & Data apps
INSERT INTO #AppRoleMapping VALUES ('dashboard-pimpinan', @ROLE_ADMINISTRATOR);
INSERT INTO #AppRoleMapping VALUES ('dashboard-pimpinan', @ROLE_DEVELOPER);
INSERT INTO #AppRoleMapping VALUES ('dashboard-pimpinan', @ROLE_REKTOR);
INSERT INTO #AppRoleMapping VALUES ('dashboard-pimpinan', @ROLE_WAKIL_REKTOR_1);
INSERT INTO #AppRoleMapping VALUES ('dashboard-pimpinan', @ROLE_WAKIL_REKTOR_2);
INSERT INTO #AppRoleMapping VALUES ('dashboard-pimpinan', @ROLE_WAKIL_REKTOR_3);
INSERT INTO #AppRoleMapping VALUES ('dashboard-pimpinan', @ROLE_WAKIL_REKTOR_4);
INSERT INTO #AppRoleMapping VALUES ('dashboard-pimpinan', @ROLE_LP3M);

INSERT INTO #AppRoleMapping VALUES ('iku-dashboard', @ROLE_ADMINISTRATOR);
INSERT INTO #AppRoleMapping VALUES ('iku-dashboard', @ROLE_DEVELOPER);
INSERT INTO #AppRoleMapping VALUES ('iku-dashboard', @ROLE_REKTOR);
INSERT INTO #AppRoleMapping VALUES ('iku-dashboard', @ROLE_WAKIL_REKTOR_1);
INSERT INTO #AppRoleMapping VALUES ('iku-dashboard', @ROLE_WAKIL_REKTOR_2);
INSERT INTO #AppRoleMapping VALUES ('iku-dashboard', @ROLE_WAKIL_REKTOR_3);
INSERT INTO #AppRoleMapping VALUES ('iku-dashboard', @ROLE_WAKIL_REKTOR_4);
INSERT INTO #AppRoleMapping VALUES ('iku-dashboard', @ROLE_LP3M);

-- Data dan Pelaporan
INSERT INTO #AppRoleMapping VALUES ('feeder-integrator', @ROLE_ADMINISTRATOR);
INSERT INTO #AppRoleMapping VALUES ('feeder-integrator', @ROLE_DEVELOPER);
INSERT INTO #AppRoleMapping VALUES ('feeder-integrator', @ROLE_REKTOR);
INSERT INTO #AppRoleMapping VALUES ('feeder-integrator', @ROLE_WAKIL_REKTOR_1);
INSERT INTO #AppRoleMapping VALUES ('feeder-integrator', @ROLE_LP3M);

INSERT INTO #AppRoleMapping VALUES ('sister-integrator', @ROLE_ADMINISTRATOR);
INSERT INTO #AppRoleMapping VALUES ('sister-integrator', @ROLE_DEVELOPER);
INSERT INTO #AppRoleMapping VALUES ('sister-integrator', @ROLE_REKTOR);
INSERT INTO #AppRoleMapping VALUES ('sister-integrator', @ROLE_WAKIL_REKTOR_1);
INSERT INTO #AppRoleMapping VALUES ('sister-integrator', @ROLE_LP3M);

INSERT INTO #AppRoleMapping VALUES ('myunila-integrator', @ROLE_ADMINISTRATOR);
INSERT INTO #AppRoleMapping VALUES ('myunila-integrator', @ROLE_DEVELOPER);

INSERT INTO #AppRoleMapping VALUES ('data-unila', @ROLE_ADMINISTRATOR);
INSERT INTO #AppRoleMapping VALUES ('data-unila', @ROLE_DEVELOPER);
INSERT INTO #AppRoleMapping VALUES ('data-unila', @ROLE_REKTOR);
INSERT INTO #AppRoleMapping VALUES ('data-unila', @ROLE_WAKIL_REKTOR_1);

-- Akademik apps (everyone)
DECLARE @akademik_apps TABLE (slug VARCHAR(100));
INSERT INTO @akademik_apps VALUES ('siakadu'), ('e-kkn'), ('berdampak-mbkm'), ('v-class'), ('wali'), ('sikebas'), ('presensi-sirandu'), ('spmi');

INSERT INTO #AppRoleMapping
SELECT slug, @ROLE_ADMINISTRATOR FROM @akademik_apps
UNION ALL SELECT slug, @ROLE_DEVELOPER FROM @akademik_apps
UNION ALL SELECT slug, @ROLE_MAHASISWA FROM @akademik_apps
UNION ALL SELECT slug, @ROLE_DOSEN FROM @akademik_apps
UNION ALL SELECT slug, @ROLE_KAPRODI FROM @akademik_apps
UNION ALL SELECT slug, @ROLE_ADMIN_PRODI FROM @akademik_apps
UNION ALL SELECT slug, @ROLE_ADMIN_FAKULTAS FROM @akademik_apps
UNION ALL SELECT slug, @ROLE_DEKAN FROM @akademik_apps;

-- Kepegawaian
INSERT INTO #AppRoleMapping VALUES ('sikep', @ROLE_ADMINISTRATOR);
INSERT INTO #AppRoleMapping VALUES ('sikep', @ROLE_DEVELOPER);
INSERT INTO #AppRoleMapping VALUES ('sikep', @ROLE_DOSEN);
INSERT INTO #AppRoleMapping VALUES ('sikep', @ROLE_TENDIK);

-- Riset
DECLARE @riset_apps TABLE (slug VARCHAR(100));
INSERT INTO @riset_apps VALUES ('si-penelitian'), ('si-pengabdian'), ('si-publikasi'), ('sikerma');

INSERT INTO #AppRoleMapping
SELECT slug, @ROLE_ADMINISTRATOR FROM @riset_apps
UNION ALL SELECT slug, @ROLE_DEVELOPER FROM @riset_apps
UNION ALL SELECT slug, @ROLE_DOSEN FROM @riset_apps
UNION ALL SELECT slug, @ROLE_KAPRODI FROM @riset_apps
UNION ALL SELECT slug, @ROLE_DEKAN FROM @riset_apps;

-- Kemahasiswaan
DECLARE @kemahasiswaan_apps TABLE (slug VARCHAR(100));
INSERT INTO @kemahasiswaan_apps VALUES ('si-prestasi'), ('beasiswa'), ('ormawa'), ('minat-bakat');

INSERT INTO #AppRoleMapping
SELECT slug, @ROLE_ADMINISTRATOR FROM @kemahasiswaan_apps
UNION ALL SELECT slug, @ROLE_DEVELOPER FROM @kemahasiswaan_apps
UNION ALL SELECT slug, @ROLE_MAHASISWA FROM @kemahasiswaan_apps;

-- Alumni & Layanan (everyone)
DECLARE @public_apps TABLE (slug VARCHAR(100));
INSERT INTO @public_apps VALUES ('tracer-study'), ('service-layanan'), ('helpdesk-tik'), ('blog-unila');

INSERT INTO #AppRoleMapping
SELECT slug, @ROLE_ADMINISTRATOR FROM @public_apps
UNION ALL SELECT slug, @ROLE_DEVELOPER FROM @public_apps
UNION ALL SELECT slug, @ROLE_MAHASISWA FROM @public_apps
UNION ALL SELECT slug, @ROLE_DOSEN FROM @public_apps
UNION ALL SELECT slug, @ROLE_TENDIK FROM @public_apps;

-- ============================================================================
-- STEP 3: Create Menus for Each Portal App
-- ============================================================================
PRINT 'Creating menus for portal apps...';

DECLARE @app_id UNIQUEIDENTIFIER;
DECLARE @app_name VARCHAR(100);
DECLARE @app_slug VARCHAR(100);
DECLARE @menu_id UNIQUEIDENTIFIER;
DECLARE @menu_name VARCHAR(150);

DECLARE app_cursor CURSOR FOR
    SELECT id_aplikasi, nm_aplikasi, app_slug
    FROM man_akses.aplikasi
    WHERE a_tampil_portal = 1 AND app_slug IS NOT NULL;

OPEN app_cursor;
FETCH NEXT FROM app_cursor INTO @app_id, @app_name, @app_slug;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @menu_name = 'Portal: ' + @app_name;

    -- Check if menu exists
    SELECT @menu_id = id_menu FROM man_akses.menu
    WHERE id_aplikasi = @app_id AND nm_menu = @menu_name;

    IF @menu_id IS NULL
    BEGIN
        SET @menu_id = NEWID();

        INSERT INTO man_akses.menu
        (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, tgl_create, last_update, last_sync)
        VALUES (@menu_id, @menu_name, 'portal-access', 1, 1, 1, 'portal', 0, @app_id, GETDATE(), GETDATE(), GETDATE());

        PRINT '  + Menu created: ' + @menu_name;
    END
    ELSE
    BEGIN
        PRINT '  - Menu exists: ' + @menu_name;
    END

    -- Assign roles to this menu
    INSERT INTO man_akses.menu_role
    (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, a_boleh_sanggah, approval_menu, tgl_create, last_update, soft_delete, last_sync, id_updater)
    SELECT DISTINCT
        arm.role_id,
        @menu_id,
        'full',
        1, 1, 0, 0, 0, 1,
        GETDATE(), GETDATE(), 0, GETDATE(),
        '00000000-0000-0000-0000-000000000000'
    FROM #AppRoleMapping arm
    WHERE arm.app_slug = @app_slug
      AND NOT EXISTS (
          SELECT 1 FROM man_akses.menu_role mr
          WHERE mr.id_menu = @menu_id AND mr.id_peran = arm.role_id
      );

    FETCH NEXT FROM app_cursor INTO @app_id, @app_name, @app_slug;
END

CLOSE app_cursor;
DEALLOCATE app_cursor;

-- Clean up
DROP TABLE #AppRoleMapping;

-- ============================================================================
-- STEP 4: Verification
-- ============================================================================
PRINT '';
PRINT '=== VERIFICATION ===';

SELECT 'Portal Menus: ' + CAST(COUNT(*) AS VARCHAR) as info
FROM man_akses.menu WHERE nm_menu LIKE 'Portal:%';

SELECT 'Menu-Role Assignments: ' + CAST(COUNT(*) AS VARCHAR) as info
FROM man_akses.menu_role mr
INNER JOIN man_akses.menu m ON m.id_menu = mr.id_menu
WHERE m.nm_menu LIKE 'Portal:%';

-- Show summary by role
SELECT
    p.nm_peran,
    COUNT(mr.id_menu) as app_count
FROM man_akses.peran p
INNER JOIN man_akses.menu_role mr ON mr.id_peran = p.id_peran
INNER JOIN man_akses.menu m ON m.id_menu = mr.id_menu
WHERE m.nm_menu LIKE 'Portal:%'
GROUP BY p.id_peran, p.nm_peran
ORDER BY app_count DESC;

PRINT '';
PRINT '=== Portal Menu Seeder Completed ===';
