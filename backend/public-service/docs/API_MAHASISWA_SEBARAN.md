# API Mahasiswa Sebaran

Endpoint untuk mendapatkan data sebaran mahasiswa berdasarkan wilayah asal (kabupaten/kota dan provinsi).

## Base URL
```
http://localhost:9800/dashboard-service/public/api/v1
```

## Endpoints

### 1. Get Sebaran Mahasiswa by Kabupaten

**GET** `/mahasiswa-sebaran/kabupaten`

Mendapatkan data sebaran mahasiswa per kabupaten/kota (top 100).

**Response:**
```json
{
  "success": true,
  "message": "Data sebaran mahasiswa per kabupaten berhasil diambil",
  "data": {
    "data": [
      {
        "id_kabupaten": "1260",
        "nama_kabupaten": "Kabupaten 1260",
        "jumlah_mahasiswa": 737,
        "persentase": 21.93
      }
    ],
    "total_mahasiswa": 3360,
    "jumlah_kabupaten": 100
  }
}
```

### 2. Get Sebaran Mahasiswa by Provinsi

**GET** `/mahasiswa-sebaran/provinsi`

Mendapatkan data sebaran mahasiswa per provinsi.

**Response:**
```json
{
  "success": true,
  "message": "Data sebaran mahasiswa per provinsi berhasil diambil",
  "data": {
    "data": [
      {
        "id_provinsi": "12",
        "nama_provinsi": "Sumatera Utara",
        "jumlah_mahasiswa": 2719,
        "persentase": 80.93
      }
    ],
    "total_mahasiswa": 3360,
    "jumlah_provinsi": 23
  }
}
```

### 3. Get Sebaran Statistics (Combined)

**GET** `/mahasiswa-sebaran/statistics`

Mendapatkan statistik gabungan sebaran mahasiswa (provinsi + kabupaten + statistik).

**Response:**
```json
{
  "success": true,
  "message": "Data statistik sebaran mahasiswa berhasil diambil",
  "data": {
    "provinsi": {
      "data": [...],
      "total_mahasiswa": 3360,
      "jumlah_provinsi": 23
    },
    "kabupaten": {
      "data": [...],
      "total_mahasiswa": 3360,
      "jumlah_kabupaten": 100
    },
    "statistics": {
      "mahasiswa_lokal_persen": 80.9,
      "mahasiswa_luar_daerah_persen": 19.1,
      "total_provinsi": 23,
      "total_kabupaten": 100
    }
  }
}
```

## Data Source

- **Table:** `pdrd.peserta_didik`, `pdrd.reg_pd`, `ref.wilayah`
- **Filters:**
  - Mahasiswa aktif: `id_stat_mhs = 'A'`
  - Soft delete: `soft_delete = 0`
  - Wilayah valid: exclude `9999`, `0000`, `null`

## Caching

- **Duration:** 3600 seconds (1 hour)
- **Cache Key:**
  - Kabupaten: `mahasiswa_sebaran_kabupaten`
  - Provinsi: `mahasiswa_sebaran_provinsi`

## Implementation Files

### Backend
- **Repository:** `app/Repositories/MahasiswaSebaranRepository.php`
- **Service:** `app/Services/MahasiswaSebaranService.php`
- **Controller:** `app/Http/Controllers/OpenApi/MahasiswaSebaranController.php`
- **Routes:** `routes/api.php` (line 75-79)

### Frontend
- **Service:** `src/lib/services/mahasiswaSebaranService.ts`
- **Component:** `src/shared/components/SebaranMahasiswa.tsx`
- **Page:** `src/app/(public)/statistik/page.tsx`

## Notes

- Data kabupaten/kota diambil dari 4 digit pertama kode wilayah
- Data provinsi diambil dari 2 digit pertama kode wilayah atau dihitung dari aggregasi kabupaten
- Jika nama wilayah tidak ditemukan di tabel `ref.wilayah`, akan menggunakan fallback "Kabupaten [kode]"
