# IKU 7: Persentase Keterlibatan PT dalam SDGs

## Definisi
Persentase program/kegiatan Tri Dharma PT yang berkontribusi pada SDG 1 (Tanpa Kemiskinan), SDG 4 (Pendidikan Berkualitas), SDG 17 (Kemitraan untuk Mencapai Tujuan), dan 2 SDGs lain sesuai keunggulan PT.

## Formula

```
IKU 7 = (Kegiatan Tri Dharma berkontribusi SDG target / Total Kegiatan Tri Dharma PT) × 100
```

- **Pembilang** = Litabmas yang match keyword SDG target + seluruh kerjasama (= SDG 17)
- **Penyebut** = Total litabmas + total kerjasama

## SDGs Wajib & Pilihan

| Jenis | SDG | Label |
|-------|-----|-------|
| **Wajib** | SDG 1 | Tanpa Kemiskinan |
| **Wajib** | SDG 4 | Pendidikan Berkualitas |
| **Wajib** | SDG 17 | Kemitraan untuk Mencapai Tujuan |
| **Pilihan** | TBD | 2 SDG lain sesuai keunggulan PT (ditetapkan di Renstra) |

**Status Unila:** SDG pilihan **belum ditetapkan**. Config `sdg_pilihan` = `[]`.

## Pendekatan: Keyword Matching (Proxy)

### Mengapa Proxy?
Database PDUT **tidak memiliki** infrastruktur tagging SDG:

| Kebutuhan | Status |
|-----------|--------|
| Tabel `ref.sdg_goals` (17 SDG) | **TIDAK ADA** |
| Junction table `map_litabmas_sdg` | **TIDAK ADA** |
| `ref.tse` (Tema Sosial Ekonomi) | **ADA tapi KOSONG** (0 record) |
| `pdrd.map_abmas_tse` (junction litabmas → TSE) | **KOSONG** (0 record) |
| Kegiatan Tri Dharma | **ADA** (`pdrd.litabmas`, `kerjasama.sms_kerjasama`) |

### Cara Kerja
1. **Litabmas**: Match `judul_litabmas` (LOWER + LIKE) terhadap keyword list per SDG target
2. **Kerjasama**: Semua kerjasama otomatis = SDG 17 (Kemitraan)
3. Keywords didefinisikan di `config/iku.php` → `iku.sdg.sdg_keywords`

### Keyword List per SDG

Semua 17 SDG memiliki keyword array di config, meskipun saat ini hanya SDG wajib (1, 4, 17) + pilihan yang digunakan untuk pembilang.

| SDG | Contoh Keywords |
|-----|-----------------|
| 1 | kemiskinan, miskin, pengentasan kemiskinan, bantuan sosial, kesejahteraan sosial |
| 4 | pendidikan, pembelajaran, kurikulum, literasi, edukasi, pengajaran |
| 17 | kemitraan, kolaborasi internasional, kerjasama lembaga, transfer teknologi |

(Lihat `config/iku.php` untuk daftar lengkap semua 17 SDG.)

### Catatan TSE vs SDG
- **TSE** = Tema Sosial Ekonomi (referensi tematik PDDIKTI untuk klasifikasi litabmas)
- **SDG** = Sustainable Development Goals (17 Tujuan Pembangunan Berkelanjutan PBB)
- TSE ≠ SDG, tapi bisa jadi proxy jika datanya terisi
- Saat ini TSE kosong (0 record), sehingga tidak bisa digunakan

## Ruang Lingkup Kegiatan Tri Dharma
- **Pendidikan**: kurikulum, mata kuliah, modul, program literasi terintegrasi SDGs
- **Penelitian**: riset, publikasi, inovasi yang mendukung target SDGs
- **PkM**: pemberdayaan masyarakat, KKN tematik, pelatihan, layanan
- **Kerjasama**: kolaborasi dengan pemerintah, industri, lembaga internasional
- **Inisiatif Institusional**: kebijakan internal PT berorientasi SDGs

## Konstanta
- **Target IKU 7**: 50.0%

## Sumber Data di PDUT Database

### Tabel Utama
- `pdrd.litabmas` — Penelitian & Pengabdian (judul_litabmas, id_thn_kegiatan)
- `kerjasama.sms_kerjasama` — Detail kerjasama per prodi
- `kerjasama.mou` — MoU induk (tgl_mulai, tgl_selesai)
- `pdrd.sdm_anggota_litabmas` — Anggota litabmas (untuk filter fakultas)
- `pdrd.reg_ptk` — Registrasi dosen ke prodi
- `pdrd.sms` — Program studi (id_fak_unila)

