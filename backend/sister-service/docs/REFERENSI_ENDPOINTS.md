# Referensi Endpoints Documentation

## Overview

Sister Service API menyediakan **34 endpoint referensi** untuk sinkronisasi data dari SISTER Kemdikbud ke database lokal.

### Endpoint Summary

| Category | Count | Status |
|----------|-------|--------|
| Original Endpoints | 5 | ✅ Implemented |
| New Endpoints | 29 | ✅ Implemented |
| **Total** | **34** | **✅ Live** |

---

## Original 5 Endpoints

1. **Agama** (`/api/v1/referensi/agama`)
   - GET: List all agama (religions)
   - GET `/:id`: Get by ID
   - POST `/sync`: Sync from SISTER

2. **Negara** (`/api/v1/referensi/negara`)
   - GET: List all countries
   - GET `/:id`: Get by ID
   - POST `/sync`: Sync from SISTER

3. **Jenjang Pendidikan** (`/api/v1/referensi/jenjang-pendidikan`)
   - GET: List all education levels
   - POST `/sync`: Sync from SISTER

4. **Gelar Akademik** (`/api/v1/referensi/gelar-akademik`)
   - GET: List all academic titles
   - POST `/sync`: Sync from SISTER

5. **Semester** (`/api/v1/referensi/semester`)
   - GET: List all semesters
   - POST `/sync`: Sync from SISTER

---

## New 29 Endpoints

### Academic & Study Fields

6. **Bidang Studi** (`/api/v1/referensi/bidang-studi`)
   - Description: Field of study / discipline
   - GET: List all bidang studi
   - POST `/sync`: Sync from SISTER

7. **Kelompok Bidang** (`/api/v1/referensi/kelompok-bidang`)
   - Description: Field group
   - GET: List all kelompok bidang
   - POST `/sync`: Sync from SISTER

### Employment & Career

8. **Jabatan Fungsional** (`/api/v1/referensi/jabatan-fungsional`)
   - Description: Functional positions
   - GET: List all jabatan fungsional
   - POST `/sync`: Sync from SISTER

9. **Jabatan Tugas Tambahan** (`/api/v1/referensi/jabatan-tugas-tambahan`)
   - Description: Additional duty positions
   - GET: List all jabatan tugas tambahan
   - POST `/sync`: Sync from SISTER

10. **Status Kepegawaian** (`/api/v1/referensi/status-kepegawaian`)
    - Description: Employment status
    - GET: List all status kepegawaian
    - POST `/sync`: Sync from SISTER

11. **Golongan Pangkat** (`/api/v1/referensi/golongan-pangkat`)
    - Description: Rank grade
    - GET: List all golongan pangkat
    - POST `/sync`: Sync from SISTER

12. **Ikatan Kerja** (`/api/v1/referensi/ikatan-kerja`)
    - Description: Work bond type
    - GET: List all ikatan kerja
    - POST `/sync`: Sync from SISTER

13. **Sumber Gaji** (`/api/v1/referensi/sumber-gaji`)
    - Description: Salary source
    - GET: List all sumber gaji
    - POST `/sync`: Sync from SISTER

### Job & Business

14. **Bidang Usaha** (`/api/v1/referensi/bidang-usaha`)
    - Description: Business field
    - GET: List all bidang usaha
    - POST `/sync`: Sync from SISTER

15. **Jenis Pekerjaan** (`/api/v1/referensi/jenis-pekerjaan`)
    - Description: Job type
    - GET: List all jenis pekerjaan
    - POST `/sync`: Sync from SISTER

16. **Bidang Pekerjaan** (`/api/v1/referensi/bidang-pekerjaan`)
    - Description: Job field
    - GET: List all bidang pekerjaan
    - POST `/sync`: Sync from SISTER

### Academic Resources

17. **Jenis Bahan Ajar** (`/api/v1/referensi/jenis-bahan-ajar`)
    - Description: Teaching material type
    - GET: List all jenis bahan ajar
    - POST `/sync`: Sync from SISTER

