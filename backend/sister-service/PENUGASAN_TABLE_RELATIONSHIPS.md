# Penugasan (reg_ptk) Table Relationships Diagram

## Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         PENUGASAN DATA STRUCTURE                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

                                pdrd.reg_ptk (Main Table)
                          ┌─────────────────────────────────┐
                          │ ● id_reg_ptk (PK)               │
                          │ ○ id_sdm (FK)                   │
                          │ ○ id_stat_pegawai (FK)          │
                          │ ○ id_ikatan_kerja (FK)          │
                          │ ○ id_sms (FK)                   │
                          │   no_srt_tgs                    │
                          │   tgl_srt_tgs                   │
                          │   tmt_srt_tgs                   │
                          │   soft_delete                   │
                          └─────────────────────────────────┘
                                        │
                ┌───────────────────────┼───────────────────────┐
                │                       │                       │
                │                       │                       │
                ▼                       ▼                       ▼
    ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
    │   pdrd.sdm          │ │ ref.status_         │ │ ref.ikatan_kerja_   │
    │   (Dosen Info)      │ │ kepegawaian         │ │ sdm                 │
    ├─────────────────────┤ │ (Employment Status) │ │ (Contract Type)     │
    │ ● id_sdm (PK)       │ ├─────────────────────┤ ├─────────────────────┤
    │   nm_sdm ─────────┐ │ │ ● id_stat_pegawai   │ │ ● id_ikatan_kerja   │
    │   nidn            │ │ │   (PK)              │ │   (PK)              │
    │   nip             │ │ │   nm_stat_pegawai─┐ │ │   nm_ikatan_kerja─┐ │
    │   email           │ │ │   expired_date    │ │ │   expired_date    │ │
    │   no_hp           │ │ └───────────────────┼─┘ └───────────────────┼─┘
    └───────────────────┼─┘                     │                       │
                        │                       │                       │
                        │                       │                       │
                        └───────────────────────┼───────────────────────┘
                                                │
                                                ▼
                                    ┌─────────────────────────┐
                                    │   PENUGASAN DISPLAY     │
                                    │   (Frontend View)       │
                                    ├─────────────────────────┤
                                    │ • Nama Dosen            │◄─── From pdrd.sdm
                                    │ • Status Kepegawaian    │◄─── From ref.status_kepegawaian
                                    │ • Ikatan Kerja          │◄─── From ref.ikatan_kerja_sdm
                                    │ • Homebase Status       │◄─── From pdrd.keaktifan_ptk
                                    │ • Program Studi         │◄─── From pdrd.sms
                                    └─────────────────────────┘
                                                ▲
                                                │
                        ┌───────────────────────┼───────────────────────┐
                        │                       │                       │
                        ▼                       ▼                       ▼
            ┌─────────────────────┐ ┌─────────────────────┐           │
            │ pdrd.keaktifan_ptk  │ │   pdrd.sms          │           │
            │ (Homebase Status)   │ │   (Prodi Info)      │           │
            ├─────────────────────┤ ├─────────────────────┤           │
            │ ● id_reg_ptk (PK,FK)│ │ ● id_sms (PK)       │           │
            │ ● id_thn_ajaran (PK)│ │   nm_lemb ─────────┐│           │
            │   a_sp_homebase ──┐ │ │   kode_prodi       ││           │
            │   (0=No, 1=Yes)   │ │ │   singkatan        ││           │
            └───────────────────┼─┘ └───────────────────┼┼┘           │
                                │                       ││             │
                                └───────────────────────┼┼─────────────┘
                                                        ││
                                                        ▼▼
                                              ┌──────────────────────┐
                                              │ FINAL JSON RESPONSE  │
                                              └──────────────────────┘

Legend:
  ● = Primary Key
  ○ = Foreign Key
  ─ = Data flow to display
