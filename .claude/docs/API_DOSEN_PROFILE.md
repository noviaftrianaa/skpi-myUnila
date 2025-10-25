# API Documentation - Dosen Profile

## Base URL
```
http://localhost:9800/dashboard-service/public/api/v1
```

## Endpoints

### 1. Get Dosen Profile
Mendapatkan profil lengkap dosen berdasarkan encrypted ID.

**Endpoint:** `GET /dosen/{id}`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (path) | Yes | Encrypted dosen ID (from list dosen) |

**Response Success (200):**
```json
{
  "success": true,
  "message": "Dosen profile retrieved successfully",
  "data": {
    "id": "eyJpdiI6IkpqZU5rRTVHY2VGN...",
    "id_sdm": "ABC123-DEF456-GHI789",
    "nama": "Dr. Ir. Budi Santoso, M.T.",
    "nidn": "0012345678",
    "nip": "198501012010121001",
    "email": "budi.santoso@eng.unila.ac.id",
    "jenis_kelamin": "L",
    "homebase": {
      "fakultas": "Fakultas Teknik",
      "jurusan": "Teknik Elektro",
      "prodi": "Teknik Elektro",
      "jenjang": "S1"
    },
    "riwayat_pendidikan": [
      {
        "jenjang": "S3 - Doktor",
        "program_studi": "Teknik Elektro",
        "universitas": "Institut Teknologi Bandung",
        "tahun_lulus": 2015
      },
      {
        "jenjang": "S2 - Magister",
        "program_studi": "Teknik Elektro",
        "universitas": "Institut Teknologi Bandung",
        "tahun_lulus": 2008
      }
    ],
    "riwayat_pengajaran": [
      {
        "tahun_ajaran": "2024/2025 Ganjil",
        "mata_kuliah": "Sistem Kendali Digital",
        "program_studi": "Teknik Elektro (S1)",
        "sks": 3
      },
      {
        "tahun_ajaran": "2024/2025 Ganjil",
        "mata_kuliah": "Robotika",
        "program_studi": "Teknik Elektro (S1)",
        "sks": 3
      }
    ],
    "penelitian_pengabdian": [
      {
        "tahun": 2024,
        "judul": "IoT-Based Smart Agriculture Monitoring System Using LoRa Technology",
        "jenis": "Penelitian",
        "skema": "Penelitian Dasar",
        "status": "Berjalan"
      },
      {
        "tahun": 2023,
        "judul": "Implementasi Teknologi IoT untuk Monitoring Kualitas Air Sungai",
        "jenis": "Pengabdian",
        "skema": "Pengabdian Kepada Masyarakat",
        "status": "Selesai"
      }
    ],
    "publikasi": {
      "jurnal": [
        {
          "tahun": 2024,
          "judul": "IoT-Based Smart Agriculture Monitoring System Using LoRa Technology",
          "nama_jurnal": "International Journal of Advanced Computer Science and Applications",
          "issn": "2158-107X",
          "quartile": "Q2"
        }
      ],
      "haki": [
        {
          "tahun": 2024,
          "judul": "Sistem Monitoring Pertanian Berbasis IoT",
          "jenis": "Hak Cipta Program Komputer",
          "nomor_pendaftaran": "EC00202401234"
        }
      ],
      "paten": [],
      "buku": [
        {
          "tahun": 2023,
          "judul": "Pengenalan Sistem Kendali Modern",
          "penerbit": "Penerbit Unila",
          "isbn": "978-602-1234-56-7"
        }
      ]
    },
    "statistics": {
      "total_penelitian": 2,
      "total_pengabdian": 1,
      "total_publikasi": 4,
      "total_mata_kuliah": 3
    }
  }
}
```

**Response Error - Invalid ID (400):**
```json
{
  "success": false,
  "message": "Invalid dosen ID",
  "data": null
}
```

**Response Error - Not Found (404):**
```json
{
  "success": false,
  "message": "Dosen not found",
  "data": null
}
```

## Data Flow

### 1. Getting Encrypted ID
Encrypted ID didapatkan dari endpoint Program Studi:

```
GET /program-studi/{id}/dosen
```

Response akan memberikan list dosen dengan encrypted ID:
```json
{
  "data": {
    "dosen": [
      {
        "encrypted_id": "eyJpdiI6...",
        "nama": "Dr. Ir. Budi Santoso, M.T.",
        ...
      }
    ]
  }
}
```

### 2. Using Encrypted ID
Gunakan `encrypted_id` tersebut untuk mendapatkan profil lengkap:

```
GET /dosen/eyJpdiI6...
```

## Frontend Integration Example

### React/Next.js
```typescript
import { dashboardService } from '@/lib/services/dashboardService';

// Get encrypted ID from dosen list
const { data } = await dashboardService.getDosenByProgramStudi(prodiId);
const encryptedId = data.dosen[0].encrypted_id;

// Get dosen profile
const profile = await dashboardService.getDosenProfile(encryptedId);

console.log(profile.data.nama);
console.log(profile.data.statistics);
```

## Database Tables Used

### Main Query
- `pdrd.sdm` - Data dosen utama
- `pdrd.sms` - Homebase (program studi)
- `ref.jenjang_pendidikan` - Jenjang pendidikan

### Riwayat Pendidikan
- `pdrd.riwayat_pendidikan_formal`
- `ref.jenjang_pendidikan`
- `ref.perguruan_tinggi`

### Riwayat Pengajaran
- `pdrd.ajar_dosen`
- `pdrd.kelas_kuliah`
- `pdrd.matakuliah`
- `ref.semester`

### Penelitian & Pengabdian
- `pdrd.sdm_anggota_litabmas`
- `pdrd.litabmas`
- `ref.skim_kegiatan`

### Publikasi
- `pdrd.tulis_pub`
- `pdrd.publikasi`
  - `id_jns_pub = 1` → Jurnal
  - `id_jns_pub = 2` → Buku
  - `id_jns_pub = 3` → HaKI
  - `id_jns_pub = 4` → Paten

## Notes

1. **ID Encryption**: Semua ID dosen di-encrypt menggunakan Laravel Crypt untuk keamanan
2. **Soft Delete**: Semua query memfilter `soft_delete = 0`
3. **Ordering**: Data diurutkan berdasarkan tahun (DESC) untuk menampilkan yang terbaru
4. **Statistics**: Statistics dihitung otomatis dari jumlah data aktual
5. **Null Handling**: Field yang kosong di-handle dengan default value atau dikembalikan sebagai empty array

## Testing

### Using cURL
```bash
# Replace {encrypted_id} with actual encrypted ID from dosen list
curl -X GET "http://localhost:9800/dashboard-service/public/api/v1/dosen/{encrypted_id}"
```

### Expected Response Time
- Profile retrieval: < 500ms
- Including all related data: < 1s

## Error Handling

| Error Code | Description | Solution |
|------------|-------------|----------|
| 400 | Invalid encrypted ID | Check encrypted ID format |
| 404 | Dosen not found | Verify dosen exists in database |
| 500 | Server error | Check database connection and logs |

## Changelog

### Version 1.0.0 (2025-01-25)
- Initial release
- Complete dosen profile with all related data
- Encrypted ID support
- Statistics calculation
