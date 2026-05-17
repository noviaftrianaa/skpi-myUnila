-- ====================================================================
-- Data Unila — Tambah menu Bimbingan Mahasiswa + Mitra Riset & Industri
-- Date: 2026-05-14
-- Reason: 3 modul baru — augment Pengajaran (frontend only), tambah
--         Bimbingan Mahasiswa di parent "Data Dosen & Tendik", dan
--         convert "Data Kerjasama" jadi parent dengan child "Daftar MoU"
--         + "Mitra Riset & Industri".
-- Usage:
--   docker exec myunila-auth-staging php artisan db:cmd "$(cat THIS_FILE)"
--   OR sqlcmd -i this_file.sql
-- Idempotent: aman dijalankan berkali-kali (MERGE pattern).
-- ====================================================================
DECLARE @id_app UNIQUEIDENTIFIER;
SELECT TOP 1 @id_app = id_aplikasi FROM man_akses.aplikasi WHERE app_slug = 'data-unila';

IF @id_app IS NULL BEGIN
    PRINT 'ERROR: app_slug=data-unila not found. Run PortalAplikasiSeeder first.';
    RETURN;
END

-- ============================================================
-- BAGIAN 1: Bimbingan Mahasiswa (child di "Data Dosen & Tendik")
-- ============================================================
DECLARE @id_parent_dosen UNIQUEIDENTIFIER;
SELECT TOP 1 @id_parent_dosen = id_menu
FROM man_akses.menu
WHERE id_aplikasi = @id_app AND nm_file = '#data-dosen';

IF @id_parent_dosen IS NULL BEGIN
    PRINT 'WARNING: Parent menu #data-dosen not found, skipping Bimbingan insert.';
END
ELSE BEGIN
    -- Geser sertifikasi & tendik urutan agar Bimbingan masuk di urutan 6
    UPDATE man_akses.menu
    SET urutan_menu = 7, last_update = SYSUTCDATETIME()
    WHERE id_aplikasi = @id_app AND nm_file = '/dashboard/data-unila/dosen/sertifikasi';
    UPDATE man_akses.menu
    SET urutan_menu = 8, last_update = SYSUTCDATETIME()
    WHERE id_aplikasi = @id_app AND nm_file = '/dashboard/data-unila/dosen/tendik';

    -- INSERT/UPDATE Bimbingan Mahasiswa
    MERGE man_akses.menu AS tgt
    USING (VALUES
        ('Bimbingan Mahasiswa', '/dashboard/data-unila/dosen/bimbingan', 6)
    ) AS src(nm_menu, nm_file, urutan_menu)
       ON tgt.id_aplikasi = @id_app AND tgt.nm_file = src.nm_file
    WHEN MATCHED THEN UPDATE SET
        nm_menu = src.nm_menu,
        urutan_menu = src.urutan_menu,
        id_group_menu = @id_parent_dosen,
        level_menu = 1,
        a_aktif = 1, a_tampil = 1,
        last_update = SYSUTCDATETIME()
    WHEN NOT MATCHED BY TARGET THEN INSERT
        (id_menu, id_aplikasi, id_group_menu, nm_menu, nm_file, urutan_menu, level_menu, a_aktif, a_tampil, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @id_app, @id_parent_dosen, src.nm_menu, src.nm_file, src.urutan_menu, 1, 1, 1, SYSUTCDATETIME(), SYSUTCDATETIME(), SYSUTCDATETIME());

    -- Grant menu_role: copy semua role yg punya akses Riwayat Sertifikasi → Bimbingan Mahasiswa
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
      AND m_new.nm_file = '/dashboard/data-unila/dosen/bimbingan'
      AND NOT EXISTS (
          SELECT 1 FROM man_akses.menu_role mr2
          WHERE mr2.id_menu = m_new.id_menu AND mr2.id_peran = mr.id_peran
      );
END

