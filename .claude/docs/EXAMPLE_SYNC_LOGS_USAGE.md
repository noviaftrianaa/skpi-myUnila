# Example: Sync Logs Usage

## 📊 Schema dengan Detail Insert/Update

```sql
CREATE TABLE logger.sync_logs (
    -- Identifiers
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    endpoint_name VARCHAR(100) NOT NULL,
    endpoint_key VARCHAR(50) NOT NULL,
    sync_type VARCHAR(50) NOT NULL DEFAULT 'manual',
    status VARCHAR(20) NOT NULL,

    -- Record counts (DETAIL OPERASI)
    total_records INT DEFAULT 0,      -- Total dari Sister API
    inserted_count INT DEFAULT 0,     -- ✅ Berapa yang BARU diinsert
    updated_count INT DEFAULT 0,      -- ✅ Berapa yang di-UPDATE
    failed_count INT DEFAULT 0,       -- ❌ Gagal insert/update
    skipped_count INT DEFAULT 0,      -- ⏭️ Di-skip (validation error, dll)

    -- Performance & Error
    duration_ms INT,
    error_message TEXT,
    error_details TEXT,

    -- Audit
    synced_by VARCHAR(255),
    synced_at DATETIME DEFAULT DATEADD(HOUR, 7, GETUTCDATE())
);
```

## 📝 Use Cases & Examples

### ✅ Case 1: Successful Sync (All New Data)

**Scenario**: Sync Agama pertama kali - semua data baru

```sql
INSERT INTO logger.sync_logs (
    endpoint_name, endpoint_key, sync_type, status,
    total_records, inserted_count, updated_count, failed_count, skipped_count,
    duration_ms, synced_by
)
VALUES (
    'Agama',            -- endpoint_name
    'agama',            -- endpoint_key
    'manual',           -- sync_type
    'success',          -- status
    8,                  -- total_records (dari Sister API)
    8,                  -- inserted_count (semua baru)
    0,                  -- updated_count (tidak ada update)
    0,                  -- failed_count (tidak ada yang gagal)
    0,                  -- skipped_count (tidak ada yang di-skip)
    850,                -- duration_ms (0.85 detik)
    'admin@unila.ac.id' -- synced_by
);
```

**Insight**:
- 8 data baru berhasil diinsert
- Tidak ada data existing yang di-update
- Sync sukses 100%

---

### ✅ Case 2: Sync with Updates (Mixed Insert & Update)

**Scenario**: Sync Negara kedua kali - ada data baru & update existing

```sql
INSERT INTO logger.sync_logs (
    endpoint_name, endpoint_key, sync_type, status,
    total_records, inserted_count, updated_count, failed_count, skipped_count,
    duration_ms, synced_by
)
VALUES (
    'Negara',
    'negara',
    'batch',
    'success',
    251,    -- total dari API
    5,      -- 5 negara baru diinsert
    246,    -- 246 negara existing di-update (nama berubah, dll)
    0,      -- tidak ada yang gagal
    0,      -- tidak ada yang di-skip
    2340,   -- 2.34 detik
    'system'
);
```

**Insight**:
- 5 negara baru ditambahkan (INSERT)
- 246 negara existing diupdate (UPDATE) - mungkin ada perubahan nama
- Success rate: 100% (251/251)

---

### ⚠️ Case 3: Partial Success (Some Failed)

**Scenario**: Sync Gelar Akademik - ada yang gagal karena constraint

```sql
INSERT INTO logger.sync_logs (
    endpoint_name, endpoint_key, sync_type, status,
    total_records, inserted_count, updated_count, failed_count, skipped_count,
    duration_ms, error_message, error_details, synced_by
)
VALUES (
    'Gelar Akademik',
    'gelar_akademik',
    'batch',
    'partial',          -- status partial karena ada yang gagal
    4982,               -- total dari API
    88,                 -- 88 gelar baru diinsert
    4892,               -- 4892 gelar existing di-update
    2,                  -- 2 record gagal (constraint error)
    0,                  -- tidak ada yang di-skip
    52580,              -- 52.58 detik
    'Failed to insert 2 records: CHECK constraint violation',
    'ID 10637: singkat_gelar NULL constraint error
ID 10895: posisi_gelar invalid value error',
    'system'
);
```

