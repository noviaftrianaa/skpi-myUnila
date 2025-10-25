# Sync Logs - SISTER Integrator

## 📋 Overview

Logging strategy untuk SISTER API synchronization menggunakan **Hybrid Approach**:
- **Database** (`logger.sync_logs`) untuk summary & dashboard
- **File Logs** untuk detailed debugging

## 🗄️ Database Schema

### Table: `logger.sync_logs`

```sql
CREATE TABLE logger.sync_logs (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    endpoint_name VARCHAR(100) NOT NULL,      -- e.g., "Agama", "Negara"
    endpoint_key VARCHAR(50) NOT NULL,        -- e.g., "agama", "negara"
    sync_type VARCHAR(50) NOT NULL DEFAULT 'manual', -- 'manual', 'batch', 'scheduled'
    status VARCHAR(20) NOT NULL,              -- 'success', 'failed', 'partial'
    total_records INT DEFAULT 0,              -- Total records from API
    success_count INT DEFAULT 0,              -- Successfully synced
    failed_count INT DEFAULT 0,               -- Failed to sync
    duration_ms INT,                          -- Execution time in milliseconds
    error_message TEXT,                       -- Error details if failed
    synced_by VARCHAR(255),                   -- Username or 'system'
    synced_at DATETIME DEFAULT DATEADD(HOUR, 7, GETUTCDATE()), -- WIB timezone

    INDEX idx_endpoint_date (endpoint_name, synced_at DESC),
    INDEX idx_status_date (status, synced_at DESC),
    INDEX idx_synced_at (synced_at DESC)
);
```

## 📊 Usage Examples

### Insert Log Entry
```sql
INSERT INTO logger.sync_logs (
    endpoint_name, endpoint_key, sync_type, status,
    total_records, success_count, failed_count,
    duration_ms, synced_by
)
VALUES (
    'Agama', 'agama', 'batch', 'success',
    8, 8, 0,
    850, 'admin@unila.ac.id'
);
```

### Query Recent Sync Activities
```sql
-- Last 10 sync activities
SELECT TOP 10
    endpoint_name,
    status,
    total_records,
    duration_ms,
    synced_by,
    synced_at
FROM logger.sync_logs
ORDER BY synced_at DESC;
```

### Query by Endpoint
```sql
-- Agama sync history
SELECT *
FROM logger.sync_logs
WHERE endpoint_key = 'agama'
ORDER BY synced_at DESC;
```

### Query Failed Syncs
```sql
-- All failed syncs in last 7 days
SELECT *
FROM logger.sync_logs
WHERE status = 'failed'
  AND synced_at >= DATEADD(DAY, -7, GETDATE())
ORDER BY synced_at DESC;
```

### Analytics - Success Rate
```sql
-- Success rate per endpoint (last 30 days)
SELECT
    endpoint_name,
    COUNT(*) as total_syncs,
    SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success_count,
    CAST(
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)
        AS DECIMAL(5,2)
    ) as success_rate
FROM logger.sync_logs
WHERE synced_at >= DATEADD(DAY, -30, GETDATE())
GROUP BY endpoint_name
ORDER BY success_rate DESC;
```

### Analytics - Average Duration
```sql
-- Average sync duration per endpoint
SELECT
    endpoint_name,
    AVG(duration_ms) as avg_duration_ms,
    MIN(duration_ms) as min_duration_ms,
    MAX(duration_ms) as max_duration_ms,
    COUNT(*) as total_syncs
FROM logger.sync_logs
WHERE status = 'success'
  AND synced_at >= DATEADD(DAY, -30, GETDATE())
GROUP BY endpoint_name
ORDER BY avg_duration_ms DESC;
```

## 🧹 Maintenance - Auto Cleanup

### Run Cleanup Procedure
```sql
-- Delete logs older than 90 days
EXEC logger.sp_cleanup_old_sync_logs @retention_days = 90;
```

### Schedule Cleanup (SQL Server Agent Job)
```sql
-- Create SQL Agent Job to run daily at 2 AM
USE msdb;
GO

EXEC dbo.sp_add_job
    @job_name = N'Cleanup Old Sync Logs',
    @enabled = 1,
    @description = N'Delete sync logs older than 90 days';

EXEC dbo.sp_add_jobstep
    @job_name = N'Cleanup Old Sync Logs',
    @step_name = N'Run Cleanup Procedure',
    @subsystem = N'TSQL',
    @database_name = N'pdut_dev',
    @command = N'EXEC logger.sp_cleanup_old_sync_logs @retention_days = 90;';

EXEC dbo.sp_add_schedule
    @schedule_name = N'Daily 2 AM',
    @freq_type = 4,  -- Daily
    @freq_interval = 1,
    @active_start_time = 020000;  -- 02:00:00

EXEC dbo.sp_attach_schedule
    @job_name = N'Cleanup Old Sync Logs',
    @schedule_name = N'Daily 2 AM';

EXEC dbo.sp_add_jobserver
    @job_name = N'Cleanup Old Sync Logs';
GO
```

