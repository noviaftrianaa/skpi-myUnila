-- ============================================================================
-- Register menu "Kandidat Review Akses" di Manajemen Akses
-- ============================================================================
-- Date: 2026-05-08
-- Pilar 4 (Mutasi/Lulus Detection) + Pilar 2 manual perpanjangan.
--
-- Menu baru: /dashboard/manajemen-akses/manajemen/kandidat-akses
-- Group menu: "Manajemen" (level 0) di app Manajemen Akses myUnila.
-- Akses: Developer (id_peran=107) only — admin TIK. Bisa di-grant ke peran
-- lain via Matrix Role × Menu kalau perlu.
--
-- IDEMPOTENT: aman re-run.
-- ============================================================================

USE pdut;
GO

DECLARE @app_manakses UNIQUEIDENTIFIER;
DECLARE @group_manajemen UNIQUEIDENTIFIER;
DECLARE @nm_file VARCHAR(255) = '/dashboard/manajemen-akses/manajemen/kandidat-akses';
DECLARE @new_menu_id UNIQUEIDENTIFIER;

-- 1. Lookup id_aplikasi by app_slug
-- Note: man_akses.aplikasi pakai expired_date utk soft-delete (kolom soft_delete tidak ada).
SELECT @app_manakses = id_aplikasi
FROM man_akses.aplikasi
WHERE app_slug = 'manajemen-akses' AND expired_date IS NULL;

IF @app_manakses IS NULL
BEGIN
    RAISERROR('App "manajemen-akses" tidak ditemukan di man_akses.aplikasi', 16, 1);
    RETURN;
END

-- 2. Lookup id_group_menu (level 0 grouping "Manajemen")
SELECT @group_manajemen = id_menu
FROM man_akses.menu
WHERE id_aplikasi = @app_manakses
  AND nm_menu = 'Manajemen'
  AND level_menu = 0
  AND expired_date IS NULL;

IF @group_manajemen IS NULL
BEGIN
    RAISERROR('Group menu "Manajemen" (level 0) tidak ditemukan untuk app Manajemen Akses', 16, 1);
    RETURN;
END

-- 3. Cek apakah menu sudah ada
IF NOT EXISTS (
    SELECT 1 FROM man_akses.menu
    WHERE nm_file = @nm_file AND expired_date IS NULL
)
BEGIN
    SET @new_menu_id = NEWID();

    -- Cari urutan terakhir di group ini
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
        @new_menu_id, 'Kandidat Review Akses', @nm_file, @next_urutan, 1, 1,
        'heroicons:user-circle', 1, @app_manakses, @group_manajemen,
        GETDATE(), GETDATE(), GETDATE()
    );
    PRINT '✓ Menu "Kandidat Review Akses" inserted';
END
ELSE
BEGIN
    SELECT @new_menu_id = id_menu
    FROM man_akses.menu
    WHERE nm_file = @nm_file AND expired_date IS NULL;
    PRINT '~ Menu "Kandidat Review Akses" sudah ada, skip insert';
END

-- 4. Grant akses ke Developer (107)
IF NOT EXISTS (
    SELECT 1 FROM man_akses.menu_role
    WHERE id_peran = 107 AND id_menu = @new_menu_id AND ISNULL(soft_delete, 0) = 0
)
BEGIN
    INSERT INTO man_akses.menu_role (
        id_peran, id_menu, akses_menu,
        a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah,
        approval_menu, tgl_create, last_update, soft_delete, last_sync, id_updater
    ) VALUES (
        107, @new_menu_id, 'full',
        1, 1, 1, 1, 0,
        1, GETDATE(), GETDATE(), 0, GETDATE(),
        '00000000-0000-0000-0000-000000000000'
    );
    PRINT '✓ menu_role granted: Developer (107) → Kandidat Review Akses';
END
ELSE
    PRINT '~ menu_role untuk Developer sudah ada, skip';
