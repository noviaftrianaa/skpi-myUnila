-- ============================================================
-- Migration: 20260516 — Data Unila menu consolidation (final state)
-- ============================================================
-- Idempotent script — set canonical menu state:
--   Data Mahasiswa:
--     1. Daftar Mahasiswa
--     2. KTW
--     3. Aktivitas Mahasiswa
--     4. Prestasi Mahasiswa
--     5. KKN (dipindah dari root)
--   Data Tridarma:
--     1. Pengajaran
--     2. Bimbingan Mahasiswa (dipindah dari Data Dosen)
--     3. Penelitian
--     4. Pengabdian
--     5. Publikasi
--   Data Dosen & Tendik:
--     1. Daftar Dosen
--     2. Jabatan Fungsional
--     3. Riwayat Pendidikan
--     4. Riwayat Kepangkatan
--     5. Tugas Tambahan
--     6. Riwayat Sertifikasi
--     7. Daftar Tendik
--   Hidden (a_aktif=0): Uji Mahasiswa, root KKN, root Tracer Study
-- ============================================================

DECLARE @app_id UNIQUEIDENTIFIER = (SELECT id_aplikasi FROM man_akses.aplikasi WHERE app_slug = 'data-unila');

IF @app_id IS NULL
BEGIN
    PRINT 'ERROR: aplikasi data-unila tidak ditemukan';
    RETURN;
END;

-- Helper resolved parent ids
DECLARE @grp_mhs UNIQUEIDENTIFIER = (SELECT id_menu FROM man_akses.menu WHERE id_aplikasi=@app_id AND nm_file='#data-mahasiswa');
DECLARE @grp_dsn UNIQUEIDENTIFIER = (SELECT id_menu FROM man_akses.menu WHERE id_aplikasi=@app_id AND nm_file='#data-dosen');
DECLARE @grp_trid UNIQUEIDENTIFIER = (SELECT id_menu FROM man_akses.menu WHERE id_aplikasi=@app_id AND nm_file='#data-tridarma');
DECLARE @grp_akad UNIQUEIDENTIFIER = (SELECT id_menu FROM man_akses.menu WHERE id_aplikasi=@app_id AND nm_file='#data-akademik');

-- 1. KKN: pindah ke Data Mahasiswa, urutan 5
UPDATE man_akses.menu
SET id_group_menu = @grp_mhs, urutan_menu = 5, level_menu = 1, nm_menu = 'KKN',
    a_aktif = 1, a_tampil = 1, last_update = GETDATE()
WHERE id_aplikasi = @app_id AND nm_file = '/dashboard/data-unila/kkn';

-- 2. Data Mahasiswa children urutan
UPDATE man_akses.menu SET urutan_menu = 1, last_update = GETDATE() WHERE id_aplikasi=@app_id AND nm_file='/dashboard/data-unila/mahasiswa';
UPDATE man_akses.menu SET urutan_menu = 2, last_update = GETDATE() WHERE id_aplikasi=@app_id AND nm_file='/dashboard/data-unila/mahasiswa/ktw';
UPDATE man_akses.menu SET urutan_menu = 3, last_update = GETDATE() WHERE id_aplikasi=@app_id AND nm_file='/dashboard/data-unila/mahasiswa/aktivitas';
UPDATE man_akses.menu SET urutan_menu = 4, id_group_menu = @grp_mhs, level_menu = 1, nm_menu = 'Prestasi Mahasiswa', last_update = GETDATE()
WHERE id_aplikasi=@app_id AND nm_file='/dashboard/data-unila/tridarma/prestasi';

-- 3. Bimbingan Mahasiswa: pindah ke Tridarma, urutan 2
UPDATE man_akses.menu
SET id_group_menu = @grp_trid, urutan_menu = 2, level_menu = 1, nm_menu = 'Bimbingan Mahasiswa',
    a_aktif = 1, a_tampil = 1, last_update = GETDATE()
WHERE id_aplikasi = @app_id AND nm_file = '/dashboard/data-unila/dosen/bimbingan';

