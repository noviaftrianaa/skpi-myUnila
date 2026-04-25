-- ============================================================================
-- Seed MINIMAL: WS API MyUnila v2 — hanya row di man_akses.aplikasi
-- ----------------------------------------------------------------------------
-- Tujuan: register aplikasi "WS API MyUnila v2" di pdut/pdut_staging tanpa
-- depend ke user `test.developer` — versi penuh ada di
-- `seed_ws_api_myunila_v2.sql` (require pengguna 00000000-...000099 sudah ada).
--
-- Setelah row aplikasi terisi, PJ Aplikasi + role_pengguna bisa di-set lewat UI:
--   /dashboard/manajemen-akses/manajemen/pj-aplikasi
--
-- TARGET DB: ganti USE di bawah sesuai env-nya:
--   - Staging  : USE pdut_staging;
--   - Produksi : USE pdut;
-- ============================================================================

USE pdut_staging;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT 1 FROM man_akses.aplikasi
    WHERE id_aplikasi = 'D1A39991-68C8-4DD9-AA73-F2E5FAD59B08'
)
BEGIN
    INSERT INTO man_akses.aplikasi (
        id_aplikasi, id_organisasi,
        nm_aplikasi, ket_aplikasi,
        app_key, url,
        a_generate_menu, a_integrasi_cas, a_sistem_internal_pt,
        tgl_create, last_update, last_sync,
        a_live, a_aktif, a_filter_organisasi
    ) VALUES (
        'D1A39991-68C8-4DD9-AA73-F2E5FAD59B08',
        'E2B705A7-173E-464A-9FAC-509128709515',
        'WS API MyUnila v2',
        'Web service MyUnila v2 (api-service Go+Fiber). Source: backend/api-service.',
        'ws-myunila-v2-d28e17947f9c4a654a4dcfcef3b0f8281ca987a5558377c7',
        'https://my.unila.ac.id/api-service',
        0, 0, 1,
        GETDATE(), GETDATE(), GETDATE(),
        1, 1, 0
    );
    PRINT 'OK — aplikasi WS API MyUnila v2 inserted (id=D1A39991-68C8-4DD9-AA73-F2E5FAD59B08)';
END
ELSE
    PRINT 'SKIP — aplikasi WS API MyUnila v2 sudah ada';

COMMIT TRANSACTION;
GO

-- Verifikasi
SELECT id_aplikasi, nm_aplikasi, a_aktif, a_live, url
FROM man_akses.aplikasi
WHERE id_aplikasi = 'D1A39991-68C8-4DD9-AA73-F2E5FAD59B08';
GO

PRINT '';
PRINT 'Next:';
PRINT '  1. Buka UI /dashboard/manajemen-akses/manajemen/pj-aplikasi';
PRINT '  2. Pilih aplikasi "WS API MyUnila v2", tambah PJ pakai user yang sudah ada';
PRINT '  3. Buka /ws-authorization, pilih PJ, ceklist endpoint, save';
GO
