-- =====================================================
-- UPDATE SCRIPT: daftar_ukt - Populate id_sms field
-- =====================================================
-- Purpose: Fill id_sms in daftar_ukt based on reg_pd data
-- This enables proper linking between SIMPEDAM prodi and MyUnila SMS
--
-- The mapping logic:
-- 1. Get unique combinations of (id_prodi_simpedam, kode_strata) from daftar_ukt
-- 2. For each combination, find matching students in spp_mhs via id_reg_pd
-- 3. Get their id_sms from reg_pd table
-- 4. Update daftar_ukt with the found id_sms
-- =====================================================

-- Step 1: Check current state of id_sms
SELECT
    'Total daftar_ukt records' as metric,
    COUNT(*) as count
FROM keuangan.daftar_ukt
WHERE soft_delete = 0

UNION ALL

SELECT
    'Records with id_sms' as metric,
    COUNT(*) as count
FROM keuangan.daftar_ukt
WHERE soft_delete = 0 AND id_sms IS NOT NULL

UNION ALL

SELECT
    'Records without id_sms' as metric,
    COUNT(*) as count
FROM keuangan.daftar_ukt
WHERE soft_delete = 0 AND id_sms IS NULL;
GO

-- Step 2: Create a mapping table to find id_sms for each prodi combination
-- This queries spp_mhs -> reg_pd to get the id_sms for each unique prodi
WITH ProdiMapping AS (
    SELECT DISTINCT
        d.id_prodi_simpedam,
        d.kode_strata,
        rp.id_sms,
        d.nama_prodi,
        sms.nm_lemb as nama_prodi_myunila
    FROM keuangan.daftar_ukt d
    -- Join to spp_mhs via reg_pd
    INNER JOIN keuangan.spp_mhs s ON 1=1
    INNER JOIN pdrd.reg_pd rp ON s.id_reg_pd = rp.id_reg_pd
    INNER JOIN pdrd.sms sms ON rp.id_sms = sms.id_sms
    -- Match based on prodi name similarity and strata
    WHERE d.soft_delete = 0
        AND d.id_sms IS NULL
        AND rp.id_sms IS NOT NULL
        AND (
            -- Try to match by similar prodi name
            sms.nm_lemb LIKE '%' + LEFT(d.nama_prodi, 10) + '%'
            OR d.nama_prodi LIKE '%' + LEFT(sms.nm_lemb, 10) + '%'
        )
)
SELECT * FROM ProdiMapping ORDER BY nama_prodi;
GO

-- Step 3: Update daftar_ukt with id_sms from reg_pd
-- This update uses the most common id_sms found for each (id_prodi_simpedam, kode_strata) combination
PRINT 'Starting id_sms update...';

WITH RegPdMapping AS (
    -- Get id_sms for each id_reg_pd from spp_mhs
    SELECT DISTINCT
        rp.id_sms,
        s.id_reg_pd
    FROM keuangan.spp_mhs s
    INNER JOIN pdrd.reg_pd rp ON s.id_reg_pd = rp.id_reg_pd
    WHERE rp.id_sms IS NOT NULL
        AND s.soft_delete = 0
),
-- Get year from id_smt to match with daftar_ukt.tahun
SppWithYear AS (
    SELECT
        s.id_reg_pd,
        CAST(LEFT(s.id_smt, 4) AS INT) as tahun_masuk,
        rp.id_sms
    FROM keuangan.spp_mhs s
    INNER JOIN pdrd.reg_pd rp ON s.id_reg_pd = rp.id_reg_pd
    WHERE rp.id_sms IS NOT NULL
        AND s.soft_delete = 0
),
-- Get distinct (id_sms, prodi_name) combinations
SMSMapping AS (
    SELECT DISTINCT
        sms.id_sms,
        sms.nm_lemb as nama_prodi_sms,
        sms.id_jenj_didik
    FROM pdrd.sms sms
    WHERE sms.id_sms IN (SELECT id_sms FROM RegPdMapping)
)
-- Update daftar_ukt where nama_prodi matches
UPDATE d
SET d.id_sms = m.id_sms,
    d.last_update = GETDATE()
FROM keuangan.daftar_ukt d
INNER JOIN SMSMapping m ON
    -- Match by prodi name (case insensitive, partial match)
    UPPER(d.nama_prodi) LIKE UPPER('%' + LEFT(m.nama_prodi_sms, 15) + '%')
    OR UPPER(m.nama_prodi_sms) LIKE UPPER('%' + LEFT(d.nama_prodi, 15) + '%')
WHERE d.id_sms IS NULL
    AND d.soft_delete = 0;

DECLARE @updated INT = @@ROWCOUNT;
PRINT 'Updated ' + CAST(@updated AS VARCHAR(10)) + ' records with id_sms';
GO

-- Step 4: Alternative - Manual mapping via mapping_prodi_simpedam table
-- If the above automatic matching doesn't work well, use mapping_prodi_simpedam table
PRINT 'Updating from mapping_prodi_simpedam table...';

UPDATE d
SET d.id_sms = pm.id_sms,
    d.id_jenj_didik = CASE
        WHEN d.kode_strata = 3 THEN 22  -- D3
        WHEN d.kode_strata IN (4, 7) THEN 30  -- S1
        ELSE d.id_jenj_didik
    END,
    d.last_update = GETDATE()
FROM keuangan.daftar_ukt d
INNER JOIN keuangan.mapping_prodi_simpedam pm ON
    d.id_prodi_simpedam = pm.id_prodi_simpedam
    AND d.kode_strata = pm.kode_strata
WHERE d.id_sms IS NULL
    AND d.soft_delete = 0
    AND pm.soft_delete = 0
    AND pm.is_active = 1
    AND pm.id_sms IS NOT NULL;

DECLARE @updated2 INT = @@ROWCOUNT;
PRINT 'Updated ' + CAST(@updated2 AS VARCHAR(10)) + ' additional records from mapping_prodi_simpedam';
GO

-- Step 5: Verification - check results
PRINT 'Verification results:';

SELECT
    'After update - Total daftar_ukt' as metric,
    COUNT(*) as count
FROM keuangan.daftar_ukt
WHERE soft_delete = 0

UNION ALL

SELECT
    'After update - With id_sms' as metric,
    COUNT(*) as count
FROM keuangan.daftar_ukt
WHERE soft_delete = 0 AND id_sms IS NOT NULL

UNION ALL

SELECT
    'After update - Without id_sms' as metric,
    COUNT(*) as count
FROM keuangan.daftar_ukt
WHERE soft_delete = 0 AND id_sms IS NULL;
GO

-- Step 6: Show unmapped prodi for manual review
SELECT DISTINCT
    d.id_prodi_simpedam,
    d.nama_prodi,
    d.kode_strata,
    CASE d.kode_strata
        WHEN 3 THEN 'D3'
        WHEN 4 THEN 'S1 Reguler'
        WHEN 7 THEN 'S1 Non-Reg'
        ELSE 'Lainnya'
    END as jenjang,
    COUNT(*) as total_records
FROM keuangan.daftar_ukt d
WHERE d.soft_delete = 0
    AND d.id_sms IS NULL
GROUP BY d.id_prodi_simpedam, d.nama_prodi, d.kode_strata
ORDER BY d.nama_prodi, d.kode_strata;
