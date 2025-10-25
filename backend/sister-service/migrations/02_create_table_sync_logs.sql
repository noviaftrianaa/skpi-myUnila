-- Step 2: Create sync_logs table
-- Run after creating schema

CREATE TABLE logger.sync_logs (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    endpoint_name VARCHAR(100) NOT NULL,
    endpoint_key VARCHAR(50) NOT NULL,
    sync_type VARCHAR(50) NOT NULL DEFAULT 'manual', -- 'manual', 'batch', 'scheduled'
    status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'partial'

    -- Record counts
    total_records INT DEFAULT 0,          -- Total dari API
    inserted_count INT DEFAULT 0,         -- Baru insert (INSERT)
    updated_count INT DEFAULT 0,          -- Data update (UPDATE/MERGE)
    failed_count INT DEFAULT 0,           -- Gagal insert/update
    skipped_count INT DEFAULT 0,          -- Di-skip (duplicate, invalid, dll)

    -- Performance
    duration_ms INT,

    -- Error handling
    error_message TEXT,
    error_details TEXT,                   -- Stack trace atau detail error

    -- Audit trail
    synced_by VARCHAR(255),
    synced_at DATETIME DEFAULT DATEADD(HOUR, 7, GETUTCDATE()),

    -- Indexes for performance
    INDEX idx_endpoint_date (endpoint_name, synced_at DESC),
    INDEX idx_status_date (status, synced_at DESC),
    INDEX idx_synced_at (synced_at DESC)
);