```

## Field Mapping

### Main Display Fields and Their Sources

| Display Field | Source Table | Source Column | Join Relationship |
|---------------|--------------|---------------|-------------------|
| **Nama Dosen** | pdrd.sdm | nm_sdm | reg_ptk.id_sdm → sdm.id_sdm |
| **NIDN** | pdrd.sdm | nidn | reg_ptk.id_sdm → sdm.id_sdm |
| **NIP** | pdrd.sdm | nip | reg_ptk.id_sdm → sdm.id_sdm |
| **Status Kepegawaian** | ref.status_kepegawaian | nm_stat_pegawai | reg_ptk.id_stat_pegawai → status_kepegawaian.id_stat_pegawai |
| **Ikatan Kerja** | ref.ikatan_kerja_sdm | nm_ikatan_kerja | reg_ptk.id_ikatan_kerja → ikatan_kerja_sdm.id_ikatan_kerja |
| **Homebase** | pdrd.keaktifan_ptk | a_sp_homebase | reg_ptk.id_reg_ptk → keaktifan_ptk.id_reg_ptk (latest year) |
| **Program Studi** | pdrd.sms | nm_lemb | reg_ptk.id_sms → sms.id_sms |
| **Kode Prodi** | pdrd.sms | kode_prodi | reg_ptk.id_sms → sms.id_sms |

## SQL Join Strategy

### 1. Base Table
```sql
FROM pdrd.reg_ptk rp
WHERE rp.soft_delete = 0
```

### 2. Dosen Information (1:1 relationship)
```sql
LEFT JOIN pdrd.sdm s
    ON rp.id_sdm = s.id_sdm
```
- Returns: Nama dosen, NIDN, NIP, email, phone

### 3. Status Kepegawaian (1:1 relationship)
```sql
LEFT JOIN ref.status_kepegawaian sk
    ON rp.id_stat_pegawai = sk.id_stat_pegawai
```
- Returns: Status name (PNS, CPNS, NON ASN, etc.)
- Filter active only: `WHERE expired_date IS NULL`

### 4. Ikatan Kerja (1:1 relationship)
```sql
LEFT JOIN ref.ikatan_kerja_sdm ik
    ON rp.id_ikatan_kerja = ik.id_ikatan_kerja
```
- Returns: Contract type name (Dosen Tetap, Dosen Tidak Tetap, etc.)
- Filter active only: `WHERE expired_date IS NULL`

### 5. Homebase Status (1:Many, but get latest year only)
```sql
LEFT JOIN (
    SELECT
        id_reg_ptk,
        id_thn_ajaran,
        a_sp_homebase,
        ROW_NUMBER() OVER (
            PARTITION BY id_reg_ptk
            ORDER BY id_thn_ajaran DESC
        ) as rn
    FROM pdrd.keaktifan_ptk
    WHERE soft_delete = 0
) kp_latest
    ON rp.id_reg_ptk = kp_latest.id_reg_ptk
    AND kp_latest.rn = 1
```
- Returns: Latest homebase status (0 or 1)
- Returns: Academic year of the status
- **Important**: Uses window function to get only the most recent year

### 6. Program Studi (1:1 relationship)
```sql
LEFT JOIN pdrd.sms sms
    ON rp.id_sms = sms.id_sms
```
- Returns: Program name, code, abbreviation

## Data Flow Diagram

```
User Request (GET /api/penugasan)
        ↓
Controller Layer
        ↓
Service Layer
        ↓
Repository Layer
        ↓
┌─────────────────────────────────────────────┐
│  Execute SQL Query with Multiple JOINs      │
├─────────────────────────────────────────────┤
│  1. reg_ptk (base)                          │
│  2. JOIN sdm (nama dosen)                   │
│  3. JOIN status_kepegawaian (status)        │
│  4. JOIN ikatan_kerja_sdm (contract)        │
│  5. JOIN keaktifan_ptk subquery (homebase)  │
│  6. JOIN sms (prodi)                        │
└─────────────────────────────────────────────┘
        ↓
Database (SQL Server)
        ↓
Result Set (rows with all joined data)
        ↓
Repository Layer (map to struct)
        ↓
Service Layer (business logic)
        ↓
Controller Layer (format response)
        ↓
