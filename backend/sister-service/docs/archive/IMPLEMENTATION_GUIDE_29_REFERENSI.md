# Implementation Guide: 29 New SISTER Referensi Endpoints

## ✅ Completed

### 1. Entity Models (DONE)
File: `apps/referensi/entity.go`
- ✅ Added 29 new entity structs (BidangStudi, BidangUsaha, etc.)
- ✅ Added 29 Sister API response structs (SisterBidangStudi, etc.)
- All entities follow same pattern as existing Agama, Negara, etc.

### 2. Code Generator Tool (DONE)
File: `tools/generate_referensi_code.go`
- ✅ Created automated code generator
- ✅ Supports: repo-interface, repo-impl, service-interface, service-impl, controller, router, sister-api, batch-sync
- ✅ All 29 endpoints configured with correct table mappings

## 🚧 Pending Implementation

### 3. Repository Layer

**Command to generate:**
```bash
cd tools
go run generate_referensi_code.go repo-interface >> ../apps/referensi/repository_interfaces.txt
go run generate_referensi_code.go repo-impl >> ../apps/referensi/repository_impl.txt
```

**Manual steps:**
1. Open `apps/referensi/repository.go`
2. Add interface methods from `repository_interfaces.txt` to `Repository` interface
3. Add implementation methods from `repository_impl.txt` to file (atau buat file baru `repository_new.go`)

### 4. Service Layer

**Command to generate:**
```bash
cd tools
go run generate_referensi_code.go service-interface >> ../apps/referensi/service_interfaces.txt
go run generate_referensi_code.go service-impl >> ../apps/referensi/service_impl.txt
```

**Manual steps:**
1. Open `apps/referensi/service.go`
2. Add interface methods to `Service` interface
3. Add implementation methods

### 5. Controller Layer

**Command to generate:**
```bash
cd tools
go run generate_referensi_code.go controller >> ../apps/referensi/controller_new.txt
```

**Manual steps:**
1. Add methods to `controller` struct in `apps/referensi/controller.go`

### 6. Router

**Command to generate:**
```bash
cd tools
go run generate_referensi_code.go router >> ../apps/referensi/router_additions.txt
```

**Manual steps:**
1. Open `apps/referensi/router.go`
2. Add route definitions in `Init()` function

### 7. SISTER API Client

**Command to generate:**
```bash
cd tools
go run generate_referensi_code.go sister-api >> ../external/sister_api/client_methods.txt
```

**Manual steps:**
1. Open `external/sister_api/client.go`
2. Add 29 new methods: `GetReferensiBidangStudi()`, etc.

### 8. Batch Sync

**Command to generate:**
```bash
cd tools
go run generate_referensi_code.go batch-sync >> ../apps/referensi/batch_sync_cases.txt
```

**Manual steps:**
1. Open `apps/referensi/service.go`
2. Find `BatchSyncFromSister()` function
3. Add new case statements to switch
4. Update `GetAllReferensiMetadata()` to include 29 new endpoints

## 📋 List of 29 New Endpoints

