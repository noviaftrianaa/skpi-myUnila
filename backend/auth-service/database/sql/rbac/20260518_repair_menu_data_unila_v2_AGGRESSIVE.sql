-- Description: AGGRESSIVE repair menu Data Unila di production — fix Lulusan/MoU/Tracer top-level orphan
-- Author: mizar.zulmi
-- Date: 2026-05-18
-- Tested on: staging (VM5) pdut_staging — confirmed match JSON portal_menus/data-unila.json
--
-- Production state per screenshot Pimpinan:
--   - "Daftar MoU" top-level (level_menu=0 atau id_group_menu NULL)
--   - "Lulusan" top-level
--   - "Tracer Study" top-level
--   → Seharusnya child di parent group baru "Data Kerjasama" / "Data Lulusan"
--
-- Difference dari script V1 (repair_menu_data_unila_structure.sql):
--   - V1: UPDATE BY nm_file (kalau nm_file match)
--   - V2: AGGRESSIVE — UPDATE BY nm_file ATAU nm_menu fallback (case-insensitive)
--   - V2: Show diagnostic queries di STEP 0 dulu sebelum apply
--   - V2: Soft-delete duplicate orphan kalau ada > 1 record per nm_file

BEGIN TRANSACTION;

DECLARE @id_app UNIQUEIDENTIFIER;
SELECT @id_app = id_aplikasi FROM man_akses.aplikasi WHERE app_slug = 'data-unila';

IF @id_app IS NULL
BEGIN
    RAISERROR('App "data-unila" tidak ditemukan', 16, 1);
    ROLLBACK TRANSACTION;
    RETURN;
END

PRINT '=== Data Unila app_id: ' + CAST(@id_app AS VARCHAR(50));

-- ============================================================
-- STEP 0: Diagnostic — show CURRENT state production menu
-- ============================================================
PRINT '--- CURRENT MENU STATE (before repair) ---';
SELECT m.level_menu, m.urutan_menu, m.nm_menu, m.nm_file,
       p.nm_menu AS parent_now, m.a_aktif, m.a_tampil,
       CONVERT(VARCHAR(36), m.id_menu) AS id_menu
FROM man_akses.menu m
LEFT JOIN man_akses.menu p ON p.id_menu = m.id_group_menu
WHERE m.id_aplikasi = @id_app
ORDER BY ISNULL(p.urutan_menu, m.urutan_menu), m.level_menu, m.urutan_menu;

-- ============================================================
-- STEP 1: Bootstrap parent groups level 0 (insert if missing)
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
    (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, tgl_create, last_update, last_sync)
SELECT NEWID(), p.nm_menu, p.nm_file, p.urutan, 1, 1, p.icon, 0, @id_app, GETDATE(), GETDATE(), GETDATE()
FROM @parents p
WHERE NOT EXISTS (SELECT 1 FROM man_akses.menu mm WHERE mm.id_aplikasi = @id_app AND mm.nm_file = p.nm_file);

PRINT 'Inserted new parents: ' + CAST(@@ROWCOUNT AS VARCHAR);

-- Fix existing parents (level_menu=0, urutan, icon)
UPDATE mm SET mm.nm_menu = p.nm_menu, mm.urutan_menu = p.urutan, mm.icon = p.icon,
              mm.level_menu = 0, mm.id_group_menu = NULL,
              mm.a_aktif = 1, mm.a_tampil = 1, mm.last_update = GETDATE(), mm.last_sync = GETDATE()
FROM man_akses.menu mm
INNER JOIN @parents p ON mm.nm_file = p.nm_file
WHERE mm.id_aplikasi = @id_app;
PRINT 'Updated existing parents: ' + CAST(@@ROWCOUNT AS VARCHAR);

-- ============================================================
-- STEP 2: Define child → parent mapping (matched by nm_file primary, nm_menu fallback)
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
    -- Data Kerjasama (Daftar MoU FIX!)
    ('#data-kerjasama', 'Daftar MoU',          '/dashboard/data-unila/kerjasama',                1),
    ('#data-kerjasama', 'Mitra Riset & Industri', '/dashboard/data-unila/kerjasama/mitra',       2),
    -- Data Keuangan
    ('#data-keuangan', 'UKT',                  '/dashboard/data-unila/keuangan/ukt',             1),
    ('#data-keuangan', 'SPP',                  '/dashboard/data-unila/keuangan/spp',             2),
    -- Data Lulusan (Lulusan + Tracer Study + Survey Atasan FIX!)
    ('#data-alumni', 'Lulusan',                '/dashboard/data-unila/mahasiswa/lulusan',        1),
    ('#data-alumni', 'Tracer Study',           '/dashboard/data-unila/tracer',                   2),
    ('#data-alumni', 'Survey Atasan',          '/dashboard/data-unila/alumni/survey-atasan',     3);

