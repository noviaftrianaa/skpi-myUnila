# Testing Scripts untuk Referensi API

## Overview

Dua script testing tersedia untuk menguji semua endpoint referensi API:

1. **`test_referensi_endpoints.sh`** - Quick testing dengan colored output
2. **`test_referensi_detailed.sh`** - Detailed testing dengan JSON output

## Script 1: Quick Test (`test_referensi_endpoints.sh`)

### Features
- ✅ Quick visual feedback dengan colors
- ✅ Test 3 scenarios per endpoint:
  - Basic request tanpa parameter
  - Request dengan pagination
  - Request dengan search
- ✅ Real-time progress display
- ✅ Summary statistics

### Usage

```bash
# Run the test
./test_referensi_endpoints.sh

# Or with explicit bash
bash test_referensi_endpoints.sh
```

### Output Example

```
========================================
  REFERENSI API ENDPOINT TESTING
========================================
Base URL: http://localhost:3000/api/v1/referensi
Started at: 2026-01-26 10:30:00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMMON PACKAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Testing: /semester
Description: Semester
  [1/3] Basic request... ✓ PASS (200 OK)
  [2/3] With pagination... ✓ PASS (200 OK)
  [3/3] With search... ✓ PASS (200 OK)

...

========================================
  TEST SUMMARY
========================================
Total Tests:  195
Passed:       195
Failed:       0

🎉 ALL TESTS PASSED! 🎉
```

## Script 2: Detailed Test (`test_referensi_detailed.sh`)

### Features
- 📊 Saves full JSON responses
- 📝 Generates comprehensive JSON report
- 📁 Organizes output in `test_results/` directory
- 🔍 Extracts metadata (total records, page, data count)

### Usage

```bash
# Run the test
./test_referensi_detailed.sh
```

### Output Structure

```
test_results/
├── test_report_20260126_103000.json     # Main report
├── Semester.json                         # Individual responses
├── Tahun_Ajaran.json
├── Agama.json
└── ...
```

### Report Format

```json
{
  "timestamp": "2026-01-26T10:30:00+07:00",
  "base_url": "http://localhost:3000/api/v1/referensi",
  "tests": [
    {
      "endpoint": "/semester",
      "name": "Semester",
      "status": "pass",
      "http_code": 200,
      "is_valid_json": true,
      "total_records": 50,
      "page": 1,
      "data_count": 20
    },
    ...
  ]
}
```

### View Report

```bash
# Pretty print full report
jq . test_results/test_report_*.json

# Show only failed tests
jq '.tests[] | select(.status == "fail")' test_results/test_report_*.json

# Show endpoints with data
jq '.tests[] | select(.data_count > 0) | {name, total_records}' test_results/test_report_*.json

# Count total records across all endpoints
jq '[.tests[].total_records] | add' test_results/test_report_*.json
```

## Tested Endpoints

### Common Package (33 endpoints)
- `/semester` - Semester
- `/tahun_ajaran` - Tahun Ajaran
- `/agama` - Agama
- `/wilayah` - Wilayah
- `/aktifitas_kerjasama` - Aktifitas Kerjasama
- `/basis_evaluasi` - Basis Evaluasi
- `/fungsi_lab` - Fungsi Lab
- `/gelar_akademik` - Gelar Akademik
- `/ikatan_kerja_sdm` - Ikatan Kerja SDM
- `/jalur_masuk` - Jalur Masuk
- `/jenjang_pendidikan` - Jenjang Pendidikan
- `/jenis_evaluasi` - Jenis Evaluasi
- `/jenis_keluar` - Jenis Keluar
- `/jenis_prasarana` - Jenis Prasarana
- `/jenis_substansi` - Jenis Substansi
- `/jenis_tinggal` - Jenis Tinggal
- `/jurusan` - Jurusan
- `/kbli` - KBLI
- `/keahlian_lab` - Keahlian Lab
- `/kebutuhan_khusus` - Kebutuhan Khusus
- `/kriteria_mitra` - Kriteria Mitra
- `/level_wilayah` - Level Wilayah
- `/media_publikasi` - Media Publikasi
- `/negara` - Negara
- `/nilai_akred` - Nilai Akreditasi
- `/pangkat_golongan` - Pangkat Golongan
- `/pembiayaan` - Pembiayaan
- `/penghasilan` - Penghasilan
- `/satuan` - Satuan
- `/tahun_anggaran` - Tahun Anggaran
- `/tse` - TSE
- `/skim_kegiatan` - Skim Kegiatan

