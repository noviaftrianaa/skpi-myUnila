-- ============================================================
-- monitoring_17_seed_sites_id_sms.sql
-- Update id_sms pada monitoring.sites berdasarkan matching
-- domain URL dengan field website di pdrd.sms
-- ============================================================
-- Jalankan SETELAH monitoring_15_seed_sites.sql
-- ============================================================

-- ============================================================
-- STEP 1: Auto-match berdasarkan domain website pdrd.sms
-- Logika: extract subdomain dari monitoring.sites.url,
--         cocokkan dengan pdrd.sms.website
-- Contoh: https://agroteknologi.fp.unila.ac.id → agroteknologi.fp.unila.ac.id
--         pdrd.sms.website = 'agroteknologi.fp.unila.ac.id' → MATCH
-- ============================================================

UPDATE s
SET s.id_sms = sms.id_sms,
    s.last_update = GETDATE()
FROM monitoring.sites AS s
INNER JOIN pdrd.sms AS sms
    ON sms.soft_delete = 0
    AND sms.stat_prodi = 'A'
    AND CAST(sms.id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
    AND sms.id_jns_sms = '3'
    AND sms.id_fak_unila IS NOT NULL
    AND sms.website IS NOT NULL
    AND sms.website <> ''
    -- Match: strip https:// dari site URL, compare dengan sms.website
    AND LOWER(REPLACE(REPLACE(s.url, 'https://', ''), 'http://', ''))
        = LOWER(REPLACE(REPLACE(REPLACE(sms.website, 'https://', ''), 'http://', ''), '/', ''))
WHERE s.soft_delete = 0
  AND s.id_sms IS NULL
GO

-- Verifikasi Step 1
SELECT 'Step 1 - Auto matched by website URL' AS step,
       COUNT(*) AS matched
FROM monitoring.sites
WHERE id_sms IS NOT NULL AND soft_delete = 0
GO

-- ============================================================
-- STEP 2: Manual mapping untuk domain yang tidak match otomatis
-- Ini karena nama subdomain berbeda dari website di pdrd.sms
-- Contoh: biologi.fkip.unila.ac.id → Pendidikan Biologi (FKIP)
--         tapi pdrd.sms.website mungkin 'pend-biologi.fkip.unila.ac.id'
-- ============================================================

-- Mapping manual: (url_pattern, nm_lemb_like)
-- Gunakan query ini untuk cek prodi yang belum ter-match:
--
-- SELECT s.url, s.name, s.fakultas_id
-- FROM monitoring.sites s
-- WHERE s.soft_delete = 0
--   AND s.id_sms IS NULL
--   AND s.fakultas_id IS NOT NULL
-- ORDER BY s.fakultas_id, s.url
--
-- Dan query ini untuk lihat daftar prodi yang tersedia:
--
-- SELECT CONVERT(nvarchar(36), sms.id_sms) AS id_sms,
--        sms.nm_lemb, sms.singkatan, sms.website,
--        didik.nm_jenj_didik AS jenjang
-- FROM pdrd.sms AS sms
-- INNER JOIN ref.jenjang_pendidikan AS didik
--     ON didik.id_jenj_didik = sms.id_jenj_didik
--     AND didik.expired_date IS NULL
-- WHERE sms.soft_delete = 0
--   AND sms.stat_prodi = 'A'
--   AND CAST(sms.id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
--   AND sms.id_jns_sms = '3'
--   AND sms.id_fak_unila IS NOT NULL
-- ORDER BY sms.nm_lemb

-- ============================================================
-- STEP 3: Match berdasarkan nama (fuzzy - subdomain contains singkatan)
-- Contoh: akuntansi.feb.unila.ac.id → sms.singkatan LIKE '%akuntansi%'
--         elektro.eng.unila.ac.id → sms.singkatan LIKE '%elektro%'
-- Hanya match jika ada EXACTLY 1 prodi cocok (avoid ambiguity)
-- ============================================================

;WITH subdomain_extract AS (
    SELECT
        s.id AS site_id,
        s.url,
        s.fakultas_id,
        -- Extract first part of subdomain (before first dot)
        LEFT(
            REPLACE(REPLACE(s.url, 'https://', ''), 'http://', ''),
            CHARINDEX('.', REPLACE(REPLACE(s.url, 'https://', ''), 'http://', '')) - 1
        ) AS subdomain
    FROM monitoring.sites s
    WHERE s.soft_delete = 0
      AND s.id_sms IS NULL
      AND s.fakultas_id IS NOT NULL
),
sms_lookup AS (
    SELECT
        CONVERT(nvarchar(36), sms.id_sms) AS id_sms,
        sms.nm_lemb,
        LOWER(sms.singkatan) AS singkatan_lower,
        CASE
            WHEN sms.id_fak_unila = 1 THEN 'fkip'
            WHEN sms.id_fak_unila = 2 THEN 'fmipa'
            WHEN sms.id_fak_unila = 3 THEN 'fh'
            WHEN sms.id_fak_unila = 4 THEN 'feb'
            WHEN sms.id_fak_unila = 5 THEN 'fp'
            WHEN sms.id_fak_unila = 6 THEN 'eng'
            WHEN sms.id_fak_unila = 7 THEN 'fisip'
            WHEN sms.id_fak_unila = 8 THEN 'fk'
            WHEN sms.id_fak_unila = 9 THEN 'pasca'
            ELSE NULL
        END AS fak_slug
    FROM pdrd.sms AS sms
    WHERE sms.soft_delete = 0
      AND sms.stat_prodi = 'A'
      AND CAST(sms.id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
      AND sms.id_jns_sms = '3'
      AND sms.id_fak_unila IS NOT NULL
      AND sms.singkatan IS NOT NULL
),
matched AS (
    SELECT
        se.site_id,
        sl.id_sms,
        COUNT(*) OVER (PARTITION BY se.site_id) AS match_count
    FROM subdomain_extract se
    INNER JOIN sms_lookup sl
        ON sl.fak_slug = se.fakultas_id
        AND LOWER(se.subdomain) = sl.singkatan_lower
)
UPDATE s
SET s.id_sms = m.id_sms,
    s.last_update = GETDATE()
FROM monitoring.sites s
INNER JOIN matched m ON m.site_id = s.id
WHERE m.match_count = 1  -- Only update if exactly 1 match (no ambiguity)
  AND s.id_sms IS NULL
GO

-- Verifikasi Step 3
SELECT 'Step 3 - Matched by singkatan + fakultas' AS step,
       COUNT(*) AS matched
FROM monitoring.sites
WHERE id_sms IS NOT NULL AND soft_delete = 0
GO

-- ============================================================
-- Final Report
-- ============================================================
SELECT
    'TOTAL' AS kategori,
    COUNT(*) AS jumlah
FROM monitoring.sites WHERE soft_delete = 0
UNION ALL
SELECT
    'MAPPED (id_sms != NULL)' AS kategori,
    COUNT(*) AS jumlah
FROM monitoring.sites WHERE soft_delete = 0 AND id_sms IS NOT NULL
UNION ALL
SELECT
    'UNMAPPED (id_sms = NULL, punya fakultas)' AS kategori,
    COUNT(*) AS jumlah
FROM monitoring.sites WHERE soft_delete = 0 AND id_sms IS NULL AND fakultas_id IS NOT NULL
UNION ALL
SELECT
    'INSTITUTIONAL (tanpa fakultas)' AS kategori,
    COUNT(*) AS jumlah
FROM monitoring.sites WHERE soft_delete = 0 AND fakultas_id IS NULL
GO

-- Lihat site yang belum ter-map (untuk manual mapping jika perlu)
SELECT s.url, s.name, s.fakultas_id
FROM monitoring.sites s
WHERE s.soft_delete = 0
  AND s.id_sms IS NULL
  AND s.fakultas_id IS NOT NULL
ORDER BY s.fakultas_id, s.url
GO

PRINT 'Seed id_sms mapping complete.'
GO
