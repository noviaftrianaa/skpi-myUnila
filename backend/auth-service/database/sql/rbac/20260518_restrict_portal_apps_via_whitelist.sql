-- Description: Restrict portal apps DATA UNILA + DASHBOARD PIMPINAN ke unit
--              yang berkepentingan (Fakultas + Rektorat/Biro + UPT TIK), dengan
--              mechanism existing aplikasi_organisasi whitelist.
-- Author: mizar.zulmi
-- Date: 2026-05-18
--
-- Konteks audit pdut_staging 2026-05-18:
--   - Developer (peran 107) a_universal=1 → bypass semua filter org. HARUS di-off
--     dulu supaya whitelist berefek.
--   - data-unila + dashboard-pimpinan saat ini a_filter_organisasi=0 → semua user
--     dgn role bisa akses tanpa cek org.
--   - 24 Developer non-UPT TIK (mahasiswa/magang/testing/staff lain) tetap bisa
--     consume api-service via JWT, tetapi akan KE-BLOCK dari portal app setelah
--     whitelist + filter aktif.
--
-- Safety:
--   - BEGIN TRANSACTION + idempotent (cek EXISTS sebelum INSERT, UPDATE
--     atomic). Bisa ROLLBACK kalau preview hasil tidak sesuai.
--   - NEWID() explicit utk id_aplikasi_organisasi (pdut tidak punya DEFAULT).
--   - Tidak hapus data — semua action additive + flag toggle.

BEGIN TRANSACTION;

DECLARE @creator UNIQUEIDENTIFIER = '11111111-1111-1111-1111-111111111111';
DECLARE @app_data_unila UNIQUEIDENTIFIER;
DECLARE @app_dashboard_pimpinan UNIQUEIDENTIFIER;

SELECT @app_data_unila = id_aplikasi FROM man_akses.aplikasi WHERE app_slug = 'data-unila';
SELECT @app_dashboard_pimpinan = id_aplikasi FROM man_akses.aplikasi WHERE app_slug = 'dashboard-pimpinan';

IF @app_data_unila IS NULL OR @app_dashboard_pimpinan IS NULL
BEGIN
    RAISERROR('App data-unila atau dashboard-pimpinan tidak ditemukan di man_akses.aplikasi', 16, 1);
    ROLLBACK TRANSACTION;
    RETURN;
END

-- ============================================================
-- STEP A: Turn off a_universal=1 utk Developer (107)
--          (Prasyarat — kalau ini tidak dilakukan, whitelist tidak berefek)
-- ============================================================
UPDATE man_akses.peran
SET a_universal = 0,
    last_update = GETDATE()
WHERE id_peran = 107
  AND ISNULL(a_universal, 0) = 1;
PRINT 'STEP A: Developer (107) a_universal di-off — affected rows: ' + CAST(@@ROWCOUNT AS VARCHAR);

-- ============================================================
-- STEP B: Whitelist target units utk data-unila + dashboard-pimpinan
--
--   Units yg di-whitelist (hasil discovery pdut_staging 2026-05-18):
--   - 9 Fakultas (FEB, Hukum, ISIP, FK, FKIP, FMIPA, Pascasarjana, FPertanian, FT)
--   - UPT TIK (utk Developer)
--   - 4 Lembaga Rektorat (LPPM, LP4M, SPI, Senat)
--   - 3 Biro Rektorat (Biro AK, Biro Perencanaan, Biro Umum)
--   = 17 unit total
--
--   Strategy: insert direct match (a_include_children=0). Setiap Fakultas/Biro/UPT
--   masuk eksplisit. Developer "Universitas Lampung" root (10 user) atau
--   "Semua Unit" (14 user) TIDAK akan match → BLOCKED dari portal app ini.
-- ============================================================
DECLARE @target_apps TABLE (id_aplikasi UNIQUEIDENTIFIER);
INSERT INTO @target_apps VALUES (@app_data_unila), (@app_dashboard_pimpinan);

