# IKU 9: Persentase Pendapatan Non Pendidikan / Non-UKT

## Definisi
Persentase pendapatan PT dari sumber selain biaya pendidikan mahasiswa (SPP/UKT), meliputi dana riset, kerjasama industri, royalti paten, komersialisasi inovasi, jasa konsultasi, pengelolaan aset, dan pendapatan operasional lainnya.

## Formula

```
IKU 9 = (Pendapatan Non Mahasiswa / Total Pendapatan PT) × 100
```

- **Pendapatan Mahasiswa (A)** = Total UKT/SPP
- **Pendapatan Non-Mahasiswa (B)** = Dana Litabmas + Kerjasama + Biaya Operasional (Pemasukan)
- **Total Pendapatan** = A + B

## Singkatan & Istilah

| Singkatan | Kepanjangan | Keterangan |
|-----------|-------------|------------|
| UKT | Uang Kuliah Tunggal | Biaya kuliah per semester (K1-K8) |
| SPP | Sumbangan Pembinaan Pendidikan | Istilah lama untuk biaya pendidikan |
| SIMPEDAM | Sistem Pembayaran Mahasiswa | Sistem billing UKT terintegrasi bank |
| BPK | Badan Pemeriksa Keuangan | Auditor keuangan negara |
| WTP | Wajar Tanpa Pengecualian | Opini audit terbaik dari BPK |
| HKI | Hak Kekayaan Intelektual | Paten, hak cipta, merek dagang, dll |

## Sumber Data & Pendekatan Proxy

Tidak tersedia tabel "total pendapatan PT" yang komprehensif. Data digabungkan dari sumber yang tersedia:

### Pendapatan Mahasiswa (A)

| Tabel | Query | Keterangan |
|-------|-------|------------|
| `keuangan.spp_mhs` | `SUM(nominal)` | Filter: `LEFT(id_smt, 4) IN (years)` |

### Pendapatan Non-Mahasiswa (B) — 3 Sumber

| Komponen | Tabel | Query | Keterangan |
|----------|-------|-------|------------|
| B1: Dana Riset | `pdrd.litabmas` | `SUM(dana_dikti + dana_pt + dana_institusi_lain)` | Filter: `id_thn_kegiatan IN (years)` |
| B2: Kerjasama | `kerjasama.sms_kerjasama` | `SUM(besaran_kerjasama)` | Filter: MoU overlap tahun, besaran > 0 |
| B3: Operasional | `keuangan.biaya_operasional` | `SUM(total_biaya)` | Filter: `jenis_keuangan.a_pemasukan = 1`, **bisa kosong** |

### Catatan Data
- `ref.jenis_keuangan` dan `keuangan.biaya_operasional` **mungkin kosong** — jika kosong, hanya pakai litabmas + kerjasama
- `besaran_kerjasama` bisa NULL atau 0 untuk banyak record — hanya hitung yang > 0
- Dana litabmas: `dana_dikti`, `dana_pt`, `dana_institusi_lain` dijumlahkan (sumber berbeda, bukan overlap)

## Yang Termasuk Pendapatan Non-Mahasiswa
- Hibah riset, kontrak riset industri
- Royalti paten, komersialisasi inovasi
- Jasa konsultasi, pelatihan, sertifikasi
- Joint program, layanan lab/RS
- Pengelolaan aset, koperasi, kantin, penerbitan

## Yang Tidak Termasuk
- SPP/UKT (pendapatan mahasiswa)
- Subsidi pemerintah (block grant)
- Sumbangan/filantropi di luar laporan keuangan

## Konstanta
- **Target IKU 9**: 40.0%

## Sumber Data di PDUT Database

### Tabel Utama
- `keuangan.spp_mhs` — Pembayaran UKT/SPP mahasiswa (nominal, id_smt, id_reg_pd)
- `pdrd.litabmas` — Penelitian & PkM (dana_dikti, dana_pt, dana_institusi_lain)
- `kerjasama.sms_kerjasama` — Detail kerjasama (besaran_kerjasama)
- `kerjasama.mou` — MoU induk (tgl_mulai, tgl_selesai)
- `keuangan.biaya_operasional` — Biaya operasional (total_biaya, id_tahun_anggaran)
- `ref.jenis_keuangan` — Kategori keuangan (a_pemasukan flag)

