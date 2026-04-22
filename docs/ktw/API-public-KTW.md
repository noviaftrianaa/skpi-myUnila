# API Publik KTW (Kelulusan Tepat Waktu)

Dokumentasi endpoint publik KTW di MyUnila — endpoint yang dipakai infografis publik `/infografis/ktw`.

**Base URL:** `https://my.unila.ac.id/api/public-service/api/v1`
(Base URL staging: `http://192.168.120.45:9800/public-service/api/v1`)

**Autentikasi:** TIDAK PERLU (public endpoint). CORS enabled untuk domain universitas.

**Format response:** JSON, UTF-8. Semua request GET (kecuali `/refresh` yang POST).

---

## Formula Definisi KTW

| Parameter | Nilai |
|---|---|
| Sumber | pdut (realtime — `pdrd.reg_pd` + `pdrd.peserta_didik` + `pdrd.sms`) |
| Denominator | Mahasiswa Baru (`id_jns_daftar = 1`) angkatan Gasal (`MONTH(tgl_masuk_sp) >= 7`) |
| Numerator | Lulus (`id_jns_keluar = '1'`) dengan `DATEDIFF(DAY, tgl_masuk_sp, tgl_keluar) / 365.25 ≤ masa_normatif` |
| Masa normatif | D3=3, D4=4, S1=4, S2=2, S3=3 (tahun) |
| Tolerance | +0.25 tahun (opsional — untuk wisuda mepet periode berikut) |
| Cutoff | Tanggal snapshot (default = hari ini). Lulus setelah cutoff tidak dihitung. |

**Exclude dari denominator:** Pindahan (2), Lintas Jalur (12), Alih Jenjang, RPL.

---

## 1. Overview Angkatan Univ-Wide

**GET** `/ktw/overview`

### Query Parameters
| Param | Tipe | Wajib | Contoh | Catatan |
|---|---|---|---|---|
| `cohort` | int | — | `2020` | Tahun angkatan masuk. Kalau kosong, default = `thn - normatif - 1` |
| `jenjang` | enum | — | `S1` | D3, D4, S1, S2, S3 (default S1) |
| `cutoff` | date | — | `2026-04-22` | Format `YYYY-MM-DD`, default hari ini |
| `reconcile` | bool | — | `true` | Kalau `true`, tambah blok `reconcile` dari spordit |

### Contoh Request
```
GET /ktw/overview?cohort=2020&jenjang=S1
```

### Contoh Response
```json
{
  "scope": "univ_angkatan",
  "cohort_year": 2020,
  "jenjang": "S1",
  "cutoff_date": "2026-04-22",
  "data": {
    "maba": 5404,
    "sudah_lulus": 3912,
    "ktw_strict": 2475,
    "ktw_tolerant": 3036,
    "masih_aktif": 1024,
    "keluar_non_lulus": 468,
    "pct_ktw_strict": 45.80,
    "pct_ktw_tolerant": 56.18,
    "pct_survival": 72.39,
    "masa_normatif_tahun": 4,
    "tolerance_tahun": 0.25,
    "id_smt_masuk": "20201"
  },
  "meta": {
    "source": "pdut (realtime)",
    "formula": "DATEDIFF(DAY, tgl_masuk_sp, tgl_keluar) / 365.25 <= masa_normatif",
    "filter_jns_daftar": "id_jns_daftar = 1 (Peserta Didik Baru murni)",
    "filter_periode_masuk": "id_smt = '20201' (hanya angkatan Gasal)",
    "as_of": "2026-04-22T07:26:00+00:00"
  }
}
```

### Penjelasan field `data`
| Field | Arti |
|---|---|
| `maba` | Jumlah mahasiswa baru angkatan (denominator) |
| `sudah_lulus` | Dari maba, yang sudah lulus (`id_jns_keluar=1`) sebelum cutoff |
| `ktw_strict` | Sudah lulus dengan masa mukim ≤ masa normatif |
| `ktw_tolerant` | Sudah lulus dengan masa mukim ≤ masa normatif + 0.25 |
| `masih_aktif` | Belum keluar + belum lulus (masih kuliah) |
| `keluar_non_lulus` | Drop out, mutasi, mengundurkan, dll |
| `pct_ktw_strict` | `ktw_strict / maba × 100` |
| `pct_ktw_tolerant` | `ktw_tolerant / maba × 100` |
| `pct_survival` | `sudah_lulus / maba × 100` |

