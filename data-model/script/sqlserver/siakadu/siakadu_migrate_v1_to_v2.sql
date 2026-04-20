-- ============================================================================
-- SIAKADU Migration: v1.0 → v2.0 (Modul Mahasiswa)
-- Target: SQL Server pdut_staging
--
-- Prasyarat:
--   1. siakadu_schema_v2.0_mahasiswa.sql sudah di-deploy
--   2. Tabel v1.0 (peserta_didik, reg_pd) masih ada & berisi data
--
-- Script ini:
--   1. Migrasi data peserta_didik + reg_pd → mahasiswa (flat table)
--   2. Tambah kolom nim ke kuliah_mhs & spp_mhs
--   3. Populate nim dari mapping reg_pd.nipd
-- ============================================================================

SET NOCOUNT ON;
GO

PRINT '=== Migrasi Siakadu v1.0 → v2.0 ==='
PRINT ''

-- ============================================================================
-- STEP 1: Migrasi data peserta_didik + reg_pd → siakadu.mahasiswa
-- ============================================================================
PRINT 'STEP 1: Migrasi peserta_didik + reg_pd → mahasiswa...'

-- Hitung baseline
DECLARE @v1_count INT;
SELECT @v1_count = COUNT(*) FROM siakadu.reg_pd WHERE soft_delete = 0;
PRINT '  reg_pd (v1.0, soft_delete=0): ' + CAST(@v1_count AS VARCHAR);

-- Insert data dari v1.0
INSERT INTO siakadu.mahasiswa (
    -- PK
    nim,
    -- Core identity
    nama, angkatan, jk, tmpt_lahir, tgl_lahir,
    -- Documents
    nik, nisn, no_kps,
    -- Contact
    alamat, telepon, hp, email, kode_pos,
    -- Address detail
    rt, rw, dusun, desa,
    -- Academic
    id_unit, semester, ipk, sks_total, sks_lulus,
    id_status_mhs, id_periode,
    -- Socio-economic
    id_agama,
    -- UUID mapping
    id_pd, id_reg_pd, id_sms,
    -- Ref FK
    id_stat_mhs, id_jns_keluar, id_jns_daftar, id_jalur_daftar,
    id_smt_masuk, tgl_keluar, ket_keluar,
    -- Audit
    create_date, last_update, last_sync, soft_delete, sync_source
)
SELECT
    -- PK
    rp.nipd                                             AS nim,
    -- Core identity
    pd.nm_pd                                            AS nama,
    rp.angkatan,
    pd.jk,
    pd.tmpt_lahir,
    pd.tgl_lahir,
    -- Documents
    LTRIM(RTRIM(pd.nik))                                AS nik,
    LTRIM(RTRIM(pd.nisn))                               AS nisn,
    pd.no_kps,
    -- Contact
    pd.jln                                              AS alamat,
    pd.tlpn_rumah                                       AS telepon,
    pd.tlpn_hp                                          AS hp,
    pd.email,
    LTRIM(RTRIM(pd.kode_pos))                           AS kode_pos,
    -- Address detail
    CAST(pd.rt AS varchar(5))                           AS rt,
    CAST(pd.rw AS varchar(5))                           AS rw,
    pd.nm_dsn                                           AS dusun,
    pd.ds_kel                                           AS desa,
    -- Academic (id_unit dari mapping_unit jika ada)
    mu.kode_siakad                                      AS id_unit,
    rp.semester,
    rp.ipk,
    rp.sks_total,
    rp.sks_lulus,
    rp.id_status_mahasiswa                              AS id_status_mhs,
    rp.id_smt                                           AS id_periode,
    -- Socio-economic
    pd.id_agama,
    -- UUID mapping
    pd.id_pd,
    rp.id_reg_pd,
    rp.id_sms,
    -- Ref FK
    pd.id_stat_mhs,
    rp.id_jns_keluar,
    rp.id_jns_daftar,
    rp.id_jalur_daftar,
    rp.id_semester_masuk                                AS id_smt_masuk,
    rp.tgl_keluar,
    rp.ket                                              AS ket_keluar,
    -- Audit
    ISNULL(pd.create_date, GETDATE())                   AS create_date,
    ISNULL(rp.last_update, pd.last_update)              AS last_update,
    ISNULL(rp.last_sync, pd.last_sync)                  AS last_sync,
    CASE WHEN rp.soft_delete = 1 OR pd.soft_delete = 1 THEN 1 ELSE 0 END AS soft_delete,
    'v1_migration'                                      AS sync_source
FROM siakadu.reg_pd rp
INNER JOIN siakadu.peserta_didik pd ON pd.id_pd = rp.id_pd
-- Reverse lookup: id_sms → kode_siakad (untuk mengisi id_unit)
LEFT JOIN siakadu.mapping_unit mu ON mu.id_sms = rp.id_sms
WHERE NOT EXISTS (
    SELECT 1 FROM siakadu.mahasiswa m WHERE m.nim = rp.nipd
);

