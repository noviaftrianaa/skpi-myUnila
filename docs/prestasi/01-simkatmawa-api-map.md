# SIMKATMAWA API Map

**Sumber:** https://documenter.getpostman.com/view/4139231/2sBXcLebzg (diakses 2026-04-19)
**Published:** 2026-03-05 oleh Kemdiktisaintek
**Base URL:** `https://simkatmawa.kemdiktisaintek.go.id`

---

## 0. Authentication

### POST `/api/login`

Dapatkan bearer token untuk dipakai di endpoint lain.

**Headers:** `Content-Type: application/json`

**Request body:**
```json
{ "email": "...", "password": "..." }
```

**Response 200:**
```json
{
  "success": true,
  "kode_pt": "999999",
  "token": "eyJ0eXA...JWT..."
}
```

**Pemakaian token di endpoint lain:**
```
Authorization: Bearer <token>
```

**Catatan:**
- Token berupa JWT (bisa di-decode untuk cek `exp`).
- TTL tidak dijelaskan dalam dokumentasi — harus diuji (login, decode exp claim).
- `kode_pt` = kode Perguruan Tinggi (untuk Unila perlu dikonfirmasi, kemungkinan `001006` atau sejenis).

---

## 1. POST `/api/prestasi-mandiri` — Buat Prestasi

Menyimpan prestasi kejuaraan mahasiswa.

### Request body (JSON)

| Field | Type | Req | Enum / format | Keterangan |
|---|---|---|---|---|
| `level` | string | ✅ | KAB / PROV / NAS / INT | Level prestasi |
| `kategori` | string | ✅ | RISNOV / RISNOVSSH / SENBUD / OLAHRAGA / MINAT | Kategori lomba |
| `lomba` | string | ✅ | — | Nama lomba/kompetisi |
| `cabang` | string | ✅ | — | Cabang/bidang lomba |
| `penyelenggara` | string | ✅ | — | Institusi penyelenggara |
| `peringkat` | string | ✅ | JUARA1 / JUARA2 / JUARA3 / HARAPAN1 / HARAPAN2 / HARAPAN3 / APRESIASI / PESERTA | — |
| `jumlah_unit_peserta` | string/int | ✅ | — | Jumlah PT (NAS) atau Negara (INT) yang ikut |
| `kelompok_prestasi` | string | ✅ | INDIVIDU / KELOMPOK | — |
| `bentuk` | string | ✅ | DARING / LURING | Mode pelaksanaan |
| `url_peserta` | string (URL) | ? | — | Link daftar peserta/kejuaraan |
| `url_sertifikat` | string (URL) | ? | — | Link sertifikat (PDF/image) |
| `tgl_sertifikat` | date | ✅ | `YYYY-MM-DD` | — |
| `url_foto_upp` | string (URL) | ? | — | Foto kegiatan / UPP |
| `url_dokumen_undangan` | string (URL) | ? | — | Undangan / dokumen pendukung |
| `keterangan` | string | ? | — | Catatan tambahan |
| `mahasiswa` | array | ✅ | — | List mahasiswa yang ikut |
| `mahasiswa[].nim` | string | ✅ | — | NIM |
| `mahasiswa[].nama` | string | ✅ | — | Nama lengkap |
| `dosen` | array | ? | — | List dosen pendamping/pembimbing |
| `dosen[].nuptk` | string | ✅* | — | NUPTK/NIDN |
| `dosen[].nama` | string | ✅* | — | Nama dosen |
| `dosen[].url_surat_tugas` | string (URL) | ✅* | — | Link surat tugas |

\* wajib jika array `dosen` diisi.

### Enum — Kategori prestasi

| Kode | Arti |
|---|---|
| RISNOV | Riset dan Inovasi STEM |
| RISNOVSSH | Riset dan Inovasi SSH |
| SENBUD | Seni dan Budaya |
| OLAHRAGA | Olahraga |
| MINAT | Minat Khusus |

### Enum — Peringkat

