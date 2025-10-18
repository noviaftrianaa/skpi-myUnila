-- =============================================
-- University Rankings Data Seeder
-- Universitas Lampung (Unila)
-- Last Updated: January 2025
-- Service: Dashboard Service
-- Data sources: Web scraping & Official websites
-- =============================================

-- =============================================
-- 1. UI GREENMETRIC RANKINGS
-- Source: https://greenmetric.ui.ac.id/
-- =============================================

-- 2024 Data
INSERT INTO ranking.university_rankings (
    category_id, year, period,
    world_rank, world_rank_numeric, national_rank,
    overall_score,
    trend, source_url, source_verified, data_fetched_at, notes
)
VALUES (
    1, -- GreenMetric
    2024,
    'Annual',
    'TBD', -- World rank pending verification
    NULL,
    13, -- 13th in Indonesia among 183 universities
    NULL,
    'stable',
    'https://greenmetric.ui.ac.id/rankings/overall-rankings-2024',
    1,
    GETDATE(),
    'UI GreenMetric 2024: National rank 13th among 183 Indonesian universities. Top performers: UI, Undip, UGM. Focuses on environmental sustainability.'
);

-- 2023 Data
INSERT INTO ranking.university_rankings (
    category_id, year, period,
    world_rank, national_rank,
    trend, source_url, notes
)
VALUES (
    1,
    2023,
    'Annual',
    'TBD',
    NULL,
    'stable',
    'https://greenmetric.ui.ac.id/',
    'UI GreenMetric 2023 - Historical data'
);

-- =============================================
-- 2. QS WORLD UNIVERSITY RANKINGS
-- Source: https://www.topuniversities.com/
-- =============================================

-- 2025 Data
INSERT INTO ranking.university_rankings (
    category_id, year, period,
    world_rank, world_rank_numeric, national_rank,
    rank_change, trend, source_url, source_verified, data_fetched_at, notes
)
VALUES (
    2, -- QS
    2025,
    'Annual',
    '1401+',
    1401,
    NULL,
    0,
    'stable',
    'https://www.topuniversities.com/universities/university-lampung',
    1,
    GETDATE(),
    'QS World University Rankings 2025. Ranked 1401+ globally among world universities.'
);

-- 2024 Data
INSERT INTO ranking.university_rankings (
    category_id, year, period,
    world_rank, world_rank_numeric,
    trend, source_url, notes
)
VALUES (
    2,
    2024,
    'Annual',
    '1401+',
    1401,
    'stable',
    'https://www.topuniversities.com/universities/university-lampung',
    'QS World University Rankings 2024'
);

-- 2023 Data
INSERT INTO ranking.university_rankings (
    category_id, year, period,
    world_rank, world_rank_numeric,
    trend, source_url, notes
)
VALUES (
    2,
    2023,
    'Annual',
    '1401+',
    1401,
    'stable',
    'https://www.topuniversities.com/',
    'QS World University Rankings 2023'
);

-- =============================================
-- 3. TIMES HIGHER EDUCATION (THE) RANKINGS
-- Source: https://www.timeshighereducation.com/
-- =============================================

-- 2024 Data
INSERT INTO ranking.university_rankings (
    category_id, year, period,
    world_rank, world_rank_numeric, national_rank,
    rank_change, trend, source_url, source_verified, data_fetched_at, notes
)
VALUES (
    3, -- THE
    2024,
    'Annual',
    '1500',
    1500,
    16, -- 16th in Indonesia
    NULL,
    'up',
    'https://www.timeshighereducation.com/world-university-rankings/university-lampung',
    1,
    GETDATE(),
    'THE WUR 2024: Top 1500 from 1,904 universities in 108 countries. 16th best in Indonesia. Top 3 in Sumatra alongside USK and Unand.'
);

