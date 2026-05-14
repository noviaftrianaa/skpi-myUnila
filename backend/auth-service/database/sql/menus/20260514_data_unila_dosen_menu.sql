-- ====================================================================
-- Data Unila — Menu "Data Dosen & Tendik" reorganization
-- Date: 2026-05-14
-- Reason: Seeder destructive berulang-ulang me-reset menu. Diganti ke
--         SQL script versioned + idempotent. Run secara MANUAL saja.
-- Usage:
--   docker exec myunila-auth-staging php artisan db:cmd "$(cat THIS_FILE)"
--   OR sqlcmd -i this_file.sql
-- Idempotent: aman dijalankan berkali-kali (UPDATE-or-INSERT pattern).
-- ====================================================================
DECLARE @id_app UNIQUEIDENTIFIER;
SELECT TOP 1 @id_app = id_aplikasi FROM man_akses.aplikasi WHERE app_slug = 'data-unila';

IF @id_app IS NULL BEGIN
    PRINT 'ERROR: app_slug=data-unila not found. Run PortalAplikasiSeeder first.';
    RETURN;
END

-- Parent menu rename: "Data Dosen & SDM" → "Data Dosen & Tendik"
UPDATE man_akses.menu
SET nm_menu = 'Data Dosen & Tendik',
    last_update = SYSUTCDATETIME()
WHERE id_aplikasi = @id_app AND nm_file = '#data-dosen';

DECLARE @id_parent UNIQUEIDENTIFIER;
SELECT TOP 1 @id_parent = id_menu FROM man_akses.menu WHERE id_aplikasi = @id_app AND nm_file = '#data-dosen';

-- Sertifikasi → Riwayat Sertifikasi (urutan_menu=6)
UPDATE man_akses.menu
SET nm_menu = 'Riwayat Sertifikasi',
    urutan_menu = 6,
    last_update = SYSUTCDATETIME()
WHERE id_aplikasi = @id_app AND nm_file = '/dashboard/data-unila/dosen/sertifikasi';

-- INSERT/UPDATE 4 menu baru
MERGE man_akses.menu AS tgt
USING (VALUES
    ('Riwayat Pendidikan',  '/dashboard/data-unila/dosen/pendidikan',     3),
    ('Riwayat Kepangkatan', '/dashboard/data-unila/dosen/kepangkatan',    4),
    ('Tugas Tambahan',      '/dashboard/data-unila/dosen/tugas-tambahan', 5),
    ('Daftar Tendik',       '/dashboard/data-unila/dosen/tendik',         7)
) AS src(nm_menu, nm_file, urutan_menu)
   ON tgt.id_aplikasi = @id_app AND tgt.nm_file = src.nm_file
WHEN MATCHED THEN UPDATE SET
    nm_menu = src.nm_menu,
    urutan_menu = src.urutan_menu,
    id_group_menu = @id_parent,
    level_menu = 1,
    a_aktif = 1, a_tampil = 1,
    last_update = SYSUTCDATETIME()
WHEN NOT MATCHED BY TARGET THEN INSERT
    (id_menu, id_aplikasi, id_group_menu, nm_menu, nm_file, urutan_menu, level_menu, a_aktif, a_tampil, tgl_create, last_update, last_sync)
    VALUES (NEWID(), @id_app, @id_parent, src.nm_menu, src.nm_file, src.urutan_menu, 1, 1, 1, SYSUTCDATETIME(), SYSUTCDATETIME(), SYSUTCDATETIME());

-- Grant menu_role: copy semua role yg punya akses Riwayat Sertifikasi → 4 menu baru
DECLARE @id_sert UNIQUEIDENTIFIER;
SELECT TOP 1 @id_sert = id_menu FROM man_akses.menu WHERE id_aplikasi = @id_app AND nm_file = '/dashboard/data-unila/dosen/sertifikasi';

INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, a_boleh_sanggah, approval_menu, tgl_create, last_update, soft_delete, last_sync, id_updater)
SELECT mr.id_peran, m_new.id_menu, mr.akses_menu,
       ISNULL(mr.a_boleh_insert, 0), ISNULL(mr.a_boleh_show, 1),
       ISNULL(mr.a_boleh_delete, 0), ISNULL(mr.a_boleh_update, 0),
       ISNULL(mr.a_boleh_sanggah, 0), ISNULL(mr.approval_menu, 0),
       SYSUTCDATETIME(), SYSUTCDATETIME(), 0, SYSUTCDATETIME(), mr.id_updater
FROM man_akses.menu_role mr
CROSS JOIN man_akses.menu m_new
WHERE mr.id_menu = @id_sert
  AND mr.soft_delete = 0
  AND m_new.id_aplikasi = @id_app
  AND m_new.nm_file IN (
      '/dashboard/data-unila/dosen/pendidikan',
      '/dashboard/data-unila/dosen/kepangkatan',
      '/dashboard/data-unila/dosen/tugas-tambahan',
      '/dashboard/data-unila/dosen/tendik'
  )
  AND NOT EXISTS (
      SELECT 1 FROM man_akses.menu_role mr2
      WHERE mr2.id_menu = m_new.id_menu AND mr2.id_peran = mr.id_peran
  );

PRINT 'Done: Data Unila Dosen menu reorganized.';