| Kode | Arti |
|---|---|
| JUARA1..3 | Juara 1/2/3 |
| HARAPAN1..3 | Harapan 1/2/3 |
| APRESIASI | Apresiasi / Penghargaan Tambahan / Juara Umum |
| PESERTA | Peserta |

### Enum — Level

| Kode | Arti |
|---|---|
| KAB | Kabupaten |
| PROV | Provinsi |
| NAS | Nasional |
| INT | Internasional |

### Response 200

```json
{
  "status": true,
  "message": "Prestasi berhasil disimpan",
  "data": {
    "level": "NAS",
    "kategori": "RISNOV",
    "lomba": "...",
    "cabang": "...",
    "peringkat": "JUARA1",
    "bentuk": "DARING",
    "kelompok_prestasi": "KELOMPOK",
    "penyelenggara": "...",
    "keterangan": "...",
    "jumlah_unit_peserta": "3",
    "url_peserta": "...",
    "url_sertifikat": "...",
    "tgl_sertifikat": "2025-05-01",
    "url_foto_upp": "...",
    "url_dokumen_undangan": "...",
    "kode_pt": "000000",
    "tahun": "2026",
    "updated_at": "...Z",
    "created_at": "...Z",
    "id": 518023
  }
}
```

**ID SIMKATMAWA** (`data.id`) — ini yang perlu kita simpan lokal sebagai `id_simkatmawa` untuk tracking.

---

## 2. POST `/api/sertifikasi` — Buat Sertifikasi

### Request body (JSON)

| Field | Type | Req | Keterangan |
|---|---|---|---|
| `level` | string | ✅ | KAB/PROV/NAS/INT |
| `nama` | string | ✅ | Nama sertifikasi (bukan `lomba`) |
| `penyelenggara` | string | ✅ | — |
| `url_peserta` | URL | ? | — |
| `url_sertifikat` | URL | ? | — |
| `tgl_sertifikat` | date | ✅ | — |
| `url_foto_upp` | URL | ? | — |
| `url_dokumen_undangan` | URL | ? | — |
| `keterangan` | string | ? | — |
| `mahasiswa[]` | array | ✅ | {nim, nama} |
| `dosen[]` | array | ? | {nuptk, nama, url_surat_tugas} |

Tidak punya: kategori, peringkat, kelompok_prestasi, bentuk, jumlah_unit_peserta.

### Response: sama bentuk dengan `/prestasi-mandiri` (data berisi echo input + `id`, `kode_pt`, `tahun`).

---

## 3. POST `/api/rekognisi` — Buat Rekognisi

### Request body (JSON)

| Field | Type | Req | Enum | Keterangan |
|---|---|---|---|---|
| `level` | string | ✅ | KAB/PROV/NAS/INT | |
| `nama` | string | ✅ | — | Nama rekognisi |
| `jenis` | string | ✅ | lihat tabel | Jenis rekognisi |
| `penyelenggara` | string | ✅ | — | |
| `url_peserta` | URL | ? | — | |
| `url_sertifikat` | URL | ? | — | |
| `tgl_sertifikat` | date | ✅ | `YYYY-MM-DD` | |
| `url_foto_upp` | URL | ? | — | |
| `url_dokumen_undangan` | URL | ? | — | |
| `keterangan` | string | ? | — | |
| `mahasiswa[]` | array | ✅ | — | {nim, nama} |
| `dosen[]` | array | ? | — | {nuptk, nama, url_surat_tugas} |

### Enum — Jenis rekognisi

| Kode | Arti |
|---|---|
| SERKOM | Sertifikat Kompetensi |
| JURIOR | Juri/Pelatih/Wasit Olahraga |
| JURINOR | Juri/Pelatih/Wasit Non Olahraga |
| KEYCONF | Keynote speaker conference |
| KEYWORK | Keynote speaker workshop/pelatihan/bimbingan teknis |
| PAMERAN | Pameran karya seni |
| KARYA | Karya cipta lagu dan/atau seni tari |
| BUKU | Penulis buku |
| PATEN | Paten / Paten Sederhana |
| PUB | Publikasi artikel ilmiah |
| DUTA | Duta (Brand Ambassador) |
| PTG | Produk Teknologi Tepat Guna |
| PSB | Produk Seni dan Budaya |
| PKD | Produk Kreatif Dunia Usaha dan Industri |