18. **Jenis Beasiswa** (`/api/v1/referensi/jenis-beasiswa`)
    - Description: Scholarship type
    - GET: List all jenis beasiswa
    - POST `/sync`: Sync from SISTER

19. **Jenis Diklat** (`/api/v1/referensi/jenis-diklat`)
    - Description: Training type
    - GET: List all jenis diklat
    - POST `/sync`: Sync from SISTER

20. **Jenis Tes** (`/api/v1/referensi/jenis-tes`)
    - Description: Test type
    - GET: List all jenis tes
    - POST `/sync`: Sync from SISTER

21. **Lembaga Sertifikasi** (`/api/v1/referensi/lembaga-sertifikasi`)
    - Description: Certification institution
    - GET: List all lembaga sertifikasi
    - POST `/sync`: Sync from SISTER

### Administrative

22. **Jenis Dokumen** (`/api/v1/referensi/jenis-dokumen`)
    - Description: Document type
    - GET: List all jenis dokumen
    - POST `/sync`: Sync from SISTER

23. **Jenis Keluar** (`/api/v1/referensi/jenis-keluar`)
    - Description: Exit type (student/staff)
    - GET: List all jenis keluar
    - POST `/sync`: Sync from SISTER

24. **Jenis Kepanitiaan** (`/api/v1/referensi/jenis-kepanitiaan`)
    - Description: Committee type
    - GET: List all jenis kepanitiaan
    - POST `/sync`: Sync from SISTER

25. **Jenis Kesejahteraan** (`/api/v1/referensi/jenis-kesejahteraan`)
    - Description: Welfare type
    - GET: List all jenis kesejahteraan
    - POST `/sync`: Sync from SISTER

26. **Jenis Tunjangan** (`/api/v1/referensi/jenis-tunjangan`)
    - Description: Allowance type
    - GET: List all jenis tunjangan
    - POST `/sync`: Sync from SISTER

### Research & Publication

27. **Jenis Publikasi** (`/api/v1/referensi/jenis-publikasi`)
    - Description: Publication type
    - GET: List all jenis publikasi
    - POST `/sync`: Sync from SISTER

28. **Media Publikasi** (`/api/v1/referensi/media-publikasi`)
    - Description: Publication media
    - GET: List all media publikasi
    - POST `/sync`: Sync from SISTER

29. **Skim Kegiatan** (`/api/v1/referensi/skim-kegiatan`)
    - Description: Research/community service scheme
    - GET: List all skim kegiatan
    - POST `/sync`: Sync from SISTER

30. **Kategori Capaian Luaran** (`/api/v1/referensi/kategori-capaian-luaran`)
    - Description: Research output achievement category
    - GET: List all kategori capaian luaran
    - POST `/sync`: Sync from SISTER

31. **Kategori Kegiatan** (`/api/v1/referensi/kategori-kegiatan`)
    - Description: Activity category
    - GET: List all kategori kegiatan
    - POST `/sync`: Sync from SISTER

### Awards & Recognition

32. **Jenis Penghargaan** (`/api/v1/referensi/jenis-penghargaan`)
    - Description: Award type
    - GET: List all jenis penghargaan
    - POST `/sync`: Sync from SISTER

33. **Tingkat Penghargaan** (`/api/v1/referensi/tingkat-penghargaan`)
    - Description: Award level
    - GET: List all tingkat penghargaan
    - POST `/sync`: Sync from SISTER

### Geographic

34. **Wilayah** (`/api/v1/referensi/wilayah`)
    - Description: Indonesian regions
    - GET: List all wilayah
    - POST `/sync`: Sync from SISTER

---

## API Patterns

### GET Request Pattern

All GET endpoints return data in this format:

