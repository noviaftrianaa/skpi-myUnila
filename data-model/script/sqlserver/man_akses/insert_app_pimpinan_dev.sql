-- ============================================================================
-- Register app "Dashboard Pimpinan (Dev)" — lab eksperimen magang
-- ============================================================================
-- Date: 2026-05-11
-- Konteks: app terpisah dari Dashboard Pimpinan utama, untuk demo kerja
-- mahasiswa magang (folder frontend /dashboard/pimpinan-dev).
-- App ini diakses lewat portal myUnila — sidebar 4 menu eksperimen.
-- Akses awal: Developer (107) + Administrator (1) only.
--
-- IDEMPOTENT: aman re-run.
-- ============================================================================

USE pdut;
GO

DECLARE @id_app UNIQUEIDENTIFIER;
DECLARE @id_kategori UNIQUEIDENTIFIER;
DECLARE @id_org UNIQUEIDENTIFIER;

-- 1. Lookup kategori "Tools & Utilities" + organisasi UPT TIK
SELECT @id_kategori = id_kategori FROM man_akses.kategori_aplikasi WHERE nm_kategori = 'Tools & Utilities';
SELECT TOP 1 @id_org = id_organisasi FROM man_akses.unit_organisasi WHERE nm_lemb LIKE '%Teknologi Informasi dan Komunikasi%';

-- 2. Register app (idempotent — skip kalau slug sudah ada)
IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE app_slug = 'dashboard-pimpinan-dev')
BEGIN
    SET @id_app = NEWID();
    INSERT INTO man_akses.aplikasi (
        id_aplikasi, nm_aplikasi, ket_aplikasi, url, icon_name, icon_color,
        id_kategori, id_organisasi, app_slug, urutan,
        a_terintegrasi, a_coming_soon, a_tampil_portal, a_aktif, a_filter_organisasi,
        tgl_create, last_update, last_sync
    ) VALUES (
        @id_app, 'Dashboard Pimpinan (Dev)',
        'Lab eksperimen Dashboard Pimpinan — kerja mahasiswa magang dengan role-based filtering',
        '/dashboard/pimpinan-dev', 'heroicons:beaker', 'text-amber-600',
        @id_kategori, @id_org, 'dashboard-pimpinan-dev', 99,
        1, 0, 1, 1, 0,
        GETDATE(), GETDATE(), GETDATE()
    );
    PRINT '✓ App dashboard-pimpinan-dev inserted';
END
ELSE
BEGIN
    SELECT @id_app = id_aplikasi FROM man_akses.aplikasi WHERE app_slug = 'dashboard-pimpinan-dev';
    PRINT '~ App sudah ada, skip insert';
END
GO

-- 3. Register 4 sidebar menu
DECLARE @id_app UNIQUEIDENTIFIER;
SELECT @id_app = id_aplikasi FROM man_akses.aplikasi WHERE app_slug = 'dashboard-pimpinan-dev';

DECLARE @menus TABLE (nm VARCHAR(100), nm_file VARCHAR(255), icon VARCHAR(100), urutan INT);
INSERT INTO @menus VALUES
    ('Beranda Eksperimen',    '/dashboard/pimpinan-dev',            'heroicons:home',          1),
    ('Akreditasi Eksperimen', '/dashboard/pimpinan-dev/akreditasi', 'heroicons:academic-cap', 2),
    ('Dosen Eksperimen',      '/dashboard/pimpinan-dev/dosen',      'heroicons:user-circle',  3),
    ('Rasio Eksperimen',      '/dashboard/pimpinan-dev/rasio',      'heroicons:scale',        4);

INSERT INTO man_akses.menu (
    id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil,
    icon, level_menu, id_aplikasi, id_group_menu,
    tgl_create, last_update, last_sync
)
SELECT NEWID(), m.nm, m.nm_file, m.urutan, 1, 1, m.icon, 1, @id_app, NULL,
       GETDATE(), GETDATE(), GETDATE()
FROM @menus m
WHERE NOT EXISTS (
    SELECT 1 FROM man_akses.menu mn
    WHERE mn.nm_file = m.nm_file AND mn.expired_date IS NULL
);
PRINT '✓ Menu sidebar dashboard-pimpinan-dev registered';
GO

-- 4. Grant menu_role ke Developer (107) + Administrator (1)
DECLARE @id_app UNIQUEIDENTIFIER;
SELECT @id_app = id_aplikasi FROM man_akses.aplikasi WHERE app_slug = 'dashboard-pimpinan-dev';

INSERT INTO man_akses.menu_role (
    id_peran, id_menu, akses_menu,
    a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah,
    approval_menu, tgl_create, last_update, soft_delete, last_sync, id_updater
)
SELECT p.id_peran, m.id_menu, 'full',
       1, 1, 1, 1, 0,
       1, GETDATE(), GETDATE(), 0, GETDATE(),
       '00000000-0000-0000-0000-000000000000'
FROM (VALUES (107), (1)) p(id_peran)
CROSS JOIN man_akses.menu m
WHERE m.id_aplikasi = @id_app
  AND m.expired_date IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM man_akses.menu_role mr
      WHERE mr.id_peran = p.id_peran AND mr.id_menu = m.id_menu
        AND ISNULL(mr.soft_delete, 0) = 0
  );
PRINT '✓ Granted ke Developer (107) + Administrator (1)';
GO

PRINT '';
PRINT '=== Verifikasi ===';
SELECT a.app_slug, a.nm_aplikasi, COUNT(m.id_menu) AS jml_menu
FROM man_akses.aplikasi a
LEFT JOIN man_akses.menu m ON m.id_aplikasi = a.id_aplikasi AND m.expired_date IS NULL
WHERE a.app_slug = 'dashboard-pimpinan-dev'
GROUP BY a.app_slug, a.nm_aplikasi;
GO
