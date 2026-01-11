# API Dokumentasi - Publikasi & Penelitian

## Base URL
```
http://localhost:9800/dashboard-service/public/api/v1
```

## Endpoints

### 1. Publikasi Statistics

Mendapatkan statistik publikasi dosen Universitas Lampung

**Endpoint:** `GET /publikasi/statistics`

**Response:**
```json
{
  "success": true,
  "message": "Data statistik publikasi berhasil diambil",
  "data": {
    "total": 1250,
    "by_jenis": [
      {
        "jenis": "Jurnal internasional bereputasi",
        "jumlah": 450
      },
      {
        "jenis": "Jurnal nasional terakreditasi",
        "jumlah": 320
      },
      {
        "jenis": "Jurnal internasional",
        "jumlah": 180
      }
    ],
    "by_year": [
      {
        "tahun": 2024,
        "jumlah": 320
      },
      {
        "tahun": 2023,
        "jumlah": 285
      },
      {
        "tahun": 2022,
        "jumlah": 240
      }
    ]
  }
}
```

**Query Logic:**
- Mengambil data publikasi dari tabel `pdrd.publikasi`
- Join dengan `pdrd.tulis_pub` untuk mendapatkan penulis
- Filter hanya dosen aktif di Universitas Lampung
- Grouping berdasarkan jenis publikasi dan tahun terbit
- Menghindari duplikasi dengan `DISTINCT id_publikasi`

**Relasi Database:**
```
pdrd.publikasi
  -> pdrd.tulis_pub (id_publikasi)
  -> pdrd.sdm (id_sdm)
  -> pdrd.reg_ptk (id_sdm) [filter: aktif di Unila]
  -> ref.jenis_publikasi (id_jns_pub)
```

---

### 2. Penelitian Statistics

Mendapatkan statistik penelitian dosen Universitas Lampung (tidak termasuk pengabdian masyarakat)

**Endpoint:** `GET /penelitian/statistics`

**Response:**
```json
{
  "success": true,
  "message": "Data statistik penelitian berhasil diambil",
  "data": {
    "total": 850,
    "by_kategori": [
      {
        "kategori": "Penelitian Fundamental",
        "jumlah": 250
      },
      {
        "kategori": "Penelitian Terapan",
        "jumlah": 180
      },
      {
        "kategori": "Penelitian Kompetitif Nasional",
        "jumlah": 120
      }
    ],
    "by_year": [
      {
        "tahun": 2024,
        "jumlah": 180
      },
      {
        "tahun": 2023,
        "jumlah": 165
      },
      {
        "tahun": 2022,
        "jumlah": 150
      }
    ]
  }
}
```

**Query Logic:**
- Mengambil data penelitian dari tabel `pdrd.litabmas`
- Filter hanya yang `jns_litabmas = 'P'` (Penelitian, bukan Pengabdian 'M')
- Join dengan `pdrd.sdm_anggota_litabmas` untuk mendapatkan anggota peneliti
- Filter hanya dosen aktif di Universitas Lampung
- Grouping berdasarkan skim kegiatan dan tahun kegiatan
- Menghindari duplikasi dengan `DISTINCT id_litabmas`

**Relasi Database:**
```
pdrd.litabmas [jns_litabmas = 'P']
  -> pdrd.sdm_anggota_litabmas (id_litabmas)
  -> pdrd.sdm (id_sdm)
  -> pdrd.reg_ptk (id_sdm) [filter: aktif di Unila]
  -> ref.skim_kegiatan (id_skim)
```

---

## Error Response

Jika terjadi error, API akan mengembalikan response:

```json
{
  "success": false,
  "message": "Gagal mengambil data statistik publikasi/penelitian",
  "error": "Error message detail"
}
```

**Status Code:** `500 Internal Server Error`

---

## Catatan Implementasi

### Filter Dosen Aktif
Semua query menggunakan filter yang sama untuk memastikan hanya dosen aktif di Unila:
- `pdrd.sdm.id_jns_sdm = '12'` - Jenis SDM adalah Dosen
- `pdrd.reg_ptk.id_jns_keluar IS NULL` - Belum keluar/resign
- `pdrd.reg_ptk.id_sp = UNILA_ID_SP` - Terdaftar di Universitas Lampung
- `pdrd.sms.stat_prodi = 'A'` - Program studi masih aktif
- Jenjang pendidikan D% atau S% (tidak termasuk jenjang lain seperti profesi dll)

### Menghindari Duplikasi Data
- **Publikasi**: Menggunakan `COUNT(DISTINCT p.id_publikasi)` karena 1 publikasi bisa memiliki banyak penulis
- **Penelitian**: Menggunakan `COUNT(DISTINCT l.id_litabmas)` karena 1 penelitian bisa memiliki banyak anggota (ketua + anggota)

### Kategori
- **Jenis Publikasi**: Diambil dari referensi `ref.jenis_publikasi` (Jurnal internasional bereputasi, Jurnal nasional terakreditasi, dll)
- **Skim Penelitian**: Diambil dari referensi `ref.skim_kegiatan` (Penelitian Fundamental, Penelitian Terapan, dll)

---

## Testing

### Menggunakan curl:

**Publikasi:**
```bash
curl -s "http://localhost:9800/dashboard-service/public/api/v1/publikasi/statistics" | python -m json.tool
```

**Penelitian:**
```bash
curl -s "http://localhost:9800/dashboard-service/public/api/v1/penelitian/statistics" | python -m json.tool
```

---

## File Structure

```
backend/dashboard-service/
├── app/
│   ├── Repositories/
│   │   ├── PublikasiRepository.php   # Query logic untuk publikasi
│   │   └── PenelitianRepository.php  # Query logic untuk penelitian
│   ├── Services/
│   │   ├── PublikasiService.php      # Business logic publikasi
│   │   └── PenelitianService.php     # Business logic penelitian
│   └── Http/
│       └── Controllers/
│           └── OpenApi/
│               ├── PublikasiController.php   # API endpoint publikasi
│               └── PenelitianController.php  # API endpoint penelitian
└── routes/
    └── api.php                        # Route definitions
```
