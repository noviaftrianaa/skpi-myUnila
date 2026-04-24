-- ============================================================================
-- Seed: WS API MyUnila v2 aplikasi + dummy PJ + role
-- ----------------------------------------------------------------------------
-- Tujuan: register aplikasi baru untuk ws-api (backend/api-service) di man_akses,
-- lengkap dengan PJ dummy + peran Developer supaya bisa dipakai testing flow
-- ws-endpoint + ws-authorization.
--
-- JALANKAN: SQL Server (database pdut), execute sebagai admin man_akses.
-- SAFETY: Semua INSERT idempotent (skip kalau row sudah ada).
-- ROLLBACK: lihat bagian `-- ROLLBACK SNIPPET` di akhir file.
--
-- ID Aplikasi baru (hardcoded, bisa di-tweak kalau collision):
--   D1A39991-68C8-4DD9-AA73-F2E5FAD59B08
-- PJ dummy: pengguna existing `test.developer` (id: 00000000-0000-0000-0000-000000000099)
-- Peran: 107 (Developer)
-- Organisasi: E2B705A7-173E-464A-9FAC-509128709515 (Universitas Lampung)
-- ============================================================================

USE pdut;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;
GO

-- ----------------------------------------------------------------------------
-- 1. Aplikasi: WS API MyUnila v2
-- ----------------------------------------------------------------------------
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
        'E2B705A7-173E-464A-9FAC-509128709515',            -- Universitas Lampung
        'WS API MyUnila v2',
        'Web service MyUnila v2 (api-service Go+Fiber). Source: backend/api-service.',
        'ws-myunila-v2-d28e17947f9c4a654a4dcfcef3b0f8281ca987a5558377c7', -- app_key (testing — ganti di prod)
        'https://my.unila.ac.id/api-service',              -- Kong gateway path
        0, 0, 1,                                            -- sistem_internal_pt = 1
        GETDATE(), GETDATE(), GETDATE(),
        1, 1, 0                                             -- a_live=1, a_aktif=1
    );
    PRINT '✅ Aplikasi "WS API MyUnila v2" inserted (id=D1A39991-68C8-4DD9-AA73-F2E5FAD59B08)';
END
ELSE
    PRINT '⏭️  Aplikasi WS API MyUnila v2 sudah ada — skip insert';
GO

-- ----------------------------------------------------------------------------
-- 2. Role Pengguna: pastikan test.developer punya peran 107 (Developer) di Unila
-- ----------------------------------------------------------------------------
IF NOT EXISTS (
    SELECT 1 FROM man_akses.role_pengguna
    WHERE id_pengguna = '00000000-0000-0000-0000-000000000099'
      AND id_organisasi = 'E2B705A7-173E-464A-9FAC-509128709515'
      AND id_peran = 107
      AND soft_delete = 0
)
BEGIN
    INSERT INTO man_akses.role_pengguna (
        id_role_pengguna, id_pengguna, id_organisasi, id_peran,
        approval_peran,
        tgl_create, last_update, soft_delete, last_sync, id_updater
    ) VALUES (
        NEWID(),
        '00000000-0000-0000-0000-000000000099',            -- test.developer
        'E2B705A7-173E-464A-9FAC-509128709515',            -- Universitas Lampung
        107,                                                -- Developer
        1,                                                  -- approved
        GETDATE(), GETDATE(), 0, GETDATE(),
        '00000000-0000-0000-0000-000000000099'
    );
    PRINT '✅ role_pengguna: test.developer + peran 107 (Developer) @ Universitas Lampung';
END
ELSE
    PRINT '⏭️  role_pengguna test.developer x peran 107 sudah ada';
GO

-- ----------------------------------------------------------------------------
-- 3. PJ Aplikasi: test.developer sebagai PJ Pengembang aplikasi WS API MyUnila v2
-- ----------------------------------------------------------------------------
IF NOT EXISTS (
    SELECT 1 FROM man_akses.pj_aplikasi
    WHERE id_pengguna = '00000000-0000-0000-0000-000000000099'
      AND id_aplikasi = 'D1A39991-68C8-4DD9-AA73-F2E5FAD59B08'
      AND soft_delete = 0
)
BEGIN
    INSERT INTO man_akses.pj_aplikasi (
        id_pj_aplikasi, id_pengguna, id_aplikasi,
        nm_pj, jabatan_pj, no_hp, email,
        a_masih, wkt_selesai,
        tgl_create, last_update, soft_delete, last_sync, id_updater
    ) VALUES (
        NEWID(),
        '00000000-0000-0000-0000-000000000099',
        'D1A39991-68C8-4DD9-AA73-F2E5FAD59B08',
        'Test Developer',
        'PJ Pengembang (Testing)',
        '081234567890',
        'dev@unila.ac.id',
        1, NULL,                                            -- a_masih=1, tidak ada wkt_selesai
        GETDATE(), GETDATE(), 0, GETDATE(),
        '00000000-0000-0000-0000-000000000099'
    );
    PRINT '✅ pj_aplikasi: test.developer sebagai PJ WS API MyUnila v2';
END
ELSE
    PRINT '⏭️  PJ test.developer untuk aplikasi ini sudah ada';
GO

-- ----------------------------------------------------------------------------
-- Commit
-- ----------------------------------------------------------------------------
COMMIT TRANSACTION;
PRINT '';
PRINT '🎉 Seed selesai. Verifikasi di /dashboard/manajemen-akses/manajemen/aplikasi';
PRINT '';
PRINT 'Next step:';
PRINT '  1. Update ENV ws-staging: WS_AUTH_APP_ID=D1A39991-68C8-4DD9-AA73-F2E5FAD59B08';
PRINT '  2. Rebuild ws-staging — auto-sync endpoint ke ws_endpoint akan trigger';
PRINT '  3. Di UI /ws-authorization, pilih aplikasi WS API MyUnila v2, assign endpoint ke peran 107 (Developer)';
PRINT '  4. Test call endpoint ws-api dengan JWT user yang punya peran 107';
GO

-- ============================================================================
-- ROLLBACK SNIPPET (kalau perlu bersihkan test data)
-- ============================================================================
/*
BEGIN TRANSACTION;

UPDATE man_akses.pj_aplikasi
SET soft_delete = 1, last_update = GETDATE(), id_updater = '00000000-0000-0000-0000-000000000099'
WHERE id_aplikasi = 'D1A39991-68C8-4DD9-AA73-F2E5FAD59B08';

UPDATE man_akses.ws_endpoint
SET soft_delete = 1, updated_at = GETDATE(), id_updater = '00000000-0000-0000-0000-000000000099'
WHERE id_aplikasi = 'D1A39991-68C8-4DD9-AA73-F2E5FAD59B08';

UPDATE man_akses.ws_authorization
SET soft_delete = 1, updated_at = GETDATE(), id_updater = '00000000-0000-0000-0000-000000000099'
WHERE id_aplikasi = 'D1A39991-68C8-4DD9-AA73-F2E5FAD59B08';

UPDATE man_akses.role_pengguna
SET soft_delete = 1, last_update = GETDATE(), id_updater = '00000000-0000-0000-0000-000000000099'
WHERE id_pengguna = '00000000-0000-0000-0000-000000000099'
  AND id_peran = 107
  AND id_organisasi = 'E2B705A7-173E-464A-9FAC-509128709515';

DELETE FROM man_akses.aplikasi
WHERE id_aplikasi = 'D1A39991-68C8-4DD9-AA73-F2E5FAD59B08';

COMMIT TRANSACTION;
*/
