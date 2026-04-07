# IKU 1: Angka Efisiensi Edukasi Perguruan Tinggi (AEE)

## Definisi
Indikator yang mengukur tingkat keberhasilan mahasiswa menyelesaikan studi tepat waktu sesuai masa studi standar, dibandingkan dengan total mahasiswa yang masuk pada periode tertentu.

## Formula

### (1) AEE per Jenjang
```
AEE = (Jumlah mahasiswa tahun akademik yang lulus tepat waktu / Total mahasiswa aktif) x 100%
```

### (2) Tingkat Pencapaian AEE per Jenjang
```
Tingkat Pencapaian AEE = (AEE Realisasi / AEE Ideal) x 100%
```

### (3) AEE Perguruan Tinggi (Agregat)
```
AEE PT = SUM(Tingkat Pencapaian_i) / n
```
Dimana:
- i = tingkat pendidikan (D3, S1, S2, S3, dst.)
- n = jumlah jenjang pendidikan yang dihitung
- Tingkat Pencapaian AEE_i = hasil perbandingan antara AEE realisasi dan AEE ideal pada jenjang ke-i

## AEE Ideal per Jenjang

| Jenjang | AEE Ideal | Masa Studi Standar |
|---------|-----------|-------------------|
| D3      | 33%       | 3 tahun (36 bulan) |
| S1      | 25%       | 4 tahun (48 bulan) |
| S2      | 50%       | 2 tahun (24 bulan) |
| S3      | 33%       | 3-4 tahun (48 bulan maks) |

## Kriteria dan Ketentuan

- Indikator ini merupakan indikator **wajib** bagi semua perguruan tinggi.
- **Jumlah mahasiswa tahun akademik yang lulus tepat waktu**: mahasiswa pada suatu tahun akademik yang berhasil lulus tepat waktu sesuai ketentuan masa studi prodi.
- **Jumlah mahasiswa tahun akademik yang masuk**: seluruh mahasiswa yang terdaftar pada tahun akademik tersebut.
- **Lulus Tepat Waktu (definisi teknis)**: Mahasiswa yang memenuhi **seluruh** syarat berikut:
  1. Status keluar = **Lulus** (`id_jns_keluar = '1'`)
  2. Tanggal masuk tercatat (`tgl_masuk_sp IS NOT NULL`)
  3. Tanggal keluar/lulus tercatat (`tgl_keluar IS NOT NULL`)
  4. Nomor seri ijazah sudah terbit (`no_seri_ijazah IS NOT NULL`)
  5. Lulus pada **tahun** yang sesuai filter (`YEAR(tgl_keluar) = tahun`)
  6. **Masa studi ≤ masa studi standar jenjang**, dihitung dengan:
     ```
     DATEDIFF(DAY, tgl_masuk_sp, tgl_keluar) / 365.25 <= masa_studi_tahun
     ```
     Batas per jenjang: D3 ≤ 3 tahun, S1 ≤ 4 tahun, S2 ≤ 2 tahun, S3 ≤ 3 tahun
- **Tidak dimasukkan** dalam perhitungan:
  - Mahasiswa pindah
  - Mahasiswa DO (drop out)
  - Mahasiswa yang cuti lebih dari ketentuan
  - Mahasiswa yang belum lulus

## Contoh Perhitungan

Diketahui:
- AEE ideal D3 = 33%, AEE D3 realisasi = 30%
- AEE ideal S1 = 25%, AEE S1 realisasi = 20%
- AEE ideal S2 = 50%, AEE S2 realisasi = 45%
- AEE ideal S3 = 33%, AEE S3 realisasi = 30%

Tingkat pencapaian:
- AEE D3 = 30% / 33% = **90.91%**
- AEE S1 = 20% / 25% = **80.00%**
- AEE S2 = 45% / 50% = **90%**
- AEE S3 = 30% / 33% = **90.91%**

**AEE PT = (90.91% + 80.00% + 90% + 90.91%) / 4 = 87.95%**

## Sumber Data di PDUT Database

### Tabel Utama
- `pdrd.reg_pd` - Registrasi mahasiswa (tgl_masuk_sp, tgl_keluar, id_jns_keluar, id_semester_masuk, no_seri_ijazah)
- `pdrd.kuliah_mhs` - Status mahasiswa per semester (id_reg_pd, id_smt, id_stat_mhs). **Digunakan untuk menentukan mhs aktif per semester** (`id_stat_mhs = 'A'`)
- `pdrd.sms` - Program studi (id_sms, nm_lemb, id_jenj_didik, id_fak_unila, stat_prodi)
- `pdrd.sms AS fak` - Self-join untuk Fakultas (`fak.id_sms = sms.id_fak_unila`). **BUKAN `unit_organisasi`**
- `ref.jenjang_pendidikan` - Referensi jenjang pendidikan (id_jenj_didik, nm_jenj_didik, expired_date)
- `ref.semester` - Semester referensi (id_smt, a_periode_aktif)

