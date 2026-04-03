# IKU 5: Rasio Luaran Hasil Kerjasama Mitra

## Definisi
Rasio jumlah luaran hasil kerjasama PT dan start-up/industri/lembaga terhadap total dosen PT. Mengukur produktivitas kerjasama yang menghasilkan output nyata (produk barang, jasa, atau prestasi/penghargaan).

## Formula

```
IKU 5 = (Jumlah Luaran Kerjasama / Total Dosen PT) × 100
```

- **Pembilang** = Jumlah `sms_kerjasama` yang memiliki luaran (output non-kosong)
- **Penyebut** = Total dosen aktif PT (id_jns_sdm = 12, belum keluar)

## Kriteria Luaran

Sebuah `sms_kerjasama` dianggap memiliki luaran jika **salah satu** dari kondisi berikut terpenuhi:

| Kolom | Kondisi |
|-------|---------|
| `hsl_prod_brg` | IS NOT NULL AND <> '' |
| `hsl_prod_jasa` | IS NOT NULL AND <> '' |
| `prestasi_penghargaan` | IS NOT NULL AND <> '' |

## Kategori Luaran (Panduan Resmi)

Panduan IKU 5 mendefinisikan 3 kategori luaran:

| Kategori | Kode | Deskripsi |
|----------|------|-----------|
| Karya Tulis Ilmiah | 5a | Studi kasus kolaborasi, artikel ilmiah bersama |
| Karya Terapan | 5b | Produk/invensi hasil kolaborasi (prototipe, aplikasi, dll) |
| Karya Seni | 5c | Visual/audio/pertunjukan kolaborasi |

**Catatan:** Tabel `sms_kerjasama` tidak memiliki mapping langsung ke kategori ini. Keputusan: **pakai data apa adanya** — hitung semua sms_kerjasama yang punya luaran.

## Filter Tahun

MoU aktif pada tahun filter menggunakan **overlap**:
```
m.tgl_mulai <= '{maxYear}-12-31' AND m.tgl_selesai >= '{minYear}-01-01'
```

## Konstanta
- **Target IKU 5**: 100.0 (rasio × 100, sehingga target = 1 luaran per dosen)

## Sumber Data di PDUT Database

### Tabel Utama
- `kerjasama.sms_kerjasama` — Detail kerjasama per prodi (luaran, besaran, omzet)
- `kerjasama.mou` — MoU induk (tgl_mulai, tgl_selesai, id_akt_kerjasama)
- `pdrd.sms` — Program studi (id_fak_unila, stat_prodi)
- `pdrd.sdm` — Data SDM (id_jns_sdm = 12 untuk dosen)
- `pdrd.reg_ptk` — Registrasi dosen ke prodi (id_jns_keluar IS NULL = aktif)

### Tabel Referensi
- `ref.aktifitas_kerjasama` — Jenis aktivitas (nm_akt_kerjasama)
- `ref.bentuk_kegiatan_kerjasama` — Bentuk kegiatan
- `ref.bidang_kerjasama` — Bidang kerjasama
- `ref.tingkat_kerjasama` — Tingkat: lokal/nasional/internasional
- `ref.kriteria_mitra` — Kriteria mitra
- `ref.status_kerjasama` — Status kerjasama

### Kolom Penting di `kerjasama.sms_kerjasama`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `hsl_prod_brg` | varchar(200) | Hasil produk barang |
| `hsl_prod_jasa` | varchar(200) | Hasil produk jasa |
| `prestasi_penghargaan` | varchar(200) | Prestasi/penghargaan |
| `omzet_barang_per_bulan` | numeric(16,2) | Omzet barang bulanan |
| `omzet_jasa_per_bulan` | numeric(16,2) | Omzet jasa bulanan |
| `besaran_kerjasama` | numeric(16,2) | Nilai kerjasama |

## Implementasi Dashboard

### Backend Files
- `backend/dashboard-service/config/iku.php` — Target: `'iku5' => ['target' => 100.0]`
- `backend/dashboard-service/app/Repositories/Dashboard/IkuRepository.php` — Methods IKU 5
- `backend/dashboard-service/app/Services/Dashboard/IkuService.php` — buildIKU5

### Repository Methods
1. `buildMouYearOverlap(years, &bindings)` — Helper filter MoU overlap tahun
2. `countLuaranKerjasama(years, fakultas)` — Pembilang: COUNT DISTINCT sms_kerjasama dengan luaran
3. `countTotalDosenIKU5(fakultas)` — Penyebut: COUNT DISTINCT dosen aktif
4. `calculateIKU5(years, fakultas)` — Hitung rasio
5. `getIKU5Breakdown(years, fakultas)` — Breakdown per aktivitas kerjasama
6. `getIKU5PerFakultas(years)` — Drilldown per fakultas
7. `getIKU5PerProdi(years, idFakultas)` — Drilldown per prodi
8. `getTrendIKU5(currentYear)` — Trend 5 tahun

### API Endpoint
```
GET /api/v1/dashboard/iku?tahun=2026&fakultas=<uuid>
```

### Response Shape
```json
{
  "iku5": {
    "id": 5,
    "code": "IKU 5",
    "title": "Rasio Luaran Hasil Kerjasama Mitra",
    "value": 12.5,
    "target": 100.0,
    "totalLuaran": 150,
    "totalDosen": 1200,
    "kerjasamaBreakdown": [
      { "name": "Pendidikan", "value": 50 },
      { "name": "Penelitian", "value": 40 }
    ],
    "trendData": [...],
    "drilldownData": [...]
  }
}
```

## Frontend

### Modal Tabs
- **Rincian Kerjasama**: Summary cards (Total Luaran, Total Dosen, Rasio) + breakdown table per aktivitas + summary footer
- **Formula**: Formula, kriteria luaran, kategori resmi (5a/5b/5c), filter MoU, ketentuan

## Ketentuan
- Hanya kerjasama dengan MoU aktif (overlap tahun filter) yang dihitung
- Luaran dihitung per `sms_kerjasama` (bukan per MoU)
- Dosen yang dihitung: jenis SDM = 12 (Dosen), belum keluar (id_jns_keluar IS NULL)
- Indikator ini merupakan indikator **wajib** bagi semua perguruan tinggi
