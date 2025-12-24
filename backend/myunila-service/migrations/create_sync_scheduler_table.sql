-- Create sync_scheduler table for managing scheduled sync jobs
-- Database: man_akses (SQL Server)
-- Date: 2025-12-24

USE man_akses;
GO

-- Drop table if exists (for development only)
-- DROP TABLE IF EXISTS man_akses.sync_scheduler;

CREATE TABLE man_akses.sync_scheduler (
    id_scheduler UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    nama_scheduler NVARCHAR(255) NOT NULL,
    deskripsi NVARCHAR(MAX) NULL,
    jenis_sync NVARCHAR(50) NOT NULL,  -- 'radius', 'sikep', etc
    cron_expression NVARCHAR(100) NOT NULL,
    is_active INT NOT NULL DEFAULT 1,  -- 1=active, 0=inactive
    username_filter NVARCHAR(255) NULL,
    role_filter NVARCHAR(100) NULL,
    date_from DATE NULL,
    date_to DATE NULL,
    last_run_at DATETIME NULL,
    next_run_at DATETIME NULL,
    last_run_status NVARCHAR(50) NULL,  -- 'success', 'failed', 'running'
    last_run_message NVARCHAR(MAX) NULL,
    created_by NVARCHAR(255) NOT NULL,
    tgl_create DATETIME NOT NULL DEFAULT GETDATE(),
    last_update DATETIME NOT NULL DEFAULT GETDATE(),
    soft_delete INT NOT NULL DEFAULT 0
);

-- Create indexes for better query performance
CREATE INDEX idx_sync_scheduler_active ON man_akses.sync_scheduler(is_active, soft_delete);
CREATE INDEX idx_sync_scheduler_jenis ON man_akses.sync_scheduler(jenis_sync);
CREATE INDEX idx_sync_scheduler_next_run ON man_akses.sync_scheduler(next_run_at, is_active);

GO

-- Insert sample scheduler data for testing
INSERT INTO man_akses.sync_scheduler (
    id_scheduler,
    nama_scheduler,
    deskripsi,
    jenis_sync,
    cron_expression,
    is_active,
    username_filter,
    role_filter,
    date_from,
    date_to,
    next_run_at,
    created_by,
    tgl_create,
    last_update,
    soft_delete
) VALUES (
    NEWID(),
    'Daily Radius Sync - All Users',
    'Sync all users from Radius SSO every day at 2:00 AM',
    'radius',
    '0 2 * * *',  -- Every day at 2:00 AM
    1,  -- Active
    NULL,  -- No username filter
    NULL,  -- No role filter
    NULL,  -- No date from
    NULL,  -- No date to
    DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('02:00:00' AS TIME)),  -- Next run tomorrow at 2 AM
    'system',
    GETDATE(),
    GETDATE(),
    0  -- Not deleted
);

GO