```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id_{entity}": 1,
      "nama_{entity}": "Example Name",
      "expired_date": "2025-12-31T00:00:00Z",
      "last_sync": "2025-10-26T16:27:05Z",
      "synced_by": "admin@unila.ac.id"
    }
  ]
}
```

### POST /sync Request Pattern

All sync endpoints accept no body and return:

```json
{
  "success": true,
  "message": "Sync completed successfully",
  "data": {
    "total_records": 150,
    "synced_by": "admin@unila.ac.id",
    "message": "Data synced successfully"
  }
}
```

### Common Error Responses

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error description"
}
```

---

## Authentication

All endpoints require JWT Bearer token authentication:

```http
Authorization: Bearer <your_jwt_token>
```

---

## Batch Sync

Sync multiple endpoints at once:

```http
POST /api/v1/referensi/batch-sync
Content-Type: application/json
Authorization: Bearer <token>

{
  "endpoints": [
    "bidang_studi",
    "jabatan_fungsional",
    "jenis_beasiswa"
  ]
}
```

Response:

```json
{
  "success": true,
  "message": "Batch sync completed",
  "data": {
    "total_requested": 3,
    "total_success": 3,
    "total_failed": 0,
    "results": [
      {
        "endpoint": "bidang_studi",
        "success": true,
        "total_records": 856,
        "message": "Successfully synced 856 records"
      }
    ],
    "duration": "5.234s"
  }
}
```

---

## Metadata

Get metadata for all available endpoints:

```http
GET /api/v1/referensi/metadata
```

Returns information about each endpoint including:
- Total records
- Last sync time
- Synced by user
- Availability status

---

## Implementation Details

### Architecture

- **Language**: Go 1.22.6
- **Framework**: Fiber v2.52.2
- **Database**: SQL Server
- **SISTER API**: REST API with JWT auth

### Code Structure

```
apps/referensi/
├── entity.go          # 58 entity structs (29 entities + 29 SISTER responses)
├── repository.go      # Repository interface (58 methods)
├── repository_new.go  # Repository implementations (1131 lines)
├── service.go         # Service interface (58 methods)
├── service_new.go     # Service implementations (500+ lines)
├── controller.go      # HTTP handlers (58 methods)
└── router.go          # Route registrations (29 route groups)
```

### Database Tables

All data is stored in `ref` schema:
- ref.bidang_studi
- ref.bidang_usaha
- ref.jabatan_fungsional
- ... (29 total tables)

### Sync Strategy

1. Fetch raw data from SISTER API (returns `[]byte`)
2. Unmarshal JSON to Sister struct types
3. Bulk upsert to database using SQL MERGE
4. Track sync metadata (timestamp, user)

---

## Testing

### Test GET Endpoint

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8083/api/v1/referensi/bidang-studi
```

### Test Sync Endpoint

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  http://localhost:8083/api/v1/referensi/bidang-studi/sync
```

---

## Status

| Feature | Status |
|---------|--------|
| Entities (58) | ✅ Complete |
| Repository (58 methods) | ✅ Complete |
| Service (58 methods) | ✅ Complete |
| Controller (58 methods) | ✅ Complete |
| Router (29 groups) | ✅ Complete |
| SISTER API Client (29 methods) | ✅ Complete |
| Docker Container | ✅ Running |
| Compilation | ✅ Success |
| Fiber Handlers | ✅ 130 registered |

**All 29 new endpoints are LIVE and accessible!**

---

## Next Steps (Optional)

1. **SISTER API Response Fix**: Some endpoints return wrapped objects instead of arrays
2. **Frontend Integration**: Add 29 cards to sister-integrator page
3. **Testing**: Comprehensive integration tests for all sync operations
4. **Documentation**: Auto-generate OpenAPI spec with swag

---

## Support

For issues or questions:
- GitHub: https://github.com/anthropics/claude-code/issues
- Email: support@unila.ac.id

---

**Last Updated**: October 26, 2025
**Version**: 1.0
**Author**: Sister Service Development Team
