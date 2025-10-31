# Penugasan (reg_ptk) Database Schema Documentation

## Overview
This document provides comprehensive information about the penugasan (reg_ptk) table schema and its relationships with other tables in the SQL Server database.

## Database Connection
- **Server**: 192.168.123.119:1433
- **Database**: pdut_dev
- **Connection String Format**: `sqlserver://username:password@192.168.123.119:1433?database=pdut_dev&TrustServerCertificate=true`

## Main Table: pdrd.reg_ptk

### Table Structure
| Column Name | Data Type | Max Length | Nullable | Primary Key | Description |
|------------|-----------|------------|----------|-------------|-------------|
| id_reg_ptk | uniqueidentifier | N/A | NO | YES | Primary key - unique identifier for penugasan |
| id_jns_keluar | char | 1 | YES | NO | Foreign key to jenis keluar |
| id_sdm | uniqueidentifier | N/A | YES | NO | Foreign key to pdrd.sdm (dosen) |
| id_sp | uniqueidentifier | N/A | YES | NO | Foreign key to satuan pendidikan |
| id_stat_pegawai | smallint | N/A | NO | NO | Foreign key to ref.status_kepegawaian |
| id_ikatan_kerja | char | 1 | NO | NO | Foreign key to ref.ikatan_kerja_sdm |
| id_sms | uniqueidentifier | N/A | YES | NO | Foreign key to pdrd.sms (program studi) |
| no_srt_tgs | varchar | 80 | YES | NO | Nomor surat tugas |
| tgl_srt_tgs | date | N/A | NO | NO | Tanggal surat tugas |
| tmt_srt_tgs | date | N/A | NO | NO | Terhitung mulai tanggal surat tugas |
| tgl_ptk_keluar | date | N/A | YES | NO | Tanggal PTK keluar |
| nidn | char | 10 | YES | NO | NIDN pada registrasi |
| jns_reg | varchar | 10 | YES | NO | Jenis registrasi |
| create_date | datetime | N/A | NO | NO | Tanggal dibuat |
| id_creator | uniqueidentifier | N/A | NO | NO | ID pembuat |
| last_update | datetime | N/A | NO | NO | Tanggal terakhir diupdate |
| id_updater | uniqueidentifier | N/A | YES | NO | ID pengupdate |
| soft_delete | numeric | N/A | NO | NO | Flag soft delete (0=active, 1=deleted) |
| last_sync | datetime | N/A | NO | NO | Tanggal terakhir sync |

### Foreign Key Relationships
| FK Column | References | Description |
|-----------|------------|-------------|
| id_ikatan_kerja | ref.ikatan_kerja_sdm.id_ikatan_kerja | Ikatan kerja dosen |
| id_jns_keluar | ref.jenis_keluar.id_jns_keluar | Jenis keluar |
| id_sp | pdrd.satuan_pendidikan.id_sp | Satuan pendidikan |
| id_sdm | pdrd.sdm.id_sdm | Sumber daya manusia (dosen) |
| id_sms | pdrd.sms.id_sms | Program studi |
| id_stat_pegawai | ref.status_kepegawaian.id_stat_pegawai | Status kepegawaian |

---

## Related Tables

### 1. pdrd.sdm (Dosen Information)

**Purpose**: Stores dosen/lecturer personal information

**Key Columns**:
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| id_sdm | uniqueidentifier | Primary key |
| nm_sdm | varchar(100) | Nama dosen |
| nidn | char(10) | NIDN (Nomor Induk Dosen Nasional) |
| nip | varchar(18) | NIP (Nomor Induk Pegawai) |
| nik | char(20) | NIK (Nomor Induk Kependudukan) |
| jk | char(1) | Jenis kelamin |
| tmpt_lahir | varchar(32) | Tempat lahir |
| tgl_lahir | date | Tanggal lahir |
| email | varchar(60) | Email |
| no_hp | varchar(20) | Nomor HP |
| soft_delete | numeric | Flag soft delete |

**Join**: `LEFT JOIN pdrd.sdm s ON rp.id_sdm = s.id_sdm`

---

### 2. ref.status_kepegawaian (Employment Status Reference)

**Purpose**: Reference table for employee status types

