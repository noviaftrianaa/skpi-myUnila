-- ============================================================================
-- Insert menu "Matrix Role × Menu" untuk app Manajemen Akses
-- ============================================================================
-- Date: 2026-05-08
-- Konteks: page /dashboard/manajemen-akses/manajemen/role-menu-matrix sudah
--          ada di code (frontend + working), tapi belum di-register di
--          tabel `man_akses.menu` di pdut, sehingga link tidak muncul di
--          sidebar Manajemen Akses.
--
-- Menu ini berfungsi: bulk RBAC editor (matrix Role × Menu × Permission)
--                    untuk app yang dipilih.
--
-- IDEMPOTENT: aman re-run (cek IF NOT EXISTS).
-- ============================================================================

USE pdut;
GO

DECLARE @app_manakses UNIQUEIDENTIFIER = '5A658A40-FD39-4280-8B3C-FAF52A059D8E';
DECLARE @group_manajemen UNIQUEIDENTIFIER = 'E91EA750-4978-40E8-B816-D27C51DA16CB';
DECLARE @new_menu_id UNIQUEIDENTIFIER = NEWID();
DECLARE @nm_file VARCHAR(255) = '/dashboard/manajemen-akses/manajemen/role-menu-matrix';

-- ============================================================================
-- 1. Insert menu (kalau belum ada)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE nm_file = @nm_file AND expired_date IS NULL)
BEGIN
    INSERT INTO man_akses.menu (
        id_menu, nm_menu, nm_file, urutan_menu,
        a_aktif, a_tampil, icon, level_menu,
        id_aplikasi, id_group_menu,
        tgl_create, last_update, last_sync
    ) VALUES (
        @new_menu_id,
        N'Matrix Role × Menu',
        @nm_file,
        4,                       -- setelah Role Base Access (urutan 3)
        1, 1,
        N'heroicons:squares-2x2',
        1,                       -- level 1 (anak Manajemen)
        @app_manakses,
        @group_manajemen,
        GETDATE(), GETDATE(), GETDATE()
    );
    PRINT N'✓ Menu "Matrix Role × Menu" berhasil diinsert. id_menu=' + CAST(@new_menu_id AS NVARCHAR(36));

    -- Shift urutan menu setelahnya (Menu Aplikasi 4→5, Kategori 5→6, dst)
    UPDATE man_akses.menu
    SET urutan_menu = urutan_menu + 1, last_update = GETDATE()
    WHERE id_aplikasi = @app_manakses
      AND id_group_menu = @group_manajemen
      AND id_menu != @new_menu_id
      AND urutan_menu >= 4
      AND expired_date IS NULL;
    PRINT N'✓ Urutan menu lain di-shift +1 untuk maintain ordering';
END
ELSE
BEGIN
    -- Sudah ada — ambil id_menu existing
    SELECT @new_menu_id = id_menu FROM man_akses.menu WHERE nm_file = @nm_file AND expired_date IS NULL;
    PRINT N'~ Menu sudah ada, skip insert. id_menu=' + CAST(@new_menu_id AS NVARCHAR(36));
END

-- ============================================================================
-- 2. Grant menu_role ke peran Developer (107) — supaya muncul di sidebar
-- ============================================================================
IF NOT EXISTS (
    SELECT 1 FROM man_akses.menu_role
    WHERE id_peran = 107 AND id_menu = @new_menu_id AND soft_delete = 0
)
BEGIN
    INSERT INTO man_akses.menu_role (
        id_peran, id_menu, akses_menu,
        a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete,
        a_boleh_sanggah, approval_menu,
        tgl_create, last_update, soft_delete, last_sync, id_updater
    ) VALUES (
        107, @new_menu_id, 'full',
        1, 1, 1, 1,
        0, 1,
        GETDATE(), GETDATE(), 0, GETDATE(), '00000000-0000-0000-0000-000000000000'
    );
    PRINT N'✓ menu_role granted: Developer (107) → Matrix Role × Menu';
END
ELSE
    PRINT N'~ menu_role mapping sudah ada untuk Developer, skip';

-- ============================================================================
-- 3. (Opsional) Grant ke peran lain — uncomment kalau perlu
-- ============================================================================
-- IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran = 1 AND id_menu = @new_menu_id AND soft_delete = 0)
-- BEGIN
--     INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, tgl_create, last_update, soft_delete, last_sync)
--     VALUES (1, @new_menu_id, 'full', 1, 1, 1, 1, 0, 1, GETDATE(), GETDATE(), 0, GETDATE());
--     PRINT N'✓ menu_role granted: Administrator (1)';
-- END

-- ============================================================================
-- 4. Verifikasi
-- ============================================================================
PRINT N'';
PRINT N'=== Verifikasi: 17 menu sekarang di app Manajemen Akses ==='
SELECT urutan_menu, level_menu, nm_menu, nm_file
FROM man_akses.menu
WHERE id_aplikasi = @app_manakses AND expired_date IS NULL
ORDER BY level_menu, urutan_menu;

PRINT N'';
PRINT N'⚠ Setelah jalankan ini, clear Redis cache supaya frontend dapat menu baru:'
PRINT N'   docker exec myunila-auth-service php artisan cache:clear'
GO
