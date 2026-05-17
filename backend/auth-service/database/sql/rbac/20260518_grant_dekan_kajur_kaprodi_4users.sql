-- Description: Grant 3 role (Dekan + Kajur + Kaprodi) ke 4 user by username
-- Author: mizar.zulmi
-- Date: 2026-05-18
-- Tested on: staging (VM5) pdut_staging
--
-- TARGET ASSIGNMENT:
--   mizar.zulmi          → Dekan FMIPA + Kajur Ilmu Komputer + Kaprodi S1 Ilmu Komputer
--   mahendra.pratama15   → Dekan FT    + Kajur Teknik Elektro + Kaprodi S1 Teknik Informatika
--   m.ikhsan             → Dekan FMIPA + Kajur Ilmu Komputer + Kaprodi S1 Ilmu Komputer
--   muhikhsan            → Dekan FMIPA + Kajur Ilmu Komputer + Kaprodi S1 Ilmu Komputer
--
-- Idempotent: kalau kombinasi (username, id_peran, id_organisasi) sudah ada → SKIP.
-- Tidak akan double, tidak akan menimpa role lain yang sudah dimiliki user.
--
-- Verified UUIDs (2026-05-18):
--   FMIPA          : 4697B29D-A708-492C-8E20-0A3E5EDE1437
--   Jur Ilmu Komp  : 2A3AB359-93EF-4AD4-8BA7-1CB8BB048F4E
--   S1 Ilmu Komp   : 54BBD27B-2376-4CAE-9951-76EF54BD2CA2
--   FT             : B8E36886-31B0-4406-B69F-29E255B1B60D
--   Jur Tek Elektro: 65801AF2-31E0-4605-9CDC-0C54D6F2A181
--   S1 Tek Inform. : FC4FC29A-85CA-47B3-8E61-3A9E9E129A88
--   Dekan=43, Kajur=47, Kaprodi=42

BEGIN TRANSACTION;

-- ============================================================
-- STEP 1: Backup state 3 user (uncomment sekali per run)
-- ============================================================
-- SELECT * INTO man_akses.role_pengguna_backup_4users_20260518
-- FROM man_akses.role_pengguna
-- WHERE id_pengguna IN (
--     SELECT id_pengguna FROM man_akses.pengguna
--     WHERE username IN ('mizar.zulmi','mahendra.pratama15','m.ikhsan','muhikhsan')
-- );

-- ============================================================
-- STEP 2: Define assignment matrix (username × role × org)
-- ============================================================
DECLARE @assignments TABLE (
    username VARCHAR(100),
    id_peran INT,
    id_organisasi UNIQUEIDENTIFIER,
    sk_penugasan VARCHAR(255)
);

INSERT INTO @assignments VALUES
    -- mizar.zulmi → FMIPA cluster
    ('mizar.zulmi',        43, '4697B29D-A708-492C-8E20-0A3E5EDE1437', 'SK Dekan FMIPA 2026'),
    ('mizar.zulmi',        47, '2A3AB359-93EF-4AD4-8BA7-1CB8BB048F4E', 'SK Kajur Ilmu Komputer 2026'),
    ('mizar.zulmi',        42, '54BBD27B-2376-4CAE-9951-76EF54BD2CA2', 'SK Kaprodi S1 Ilmu Komputer 2026'),

    -- mahendra.pratama15 → FT cluster
    ('mahendra.pratama15', 43, 'B8E36886-31B0-4406-B69F-29E255B1B60D', 'SK Dekan FT 2026'),
    ('mahendra.pratama15', 47, '65801AF2-31E0-4605-9CDC-0C54D6F2A181', 'SK Kajur Teknik Elektro 2026'),
    ('mahendra.pratama15', 42, 'FC4FC29A-85CA-47B3-8E61-3A9E9E129A88', 'SK Kaprodi S1 Teknik Informatika 2026'),

    -- m.ikhsan → FMIPA cluster
    ('m.ikhsan',           43, '4697B29D-A708-492C-8E20-0A3E5EDE1437', 'SK Dekan FMIPA 2026'),
    ('m.ikhsan',           47, '2A3AB359-93EF-4AD4-8BA7-1CB8BB048F4E', 'SK Kajur Ilmu Komputer 2026'),
    ('m.ikhsan',           42, '54BBD27B-2376-4CAE-9951-76EF54BD2CA2', 'SK Kaprodi S1 Ilmu Komputer 2026'),

    -- muhikhsan → FMIPA cluster (sama dengan m.ikhsan)
    ('muhikhsan',          43, '4697B29D-A708-492C-8E20-0A3E5EDE1437', 'SK Dekan FMIPA 2026'),
    ('muhikhsan',          47, '2A3AB359-93EF-4AD4-8BA7-1CB8BB048F4E', 'SK Kajur Ilmu Komputer 2026'),
    ('muhikhsan',          42, '54BBD27B-2376-4CAE-9951-76EF54BD2CA2', 'SK Kaprodi S1 Ilmu Komputer 2026');