-- 4. Uji Mahasiswa: soft-delete dari menu (preserve FK menu_role)
UPDATE man_akses.menu
SET a_aktif = 0, a_tampil = 0, last_update = GETDATE()
WHERE id_aplikasi = @app_id AND nm_file = '/dashboard/data-unila/mahasiswa/ujian';

-- 5. Tridarma children urutan
UPDATE man_akses.menu SET urutan_menu = 1, last_update = GETDATE() WHERE id_aplikasi=@app_id AND nm_file='/dashboard/data-unila/tridarma/pengajaran';
UPDATE man_akses.menu SET urutan_menu = 3, last_update = GETDATE() WHERE id_aplikasi=@app_id AND nm_file='/dashboard/data-unila/tridarma/penelitian';
UPDATE man_akses.menu SET urutan_menu = 4, last_update = GETDATE() WHERE id_aplikasi=@app_id AND nm_file='/dashboard/data-unila/tridarma/pengabdian';
UPDATE man_akses.menu SET urutan_menu = 5, last_update = GETDATE() WHERE id_aplikasi=@app_id AND nm_file='/dashboard/data-unila/tridarma/publikasi';

-- 6. Dosen group: 7 children (Bimbingan sudah keluar)
UPDATE man_akses.menu SET urutan_menu = 1, last_update = GETDATE() WHERE id_aplikasi=@app_id AND nm_file='/dashboard/data-unila/dosen';
UPDATE man_akses.menu SET urutan_menu = 2, last_update = GETDATE() WHERE id_aplikasi=@app_id AND nm_file='/dashboard/data-unila/dosen/jabfung';
UPDATE man_akses.menu SET urutan_menu = 3, last_update = GETDATE() WHERE id_aplikasi=@app_id AND nm_file='/dashboard/data-unila/dosen/pendidikan';
UPDATE man_akses.menu SET urutan_menu = 4, last_update = GETDATE() WHERE id_aplikasi=@app_id AND nm_file='/dashboard/data-unila/dosen/kepangkatan';
UPDATE man_akses.menu SET urutan_menu = 5, last_update = GETDATE() WHERE id_aplikasi=@app_id AND nm_file='/dashboard/data-unila/dosen/tugas-tambahan';
UPDATE man_akses.menu SET urutan_menu = 6, last_update = GETDATE() WHERE id_aplikasi=@app_id AND nm_file='/dashboard/data-unila/dosen/sertifikasi';
UPDATE man_akses.menu SET urutan_menu = 7, last_update = GETDATE() WHERE id_aplikasi=@app_id AND nm_file='/dashboard/data-unila/dosen/tendik';

-- 7. Akademik: tambah Kurikulum kalau belum ada
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_aplikasi=@app_id AND nm_file='/dashboard/data-unila/akademik/kurikulum')
BEGIN
    INSERT INTO man_akses.menu (id_menu, id_aplikasi, nm_menu, nm_file, urutan_menu, level_menu, a_aktif, a_tampil, id_group_menu, tgl_create, last_update, last_sync)
    VALUES (NEWID(), @app_id, 'Kurikulum', '/dashboard/data-unila/akademik/kurikulum', 4, 1, 1, 1, @grp_akad, GETDATE(), GETDATE(), GETDATE());
    -- Copy menu_role from Mata Kuliah
    DECLARE @mk_id UNIQUEIDENTIFIER = (SELECT id_menu FROM man_akses.menu WHERE id_aplikasi=@app_id AND nm_file='/dashboard/data-unila/akademik/matkul');
    DECLARE @kr_id UNIQUEIDENTIFIER = (SELECT id_menu FROM man_akses.menu WHERE id_aplikasi=@app_id AND nm_file='/dashboard/data-unila/akademik/kurikulum');
    DELETE FROM man_akses.menu_role WHERE id_menu = @kr_id;
    INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, a_boleh_sanggah, approval_menu, tgl_create, last_update, soft_delete, last_sync, id_updater)
    SELECT id_peran, @kr_id, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, a_boleh_sanggah, approval_menu, GETDATE(), GETDATE(), 0, GETDATE(), id_updater
    FROM man_akses.menu_role WHERE id_menu = @mk_id;
END;

PRINT 'Data Unila menu consolidation applied successfully.';
