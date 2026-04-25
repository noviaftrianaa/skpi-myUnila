-- ============================================================================
-- Seed: Aktifkan filter organisasi untuk aplikasi 'API Gateway'
-- ----------------------------------------------------------------------------
-- Tujuan:
--   Halaman /portal/kong-admin dipakai untuk monitor Kong API Gateway.
--   Akses HARUS dibatasi ke Developer di unit UPT TIK saja (security).
--   Filter resmi via system man_akses, BUKAN ad-hoc string match di frontend.
--
--   Setting yang diaktifkan:
--     1. aplikasi.a_filter_organisasi = 1  → trigger backend cek whitelist
--     2. aplikasi_organisasi              → daftar org yang boleh akses
--
--   Backend `UserContextService::checkAppAccess()` akan otomatis:
--     - skip filter org kalau peran user adalah "universal" (mis. Super Admin)
--     - kalau bukan, query aplikasi_organisasi untuk verifikasi
--
-- ASUMSI PRA-SYARAT:
--   - Tabel `man_akses.aplikasi_organisasi` SUDAH ADA. Kalau tidak ada,
--     hubungi UPA TIK untuk apply migration data-model — JANGAN bikin sendiri.
--   - Aplikasi 'API Gateway' (id=B85ABABE-...) sudah terdaftar di
--     man_akses.aplikasi.
--   - Unit 'UPT UPT Teknologi Informasi dan Komunikasi'
--     (id=C4453E71-...) sudah terdaftar di man_akses.unit_organisasi.
--
-- TARGET DB: ganti USE sesuai env-nya.
-- ============================================================================

-- USE pdut;            -- produksi
USE pdut_staging;       -- staging (default)
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

-- ----------------------------------------------------------------------------
-- 0. Pra-sanity check (read-only) — abort kalau prasyarat tidak terpenuhi
-- ----------------------------------------------------------------------------
IF OBJECT_ID('man_akses.aplikasi_organisasi', 'U') IS NULL
BEGIN
    RAISERROR(
        'ERROR: tabel man_akses.aplikasi_organisasi tidak ditemukan di DB ini. '
        + 'Hubungi UPA TIK untuk apply migration data-model dulu — script ini '
        + 'tidak akan create tabel sendiri.', 16, 1
    );
    RETURN;
END

IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE id_aplikasi = 'B85ABABE-76A8-4CF3-BA1E-34F11372D228')
BEGIN
    RAISERROR('ERROR: aplikasi API Gateway (B85ABABE-...) tidak ditemukan di man_akses.aplikasi', 16, 1);
    RETURN;
END

IF NOT EXISTS (SELECT 1 FROM man_akses.unit_organisasi WHERE id_organisasi = 'C4453E71-A6DB-4487-8F5E-84CB4DE54FEC')
BEGIN
    RAISERROR('ERROR: unit UPT TIK (C4453E71-...) tidak ditemukan di man_akses.unit_organisasi', 16, 1);
    RETURN;
END

PRINT 'STEP 0 OK — semua prasyarat terpenuhi';
GO

BEGIN TRANSACTION;

-- ----------------------------------------------------------------------------
-- 1. Aktifkan flag filter organisasi di aplikasi 'API Gateway' (idempotent)
-- ----------------------------------------------------------------------------
UPDATE man_akses.aplikasi
SET a_filter_organisasi = 1, last_update = GETDATE()
WHERE id_aplikasi = 'B85ABABE-76A8-4CF3-BA1E-34F11372D228'
  AND ISNULL(a_filter_organisasi, 0) = 0;

IF @@ROWCOUNT > 0
    PRINT 'STEP 1 OK — aplikasi API Gateway: a_filter_organisasi=1';
ELSE
    PRINT 'STEP 1 SKIP — a_filter_organisasi sudah=1';

-- ----------------------------------------------------------------------------
-- 2. Whitelist organisasi UPT TIK (idempotent — INSERT IF NOT EXISTS)
-- ----------------------------------------------------------------------------
IF NOT EXISTS (
    SELECT 1 FROM man_akses.aplikasi_organisasi
    WHERE id_aplikasi    = 'B85ABABE-76A8-4CF3-BA1E-34F11372D228'
      AND id_organisasi  = 'C4453E71-A6DB-4487-8F5E-84CB4DE54FEC'
      AND ISNULL(soft_delete, 0) = 0
)
BEGIN
    INSERT INTO man_akses.aplikasi_organisasi
        (id_aplikasi_organisasi, id_aplikasi, id_organisasi,
         a_include_children, a_aktif, soft_delete, tgl_create)
    VALUES
        (NEWID(),
         'B85ABABE-76A8-4CF3-BA1E-34F11372D228',
         'C4453E71-A6DB-4487-8F5E-84CB4DE54FEC',
         0, 1, 0, GETDATE());
    PRINT 'STEP 2 OK — whitelisted UPT TIK untuk aplikasi API Gateway';
END
ELSE
    PRINT 'STEP 2 SKIP — UPT TIK sudah whitelisted';

COMMIT TRANSACTION;
GO

-- ----------------------------------------------------------------------------
-- 3. Verifikasi (read-only)
-- ----------------------------------------------------------------------------
PRINT '';
PRINT '=== Verifikasi ===';
SELECT id_aplikasi, nm_aplikasi, a_filter_organisasi
FROM man_akses.aplikasi
WHERE id_aplikasi = 'B85ABABE-76A8-4CF3-BA1E-34F11372D228';

SELECT ao.id_aplikasi, ao.id_organisasi, uo.nm_lemb AS nm_organisasi, ao.a_include_children
FROM man_akses.aplikasi_organisasi ao
JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = ao.id_organisasi
WHERE ao.id_aplikasi = 'B85ABABE-76A8-4CF3-BA1E-34F11372D228'
  AND ISNULL(ao.soft_delete, 0) = 0;

PRINT '';
PRINT 'INFO: pastikan menu_role untuk peran Developer (107) → aplikasi API Gateway';
PRINT '      sudah ada (lewat UI Manajemen Akses → Menu Role).';
GO
