-- Description: Grant role + menu access ke user spesifik (by username)
-- Author: mizar.zulmi
-- Date: 2026-05-18
-- Tested on: staging (VM5)
-- Rollback: SELECT * INTO man_akses.role_pengguna_backup_20260518 FROM man_akses.role_pengguna
--          WHERE id_pengguna IN (SELECT id_pengguna FROM man_akses.pengguna WHERE username IN (...));
--
-- USAGE:
-- 1. Ganti @USERNAME di STEP 1 dengan username target (1 atau lebih)
-- 2. Ganti @ID_PERAN di STEP 2 dengan role yg mau di-grant
-- 3. Ganti @ID_ORG_SCOPE kalau perlu scope (NULL = universal scope)
-- 4. Review query verify di STEP 4 sebelum COMMIT
--
-- Role IDs reference (man_akses.peran):
--   1=Administrator, 6=Admin Prodi, 32=Helpdesk, 33=LP3M, 34=WR4, 35=WR3, 36=WR2, 37=WR1
--   38=Rektor, 39=Mahasiswa, 42=Kaprodi, 43=Dekan, 44=Admin Jurusan, 46=Dosen
--   47=Kajur, 106=Admin Fakultas, 107=Developer, 111=Tendik

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
DECLARE @roles TABLE (id_peran INT, id_organisasi UNIQUEIDENTIFIER NULL, sk_penugasan VARCHAR(255), tgl_kadaluarsa DATE NULL);
INSERT INTO @roles VALUES
    -- Format: id_peran, id_organisasi (NULL=universal), sk_penugasan, tgl_kadaluarsa (NULL=no expiry)
    (107, NULL, 'SK Developer 2026', NULL);   -- contoh: Developer universal, no expiry
    -- (43, '<id_fakultas_uuid>', 'SK Dekan FT 2026/2027', '2027-08-31'),  -- contoh Dekan FT
    -- (42, '<id_prodi_uuid>',    'SK Kaprodi IF 2026/2027', '2027-08-31');

-- ============================================================
-- STEP 3: Backup state user-role (uncomment sekali per run)
-- ============================================================
-- SELECT * INTO man_akses.role_pengguna_backup_20260518
-- FROM man_akses.role_pengguna
-- WHERE id_pengguna IN (SELECT id_pengguna FROM man_akses.pengguna WHERE username IN (SELECT username FROM @users));

-- ============================================================
-- STEP 4: Resolve users — verify dulu sebelum INSERT
-- ============================================================
SELECT u.username, p.id_pengguna, p.nm_pengguna, p.email, p.a_aktif,
       (SELECT COUNT(*) FROM man_akses.role_pengguna rp WHERE rp.id_pengguna = p.id_pengguna AND rp.soft_delete = 0) AS existing_roles_count
FROM @users u
LEFT JOIN man_akses.pengguna p ON LOWER(p.username) = LOWER(u.username) AND p.soft_delete = 0;

-- ⚠️ STOP di sini, review hasil select. Kalau ada username yg NULL id_pengguna, fix dulu.

-- ============================================================
-- STEP 5: INSERT role_pengguna (idempotent — skip kalau kombinasi user+role+org sudah ada)
-- ============================================================
INSERT INTO man_akses.role_pengguna
    (id_pengguna, id_peran, id_organisasi, sk_penugasan, tgl_sk_penugasan,
     approval_peran, tgl_kadaluarsa, tgl_create, last_update, soft_delete, last_sync, id_updater)
SELECT
    p.id_pengguna, r.id_peran, r.id_organisasi, r.sk_penugasan, GETDATE(),
    1, r.tgl_kadaluarsa, GETDATE(), GETDATE(), 0, GETDATE(),
    '11111111-1111-1111-1111-111111111111'  -- audit: system / mizar
FROM @users u
INNER JOIN man_akses.pengguna p ON LOWER(p.username) = LOWER(u.username) AND p.soft_delete = 0
CROSS JOIN @roles r
WHERE NOT EXISTS (
    SELECT 1 FROM man_akses.role_pengguna rp
    WHERE rp.id_pengguna = p.id_pengguna
      AND rp.id_peran = r.id_peran
      AND ISNULL(CAST(rp.id_organisasi AS VARCHAR(50)), '') = ISNULL(CAST(r.id_organisasi AS VARCHAR(50)), '')
      AND rp.soft_delete = 0
);

DECLARE @rp_inserted INT = @@ROWCOUNT;

-- ============================================================
-- STEP 6: Verify final state
-- ============================================================
SELECT @rp_inserted AS role_inserted;
SELECT p.username, p.nm_pengguna, pe.nm_peran, rp.sk_penugasan, rp.tgl_kadaluarsa,
       CASE WHEN rp.id_organisasi IS NULL THEN 'UNIVERSAL'
            ELSE COALESCE(uo.nm_lemb, 'org_id=' + CAST(rp.id_organisasi AS VARCHAR(50)))
       END AS scope
FROM man_akses.role_pengguna rp
INNER JOIN man_akses.pengguna p ON p.id_pengguna = rp.id_pengguna
INNER JOIN man_akses.peran pe ON pe.id_peran = rp.id_peran
LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = rp.id_organisasi
WHERE p.username IN (SELECT username FROM @users) AND rp.soft_delete = 0
ORDER BY p.username, pe.nm_peran;

COMMIT TRANSACTION;