### Jenis Package (13 endpoints)
- `/jenis_akt_mhs` - Jenis Aktivitas Mahasiswa
- `/jenis_beasiswa` - Jenis Beasiswa
- `/jenis_diklat` - Jenis Diklat
- `/jenis_keuangan` - Jenis Keuangan
- `/jenis_lembaga` - Jenis Lembaga
- `/jenis_pendaftaran` - Jenis Pendaftaran
- `/jenis_penghargaan` - Jenis Penghargaan
- `/jenis_prestasi` - Jenis Prestasi
- `/jenis_sarana` - Jenis Sarana
- `/jenis_sdm` - Jenis SDM
- `/jenis_sert` - Jenis Sertifikat
- `/jenis_sms` - Jenis SMS
- `/jenis_tes` - Jenis Tes

### Kategori Package (3 endpoints)
- `/kategori_kegiatan` - Kategori Kegiatan
- `/kategori_koleksi` - Kategori Koleksi
- `/kategori_tabel` - Kategori Tabel

### Kelompok Package (4 endpoints)
- `/kelompok_bidang` - Kelompok Bidang
- `/kelompok_mk` - Kelompok Mata Kuliah
- `/kelompok_profesi` - Kelompok Profesi
- `/kelompok_usaha` - Kelompok Usaha

### Lembaga Package (3 endpoints)
- `/lembaga_akred` - Lembaga Akreditasi
- `/lembaga_pengangkat` - Lembaga Pengangkat
- `/lembaga_sertifikasi` - Lembaga Sertifikasi

### Peta Package (3 endpoints)
- `/peta_katgiat_jabfung` - Peta Kategori Kegiatan Jabatan Fungsional
- `/peta_katgiat_jnsdok` - Peta Kategori Kegiatan Jenis Dokumen
- `/peta_katgiat_jnspub` - Peta Kategori Kegiatan Jenis Publikasi

### Status Package (7 endpoints)
- `/status_kepegawaian` - Status Kepegawaian
- `/status_kepemilikan` - Status Kepemilikan
- `/status_kerjasama` - Status Kerjasama
- `/status_mahasiswa` - Status Mahasiswa
- `/status_milik_sarpras` - Status Milik Sarana Prasarana
- `/status_anak` - Status Anak
- `/status_keaktifan_pegawai` - Status Keaktifan Pegawai

### Sumber Package (4 endpoints)
- `/sumber_air` - Sumber Air
- `/sumber_dana` - Sumber Dana
- `/sumber_gaji` - Sumber Gaji
- `/sumber_listrik` - Sumber Listrik

### Tingkat Package (3 endpoints)
- `/tingkat_kerjasama` - Tingkat Kerjasama
- `/tingkat_penghargaan` - Tingkat Penghargaan
- `/tingkat_prestasi` - Tingkat Prestasi

**Total: 73 endpoints**

## Prerequisites

- Running API server on `http://localhost:3000`
- `curl` installed
- `jq` installed (optional, for JSON formatting)

```bash
# Install jq (if not installed)
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq
```

## Configuration

Edit BASE_URL di script jika API berjalan di URL yang berbeda:

```bash
BASE_URL="http://localhost:3000/api/v1/referensi"
```

## CI/CD Integration

### GitLab CI

```yaml
test:endpoints:
  stage: test
  script:
    - chmod +x test_referensi_endpoints.sh
    - ./test_referensi_endpoints.sh
  only:
    - develop
    - main
```

### GitHub Actions

```yaml
- name: Test Referensi Endpoints
  run: |
    chmod +x test_referensi_endpoints.sh
    ./test_referensi_endpoints.sh
```

## Troubleshooting

### Connection Refused
```
Error: Failed to connect to localhost:3000
```
**Solution:** Pastikan API server sudah running dengan `make up` atau `docker-compose up`

### Permission Denied
```
bash: ./test_referensi_endpoints.sh: Permission denied
```
**Solution:** 
```bash
chmod +x test_referensi_endpoints.sh
```

### jq: command not found
**Solution:** Install jq atau script akan tetap berjalan tanpa pretty printing

## Advanced Usage

### Test Specific Package Only

Edit script dan comment out package yang tidak ingin di-test:

```bash
# Comment out packages
# test_endpoint "/semester" "Semester"
# test_endpoint "/tahun_ajaran" "Tahun Ajaran"
```

### Custom Parameters

Tambahkan custom query parameters:

```bash
test_endpoint "/semester?periode_aktif=1" "Semester Aktif"
```

### Performance Testing

Tambahkan timing measurement:

```bash
start_time=$(date +%s)
./test_referensi_endpoints.sh
end_time=$(date +%s)
echo "Total time: $((end_time - start_time)) seconds"
```

## Notes

- Script akan exit dengan code 0 jika semua test pass
- Script akan exit dengan code 1 jika ada test yang fail
- Test results di-cache per test run dengan timestamp
- Individual JSON responses berguna untuk debugging response format