## 📈 Anti-Bengkak Strategy

### 1. **Retention Policy (90 days)**
- Auto-delete logs older than 90 days
- Scheduled via SQL Agent Job (daily at 2 AM)

### 2. **Indexes for Performance**
- `idx_endpoint_date`: Fast query by endpoint + date
- `idx_status_date`: Fast query by status + date
- `idx_synced_at`: Fast query recent activities

### 3. **Partition by Month (Optional - for very high volume)**
```sql
-- If logs grow > 10M rows, consider table partitioning
-- Partition by month for better query performance
CREATE PARTITION FUNCTION pf_sync_logs_monthly (DATETIME)
AS RANGE RIGHT FOR VALUES (
    '2025-01-01', '2025-02-01', '2025-03-01', ..., '2025-12-01'
);
```

### 4. **Archive Old Logs (Optional)**
```sql
-- Move logs older than 1 year to archive table
INSERT INTO logger.sync_logs_archive
SELECT * FROM logger.sync_logs
WHERE synced_at < DATEADD(YEAR, -1, GETDATE());

DELETE FROM logger.sync_logs
WHERE synced_at < DATEADD(YEAR, -1, GETDATE());
```

## 🎯 Best Practices

### ✅ DO:
- Log summary untuk setiap sync (success/failed)
- Include duration untuk performance monitoring
- Include synced_by untuk audit trail
- Run cleanup job regularly (daily/weekly)
- Monitor log table size

### ❌ DON'T:
- Don't log full API response body (use file logs for that)
- Don't log sensitive data (passwords, tokens)
- Don't keep logs forever (use retention policy)
- Don't query without indexes (always use indexed columns)

## 📊 Dashboard Integration

### API Endpoint Example
```go
// GET /api/v1/logs/sync
func (h *handler) GetSyncLogs(c *fiber.Ctx) error {
    // Pagination
    page := c.QueryInt("page", 1)
    limit := c.QueryInt("limit", 20)
    offset := (page - 1) * limit

    // Filters
    endpointKey := c.Query("endpoint")
    status := c.Query("status")

    query := `
        SELECT id, endpoint_name, endpoint_key, sync_type, status,
               total_records, success_count, failed_count,
               duration_ms, error_message, synced_by, synced_at
        FROM logger.sync_logs
        WHERE 1=1
    `

    if endpointKey != "" {
        query += " AND endpoint_key = @p1"
    }
    if status != "" {
        query += " AND status = @p2"
    }

    query += " ORDER BY synced_at DESC OFFSET @p3 ROWS FETCH NEXT @p4 ROWS ONLY"

    // Execute query...
    // Return JSON response
}
```

## 📝 Migration Instructions

1. **Run migration script**:
   ```bash
   # Using SQL Server Management Studio (SSMS)
   # Open: migrations/create_sync_logs_table.sql
   # Execute against your database
   ```

2. **Verify table created**:
   ```sql
   SELECT * FROM INFORMATION_SCHEMA.TABLES
   WHERE TABLE_SCHEMA = 'logger' AND TABLE_NAME = 'sync_logs';
   ```

3. **Test insert**:
   ```sql
   INSERT INTO logger.sync_logs (endpoint_name, endpoint_key, sync_type, status, total_records, synced_by)
   VALUES ('Test', 'test', 'manual', 'success', 100, 'system');

   SELECT * FROM logger.sync_logs;
   ```

4. **Setup cleanup job** (optional but recommended):
   - Follow "Schedule Cleanup" section above
   - Or setup cron job to run cleanup procedure

## 🔍 Monitoring

### Check Table Size
```sql
SELECT
    t.name AS TableName,
    p.rows AS RowCounts,
    CAST(ROUND(((SUM(a.total_pages) * 8) / 1024.00), 2) AS NUMERIC(36, 2)) AS TotalSpaceMB
FROM sys.tables t
INNER JOIN sys.indexes i ON t.object_id = i.object_id
INNER JOIN sys.partitions p ON i.object_id = p.object_id AND i.index_id = p.index_id
INNER JOIN sys.allocation_units a ON p.partition_id = a.container_id
WHERE t.schema_id = SCHEMA_ID('logger')
  AND t.name = 'sync_logs'
GROUP BY t.name, p.rows;
```

### Check Growth Trend
```sql
-- Logs per day (last 30 days)
SELECT
    CAST(synced_at AS DATE) as sync_date,
    COUNT(*) as log_count,
    SUM(total_records) as total_records_synced
FROM logger.sync_logs
WHERE synced_at >= DATEADD(DAY, -30, GETDATE())
GROUP BY CAST(synced_at AS DATE)
ORDER BY sync_date DESC;
```

---

**Last Updated**: 2025-10-25
**Schema**: `logger.sync_logs`
**Retention**: 90 days (configurable)
**Cleanup**: Automated via stored procedure
