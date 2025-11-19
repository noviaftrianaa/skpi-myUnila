# Feeder Service Database Migrations

This directory contains SQL migration scripts for the Feeder Service database schema changes.

## Running Migrations

### Using SQL Server Management Studio (SSMS)

1. Open SQL Server Management Studio
2. Connect to your SQL Server instance
3. Open the migration file
4. Execute the script

### Using sqlcmd (Command Line)

```bash
# Local environment
sqlcmd -S localhost -d pdut_local -U sa -P YourPassword -i migrations/add_angkatan_to_sync_log.sql

# Production environment
sqlcmd -S 192.168.123.190 -d pdut_prod -U your_user -P YourPassword -i migrations/add_angkatan_to_sync_log.sql
```

### Using Azure Data Studio

1. Open Azure Data Studio
2. Connect to your database
3. Open the migration file
4. Click "Run" or press F5

## Migration History

### 2025-11-19: add_angkatan_to_sync_log.sql

**Purpose**: Add angkatan column to `logger.log_sync_pd_sms` table to support multiple angkatan syncs per month.

**What it does**:
- Adds `angkatan` column (VARCHAR(4), nullable)
- Updates existing records with angkatan from semester data
- Creates index on angkatan column for performance
- Creates composite index for common query patterns

**Why needed**:
The original sync log design blocked multiple angkatan syncs in the same month for the same prodi. This migration allows syncing multiple angkatan (e.g., 2020, 2021, 2022) in the same month.

**Breaking changes**: None - column is nullable and has default behavior

**Rollback**:
```sql
-- If needed, you can remove the column (data will be lost)
DROP INDEX IF EXISTS IX_log_sync_pd_sms_angkatan ON logger.log_sync_pd_sms;
DROP INDEX IF EXISTS IX_log_sync_pd_sms_sync_check ON logger.log_sync_pd_sms;
ALTER TABLE logger.log_sync_pd_sms DROP COLUMN angkatan;
```

## Pre-Migration Checklist

Before running any migration:

1. ✅ Backup your database
2. ✅ Review the migration script
3. ✅ Test on development/staging first
4. ✅ Verify application compatibility
5. ✅ Schedule during maintenance window (if production)

## Post-Migration Verification

After running the migration, verify:

```sql
-- Check column was added
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'logger'
AND TABLE_NAME = 'log_sync_pd_sms'
AND COLUMN_NAME = 'angkatan';

-- Check indexes were created
SELECT
    i.name AS IndexName,
    i.type_desc AS IndexType,
    COL_NAME(ic.object_id, ic.column_id) AS ColumnName
FROM sys.indexes i
INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
WHERE i.object_id = OBJECT_ID('logger.log_sync_pd_sms')
AND i.name LIKE 'IX_log_sync_pd_sms_%';

-- Test sync log query
SELECT TOP 5 *
FROM logger.log_sync_pd_sms
ORDER BY tgl_sync DESC;
```

## Troubleshooting

### Error: Column already exists
This is safe - the migration checks for existing columns and will skip if already present.

### Error: Insufficient permissions
Make sure your database user has ALTER TABLE permissions:
```sql
GRANT ALTER ON SCHEMA::logger TO your_user;
```

### Error: Index name conflicts
If you get index name conflicts, you may need to rename or drop existing indexes first.