JSON Response to Frontend
```

## Query Performance Considerations

### Indexes Recommended
1. **pdrd.reg_ptk**
   - `(soft_delete, last_update)` - for main filtering and sorting
   - `(id_sdm)` - for dosen filter
   - `(id_sms)` - for prodi filter

2. **pdrd.keaktifan_ptk**
   - `(id_reg_ptk, id_thn_ajaran DESC)` - for homebase subquery

3. **ref.status_kepegawaian**
   - `(id_stat_pegawai)` - already PK

4. **ref.ikatan_kerja_sdm**
   - `(id_ikatan_kerja)` - already PK

### Query Execution Plan
```
1. Filter pdrd.reg_ptk by soft_delete = 0
   ├─ ~3,589 rows (as of current data)
   └─ Fast: uses index on soft_delete

2. For each row, perform LEFT JOINs:
   ├─ sdm: Direct FK lookup (fast)
   ├─ status_kepegawaian: Direct PK lookup (very fast)
   ├─ ikatan_kerja_sdm: Direct PK lookup (very fast)
   ├─ keaktifan_ptk: Subquery with window function
   │  └─ ROW_NUMBER() limits to 1 row per id_reg_ptk
   └─ sms: Direct FK lookup (fast)

3. Sort by last_update DESC

4. Apply OFFSET/FETCH for pagination
   └─ Returns only requested page
```

## Special Cases

### Handling Null Values
- All JOINs are LEFT JOINs to preserve records even when related data is missing
- Nullable fields in Go should use pointer types (`*string`, `*int`, etc.)

### Homebase Special Logic
- Multiple years exist per dosen in `keaktifan_ptk`
- Subquery uses `ROW_NUMBER()` to get only the latest year
- Value interpretation:
  - `0` = "Tidak" (Not homebase)
  - `1` = "Ya" (Is homebase)
  - `NULL` = No data available

### Date Fields
- `tgl_srt_tgs`: Date of assignment letter
- `tmt_srt_tgs`: Effective date of assignment (more important)
- `tgl_ptk_keluar`: Exit date (usually NULL for active)

## Example Complete Record

```json
{
  "id_reg_ptk": "75AB8B85-E0D4-4343-8ECC-207A7AC3BD09",
  "id_sdm": "ABC123...",
  "nama_dosen": "AHMAD FAUZI",
  "nidn": "0030018102",
  "nip": "198101302006041002",
  "id_stat_pegawai": 1,
  "status_kepegawaian": "PNS",
  "id_ikatan_kerja": "A",
  "ikatan_kerja": "Dosen Tetap",
  "homebase": 1,
  "homebase_tahun_ajaran": 2025,
  "id_sms": "DEF456...",
  "nama_prodi": "Program Studi Profesi Profesi Dokter",
  "kode_prodi": "11901",
  "no_srt_tgs": "-",
  "tgl_srt_tgs": "1970-01-01",
  "tmt_srt_tgs": "2006-04-01",
  "tgl_ptk_keluar": null,
  "reg_nidn": "0030018102",
  "jns_reg": null,
  "create_date": "2006-04-01T00:00:00Z",
  "last_update": "2025-09-19T00:00:00Z",
  "last_sync": "2025-09-19T00:00:00Z"
}
```

## Filter and Search Capabilities

### Available Filters
1. **By Dosen**: Filter by `id_sdm`
2. **By Prodi**: Filter by `id_sms`
3. **By Status**: Filter by `id_stat_pegawai`
4. **By Contract**: Filter by `id_ikatan_kerja`
5. **By Homebase**: Filter by `a_sp_homebase = 1`
6. **By Name**: Search `nm_sdm LIKE '%keyword%'`

### Pagination
- Use `OFFSET` and `FETCH NEXT` for server-side pagination
- Always include a count query for total records
- Recommended page size: 10-50 records

## Summary

This relationship structure allows the frontend to display comprehensive information about each penugasan record by:
1. Starting from the main `pdrd.reg_ptk` table
2. Joining to 5 related tables to enrich the data
3. Using a special subquery for homebase to get only the latest year
4. Filtering out soft-deleted records
5. Supporting flexible filtering and pagination

The query is optimized with proper indexes and uses LEFT JOINs to handle missing data gracefully.