---

## 2. Breakdown Per Fakultas

**GET** `/ktw/fakultas`

Sama parameter dgn `/overview`, return list per fakultas + summary univ-wide.

### Contoh Response
```json
{
  "scope": "fakultas_breakdown",
  "cohort_year": 2020,
  "jenjang": "S1",
  "summary": {
    "maba": 5404,
    "sudah_lulus": 3912,
    "ktw_strict": 2475,
    "pct_ktw_strict": 45.80,
    "pct_survival": 72.39
  },
  "data": [
    {
      "id_fakultas": "986882E1-CF1D-44FA-AD14-0AB162F0082A",
      "nm_fakultas": "Fakultas EKONOMI DAN BISNIS",
      "maba": 342,
      "sudah_lulus": 242,
      "ktw_strict": 142,
      "ktw_tolerant": 192,
      "pct_ktw_strict": 41.52,
      "pct_ktw_tolerant": 56.14,
      "pct_survival": 70.76
    }
  ]
}
```

---

## 3. Breakdown Per Prodi

**GET** `/ktw/prodi`

### Query Parameters
Sama dengan `/fakultas`, tambah opsional `id_fakultas` untuk drilldown.

| Param | Tipe | Wajib | Contoh |
|---|---|---|---|
| `cohort` | int | — | `2020` |
| `jenjang` | enum | — | `S1` |
| `id_fakultas` | uuid | — | `986882E1-...` |
| `cutoff` | date | — | `2026-04-22` |

### Contoh Response
```json
{
  "scope": "prodi_breakdown",
  "cohort_year": 2020,
  "id_fakultas": "986882E1-...",
  "data": [
    {
      "id_prodi": "3E6CC468-DB99-4135-B09F-5E05F527AE51",
      "kode_dikti": "61201",
      "nm_prodi": "Program Studi S1 Manajemen",
      "id_fakultas": "986882E1-...",
      "maba": 156,
      "sudah_lulus": 112,
      "ktw_strict": 68,
      "pct_ktw_strict": 43.59
    }
  ]
}
```

---

## 4. Detail Prodi (dengan reconcile opsional)

**GET** `/ktw/prodi/{id_sms}`

Path param `{id_sms}` = UUID prodi (dari `/prodi`).

### Contoh
```
GET /ktw/prodi/3E6CC468-DB99-4135-B09F-5E05F527AE51?cohort=2020&reconcile=true
```

Return: info prodi + overview data + (optional) reconcile dari spordit.

---

## 5. Trend Angkatan

**GET** `/ktw/trend`

Time-series KTW 6+ angkatan untuk chart trend.

### Query Parameters
| Param | Tipe | Default | Contoh |
|---|---|---|---|
| `jenjang` | enum | S1 | `S1` |
| `start` | int | `end - 5` | `2015` |
| `end` | int | `thn - normatif - 1` | `2020` |

### Contoh Response
```json
{
  "scope": "trend",
  "jenjang": "S1",
  "cohort_range": { "start": 2015, "end": 2020 },
  "data": [
    { "tahun": "2015", "maba": 5782, "sudah_lulus": 4664, "ktw_strict": 1737, "pct_ktw_strict": 30.04 },
    { "tahun": "2016", "maba": 5691, "sudah_lulus": 4510, "ktw_strict": 1980, "pct_ktw_strict": 34.79 },
    { "tahun": "2020", "maba": 5404, "sudah_lulus": 3912, "ktw_strict": 2475, "pct_ktw_strict": 45.80 }
  ]
}
```

---

## 6. Breakdown Status Keluar

**GET** `/ktw/status-breakdown?cohort=2020&jenjang=S1`

### Contoh Response
```json
{
  "data": [
    { "id_jns_keluar": "1", "nm_status": "Lulus",      "color": "#10b981", "jumlah": 3912, "persentase": 72.39 },
    { "id_jns_keluar": null, "nm_status": "Masih Aktif","color": "#3b82f6", "jumlah": 1024, "persentase": 18.95 },
    { "id_jns_keluar": "5", "nm_status": "Putus Studi", "color": "#ef4444", "jumlah": 286,  "persentase": 5.29 }
  ]
}
```

