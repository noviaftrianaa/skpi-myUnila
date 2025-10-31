-- ============================================================================
-- COMPLETE QUERY FOR PENUGASAN (reg_ptk) LIST
-- ============================================================================
-- This query retrieves all penugasan records with the following information:
-- 1. Nama dosen (from pdrd.sdm via id_sdm FK)
-- 2. Status kepegawaian (from ref.status_kepegawaian via id_stat_pegawai FK)
-- 3. Ikatan kerja (from ref.ikatan_kerja_sdm via id_ikatan_kerja FK)
-- 4. Homebase status (from pdrd.keaktifan_ptk - latest year)
-- 5. Program studi/prodi (from pdrd.sms via id_sms FK)
-- ============================================================================

-- Main query with all required fields
SELECT
    rp.id_reg_ptk,
    rp.id_sdm,
    s.nm_sdm AS nama_dosen,
    s.nidn,
    s.nip,
    rp.id_stat_pegawai,
    sk.nm_stat_pegawai AS status_kepegawaian,
    rp.id_ikatan_kerja,
    ik.nm_ikatan_kerja AS ikatan_kerja,
    kp_latest.a_sp_homebase AS homebase,
    kp_latest.id_thn_ajaran AS homebase_tahun_ajaran,
    rp.id_sms,
    sms.nm_lemb AS nama_prodi,
    sms.kode_prodi,
    rp.no_srt_tgs,
    rp.tgl_srt_tgs,
    rp.tmt_srt_tgs,
    rp.tgl_ptk_keluar,
    rp.nidn AS reg_nidn,
    rp.jns_reg,
    rp.create_date,
    rp.last_update,
    rp.last_sync
FROM pdrd.reg_ptk rp
-- Join with sdm to get dosen information
LEFT JOIN pdrd.sdm s ON rp.id_sdm = s.id_sdm
-- Join with status kepegawaian reference table
LEFT JOIN ref.status_kepegawaian sk ON rp.id_stat_pegawai = sk.id_stat_pegawai
-- Join with ikatan kerja reference table
LEFT JOIN ref.ikatan_kerja_sdm ik ON rp.id_ikatan_kerja = ik.id_ikatan_kerja
-- Join with keaktifan_ptk to get homebase (only latest year per id_reg_ptk)
LEFT JOIN (
    SELECT
        id_reg_ptk,
        id_thn_ajaran,
        a_sp_homebase,
        ROW_NUMBER() OVER (PARTITION BY id_reg_ptk ORDER BY id_thn_ajaran DESC) as rn
    FROM pdrd.keaktifan_ptk
    WHERE soft_delete = 0
) kp_latest ON rp.id_reg_ptk = kp_latest.id_reg_ptk AND kp_latest.rn = 1
-- Join with sms to get program studi information
LEFT JOIN pdrd.sms sms ON rp.id_sms = sms.id_sms
-- Filter out soft-deleted records
WHERE rp.soft_delete = 0
ORDER BY rp.last_update DESC;

-- ============================================================================
-- FILTERING OPTIONS
-- ============================================================================

-- 1. Filter by specific dosen (by id_sdm):
/*
WHERE rp.soft_delete = 0
    AND rp.id_sdm = @id_sdm
ORDER BY rp.last_update DESC;
*/

-- 2. Filter by prodi (by id_sms):
/*
WHERE rp.soft_delete = 0
    AND rp.id_sms = @id_sms
ORDER BY rp.last_update DESC;
*/

-- 3. Filter by status kepegawaian:
/*
WHERE rp.soft_delete = 0
    AND rp.id_stat_pegawai = @id_stat_pegawai
ORDER BY rp.last_update DESC;
*/

-- 4. Filter by ikatan kerja:
/*
WHERE rp.soft_delete = 0
    AND rp.id_ikatan_kerja = @id_ikatan_kerja
ORDER BY rp.last_update DESC;
*/

-- 5. Filter by homebase status (only show homebase):
/*
WHERE rp.soft_delete = 0
    AND kp_latest.a_sp_homebase = 1
ORDER BY rp.last_update DESC;
*/

