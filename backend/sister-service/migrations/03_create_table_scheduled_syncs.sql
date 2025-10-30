-- Step 3: Create scheduled_syncs table
-- Table untuk menyimpan konfigurasi scheduled sync (cron jobs)

CREATE TABLE dbo.scheduled_syncs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,

    -- Sync configuration
    sync_type VARCHAR(50) NOT NULL,        -- 'referensi' or 'dosen'
    endpoint_key VARCHAR(100),             -- For referensi only, NULL for dosen

    -- Schedule configuration
    cron_expression VARCHAR(100) NOT NULL, -- Cron expression (e.g., "0 2 * * *")
    schedule_time DATETIME2,               -- User-friendly time display

    -- Status
    is_active BIT NOT NULL DEFAULT 1,
    last_run_at DATETIME2,
    next_run_at DATETIME2,

    -- Audit trail
    created_by VARCHAR(255) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),

    -- Indexes for performance
    INDEX idx_is_active (is_active),
    INDEX idx_sync_type (sync_type),
    INDEX idx_next_run (next_run_at)
);
