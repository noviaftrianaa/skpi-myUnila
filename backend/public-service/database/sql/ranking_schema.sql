-- =============================================
-- World University Rankings Database Schema
-- For: Universitas Lampung (Unila)
-- Categories: GreenMetric, QS World, Times Higher Education, Webometrics
-- Service: Dashboard Service
-- =============================================

-- Create schema for rankings
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'ranking')
BEGIN
    EXEC('CREATE SCHEMA ranking')
END
GO

-- =============================================
-- Table: ranking.categories
-- Purpose: Master data for ranking categories
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'ranking.categories') AND type in (N'U'))
BEGIN
    CREATE TABLE ranking.categories (
        id INT IDENTITY(1,1) PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        website VARCHAR(255) NULL,
        description TEXT NULL,
        icon VARCHAR(50) NULL,
        color VARCHAR(50) NULL,
        is_active BIT DEFAULT 1,
        display_order INT DEFAULT 0,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    )

    CREATE INDEX idx_categories_code ON ranking.categories(code)
    CREATE INDEX idx_categories_active ON ranking.categories(is_active)
END
GO

-- =============================================
-- Table: ranking.university_rankings
-- Purpose: Store ranking data for Universitas Lampung
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'ranking.university_rankings') AND type in (N'U'))
BEGIN
    CREATE TABLE ranking.university_rankings (
        id INT IDENTITY(1,1) PRIMARY KEY,
        category_id INT NOT NULL,
        year INT NOT NULL,
        period VARCHAR(50) NULL, -- 'January', 'July', 'Annual', etc

        -- Ranking positions
        world_rank VARCHAR(20) NULL, -- Could be '1401+', 'Not Ranked', or numeric
        world_rank_numeric INT NULL, -- For sorting/comparison
        national_rank INT NULL,
        regional_rank INT NULL, -- Asia/ASEAN ranking if available

        -- Scores (if available)
        overall_score DECIMAL(5,2) NULL,
        impact_score DECIMAL(5,2) NULL,
        visibility_score DECIMAL(5,2) NULL,
        excellence_score DECIMAL(5,2) NULL,

        -- Metrics breakdown (optional, for detailed analysis)
        metrics NVARCHAR(MAX) NULL,

        -- Trend analysis
        rank_change INT NULL, -- +/- change from previous period
        trend VARCHAR(20) NULL, -- 'up', 'down', 'stable', 'new'

        -- Source information
        source_url VARCHAR(500) NULL,
        source_verified BIT DEFAULT 0,
        data_fetched_at DATETIME2 NULL,

        -- Notes
        notes TEXT NULL,

        -- Timestamps
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),

        CONSTRAINT fk_ranking_category FOREIGN KEY (category_id)
            REFERENCES ranking.categories(id) ON DELETE CASCADE,
        CONSTRAINT uq_category_year_period UNIQUE (category_id, year, period)
    )

    CREATE INDEX idx_rankings_category ON ranking.university_rankings(category_id)
    CREATE INDEX idx_rankings_year ON ranking.university_rankings(year)
    CREATE INDEX idx_rankings_category_year ON ranking.university_rankings(category_id, year)
    CREATE INDEX idx_rankings_world_numeric ON ranking.university_rankings(world_rank_numeric)
END
GO

-- =============================================
-- Insert Master Categories
-- =============================================
SET IDENTITY_INSERT ranking.categories ON

IF NOT EXISTS (SELECT * FROM ranking.categories WHERE code = 'greenmetric')
BEGIN
    INSERT INTO ranking.categories (id, code, name, full_name, website, description, icon, color, display_order)
    VALUES (1, 'greenmetric', 'GreenMetric', 'UI GreenMetric World University Rankings', 'https://greenmetric.ui.ac.id/', 'Peringkat universitas berdasarkan komitmen terhadap keberlanjutan lingkungan dan green campus', '🌱', 'emerald', 1)
END

