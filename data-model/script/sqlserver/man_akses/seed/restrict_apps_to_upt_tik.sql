-- ============================================================================
-- Seed: Restrict app access ke UPT TIK organisasi
-- ============================================================================
-- Tanggal: 2026-05-07
--
-- Tujuan:
--   Pasang filter organisasi (a_filter_organisasi=1) untuk app sensitif yang
--   hanya boleh diakses oleh user di UPT TIK. Plus insert whitelist entry
--   ke man_akses.aplikasi_organisasi untuk UPT TIK.
--
-- Mekanisme yang dipakai:
--   - aplikasi.a_filter_organisasi=1   → enforce whitelist
--   - aplikasi_organisasi              → entry per (app, organisasi) yang allowed
--   - peran.a_universal=1              → BYPASS filter (untuk Super Admin / Administrator)
--
-- Akibat:
--   - User dgn organisasi UPT TIK    → BISA akses (asal punya peran assignment)
--   - User dgn peran a_universal=1   → BISA akses (bypass)
--   - Selain itu                      → DITOLAK
--
-- IDEMPOTENT: Pakai IF NOT EXISTS, aman re-run.
-- ============================================================================

USE pdut;
GO

DECLARE @upt_tik UNIQUEIDENTIFIER = 'C4453E71-A6DB-4487-8F5E-84CB4DE54FEC';
DECLARE @creator UNIQUEIDENTIFIER = '00000000-0000-0000-0000-000000000000';  -- ganti dgn UUID admin actual

-- ============================================================================
-- TIER 1 — Sangat sensitif (admin/infra/akses internal)
-- ============================================================================
DECLARE @apps_tier1 TABLE (id UNIQUEIDENTIFIER, nama NVARCHAR(100));
INSERT INTO @apps_tier1 VALUES
    ('5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'Manajemen Akses myUnila'),    -- atur peran/permission semua app
    ('B85ABABE-76A8-4CF3-BA1E-34F11372D228', 'API Gateway'),                 -- sudah filter, re-affirm
    ('E3C5A6DF-3543-4C84-8E8E-221B59A53D72', 'Monitoring & Observability'), -- internal infra monitoring
    ('9674C0B8-C113-4F32-B609-02972D6DDA8A', 'myUnila Integrator'),         -- pengelolaan data master integrasi
    ('5189265B-0E14-44AD-BE28-468F49E0BDFC', 'Manajemen Konten'),           -- admin konten portal publik
    ('3C301FF6-98BD-4091-B42C-90AD2F53E30A', 'Web Monitoring'),             -- admin webmon
    ('14DF51B0-22F9-4E75-8B09-036AA3EFB563', 'Helpdesk TIK');               -- admin tickets TIK

-- ============================================================================
-- TIER 2 — Internal integration tools (developer / data infra)
-- ============================================================================
DECLARE @apps_tier2 TABLE (id UNIQUEIDENTIFIER, nama NVARCHAR(100));
INSERT INTO @apps_tier2 VALUES
    ('25F8A396-CDE6-4AEA-A99C-C21D6A4182EB', 'Feeder Integrator'),          -- sync feeder DIKTI (sensitive)
    ('2B206AAC-BADE-4618-AA7F-D6F3E9863760', 'SISTER Integrator'),          -- sync data dosen
    ('E14530EB-EFE4-4FAE-91D2-5A0396DD362F', 'Data Unila');                 -- admin BI/analytics data unila

-- ============================================================================
-- 1. SET a_filter_organisasi = 1 untuk semua app di Tier 1 + Tier 2
-- ============================================================================
UPDATE a SET a.a_filter_organisasi = 1, a.last_update = GETDATE()
FROM man_akses.aplikasi a
WHERE a.id_aplikasi IN (SELECT id FROM @apps_tier1)
   OR a.id_aplikasi IN (SELECT id FROM @apps_tier2);

PRINT N'✓ Filter organisasi diaktifkan untuk Tier 1 (7 app) + Tier 2 (3 app)';

-- ============================================================================
-- 2. INSERT/UPSERT whitelist entry: tiap app -> UPT TIK
-- ============================================================================
DECLARE @app_id UNIQUEIDENTIFIER, @app_nama NVARCHAR(100);

DECLARE app_cursor CURSOR FOR
    SELECT id, nama FROM @apps_tier1
    UNION ALL
    SELECT id, nama FROM @apps_tier2;

OPEN app_cursor;
FETCH NEXT FROM app_cursor INTO @app_id, @app_nama;

WHILE @@FETCH_STATUS = 0
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM man_akses.aplikasi_organisasi
        WHERE id_aplikasi = @app_id
          AND id_organisasi = @upt_tik
          AND soft_delete = 0
    )
    BEGIN
        INSERT INTO man_akses.aplikasi_organisasi (
            id_aplikasi_organisasi, id_aplikasi, id_organisasi,
            a_include_children, a_aktif, soft_delete,
            tgl_create, last_update, last_sync, id_creator
        ) VALUES (
            NEWID(), @app_id, @upt_tik,
            0, 1, 0,
            GETDATE(), GETDATE(), GETDATE(), @creator
        );
        PRINT N'  + ' + @app_nama + N'  →  UPT TIK';
    END
    ELSE
        PRINT N'  ~ ' + @app_nama + N'  (sudah ada, skip)';

    FETCH NEXT FROM app_cursor INTO @app_id, @app_nama;
END

CLOSE app_cursor;
DEALLOCATE app_cursor;

-- ============================================================================
-- 3. Verifikasi
-- ============================================================================
PRINT N'';
PRINT N'=== Hasil: app dengan filter aktif ===';
SELECT a.nm_aplikasi, a.app_slug, a.a_filter_organisasi,
       u.nm_lemb AS org_whitelist, ao.a_aktif AS allow_aktif
FROM man_akses.aplikasi a
LEFT JOIN man_akses.aplikasi_organisasi ao ON ao.id_aplikasi = a.id_aplikasi AND ao.soft_delete = 0
LEFT JOIN man_akses.unit_organisasi u ON u.id_organisasi = ao.id_organisasi
WHERE a.id_aplikasi IN (
    SELECT id FROM @apps_tier1
    UNION ALL
    SELECT id FROM @apps_tier2
)
ORDER BY a.nm_aplikasi;

PRINT N'';
PRINT N'Selesai. Test di portal: user non-UPT TIK dgn peran Developer harus tidak melihat app ini di portal.';
PRINT N'(Super Admin / peran a_universal=1 tetap bisa akses karena bypass filter.)';
GO
