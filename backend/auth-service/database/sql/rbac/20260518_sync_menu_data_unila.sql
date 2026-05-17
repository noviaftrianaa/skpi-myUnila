-- Description: Sync menu Data Unila (Dashboard + 7 group + 28 sub-menu canonical)
-- Author: mizar.zulmi
-- Date: 2026-05-18
-- Tested on: staging (VM5) — selaras dengan portal_menus/data-unila.json
-- Rollback: SELECT * INTO man_akses.menu_dataunila_backup_20260518 FROM man_akses.menu
--          WHERE id_aplikasi = (SELECT id_aplikasi FROM man_akses.aplikasi WHERE app_slug='data-unila');

BEGIN TRANSACTION;

DECLARE @id_app UNIQUEIDENTIFIER;
SELECT @id_app = id_aplikasi FROM man_akses.aplikasi WHERE app_slug = 'data-unila';

IF @id_app IS NULL
BEGIN
    RAISERROR('App "data-unila" tidak ditemukan di man_akses.aplikasi', 16, 1);
    ROLLBACK TRANSACTION;
    RETURN;
END

-- ============================================================
-- STEP 0: Backup state (uncomment sekali per run)
-- ============================================================
-- SELECT * INTO man_akses.menu_dataunila_backup_20260518
-- FROM man_akses.menu WHERE id_aplikasi = @id_app;

-- ============================================================
-- STEP 1: Parent menus (level_menu = 1)
-- ============================================================
DECLARE @parents TABLE (nm_menu VARCHAR(255), nm_file VARCHAR(500), icon VARCHAR(100), urutan INT);
INSERT INTO @parents VALUES
    ('Dashboard',           '/dashboard/data-unila',  'heroicons:chart-bar-square',  1),
    ('Data Mahasiswa',      '#data-mahasiswa',        'heroicons:academic-cap',      2),
    ('Data Dosen & Tendik', '#data-dosen',            'heroicons:user-group',        3),
    ('Data Tridarma',       '#data-tridarma',         'heroicons:beaker',            4),
    ('Data Akademik',       '#data-akademik',         'heroicons:building-library',  5),
    ('Data Kerjasama',      '#data-kerjasama',        'heroicons:globe-alt',         6),
    ('Data Keuangan',       '#data-keuangan',         'heroicons:currency-dollar',   7),
    ('Data Lulusan',        '#data-alumni',           'heroicons:academic-cap',      8);

INSERT INTO man_akses.menu
    (nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, tgl_create, last_update, last_sync)
SELECT p.nm_menu, p.nm_file, p.urutan, 1, 1, p.icon, 1, @id_app, GETDATE(), GETDATE(), GETDATE()
FROM @parents p
WHERE NOT EXISTS (SELECT 1 FROM man_akses.menu mm WHERE mm.id_aplikasi = @id_app AND mm.nm_file = p.nm_file);
DECLARE @p_inserted INT = @@ROWCOUNT;

UPDATE mm SET mm.nm_menu = p.nm_menu, mm.urutan_menu = p.urutan, mm.icon = p.icon, mm.last_update = GETDATE(), mm.last_sync = GETDATE()
FROM man_akses.menu mm INNER JOIN @parents p ON mm.nm_file = p.nm_file
WHERE mm.id_aplikasi = @id_app
  AND (mm.nm_menu <> p.nm_menu OR ISNULL(mm.urutan_menu,0) <> p.urutan OR ISNULL(mm.icon,'') <> p.icon);
DECLARE @p_updated INT = @@ROWCOUNT;

