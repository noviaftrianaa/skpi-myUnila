-- Description: HARD CONSTRAINT — Developer (id_peran=107) HANYA boleh di
--              organisasi UPT TIK (id=C4453E71-A6DB-4487-8F5E-84CB4DE54FEC).
--              Soft-revoke (soft_delete=1) semua role_pengguna Developer
--              yg id_organisasi != UPT TIK.
-- Author: mizar.zulmi
-- Date: 2026-05-19
--
-- Rasional: pengamatan user 2026-05-19 — Developer di unit selain UPT TIK
-- masih bisa buka portal app (mis. Feeder Integrator, SISTER Integrator).
-- Mekanisme whitelist 20260518_restrict_portal_apps_via_whitelist.sql
-- hanya cover data-unila + dashboard-pimpinan, BUKAN app integrator/tools.
-- User menetapkan policy baru: peran Developer WAJIB hanya untuk staff TIK.
--
-- Catatan: ini OVERRIDE keputusan sebelumnya (2026-05-18) yg meng-allow
-- Developer cross-unit utk PJ aplikasi konsumsi api-service. Kalau PJ aplikasi
-- masih perlu akses api-service, mereka harus pakai role/auth mechanism lain
-- (mis. service-account JWT atau role "API Consumer" baru).
--
-- Safety:
--   - BEGIN TRANSACTION + soft_delete=1 (rollback-able, BUKAN DELETE).
--   - Idempotent: WHERE ISNULL(soft_delete,0)=0.
--   - STEP 0 preview, STEP 1 revoke, STEP 2 verify post-state.
--   - COMMIT manual di akhir. Default tidak auto-commit supaya bisa review.

BEGIN TRANSACTION;

DECLARE @UPT_TIK_UUID UNIQUEIDENTIFIER = 'C4453E71-A6DB-4487-8F5E-84CB4DE54FEC';
DECLARE @ID_PERAN_DEVELOPER INT = 107;
DECLARE @SYSTEM_UUID UNIQUEIDENTIFIER = '11111111-1111-1111-1111-111111111111';

-- ============================================================
-- STEP 0: Preview — daftar role_pengguna Developer yang akan di-revoke
-- ============================================================
SELECT
    p.username,
    p.email,
    p.nm_lengkap,
    ISNULL(o.nm_lemb, '(no org)') AS unit_organisasi,
    CAST(rp.id_organisasi AS VARCHAR(36)) AS id_organisasi,
    rp.tgl_create
FROM man_akses.role_pengguna rp
INNER JOIN man_akses.pengguna p ON p.id_pengguna = rp.id_pengguna
LEFT JOIN man_akses.unit_organisasi o ON o.id_organisasi = rp.id_organisasi
WHERE rp.id_peran = @ID_PERAN_DEVELOPER
  AND ISNULL(rp.soft_delete, 0) = 0
  AND rp.id_organisasi <> @UPT_TIK_UUID
ORDER BY p.username;

-- ============================================================
-- STEP 1: REVOKE — soft_delete=1 untuk Developer non-UPT TIK
-- ============================================================
UPDATE rp
SET rp.soft_delete = 1,
    rp.last_update = GETDATE(),
    rp.id_updater = @SYSTEM_UUID
FROM man_akses.role_pengguna rp
WHERE rp.id_peran = @ID_PERAN_DEVELOPER
  AND ISNULL(rp.soft_delete, 0) = 0
  AND rp.id_organisasi <> @UPT_TIK_UUID;

DECLARE @revoked INT = @@ROWCOUNT;
PRINT 'STEP 1 — role_pengguna Developer non-UPT TIK revoked: ' + CAST(@revoked AS VARCHAR);

-- ============================================================
-- STEP 2: Verify post-state — siapa saja yg masih aktif sebagai Developer
-- ============================================================
PRINT '--- Developer aktif sesudah revoke (harus semua UPT TIK) ---';
SELECT
    p.username,
    p.nm_lengkap,
    ISNULL(o.nm_lemb, '(no org)') AS unit_organisasi,
    CASE
        WHEN rp.id_organisasi = @UPT_TIK_UUID THEN 'VALID (UPT TIK)'
        ELSE 'STILL NON-UPT-TIK (manual check)'
    END AS status
FROM man_akses.role_pengguna rp
INNER JOIN man_akses.pengguna p ON p.id_pengguna = rp.id_pengguna
LEFT JOIN man_akses.unit_organisasi o ON o.id_organisasi = rp.id_organisasi
WHERE rp.id_peran = @ID_PERAN_DEVELOPER
  AND ISNULL(rp.soft_delete, 0) = 0
ORDER BY p.username;

-- COMMIT TRANSACTION; -- uncomment setelah review STEP 2 OK
-- ROLLBACK TRANSACTION; -- kalau hasil tidak sesuai

-- ============================================================
-- ROLLBACK SCRIPT (kalau perlu undo nanti):
-- UPDATE man_akses.role_pengguna
-- SET soft_delete = 0, last_update = GETDATE()
-- WHERE id_peran = 107
--   AND soft_delete = 1
--   AND last_update >= '2026-05-19';
-- ============================================================