### Tabel Referensi (Kosong/Tidak Ada)
- `ref.tse` — Tema Sosial Ekonomi (**ADA, 0 record**)
- `pdrd.map_abmas_tse` — Junction litabmas → TSE (**0 record**)

## Config

File: `backend/dashboard-service/config/iku.php`

```php
'sdg' => [
    'sdg_wajib' => [1, 4, 17],
    'sdg_pilihan' => [], // Unila belum menetapkan
    'sdg_labels' => [1 => 'Tanpa Kemiskinan', ..., 17 => 'Kemitraan untuk Mencapai Tujuan'],
    'sdg_keywords' => [
        1  => ['kemiskinan', 'miskin', ...],
        4  => ['pendidikan', 'pembelajaran', ...],
        17 => ['kemitraan', 'kolaborasi internasional', ...],
        // ... all 17 SDGs
    ],
],
```

Akses via: `config('iku.sdg.sdg_wajib')`, `config('iku.sdg.sdg_keywords')`.

## Implementasi Dashboard

### Backend Files
- `backend/dashboard-service/config/iku.php` — SDG config + target `'iku7' => ['target' => 50.0]`
- `backend/dashboard-service/app/Repositories/Dashboard/IkuRepository.php` — Methods IKU 7
- `backend/dashboard-service/app/Services/Dashboard/IkuService.php` — buildIKU7

### Repository Methods
1. `buildSdgLikeCondition(column)` — Build LIKE OR conditions untuk semua target SDG keywords
2. `buildSdgLikeForOne(column, sdgNumber)` — LIKE conditions untuk satu SDG
3. `countTotalTriDharma(years, fakultas)` — Total litabmas + kerjasama
4. `countLitabmasSDG(years, fakultas)` — Litabmas matching SDG keywords
5. `calculateIKU7(years, fakultas)` — Main calculation
6. `getSDGBreakdown(years, fakultas)` — Per-SDG counts (CASE WHEN single query + kerjasama for SDG 17)
7. `getTrendIKU7(currentYear)` — Trend 5 tahun
8. `getIKU7PerFakultas(years)` — Drilldown per fakultas
9. `getIKU7PerProdi(years, idFakultas)` — Drilldown per prodi

### API Endpoint
```
GET /api/v1/dashboard/iku?tahun=2026&fakultas=<uuid>
```

### Response Shape
```json
{
  "iku7": {
    "id": 7,
    "code": "IKU 7",
    "title": "Keterlibatan PT dalam SDGs",
    "value": 45.2,
    "target": 50.0,
    "kegiatanSDG": 500,
    "litabmasSDG": 200,
    "kerjasamaSDG": 300,
    "totalKegiatan": 1100,
    "totalLitabmas": 800,
    "totalKerjasama": 300,
    "sdgBreakdown": [
      { "sdg": 1, "name": "Tanpa Kemiskinan", "value": 50 },
      { "sdg": 4, "name": "Pendidikan Berkualitas", "value": 120 },
      { "sdg": 17, "name": "Kemitraan untuk Mencapai Tujuan", "value": 300 }
    ],
    "sdgWajib": [1, 4, 17],
    "sdgPilihan": [],
    "trendData": [...],
    "drilldownData": [...]
  }
}
```

## Frontend

### Modal Tabs
- **Rincian SDGs**: 4 summary cards, SDG breakdown table with Wajib/Pilihan chips, summary bar, methodology note
- **Formula**: Formula, SDG target cards (SDG 1/4/17), keyword matching explanation table, ketentuan

## Yang Dibutuhkan Untuk Implementasi Penuh (Nanti)
1. **Tabel referensi**: `ref.sdg_goals` (17 SDG + metadata)
2. **Tabel pilihan PT**: `config_sdg_pilihan` (2 SDG pilihan Unila dari Renstra)
3. **Junction table**: `map_litabmas_sdg` (tagging litabmas → SDG, bisa multiple)
4. **Junction table**: `map_kerjasama_sdg` (tagging kerjasama → SDG)
5. **Admin UI**: Fitur tagging kegiatan ke SDG oleh admin/operator
6. **Kebijakan kampus**: Penetapan 2 SDG pilihan Unila secara resmi

## Ketentuan
- Wajib: SDG 1, SDG 4, SDG 17
- Pilihan: 2 SDG lain sesuai keunggulan PT, ditetapkan di Renstra
- Ruang lingkup: Pendidikan, Penelitian, PkM, Kerjasama, Inisiatif Institusional
- Satu kegiatan bisa berkontribusi ke lebih dari satu SDG
- Data menggunakan **pendekatan proxy** (keyword matching) — akurasi terbatas
- Keywords berasal dari server config, bukan user input (aman untuk inline SQL)
- Indikator ini merupakan indikator **wajib** bagi semua perguruan tinggi