-- ============================================================
-- STEP 2: Children menus (level_menu = 2)
-- ============================================================
DECLARE @children TABLE (parent_file VARCHAR(500), nm_menu VARCHAR(255), nm_file VARCHAR(500), urutan INT);
INSERT INTO @children VALUES
    -- Data Mahasiswa
    ('#data-mahasiswa', 'Daftar Mahasiswa',    '/dashboard/data-unila/mahasiswa',                1),
    ('#data-mahasiswa', 'KTW',                 '/dashboard/data-unila/mahasiswa/ktw',            2),
    ('#data-mahasiswa', 'Aktivitas Mahasiswa', '/dashboard/data-unila/mahasiswa/aktivitas',      3),
    ('#data-mahasiswa', 'Prestasi Mahasiswa',  '/dashboard/data-unila/tridarma/prestasi',        4),
    ('#data-mahasiswa', 'KKN',                 '/dashboard/data-unila/kkn',                      5),
    -- Data Dosen & Tendik
    ('#data-dosen', 'Daftar Dosen',            '/dashboard/data-unila/dosen',                    1),
    ('#data-dosen', 'Jabatan Fungsional',      '/dashboard/data-unila/dosen/jabfung',            2),
    ('#data-dosen', 'Riwayat Pendidikan',      '/dashboard/data-unila/dosen/pendidikan',         3),
    ('#data-dosen', 'Riwayat Kepangkatan',     '/dashboard/data-unila/dosen/kepangkatan',        4),
    ('#data-dosen', 'Tugas Tambahan',          '/dashboard/data-unila/dosen/tugas-tambahan',     5),
    ('#data-dosen', 'Riwayat Sertifikasi',     '/dashboard/data-unila/dosen/sertifikasi',        6),
    ('#data-dosen', 'Daftar Tendik',           '/dashboard/data-unila/dosen/tendik',             7),
    -- Data Tridarma
    ('#data-tridarma', 'Pengajaran',           '/dashboard/data-unila/tridarma/pengajaran',      1),
    ('#data-tridarma', 'Bimbingan Mahasiswa',  '/dashboard/data-unila/dosen/bimbingan',          2),
    ('#data-tridarma', 'Penelitian',           '/dashboard/data-unila/tridarma/penelitian',      3),
    ('#data-tridarma', 'Pengabdian',           '/dashboard/data-unila/tridarma/pengabdian',      4),
    ('#data-tridarma', 'Publikasi',            '/dashboard/data-unila/tridarma/publikasi',       5),
    -- Data Akademik
    ('#data-akademik', 'Program Studi',        '/dashboard/data-unila/akademik/prodi',           1),
    ('#data-akademik', 'Akreditasi',           '/dashboard/data-unila/akademik/akreditasi',      2),
    ('#data-akademik', 'Mata Kuliah',          '/dashboard/data-unila/akademik/matkul',          3),
    ('#data-akademik', 'Kurikulum',            '/dashboard/data-unila/akademik/kurikulum',       4),
    -- Data Kerjasama
    ('#data-kerjasama', 'Daftar MoU',          '/dashboard/data-unila/kerjasama',                1),
    ('#data-kerjasama', 'Mitra Riset & Industri', '/dashboard/data-unila/kerjasama/mitra',       2),
    -- Data Keuangan
    ('#data-keuangan', 'UKT',                  '/dashboard/data-unila/keuangan/ukt',             1),
    ('#data-keuangan', 'SPP',                  '/dashboard/data-unila/keuangan/spp',             2),
    -- Data Lulusan
    ('#data-alumni', 'Lulusan',                '/dashboard/data-unila/mahasiswa/lulusan',        1),
    ('#data-alumni', 'Tracer Study',           '/dashboard/data-unila/tracer',                   2),
    ('#data-alumni', 'Survey Atasan',          '/dashboard/data-unila/alumni/survey-atasan',     3);

-- INSERT children where not exists (resolve id_group_menu via parent_file)
INSERT INTO man_akses.menu
    (nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
SELECT
    c.nm_menu, c.nm_file, c.urutan, 1, 1, 2, @id_app, parent.id_menu, GETDATE(), GETDATE(), GETDATE()
FROM @children c
INNER JOIN man_akses.menu parent ON parent.id_aplikasi = @id_app AND parent.nm_file = c.parent_file
WHERE NOT EXISTS (SELECT 1 FROM man_akses.menu mm WHERE mm.id_aplikasi = @id_app AND mm.nm_file = c.nm_file);
DECLARE @c_inserted INT = @@ROWCOUNT;

UPDATE mm SET
    mm.nm_menu = c.nm_menu,
    mm.urutan_menu = c.urutan,
    mm.id_group_menu = parent.id_menu,
    mm.last_update = GETDATE(),
    mm.last_sync = GETDATE()
FROM man_akses.menu mm
INNER JOIN @children c ON mm.nm_file = c.nm_file
INNER JOIN man_akses.menu parent ON parent.id_aplikasi = @id_app AND parent.nm_file = c.parent_file
WHERE mm.id_aplikasi = @id_app
  AND (mm.nm_menu <> c.nm_menu OR ISNULL(mm.urutan_menu,0) <> c.urutan OR ISNULL(mm.id_group_menu, '00000000-0000-0000-0000-000000000000') <> parent.id_menu);
DECLARE @c_updated INT = @@ROWCOUNT;

-- ============================================================
-- STEP 3: Verify
-- ============================================================
SELECT
    @p_inserted AS parent_inserted, @p_updated AS parent_updated,
    @c_inserted AS child_inserted,  @c_updated  AS child_updated;

SELECT m.level_menu, m.urutan_menu, m.nm_menu, m.nm_file, m.icon, m.a_aktif, m.a_tampil
FROM man_akses.menu m
WHERE m.id_aplikasi = @id_app
ORDER BY ISNULL(m.id_group_menu, m.id_menu), m.level_menu, m.urutan_menu;

COMMIT TRANSACTION;
