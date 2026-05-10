-- ============================================================================
-- Seed: man_akses.aplikasi_default_role
-- ============================================================================
-- Date: 2026-05-08
-- Default mapping per aplikasi → peran identitas (Mahasiswa/Dosen/Tendik)
--
-- Kategori akses default:
--   M = Mahasiswa (id_peran = 39)
--   D = Dosen (id_peran = 46)
--   T = Tenaga Kependidikan (id_peran = 111)
--
-- Mapping rationale:
--   - Apps akademik mhs+dosen: presensi, siakadu, e-kkn, mbkm, v-class, wali
--   - Apps spesifik mhs: sikebas, beasiswa, ormawa, minat-bakat, tracer, service-layanan
--   - Apps khusus dosen: si-penelitian, si-pengabdian, si-publikasi
--   - Apps kepegawaian (dosen+tendik): sikep, spmi, sikerma
--   - Apps semua identitas: helpdesk-tik, blog-unila
--   - Apps tools/admin (peran fungsional only, BUKAN default identitas):
--     dashboard-pimpinan, data-unila, integrator (3), api-gateway, monitoring,
--     manajemen-akses, webmon, manajemen-konten, sim-bak
--
-- Bulk Insert via WHERE NOT EXISTS untuk idempotensi.
-- ============================================================================

USE pdut;
GO

DECLARE @id_creator UNIQUEIDENTIFIER = '00000000-0000-0000-0000-000000000000';
DECLARE @id_mhs INT = 39;
DECLARE @id_dosen INT = 46;
DECLARE @id_tendik INT = 111;

-- Validasi: pastikan ketiga peran identitas ada dan flag-nya benar
IF NOT EXISTS (SELECT 1 FROM man_akses.peran WHERE id_peran = @id_mhs    AND a_peran_identitas = 1)
   OR NOT EXISTS (SELECT 1 FROM man_akses.peran WHERE id_peran = @id_dosen  AND a_peran_identitas = 1)
   OR NOT EXISTS (SELECT 1 FROM man_akses.peran WHERE id_peran = @id_tendik AND a_peran_identitas = 1)
BEGIN
    RAISERROR('Peran identitas (39/46/111) belum ada atau a_peran_identitas belum di-set. Run alter_peran_add_a_peran_identitas.sql dulu.', 16, 1);
    RETURN;
END

-- ============================================================================
-- Default mapping table
-- ============================================================================
DECLARE @mapping TABLE (app_slug VARCHAR(100), id_peran INT);

-- AKADEMIK (mahasiswa + dosen)
INSERT INTO @mapping VALUES
    ('presensi-sirandu', @id_mhs), ('presensi-sirandu', @id_dosen),
    ('siakadu',          @id_mhs), ('siakadu',          @id_dosen),
    ('e-kkn',            @id_mhs), ('e-kkn',            @id_dosen),
    ('berdampak-mbkm',   @id_mhs), ('berdampak-mbkm',   @id_dosen),
    ('v-class',          @id_mhs), ('v-class',          @id_dosen),
    ('wali',             @id_mhs), ('wali',             @id_dosen);

-- KEMAHASISWAAN (mahasiswa-only, kecuali si-prestasi yang juga dosen sbg pembimbing)
INSERT INTO @mapping VALUES
    ('sikebas',         @id_mhs),
    ('beasiswa',        @id_mhs),
    ('ormawa',          @id_mhs),
    ('minat-bakat',     @id_mhs),
    ('si-prestasi',     @id_mhs), ('si-prestasi', @id_dosen),
    ('tracer-study',    @id_mhs),
    ('service-layanan', @id_mhs);

-- KEPEGAWAIAN / RISET (dosen + tendik, sesuai peran)
INSERT INTO @mapping VALUES
    ('sikep',         @id_dosen), ('sikep', @id_tendik),
    ('spmi',          @id_dosen), ('spmi',  @id_tendik),
    ('sikerma',       @id_dosen), ('sikerma', @id_tendik),
    ('si-penelitian', @id_dosen),
    ('si-pengabdian', @id_dosen),
    ('si-publikasi',  @id_dosen);

-- LAYANAN UMUM (semua identitas)
INSERT INTO @mapping VALUES
    ('helpdesk-tik', @id_mhs), ('helpdesk-tik', @id_dosen), ('helpdesk-tik', @id_tendik),
    ('blog-unila',   @id_mhs), ('blog-unila',   @id_dosen), ('blog-unila',   @id_tendik);

-- (CATATAN: aplikasi berikut TIDAK punya default identitas — hanya peran fungsional:
--   sim-bak, dashboard-pimpinan, data-unila, feeder-integrator, sister-integrator,
--   myunila-integrator, api-gateway, monitoring, manajemen-akses, webmon,
--   manajemen-konten)

-- ============================================================================
-- Insert: idempotent, skip kalau row sudah ada
-- ============================================================================
DECLARE @inserted INT = 0;
DECLARE @skipped_no_app INT = 0;

INSERT INTO man_akses.aplikasi_default_role (id_aplikasi, id_peran, a_aktif, soft_delete, tgl_create, last_update, last_sync, id_creator, id_updater)
SELECT
    a.id_aplikasi,
    m.id_peran,
    1, 0, GETDATE(), GETDATE(), GETDATE(), @id_creator, @id_creator
FROM @mapping m
JOIN man_akses.aplikasi a ON a.app_slug = m.app_slug AND a.expired_date IS NULL
WHERE NOT EXISTS (
    SELECT 1 FROM man_akses.aplikasi_default_role x
    WHERE x.id_aplikasi = a.id_aplikasi AND x.id_peran = m.id_peran
);
SET @inserted = @@ROWCOUNT;

-- Cek slug yang TIDAK ditemukan di tabel aplikasi (untuk warning)
SELECT m.app_slug AS missing_app_slug
FROM @mapping m
LEFT JOIN man_akses.aplikasi a ON a.app_slug = m.app_slug AND a.expired_date IS NULL
WHERE a.id_aplikasi IS NULL
GROUP BY m.app_slug;

PRINT '';
PRINT '✓ Inserted ' + CAST(@inserted AS VARCHAR) + ' row(s) ke aplikasi_default_role';
PRINT '  (skip kalau sudah ada — idempotent)';
GO

-- ============================================================================
-- Verifikasi
-- ============================================================================
PRINT '';
PRINT '=== Default Access per Aplikasi (urutan kategori) ===';
SELECT
    a.app_slug,
    a.nm_aplikasi,
    MAX(CASE WHEN p.id_peran = 39  THEN '✓' ELSE '·' END) AS Mhs,
    MAX(CASE WHEN p.id_peran = 46  THEN '✓' ELSE '·' END) AS Dosen,
    MAX(CASE WHEN p.id_peran = 111 THEN '✓' ELSE '·' END) AS Tendik
FROM man_akses.aplikasi a
LEFT JOIN man_akses.aplikasi_default_role adr
    ON adr.id_aplikasi = a.id_aplikasi AND adr.a_aktif = 1 AND adr.soft_delete = 0
LEFT JOIN man_akses.peran p ON p.id_peran = adr.id_peran
WHERE a.expired_date IS NULL AND a.a_aktif = 1
GROUP BY a.app_slug, a.nm_aplikasi, a.urutan
ORDER BY a.urutan, a.nm_aplikasi;
GO
