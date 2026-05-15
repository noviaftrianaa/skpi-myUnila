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
        1, 1, 'heroicons:trophy', NULL, GETDATE(), GETDATE(), GETDATE()
    );
END;

-- 2. Update existing "Tracer Study" → child Alumni (preserve id_menu utk FK menu_role)
UPDATE man_akses.menu
SET id_group_menu = @parent_id, urutan_menu = 2, level_menu = 2,
    nm_menu = 'Tracer Study', last_update = GETDATE()
WHERE id_aplikasi = @app_id AND nm_file = '/dashboard/data-unila/tracer';

-- 3. Update existing "Lulusan" → child Alumni
UPDATE man_akses.menu
SET id_group_menu = @parent_id, urutan_menu = 1, level_menu = 2,
    nm_menu = 'Lulusan', last_update = GETDATE()
WHERE id_aplikasi = @app_id AND nm_file = '/dashboard/data-unila/mahasiswa/lulusan';

-- 4. Insert "User Survey" (baru)
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_aplikasi = @app_id AND nm_file = '/dashboard/data-unila/alumni/user-survey')
BEGIN
    INSERT INTO man_akses.menu (
        id_menu, id_aplikasi, nm_menu, nm_file, urutan_menu, level_menu,
        a_aktif, a_tampil, id_group_menu, tgl_create, last_update, last_sync
    ) VALUES (
        NEWID(), @app_id, 'User Survey', '/dashboard/data-unila/alumni/user-survey', 3, 2,
        1, 1, @parent_id, GETDATE(), GETDATE(), GETDATE()
    );
END;

PRINT 'Alumni group menu applied successfully.';