### Tabel Pendukung (untuk drilldown per fakultas/prodi)
- `pdrd.reg_pd` — Registrasi mahasiswa ke prodi (untuk UKT per fak)
- `pdrd.sdm_anggota_litabmas` — Anggota litabmas (untuk litabmas per fak)
- `pdrd.reg_ptk` — Registrasi dosen ke prodi
- `pdrd.sms` — Program studi (id_fak_unila)

## Implementasi Dashboard

### Backend Files
- `backend/dashboard-service/config/iku.php` — Target: `'iku9' => ['target' => 40.0]`
- `backend/dashboard-service/app/Repositories/Dashboard/IkuRepository.php` — Methods IKU 9
- `backend/dashboard-service/app/Services/Dashboard/IkuService.php` — buildIKU9

### Repository Methods
1. `getUKTRevenue(years)` — SUM nominal spp_mhs per tahun
2. `getLitabmasRevenue(years, fakultas)` — SUM dana litabmas (3 kolom)
3. `getKerjasamaRevenue(years, fakultas)` — SUM besaran_kerjasama (MoU overlap, > 0)
4. `getBiayaOperasionalPemasukan(years, fakultas)` — SUM biaya_operasional WHERE pemasukan
5. `calculateIKU9(years, fakultas)` — Main calculation (A + B, rasio)
6. `getRevenueBreakdown(years, fakultas)` — Breakdown per kategori (pie/donut chart)
7. `getTrendIKU9(currentYear)` — Trend 5 tahun
8. `getIKU9PerFakultas(years)` — Drilldown: UKT + litabmas + kerjasama per fakultas
9. `getIKU9PerProdi(years, idFakultas)` — Drilldown: idem per prodi

### Drilldown Strategy
Per fakultas/prodi menggunakan 3 query terpisah + merge:
- UKT per fak: `spp_mhs → reg_pd → sms` GROUP BY `id_fak_unila`
- Litabmas per fak: `litabmas → sdm_anggota_litabmas → reg_ptk → sms` GROUP BY `id_fak_unila`
- Kerjasama per fak: `sms_kerjasama → sms` GROUP BY `id_fak_unila`
- Merge maps + hitung rasio per fakultas

### API Endpoint
```
GET /api/v1/dashboard/iku?tahun=2026&fakultas=<uuid>
```

### Response Shape
```json
{
  "iku9": {
    "id": 9,
    "code": "IKU 9",
    "title": "Pendapatan Non Pendidikan/Non-UKT",
    "value": 27.8,
    "target": 40.0,
    "pendapatanMahasiswa": 150000000000,
    "pendapatanNonMahasiswa": 57700000000,
    "totalPendapatan": 207700000000,
    "detailLitabmas": 25000000000,
    "detailKerjasama": 30000000000,
    "detailOperasional": 2700000000,
    "revenueBreakdown": [
      { "name": "UKT/SPP (Mahasiswa)", "value": 150000000000 },
      { "name": "Dana Riset (Litabmas)", "value": 25000000000 },
      { "name": "Kerjasama", "value": 30000000000 },
      { "name": "Operasional (Pemasukan)", "value": 2700000000 }
    ],
    "trendData": [...],
    "drilldownData": [...]
  }
}
```

## Frontend

### Modal Tabs
- **Rincian Pendapatan**: Summary cards (Pendapatan Mahasiswa, Non-Mahasiswa, Total) + breakdown table with proporsi + detail non-mahasiswa (3 sub-cards) + rasio progress bar
- **Formula**: Formula utama, sumber data table (4 komponen), pendekatan proxy explanation, ketentuan

## Ketentuan
- UKT/SPP filter by LEFT(id_smt, 4) — tahun dari semester
- Kerjasama filter by MoU overlap (tgl_mulai ≤ akhir tahun AND tgl_selesai ≥ awal tahun)
- besaran_kerjasama NULL atau 0 tidak dihitung
- biaya_operasional pemasukan mungkin kosong — dashboard tetap berfungsi
- Drilldown per fakultas hanya menampilkan fakultas yang memiliki data pendapatan
- Indikator ini merupakan indikator **wajib** bagi semua perguruan tinggi
