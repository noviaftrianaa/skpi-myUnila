-- Description: Grant 3 role ke mizar.zulmi — Dekan FT + Kajur Teknik Elektro + Kaprodi S1 Teknik Informatika
-- Author: mizar.zulmi
-- Date: 2026-05-18
-- Tested on: staging (VM5) pdut_staging
--
-- TARGET:
--   username: mizar.zulmi (id_pengguna 26004417-6E92-463C-BF35-F741817121DC)
--   nm: Mizar Zulmi Ramadahan, S.Kom — email: mizar.zulmi@staff.unila.ac.id
--
-- ROLE + SCOPE:
--   1. Dekan (43)   → Fakultas TEKNIK              (B8E36886-31B0-4406-B69F-29E255B1B60D)
--   2. Kajur (47)   → Jurusan TEKNIK ELEKTRO       (65801AF2-31E0-4605-9CDC-0C54D6F2A181)
--   3. Kaprodi (42) → Program Studi S1 Teknik Informatika (FC4FC29A-85CA-47B3-8E61-3A9E9E129A88)
--
-- Note: Berdasarkan hierarki pdrd.sms, Program Studi S1 Teknik Informatika berada
--       di bawah Jurusan TEKNIK ELEKTRO, di bawah Fakultas TEKNIK.

BEGIN TRANSACTION;

-- ============================================================
-- STEP 1: Backup state user mizar.zulmi (uncomment sekali per run)
-- ============================================================
-- SELECT * INTO man_akses.role_pengguna_backup_mizar_20260518
-- FROM man_akses.role_pengguna
-- WHERE id_pengguna = '26004417-6E92-463C-BF35-F741817121DC';

-- ============================================================
-- STEP 2: Verify user exists & list role saat ini
-- ============================================================
SELECT
    p.username,
    p.nm_pengguna,
    p.email,
    p.a_aktif,
    (SELECT COUNT(*) FROM man_akses.role_pengguna rp
     WHERE rp.id_pengguna = p.id_pengguna AND rp.soft_delete = 0) AS existing_roles
FROM man_akses.pengguna p
WHERE p.id_pengguna = '26004417-6E92-463C-BF35-F741817121DC';

SELECT pe.nm_peran, rp.id_organisasi, uo.nm_lemb AS scope_org, rp.sk_penugasan, rp.tgl_kadaluarsa
FROM man_akses.role_pengguna rp
INNER JOIN man_akses.peran pe ON pe.id_peran = rp.id_peran
LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = rp.id_organisasi
WHERE rp.id_pengguna = '26004417-6E92-463C-BF35-F741817121DC' AND rp.soft_delete = 0
ORDER BY rp.tgl_create;

-- ⚠️ Review hasil di atas. Lanjut INSERT di STEP 3.

-- ============================================================
-- STEP 3: INSERT 3 role (idempotent — skip kalau kombinasi sudah ada)
-- ============================================================
DECLARE @id_pengguna UNIQUEIDENTIFIER = '26004417-6E92-463C-BF35-F741817121DC';
DECLARE @id_updater UNIQUEIDENTIFIER  = '11111111-1111-1111-1111-111111111111';

DECLARE @grants TABLE (
    id_peran INT,
    id_organisasi UNIQUEIDENTIFIER,
    sk_penugasan VARCHAR(255),
    keterangan VARCHAR(200)
);
INSERT INTO @grants VALUES
    (43, 'B8E36886-31B0-4406-B69F-29E255B1B60D', 'SK Dekan Fakultas Teknik 2026',         'Dekan Fakultas TEKNIK'),
    (47, '65801AF2-31E0-4605-9CDC-0C54D6F2A181', 'SK Kajur Teknik Elektro 2026',          'Kajur Jurusan TEKNIK ELEKTRO'),
    (42, 'FC4FC29A-85CA-47B3-8E61-3A9E9E129A88', 'SK Kaprodi S1 Teknik Informatika 2026', 'Kaprodi Program Studi S1 Teknik Informatika');

INSERT INTO man_akses.role_pengguna
    (id_role_pengguna, id_pengguna, id_peran, id_organisasi, sk_penugasan, tgl_sk_penugasan,
     approval_peran, tgl_kadaluarsa, tgl_create, last_update, soft_delete, last_sync, id_updater)
SELECT
    NEWID(),
    @id_pengguna,
    g.id_peran,
    g.id_organisasi,
    g.sk_penugasan,
    GETDATE(),
    1,                   -- approval_peran = approved
    NULL,                -- tgl_kadaluarsa = NULL (no expiry)
    GETDATE(),
    GETDATE(),
    0,
    GETDATE(),
    @id_updater
FROM @grants g
WHERE NOT EXISTS (
    SELECT 1 FROM man_akses.role_pengguna rp
    WHERE rp.id_pengguna = @id_pengguna
      AND rp.id_peran = g.id_peran
      AND rp.id_organisasi = g.id_organisasi
      AND rp.soft_delete = 0
);

DECLARE @rp_inserted INT = @@ROWCOUNT;

-- ============================================================
-- STEP 4: Verify final — list semua role mizar.zulmi
-- ============================================================
SELECT @rp_inserted AS roles_inserted;

SELECT
    p.username,
    p.nm_pengguna,
    pe.nm_peran,
    pe.id_peran,
    COALESCE(uo.nm_lemb, 'pdrd_sms_id=' + CAST(rp.id_organisasi AS VARCHAR(50))) AS scope_org,
    rp.sk_penugasan,
    rp.tgl_kadaluarsa,
    rp.tgl_create
FROM man_akses.role_pengguna rp
INNER JOIN man_akses.pengguna p ON p.id_pengguna = rp.id_pengguna
INNER JOIN man_akses.peran pe ON pe.id_peran = rp.id_peran
LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = rp.id_organisasi
WHERE p.id_pengguna = '26004417-6E92-463C-BF35-F741817121DC' AND rp.soft_delete = 0
ORDER BY rp.tgl_create DESC;

COMMIT TRANSACTION;