**Insight**:
- 88 gelar baru berhasil diinsert
- 4,892 gelar existing berhasil diupdate
- 2 record gagal (need investigation)
- Success rate: 99.96% (4980/4982)
- Error detail tersimpan untuk debugging

---

### ❌ Case 4: Complete Failure (Sister API Down)

**Scenario**: Sync gagal karena Sister API timeout

```sql
INSERT INTO logger.sync_logs (
    endpoint_name, endpoint_key, sync_type, status,
    total_records, inserted_count, updated_count, failed_count, skipped_count,
    duration_ms, error_message, error_details, synced_by
)
VALUES (
    'Semester',
    'semester',
    'scheduled',
    'failed',
    0,      -- tidak dapat data dari API
    0,      -- tidak ada insert
    0,      -- tidak ada update
    0,      -- tidak ada failed record
    0,      -- tidak ada skip
    30000,  -- timeout after 30 detik
    'Sister API error: Terjadi kesalahan dalam sistem',
    'Sister API returned 503: upstream connect error or disconnect/reset before headers',
    'system'
);
```

**Insight**:
- API request gagal total
- Error message & detail tersimpan untuk troubleshooting
- Tidak ada perubahan data di database

---

### ⏭️ Case 5: Sync with Validation Skip

**Scenario**: Sync dengan data validation - ada yang di-skip

```sql
INSERT INTO logger.sync_logs (
    endpoint_name, endpoint_key, sync_type, status,
    total_records, inserted_count, updated_count, failed_count, skipped_count,
    duration_ms, error_details, synced_by
)
VALUES (
    'Jenjang Pendidikan',
    'jenjang_pendidikan',
    'manual',
    'success',
    25,     -- total dari API
    3,      -- 3 jenjang baru diinsert
    20,     -- 20 jenjang existing di-update
    0,      -- tidak ada yang gagal
    2,      -- 2 record di-skip (invalid data)
    1200,   -- 1.2 detik
    'Skipped records:
- ID 99: nama_jenjang empty (validation failed)
- ID 100: duplicate entry (already exists)',
    'admin@unila.ac.id'
);
```

**Insight**:
- 3 jenjang baru berhasil diinsert
- 20 jenjang existing berhasil diupdate
- 2 record di-skip karena validation
- Net success: 23/25 (92%)

---

## 📊 Analytics Queries

### 1. Breakdown Insert vs Update (Last 30 Days)

```sql
SELECT
    endpoint_name,
    COUNT(*) as total_syncs,
    SUM(total_records) as total_from_api,
    SUM(inserted_count) as total_new_inserts,
    SUM(updated_count) as total_updates,
    SUM(failed_count) as total_failures,
    SUM(skipped_count) as total_skipped,
    CAST(
        SUM(inserted_count + updated_count) * 100.0 / NULLIF(SUM(total_records), 0)
        AS DECIMAL(5,2)
    ) as success_rate_pct
FROM logger.sync_logs
WHERE synced_at >= DATEADD(DAY, -30, GETDATE())
  AND status IN ('success', 'partial')
GROUP BY endpoint_name
ORDER BY total_syncs DESC;
```

**Sample Output**:
```
endpoint_name       | total_syncs | total_from_api | total_new_inserts | total_updates | success_rate_pct
--------------------|-------------|----------------|-------------------|---------------|------------------
Gelar Akademik      | 5           | 24,910         | 88                | 24,820        | 99.96%
Negara              | 8           | 2,008          | 5                 | 2,003         | 100.00%
Jenjang Pendidikan  | 10          | 250            | 3                 | 245           | 99.20%
Agama               | 15          | 120            | 8                 | 112           | 100.00%
```

### 2. New Data Growth Over Time

```sql
-- Berapa banyak data BARU yang diinsert per hari
SELECT
    CAST(synced_at AS DATE) as sync_date,
    endpoint_name,
    SUM(inserted_count) as new_data_count,
    SUM(updated_count) as updated_data_count
FROM logger.sync_logs
WHERE synced_at >= DATEADD(DAY, -7, GETDATE())
  AND status = 'success'
GROUP BY CAST(synced_at AS DATE), endpoint_name
ORDER BY sync_date DESC, new_data_count DESC;
```

**Sample Output**:
```
sync_date   | endpoint_name       | new_data_count | updated_data_count
------------|---------------------|----------------|-------------------
2025-10-25  | Gelar Akademik      | 88             | 4,892
2025-10-25  | Negara              | 5              | 246
2025-10-24  | Jenjang Pendidikan  | 3              | 22
2025-10-24  | Agama               | 0              | 8
```