DECLARE @units TABLE (id_organisasi UNIQUEIDENTIFIER, nm NVARCHAR(100));
INSERT INTO @units VALUES
    ('986882E1-CF1D-44FA-AD14-0AB162F0082A', 'Fakultas EKONOMI DAN BISNIS'),
    ('B4017E14-C4FB-4370-BEDC-29FAE31C183B', 'Fakultas HUKUM'),
    ('E4917F01-5D5F-426B-872B-9246F20FF66D', 'Fakultas ISIP'),
    ('74393186-B8FB-4F21-B4AC-8E3F1F15B6B3', 'Fakultas KEDOKTERAN'),
    ('16E47F2A-BD58-48A7-9846-FB2F5EE647C7', 'Fakultas KEGURUAN'),
    ('4697B29D-A708-492C-8E20-0A3E5EDE1437', 'Fakultas MIPA'),
    ('9B467728-CA97-4922-A9BD-75EB7EC512E1', 'Fakultas PASCASARJANA'),
    ('9307100B-6AD4-44A5-9EB3-AB8E3017E9E5', 'Fakultas PERTANIAN'),
    ('B8E36886-31B0-4406-B69F-29E255B1B60D', 'Fakultas TEKNIK'),
    ('C4453E71-A6DB-4487-8F5E-84CB4DE54FEC', 'UPT TIK'),
    ('F97A7B1C-CF68-4344-9047-D7F31D2B3741', 'Rektorat LPPM'),
    ('392F5074-C68A-44CC-878D-573DD28C9B34', 'Rektorat LP4M'),
    ('DEBEB4E0-8F9D-463C-8A0C-53111502183E', 'Rektorat SPI'),
    ('EEDFBB03-323E-4B9A-97F9-084C3987FB3E', 'Rektorat Senat'),
    ('32577185-9B88-42A3-B401-CA0117FA0AFF', 'Biro Akademik'),
    ('46195C53-DD8A-4D0B-A37C-F13B65B8B75C', 'Biro Perencanaan'),
    ('9CCC4833-A896-455E-94D2-52201B730BE9', 'Biro Umum');

INSERT INTO man_akses.aplikasi_organisasi
    (id_aplikasi_organisasi, id_aplikasi, id_organisasi,
     a_include_children, a_aktif, soft_delete,
     tgl_create, last_update, last_sync, id_creator)
SELECT
    NEWID(), ta.id_aplikasi, u.id_organisasi,
    0, 1, 0,
    GETDATE(), GETDATE(), GETDATE(), @creator
FROM @target_apps ta
CROSS JOIN @units u
WHERE NOT EXISTS (
    SELECT 1 FROM man_akses.aplikasi_organisasi ao
    WHERE ao.id_aplikasi = ta.id_aplikasi
      AND ao.id_organisasi = u.id_organisasi
      AND ISNULL(ao.soft_delete, 0) = 0
);
PRINT 'STEP B: whitelist entries inserted: ' + CAST(@@ROWCOUNT AS VARCHAR);

-- ============================================================
-- STEP C: Enable a_filter_organisasi=1 utk data-unila + dashboard-pimpinan
-- ============================================================
UPDATE man_akses.aplikasi
SET a_filter_organisasi = 1,
    last_update = GETDATE()
WHERE id_aplikasi IN (@app_data_unila, @app_dashboard_pimpinan)
  AND ISNULL(a_filter_organisasi, 0) = 0;
PRINT 'STEP C: a_filter_organisasi enabled — affected rows: ' + CAST(@@ROWCOUNT AS VARCHAR);

-- ============================================================
-- STEP D: Verify final state
-- ============================================================
PRINT '--- VERIFICATION ---';
SELECT a.app_slug,
       ISNULL(a.a_filter_organisasi, 0) AS filter_aktif,
       (SELECT COUNT(*) FROM man_akses.aplikasi_organisasi ao
        WHERE ao.id_aplikasi = a.id_aplikasi AND ISNULL(ao.soft_delete, 0) = 0) AS whitelist_count
FROM man_akses.aplikasi a
WHERE a.app_slug IN ('data-unila', 'dashboard-pimpinan');

SELECT id_peran, nm_peran, ISNULL(a_universal, 0) AS universal
FROM man_akses.peran
WHERE id_peran = 107;

-- COMMIT TRANSACTION; -- uncomment setelah review hasil STEP D
-- ROLLBACK TRANSACTION; -- gunakan kalau ada yang salah
