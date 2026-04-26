-- ============================================================================
-- Seed Scheduler — Sister Service (semua endpoint, harian malam)
-- ============================================================================
-- Service: sister-service (sync_type: referensi[+endpoint_key], dosen,
--          dosen_foto, dosen_dokumen, penugasan, penelitian, pengabdian,
--          pendidikan, publikasi, riwayat_pekerjaan, riwayat_fungsional,
--          jabatan_fungsional, jabatan_struktural, tugas_tambahan,
--          sertifikasi_dosen, bidang_ilmu)
-- Tabel target: dbo.scheduled_syncs di pdut_staging / pdut.
-- TZ: Asia/Jakarta (WIB) — verified docker-compose env TZ=Asia/Jakarta.
--
-- Strategi waktu:
--   17:00 WIB → semua 34 referensi sister (parallel ringan, master data)
--   18:00 WIB → dosen (force token refresh)
--   18:05 → dosen_foto, 18:10 → dosen_dokumen
--   18:15-20:00 → 13 jenis riwayat/jabatan/tugas/penugasan/karya
-- Total: 34 referensi + 15 dosen-related = 49 jadwal harian.
--
-- IDEMPOTENT: Top section DELETE existing dengan name pattern Sister %.
-- ============================================================================

USE pdut_staging;  -- Ubah ke `pdut` untuk produksi
GO

-- ============================================================================
-- 1. CLEANUP — hapus semua schedule dengan name "Sister %" + legacy sister
--    yang dulu di-create tanpa prefix "Sister" (e.g., "Dosen Sync Harian"
--    yang masih make sync_type sister). Kita match by sync_type yang specific
--    ke sister supaya tidak nyentuh schedule service lain.
-- ============================================================================
DELETE FROM dbo.scheduled_syncs WHERE name LIKE N'Sister %';
DELETE FROM dbo.scheduled_syncs WHERE sync_type IN (
    'referensi', 'dosen', 'dosen_foto', 'dosen_dokumen', 'penugasan',
    'penelitian', 'pengabdian', 'pendidikan', 'publikasi',
    'riwayat_pekerjaan', 'riwayat_fungsional', 'jabatan_fungsional',
    'jabatan_struktural', 'tugas_tambahan', 'sertifikasi_dosen', 'bidang_ilmu'
);
GO

-- ============================================================================
-- 2. INSERT batch — sister-service (49 jadwal)
-- ============================================================================
DECLARE @creator NVARCHAR(255) = N'admin.scheduler';

INSERT INTO dbo.scheduled_syncs
    (name, description, sync_type, endpoint_key, cron_expression, schedule_time, is_active, created_by)
