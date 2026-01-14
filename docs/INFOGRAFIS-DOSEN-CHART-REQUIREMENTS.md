# Infografis Dosen - Rencana Implementasi Chart Baru

## Daftar Isi
1. [Kondisi Saat Ini](#kondisi-saat-ini)
2. [8 Chart Baru yang Direncanakan](#8-chart-baru-yang-direncanakan)
3. [Struktur Database](#struktur-database)
4. [Mapping Data per Chart](#mapping-data-per-chart)
5. [API Endpoints yang Diperlukan](#api-endpoints-yang-diperlukan)
6. [Checklist Implementasi](#checklist-implementasi)

---

## Kondisi Saat Ini

### Frontend
- **File utama**: `frontend/src/shared/components/DataDosen.tsx`
- **Library chart**: ECharts (via `echarts-for-react`)
- **Service**: `frontend/src/lib/services/public/dosenService.ts`

### Chart yang Sudah Ada
1. **Pie Chart** - Jenjang Pendidikan Dosen (S1, S2, S3)
2. **Bar Chart** - Jabatan Fungsional (Profesor, Lektor Kepala, Lektor, Asisten Ahli)
3. **Bar Chart dengan Drilldown** - Sebaran Dosen per Fakultas/Prodi

### Backend
- **Controller**: `backend/public-service/app/Http/Controllers/OpenApi/DosenController.php`
- **Service**: `backend/public-service/app/Services/DosenService.php`
- **Repository**: `backend/public-service/app/Repositories/DosenRepository.php`

### API Endpoints yang Sudah Ada
- `GET /api/v1/dosen/statistics` - Statistik lengkap dosen
- `GET /api/v1/dosen/jenjang-pendidikan` - Data per jenjang pendidikan
- `GET /api/v1/dosen/jabatan-fungsional` - Data per jabatan fungsional
- `GET /api/v1/dosen-sebaran/fakultas` - Sebaran per fakultas
- `GET /api/v1/dosen-sebaran/fakultas/{id}/prodi` - Sebaran per prodi dalam fakultas

---

## 8 Chart Baru yang Direncanakan

### 1. Heatmap: Jenjang Pendidikan vs Jabatan Fungsional
**Tipe**: Heatmap
**Deskripsi**: Menampilkan korelasi antara jenjang pendidikan dosen dengan jabatan fungsional
**Dimensi**:
- X-Axis: Jabatan Fungsional (Asisten Ahli, Lektor, Lektor Kepala, Profesor, Belum Ada Jabatan)
- Y-Axis: Jenjang Pendidikan (S1, S2, S3)
- Warna: Intensitas berdasarkan jumlah dosen

### 2. Heatmap: Kelompok Usia vs Jenjang Pendidikan
**Tipe**: Heatmap
**Deskripsi**: Distribusi jenjang pendidikan berdasarkan kelompok usia
**Dimensi**:
- X-Axis: Jenjang Pendidikan (S1, S2, S3)
- Y-Axis: Kelompok Usia (25-34, 35-44, 45-54, 55-64, 65+)
- Warna: Intensitas berdasarkan jumlah dosen

### 3. Heatmap: Kelompok Usia vs Jabatan Fungsional
**Tipe**: Heatmap
**Deskripsi**: Distribusi jabatan fungsional berdasarkan kelompok usia
**Dimensi**:
- X-Axis: Jabatan Fungsional
- Y-Axis: Kelompok Usia
- Warna: Intensitas berdasarkan jumlah dosen

### 4. Heatmap: Ikatan Kerja vs Status Pegawai
**Tipe**: Heatmap
**Deskripsi**: Korelasi antara ikatan kerja dan status pegawai
**Dimensi**:
- X-Axis: Status Pegawai (PNS, Non-PNS)
- Y-Axis: Ikatan Kerja (Dosen Tetap, Dosen Tidak Tetap)
- Warna: Intensitas berdasarkan jumlah dosen

### 5. Diverging Bar Chart: Sertifikasi per Jabatan Fungsional
**Tipe**: Diverging Bar Chart (Horizontal)
**Deskripsi**: Perbandingan dosen bersertifikasi vs belum bersertifikasi per jabatan
**Dimensi**:
- Kiri: Belum Sertifikasi (warna merah/orange)
- Kanan: Sudah Sertifikasi (warna hijau)
- Y-Axis: Jabatan Fungsional

### 6. Population Pyramid: Gender & Usia
**Tipe**: Population Pyramid (Back-to-back Horizontal Bar)
**Deskripsi**: Distribusi gender berdasarkan kelompok usia
**Dimensi**:
- Kiri: Laki-laki (warna biru)
- Kanan: Perempuan (warna pink/merah)
- Y-Axis: Kelompok Usia (25-34, 35-44, 45-54, 55-64, 65+)

### 7. Stacked Bar Chart: Tren Sertifikasi (5 Tahun Terakhir)
**Tipe**: Stacked Bar Chart
**Deskripsi**: Perubahan jumlah dosen bersertifikasi per tahun
**Dimensi**:
- X-Axis: Tahun (2020, 2021, 2022, 2023, 2024)
- Y-Axis: Jumlah Dosen
- Stack: Sudah Sertifikasi vs Belum Sertifikasi

### 8. Stacked Bar Chart: Tren Jabatan Fungsional (5 Tahun Terakhir)
**Tipe**: Stacked Bar Chart
**Deskripsi**: Perubahan distribusi jabatan fungsional per tahun
**Dimensi**:
- X-Axis: Tahun (2020, 2021, 2022, 2023, 2024)
- Y-Axis: Jumlah Dosen
- Stack: Profesor, Lektor Kepala, Lektor, Asisten Ahli, Belum Ada Jabatan

---

## Struktur Database

### Tabel Utama

#### 1. `pdrd.sdm` (Sumber Daya Manusia)
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id_sdm` | uniqueidentifier | Primary Key |
| `nm_sdm` | varchar | Nama SDM |
| `nidn` | varchar | NIDN |
| `jk` | char(1) | Jenis Kelamin (L/P) |
| `tgl_lahir` | date | Tanggal Lahir (untuk hitung usia) |
| `id_jns_sdm` | varchar | Jenis SDM ('12' = Dosen) |
| `id_stat_aktif` | int | Status Keaktifan |
| `soft_delete` | bit | Soft Delete Flag |

#### 2. `pdrd.reg_ptk` (Registrasi PTK/Pendidik Tenaga Kependidikan)
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id_reg_ptk` | uniqueidentifier | Primary Key |
| `id_sdm` | uniqueidentifier | FK ke sdm |
| `id_sms` | uniqueidentifier | FK ke prodi (homebase) |
| `id_sp` | uniqueidentifier | FK ke satuan pendidikan |
| `id_ikatan_kerja` | char(1) | Ikatan Kerja |
| `id_stat_pegawai` | varchar | Status Pegawai |
| `id_jns_keluar` | varchar | Jenis Keluar (null = masih aktif) |
| `soft_delete` | bit | Soft Delete Flag |

#### 3. `pdrd.keaktifan_ptk` (Keaktifan per Tahun Ajaran)
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id_keaktifan` | uniqueidentifier | Primary Key |
| `id_reg_ptk` | uniqueidentifier | FK ke reg_ptk |
| `id_thn_ajaran` | varchar | Tahun Ajaran |
| `a_sp_homebase` | bit | Flag homebase (1 = aktif di homebase) |
| `soft_delete` | bit | Soft Delete Flag |

#### 4. `pdrd.rwy_pend_formal` (Riwayat Pendidikan Formal)
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id_rwy_pend` | uniqueidentifier | Primary Key |
| `id_sdm` | uniqueidentifier | FK ke sdm |
| `id_jenj_didik` | varchar | FK ke jenjang pendidikan |
| `thn_lulus` | int | Tahun Lulus |
| `soft_delete` | bit | Soft Delete Flag |

#### 5. `pdrd.rwy_fungsional` (Riwayat Jabatan Fungsional)
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id_rwy_fung` | uniqueidentifier | Primary Key |
| `id_sdm` | uniqueidentifier | FK ke sdm |
| `id_jabfung` | varchar | FK ke ref.jabfung |
| `tmt_sk_jabfung` | date | TMT SK Jabatan Fungsional |
| `soft_delete` | bit | Soft Delete Flag |

#### 6. `pdrd.rwy_sertifikasi` (Riwayat Sertifikasi)
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id_rwy_sert` | uniqueidentifier | Primary Key |
| `id_sdm` | uniqueidentifier | FK ke sdm |
| `id_jns_sert` | varchar | FK ke ref.jenis_sert |
| `thn_sert` | int | Tahun Sertifikasi |
| `sk_sert` | varchar | Nomor SK Sertifikat |
| `nrg` | varchar | Nomor Registrasi |
| `soft_delete` | bit | Soft Delete Flag |

### Tabel Referensi

#### `ref.jenjang_pendidikan`
| id_jenj_didik | nm_jenj_didik |
|---------------|---------------|
| 20 | S1 |
| 21 | D4 |
| 30 | S2 |
| 31 | S2 Terapan |
| 32 | Sp-1 |
| 35 | Profesi |
| 40 | S3 |
| 41 | S3 Terapan |
| 42 | Sp-2 |

#### `ref.jabfung`
| id_jabfung | nm_jabfung |
|------------|------------|
| 11 | Profesor |
| 12 | Lektor Kepala |
| 13 | Lektor |
| 14 | Asisten Ahli |

#### Ikatan Kerja (`id_ikatan_kerja`)
| Kode | Kategori |
|------|----------|
| A, B, E, F, H, I, N | Dosen Tetap |
| G | Dosen Tidak Tetap |

#### Status Pegawai (`id_stat_pegawai`)
| Kode | Kategori |
|------|----------|
| 1, 13, 14 | PNS |
| Lainnya | Non-PNS |

---

## Mapping Data per Chart

### Chart 1: Heatmap Pendidikan vs Jabfung
```sql
SELECT
    CASE
        WHEN pend.nm_jenj_didik IN ('S3', 'S3 Terapan', 'Sp-2') THEN 'S3/Doktor'
        WHEN pend.nm_jenj_didik IN ('S2', 'S2 Terapan', 'Sp-1', 'Profesi') THEN 'S2/Magister'
        WHEN pend.nm_jenj_didik IN ('S1', 'D4') THEN 'S1/Sarjana'
        ELSE 'Lainnya'
    END AS jenjang_pendidikan,
    COALESCE(jabfung.nm_jabfung, 'Belum Ada Jabatan') AS jabatan_fungsional,
    COUNT(DISTINCT sdm.id_sdm) AS jumlah
FROM pdrd.sdm AS sdm
-- ... joins dengan rwy_pend_formal dan rwy_fungsional
GROUP BY jenjang_pendidikan, jabatan_fungsional
```

### Chart 2: Heatmap Usia vs Pendidikan
```sql
SELECT
    CASE
        WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) BETWEEN 25 AND 34 THEN '25-34'
        WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) BETWEEN 35 AND 44 THEN '35-44'
        WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) BETWEEN 45 AND 54 THEN '45-54'
        WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) BETWEEN 55 AND 64 THEN '55-64'
        ELSE '65+'
    END AS kelompok_usia,
    CASE
        WHEN pend.nm_jenj_didik IN ('S3', 'S3 Terapan', 'Sp-2') THEN 'S3/Doktor'
        WHEN pend.nm_jenj_didik IN ('S2', 'S2 Terapan', 'Sp-1', 'Profesi') THEN 'S2/Magister'
        ELSE 'S1/Sarjana'
    END AS jenjang_pendidikan,
    COUNT(DISTINCT sdm.id_sdm) AS jumlah
FROM pdrd.sdm AS sdm
-- ... joins
GROUP BY kelompok_usia, jenjang_pendidikan
```

### Chart 3: Heatmap Usia vs Jabfung
```sql
-- Similar to Chart 2, replace jenjang_pendidikan with jabatan_fungsional
```

### Chart 4: Heatmap Ikatan Kerja vs Status Pegawai
```sql
SELECT
    CASE
        WHEN ptk.id_ikatan_kerja IN ('A','B','E','F','H','I','N') THEN 'Dosen Tetap'
        WHEN ptk.id_ikatan_kerja = 'G' THEN 'Dosen Tidak Tetap'
        ELSE 'Lainnya'
    END AS ikatan_kerja,
    CASE
        WHEN ptk.id_stat_pegawai IN ('1','13','14') THEN 'PNS'
        ELSE 'Non-PNS'
    END AS status_pegawai,
    COUNT(DISTINCT sdm.id_sdm) AS jumlah
FROM pdrd.sdm AS sdm
INNER JOIN pdrd.reg_ptk AS ptk ON ptk.id_sdm = sdm.id_sdm
-- ... filters
GROUP BY ikatan_kerja, status_pegawai
```

### Chart 5: Diverging Bar Sertifikasi per Jabfung
```sql
SELECT
    jabfung.nm_jabfung AS jabatan,
    SUM(CASE WHEN sert.id_sdm IS NOT NULL THEN 1 ELSE 0 END) AS sudah_sertifikasi,
    SUM(CASE WHEN sert.id_sdm IS NULL THEN 1 ELSE 0 END) AS belum_sertifikasi
FROM pdrd.sdm AS sdm
LEFT JOIN (
    SELECT DISTINCT id_sdm FROM pdrd.rwy_sertifikasi WHERE soft_delete = 0
) AS sert ON sert.id_sdm = sdm.id_sdm
LEFT JOIN (
    SELECT id_sdm, id_jabfung, ROW_NUMBER() OVER (PARTITION BY id_sdm ORDER BY tmt_sk_jabfung DESC) AS rn
    FROM pdrd.rwy_fungsional WHERE soft_delete = 0
) AS rwy ON rwy.id_sdm = sdm.id_sdm AND rwy.rn = 1
LEFT JOIN ref.jabfung ON jabfung.id_jabfung = rwy.id_jabfung
-- ... filters
GROUP BY jabfung.nm_jabfung
```

### Chart 6: Population Pyramid Gender & Usia
```sql
SELECT
    CASE
        WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) BETWEEN 25 AND 34 THEN '25-34'
        WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) BETWEEN 35 AND 44 THEN '35-44'
        WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) BETWEEN 45 AND 54 THEN '45-54'
        WHEN DATEDIFF(YEAR, sdm.tgl_lahir, GETDATE()) BETWEEN 55 AND 64 THEN '55-64'
        ELSE '65+'
    END AS kelompok_usia,
    SUM(CASE WHEN sdm.jk = 'L' THEN 1 ELSE 0 END) AS laki_laki,
    SUM(CASE WHEN sdm.jk = 'P' THEN 1 ELSE 0 END) AS perempuan
FROM pdrd.sdm AS sdm
-- ... filters
GROUP BY kelompok_usia
ORDER BY kelompok_usia
```

### Chart 7 & 8: Tren Sertifikasi & Jabfung
**CATATAN**: Untuk data historis (tren per tahun), perlu:
1. Menggunakan `thn_sert` dari `rwy_sertifikasi` untuk tren sertifikasi
2. Menggunakan `tmt_sk_jabfung` dari `rwy_fungsional` untuk tren jabfung
3. Atau menggunakan snapshot data per tahun ajaran jika tersedia

---

## API Endpoints yang Diperlukan

### Endpoint Baru di Backend

```
GET /api/v1/dosen/heatmap/pendidikan-jabfung
Response: { data: [{ jenjang, jabatan, jumlah }], ... }

GET /api/v1/dosen/heatmap/usia-pendidikan
Response: { data: [{ kelompok_usia, jenjang, jumlah }], ... }

GET /api/v1/dosen/heatmap/usia-jabfung
Response: { data: [{ kelompok_usia, jabatan, jumlah }], ... }

GET /api/v1/dosen/heatmap/ikatan-status
Response: { data: [{ ikatan_kerja, status_pegawai, jumlah }], ... }

GET /api/v1/dosen/sertifikasi-per-jabfung
Response: { data: [{ jabatan, sudah_sertifikasi, belum_sertifikasi }], ... }

GET /api/v1/dosen/gender-usia
Response: { data: [{ kelompok_usia, laki_laki, perempuan }], ... }

GET /api/v1/dosen/tren/sertifikasi
Response: { data: [{ tahun, sudah_sertifikasi, belum_sertifikasi }], ... }

GET /api/v1/dosen/tren/jabfung
Response: { data: [{ tahun, profesor, lektor_kepala, lektor, asisten_ahli, belum_ada }], ... }
```

---

## Checklist Implementasi

### Backend (Laravel/PHP)
- [ ] Buat `DosenInfografisRepository.php` dengan query untuk 8 chart baru
- [ ] Buat `DosenInfografisService.php` dengan caching dan data processing
- [ ] Buat `DosenInfografisController.php` dengan 8 endpoint baru
- [ ] Tambahkan routes di `routes/api.php`
- [ ] Testing dengan Postman/cURL

### Frontend (Next.js/React)
- [ ] Update `dosenService.ts` dengan fungsi untuk fetch 8 API baru
- [ ] Buat komponen chart terpisah untuk setiap tipe:
  - [ ] `HeatmapPendidikanJabfung.tsx`
  - [ ] `HeatmapUsiaJenjang.tsx`
  - [ ] `HeatmapUsiaJabfung.tsx`
  - [ ] `HeatmapIkatanStatus.tsx`
  - [ ] `DivergingBarSertifikasi.tsx`
  - [ ] `PopulationPyramidGenderUsia.tsx`
  - [ ] `StackedBarTrenSertifikasi.tsx`
  - [ ] `StackedBarTrenJabfung.tsx`
- [ ] Integrasikan ke `DataDosen.tsx` atau buat halaman baru

### ECharts Configuration Reference
```typescript
// Heatmap
const heatmapOption = {
  tooltip: { position: 'top' },
  grid: { height: '50%', top: '10%' },
  xAxis: { type: 'category', data: xCategories },
  yAxis: { type: 'category', data: yCategories },
  visualMap: { min: 0, max: maxValue, calculable: true },
  series: [{ type: 'heatmap', data: heatmapData, label: { show: true } }]
};

// Diverging Bar
const divergingOption = {
  series: [
    { type: 'bar', stack: 'total', data: negativeValues },
    { type: 'bar', stack: 'total', data: positiveValues }
  ]
};

// Population Pyramid
const pyramidOption = {
  yAxis: { type: 'category', data: ageGroups },
  series: [
    { type: 'bar', data: maleValues.map(v => -v) },  // Negative untuk kiri
    { type: 'bar', data: femaleValues }
  ]
};
```

---

## Catatan Penting

### Data yang Perlu Dikonfirmasi
1. **`tgl_lahir` di tabel `sdm`** - Pastikan kolom ini tersedia dan terisi untuk perhitungan usia
2. **Data historis** - Untuk chart tren, perlu konfirmasi apakah ada snapshot data per tahun atau harus dihitung dari riwayat

### Dependensi
- ECharts sudah terinstall di frontend (`echarts-for-react`)
- Backend sudah punya koneksi ke SQL Server (`sqlsrv`)
- Helper `TahunAjaranHelper` untuk mendapatkan tahun ajaran aktif

### Performance
- Semua endpoint baru harus menggunakan caching (Redis) dengan TTL 30 menit
- Query harus dioptimasi dengan proper indexing
- Gunakan pagination jika data terlalu besar

---

*Dokumen ini dibuat sebagai acuan kerja untuk implementasi 8 chart baru pada modul Infografis Dosen MyUnila.*
