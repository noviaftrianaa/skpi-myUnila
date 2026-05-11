-- ============================================================================
-- Register menu "KKN" di Data Unila > Data Tridarma
-- ============================================================================
-- Date: 2026-05-11
-- KKN tergolong aktivitas pengabdian masyarakat — masuk ke group Data Tridarma.
-- Page sudah ada di filesystem: /dashboard/data-unila/kkn (Next.js page.tsx).
--
-- Akses mirror peran yg punya akses ke submenu Tridarma lain (Penelitian):
--   Administrator(1), LP3M UNILA(33), Warek 1-4 (34-37), Rektor(38),
--   Kaprodi(42), Dekan(43), Dosen(46), Developer(107).
--
-- IDEMPOTENT: aman re-run.
-- ============================================================================

USE pdut;
GO

DECLARE @id_app UNIQUEIDENTIFIER;
DECLARE @id_group UNIQUEIDENTIFIER;
DECLARE @nm_file VARCHAR(255) = '/dashboard/data-unila/kkn';
DECLARE @new_menu_id UNIQUEIDENTIFIER;

-- 1. Lookup app + group menu
SELECT @id_app = id_aplikasi
FROM man_akses.aplikasi
WHERE app_slug = 'data-unila' AND expired_date IS NULL;

IF @id_app IS NULL
BEGIN
    RAISERROR('App "data-unila" tidak ditemukan', 16, 1);
    RETURN;
END

SELECT @id_group = id_menu
FROM man_akses.menu
WHERE id_aplikasi = @id_app
  AND nm_menu = 'Data Tridarma'
  AND level_menu = 0
  AND expired_date IS NULL;

IF @id_group IS NULL
BEGIN
    RAISERROR('Group menu "Data Tridarma" tidak ditemukan utk app data-unila', 16, 1);
    RETURN;
END

-- 2. Insert menu KKN kalau belum ada
IF NOT EXISTS (
    SELECT 1 FROM man_akses.menu
    WHERE nm_file = @nm_file AND expired_date IS NULL
)
BEGIN
    SET @new_menu_id = NEWID();

    -- Cari urutan terakhir di group Tridarma
    DECLARE @next_urutan INT;
    SELECT @next_urutan = ISNULL(MAX(urutan_menu), 0) + 1
    FROM man_akses.menu
    WHERE id_aplikasi = @id_app
      AND id_group_menu = @id_group
      AND expired_date IS NULL;

    INSERT INTO man_akses.menu (
        id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil,
        icon, level_menu, id_aplikasi, id_group_menu,
        tgl_create, last_update, last_sync
    ) VALUES (
        @new_menu_id, 'KKN', @nm_file, @next_urutan, 1, 1,
        'heroicons:map', 1, @id_app, @id_group,
        GETDATE(), GETDATE(), GETDATE()
    );
    PRINT '✓ Menu "KKN" inserted under Data Tridarma';
END
ELSE
BEGIN
    SELECT @new_menu_id = id_menu
    FROM man_akses.menu
    WHERE nm_file = @nm_file AND expired_date IS NULL;
    PRINT '~ Menu "KKN" sudah ada, skip insert';
END

-- 3. Grant menu_role — mirror peran yg akses Tridarma/Penelitian
INSERT INTO man_akses.menu_role (
    id_peran, id_menu, akses_menu,
    a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah,
    approval_menu, tgl_create, last_update, soft_delete, last_sync, id_updater
)
SELECT p.id_peran, @new_menu_id, 'full',
       1, 1, 1, 1, 0,
       1, GETDATE(), GETDATE(), 0, GETDATE(),
       '00000000-0000-0000-0000-000000000000'
FROM (VALUES (1), (33), (34), (35), (36), (37), (38), (42), (43), (46), (107)) p(id_peran)
WHERE NOT EXISTS (
    SELECT 1 FROM man_akses.menu_role mr
    WHERE mr.id_peran = p.id_peran AND mr.id_menu = @new_menu_id
      AND ISNULL(mr.soft_delete, 0) = 0
);
PRINT '✓ Granted akses ke 11 peran (Admin, LP3M, Warek 1-4, Rektor, Kaprodi, Dekan, Dosen, Developer)';
GO

PRINT '';
PRINT '=== Verifikasi: list menu di Group Data Tridarma ===';
DECLARE @app_check UNIQUEIDENTIFIER, @grp_check UNIQUEIDENTIFIER;
SELECT @app_check = id_aplikasi FROM man_akses.aplikasi WHERE app_slug = 'data-unila';
SELECT @grp_check = id_menu FROM man_akses.menu WHERE id_aplikasi = @app_check AND nm_menu = 'Data Tridarma' AND level_menu = 0 AND expired_date IS NULL;

SELECT urutan_menu, nm_menu, nm_file, icon
FROM man_akses.menu
WHERE id_aplikasi = @app_check AND id_group_menu = @grp_check AND expired_date IS NULL
ORDER BY urutan_menu;
GO
