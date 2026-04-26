-- ============================================================================
-- Seed Scheduler — Feeder Service (semua endpoint, mingguan malam)
-- ============================================================================
-- Service: feeder-service (sync_type: mahasiswa, aktivitas_mahasiswa,
--          kurikulum, rencana_evaluasi, kelas_kuliah, nilai_perkuliahan,
--          nilai_konversi, transkrip_nilai)
-- Tabel target: dbo.scheduled_syncs di pdut_staging / pdut.
-- TZ: Asia/Jakarta (WIB) — verified docker-compose env.
--
-- Strategi: Weekly Sunday malam — Feeder PDDIKTI biasanya rate-limited
-- dan butuh batch besar, jadi 1× seminggu di akhir pekan saat traffic minim.
-- 8 endpoint stagger 03:00-04:45 WIB Senin pagi (run dari Minggu malam UTC).
-- Cron 6-field: "0 mm hh * * 1" → tiap Senin (DOW=1).
--
-- IDEMPOTENT: DELETE all existing schedule dengan name "Feeder %" lalu INSERT.
-- ============================================================================

USE pdut_staging;  -- Ubah ke `pdut` untuk produksi
GO

-- ============================================================================
-- 1. CLEANUP
-- ============================================================================
DELETE FROM dbo.scheduled_syncs WHERE name LIKE N'Feeder %';
GO

-- ============================================================================
-- 2. INSERT batch — feeder-service (8 jadwal mingguan)
-- ============================================================================
DECLARE @creator NVARCHAR(255) = N'admin.scheduler';

INSERT INTO dbo.scheduled_syncs
    (name, description, sync_type, endpoint_key, cron_expression, schedule_time, is_active, created_by)
VALUES
    -- Mahasiswa & aktivitas (foundation, jalan duluan)
    (N'Feeder Mahasiswa Sync Mingguan',
     N'Sync data mahasiswa PDDIKTI Feeder mingguan Senin 03:00 WIB',
     N'mahasiswa', NULL, N'0 0 3 * * 1',
     CAST('2026-01-01T03:00:00' AS DATETIME2), 1, @creator),

    (N'Feeder Aktivitas Mahasiswa Sync Mingguan',
     N'Sync aktivitas mahasiswa PDDIKTI Feeder mingguan Senin 03:15 WIB',
     N'aktivitas_mahasiswa', NULL, N'0 15 3 * * 1',
     CAST('2026-01-01T03:15:00' AS DATETIME2), 1, @creator),

    -- Akademik (kurikulum, kelas, evaluasi)
    (N'Feeder Kurikulum Sync Mingguan',
     N'Sync kurikulum PDDIKTI Feeder mingguan Senin 03:30 WIB',
     N'kurikulum', NULL, N'0 30 3 * * 1',
     CAST('2026-01-01T03:30:00' AS DATETIME2), 1, @creator),

    (N'Feeder Rencana Evaluasi Sync Mingguan',
     N'Sync rencana evaluasi PDDIKTI Feeder mingguan Senin 03:45 WIB',
     N'rencana_evaluasi', NULL, N'0 45 3 * * 1',
     CAST('2026-01-01T03:45:00' AS DATETIME2), 1, @creator),

    (N'Feeder Kelas Kuliah Sync Mingguan',
     N'Sync kelas kuliah PDDIKTI Feeder mingguan Senin 04:00 WIB',
     N'kelas_kuliah', NULL, N'0 0 4 * * 1',
     CAST('2026-01-01T04:00:00' AS DATETIME2), 1, @creator),

    -- Nilai & transkrip (depend on aktivitas)
    (N'Feeder Nilai Perkuliahan Sync Mingguan',
     N'Sync nilai perkuliahan PDDIKTI Feeder mingguan Senin 04:15 WIB',
     N'nilai_perkuliahan', NULL, N'0 15 4 * * 1',
     CAST('2026-01-01T04:15:00' AS DATETIME2), 1, @creator),

    (N'Feeder Nilai Konversi Sync Mingguan',
     N'Sync nilai konversi PDDIKTI Feeder mingguan Senin 04:30 WIB',
     N'nilai_konversi', NULL, N'0 30 4 * * 1',
     CAST('2026-01-01T04:30:00' AS DATETIME2), 1, @creator),

    (N'Feeder Transkrip Nilai Sync Mingguan',
     N'Sync transkrip nilai PDDIKTI Feeder mingguan Senin 04:45 WIB',
     N'transkrip_nilai', NULL, N'0 45 4 * * 1',
     CAST('2026-01-01T04:45:00' AS DATETIME2), 1, @creator);

-- ============================================================================
-- Verifikasi
-- ============================================================================
SELECT id, name, sync_type, cron_expression, is_active
FROM dbo.scheduled_syncs
WHERE name LIKE N'Feeder %'
ORDER BY cron_expression;

PRINT N'Selesai — 8 jadwal feeder-service di-seed (mingguan Senin pagi).';