---

## Probe hasil (2026-04-19) — konfirmasi API hanya POST

Selain dokumentasi Postman, kami probe langsung (tanpa auth) untuk memastikan tidak ada endpoint tersembunyi. Hasil:

| Method + Path | HTTP | Arti |
|---|---|---|
| GET /api/prestasi-mandiri | 405 | "The GET method is not supported for route api/prestasi-mandiri. **Supported methods: POST.**" |
| PUT/PATCH/DELETE /api/prestasi-mandiri | 405 | sama, Laravel kasih tahu POST saja |
| GET /api/sertifikasi | 405 | Supported methods: POST |
| GET /api/rekognisi | 405 | Supported methods: POST |
| GET /api/login | 405 | Supported methods: POST |
| OPTIONS /api/prestasi-mandiri | 200 | response kosong, tidak ada CORS hint |
| POST /api/prestasi-mandiri/1 | 404 | tidak ada detail route |
| GET /api/prestasi, /api/v1/prestasi-mandiri, /api/mahasiswa, /api/dosen, /api/daftar-prestasi, /api/data/prestasi, /api/kode-pt, /api/rekap, /api/riwayat, /api/laporan, /api/statistik, dll | 404 | route tidak terdaftar |
| POST /api/prestasi-mandiri + Bearer invalid | 401 | "Unauthenticated" (Laravel Sanctum pattern) |
| POST /api/login (body kosong) | 422 | `{"email":["required"],"password":["required"]}` |

**Kesimpulan probe:** SIMKATMAWA API publik hanya punya **4 route**:
- `POST /api/login`
- `POST /api/prestasi-mandiri`
- `POST /api/sertifikasi`
- `POST /api/rekognisi`

Karena Laravel (framework-nya) memberikan 405 yang eksplisit menyebut semua method yang didukung di tiap route terdaftar, kalau ada GET hidden pasti ketahuan dari error. 404 di path lain menandakan route-nya memang tidak ada sama sekali.

**Implikasi:** Tidak perlu terus tebak endpoint tersembunyi. Phase 3 (pull dari SIMKATMAWA) benar-benar blocked sampai DIKTI expose GET endpoint baru.

---

## Observasi & gap dokumentasi

1. **Tidak ada endpoint GET/LIST/DETAIL/UPDATE/DELETE** di Postman collection v1 (konfirmasi via probe langsung di atas).
   Tanpa GET, kita tidak bisa:
   - Verifikasi data yang sudah dikirim ada di SIMKATMAWA
   - Sync ulang kalau ID lokal hilang
   - Pull data yang di-submit perguruan tinggi lain (tidak masalah, itu bukan wewenang kita)
2. **Tidak ada dokumentasi rate limit** — asumsikan ada, implement retry+backoff konservatif (misal max 60 req/menit).
3. **Tidak ada idempotency key** — kalau request timeout, re-send bisa duplikat. Mitigation: simpan state `sending` lalu verifikasi manual / skip re-send otomatis.
4. **URL fields** berupa plain URL eksternal, bukan upload multipart. Artinya kita **harus host file sendiri** dan kirim URL publik ke SIMKATMAWA. Implikasi: butuh storage publik (CDN / MinIO public bucket / nginx static) + perhatian ke retensi + akses terbatas (jangan expose dokumen pribadi).
5. **`tgl_sertifikat` format `YYYY-MM-DD`** — pastikan timezone Jakarta (tidak ada offset di field).
6. **`jumlah_unit_peserta`** field naming membingungkan — untuk NAS = jumlah PT, untuk INT = jumlah negara, untuk PROV/KAB tidak dijelaskan. Asumsikan jumlah PT di level lokal.
7. **Duplikat field antar endpoint**: prestasi-mandiri pakai `lomba` & `cabang`, sertifikasi/rekognisi pakai `nama`. Schema lokal harus mengakomodir semuanya tapi per-tipe.