-- ============================================================
-- BAGIAN 2: Convert "Data Kerjasama" → parent menu + tambah Mitra
-- Sebelumnya: Data Kerjasama = leaf node ke /dashboard/data-unila/kerjasama
-- Sesudah: Data Kerjasama = parent (#data-kerjasama) dgn 2 child:
--           - Daftar MoU (lama, link tetap /dashboard/data-unila/kerjasama)
--           - Mitra Riset & Industri (baru, /dashboard/data-unila/kerjasama/mitra)
-- ============================================================
DECLARE @id_menu_kerjasama_old UNIQUEIDENTIFIER;
SELECT TOP 1 @id_menu_kerjasama_old = id_menu
FROM man_akses.menu
WHERE id_aplikasi = @id_app AND nm_file = '/dashboard/data-unila/kerjasama' AND id_group_menu IS NULL;

IF @id_menu_kerjasama_old IS NOT NULL BEGIN
    -- Konversi menu lama jadi parent (nm_file → '#data-kerjasama')
    UPDATE man_akses.menu
    SET nm_file = '#data-kerjasama',
        nm_menu = 'Data Kerjasama',
        last_update = SYSUTCDATETIME()
    WHERE id_menu = @id_menu_kerjasama_old;

    -- Sekarang id_menu lama = id parent baru
    DECLARE @id_parent_kerja UNIQUEIDENTIFIER = @id_menu_kerjasama_old;

    -- Insert 2 child: "Daftar MoU" (link asli) + "Mitra Riset & Industri" (baru)
    MERGE man_akses.menu AS tgt
    USING (VALUES
        ('Daftar MoU',             '/dashboard/data-unila/kerjasama',       1),
        ('Mitra Riset & Industri', '/dashboard/data-unila/kerjasama/mitra', 2)
    ) AS src(nm_menu, nm_file, urutan_menu)
       ON tgt.id_aplikasi = @id_app AND tgt.nm_file = src.nm_file
    WHEN MATCHED THEN UPDATE SET
        nm_menu = src.nm_menu,
        urutan_menu = src.urutan_menu,
        id_group_menu = @id_parent_kerja,
        level_menu = 1,
        a_aktif = 1, a_tampil = 1,
        last_update = SYSUTCDATETIME()
    WHEN NOT MATCHED BY TARGET THEN INSERT
        (id_menu, id_aplikasi, id_group_menu, nm_menu, nm_file, urutan_menu, level_menu, a_aktif, a_tampil, tgl_create, last_update, last_sync)
        VALUES (NEWID(), @id_app, @id_parent_kerja, src.nm_menu, src.nm_file, src.urutan_menu, 1, 1, 1, SYSUTCDATETIME(), SYSUTCDATETIME(), SYSUTCDATETIME());

    -- Grant menu_role: copy semua role yang punya akses ke parent kerjasama (id sama dgn old leaf)
    -- ke 2 child baru. Note: parent dipakai utk visibility group, leaf yg dipakai utk akses.
    INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, a_boleh_sanggah, approval_menu, tgl_create, last_update, soft_delete, last_sync, id_updater)
    SELECT mr.id_peran, m_new.id_menu, mr.akses_menu,
           ISNULL(mr.a_boleh_insert, 0), ISNULL(mr.a_boleh_show, 1),
           ISNULL(mr.a_boleh_delete, 0), ISNULL(mr.a_boleh_update, 0),
           ISNULL(mr.a_boleh_sanggah, 0), ISNULL(mr.approval_menu, 0),
           SYSUTCDATETIME(), SYSUTCDATETIME(), 0, SYSUTCDATETIME(), mr.id_updater
    FROM man_akses.menu_role mr
    CROSS JOIN man_akses.menu m_new
    WHERE mr.id_menu = @id_parent_kerja
      AND mr.soft_delete = 0
      AND m_new.id_aplikasi = @id_app
      AND m_new.nm_file IN (
          '/dashboard/data-unila/kerjasama',
          '/dashboard/data-unila/kerjasama/mitra'
      )
      AND NOT EXISTS (
          SELECT 1 FROM man_akses.menu_role mr2
          WHERE mr2.id_menu = m_new.id_menu AND mr2.id_peran = mr.id_peran
      );
END
ELSE BEGIN
    -- Mungkin sudah pernah dikonversi (#data-kerjasama exists). Pastikan child Mitra ada.
    DECLARE @id_parent_kerja2 UNIQUEIDENTIFIER;
    SELECT TOP 1 @id_parent_kerja2 = id_menu
    FROM man_akses.menu
    WHERE id_aplikasi = @id_app AND nm_file = '#data-kerjasama';

    IF @id_parent_kerja2 IS NOT NULL BEGIN
        MERGE man_akses.menu AS tgt
        USING (VALUES
            ('Daftar MoU',             '/dashboard/data-unila/kerjasama',       1),
            ('Mitra Riset & Industri', '/dashboard/data-unila/kerjasama/mitra', 2)
        ) AS src(nm_menu, nm_file, urutan_menu)
           ON tgt.id_aplikasi = @id_app AND tgt.nm_file = src.nm_file
        WHEN MATCHED THEN UPDATE SET
            nm_menu = src.nm_menu,
            urutan_menu = src.urutan_menu,
            id_group_menu = @id_parent_kerja2,
            level_menu = 1,
            a_aktif = 1, a_tampil = 1,
            last_update = SYSUTCDATETIME()
        WHEN NOT MATCHED BY TARGET THEN INSERT
            (id_menu, id_aplikasi, id_group_menu, nm_menu, nm_file, urutan_menu, level_menu, a_aktif, a_tampil, tgl_create, last_update, last_sync)
            VALUES (NEWID(), @id_app, @id_parent_kerja2, src.nm_menu, src.nm_file, src.urutan_menu, 1, 1, 1, SYSUTCDATETIME(), SYSUTCDATETIME(), SYSUTCDATETIME());
    END
END

PRINT 'Done: Data Unila — Bimbingan Mahasiswa + Mitra Riset & Industri menus.';
