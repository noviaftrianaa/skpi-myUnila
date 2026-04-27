-- ============================================================================
-- Seed Scheduler — Sister Service (dosen-related only, harian malam)
-- ============================================================================
-- Service: sister-service.
-- Scope: HANYA sync_type dosen-related (15 jadwal). Referensi (34 endpoint
--        master data) sengaja TIDAK di-jadwal — by-design dipicu manual oleh
--        admin via UI sister-integrator karena ref data jarang berubah dan
--        perlu kontrol per-event.
-- Tabel target: dbo.scheduled_syncs di pdut_staging / pdut.
-- TZ: Asia/Jakarta (WIB) — verified docker-compose env TZ=Asia/Jakarta.
--
-- Strategi waktu (dosen-related, stagger 5-15 menit):
--   18:00 WIB → dosen (force refresh token)
--   18:05 → dosen_foto, 18:10 → dosen_dokumen
--   18:15 → penugasan, 18:30 → penelitian, 18:45 → pengabdian
--   19:00 → pendidikan, 19:15 → publikasi
--   19:30 → riwayat_pekerjaan, 19:35 → riwayat_fungsional
--   19:40 → jabatan_fungsional, 19:45 → jabatan_struktural
--   19:50 → tugas_tambahan, 19:55 → sertifikasi_dosen, 20:00 → bidang_ilmu
--
-- IDEMPOTENT: top section DELETE all sister-related schedule (by name
-- prefix 'Sister %' DAN by sync_type list). Sekaligus hapus jadwal
-- referensi lama kalau ada (script versi sebelumnya pernah seed referensi).
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
-- 2. INSERT batch — sister-service (15 jadwal dosen-related, NO referensi)
-- ============================================================================
-- Catatan: Referensi sister (34 endpoint_keys: agama/negara/wilayah/dst)
-- TIDAK di-insert. Admin trigger via UI sister-integrator pas perlu.
-- ============================================================================
DECLARE @creator NVARCHAR(255) = N'admin.scheduler';

INSERT INTO dbo.scheduled_syncs
    (name, description, sync_type, endpoint_key, cron_expression, schedule_time, is_active, created_by)
VALUES
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

PRINT N'Selesai — 15 jadwal sister-service di-seed (dosen-related only). Referensi by manual admin.';
