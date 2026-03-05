-- ============================================================
-- monitoring_alter_crawler_deep_scan.sql
-- Add cloaking detection, redirect chain, AMP scan columns
-- Date: 2026-03-05
-- ============================================================

-- crawl_pages: redirect chain tracking
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('monitoring.crawl_pages') AND name = 'redirect_chain')
BEGIN
    ALTER TABLE monitoring.crawl_pages ADD redirect_chain nvarchar(max) NULL
    PRINT '>> Added redirect_chain to crawl_pages'
END
go

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('monitoring.crawl_pages') AND name = 'has_external_redirect')
BEGIN
    ALTER TABLE monitoring.crawl_pages ADD has_external_redirect numeric(1) NOT NULL DEFAULT 0
    PRINT '>> Added has_external_redirect to crawl_pages'
END
go

-- crawl_pages: cloaking detection
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('monitoring.crawl_pages') AND name = 'is_cloaked')
BEGIN
    ALTER TABLE monitoring.crawl_pages ADD is_cloaked numeric(1) NOT NULL DEFAULT 0
    PRINT '>> Added is_cloaked to crawl_pages'
END
go

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('monitoring.crawl_pages') AND name = 'cloaking_score')
BEGIN
    ALTER TABLE monitoring.crawl_pages ADD cloaking_score int NOT NULL DEFAULT 0
    PRINT '>> Added cloaking_score to crawl_pages'
END
go

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('monitoring.crawl_pages') AND name = 'googlebot_threat_score')
BEGIN
    ALTER TABLE monitoring.crawl_pages ADD googlebot_threat_score int NOT NULL DEFAULT 0
    PRINT '>> Added googlebot_threat_score to crawl_pages'
END
go

-- crawl_pages: AMP scan
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('monitoring.crawl_pages') AND name = 'amp_url')
BEGIN
    ALTER TABLE monitoring.crawl_pages ADD amp_url nvarchar(2000) NULL
    PRINT '>> Added amp_url to crawl_pages'
END
go

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('monitoring.crawl_pages') AND name = 'amp_threat_score')
BEGIN
    ALTER TABLE monitoring.crawl_pages ADD amp_threat_score int NOT NULL DEFAULT 0
    PRINT '>> Added amp_threat_score to crawl_pages'
END
go

-- detected_threats: cloaking flag
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('monitoring.detected_threats') AND name = 'is_cloaked')
BEGIN
    ALTER TABLE monitoring.detected_threats ADD is_cloaked numeric(1) NOT NULL DEFAULT 0
    PRINT '>> Added is_cloaked to detected_threats'
END
go

-- detected_threats: redirect chain (for display in UI)
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('monitoring.detected_threats') AND name = 'redirect_chain')
BEGIN
    ALTER TABLE monitoring.detected_threats ADD redirect_chain nvarchar(max) NULL
    PRINT '>> Added redirect_chain to detected_threats'
END
go

-- Index for cloaking detection queries
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_crawl_pages_cloaked')
BEGIN
    CREATE INDEX idx_crawl_pages_cloaked ON monitoring.crawl_pages (is_cloaked) WHERE is_cloaked = 1 AND soft_delete = 0
    PRINT '>> Created index idx_crawl_pages_cloaked'
END
go

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_threats_cloaked')
BEGIN
    CREATE INDEX idx_threats_cloaked ON monitoring.detected_threats (is_cloaked) WHERE is_cloaked = 1 AND soft_delete = 0
    PRINT '>> Created index idx_threats_cloaked'
END
go

PRINT '>> monitoring_alter_crawler_deep_scan.sql completed.'
go