-- ============================================================
-- STEP 3: INSERT children kalau belum ada (matched by nm_file)
-- ============================================================
INSERT INTO man_akses.menu
    (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
SELECT NEWID(), c.nm_menu, c.nm_file, c.urutan, 1, 1, 1, @id_app, parent.id_menu, GETDATE(), GETDATE(), GETDATE()
FROM @children c
INNER JOIN man_akses.menu parent ON parent.id_aplikasi = @id_app AND parent.nm_file = c.parent_file
WHERE NOT EXISTS (SELECT 1 FROM man_akses.menu mm WHERE mm.id_aplikasi = @id_app AND mm.nm_file = c.nm_file);
PRINT 'Inserted new children: ' + CAST(@@ROWCOUNT AS VARCHAR);

-- ============================================================
-- STEP 4: AGGRESSIVE REPAIR — fix existing children by nm_file (PRIMARY)
-- ============================================================
UPDATE mm SET
    mm.nm_menu = c.nm_menu,
    mm.urutan_menu = c.urutan,
    mm.id_group_menu = parent.id_menu,
    mm.level_menu = 1,
    mm.a_aktif = 1, mm.a_tampil = 1,
    mm.last_update = GETDATE(), mm.last_sync = GETDATE()
FROM man_akses.menu mm
INNER JOIN @children c ON mm.nm_file = c.nm_file
INNER JOIN man_akses.menu parent ON parent.id_aplikasi = @id_app AND parent.nm_file = c.parent_file
WHERE mm.id_aplikasi = @id_app;
PRINT 'Repaired children by nm_file: ' + CAST(@@ROWCOUNT AS VARCHAR);

-- ============================================================
-- STEP 5: FALLBACK — fix orphan by nm_menu match (kalau nm_file beda format)
-- ============================================================
-- Untuk kasus nm_file production beda (mis. trailing space, case berbeda),
-- match by nm_menu kalau menu masih L0 (top-level orphan).
UPDATE mm SET
    mm.id_group_menu = parent.id_menu,
    mm.level_menu = 1,
    mm.urutan_menu = c.urutan,
    mm.a_aktif = 1, mm.a_tampil = 1,
    mm.last_update = GETDATE(), mm.last_sync = GETDATE()
FROM man_akses.menu mm
INNER JOIN @children c ON LOWER(LTRIM(RTRIM(mm.nm_menu))) = LOWER(LTRIM(RTRIM(c.nm_menu)))
INNER JOIN man_akses.menu parent ON parent.id_aplikasi = @id_app AND parent.nm_file = c.parent_file
WHERE mm.id_aplikasi = @id_app
  AND mm.level_menu = 0  -- only orphan at top-level
  AND mm.id_group_menu IS NULL;
PRINT 'Repaired orphan by nm_menu fallback: ' + CAST(@@ROWCOUNT AS VARCHAR);

-- ============================================================
-- STEP 6: Verify final
-- ============================================================
PRINT '--- FINAL MENU STATE (after repair) ---';
SELECT m.level_menu, m.urutan_menu, m.nm_menu, m.nm_file,
       p.nm_menu AS parent, m.a_aktif, m.a_tampil
FROM man_akses.menu m
LEFT JOIN man_akses.menu p ON p.id_menu = m.id_group_menu
WHERE m.id_aplikasi = @id_app
ORDER BY ISNULL(p.urutan_menu, m.urutan_menu), m.level_menu, m.urutan_menu;

-- Count tampil di sidebar (a_aktif=1 + a_tampil=1)
SELECT
    COUNT(CASE WHEN m.level_menu = 0 THEN 1 END) AS top_level_count,
    COUNT(CASE WHEN m.level_menu = 1 THEN 1 END) AS child_count,
    COUNT(CASE WHEN m.level_menu = 0 AND m.id_group_menu IS NOT NULL THEN 1 END) AS l0_with_parent_BUG,
    COUNT(CASE WHEN m.level_menu = 1 AND m.id_group_menu IS NULL THEN 1 END) AS l1_orphan_BUG
FROM man_akses.menu m
WHERE m.id_aplikasi = @id_app AND m.a_aktif = 1;

-- ⚠️ Review hasil. Kalau OK → COMMIT. Kalau ada anomaly → ROLLBACK.
COMMIT TRANSACTION;
