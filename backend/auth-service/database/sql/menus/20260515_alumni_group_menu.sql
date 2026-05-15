-- ============================================================
-- Migration: 20260515 — Reorganisasi menu Alumni group
-- ============================================================
-- Tambah parent "Data Alumni" + pindahkan child:
--   - Lulusan (sebelumnya child Data Mahasiswa)
--   - Tracer Study (sebelumnya root)
--   - User Survey (BARU)
-- UPDATE existing rows (preserve id_menu utk FK menu_role).
-- INSERT row baru pakai id_menu = NEWID() + tgl_create/last_update/last_sync.
-- Idempotent: cek existing dulu (UPSERT pattern).
-- ============================================================

DECLARE @app_id UNIQUEIDENTIFIER = (SELECT id_aplikasi FROM man_akses.aplikasi WHERE app_slug = 'data-unila');
DECLARE @parent_id UNIQUEIDENTIFIER;

IF @app_id IS NULL
BEGIN
    PRINT 'ERROR: aplikasi data-unila tidak ditemukan';
    RETURN;
END;

-- 1. Insert/find parent "Data Alumni"
SELECT @parent_id = id_menu FROM man_akses.menu
WHERE id_aplikasi = @app_id AND nm_file = '#data-alumni';

IF @parent_id IS NULL
BEGIN
    SET @parent_id = NEWID();
    INSERT INTO man_akses.menu (
        id_menu, id_aplikasi, nm_menu, nm_file, urutan_menu, level_menu,
        a_aktif, a_tampil, icon, id_group_menu, tgl_create, last_update, last_sync
    ) VALUES (
        @parent_id, @app_id, 'Data Alumni', '#data-alumni', 8, 1,
        1, 1, 'heroicons:user-group', NULL, GETDATE(), GETDATE(), GETDATE()
    );
END;

-- 2. Update existing "Tracer Study" → child Alumni urutan 1 (preserve id_menu utk FK menu_role)
UPDATE man_akses.menu
SET id_group_menu = @parent_id, urutan_menu = 1, level_menu = 2,
    nm_menu = 'Tracer Study', last_update = GETDATE()
WHERE id_aplikasi = @app_id AND nm_file = '/dashboard/data-unila/tracer';

-- 3. Update existing "Lulusan" → child Alumni urutan 3 (di akhir)
UPDATE man_akses.menu
SET id_group_menu = @parent_id, urutan_menu = 3, level_menu = 2,
    nm_menu = 'Lulusan', last_update = GETDATE()
WHERE id_aplikasi = @app_id AND nm_file = '/dashboard/data-unila/mahasiswa/lulusan';

-- 4. Insert/Update "User Survey" urutan 2
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_aplikasi = @app_id AND nm_file = '/dashboard/data-unila/alumni/user-survey')
BEGIN
    INSERT INTO man_akses.menu (
        id_menu, id_aplikasi, nm_menu, nm_file, urutan_menu, level_menu,
        a_aktif, a_tampil, id_group_menu, tgl_create, last_update, last_sync
    ) VALUES (
        NEWID(), @app_id, 'User Survey', '/dashboard/data-unila/alumni/user-survey', 2, 2,
        1, 1, @parent_id, GETDATE(), GETDATE(), GETDATE()
    );
END
ELSE
BEGIN
    UPDATE man_akses.menu
    SET id_group_menu = @parent_id, urutan_menu = 2, level_menu = 2, last_update = GETDATE()
    WHERE id_aplikasi = @app_id AND nm_file = '/dashboard/data-unila/alumni/user-survey';
END;

-- 5. Pastikan menu_role tersedia untuk parent #data-alumni + User Survey
-- (copy dari Tracer Study yg sudah lama existing). Tanpa ini menu_role kosong → sidebar render orphan.
DECLARE @user_survey_id UNIQUEIDENTIFIER = (SELECT id_menu FROM man_akses.menu WHERE id_aplikasi=@app_id AND nm_file='/dashboard/data-unila/alumni/user-survey');
DECLARE @tracer_id UNIQUEIDENTIFIER = (SELECT id_menu FROM man_akses.menu WHERE id_aplikasi=@app_id AND nm_file='/dashboard/data-unila/tracer');

-- Parent #data-alumni
DELETE FROM man_akses.menu_role WHERE id_menu = @parent_id;
INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, a_boleh_sanggah, approval_menu, tgl_create, last_update, soft_delete, last_sync, id_updater)
SELECT id_peran, @parent_id, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, a_boleh_sanggah, approval_menu, GETDATE(), GETDATE(), 0, GETDATE(), id_updater
FROM man_akses.menu_role WHERE id_menu = @tracer_id;

-- User Survey
DELETE FROM man_akses.menu_role WHERE id_menu = @user_survey_id;
INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, a_boleh_sanggah, approval_menu, tgl_create, last_update, soft_delete, last_sync, id_updater)
SELECT id_peran, @user_survey_id, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, a_boleh_sanggah, approval_menu, GETDATE(), GETDATE(), 0, GETDATE(), id_updater
FROM man_akses.menu_role WHERE id_menu = @tracer_id;

PRINT 'Alumni group menu applied successfully (menu_role propagated).';