-- ============================================================
-- STEP 3: Verify pre-state — pastikan user existed + lihat role saat ini
-- ============================================================
SELECT DISTINCT
    a.username,
    p.id_pengguna,
    p.nm_pengguna,
    p.email,
    p.a_aktif,
    (SELECT COUNT(*) FROM man_akses.role_pengguna rp
     WHERE rp.id_pengguna = p.id_pengguna AND rp.soft_delete = 0) AS existing_roles
FROM @assignments a
LEFT JOIN man_akses.pengguna p ON LOWER(p.username) = LOWER(a.username) AND p.soft_delete = 0;

-- ⚠️ STOP — kalau ada username NULL id_pengguna, user tidak terdaftar di man_akses.pengguna.

-- Preview: assignment yang AKAN di-insert (yg belum ada)
SELECT
    a.username,
    a.id_peran,
    pe.nm_peran,
    a.id_organisasi,
    COALESCE(uo.nm_lemb, 'pdrd_sms_id=' + CAST(a.id_organisasi AS VARCHAR(50))) AS scope_org,
    a.sk_penugasan,
    CASE WHEN EXISTS (
        SELECT 1 FROM man_akses.role_pengguna rp
        INNER JOIN man_akses.pengguna p2 ON p2.id_pengguna = rp.id_pengguna
        WHERE LOWER(p2.username) = LOWER(a.username)
          AND rp.id_peran = a.id_peran
          AND rp.id_organisasi = a.id_organisasi
          AND rp.soft_delete = 0
    ) THEN 'SKIP (already exists)' ELSE 'WILL INSERT' END AS action
FROM @assignments a
INNER JOIN man_akses.peran pe ON pe.id_peran = a.id_peran
LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = a.id_organisasi
ORDER BY a.username, a.id_peran DESC;

-- ============================================================
-- STEP 4: INSERT role_pengguna (idempotent — skip kalau sudah ada)
-- ============================================================
DECLARE @id_updater UNIQUEIDENTIFIER = '11111111-1111-1111-1111-111111111111';

INSERT INTO man_akses.role_pengguna
    (id_role_pengguna, id_pengguna, id_peran, id_organisasi, sk_penugasan, tgl_sk_penugasan,
     approval_peran, tgl_kadaluarsa, tgl_create, last_update, soft_delete, last_sync, id_updater)
SELECT
    NEWID(),
    p.id_pengguna,
    a.id_peran,
    a.id_organisasi,
    a.sk_penugasan,
    GETDATE(),
    1,                   -- approval_peran = approved
    NULL,                -- tgl_kadaluarsa = NULL (no expiry)
    GETDATE(),
    GETDATE(),
    0,
    GETDATE(),
    @id_updater
FROM @assignments a
INNER JOIN man_akses.pengguna p ON LOWER(p.username) = LOWER(a.username) AND p.soft_delete = 0
WHERE NOT EXISTS (
    SELECT 1 FROM man_akses.role_pengguna rp
    WHERE rp.id_pengguna = p.id_pengguna
      AND rp.id_peran = a.id_peran
      AND rp.id_organisasi = a.id_organisasi
      AND rp.soft_delete = 0
);

DECLARE @rp_inserted INT = @@ROWCOUNT;

-- ============================================================
-- STEP 5: Verify post-state — list semua role 3 user (yang baru saja + yang lama)
-- ============================================================
SELECT @rp_inserted AS roles_inserted_total;

SELECT
    p.username,
    p.nm_pengguna,
    pe.nm_peran,
    pe.id_peran,
    COALESCE(uo.nm_lemb, 'pdrd_sms_id=' + CAST(rp.id_organisasi AS VARCHAR(50))) AS scope_org,
    rp.sk_penugasan,
    CONVERT(VARCHAR(19), rp.tgl_create, 120) AS tgl_create,
    rp.tgl_kadaluarsa
FROM man_akses.role_pengguna rp
INNER JOIN man_akses.pengguna p ON p.id_pengguna = rp.id_pengguna
INNER JOIN man_akses.peran pe ON pe.id_peran = rp.id_peran
LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = rp.id_organisasi
WHERE LOWER(p.username) IN ('mizar.zulmi','mahendra.pratama15','m.ikhsan','muhikhsan')
  AND rp.soft_delete = 0
ORDER BY p.username, rp.tgl_create DESC;

COMMIT TRANSACTION;
