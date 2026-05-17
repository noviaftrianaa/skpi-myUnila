-- Description: Grant role + menu access ke user spesifik (by username)
-- Author: mizar.zulmi
-- Date: 2026-05-18
-- Tested on: staging (VM5) pdut_staging
-- Rollback: SELECT * INTO man_akses.role_pengguna_backup_20260518 FROM man_akses.role_pengguna
--          WHERE id_pengguna IN (SELECT id_pengguna FROM man_akses.pengguna WHERE username IN (...));
--
-- USAGE:
-- 1. Edit @users di STEP 1 — daftar username target
-- 2. Edit @roles di STEP 2 — kombinasi (id_peran, id_organisasi) yg di-grant
-- 3. Review STEP 4 verify result sebelum COMMIT
--
-- Role IDs reference (man_akses.peran):
--   1=Administrator, 6=Admin Prodi, 32=Helpdesk, 33=LP3M, 34=WR4, 35=WR3, 36=WR2, 37=WR1
--   38=Rektor, 39=Mahasiswa, 42=Kaprodi, 43=Dekan, 44=Admin Jurusan, 46=Dosen
--   47=Kajur, 106=Admin Fakultas, 107=Developer, 111=Tendik
--
-- Organisasi IDs reference (man_akses.unit_organisasi):
--   E2B705A7-173E-464A-9FAC-509128709515 = Universitas Lampung (universal scope)
--   Untuk Dekan: id_fakultas (level_organisasi=4)
--   Untuk Kaprodi/Admin Prodi: id_prodi (level_organisasi=5)
--   Untuk Kajur/Admin Jurusan: id_jurusan (pdrd.sms id_jns_sms='2', level_organisasi NULL)
--   Cari UUID: SELECT id_organisasi, nm_lemb, level_organisasi FROM man_akses.unit_organisasi
--              WHERE nm_lemb LIKE '%<keyword>%' AND soft_delete=0;

BEGIN TRANSACTION;

-- ============================================================
-- STEP 1: Define target users (by username)
-- ============================================================
DECLARE @users TABLE (username VARCHAR(100));
INSERT INTO @users VALUES
    ('USERNAME_1'),      -- ganti dengan username asli
    ('USERNAME_2');      -- tambah baris sesuai kebutuhan

-- ============================================================
-- STEP 2: Define role(s) yg akan di-grant ke semua user di atas
-- ============================================================
-- id_organisasi WAJIB di-isi (NOT NULL column):
--   - Universal scope (admin/developer/dll): pakai 'E2B705A7-173E-464A-9FAC-509128709515' (Unila root)
--   - Scope fakultas/prodi: pakai UUID hasil lookup man_akses.unit_organisasi
DECLARE @roles TABLE (
    id_peran INT,
    id_organisasi UNIQUEIDENTIFIER,
    sk_penugasan VARCHAR(255),
    tgl_kadaluarsa DATETIME NULL
);
INSERT INTO @roles VALUES
    -- Format: id_peran, id_organisasi, sk_penugasan, tgl_kadaluarsa (NULL=no expiry)
    -- Contoh universal Developer:
    (107, 'E2B705A7-173E-464A-9FAC-509128709515', 'SK Developer 2026', NULL);
    -- Contoh Dekan FT:
    -- (43, '<id_fakultas_uuid>', 'SK Dekan FT 2026/2027', '2027-08-31'),
    -- Contoh Kaprodi:
    -- (42, '<id_prodi_uuid>', 'SK Kaprodi IF 2026/2027', '2027-08-31');

-- ============================================================
-- STEP 3: Backup state user-role (uncomment sekali per run)
-- ============================================================
-- SELECT * INTO man_akses.role_pengguna_backup_20260518
-- FROM man_akses.role_pengguna
-- WHERE id_pengguna IN (SELECT id_pengguna FROM man_akses.pengguna WHERE username IN (SELECT username FROM @users));

-- ============================================================
-- STEP 4: Resolve users — verify dulu sebelum INSERT
-- ============================================================
SELECT
    u.username,
    p.id_pengguna,
    p.nm_pengguna,
    p.email,
    p.a_aktif,
    (SELECT COUNT(*) FROM man_akses.role_pengguna rp
     WHERE rp.id_pengguna = p.id_pengguna AND rp.soft_delete = 0) AS existing_roles_count
FROM @users u
LEFT JOIN man_akses.pengguna p ON LOWER(p.username) = LOWER(u.username) AND p.soft_delete = 0;
-- ⚠️ STOP di sini, review hasil select. Kalau ada username yg NULL id_pengguna,
--    user belum terdaftar di pengguna table → harus dibuat dulu via auth-service.

-- ============================================================
-- STEP 5: INSERT role_pengguna (idempotent — skip kalau kombinasi user+role+org sudah ada)
-- ============================================================
-- id_role_pengguna = uniqueidentifier NOT NULL no default → wajib NEWID()
INSERT INTO man_akses.role_pengguna
    (id_role_pengguna, id_pengguna, id_peran, id_organisasi, sk_penugasan, tgl_sk_penugasan,
     approval_peran, tgl_kadaluarsa, tgl_create, last_update, soft_delete, last_sync, id_updater)
SELECT
    NEWID(), p.id_pengguna, r.id_peran, r.id_organisasi, r.sk_penugasan, GETDATE(),
    1, r.tgl_kadaluarsa, GETDATE(), GETDATE(), 0, GETDATE(),
    '11111111-1111-1111-1111-111111111111'  -- audit: system / mizar
FROM @users u
INNER JOIN man_akses.pengguna p ON LOWER(p.username) = LOWER(u.username) AND p.soft_delete = 0
CROSS JOIN @roles r
WHERE NOT EXISTS (
    SELECT 1 FROM man_akses.role_pengguna rp
    WHERE rp.id_pengguna = p.id_pengguna
      AND rp.id_peran = r.id_peran
      AND rp.id_organisasi = r.id_organisasi
      AND rp.soft_delete = 0
);

DECLARE @rp_inserted INT = @@ROWCOUNT;

-- ============================================================
-- STEP 6: Verify final state
-- ============================================================
SELECT @rp_inserted AS role_inserted;
SELECT
    p.username,
    p.nm_pengguna,
    pe.nm_peran,
    rp.sk_penugasan,
    rp.tgl_kadaluarsa,
    COALESCE(uo.nm_lemb, 'org_id=' + CAST(rp.id_organisasi AS VARCHAR(50))) AS scope
FROM man_akses.role_pengguna rp
INNER JOIN man_akses.pengguna p ON p.id_pengguna = rp.id_pengguna
INNER JOIN man_akses.peran pe ON pe.id_peran = rp.id_peran
LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = rp.id_organisasi
WHERE p.username IN (SELECT username FROM @users) AND rp.soft_delete = 0
ORDER BY p.username, pe.nm_peran;

COMMIT TRANSACTION;
