-- Description: Lock 10 portal app di kategori "Tools & Utilities" + "Data dan
--              Pelaporan" ke unit UPT TIK saja. Mekanisme:
--                STEP A: a_filter_organisasi=1 utk 10 app
--                STEP B: whitelist UPT TIK only (single entry per app)
-- Author: mizar.zulmi
-- Date: 2026-05-19
--
-- 10 app target (semua aktif + tampil portal):
--   Data dan Pelaporan (3): feeder-integrator, sister-integrator, myunila-integrator
--   Tools & Utilities (7):  api-gateway, manajemen-akses, manajemen-apps,
--                           manajemen-konten, monitoring, project-management, webmon
--
-- Konsekuensi:
-- - Developer (peran 107) di UPT TIK → AKSES OK
-- - Developer di unit lain → BLOCKED (sesuai permintaan)
-- - User role lain (mis. Admin Sistem) di luar UPT TIK juga BLOCKED — tapi
--   10 app ini memang internal IT tools, harusnya cuma UPT TIK staff yg perlu.
-- - api-gateway sudah filter ON dengan whitelist UPT TIK — di-skip oleh NOT EXISTS.
--
-- Catatan: peran.a_universal=1 (Administrator, Rektor, dll kalau ada yg di-set
-- universal) tetap auto-PASS bypass filter. Untuk strict locking, perlu turn off
-- a_universal mereka juga — TIDAK dilakukan di script ini.
--
-- Safety: BEGIN TRANSACTION, idempotent (NOT EXISTS check). Default COMMIT
-- di akhir; ROLLBACK kalau STEP D verification tidak sesuai.

BEGIN TRANSACTION;

DECLARE @UPT_TIK_UUID UNIQUEIDENTIFIER = 'C4453E71-A6DB-4487-8F5E-84CB4DE54FEC';
DECLARE @creator UNIQUEIDENTIFIER = '11111111-1111-1111-1111-111111111111';

-- 10 app slug target
DECLARE @target_slugs TABLE (slug VARCHAR(100));
INSERT INTO @target_slugs VALUES
    ('feeder-integrator'),
    ('sister-integrator'),
    ('myunila-integrator'),
    ('api-gateway'),
    ('manajemen-akses'),
    ('manajemen-apps'),
    ('manajemen-konten'),
    ('monitoring'),
    ('project-management'),
    ('webmon');

-- ============================================================
-- STEP A: Enable a_filter_organisasi utk 10 app target
-- ============================================================
UPDATE a
SET a.a_filter_organisasi = 1,
    a.last_update = GETDATE()
FROM man_akses.aplikasi a
INNER JOIN @target_slugs t ON t.slug = a.app_slug
WHERE ISNULL(a.a_filter_organisasi, 0) = 0;

DECLARE @filter_enabled INT = @@ROWCOUNT;
PRINT 'STEP A — apps filter enabled: ' + CAST(@filter_enabled AS VARCHAR);

-- ============================================================
-- STEP B: INSERT whitelist UPT TIK utk masing-masing app target.
--          Idempotent — skip kalau entry sudah ada.
-- ============================================================
INSERT INTO man_akses.aplikasi_organisasi
    (id_aplikasi_organisasi, id_aplikasi, id_organisasi,
     a_include_children, a_aktif, soft_delete,
     tgl_create, last_update, last_sync, id_creator)
SELECT
    NEWID(), a.id_aplikasi, @UPT_TIK_UUID,
    0, 1, 0,
    GETDATE(), GETDATE(), GETDATE(), @creator
FROM man_akses.aplikasi a
INNER JOIN @target_slugs t ON t.slug = a.app_slug
WHERE NOT EXISTS (
    SELECT 1 FROM man_akses.aplikasi_organisasi ao
    WHERE ao.id_aplikasi = a.id_aplikasi
      AND ao.id_organisasi = @UPT_TIK_UUID
      AND ISNULL(ao.soft_delete, 0) = 0
);

DECLARE @inserted INT = @@ROWCOUNT;
PRINT 'STEP B — whitelist entries UPT TIK inserted: ' + CAST(@inserted AS VARCHAR);

-- ============================================================
-- STEP C: Verify state akhir
-- ============================================================
PRINT '--- VERIFICATION ---';
SELECT
    a.app_slug,
    k.nm_kategori,
    ISNULL(a.a_filter_organisasi, 0) AS filter_aktif,
    (SELECT COUNT(*) FROM man_akses.aplikasi_organisasi ao
     WHERE ao.id_aplikasi = a.id_aplikasi AND ISNULL(ao.soft_delete, 0) = 0) AS whitelist_count
FROM man_akses.aplikasi a
INNER JOIN @target_slugs t ON t.slug = a.app_slug
LEFT JOIN man_akses.kategori_aplikasi k ON k.id_kategori = a.id_kategori
ORDER BY k.nm_kategori, a.app_slug;

-- ============================================================
-- STEP D: Simulate impact — siapa yg akan ke-block per app
--          (cuma akan kelihatan kalau peran.a_universal=0)
-- ============================================================
PRINT '--- USER YANG AKAN KE-BLOCK (sample, role bukan universal) ---';
SELECT TOP 50
    a.app_slug,
    pe.nm_peran,
    uo.nm_lemb AS unit_organisasi,
    COUNT(DISTINCT rp.id_pengguna) AS user_count
FROM man_akses.aplikasi a
INNER JOIN @target_slugs t ON t.slug = a.app_slug
INNER JOIN man_akses.menu m ON m.id_aplikasi = a.id_aplikasi AND m.a_aktif = 1
INNER JOIN man_akses.menu_role mr ON mr.id_menu = m.id_menu AND ISNULL(mr.soft_delete,0) = 0
INNER JOIN man_akses.role_pengguna rp ON rp.id_peran = mr.id_peran AND ISNULL(rp.soft_delete,0) = 0
INNER JOIN man_akses.peran pe ON pe.id_peran = rp.id_peran
LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = rp.id_organisasi
WHERE rp.id_organisasi <> @UPT_TIK_UUID
  AND ISNULL(pe.a_universal, 0) = 0
GROUP BY a.app_slug, pe.nm_peran, uo.nm_lemb
ORDER BY a.app_slug, user_count DESC;

COMMIT TRANSACTION;
-- ROLLBACK TRANSACTION; -- gunakan kalau hasil STEP C/D tidak sesuai