**Key Columns**:
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| id_stat_pegawai | smallint | Primary key |
| nm_stat_pegawai | varchar(50) | Nama status kepegawaian |
| a_ref_pddikti | numeric | Reference PDDikti |
| a_ref_unila | numeric | Reference Unila |
| expired_date | datetime | Tanggal kadaluarsa (NULL = aktif) |

**Sample Data**:
| ID | Status Name |
|----|-------------|
| 1 | PNS |
| 10 | NON PNS |
| 11 | TNI |
| 12 | POLRI |
| 13 | CPNS |
| 14 | PPPK |
| 15 | Perjanjian Kerja dengan Perguruan Tinggi |
| 16 | NON ASN |
| 17 | Dokter Pendidik Klinis |
| 18 | ASN JF Non Dosen |

**Join**: `LEFT JOIN ref.status_kepegawaian sk ON rp.id_stat_pegawai = sk.id_stat_pegawai`

---

### 3. ref.ikatan_kerja_sdm (Employment Contract Type Reference)

**Purpose**: Reference table for employment contract types

**Key Columns**:
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| id_ikatan_kerja | char(1) | Primary key |
| nm_ikatan_kerja | varchar(50) | Nama ikatan kerja |
| ket_ikatan_kerja | varchar(150) | Keterangan |
| expired_date | datetime | Tanggal kadaluarsa (NULL = aktif) |

**Sample Data**:
| ID | Contract Type |
|----|---------------|
| A | Dosen Tetap |
| B | Dosen PNS DPK |
| E | Dokter Pendidik Klinis |
| F | Dosen Tetap BH |
| G | Dosen Tidak Tetap |
| H | P3K ASN |
| I | Dosen dengan Perjanjian Kerja |
| M | Pengajar nondosen |
| N | Dosen Tetap Perjanjian Kerja Waktu Tertentu |

**Join**: `LEFT JOIN ref.ikatan_kerja_sdm ik ON rp.id_ikatan_kerja = ik.id_ikatan_kerja`

---

### 4. pdrd.keaktifan_ptk (Homebase Status)

**Purpose**: Tracks lecturer activity and homebase status per academic year

**Key Columns**:
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| id_reg_ptk | uniqueidentifier | Primary key, FK to reg_ptk |
| id_thn_ajaran | numeric | Primary key, tahun ajaran (year) |
| a_sp_homebase | numeric | Homebase status (0=not homebase, 1=homebase) |
| a_aktif_bln_1 through a_aktif_bln_12 | numeric | Activity status per month |
| soft_delete | numeric | Flag soft delete |

**Important Notes**:
- This table has multiple rows per `id_reg_ptk` (one per academic year)
- To get the latest homebase status, use a subquery with ROW_NUMBER() OVER (PARTITION BY id_reg_ptk ORDER BY id_thn_ajaran DESC)
- Homebase values: 0 = Tidak (not homebase), 1 = Ya (is homebase)

**Join (Latest Year Only)**:
```sql
LEFT JOIN (
    SELECT
        id_reg_ptk,
        id_thn_ajaran,
        a_sp_homebase,
        ROW_NUMBER() OVER (PARTITION BY id_reg_ptk ORDER BY id_thn_ajaran DESC) as rn
    FROM pdrd.keaktifan_ptk
    WHERE soft_delete = 0
) kp_latest ON rp.id_reg_ptk = kp_latest.id_reg_ptk AND kp_latest.rn = 1
```

---

### 5. pdrd.sms (Program Studi/Study Program)

**Purpose**: Stores information about study programs (prodi)

**Key Columns**:
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| id_sms | uniqueidentifier | Primary key |
| nm_lemb | varchar(100) | Nama program studi |
| kode_prodi | varchar(10) | Kode program studi |
| singkatan | varchar(50) | Singkatan |
| id_jenj_didik | numeric | Jenjang pendidikan |
| stat_prodi | char(1) | Status prodi |
| soft_delete | numeric | Flag soft delete |

**Join**: `LEFT JOIN pdrd.sms sms ON rp.id_sms = sms.id_sms`

---

## Complete SQL Query for Penugasan List