DECLARE @migrated INT;
SELECT @migrated = COUNT(*) FROM siakadu.mahasiswa WHERE sync_source = 'v1_migration';
PRINT '  Migrated to mahasiswa: ' + CAST(@migrated AS VARCHAR);
PRINT ''

-- ============================================================================
-- STEP 2: Migrasi data keluarga dari peserta_didik → keluarga_mhs
-- ============================================================================
PRINT 'STEP 2: Migrasi keluarga dari peserta_didik → keluarga_mhs...'

-- Ayah
INSERT INTO siakadu.keluarga_mhs (nim, status_keluarga, nama, nik, id_pekerjaan, id_penghasilan, tgl_lahir, create_date, last_update)
SELECT
    m.nim,
    'Ayah',
    pd.nm_ayah,
    LTRIM(RTRIM(pd.nik_ayah)),
    pd.id_pekerjaan_ayah,
    pd.id_penghasilan_ayah,
    CAST(pd.tgl_lahir_ayah AS varchar(20)),
    GETDATE(),
    GETDATE()
FROM siakadu.mahasiswa m
INNER JOIN siakadu.peserta_didik pd ON pd.id_pd = m.id_pd
WHERE pd.nm_ayah IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM siakadu.keluarga_mhs k WHERE k.nim = m.nim AND k.status_keluarga = 'Ayah'
    );

-- Ibu
INSERT INTO siakadu.keluarga_mhs (nim, status_keluarga, nama, nik, id_pekerjaan, id_penghasilan, tgl_lahir, create_date, last_update)
SELECT
    m.nim,
    'Ibu',
    pd.nm_ibu_kandung,
    LTRIM(RTRIM(pd.nik_ibu)),
    pd.id_pekerjaan_ibu,
    pd.id_penghasilan_ibu,
    CAST(pd.tgl_lahir_ibu AS varchar(20)),
    GETDATE(),
    GETDATE()
FROM siakadu.mahasiswa m
INNER JOIN siakadu.peserta_didik pd ON pd.id_pd = m.id_pd
WHERE pd.nm_ibu_kandung IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM siakadu.keluarga_mhs k WHERE k.nim = m.nim AND k.status_keluarga = 'Ibu'
    );

-- Wali (jika ada)
INSERT INTO siakadu.keluarga_mhs (nim, status_keluarga, nama, id_pekerjaan, id_penghasilan, tgl_lahir, create_date, last_update)
SELECT
    m.nim,
    'Wali',
    pd.nm_wali,
    pd.id_pekerjaan_wali,
    pd.id_penghasilan_wali,
    CAST(pd.tgl_lahir_wali AS varchar(20)),
    GETDATE(),
    GETDATE()
FROM siakadu.mahasiswa m
INNER JOIN siakadu.peserta_didik pd ON pd.id_pd = m.id_pd
WHERE pd.nm_wali IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM siakadu.keluarga_mhs k WHERE k.nim = m.nim AND k.status_keluarga = 'Wali'
    );

DECLARE @keluarga_count INT;
SELECT @keluarga_count = COUNT(*) FROM siakadu.keluarga_mhs;
PRINT '  keluarga_mhs records: ' + CAST(@keluarga_count AS VARCHAR);
PRINT ''

-- ============================================================================
-- STEP 3: Tambah kolom nim ke kuliah_mhs
-- ============================================================================
PRINT 'STEP 3: Tambah kolom nim ke kuliah_mhs...'

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'siakadu' AND TABLE_NAME = 'kuliah_mhs' AND COLUMN_NAME = 'nim'
)
BEGIN
    ALTER TABLE siakadu.kuliah_mhs ADD nim varchar(24) NULL;
    PRINT '  Kolom nim ditambahkan ke kuliah_mhs'
END
ELSE
    PRINT '  Kolom nim sudah ada di kuliah_mhs'

-- Populate nim dari mapping reg_pd.nipd
UPDATE km
SET km.nim = rp.nipd
FROM siakadu.kuliah_mhs km
INNER JOIN siakadu.reg_pd rp ON rp.id_reg_pd = km.id_reg_pd
WHERE km.nim IS NULL;

DECLARE @km_updated INT;
SELECT @km_updated = COUNT(*) FROM siakadu.kuliah_mhs WHERE nim IS NOT NULL;
PRINT '  kuliah_mhs rows with nim: ' + CAST(@km_updated AS VARCHAR);

-- Create index on nim
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes WHERE name = 'idx_kuliah_mhs_nim' AND object_id = OBJECT_ID('siakadu.kuliah_mhs')
)
BEGIN
    CREATE INDEX idx_kuliah_mhs_nim ON siakadu.kuliah_mhs (nim);
    PRINT '  Index idx_kuliah_mhs_nim created'
END
PRINT ''

