# Riwayat Fungsional API Test Commands

## Prerequisites
- Sister-service must be running on port 8083
- Database must have the `pdrd.rwy_fungsional` table created
- You need a valid `id_sdm` (dosen UUID) from the database

## Test Sequence

### 1. Sync Single Dosen
Sync riwayat fungsional for a single dosen from Sister API.

```bash
# Replace with actual id_sdm
curl -X POST http://localhost:8083/api/v1/jabatan-fungsional/sync \
  -H "Content-Type: application/json" \
  -d '{
    "id_sdm": "YOUR_ID_SDM_HERE"
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Riwayat fungsional sync completed",
  "data": {
    "id_sdm": "YOUR_ID_SDM_HERE",
    "success": 2,
    "failed": 0,
    "error_message": ""
  }
}
```

### 2. Get List by ID SDM
After syncing, retrieve all riwayat fungsional records for that dosen.

```bash
# This endpoint doesn't exist - use the list endpoint with search instead
curl -X GET "http://localhost:8083/jabatan-fungsional/list?search=NIDN_OR_NAME&page=1&limit=10"
```

### 3. Get Detail by ID
Get detailed information about a specific riwayat fungsional record.

```bash
# Replace with actual id_rwy_jabfung from sync result
curl -X GET http://localhost:8083/jabatan-fungsional/YOUR_ID_RWY_JABFUNG_HERE
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "id_rwy_jabfung": "uuid-here",
    "id_sdm": "uuid-here",
    "id_kel_bidang": null,
    "id_jabfung": 46,
    "sk_jabfung": "123/SK/2023",
    "tmt_sk_jabfung": "2023-02-01T00:00:00Z",
    "angka_kredit": 400,
    "lebih_ajar": 0,
    "lebih_lit": 0,
    "lebih_pengmas": 0,
    "lebih_tunjang": 0,
    "bidang_ilmu": null,
    "nama_dosen": "Dr. John Doe",
    "nidn": "0123456789",
    "nm_jabfung": "Lektor Kepala",
    "nm_kel_bidang": null
  }
}
```

### 4. Get List with Pagination
Get paginated list of all riwayat fungsional records.

```bash
# Basic list
curl -X GET "http://localhost:8083/jabatan-fungsional/list?page=1&limit=10"

# With search
curl -X GET "http://localhost:8083/jabatan-fungsional/list?search=Lektor&page=1&limit=10"

# With sorting
curl -X GET "http://localhost:8083/jabatan-fungsional/list?page=1&limit=10&sort_by=angka_kredit&sort_order=desc"

# With all parameters
curl -X GET "http://localhost:8083/jabatan-fungsional/list?page=1&limit=10&search=Guru&sort_by=tmt_sk_jabfung&sort_order=desc"
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id_rwy_jabfung": "uuid-1",
        "id_sdm": "uuid-sdm-1",
        "id_jabfung": 46,
        "sk_jabfung": "123/SK/2023",
        "tmt_sk_jabfung": "2023-02-01T00:00:00Z",
        "angka_kredit": 400,
        "nama_dosen": "Dr. John Doe",
        "nidn": "0123456789",
        "nm_jabfung": "Lektor Kepala"
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 10,
    "total_pages": 5
  }
}
```

### 5. Get Statistics
Get statistical summary of riwayat fungsional data.

```bash
curl -X GET http://localhost:8083/jabatan-fungsional/stats
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "total_riwayat": 150,
    "total_asisten": 20,
    "total_lektor": 85,
    "total_guru_besar": 15,
    "last_sync_date": "2025-01-15T10:30:00Z"
  }
}
```

### 6. Batch Sync All Dosen (Optional - Takes Long Time)
Sync riwayat fungsional for ALL active dosen. **Warning**: This may take a long time!

```bash
curl -X POST http://localhost:8083/api/v1/jabatan-fungsional/sync-all
```

## API Endpoints Summary

### Public Endpoints (No Authentication)
- `GET /jabatan-fungsional/stats` - Get statistics
- `GET /jabatan-fungsional/list` - Get paginated list
- `GET /jabatan-fungsional/:id` - Get detail by ID

### Protected Endpoints (API v1)
- `POST /api/v1/jabatan-fungsional/sync` - Sync single dosen
- `POST /api/v1/jabatan-fungsional/sync-all` - Batch sync all dosen

## Database Schema Reference

Table: `pdrd.rwy_fungsional`

| Column | Type | Description |
|--------|------|-------------|
| id_rwy_jabfung | uniqueidentifier | Primary Key |
| id_sdm | uniqueidentifier | Foreign Key to pdrd.sdm |
| id_kel_bidang | int | Foreign Key to ref.kelompok_bidang (nullable) |
| id_jabfung | int | Foreign Key to ref.jabfung |
| sk_jabfung | varchar(60) | SK number |
| tmt_sk_jabfung | date | Start date |
| angka_kredit | int | Credit points |
| lebih_ajar | int | Excess teaching credits |
| lebih_lit | int | Excess research credits |
| lebih_pengmas | int | Excess community service credits |
| lebih_tunjang | int | Excess supporting credits |
| bidang_ilmu | varchar(100) | Field of study (nullable) |

## Sister API Mapping

Sister API response fields map to database columns as follows:

```
Sister API                    -> Database Column
-------------------------------------------------
id                           -> id_rwy_jabfung
id_sdm                       -> id_sdm
id_jabatan_fungsional        -> id_jabfung
sk                           -> sk_jabfung
tanggal_mulai                -> tmt_sk_jabfung
angka_kredit                 -> angka_kredit
kelebihan_pengajaran         -> lebih_ajar
kelebihan_penelitian         -> lebih_lit
kelebihan_pengabdian         -> lebih_pengmas
kelebihan_penunjang          -> lebih_tunjang
```

## Sample Test Workflow

1. First, get a valid id_sdm from database:
```sql
SELECT TOP 1 id_sdm, nm_sdm, nidn
FROM pdrd.sdm
WHERE soft_delete = 0 AND id_sdm IS NOT NULL
```

2. Sync that dosen's riwayat fungsional:
```bash
curl -X POST http://localhost:8083/api/v1/jabatan-fungsional/sync \
  -H "Content-Type: application/json" \
  -d '{"id_sdm": "your-id-sdm-here"}'
```

3. Get the id_rwy_jabfung from the sync response and fetch details:
```bash
curl -X GET http://localhost:8083/jabatan-fungsional/id-from-step-2
```

4. Browse all records with pagination:
```bash
curl -X GET "http://localhost:8083/jabatan-fungsional/list?page=1&limit=10"
```

5. Check statistics:
```bash
curl -X GET http://localhost:8083/jabatan-fungsional/stats
```

## Notes

- All sync operations require a valid Sister API token (automatically handled by the service)
- The service implements automatic retry logic for transient API errors
- Rate limiting is handled with 500ms delays between requests
- Set `id_kel_bidang` and `bidang_ilmu` to NULL as they are not provided by Sister API initially
- The service uses MERGE (upsert) operations, so re-syncing the same data is safe
