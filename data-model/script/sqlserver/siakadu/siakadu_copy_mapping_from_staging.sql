-- ============================================================================
-- COPY MAPPING DATA: pdut_staging → pdut (production)
--
-- Memindahkan data mapping_* + ref_unit dari staging ke production.
-- Pakai ini kalau tabel mapping kosong setelah deploy v2 fresh.
--
-- Schema staging (yang valid):
--   mapping_unit      (kode_siakad, id_sms, nm_unit, jenjang, create_date, last_update)
--   mapping_matkul    (kode_mk_siakadu, id_unit_siakadu, id_mk, create_date)
--   mapping_kurikulum (kode_mk_siakadu, thn_kurikulum, id_unit_siakadu, id_kurikulum_sp, id_mk, create_date)
--   mapping_pegawai   (id_pegawai_siakadu, id_sdm, nip, create_date)
--   ref_unit          (id_unit, id_parent_unit, jns_unit, nm_unit, nm_singkat,
--                      id_jenjang, akreditasi, is_aktif, last_update, pimpinan_json)
--
-- Prasyarat:
--   - Login user punya SELECT di pdut_staging + INSERT di pdut
--   - Kedua DB di SQL Server yang sama (cross-DB query via 3-part name)
--
-- Script idempotent (NOT EXISTS guard) — aman dijalankan ulang.
-- ============================================================================

SET NOCOUNT ON;
USE pdut;
GO

PRINT '=== COPY MAPPING DATA: staging -> production ==='
GO

-- ============================================================================
-- 1. mapping_unit
-- ============================================================================
PRINT '1. mapping_unit...'

INSERT INTO pdut.siakadu.mapping_unit (kode_siakad, id_sms, nm_unit, jenjang, create_date, last_update)
SELECT s.kode_siakad, s.id_sms, s.nm_unit, s.jenjang,
       ISNULL(s.create_date, GETDATE()),
       ISNULL(s.last_update, GETDATE())
FROM pdut_staging.siakadu.mapping_unit s
WHERE NOT EXISTS (
    SELECT 1 FROM pdut.siakadu.mapping_unit p WHERE p.kode_siakad = s.kode_siakad
);
PRINT '  rows total: ' + CAST((SELECT COUNT(*) FROM pdut.siakadu.mapping_unit) AS VARCHAR);
GO

-- ============================================================================
-- 2. mapping_matkul  (staging tidak punya a_sync_pddikti → default 0)
-- ============================================================================
PRINT '2. mapping_matkul...'

INSERT INTO pdut.siakadu.mapping_matkul (kode_mk_siakadu, id_unit_siakadu, id_mk, a_sync_pddikti, create_date)
SELECT s.kode_mk_siakadu,
       ISNULL(s.id_unit_siakadu, ''),
       s.id_mk,
       0,
       ISNULL(s.create_date, GETDATE())
FROM pdut_staging.siakadu.mapping_matkul s
WHERE NOT EXISTS (
    SELECT 1 FROM pdut.siakadu.mapping_matkul p
    WHERE p.kode_mk_siakadu = s.kode_mk_siakadu
      AND p.id_unit_siakadu = ISNULL(s.id_unit_siakadu, '')
);
PRINT '  rows total: ' + CAST((SELECT COUNT(*) FROM pdut.siakadu.mapping_matkul) AS VARCHAR);
GO

-- ============================================================================
-- 3. mapping_kurikulum (staging tidak punya a_sync_pddikti → default 0)
-- ============================================================================
PRINT '3. mapping_kurikulum...'

INSERT INTO pdut.siakadu.mapping_kurikulum (kode_mk_siakadu, thn_kurikulum, id_unit_siakadu, id_kurikulum_sp, id_mk, a_sync_pddikti, create_date)
SELECT s.kode_mk_siakadu,
       s.thn_kurikulum,
       ISNULL(s.id_unit_siakadu, ''),
       s.id_kurikulum_sp,
       s.id_mk,
       0,
       ISNULL(s.create_date, GETDATE())