### id_jenj_didik (Numeric Codes)
| Code | Jenjang | Masa Studi | AEE Ideal |
|------|---------|-----------|-----------|
| 22   | D3      | 3 tahun   | 33%       |
| 30   | S1      | 4 tahun   | 25%       |
| 35   | S2      | 2 tahun   | 50%       |
| 40   | S3      | 3 tahun   | 33%       |

### Kode Referensi
- `id_jns_keluar = '1'` = Lulus
- `id_jns_keluar IN ('4','6')` = Drop Out
- `id_jns_keluar = '2'` = Pindah
- `soft_delete = 0` = Data aktif
- `sms.stat_prodi = 'A'` = Prodi aktif
- `jenjang.expired_date IS NULL` = Jenjang valid

### Lulusan Valid
```sql
reg.id_jns_keluar = '1'
AND reg.tgl_masuk_sp IS NOT NULL
AND reg.tgl_keluar IS NOT NULL
AND reg.no_seri_ijazah IS NOT NULL
```

### Masa Studi (pattern dari KelulusanRepository)
```sql
ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar) / 365.25, 2)
```

### JOIN Pattern
```sql
-- Fakultas (self-join sms)
INNER JOIN pdrd.sms AS fak ON fak.id_sms = sms.id_fak_unila AND fak.soft_delete = 0

-- Mahasiswa aktif per semester (kuliah_mhs)
FROM pdrd.kuliah_mhs AS kmh
INNER JOIN pdrd.reg_pd AS reg ON reg.id_reg_pd = kmh.id_reg_pd AND reg.soft_delete = 0
WHERE kmh.soft_delete = 0 AND kmh.id_stat_mhs = 'A' AND kmh.id_smt = ?
```

---

## Implementasi Dashboard

### Arsitektur: Repository -> Service -> Controller (Laravel)

### Backend Files
- `backend/dashboard-service/app/Repositories/Dashboard/IkuRepository.php` - Query SQL AEE
- `backend/dashboard-service/app/Services/Dashboard/IkuService.php` - Orchestration + caching
- `backend/dashboard-service/app/Http/Controllers/Api/Dashboard/IkuController.php` - API endpoint
- `backend/dashboard-service/routes/api.php` - Route: `GET /v1/dashboard/iku`

### Frontend Files
- `frontend/src/shared/api/endpoints.ts` - Endpoint constant
- `frontend/src/app/dashboard/pimpinan/types.ts` - TypeScript types (IkuData, IkuItem, IkuJenjangDetail)
- `frontend/src/app/dashboard/pimpinan/iku/page.tsx` - Halaman IKU (IKU 1 real, IKU 2-11 mock)

### API Endpoint
```
GET /api/v1/dashboard/iku?tahun=2026&fakultas=<uuid>
```
- `tahun`: tahun IKU (single, e.g. `2026`). Semester di-resolve dari `config/iku.php → semesters`.
- `fakultas`: optional UUID filter fakultas.

### Response Shape
```json
{
  "success": true,
  "data": {
    "iku1": {
      "id": 1,
      "code": "IKU 1",
      "title": "Angka Efisiensi Edukasi Perguruan Tinggi (AEE)",
      "value": 87.95,
      "target": 80.0,
      "perJenjang": [
        { "jenjang": "D3", "lulus_tepat_waktu": 120, "total_aktif": 500, "aee_realisasi": 24.0, "aee_ideal": 33.0, "tingkat_pencapaian": 72.7 }
      ],
      "trendData": [{ "name": "2022", "value": 75.2 }],
      "drilldownData": [{ "id": "uuid", "name": "Fak. Teknik", "value": 82.5, "target": 80.0, "status": "Tercapai", "children": [...] }]
    }
  }
}
```

### Referensi Pattern
- `public-service/KelulusanRepository.php` - Query kelulusan, DATEDIFF, id_jenj_didik codes
- `public-service/DosenSebaranRepository.php` - kuliah_mhs aktif, sms self-join fakultas
- `dashboard-service/MahasiswaRepository.php` - BaseRepository pattern, filter helpers