### Main Query
```sql
SELECT
    rp.id_reg_ptk,
    rp.id_sdm,
    s.nm_sdm AS nama_dosen,
    s.nidn,
    s.nip,
    rp.id_stat_pegawai,
    sk.nm_stat_pegawai AS status_kepegawaian,
    rp.id_ikatan_kerja,
    ik.nm_ikatan_kerja AS ikatan_kerja,
    kp_latest.a_sp_homebase AS homebase,
    kp_latest.id_thn_ajaran AS homebase_tahun_ajaran,
    rp.id_sms,
    sms.nm_lemb AS nama_prodi,
    sms.kode_prodi,
    rp.no_srt_tgs,
    rp.tgl_srt_tgs,
    rp.tmt_srt_tgs,
    rp.tgl_ptk_keluar,
    rp.nidn AS reg_nidn,
    rp.jns_reg,
    rp.create_date,
    rp.last_update,
    rp.last_sync
FROM pdrd.reg_ptk rp
LEFT JOIN pdrd.sdm s ON rp.id_sdm = s.id_sdm
LEFT JOIN ref.status_kepegawaian sk ON rp.id_stat_pegawai = sk.id_stat_pegawai
LEFT JOIN ref.ikatan_kerja_sdm ik ON rp.id_ikatan_kerja = ik.id_ikatan_kerja
LEFT JOIN (
    SELECT
        id_reg_ptk,
        id_thn_ajaran,
        a_sp_homebase,
        ROW_NUMBER() OVER (PARTITION BY id_reg_ptk ORDER BY id_thn_ajaran DESC) as rn
    FROM pdrd.keaktifan_ptk
    WHERE soft_delete = 0
) kp_latest ON rp.id_reg_ptk = kp_latest.id_reg_ptk AND kp_latest.rn = 1
LEFT JOIN pdrd.sms sms ON rp.id_sms = sms.id_sms
WHERE rp.soft_delete = 0
ORDER BY rp.last_update DESC;
```

### With Pagination
```sql
-- Add after WHERE clause:
ORDER BY rp.last_update DESC
OFFSET @offset ROWS
FETCH NEXT @limit ROWS ONLY;
```

### Filter by Dosen
```sql
WHERE rp.soft_delete = 0
    AND rp.id_sdm = @id_sdm
```

### Filter by Prodi
```sql
WHERE rp.soft_delete = 0
    AND rp.id_sms = @id_sms
```

### Filter by Status Kepegawaian
```sql
WHERE rp.soft_delete = 0
    AND rp.id_stat_pegawai = @id_stat_pegawai
```

### Filter by Ikatan Kerja
```sql
WHERE rp.soft_delete = 0
    AND rp.id_ikatan_kerja = @id_ikatan_kerja
```

### Filter by Homebase Status
```sql
WHERE rp.soft_delete = 0
    AND kp_latest.a_sp_homebase = 1  -- Show only homebase
```

### Search by Name
```sql
WHERE rp.soft_delete = 0
    AND s.nm_sdm LIKE '%' + @search + '%'
```

---

## Count Query for Pagination
```sql
SELECT COUNT(*) as total
FROM pdrd.reg_ptk rp
WHERE rp.soft_delete = 0;
```

---

## Reference Data Queries

### Get Status Kepegawaian Options
```sql
SELECT
    id_stat_pegawai,
    nm_stat_pegawai
FROM ref.status_kepegawaian
WHERE expired_date IS NULL
ORDER BY nm_stat_pegawai;
```

### Get Ikatan Kerja Options
```sql
SELECT
    id_ikatan_kerja,
    nm_ikatan_kerja,
    ket_ikatan_kerja
FROM ref.ikatan_kerja_sdm
WHERE expired_date IS NULL
ORDER BY nm_ikatan_kerja;
```

### Get Prodi Options
```sql
SELECT
    id_sms,
    nm_lemb,
    kode_prodi
FROM pdrd.sms
WHERE soft_delete = 0
ORDER BY nm_lemb;
```

---

## Sample Query Results

### Example Record
```
ID Reg PTK      : 75AB8B85-E0D4-4343-8ECC-207A7AC3BD09
Nama Dosen      : AHMAD FAUZI
NIDN            : 0030018102
NIP             : 198101302006041002
Status Pegawai  : PNS (ID: 1)
Ikatan Kerja    : Dosen Tetap (ID: A)
Homebase        : Ya (Tahun Ajaran: 2025)
Prodi           : Program Studi Profesi Profesi Dokter (Kode: 11901)
No Surat Tugas  : -
Tgl Surat Tugas : 1970-01-01
TMT Surat Tugas : 2006-04-01
Last Update     : 2025-09-19
```