GO

-- ============================================================================
-- Tambahan: Menu "Bulk Import Akses"
-- ============================================================================
-- GO di atas mengakhiri batch sebelumnya — variable @app_manakses/@group_manajemen
-- harus di-declare ulang di batch baru ini.
DECLARE @app_manakses UNIQUEIDENTIFIER;
DECLARE @group_manajemen UNIQUEIDENTIFIER;
DECLARE @nm_file_import VARCHAR(255) = '/dashboard/manajemen-akses/manajemen/import-akses';
DECLARE @import_menu_id UNIQUEIDENTIFIER;

SELECT @app_manakses = id_aplikasi
FROM man_akses.aplikasi
WHERE app_slug = 'manajemen-akses' AND expired_date IS NULL;

SELECT @group_manajemen = id_menu
FROM man_akses.menu
WHERE id_aplikasi = @app_manakses
  AND nm_menu = 'Manajemen'
  AND level_menu = 0
  AND expired_date IS NULL;

IF NOT EXISTS (
    SELECT 1 FROM man_akses.menu WHERE nm_file = @nm_file_import AND expired_date IS NULL
)
BEGIN
    SET @import_menu_id = NEWID();

    DECLARE @next_urutan_imp INT;
    SELECT @next_urutan_imp = ISNULL(MAX(urutan_menu), 0) + 1
    FROM man_akses.menu
    WHERE id_aplikasi = @app_manakses
      AND id_group_menu = @group_manajemen
      AND expired_date IS NULL;

    INSERT INTO man_akses.menu (
        id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil,
        icon, level_menu, id_aplikasi, id_group_menu,
        tgl_create, last_update, last_sync
    ) VALUES (
        @import_menu_id, 'Bulk Import Akses', @nm_file_import, @next_urutan_imp, 1, 1,
        'heroicons:document-arrow-up', 1, @app_manakses, @group_manajemen,
        GETDATE(), GETDATE(), GETDATE()
    );
    PRINT '✓ Menu "Bulk Import Akses" inserted';
END
ELSE
BEGIN
    SELECT @import_menu_id = id_menu FROM man_akses.menu WHERE nm_file = @nm_file_import AND expired_date IS NULL;
    PRINT '~ Menu "Bulk Import Akses" sudah ada, skip';
END

IF NOT EXISTS (
    SELECT 1 FROM man_akses.menu_role
    WHERE id_peran = 107 AND id_menu = @import_menu_id AND ISNULL(soft_delete, 0) = 0
)
BEGIN
    INSERT INTO man_akses.menu_role (
        id_peran, id_menu, akses_menu,
        a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah,
        approval_menu, tgl_create, last_update, soft_delete, last_sync, id_updater
    ) VALUES (
        107, @import_menu_id, 'full',
        1, 1, 1, 1, 0,
        1, GETDATE(), GETDATE(), 0, GETDATE(),
        '00000000-0000-0000-0000-000000000000'
    );
    PRINT '✓ menu_role granted: Developer (107) → Bulk Import Akses';
END
ELSE
    PRINT '~ menu_role utk Bulk Import Akses sudah ada';
GO

PRINT '';
PRINT '=== Verifikasi: list menu di Group Manajemen ===';
DECLARE @app_check UNIQUEIDENTIFIER, @grp_check UNIQUEIDENTIFIER;
SELECT @app_check = id_aplikasi FROM man_akses.aplikasi WHERE app_slug = 'manajemen-akses';
SELECT @grp_check = id_menu FROM man_akses.menu WHERE id_aplikasi = @app_check AND nm_menu = 'Manajemen' AND level_menu = 0 AND expired_date IS NULL;

SELECT urutan_menu, nm_menu, nm_file, icon
FROM man_akses.menu
WHERE id_aplikasi = @app_check AND id_group_menu = @grp_check AND expired_date IS NULL
ORDER BY urutan_menu;
GO
