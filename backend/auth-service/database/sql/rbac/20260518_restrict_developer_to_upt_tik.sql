-- Description: Restrict role Developer (id_peran=107) HANYA ke unit UPT TIK.
--              Soft-revoke entry role_pengguna utk user di luar UPT TIK, dengan
--              pendekatan mixed:
--                Bag 1 → REVOKE permanen: akun testing/magang/mahasiswa/noreply.
--                Bag 2 → REVOKE duplikat: user yg sudah punya Developer di UPT TIK
--                        tetapi juga punya assignment di scope lain (cleanup).
--                Bag 3 → REVIEW (NOT executed by default): akun staff yg butuh
--                        verifikasi manual sebelum migrate / revoke.
--
-- Author: mizar.zulmi
-- Date: 2026-05-18
--
-- Safety:
--   - Pakai BEGIN TRANSACTION + soft_delete=1 (NON-destructive, bisa rollback).
--   - Idempotent: WHERE ISNULL(soft_delete,0)=0 supaya tidak re-update entry yg sudah revoked.
--   - Step 0 PREVIEW dulu, Step 1/2 baru UPDATE, Step 3 verify post-state.
--   - Bag 3 dibungkus IF 1=0 supaya tidak jalan tanpa edit eksplisit.
--
-- Pre-audit (staging): 30 user Developer total → 6 valid UPT TIK, 24 non-UPT TIK.
-- UPT TIK UUID = C4453E71-A6DB-4487-8F5E-84CB4DE54FEC

BEGIN TRANSACTION;

DECLARE @UPT_TIK_UUID UNIQUEIDENTIFIER = 'C4453E71-A6DB-4487-8F5E-84CB4DE54FEC';
DECLARE @ID_PERAN_DEVELOPER INT = 107;
DECLARE @SYSTEM_UUID UNIQUEIDENTIFIER = '11111111-1111-1111-1111-111111111111';

-- ============================================================
-- STEP 0: Preview — current state Developer assignments
-- ============================================================
SELECT
    p.username,
    p.email,
    p.nm_lengkap,
    o.nm_organisasi AS unit_organisasi,
    CAST(rp.id_organisasi AS VARCHAR(36)) AS id_organisasi,
    rp.tgl_create,
    ISNULL(rp.soft_delete, 0) AS soft_delete,
    CASE
        WHEN rp.id_organisasi = @UPT_TIK_UUID THEN 'VALID (UPT TIK)'
        ELSE 'NON-UPT-TIK (revoke candidate)'
    END AS klasifikasi
FROM man_akses.role_pengguna rp
INNER JOIN man_akses.pengguna p ON p.id_pengguna = rp.id_pengguna
LEFT JOIN man_akses.organisasi o ON o.id_organisasi = rp.id_organisasi
WHERE rp.id_peran = @ID_PERAN_DEVELOPER
  AND ISNULL(rp.soft_delete, 0) = 0
ORDER BY klasifikasi DESC, p.username;

-- ============================================================
-- BAGIAN 1: REVOKE permanen — akun testing / magang / mahasiswa / noreply
--           (clearly invalid, tidak perlu role Developer)
-- ============================================================
DECLARE @bag1_usernames TABLE (username NVARCHAR(255));
INSERT INTO @bag1_usernames(username) VALUES
    ('magang'),
    ('magang2024@gmail.com'),
    ('harno'),
    ('admin-sso@test.unila.ac.id'),
    ('testing'),
    ('mhs-testing'),
    ('test.semantik1'),
    ('test.semantik2'),
    ('2217051068'),                                 -- MAHASISWA: DHIYA GHINA HASRI
    ('noreply.portalprodi@eng.unila.ac.id');        -- noreply system account

UPDATE rp
SET rp.soft_delete = 1,
    rp.last_update = GETDATE(),
    rp.id_updater = @SYSTEM_UUID
FROM man_akses.role_pengguna rp
INNER JOIN man_akses.pengguna p ON p.id_pengguna = rp.id_pengguna
WHERE rp.id_peran = @ID_PERAN_DEVELOPER
  AND ISNULL(rp.soft_delete, 0) = 0
  AND p.username IN (SELECT username FROM @bag1_usernames);

DECLARE @bag1_revoked INT = @@ROWCOUNT;
PRINT 'BAG 1 (testing/magang/mahasiswa/noreply) revoked: ' + CAST(@bag1_revoked AS VARCHAR);

-- ============================================================
-- BAGIAN 2: REVOKE duplikat scope — user yg PUNYA Developer di UPT TIK
--           tapi juga punya assignment di scope lain. Pertahankan yg UPT TIK.
-- ============================================================
UPDATE rp
SET rp.soft_delete = 1,
    rp.last_update = GETDATE(),
    rp.id_updater = @SYSTEM_UUID
FROM man_akses.role_pengguna rp
WHERE rp.id_peran = @ID_PERAN_DEVELOPER
  AND ISNULL(rp.soft_delete, 0) = 0
  AND rp.id_organisasi <> @UPT_TIK_UUID
  AND EXISTS (
      SELECT 1 FROM man_akses.role_pengguna rp2
      WHERE rp2.id_pengguna = rp.id_pengguna
        AND rp2.id_peran = @ID_PERAN_DEVELOPER
        AND rp2.id_organisasi = @UPT_TIK_UUID
        AND ISNULL(rp2.soft_delete, 0) = 0
  );