### 3. Failed Records Investigation

```sql
-- Semua sync yang ada failed records (perlu investigation)
SELECT
    endpoint_name,
    synced_at,
    total_records,
    inserted_count,
    updated_count,
    failed_count,
    error_message,
    error_details,
    synced_by
FROM logger.sync_logs
WHERE failed_count > 0
  AND synced_at >= DATEADD(DAY, -7, GETDATE())
ORDER BY failed_count DESC, synced_at DESC;
```

### 4. Data Freshness Report

```sql
-- Kapan terakhir kali setiap endpoint sync dengan INSERT baru
SELECT
    endpoint_name,
    MAX(CASE WHEN inserted_count > 0 THEN synced_at END) as last_new_data_sync,
    MAX(synced_at) as last_any_sync,
    SUM(CASE WHEN inserted_count > 0 THEN inserted_count ELSE 0 END) as total_new_data_inserted
FROM logger.sync_logs
WHERE status IN ('success', 'partial')
GROUP BY endpoint_name
ORDER BY last_new_data_sync DESC;
```

---

## 🎯 Dashboard Metrics

### Widget 1: Sync Summary (Today)
```sql
SELECT
    COUNT(DISTINCT endpoint_key) as endpoints_synced_today,
    SUM(total_records) as total_records_processed,
    SUM(inserted_count) as total_new_inserts,
    SUM(updated_count) as total_updates,
    SUM(failed_count) as total_failures,
    CAST(
        SUM(inserted_count + updated_count) * 100.0 / NULLIF(SUM(total_records), 0)
        AS DECIMAL(5,2)
    ) as success_rate
FROM logger.sync_logs
WHERE CAST(synced_at AS DATE) = CAST(GETDATE() AS DATE);
```

### Widget 2: Recent Activities (Last 10)
```sql
SELECT TOP 10
    endpoint_name,
    status,
    total_records,
    inserted_count,
    updated_count,
    failed_count,
    duration_ms,
    synced_by,
    synced_at
FROM logger.sync_logs
ORDER BY synced_at DESC;
```

### Widget 3: Health Check (Failed Syncs)
```sql
-- Sync yang perlu perhatian (failed atau partial dengan failure rate > 5%)
SELECT
    endpoint_name,
    COUNT(*) as failed_sync_count,
    MAX(synced_at) as last_failed_at,
    MAX(error_message) as latest_error
FROM logger.sync_logs
WHERE (status = 'failed' OR failed_count > 0)
  AND synced_at >= DATEADD(DAY, -7, GETDATE())
GROUP BY endpoint_name
HAVING COUNT(*) > 0
ORDER BY failed_sync_count DESC;
```

---

## 💡 Best Practices

### ✅ Always Track:
1. **Insert Count** - Berapa data BARU yang masuk
2. **Update Count** - Berapa data EXISTING yang berubah
3. **Failed Count** - Berapa yang gagal (untuk investigation)
4. **Skipped Count** - Berapa yang di-skip (validation, dll)

### ✅ Benefits:
- **Audit Trail**: Tahu persis apa yang terjadi di setiap sync
- **Troubleshooting**: Error details tersimpan untuk debugging
- **Analytics**: Bisa analisa growth & data quality
- **Monitoring**: Alert jika failure rate tinggi
- **Compliance**: Audit log untuk regulasi

### ✅ Example Alerts:
```sql
-- Alert: Failure rate > 5% in last 24 hours
SELECT
    endpoint_name,
    CAST(SUM(failed_count) * 100.0 / NULLIF(SUM(total_records), 0) AS DECIMAL(5,2)) as failure_rate
FROM logger.sync_logs
WHERE synced_at >= DATEADD(HOUR, -24, GETDATE())
GROUP BY endpoint_name
HAVING CAST(SUM(failed_count) * 100.0 / NULLIF(SUM(total_records), 0) AS DECIMAL(5,2)) > 5.0;
```

---

**Conclusion**: Dengan tracking detail `inserted_count` dan `updated_count`, kita punya **visibility penuh** terhadap apa yang terjadi di setiap sync operation. Ini sangat valuable untuk:
- Troubleshooting masalah
- Monitoring data quality
- Audit compliance
- Performance optimization
