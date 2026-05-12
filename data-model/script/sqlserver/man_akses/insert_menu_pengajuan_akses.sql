-- ============================================================================
-- Register menu "Pengajuan Akses" di Manajemen Akses sidebar
-- ============================================================================
-- Date: 2026-05-12
-- SSAR — menu admin utk approve/reject pengajuan civitas.
--
-- IDEMPOTENT: aman re-run.
-- ============================================================================

USE pdut;
GO

DECLARE @app_manakses UNIQUEIDENTIFIER;
DECLARE @group_manajemen UNIQUEIDENTIFIER;
DECLARE @nm_file VARCHAR(255) = '/dashboard/manajemen-akses/manajemen/pengajuan';
DECLARE @new_menu_id UNIQUEIDENTIFIER;

-- Lookup app + group
SELECT @app_manakses = id_aplikasi
FROM man_akses.aplikasi
WHERE app_slug = 'manajemen-akses' AND expired_date IS NULL;

SELECT @group_manajemen = id_menu
FROM man_akses.menu
WHERE id_aplikasi = @app_manakses
  AND nm_menu = 'Manajemen'
  AND level_menu = 0
  AND expired_date IS NULL;

IF @app_manakses IS NULL OR @group_manajemen IS NULL
BEGIN
    RAISERROR('App / group Manajemen tidak ditemukan', 16, 1);
    RETURN;
END

-- Insert menu kalau belum ada
IF NOT EXISTS (
    SELECT 1 FROM man_akses.menu WHERE nm_file = @nm_file AND expired_date IS NULL
)
BEGIN
    SET @new_menu_id = NEWID();
    DECLARE @next_urutan INT;
    SELECT @next_urutan = ISNULL(MAX(urutan_menu), 0) + 1
    FROM man_akses.menu
    WHERE id_aplikasi = @app_manakses
      AND id_group_menu = @group_manajemen
      AND expired_date IS NULL;

    INSERT INTO man_akses.menu (
        id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil,
        icon, level_menu, id_aplikasi, id_group_menu,
        tgl_create, last_update, last_sync
    ) VALUES (
        @new_menu_id, 'Pengajuan Akses', @nm_file, @next_urutan, 1, 1,
        'heroicons:inbox-arrow-down', 1, @app_manakses, @group_manajemen,
        GETDATE(), GETDATE(), GETDATE()
    );
    PRINT '✓ Menu "Pengajuan Akses" inserted';
END
ELSE
BEGIN
    SELECT @new_menu_id = id_menu FROM man_akses.menu WHERE nm_file = @nm_file AND expired_date IS NULL;
    PRINT '~ Menu "Pengajuan Akses" sudah ada, skip insert';
END

-- Grant ke Administrator (1) + Developer (107) + Admin Data (31) + Admin Fakultas (106)
INSERT INTO man_akses.menu_role (
    id_peran, id_menu, akses_menu,
    a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah,
    approval_menu, tgl_create, last_update, soft_delete, last_sync, id_updater
)
SELECT p.id_peran, @new_menu_id, 'full',
       1, 1, 1, 1, 0,
       1, GETDATE(), GETDATE(), 0, GETDATE(),
       '00000000-0000-0000-0000-000000000000'
FROM (VALUES (1), (107), (31), (106)) p(id_peran)
WHERE NOT EXISTS (
    SELECT 1 FROM man_akses.menu_role mr
    WHERE mr.id_peran = p.id_peran AND mr.id_menu = @new_menu_id AND ISNULL(mr.soft_delete, 0) = 0
);
PRINT '✓ Granted akses ke Administrator + Developer + Admin Data + Admin Fakultas';
GO