| No | Endpoint | Table | ID Type | Status |
|----|----------|-------|---------|--------|
| 1 | `/referensi/bidang-studi` | `ref.bidang_studi` | int | 🔄 Ready |
| 2 | `/referensi/bidang-usaha` | `ref.bidang_usaha` | string | 🔄 Ready |
| 3 | `/referensi/jabatan-fungsional` | `ref.jabfung` | int | 🔄 Ready |
| 4 | `/referensi/jabatan-tugas-tambahan` | `ref.jab_tgs` | int | 🔄 Ready |
| 5 | `/referensi/jenis-bahan-ajar` | `ref.jenis_bahan_ajar` | int | 🔄 Ready |
| 6 | `/referensi/jenis-beasiswa` | `ref.jenis_beasiswa` | int | 🔄 Ready |
| 7 | `/referensi/jenis-diklat` | `ref.jenis_diklat` | int | 🔄 Ready |
| 8 | `/referensi/jenis-dokumen` | `ref.jenis_dokumen` | int | 🔄 Ready |
| 9 | `/referensi/jenis-keluar` | `ref.jenis_keluar` | string | 🔄 Ready |
| 10 | `/referensi/jenis-kepanitiaan` | `ref.jenis_kepanitiaan` | int | 🔄 Ready |
| 11 | `/referensi/jenis-kesejahteraan` | `ref.jenis_kesejahteraan` | int | 🔄 Ready |
| 12 | `/referensi/jenis-publikasi` | `ref.jenis_publikasi` | int | 🔄 Ready |
| 13 | `/referensi/jenis-tes` | `ref.jenis_tes` | int | 🔄 Ready |
| 14 | `/referensi/jenis-tunjangan` | `ref.jenis_tunjangan` | int | 🔄 Ready |
| 15 | `/referensi/media-publikasi` | `ref.media_publikasi` | uuid | 🔄 Ready |
| 16 | `/referensi/skim-kegiatan` | `ref.skim_kegiatan` | uuid | 🔄 Ready |
| 17 | `/referensi/status-kepegawaian` | `ref.status_kepegawaian` | int | 🔄 Ready |
| 18 | `/referensi/sumber-gaji` | `ref.sumber_gaji` | int | 🔄 Ready |
| 19 | `/referensi/tingkat-penghargaan` | `ref.tingkat_penghargaan` | int | 🔄 Ready |
| 20 | `/referensi/wilayah` | `ref.wilayah` | string | 🔄 Ready |
| 21 | `/referensi/kategori-capaian-luaran` | `ref.kategori_capaian_luaran` | int | 🔄 Ready |
| 22 | `/referensi/kategori-kegiatan` | `ref.kategori_kegiatan` | int | 🔄 Ready |
| 23 | `/referensi/kelompok-bidang` | `ref.kelompok_bidang` | uuid | 🔄 Ready |
| 24 | `/referensi/lembaga-sertifikasi` | `ref.lembaga_sertifikasi` | int | 🔄 Ready |
| 25 | `/referensi/golongan-pangkat` | `ref.pangkat_golongan` | int | 🔄 Ready |
| 26 | `/referensi/ikatan-kerja` | `ref.ikatan_kerja_sdm` | string | 🔄 Ready |
| 27 | `/referensi/jenis-penghargaan` | `ref.jenis_penghargaan` | int | 🔄 Ready |
| 28 | `/referensi/jenis-pekerjaan` | `ref.pekerjaan` | int | 🔄 Ready |
| 29 | `/referensi/bidang-pekerjaan` | `ref.bidang_pekerjaan` | int | 🔄 Ready |

## 🚀 Quick Implementation Script

Run all generators at once:

```bash
cd tools

# Generate all code
go run generate_referensi_code.go all > ../GENERATED_CODE_OUTPUT.txt

# Or generate individually
go run generate_referensi_code.go repo-interface
go run generate_referensi_code.go repo-impl
go run generate_referensi_code.go service-interface
go run generate_referensi_code.go service-impl
go run generate_referensi_code.go controller
go run generate_referensi_code.go router
go run generate_referensi_code.go sister-api
go run generate_referensi_code.go batch-sync
```

## 📝 Implementation Checklist

- [x] Entity models created
- [x] Code generator tool created
- [ ] Repository interface updated
- [ ] Repository implementation added
- [ ] Service interface updated
- [ ] Service implementation added
- [ ] Controller methods added
- [ ] Router endpoints registered
- [ ] SISTER API client methods added
- [ ] Batch sync updated
- [ ] Compilation test passed
- [ ] Integration test dengan SISTER API
- [ ] Frontend UI updated

## 🎯 Next Steps

1. **Generate all code** using the generator tool
2. **Copy-paste** generated code to appropriate files
3. **Test compilation**: `go build`
4. **Fix** any compilation errors
5. **Test** dengan Postman/curl
6. **Update frontend** UI untuk display semua referensi

## 💡 Tips

- Generator mengikuti exact pattern yang sudah ada di Agama, Negara, dll
- Semua table sudah exist di database (verified)
- ID types sudah correct (int/string/uuid)
- Sister API endpoints sudah dimapping