-- ============================================================================
-- STEP 4: Tambah kolom nim ke spp_mhs
-- ============================================================================
PRINT 'STEP 4: Tambah kolom nim ke spp_mhs...'

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'siakadu' AND TABLE_NAME = 'spp_mhs' AND COLUMN_NAME = 'nim'
)
BEGIN
    ALTER TABLE siakadu.spp_mhs ADD nim varchar(24) NULL;
    PRINT '  Kolom nim ditambahkan ke spp_mhs'
END
ELSE
    PRINT '  Kolom nim sudah ada di spp_mhs'

-- Populate nim dari mapping reg_pd.nipd
UPDATE sp
SET sp.nim = rp.nipd
FROM siakadu.spp_mhs sp
INNER JOIN siakadu.reg_pd rp ON rp.id_reg_pd = sp.id_reg_pd
WHERE sp.nim IS NULL;

DECLARE @spp_updated INT;
SELECT @spp_updated = COUNT(*) FROM siakadu.spp_mhs WHERE nim IS NOT NULL;
PRINT '  spp_mhs rows with nim: ' + CAST(@spp_updated AS VARCHAR);

-- Create index on nim
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes WHERE name = 'idx_spp_mhs_nim' AND object_id = OBJECT_ID('siakadu.spp_mhs')
)
BEGIN
    CREATE INDEX idx_spp_mhs_nim ON siakadu.spp_mhs (nim);
    PRINT '  Index idx_spp_mhs_nim created'
END
PRINT ''

-- ============================================================================
-- STEP 5: Populate id_jenj_didik dari pdrd.sms
-- ============================================================================
PRINT 'STEP 5: Populate id_jenj_didik dari pdrd.sms...'

UPDATE m
SET m.id_jenj_didik = sms.id_jenj_didik
FROM siakadu.mahasiswa m
INNER JOIN pdrd.sms sms ON sms.id_sms = m.id_sms
WHERE m.id_jenj_didik IS NULL
    AND m.id_sms IS NOT NULL;

DECLARE @jenj_updated INT;
SELECT @jenj_updated = COUNT(*) FROM siakadu.mahasiswa WHERE id_jenj_didik IS NOT NULL;
PRINT '  mahasiswa with id_jenj_didik: ' + CAST(@jenj_updated AS VARCHAR);
PRINT ''

-- ============================================================================
-- STEP 6: Populate denormalized names dari referensi
-- ============================================================================
PRINT 'STEP 6: Populate denormalized names...'

-- nm_prodi, nm_fakultas dari pdrd.sms
UPDATE m
SET
    m.nm_prodi    = sms.nm_lemb,
    m.nm_fakultas = fak.nm_lemb
FROM siakadu.mahasiswa m
INNER JOIN pdrd.sms sms ON sms.id_sms = m.id_sms
LEFT JOIN pdrd.sms fak ON fak.id_sms = sms.id_fak_unila
WHERE m.nm_prodi IS NULL AND m.id_sms IS NOT NULL;

-- status_mahasiswa name
UPDATE m
SET m.status_mahasiswa = sm.nm_stat_mhs
FROM siakadu.mahasiswa m
INNER JOIN siakadu.status_mahasiswa sm ON sm.id_stat_mhs = m.id_stat_mhs
WHERE m.status_mahasiswa IS NULL AND m.id_stat_mhs IS NOT NULL;

-- nama_agama (from ref if available)
UPDATE m
SET m.nama_agama = ra.nm_agama
FROM siakadu.mahasiswa m
INNER JOIN siakadu.ref_agama ra ON ra.id_agama = m.id_agama
WHERE m.nama_agama IS NULL AND m.id_agama IS NOT NULL;

PRINT '  Denormalized names populated'
PRINT ''

-- ============================================================================
-- SUMMARY
-- ============================================================================
PRINT '=== Migration Summary ==='
SELECT 'siakadu.mahasiswa' AS tabel, COUNT(*) AS total_rows, SUM(CASE WHEN soft_delete=0 THEN 1 ELSE 0 END) AS active_rows FROM siakadu.mahasiswa
UNION ALL
SELECT 'siakadu.keluarga_mhs', COUNT(*), COUNT(*) FROM siakadu.keluarga_mhs
UNION ALL
SELECT 'siakadu.kuliah_mhs (with nim)', SUM(CASE WHEN nim IS NOT NULL THEN 1 ELSE 0 END), COUNT(*) FROM siakadu.kuliah_mhs
UNION ALL
SELECT 'siakadu.spp_mhs (with nim)', SUM(CASE WHEN nim IS NOT NULL THEN 1 ELSE 0 END), COUNT(*) FROM siakadu.spp_mhs;

PRINT ''
PRINT 'Migration v1 → v2 complete.'
PRINT 'Next steps:'
PRINT '  1. Run sync dari api-siakadu untuk mengisi 90+ field yang masih NULL'
PRINT '  2. Update myunila-service sync writer ke v2.0'
PRINT '  3. Update simbak-service queries ke siakadu.mahasiswa'
GO
