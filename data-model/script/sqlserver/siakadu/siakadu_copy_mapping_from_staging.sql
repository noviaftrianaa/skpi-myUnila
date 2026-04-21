-- ============================================================================
-- COPY MAPPING DATA: pdut_staging → pdut (production)
--
-- Memindahkan data mapping_* dari staging ke production. Pakai ini kalau:
--   - DB production baru dideploy fresh schema
--   - mapping_unit kosong (belum ada data siakadu → pddikti)
--   - mapping_matkul / mapping_kurikulum / mapping_pegawai juga kosong
--
-- Prasyarat:
--   - Jalan di SQL Server 119 yang punya akses ke DUA database (pdut, pdut_staging)
--   - Schema sudah lengkap (jalankan siakadu_fix_missing_cols_2026-04-21.sql dulu)
--   - Login user punya SELECT di pdut_staging dan INSERT di pdut
--
-- Script idempotent — pakai NOT EXISTS untuk skip duplikat.
-- ============================================================================

SET NOCOUNT ON;
USE pdut;
GO

PRINT '=== COPY MAPPING DATA: staging → production ==='
GO

-- ============================================================================
-- 1. mapping_unit (kode_siakad → id_sms UUID)
-- ============================================================================
PRINT '1. mapping_unit...'

INSERT INTO pdut.siakadu.mapping_unit (kode_siakad, id_sms, nm_unit, jenjang, create_date, last_update)
SELECT s.kode_siakad, s.id_sms, s.nm_unit, s.jenjang, s.create_date, s.last_update
FROM pdut_staging.siakadu.mapping_unit s
WHERE NOT EXISTS (
    SELECT 1 FROM pdut.siakadu.mapping_unit p WHERE p.kode_siakad = s.kode_siakad
);

DECLARE @cnt INT = (SELECT COUNT(*) FROM pdut.siakadu.mapping_unit);
PRINT '  mapping_unit rows di pdut: ' + CAST(@cnt AS VARCHAR);
GO

-- ============================================================================
-- 2. mapping_matkul (kode_mk_siakadu + id_unit_siakadu → id_mk UUID)
-- ============================================================================
PRINT '2. mapping_matkul...'

INSERT INTO pdut.siakadu.mapping_matkul (kode_mk_siakadu, id_unit_siakadu, id_mk, a_sync_pddikti, create_date)
SELECT s.kode_mk_siakadu, s.id_unit_siakadu, s.id_mk, s.a_sync_pddikti, s.create_date
FROM pdut_staging.siakadu.mapping_matkul s
WHERE NOT EXISTS (
    SELECT 1 FROM pdut.siakadu.mapping_matkul p
    WHERE p.kode_mk_siakadu = s.kode_mk_siakadu AND p.id_unit_siakadu = s.id_unit_siakadu
);

DECLARE @cnt2 INT = (SELECT COUNT(*) FROM pdut.siakadu.mapping_matkul);
PRINT '  mapping_matkul rows di pdut: ' + CAST(@cnt2 AS VARCHAR);
GO

-- ============================================================================
-- 3. mapping_kurikulum
-- ============================================================================
PRINT '3. mapping_kurikulum...'

INSERT INTO pdut.siakadu.mapping_kurikulum (kode_mk_siakadu, thn_kurikulum, id_unit_siakadu, id_kurikulum_sp, id_mk, a_sync_pddikti, create_date)
SELECT s.kode_mk_siakadu, s.thn_kurikulum, s.id_unit_siakadu, s.id_kurikulum_sp, s.id_mk, s.a_sync_pddikti, s.create_date
FROM pdut_staging.siakadu.mapping_kurikulum s
WHERE NOT EXISTS (
    SELECT 1 FROM pdut.siakadu.mapping_kurikulum p
    WHERE p.kode_mk_siakadu = s.kode_mk_siakadu AND p.thn_kurikulum = s.thn_kurikulum
);

DECLARE @cnt3 INT = (SELECT COUNT(*) FROM pdut.siakadu.mapping_kurikulum);
PRINT '  mapping_kurikulum rows di pdut: ' + CAST(@cnt3 AS VARCHAR);
GO

-- ============================================================================
-- 4. mapping_pegawai (opsional, kalau table ada di staging)
-- ============================================================================
IF OBJECT_ID('pdut_staging.siakadu.mapping_pegawai','U') IS NOT NULL
BEGIN
    PRINT '4. mapping_pegawai...'

    INSERT INTO pdut.siakadu.mapping_pegawai (nip, id_sdm, nidn, create_date)
    SELECT s.nip, s.id_sdm, s.nidn, s.create_date
    FROM pdut_staging.siakadu.mapping_pegawai s
    WHERE NOT EXISTS (
        SELECT 1 FROM pdut.siakadu.mapping_pegawai p WHERE p.nip = s.nip
    );

    DECLARE @cnt4 INT = (SELECT COUNT(*) FROM pdut.siakadu.mapping_pegawai);
    PRINT '  mapping_pegawai rows di pdut: ' + CAST(@cnt4 AS VARCHAR);
END
ELSE
    PRINT '4. mapping_pegawai SKIP (belum ada di staging)'
GO

-- ============================================================================
-- 5. ref_unit (opsional, kalau sudah ada data di staging)
-- ============================================================================
IF EXISTS (SELECT 1 FROM pdut_staging.siakadu.ref_unit)
BEGIN
    PRINT '5. ref_unit...'

    INSERT INTO pdut.siakadu.ref_unit (id_unit, id_parent_unit, jns_unit, nm_unit, nm_singkat, id_jenjang, akreditasi, is_aktif, pimpinan_json, create_date, last_update)
    SELECT s.id_unit, s.id_parent_unit, s.jns_unit, s.nm_unit, s.nm_singkat, s.id_jenjang, s.akreditasi, s.is_aktif, s.pimpinan_json,
           ISNULL(s.create_date, GETDATE()), ISNULL(s.last_update, GETDATE())
    FROM pdut_staging.siakadu.ref_unit s
    WHERE NOT EXISTS (
        SELECT 1 FROM pdut.siakadu.ref_unit p WHERE p.id_unit = s.id_unit
    );

    DECLARE @cnt5 INT = (SELECT COUNT(*) FROM pdut.siakadu.ref_unit);
    PRINT '  ref_unit rows di pdut: ' + CAST(@cnt5 AS VARCHAR);
END
ELSE
    PRINT '5. ref_unit SKIP (staging kosong)'
GO

-- ============================================================================
-- SUMMARY
-- ============================================================================
PRINT ''
PRINT '=== DONE ==='
SELECT 'mapping_unit'      AS tabel, COUNT(*) AS rows_production FROM pdut.siakadu.mapping_unit
UNION ALL
SELECT 'mapping_matkul',    COUNT(*) FROM pdut.siakadu.mapping_matkul
UNION ALL
SELECT 'mapping_kurikulum', COUNT(*) FROM pdut.siakadu.mapping_kurikulum
UNION ALL
SELECT 'mapping_pegawai',   ISNULL((SELECT COUNT(*) FROM pdut.siakadu.mapping_pegawai), 0)
UNION ALL
SELECT 'ref_unit',          COUNT(*) FROM pdut.siakadu.ref_unit;
GO
