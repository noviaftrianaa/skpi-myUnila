# IKU 2: Persentase Lulusan Bekerja/Studi Lanjut/Wiraswasta

## Definisi
Persentase lulusan pendidikan tinggi (S1 dan program diploma) yang langsung bekerja, melanjutkan jenjang pendidikan berikutnya, atau berwirausaha dalam jangka waktu 1 tahun setelah kelulusan, berdasarkan hasil tracer study.

## Formula

```
IKU 2 = (A + B + C) / Total Lulusan S1 & Diploma × 100
```

- **A** = Lulusan yang berhasil dapat pekerjaan
- **B** = Lulusan yang melanjutkan studi
- **C** = Lulusan yang menjadi wiraswasta

## Jenjang yang Dihitung

Hanya **S1 dan program diploma**:

| Code | Jenjang |
|------|---------|
| 22   | D3      |
| 23   | D4      |
| 30   | S1      |

## Kriteria Pekerjaan (A)

### Bobot Kategori
| Kategori | Kondisi | Bobot |
|----------|---------|-------|
| Kategori 1 | Masa tunggu < 6 bulan DAN gaji > 1.2× UMP | 10 |
| Kategori 2 | Masa tunggu < 12 bulan DAN gaji > 1.2× UMP | 6 |
| Kategori 3 | Masa tunggu < 12 bulan DAN gaji < 1.2× UMP | 4 |

### Jenis Tempat Bekerja
- Perusahaan swasta (nasional, multinasional, startup, UMKM)
- Perusahaan nirlaba
- Institusi/organisasi multilateral
- Lembaga pemerintah, BUMN, atau BUMD

## Kriteria Studi Lanjut (B)

Mendapatkan surat penerimaan untuk melanjutkan studi di jenjang lebih tinggi dalam waktu < 12 bulan setelah lulus:
- PT Akademik: S2/S2 terapan, S3/S3 terapan
- PT Vokasi: S1/S1 terapan, S2/S2 terapan, S3/S3 terapan

## Kriteria Kewirausahaan (C)

- Mulai bekerja dalam < 6 bulan setelah lulus DAN menghasilkan > 1.2× UMP
- Pendiri/co-founder Perusahaan (Bobot = 0.75)
- Pekerja lepas/freelancer (Bobot = 0.25)
- ...atau sudah berpenghasilan > 1.2× UMP sebelum lulus

## Konstanta

- **UMP**: Diambil dinamis dari tabel `tracer.umr_wilayah` berdasarkan `id_wil` (provinsi tempat bekerja) dan `id_tahun_anggaran` (tahun lulus)
- **Threshold**: 1.2× UMP per wilayah
- **Fallback UMP**: Rp 3.006.833 (jika data umr_wilayah belum tersedia)
- **Target IKU 2**: 80%

## Ketentuan

- Data diperoleh melalui hasil **tracer study** 1 tahun setelah kelulusan
- Minimal ≥50% responden lulusan mengisi tracer study
- Validasi tambahan dari pengguna lulusan/instansi tempat bekerja (T1)
- Indikator ini merupakan indikator **wajib** bagi semua perguruan tinggi

## Sumber Data di PDUT Database

### Tabel Utama
- `tracer.hasil_tracer_study` — Data tracer study lulusan
  - `status_lulusan`: 1=Bekerja, 2=Wiraswasta, 3=Kuliah Lanjut, 4=Belum Bekerja
  - `wkt_tunggu`: Waktu tunggu kerja (bulan)
  - `income_per_bln`: Pendapatan per bulan (Rupiah)
  - `a_kerja_sblm_lulus`: 1=sudah bekerja sebelum lulus
  - `id_wil`: Provinsi tempat bekerja (char 8)
- `tracer.umr_wilayah` — UMP per wilayah per tahun
  - `id_wil`: Provinsi (char 8)
  - `id_tahun_anggaran`: Tahun (numeric 4)
  - `besaran_umr`: Besaran UMP (numeric 16,2)
- `pdrd.reg_pd` — Registrasi mahasiswa (tgl_keluar, id_jns_keluar)
- `pdrd.sms` — Program studi (id_jenj_didik, id_fak_unila)
- `pdrd.sms AS fak` — Self-join untuk Fakultas
- `ref.jenjang_pendidikan` — Referensi jenjang

### Lulusan Valid (Denominator)
```sql
reg.id_jns_keluar = '1'        -- Status: Lulus
AND reg.tgl_keluar IS NOT NULL  -- Tanggal lulus tercatat
AND sms.id_jenj_didik IN (22, 23, 30)  -- D3, D4, S1
```

### Status Lulusan dari Tracer (Numerator)
```sql
hts.status_lulusan IN (1, 2, 3)  -- Bekerja, Wiraswasta, Kuliah Lanjut
```

## Implementasi Dashboard

### Backend Files
- `backend/dashboard-service/app/Repositories/Dashboard/IkuRepository.php` — Tambah IKU 2 methods
- `backend/dashboard-service/app/Services/Dashboard/IkuService.php` — Tambah buildIKU2

### API Endpoint (sama dengan IKU 1)
```
GET /api/v1/dashboard/iku?semester=20261&fakultas=<uuid>
```

### Response Shape (tambahan di `data`)
```json
{
  "iku2": {
    "id": 2,
    "code": "IKU 2",
    "title": "Lulusan Langsung Bekerja/Studi Lanjut/Wiraswasta",
    "value": 65.5,
    "target": 80.0,
    "statusBreakdown": {
      "bekerja": 450,
      "wiraswasta": 80,
      "kuliah_lanjut": 120,
      "belum_bekerja": 350
    },
    "kategoriKerja": { "kat1": 200, "kat2": 150, "kat3": 100 },
    "totalLulusan": 1000,
    "totalResponden": 800,
    "responseRate": 80.0,
    "trendData": [...],
    "drilldownData": [...]
  }
}
```