---

## Database Statistics
- **Total Penugasan Records**: 3,589 (as of query time)
- **Active Records** (soft_delete = 0): 3,589

---

## Implementation Notes for Go Repository

### Recommended Struct
```go
type Penugasan struct {
    IDRegPTK             string     `db:"id_reg_ptk" json:"id_reg_ptk"`
    IDSDM                *string    `db:"id_sdm" json:"id_sdm,omitempty"`
    NamaDosen            *string    `db:"nama_dosen" json:"nama_dosen,omitempty"`
    NIDN                 *string    `db:"nidn" json:"nidn,omitempty"`
    NIP                  *string    `db:"nip" json:"nip,omitempty"`
    IDStatPegawai        *int16     `db:"id_stat_pegawai" json:"id_stat_pegawai,omitempty"`
    StatusKepegawaian    *string    `db:"status_kepegawaian" json:"status_kepegawaian,omitempty"`
    IDIkatanKerja        *string    `db:"id_ikatan_kerja" json:"id_ikatan_kerja,omitempty"`
    IkatanKerja          *string    `db:"ikatan_kerja" json:"ikatan_kerja,omitempty"`
    Homebase             *int       `db:"homebase" json:"homebase,omitempty"`
    HomebaseTahunAjaran  *int       `db:"homebase_tahun_ajaran" json:"homebase_tahun_ajaran,omitempty"`
    IDSMS                *string    `db:"id_sms" json:"id_sms,omitempty"`
    NamaProdi            *string    `db:"nama_prodi" json:"nama_prodi,omitempty"`
    KodeProdi            *string    `db:"kode_prodi" json:"kode_prodi,omitempty"`
    NoSrtTgs             *string    `db:"no_srt_tgs" json:"no_srt_tgs,omitempty"`
    TglSrtTgs            *time.Time `db:"tgl_srt_tgs" json:"tgl_srt_tgs,omitempty"`
    TmtSrtTgs            *time.Time `db:"tmt_srt_tgs" json:"tmt_srt_tgs,omitempty"`
    TglPTKKeluar         *time.Time `db:"tgl_ptk_keluar" json:"tgl_ptk_keluar,omitempty"`
    RegNIDN              *string    `db:"reg_nidn" json:"reg_nidn,omitempty"`
    JnsReg               *string    `db:"jns_reg" json:"jns_reg,omitempty"`
    CreateDate           time.Time  `db:"create_date" json:"create_date"`
    LastUpdate           time.Time  `db:"last_update" json:"last_update"`
    LastSync             time.Time  `db:"last_sync" json:"last_sync"`
}
```

### Key Implementation Points
1. Use pointer types for nullable fields
2. Handle the keaktifan_ptk subquery correctly to get only the latest year
3. Always filter by `soft_delete = 0`
4. Use parameterized queries to prevent SQL injection
5. Implement proper pagination with OFFSET/FETCH NEXT

---

## Query Performance Considerations

### Recommended Indexes
- `pdrd.reg_ptk(soft_delete, last_update)` - for main query sorting
- `pdrd.reg_ptk(id_sdm)` - for filtering by dosen
- `pdrd.reg_ptk(id_sms)` - for filtering by prodi
- `pdrd.keaktifan_ptk(id_reg_ptk, id_thn_ajaran)` - for homebase lookup

### Query Optimization Tips
1. Always include `WHERE soft_delete = 0` to filter out deleted records
2. Use `TOP` or `OFFSET/FETCH` for pagination to limit result sets
3. The keaktifan_ptk subquery with ROW_NUMBER() is optimized to return only one row per id_reg_ptk
4. Consider adding additional indexes based on common filter patterns

---

## File Location
This documentation is stored at: `C:\laragon\www\my-unila\backend\sister-service\PENUGASAN_SCHEMA_DOCUMENTATION.md`

Additional files:
- Final query: `C:\laragon\www\my-unila\backend\sister-service\final_penugasan_query.sql`
- Test script: `C:\laragon\www\my-unila\backend\sister-service\test_final_query.go`
- Schema exploration script: `C:\laragon\www\my-unila\backend\sister-service\query_schema.go`