IF NOT EXISTS (SELECT * FROM ranking.categories WHERE code = 'qs')
BEGIN
    INSERT INTO ranking.categories (id, code, name, full_name, website, description, icon, color, display_order)
    VALUES (2, 'qs', 'QS World', 'QS World University Rankings', 'https://www.topuniversities.com/world-university-rankings', 'Salah satu ranking universitas paling bergengsi di dunia', '🏆', 'blue', 2)
END

IF NOT EXISTS (SELECT * FROM ranking.categories WHERE code = 'the')
BEGIN
    INSERT INTO ranking.categories (id, code, name, full_name, website, description, icon, color, display_order)
    VALUES (3, 'the', 'Times Higher Ed.', 'Times Higher Education World University Rankings', 'https://www.timeshighereducation.com/world-university-rankings', 'Ranking komprehensif berdasarkan teaching, research, citations, dan industry income', '📚', 'purple', 3)
END

IF NOT EXISTS (SELECT * FROM ranking.categories WHERE code = 'webometrics')
BEGIN
    INSERT INTO ranking.categories (id, code, name, full_name, website, description, icon, color, display_order)
    VALUES (4, 'webometrics', 'Webometrics', 'Ranking Web of Universities', 'https://www.webometrics.info/', 'Ranking berdasarkan kehadiran web dan dampak publikasi online universitas', '🌐', 'orange', 4)
END

SET IDENTITY_INSERT ranking.categories OFF
GO

-- =============================================
-- View: Latest Rankings Summary
-- =============================================
IF EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'ranking.vw_latest_rankings'))
    DROP VIEW ranking.vw_latest_rankings
GO

CREATE VIEW ranking.vw_latest_rankings
AS
SELECT
    r.id,
    c.code as category_code,
    c.name as category_name,
    c.full_name as category_full_name,
    c.icon,
    c.color,
    r.year,
    r.period,
    r.world_rank,
    r.world_rank_numeric,
    r.national_rank,
    r.regional_rank,
    r.overall_score,
    r.rank_change,
    r.trend,
    r.source_url,
    r.updated_at
FROM ranking.university_rankings r
INNER JOIN ranking.categories c ON r.category_id = c.id
WHERE c.is_active = 1
    AND r.year = (
        SELECT MAX(year)
        FROM ranking.university_rankings r2
        WHERE r2.category_id = r.category_id
    )
GO

-- =============================================
-- Stored Procedure: Get Rankings for Chart
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE object_id = OBJECT_ID(N'ranking.sp_get_rankings_chart'))
    DROP PROCEDURE ranking.sp_get_rankings_chart
GO

CREATE PROCEDURE ranking.sp_get_rankings_chart
    @start_year INT = NULL,
    @end_year INT = NULL,
    @category_code VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Set default years if not provided
    IF @start_year IS NULL
        SET @start_year = YEAR(GETDATE()) - 5

    IF @end_year IS NULL
        SET @end_year = YEAR(GETDATE())

    SELECT
        c.code as category_code,
        c.name as category_name,
        c.icon,
        c.color,
        r.year,
        r.period,
        r.world_rank,
        r.world_rank_numeric,
        r.national_rank,
        r.overall_score,
        r.rank_change,
        r.trend
    FROM ranking.university_rankings r
    INNER JOIN ranking.categories c ON r.category_id = c.id
    WHERE c.is_active = 1
        AND r.year BETWEEN @start_year AND @end_year
        AND (@category_code IS NULL OR c.code = @category_code)
    ORDER BY c.display_order, r.year DESC, r.period DESC
END
GO

PRINT 'World University Rankings schema created successfully in Dashboard Service!'
PRINT 'Categories inserted: GreenMetric, QS World, Times Higher Ed., Webometrics'
PRINT ''
PRINT 'Next steps:'
PRINT '1. Run ranking_data_seeder.sql to populate data'
PRINT '2. Create API endpoints in Laravel (dashboard-service)'
PRINT '3. Connect frontend to real data'
GO