---

## 7. Breakdown Gender

**GET** `/ktw/gender-breakdown?cohort=2020&jenjang=S1`

```json
{
  "data": [
    { "jk": "L", "nm_gender": "Laki-laki",  "color": "#3b82f6", "maba": 2451, "lulus": 1689, "ktw_strict": 1012, "pct_ktw": 41.29 },
    { "jk": "P", "nm_gender": "Perempuan",  "color": "#ec4899", "maba": 2953, "lulus": 2223, "ktw_strict": 1463, "pct_ktw": 49.54 }
  ]
}
```

---

## 8. Breakdown Jalur Daftar

**GET** `/ktw/jalur-breakdown?cohort=2020&jenjang=S1`

```json
{
  "data": [
    { "id_jalur_daftar": "1", "nm_jalur": "SNMPTN",  "maba": 1812, "lulus": 1432, "ktw": 912, "pct_ktw": 50.33, "pct_survival": 79.03 },
    { "id_jalur_daftar": "2", "nm_jalur": "SBMPTN",  "maba": 1542, "lulus": 1102, "ktw": 712, "pct_ktw": 46.17, "pct_survival": 71.47 },
    { "id_jalur_daftar": "5", "nm_jalur": "Mandiri", "maba": 2050, "lulus": 1378, "ktw": 851, "pct_ktw": 41.51, "pct_survival": 67.22 }
  ]
}
```

---

## 9. Statistik Masa Mukim

**GET** `/ktw/masa-mukim-stats?cohort=2020&jenjang=S1`

Return statistik agregat masa studi (tahun):

```json
{
  "data": {
    "jumlah_lulusan": 3912,
    "avg_masa": 4.35,
    "min_masa": 3.01,
    "max_masa": 6.52,
    "stddev_masa": 0.48,
    "masa_normatif_tahun": 4
  }
}
```

---

## 10. Top 10 Prodi

**GET** `/ktw/top-prodi?cohort=2020&jenjang=S1&limit=10`

Prodi dgn `pct_ktw_strict` tertinggi. Format sama dengan `/prodi` (10 row teratas).

---

## 11. Preset Cutoff (Kalender Akademik)

**GET** `/ktw/presets`

Return list cutoff date preset (akhir semester, awal tahun, wisuda tipikal) dari `ref.semester` pdut.

```json
{
  "data": [
    { "group": "Akhir Semester", "label": "Akhir 2025/2026 Ganjil (2026-02-28)", "value": "2026-02-28", "id_smt": "20251", "aktif": true },
    { "group": "Akhir Semester", "label": "Akhir 2024/2025 Genap (2025-08-15)", "value": "2025-08-15", "id_smt": "20242", "aktif": false }
  ],
  "as_of": "2026-04-22T..."
}
```

---

## 12. Reconcile dengan Spordit

**GET** `/ktw/reconcile?cohort=2020&jenjang=S1`

Perbandingan angka pdut vs spordit (`masa_studi_generate_lulusan`). Untuk audit data consistency.

---

## Error Response

```json
{
  "message": "The cohort field must be an integer.",
  "errors": {
    "cohort": ["The cohort field must be an integer."]
  }
}
```

HTTP status code standar: 200 sukses, 422 validation error, 500 server error.

---

## Cache

Semua endpoint GET di-cache 10 menit (Redis).
Key pattern: `ktw:{scope}:{cohort}:{jenjang}:{cutoff}`

Force refresh: **POST** `/ktw/refresh` (invalidate semua cache KTW).

---

## Catatan Implementasi

1. **Angka identik** dengan yang tampil di `/infografis/ktw` (public) dan `/dashboard/pimpinan/ktw` (JWT-protected).
2. **Tidak ada data personal** di response publik — hanya agregat per fakultas/prodi. Endpoint list individu mahasiswa per prodi (`/ktw/prodi/{id}/mahasiswa`) JWT-protected, dipakai dashboard pimpinan saja.
3. **id_smt Gasal** untuk angkatan = `{tahun}1` (cth 2020 → `20201`).
4. **Excel manual tim wali data** under-count ~10% krn manual rekap — pdut = source of truth.

---

## Kontak

Untuk kebutuhan integrasi tambahan atau endpoint baru, hubungi tim TIK Unila.

**Terakhir update:** 2026-04-22