VALUES
    -- ===== 34 REFERENSI SISTER (semua jam 17:00 WIB, master data ringan, parallel) =====
    (N'Sister Referensi Agama Sync Harian',                  N'Sync referensi agama dari Sister harian 17:00 WIB',                  N'referensi', N'agama',                  N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Negara Sync Harian',                 N'Sync referensi negara dari Sister harian 17:00 WIB',                 N'referensi', N'negara',                 N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Wilayah Sync Harian',                N'Sync referensi wilayah dari Sister harian 17:00 WIB',                N'referensi', N'wilayah',                N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Semester Sync Harian',               N'Sync referensi semester dari Sister harian 17:00 WIB',               N'referensi', N'semester',               N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Jenjang Pendidikan Sync Harian',     N'Sync referensi jenjang pendidikan dari Sister harian 17:00 WIB',     N'referensi', N'jenjang_pendidikan',     N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Gelar Akademik Sync Harian',         N'Sync referensi gelar akademik dari Sister harian 17:00 WIB',         N'referensi', N'gelar_akademik',         N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Bidang Studi Sync Harian',           N'Sync referensi bidang studi dari Sister harian 17:00 WIB',           N'referensi', N'bidang_studi',           N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Bidang Usaha Sync Harian',           N'Sync referensi bidang usaha dari Sister harian 17:00 WIB',           N'referensi', N'bidang_usaha',           N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Golongan Pangkat Sync Harian',       N'Sync referensi golongan pangkat dari Sister harian 17:00 WIB',       N'referensi', N'golongan_pangkat',       N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Ikatan Kerja Sync Harian',           N'Sync referensi ikatan kerja dari Sister harian 17:00 WIB',           N'referensi', N'ikatan_kerja',           N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Status Kepegawaian Sync Harian',     N'Sync referensi status kepegawaian dari Sister harian 17:00 WIB',     N'referensi', N'status_kepegawaian',     N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Sumber Gaji Sync Harian',            N'Sync referensi sumber gaji dari Sister harian 17:00 WIB',            N'referensi', N'sumber_gaji',            N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Unit Kerja Sync Harian',             N'Sync referensi unit kerja dari Sister harian 17:00 WIB',             N'referensi', N'unit_kerja',             N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Jabatan Fungsional Sync Harian',     N'Sync referensi jabatan fungsional dari Sister harian 17:00 WIB',     N'referensi', N'jabatan_fungsional',     N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Jabatan Tugas Tambahan Sync Harian', N'Sync referensi jabatan tugas tambahan dari Sister harian 17:00 WIB', N'referensi', N'jabatan_tugas_tambahan', N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Jenis Bahan Ajar Sync Harian',       N'Sync referensi jenis bahan ajar dari Sister harian 17:00 WIB',       N'referensi', N'jenis_bahan_ajar',       N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Jenis Beasiswa Sync Harian',         N'Sync referensi jenis beasiswa dari Sister harian 17:00 WIB',         N'referensi', N'jenis_beasiswa',         N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Jenis Diklat Sync Harian',           N'Sync referensi jenis diklat dari Sister harian 17:00 WIB',           N'referensi', N'jenis_diklat',           N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Jenis Dokumen Sync Harian',          N'Sync referensi jenis dokumen dari Sister harian 17:00 WIB',          N'referensi', N'jenis_dokumen',          N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Jenis Keluar Sync Harian',           N'Sync referensi jenis keluar dari Sister harian 17:00 WIB',           N'referensi', N'jenis_keluar',           N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Jenis Kepanitiaan Sync Harian',      N'Sync referensi jenis kepanitiaan dari Sister harian 17:00 WIB',      N'referensi', N'jenis_kepanitiaan',      N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Jenis Kesejahteraan Sync Harian',    N'Sync referensi jenis kesejahteraan dari Sister harian 17:00 WIB',    N'referensi', N'jenis_kesejahteraan',    N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Jenis Pekerjaan Sync Harian',        N'Sync referensi jenis pekerjaan dari Sister harian 17:00 WIB',        N'referensi', N'jenis_pekerjaan',        N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Jenis Penghargaan Sync Harian',      N'Sync referensi jenis penghargaan dari Sister harian 17:00 WIB',      N'referensi', N'jenis_penghargaan',      N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Jenis Publikasi Sync Harian',        N'Sync referensi jenis publikasi dari Sister harian 17:00 WIB',        N'referensi', N'jenis_publikasi',        N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Jenis Tes Sync Harian',              N'Sync referensi jenis tes dari Sister harian 17:00 WIB',              N'referensi', N'jenis_tes',              N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Jenis Tunjangan Sync Harian',        N'Sync referensi jenis tunjangan dari Sister harian 17:00 WIB',        N'referensi', N'jenis_tunjangan',        N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Tingkat Penghargaan Sync Harian',    N'Sync referensi tingkat penghargaan dari Sister harian 17:00 WIB',    N'referensi', N'tingkat_penghargaan',    N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Kategori Capaian Luaran Sync Harian',N'Sync referensi kategori capaian luaran dari Sister harian 17:00 WIB',N'referensi', N'kategori_capaian_luaran',N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Kategori Kegiatan Sync Harian',      N'Sync referensi kategori kegiatan dari Sister harian 17:00 WIB',      N'referensi', N'kategori_kegiatan',      N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Kelompok Bidang Sync Harian',        N'Sync referensi kelompok bidang dari Sister harian 17:00 WIB',        N'referensi', N'kelompok_bidang',        N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Lembaga Sertifikasi Sync Harian',    N'Sync referensi lembaga sertifikasi dari Sister harian 17:00 WIB',    N'referensi', N'lembaga_sertifikasi',    N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Media Publikasi Sync Harian',        N'Sync referensi media publikasi dari Sister harian 17:00 WIB',        N'referensi', N'media_publikasi',        N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Referensi Skim Kegiatan Sync Harian',          N'Sync referensi skim kegiatan dari Sister harian 17:00 WIB',          N'referensi', N'skim_kegiatan',          N'0 0 17 * * *', CAST('2026-01-01T17:00:00' AS DATETIME2), 1, @creator),

    -- ===== 15 DOSEN-RELATED (stagger per 5-15 menit) =====
    (N'Sister Dosen Sync Harian',                N'Sync data dosen dari Sister harian 18:00 WIB (force refresh token)', N'dosen',              NULL, N'0 0 18 * * *',  CAST('2026-01-01T18:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Dosen Foto Sync Harian',           N'Sync foto dosen dari Sister harian 18:05 WIB',                       N'dosen_foto',         NULL, N'0 5 18 * * *',  CAST('2026-01-01T18:05:00' AS DATETIME2), 1, @creator),
    (N'Sister Dosen Dokumen Sync Harian',        N'Sync dokumen dosen dari Sister harian 18:10 WIB',                    N'dosen_dokumen',      NULL, N'0 10 18 * * *', CAST('2026-01-01T18:10:00' AS DATETIME2), 1, @creator),
    (N'Sister Penugasan Sync Harian',            N'Sync penugasan dari Sister harian 18:15 WIB',                        N'penugasan',          NULL, N'0 15 18 * * *', CAST('2026-01-01T18:15:00' AS DATETIME2), 1, @creator),
    (N'Sister Penelitian Sync Harian',           N'Sync penelitian dari Sister harian 18:30 WIB',                       N'penelitian',         NULL, N'0 30 18 * * *', CAST('2026-01-01T18:30:00' AS DATETIME2), 1, @creator),
    (N'Sister Pengabdian Sync Harian',           N'Sync pengabdian dari Sister harian 18:45 WIB',                       N'pengabdian',         NULL, N'0 45 18 * * *', CAST('2026-01-01T18:45:00' AS DATETIME2), 1, @creator),
    (N'Sister Pendidikan Sync Harian',           N'Sync pendidikan dari Sister harian 19:00 WIB',                       N'pendidikan',         NULL, N'0 0 19 * * *',  CAST('2026-01-01T19:00:00' AS DATETIME2), 1, @creator),
    (N'Sister Publikasi Sync Harian',            N'Sync publikasi dari Sister harian 19:15 WIB',                        N'publikasi',          NULL, N'0 15 19 * * *', CAST('2026-01-01T19:15:00' AS DATETIME2), 1, @creator),
    (N'Sister Riwayat Pekerjaan Sync Harian',    N'Sync riwayat pekerjaan dari Sister harian 19:30 WIB',                N'riwayat_pekerjaan',  NULL, N'0 30 19 * * *', CAST('2026-01-01T19:30:00' AS DATETIME2), 1, @creator),
    (N'Sister Riwayat Fungsional Sync Harian',   N'Sync riwayat fungsional dari Sister harian 19:35 WIB',               N'riwayat_fungsional', NULL, N'0 35 19 * * *', CAST('2026-01-01T19:35:00' AS DATETIME2), 1, @creator),
    (N'Sister Jabatan Fungsional Sync Harian',   N'Sync jabatan fungsional dari Sister harian 19:40 WIB',               N'jabatan_fungsional', NULL, N'0 40 19 * * *', CAST('2026-01-01T19:40:00' AS DATETIME2), 1, @creator),
    (N'Sister Jabatan Struktural Sync Harian',   N'Sync jabatan struktural dari Sister harian 19:45 WIB',               N'jabatan_struktural', NULL, N'0 45 19 * * *', CAST('2026-01-01T19:45:00' AS DATETIME2), 1, @creator),
    (N'Sister Tugas Tambahan Sync Harian',       N'Sync tugas tambahan dari Sister harian 19:50 WIB',                   N'tugas_tambahan',     NULL, N'0 50 19 * * *', CAST('2026-01-01T19:50:00' AS DATETIME2), 1, @creator),
    (N'Sister Sertifikasi Dosen Sync Harian',    N'Sync sertifikasi dosen dari Sister harian 19:55 WIB',                N'sertifikasi_dosen',  NULL, N'0 55 19 * * *', CAST('2026-01-01T19:55:00' AS DATETIME2), 1, @creator),
    (N'Sister Bidang Ilmu Sync Harian',          N'Sync bidang ilmu dari Sister harian 20:00 WIB',                      N'bidang_ilmu',        NULL, N'0 0 20 * * *',  CAST('2026-01-01T20:00:00' AS DATETIME2), 1, @creator);

-- ============================================================================
-- Verifikasi
-- ============================================================================
SELECT id, name, sync_type, endpoint_key, cron_expression, is_active
FROM dbo.scheduled_syncs
WHERE name LIKE N'Sister %'
ORDER BY cron_expression, name;

PRINT N'Selesai — 49 jadwal sister-service di-seed (34 referensi + 15 dosen-related).';
