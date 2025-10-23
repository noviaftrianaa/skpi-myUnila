# Database Migrations - SISTER Service

Database migrations untuk SISTER Service.

## 📋 Migration List

| Version | File | Description | Status |
|---------|------|-------------|--------|
| 001 | `001_create_ref_schema_and_agama_table.sql` | Create ref schema dan tabel lv_agama | ⏳ Pending |

## 🚀 How to Run Migrations

### Option 1: Using SQL Server Management Studio (SSMS)

1. Buka SSMS
2. Connect ke SQL Server instance Anda
3. Select database `pddikti`
4. Open migration file: `001_create_ref_schema_and_agama_table.sql`
5. Execute (F5)

### Option 2: Using sqlcmd (Command Line)

**Jika SQL Server di Docker:**
```bash
# Cari container name SQL Server
docker ps | grep sql

# Run migration
docker exec -i <sql-container-name> /opt/mssql-tools18/bin/sqlcmd \
  -S localhost \
  -U sa \
  -P 'YourPassword' \
  -d pddikti \
  -C \
  -i /path/to/001_create_ref_schema_and_agama_table.sql
```

**Jika SQL Server Lokal:**
```bash
sqlcmd -S localhost -U sa -P "YourPassword" -d pddikti -i 001_create_ref_schema_and_agama_table.sql
```

### Option 3: Using Azure Data Studio

1. Buka Azure Data Studio
2. Connect ke SQL Server
3. Open migration file
4. Run query

### Option 4: Copy-Paste SQL

Jika tools di atas tidak tersedia, copy-paste isi file SQL ke query window dan execute.

## 📊 Database Schema

### Schema: ref

Schema untuk menyimpan data referensi dari SISTER API.

#### Table: ref.lv_agama

Tabel untuk menyimpan data referensi agama.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id_agama | INT | NO | Primary Key, ID agama dari SISTER |
| nama_agama | NVARCHAR(50) | NO | Nama agama |
| expired_date | DATETIME | YES | Tanggal expired data |
| last_sync | DATETIME | YES | Tanggal terakhir sinkronisasi |
| synced_by | NVARCHAR(50) | YES | Username yang melakukan sync |

**Indexes:**
- Primary Key: `id_agama`
- Unique: `nama_agama`
- Index: `last_sync` (DESC)
- Index: `synced_by`

#### Table: ref.sync_history (Optional)

Tabel untuk tracking history sinkronisasi (audit trail).

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | INT IDENTITY | NO | Primary Key, Auto-increment |
| entity_name | NVARCHAR(100) | NO | Nama entitas (agama, negara, dll) |
| sync_date | DATETIME | NO | Tanggal sinkronisasi |
| synced_by | NVARCHAR(50) | NO | Username yang melakukan sync |
| total_records | INT | NO | Total records yang di-sync |
| status | NVARCHAR(20) | NO | Status: success, failed, partial |
| error_message | NVARCHAR(MAX) | YES | Pesan error jika gagal |
| duration_ms | INT | YES | Durasi proses (milliseconds) |

**Indexes:**
- Primary Key: `id`
- Index: `sync_date` (DESC)
- Index: `entity_name`

## 🔍 Verification

Setelah run migration, verify dengan query:

```sql
-- Check schema exists
SELECT * FROM sys.schemas WHERE name = 'ref';

-- Check tables
SELECT
    SCHEMA_NAME(schema_id) AS SchemaName,
    name AS TableName,
    create_date AS CreatedDate
FROM sys.tables
WHERE schema_id = SCHEMA_ID('ref');

-- Check table structure
EXEC sp_help 'ref.lv_agama';

-- Check indexes
SELECT
    i.name AS IndexName,
    i.type_desc AS IndexType,
    c.name AS ColumnName
FROM sys.indexes i
INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE i.object_id = OBJECT_ID('ref.lv_agama');
```

## 🐛 Troubleshooting

### Error: "Database 'pddikti' does not exist"

**Solusi:**
1. Create database terlebih dahulu:
```sql
CREATE DATABASE pddikti;
GO
```

2. Run migration lagi

### Error: "Login failed for user 'sa'"

**Solusi:**
1. Check username dan password SQL Server
2. Pastikan user punya permission untuk create schema dan table
3. Check SQL Server Authentication mode (Mixed Mode)

### Error: "Schema 'ref' already exists but table not found"

**Solusi:**
- Table creation gagal, check error message
- Drop dan recreate schema:
```sql
-- HATI-HATI: Ini akan drop semua objects di schema ref
DROP SCHEMA IF EXISTS ref;
GO
```

- Run migration lagi

## 📝 Future Migrations

Untuk migration selanjutnya (negara, wilayah, dll):

1. Create file: `002_create_negara_table.sql`
2. Follow naming convention: `<version>_<description>.sql`
3. Update README dengan migration info
4. Run migration

### Template for New Migration:

```sql
-- =============================================
-- SISTER Service Database Migration
-- Version: 00X
-- Description: <Your description>
-- Date: YYYY-MM-DD
-- =============================================

USE pddikti;
GO

-- Your migration SQL here

PRINT 'Migration 00X completed successfully!'
GO
```

## 🔐 Security Notes

- **NEVER** commit passwords or sensitive info ke git
- Use environment variables untuk credentials
- Pastikan user database punya least privilege principle
- Enable audit logging untuk production

## 📚 References

- [SQL Server Schemas](https://docs.microsoft.com/en-us/sql/relational-databases/security/authentication-access/create-a-database-schema)
- [SQL Server Indexes](https://docs.microsoft.com/en-us/sql/relational-databases/indexes/indexes)
- [Sister API Documentation](https://sister-api.kemdikbud.go.id)

---

**Last Updated**: 2025-01-23
**Maintained by**: MyUnila Dev Team
