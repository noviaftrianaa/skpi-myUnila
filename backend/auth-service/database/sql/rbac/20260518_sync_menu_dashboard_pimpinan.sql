-- Description: Sync menu Dashboard Pimpinan (Beranda + 12 sub-menu canonical aligned)
-- Author: mizar.zulmi
-- Date: 2026-05-18
-- Tested on: staging (VM5) — selaras dengan portal_menus/dashboard-pimpinan.json
-- Rollback: SELECT * INTO man_akses.menu_dashpim_backup_20260518 FROM man_akses.menu
--          WHERE id_aplikasi = (SELECT id_aplikasi FROM man_akses.aplikasi WHERE app_slug='dashboard-pimpinan');
--
-- Effect:
--   - Tambah menu yg belum ada (idempotent INSERT WHERE NOT EXISTS by nm_file)
--   - Update urutan/icon/nm_menu kalau berubah
--   - TIDAK delete menu lama yg tidak ada di list (manual review dulu)
--   - TIDAK touch menu_role assignment (lihat script grant terpisah)

BEGIN TRANSACTION;

DECLARE @id_app UNIQUEIDENTIFIER;
SELECT @id_app = id_aplikasi FROM man_akses.aplikasi WHERE app_slug = 'dashboard-pimpinan';

IF @id_app IS NULL
BEGIN
    RAISERROR('App "dashboard-pimpinan" tidak ditemukan di man_akses.aplikasi', 16, 1);
    ROLLBACK TRANSACTION;
    RETURN;
END

-- ============================================================
-- STEP 0: Backup state menu untuk app ini
-- ============================================================
-- Uncomment sekali per run (kalau tabel backup belum ada):
-- SELECT * INTO man_akses.menu_dashpim_backup_20260518
-- FROM man_akses.menu WHERE id_aplikasi = @id_app;

-- ============================================================
-- STEP 1: Define menu list (selaras JSON)
-- ============================================================
DECLARE @menus TABLE (nm_menu VARCHAR(255), nm_file VARCHAR(500), icon VARCHAR(100), urutan INT);
INSERT INTO @menus VALUES
    ('Beranda',         '/dashboard/pimpinan',             'heroicons:squares-2x2',                1),
    ('Akreditasi',      '/dashboard/pimpinan/akreditasi',  'heroicons:star',                       2),
    ('Monitoring IKU',  '/dashboard/pimpinan/iku',         'heroicons:presentation-chart-bar',     3),
    ('Mahasiswa',       '/dashboard/pimpinan/mahasiswa',   'heroicons:users',                      4),
    ('Lulusan',         '/dashboard/pimpinan/lulusan',     'heroicons:academic-cap',               5),
    ('KTW',             '/dashboard/pimpinan/ktw',         'heroicons:clock',                      6),
    ('Dosen',           '/dashboard/pimpinan/dosen',       'heroicons:user',                       7),
    ('Litabmas',        '/dashboard/pimpinan/litabmas',    'heroicons:book-open',                  8),
    ('Publikasi',       '/dashboard/pimpinan/publikasi',   'heroicons:document-text',              9),
    ('Pegawai',         '/dashboard/pimpinan/pegawai',     'heroicons:briefcase',                  10),
    ('Keuangan',        '/dashboard/pimpinan/keuangan',    'heroicons:banknotes',                  11),
    ('Prestasi',        '/dashboard/pimpinan/prestasi',    'heroicons:trophy',                     12),
    ('Kerjasama',       '/dashboard/pimpinan/kerjasama',   'heroicons:globe-alt',                  13);

-- ============================================================
-- STEP 2: INSERT new menus (WHERE NOT EXISTS)
-- ============================================================
-- id_menu = uniqueidentifier NOT NULL, no default → wajib NEWID() di prod pdut.
INSERT INTO man_akses.menu
    (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, tgl_create, last_update, last_sync)
SELECT
    NEWID(), m.nm_menu, m.nm_file, m.urutan, 1, 1, m.icon, 1, @id_app, GETDATE(), GETDATE(), GETDATE()
FROM @menus m
WHERE NOT EXISTS (
    SELECT 1 FROM man_akses.menu mm
    WHERE mm.id_aplikasi = @id_app AND mm.nm_file = m.nm_file
);

DECLARE @inserted INT = @@ROWCOUNT;

-- ============================================================
-- STEP 3: UPDATE existing menus (sync nm_menu/icon/urutan kalau berubah)
-- ============================================================
UPDATE mm
SET
    mm.nm_menu     = m.nm_menu,
    mm.urutan_menu = m.urutan,
    mm.icon        = m.icon,
    mm.last_update = GETDATE(),
    mm.last_sync   = GETDATE()
FROM man_akses.menu mm
INNER JOIN @menus m ON mm.nm_file = m.nm_file
WHERE mm.id_aplikasi = @id_app
  AND (mm.nm_menu <> m.nm_menu OR ISNULL(mm.urutan_menu,0) <> m.urutan OR ISNULL(mm.icon,'') <> m.icon);

DECLARE @updated INT = @@ROWCOUNT;

-- ============================================================
-- STEP 4: Verify
-- ============================================================
SELECT @inserted AS inserted, @updated AS updated;
SELECT urutan_menu, nm_menu, nm_file, icon, a_aktif, a_tampil
FROM man_akses.menu
WHERE id_aplikasi = @id_app
ORDER BY urutan_menu;

COMMIT TRANSACTION;