DECLARE @bag2_revoked INT = @@ROWCOUNT;
PRINT 'BAG 2 (duplicate scope cleanup, kept UPT TIK) revoked: ' + CAST(@bag2_revoked AS VARCHAR);

-- ============================================================
-- BAGIAN 3: REVIEW — akun staff yg butuh verifikasi manual.
--           DEFAULT: BLOCKED (IF 1=0). Edit username list + ubah IF 1=1
--           setelah konfirmasi dgn user.
--
-- Pilihan kebijakan per-username:
--   A) MIGRATE → ubah id_organisasi ke @UPT_TIK_UUID (kalau staff TIK valid)
--   B) REVOKE → soft_delete=1 (kalau bukan staff TIK)
-- ============================================================

-- Daftar review (dari audit, klasifikasi belum final):
--   admin.tik                                  → kandidat MIGRATE
--   iqbalparabi@staff.unila.ac.id              → kandidat MIGRATE
--   ery.setiawan                               → kandidat MIGRATE
--   tegar.wisnu                                → kandidat MIGRATE
--   rio.ananda                                 → kandidat MIGRATE
--   zulliana.nurfadlillah                      → kandidat MIGRATE
--   aprily.ayu (@staff.unila.ac.id duplicate)  → kandidat REVOKE (sudah ada di UPT TIK)
--   igit.sabda                                 → REVIEW (role developer untuk apa?)
--   muhikhsan                                  → REVIEW (sudah dapat dekan/kajur/kaprodi FMIPA)
--   m.ikhsan                                   → REVIEW (duplikat muhikhsan?)
--   NUR.AINUN21                                → REVIEW
--   andi.susanto                               → REVIEW
--   mahendra.pratama15                         → REVIEW (sudah dapat dekan/kajur/kaprodi FT)
--   mahendra.pratama15@eng.unila.ac.id         → REVIEW (duplikat mahendra.pratama15)

-- Contoh MIGRATE (uncomment + sesuaikan):
IF 1=0
BEGIN
    DECLARE @bag3_migrate TABLE (username NVARCHAR(255));
    INSERT INTO @bag3_migrate(username) VALUES
        ('admin.tik'),
        ('iqbalparabi@staff.unila.ac.id'),
        ('ery.setiawan'),
        ('tegar.wisnu'),
        ('rio.ananda'),
        ('zulliana.nurfadlillah');

    UPDATE rp
    SET rp.id_organisasi = @UPT_TIK_UUID,
        rp.last_update = GETDATE(),
        rp.id_updater = @SYSTEM_UUID
    FROM man_akses.role_pengguna rp
    INNER JOIN man_akses.pengguna p ON p.id_pengguna = rp.id_pengguna
    WHERE rp.id_peran = @ID_PERAN_DEVELOPER
      AND ISNULL(rp.soft_delete, 0) = 0
      AND rp.id_organisasi <> @UPT_TIK_UUID
      AND p.username IN (SELECT username FROM @bag3_migrate);

    PRINT 'BAG 3 (migrate to UPT TIK) updated: ' + CAST(@@ROWCOUNT AS VARCHAR);
END

-- Contoh REVOKE bag3 (uncomment + sesuaikan):
IF 1=0
BEGIN
    DECLARE @bag3_revoke TABLE (username NVARCHAR(255));
    INSERT INTO @bag3_revoke(username) VALUES
        ('igit.sabda'),
        ('NUR.AINUN21'),
        ('andi.susanto'),
        ('m.ikhsan'),
        ('mahendra.pratama15@eng.unila.ac.id');

    UPDATE rp
    SET rp.soft_delete = 1,
        rp.last_update = GETDATE(),
        rp.id_updater = @SYSTEM_UUID
    FROM man_akses.role_pengguna rp
    INNER JOIN man_akses.pengguna p ON p.id_pengguna = rp.id_pengguna
    WHERE rp.id_peran = @ID_PERAN_DEVELOPER
      AND ISNULL(rp.soft_delete, 0) = 0
      AND p.username IN (SELECT username FROM @bag3_revoke);

    PRINT 'BAG 3 (revoke after review) revoked: ' + CAST(@@ROWCOUNT AS VARCHAR);
END

-- ============================================================
-- STEP 3: Verify post-state — siapa saja yg masih aktif sebagai Developer
-- ============================================================
SELECT
    p.username,
    p.nm_lengkap,
    o.nm_organisasi AS unit_organisasi,
    CASE
        WHEN rp.id_organisasi = @UPT_TIK_UUID THEN 'VALID (UPT TIK)'
        ELSE 'STILL NON-UPT-TIK (review again)'
    END AS klasifikasi
FROM man_akses.role_pengguna rp
INNER JOIN man_akses.pengguna p ON p.id_pengguna = rp.id_pengguna
LEFT JOIN man_akses.organisasi o ON o.id_organisasi = rp.id_organisasi
WHERE rp.id_peran = @ID_PERAN_DEVELOPER
  AND ISNULL(rp.soft_delete, 0) = 0
ORDER BY klasifikasi DESC, p.username;

-- COMMIT manually setelah review hasil STEP 3. Untuk rollback: ROLLBACK TRANSACTION.
-- COMMIT TRANSACTION;
-- ROLLBACK TRANSACTION;
