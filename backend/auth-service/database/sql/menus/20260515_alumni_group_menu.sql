-- ============================================================
-- Migration: 20260515 — Reorganisasi menu "Data Lulusan" group
-- ============================================================
-- Tambah parent "Data Lulusan" + pindahkan child:
--   urutan 1: Lulusan (sebelumnya child Data Mahasiswa)
--   urutan 2: Tracer Study (sebelumnya root)
--   urutan 3: Survey Atasan (BARU; rename dari "User Survey")
-- UPDATE existing rows (preserve id_menu utk FK menu_role).
-- INSERT row baru pakai id_menu = NEWID() + tgl_create/last_update/last_sync.
-- Idempotent: cek existing dulu (UPSERT pattern).
-- ============================================================
-- Canonical schema: id_aplikasi, urutan_menu, id_group_menu (BUKAN id_app/urutan/parent).
-- FK: menu_role.id_menu cegah DELETE → pakai UPDATE id_group_menu utk pindah node.
-- Required NOT NULL: tgl_create, last_update, last_sync.
-- Aplikasi dicari via app_slug='data-unila'.
-- ============================================================
-- IMPORTANT: level_menu canonical
--   level_menu = 0 untuk root parent (FE hanya render icon di level === 0)
--   level_menu = 1 untuk child sub-menu
-- ============================================================

DECLARE @app_id UNIQUEIDENTIFIER = (SELECT id_aplikasi FROM man_akses.aplikasi WHERE app_slug = 'data-unila');
DECLARE @parent_id UNIQUEIDENTIFIER;

IF @app_id IS NULL
BEGIN
    PRINT 'ERROR: aplikasi data-unila tidak ditemukan';
    RETURN;
END;

-- 1. Insert/find parent "Data Lulusan"
SELECT @parent_id = id_menu FROM man_akses.menu
WHERE id_aplikasi = @app_id AND nm_file = '#data-alumni';

IF @parent_id IS NULL
BEGIN
    SET @parent_id = NEWID();
    INSERT INTO man_akses.menu (
        id_menu, id_aplikasi, nm_menu, nm_file, urutan_menu, level_menu,
        a_aktif, a_tampil, icon, id_group_menu, tgl_create, last_update, last_sync
    ) VALUES (
        @parent_id, @app_id, 'Data Lulusan', '#data-alumni', 8, 0,
        1, 1, 'heroicons:academic-cap', NULL, GETDATE(), GETDATE(), GETDATE()
    );
END
ELSE
BEGIN
    UPDATE man_akses.menu
    SET nm_menu = 'Data Lulusan', icon = 'heroicons:academic-cap', level_menu = 0, urutan_menu = 8, last_update = GETDATE()
    WHERE id_menu = @parent_id;
END;

-- 2. Update existing "Lulusan" → child Data Lulusan urutan 1
UPDATE man_akses.menu
SET id_group_menu = @parent_id, urutan_menu = 1, level_menu = 1,
    nm_menu = 'Lulusan', icon = 'heroicons:user-group', last_update = GETDATE()
WHERE id_aplikasi = @app_id AND nm_file = '/dashboard/data-unila/mahasiswa/lulusan';

-- 3. Update existing "Tracer Study" → child Data Lulusan urutan 2
UPDATE man_akses.menu
SET id_group_menu = @parent_id, urutan_menu = 2, level_menu = 1,
    nm_menu = 'Tracer Study', icon = 'heroicons:arrow-trending-up', last_update = GETDATE()
WHERE id_aplikasi = @app_id AND nm_file = '/dashboard/data-unila/tracer';

-- 4. Insert/Update "Survey Atasan" urutan 3
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_aplikasi = @app_id AND nm_file = '/dashboard/data-unila/alumni/survey-atasan')
BEGIN
    INSERT INTO man_akses.menu (
        id_menu, id_aplikasi, nm_menu, nm_file, urutan_menu, level_menu,
        a_aktif, a_tampil, icon, id_group_menu, tgl_create, last_update, last_sync
    ) VALUES (
        NEWID(), @app_id, 'Survey Atasan', '/dashboard/data-unila/alumni/survey-atasan', 3, 1,
        1, 1, 'heroicons:briefcase', @parent_id, GETDATE(), GETDATE(), GETDATE()
    );
END
ELSE
BEGIN
    UPDATE man_akses.menu
    SET id_group_menu = @parent_id, urutan_menu = 3, level_menu = 1,
        nm_menu = 'Survey Atasan', icon = 'heroicons:briefcase', last_update = GETDATE()
    WHERE id_aplikasi = @app_id AND nm_file = '/dashboard/data-unila/alumni/survey-atasan';
END;

-- 5. menu_role propagation utk parent "#data-alumni" + Survey Atasan
-- (copy dari Tracer Study yg sudah lama existing). Tanpa ini sidebar render orphan.
DECLARE @user_survey_id UNIQUEIDENTIFIER = (SELECT id_menu FROM man_akses.menu WHERE id_aplikasi=@app_id AND nm_file='/dashboard/data-unila/alumni/survey-atasan');
DECLARE @tracer_id UNIQUEIDENTIFIER = (SELECT id_menu FROM man_akses.menu WHERE id_aplikasi=@app_id AND nm_file='/dashboard/data-unila/tracer');

DELETE FROM man_akses.menu_role WHERE id_menu = @parent_id;
INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, a_boleh_sanggah, approval_menu, tgl_create, last_update, soft_delete, last_sync, id_updater)
SELECT id_peran, @parent_id, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, a_boleh_sanggah, approval_menu, GETDATE(), GETDATE(), 0, GETDATE(), id_updater
FROM man_akses.menu_role WHERE id_menu = @tracer_id;

DELETE FROM man_akses.menu_role WHERE id_menu = @user_survey_id;
INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, a_boleh_sanggah, approval_menu, tgl_create, last_update, soft_delete, last_sync, id_updater)
SELECT id_peran, @user_survey_id, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, a_boleh_sanggah, approval_menu, GETDATE(), GETDATE(), 0, GETDATE(), id_updater
FROM man_akses.menu_role WHERE id_menu = @tracer_id;

-- 6. Prestasi Mahasiswa: pindahkan ke parent Data Mahasiswa + rename
DECLARE @mhs_id UNIQUEIDENTIFIER = (SELECT id_menu FROM man_akses.menu WHERE id_aplikasi=@app_id AND nm_file='#data-mahasiswa');
IF @mhs_id IS NOT NULL
BEGIN
    UPDATE man_akses.menu
    SET id_group_menu = @mhs_id, urutan_menu = 5, level_menu = 1,
        nm_menu = 'Prestasi Mahasiswa', last_update = GETDATE()
    WHERE id_aplikasi = @app_id AND nm_file = '/dashboard/data-unila/tridarma/prestasi';
END;

PRINT 'Data Lulusan group menu applied (parent + Lulusan + Tracer + Survey Atasan; Prestasi Mahasiswa moved).';