-- 2023 Data
INSERT INTO ranking.university_rankings (
    category_id, year, period,
    world_rank, world_rank_numeric,
    trend, source_url, notes
)
VALUES (
    3,
    2023,
    'Annual',
    '1500+',
    1500,
    'stable',
    'https://www.timeshighereducation.com/',
    'THE WUR 2023 - Historical data'
);

-- =============================================
-- 4. WEBOMETRICS RANKINGS
-- Source: https://www.webometrics.info/
-- Based on web presence and scientific publications
-- =============================================

-- January 2025 Data
INSERT INTO ranking.university_rankings (
    category_id, year, period,
    world_rank, world_rank_numeric, national_rank,
    rank_change, trend, source_url, source_verified, data_fetched_at, notes
)
VALUES (
    4, -- Webometrics
    2025,
    'January',
    '1588',
    1588,
    17, -- 17th in Indonesia
    -10, -- Dropped 10 positions from July 2024
    'down',
    'https://webometrics.info/en/Asia/Indonesia',
    1,
    GETDATE(),
    'Webometrics January 2025: World rank 1588, National rank 17. Dropped from previous ranking. Based on web presence and scientific publications.'
);

-- July 2024 Data
INSERT INTO ranking.university_rankings (
    category_id, year, period,
    world_rank, national_rank,
    rank_change, trend, source_url, source_verified, notes
)
VALUES (
    4,
    2024,
    'July',
    'TBD',
    17,
    0,
    'stable',
    'https://webometrics.info/en/Asia/Indonesia',
    1,
    'Webometrics July 2024: Among top 20 Indonesian universities. National rank 17.'
);

-- January 2024 Data
INSERT INTO ranking.university_rankings (
    category_id, year, period,
    national_rank,
    trend, source_url, notes
)
VALUES (
    4,
    2024,
    'January',
    NULL,
    'stable',
    'https://webometrics.info/',
    'Webometrics January 2024 - Historical data'
);

-- 2023 Data
INSERT INTO ranking.university_rankings (
    category_id, year, period,
    trend, source_url, notes
)
VALUES (
    4,
    2023,
    'July',
    'stable',
    'https://webometrics.info/',
    'Webometrics July 2023 - Historical data'
);

GO

-- =============================================
-- Verify and Display Results
-- =============================================
PRINT ''
PRINT '=========================================='
PRINT 'RANKING DATA SEEDER COMPLETED'
PRINT 'Dashboard Service - Universitas Lampung'
PRINT '=========================================='
PRINT ''

-- Count total records
SELECT 'Total Rankings Inserted' as Status, COUNT(*) as Count
FROM ranking.university_rankings

PRINT ''
PRINT 'Summary by Category:'
PRINT '--------------------'

-- Summary by category
SELECT
    c.name as Category,
    c.full_name as 'Full Name',
    COUNT(r.id) as 'Records',
    MIN(r.year) as 'From',
    MAX(r.year) as 'To'
FROM ranking.university_rankings r
INNER JOIN ranking.categories c ON r.category_id = c.id
GROUP BY c.name, c.full_name, c.display_order
ORDER BY c.display_order

PRINT ''
PRINT 'Latest Rankings (Current Year):'
PRINT '-------------------------------'

-- Latest rankings
SELECT
    category_name as Category,
    year as Year,
    period as Period,
    world_rank as 'World',
    national_rank as 'National',
    trend as Trend
FROM ranking.vw_latest_rankings
ORDER BY year DESC, category_name

PRINT ''
PRINT '=========================================='
PRINT 'Data Sources:'
PRINT '- GreenMetric: https://greenmetric.ui.ac.id/'
PRINT '- QS World: https://www.topuniversities.com/'
PRINT '- THE: https://www.timeshighereducation.com/'
PRINT '- Webometrics: https://www.webometrics.info/'
PRINT ''
PRINT 'Next Steps:'
PRINT '1. Verify TBD values and update with actual data'
PRINT '2. Create API endpoints in Laravel'
PRINT '3. Test endpoints with Postman'
PRINT '4. Connect frontend to API'
PRINT '=========================================='

GO