-- 6. Search by nama dosen:
/*
WHERE rp.soft_delete = 0
    AND s.nm_sdm LIKE '%' + @search_keyword + '%'
ORDER BY rp.last_update DESC;
*/

-- ============================================================================
-- PAGINATION
-- ============================================================================
-- For server-side pagination (SQL Server 2012+):
/*
WHERE rp.soft_delete = 0
ORDER BY rp.last_update DESC
OFFSET @offset ROWS
FETCH NEXT @limit ROWS ONLY;
*/

-- Example with offset=0 and limit=10 (first page, 10 records):
/*
WHERE rp.soft_delete = 0
ORDER BY rp.last_update DESC
OFFSET 0 ROWS
FETCH NEXT 10 ROWS ONLY;
*/

-- Example with offset=10 and limit=10 (second page, 10 records):
/*
WHERE rp.soft_delete = 0
ORDER BY rp.last_update DESC
OFFSET 10 ROWS
FETCH NEXT 10 ROWS ONLY;
*/

-- ============================================================================
-- COUNT QUERY FOR PAGINATION
-- ============================================================================
-- To get total count for pagination:
/*
SELECT COUNT(*) as total
FROM pdrd.reg_ptk rp
WHERE rp.soft_delete = 0;
*/

-- ============================================================================
-- REFERENCE DATA QUERIES
-- ============================================================================

-- Get all status kepegawaian options:
/*
SELECT
    id_stat_pegawai,
    nm_stat_pegawai
FROM ref.status_kepegawaian
WHERE expired_date IS NULL
ORDER BY nm_stat_pegawai;
*/

-- Get all ikatan kerja options:
/*
SELECT
    id_ikatan_kerja,
    nm_ikatan_kerja,
    ket_ikatan_kerja
FROM ref.ikatan_kerja_sdm
WHERE expired_date IS NULL
ORDER BY nm_ikatan_kerja;
*/

-- Get all program studi options:
/*
SELECT
    id_sms,
    nm_lemb,
    kode_prodi
FROM pdrd.sms
WHERE soft_delete = 0
    AND stat_prodi IS NOT NULL
ORDER BY nm_lemb;
*/

-- ============================================================================
-- TABLE STRUCTURE REFERENCE
-- ============================================================================

/*
pdrd.reg_ptk (Main penugasan table):
- id_reg_ptk (PK, uniqueidentifier)
- id_sdm (FK to pdrd.sdm)
- id_stat_pegawai (FK to ref.status_kepegawaian)
- id_ikatan_kerja (FK to ref.ikatan_kerja_sdm)
- id_sms (FK to pdrd.sms)
- no_srt_tgs (varchar)
- tgl_srt_tgs (date)
- tmt_srt_tgs (date)
- tgl_ptk_keluar (date)
- nidn (char)
- jns_reg (varchar)

pdrd.sdm (Dosen/SDM table):
- id_sdm (PK, uniqueidentifier)
- nm_sdm (varchar) - Nama dosen
- nidn (char)
- nip (varchar)
- email (varchar)
- no_hp (varchar)

ref.status_kepegawaian (Status kepegawaian reference):
- id_stat_pegawai (PK, smallint)
- nm_stat_pegawai (varchar) - e.g., "PNS", "PPPK", "NON ASN"

ref.ikatan_kerja_sdm (Ikatan kerja reference):
- id_ikatan_kerja (PK, char(1))
- nm_ikatan_kerja (varchar) - e.g., "Dosen Tetap", "Dosen Tidak Tetap"

pdrd.keaktifan_ptk (Homebase status table):
- id_reg_ptk (PK, FK to pdrd.reg_ptk)
- id_thn_ajaran (PK, numeric) - Year
- a_sp_homebase (numeric) - 0 or 1 (0=not homebase, 1=homebase)

pdrd.sms (Program studi table):
- id_sms (PK, uniqueidentifier)
- nm_lemb (varchar) - Nama prodi
- kode_prodi (varchar)
- singkatan (varchar)
*/