FROM pdut_staging.siakadu.mapping_kurikulum s
WHERE NOT EXISTS (
    SELECT 1 FROM pdut.siakadu.mapping_kurikulum p
    WHERE p.kode_mk_siakadu = s.kode_mk_siakadu
      AND p.thn_kurikulum = s.thn_kurikulum
);
PRINT '  rows total: ' + CAST((SELECT COUNT(*) FROM pdut.siakadu.mapping_kurikulum) AS VARCHAR);
GO

-- ============================================================================
-- 4. mapping_pegawai (schema staging: id_pegawai_siakadu, id_sdm, nip, create_date)
--    NOTE: PK di pdut v2 fresh = nip (bukan id_pegawai_siakadu)
--    Skip kalau staging masih kosong.
-- ============================================================================
PRINT '4. mapping_pegawai...'

IF EXISTS (SELECT 1 FROM pdut_staging.siakadu.mapping_pegawai)
BEGIN
    -- Pastikan kolom id_pegawai_siakadu ada di pdut (kalau belum)
    IF NOT EXISTS (SELECT 1 FROM sys.columns
                   WHERE object_id = OBJECT_ID('pdut.siakadu.mapping_pegawai') AND name = 'id_pegawai_siakadu')
        ALTER TABLE pdut.siakadu.mapping_pegawai ADD id_pegawai_siakadu varchar(50) NULL;

    INSERT INTO pdut.siakadu.mapping_pegawai (nip, id_sdm, id_pegawai_siakadu, create_date)
    SELECT s.nip, s.id_sdm, s.id_pegawai_siakadu, ISNULL(s.create_date, GETDATE())
    FROM pdut_staging.siakadu.mapping_pegawai s
    WHERE s.nip IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM pdut.siakadu.mapping_pegawai p WHERE p.nip = s.nip);

    PRINT '  rows total: ' + CAST((SELECT COUNT(*) FROM pdut.siakadu.mapping_pegawai) AS VARCHAR);
END
ELSE
    PRINT '  SKIP (staging kosong)'
GO

-- ============================================================================
-- 5. ref_unit (staging tidak punya create_date → pakai GETDATE())
-- ============================================================================
PRINT '5. ref_unit...'

INSERT INTO pdut.siakadu.ref_unit (id_unit, id_parent_unit, jns_unit, nm_unit, nm_singkat, id_jenjang, akreditasi, is_aktif, pimpinan_json, create_date, last_update)
SELECT s.id_unit, s.id_parent_unit, s.jns_unit, s.nm_unit, s.nm_singkat,
       s.id_jenjang, s.akreditasi, s.is_aktif, s.pimpinan_json,
       GETDATE(),                              -- create_date default now (staging tidak punya)
       ISNULL(s.last_update, GETDATE())
FROM pdut_staging.siakadu.ref_unit s
WHERE NOT EXISTS (
    SELECT 1 FROM pdut.siakadu.ref_unit p WHERE p.id_unit = s.id_unit
);
PRINT '  rows total: ' + CAST((SELECT COUNT(*) FROM pdut.siakadu.ref_unit) AS VARCHAR);
GO

-- ============================================================================
-- SUMMARY
-- ============================================================================
PRINT ''
PRINT '=== DONE ==='
SELECT 'mapping_unit'      AS tabel, COUNT(*) AS rows_pdut FROM pdut.siakadu.mapping_unit
UNION ALL
SELECT 'mapping_matkul',    COUNT(*) FROM pdut.siakadu.mapping_matkul
UNION ALL
SELECT 'mapping_kurikulum', COUNT(*) FROM pdut.siakadu.mapping_kurikulum
UNION ALL
SELECT 'mapping_pegawai',   COUNT(*) FROM pdut.siakadu.mapping_pegawai
UNION ALL
SELECT 'ref_unit',          COUNT(*) FROM pdut.siakadu.ref_unit;
GO
