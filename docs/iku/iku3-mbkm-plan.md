# IKU 3: Persentase Mahasiswa S1 dan D4/D3/D2/D1 Berkegiatan/Meraih Prestasi di Luar Program Studi

## Definisi
Persentase mahasiswa aktif jenjang Sarjana (S1) dan Diploma (D4/D3/D2/D1) yang mengikuti kegiatan pembelajaran, penelitian, pengabdian, kewirausahaan, atau kompetisi di luar program studinya, serta meraih prestasi yang diakui secara resmi minimal tingkat nasional.

## Formula

```
IKU 3 = (A + B) / Total Mahasiswa Aktif S1 & Diploma × 100
```

- **A** = Mahasiswa yang mendapatkan pengalaman & pengakuan SKS dari kegiatan di luar kampus (MBKM)
- **B** = Mahasiswa yang meraih prestasi minimal tingkat nasional

Catatan: Mahasiswa yang masuk A dan B sekaligus hanya dihitung sekali (UNION).

## Jenjang yang Dihitung

| Code | Jenjang |
|------|---------|
| 20   | D1      |
| 21   | D2      |
| 22   | D3      |
| 23   | D4      |
| 30   | S1      |

## Kriteria Pengalaman di Luar Kampus (A)

Mahasiswa yang mendapatkan pengalaman dan pengakuan SKS dari kegiatan di luar kampus (dengan dosen pembimbing), sesuai dengan Buku Panduan IKU Diktisaintek Berdampak. Kegiatan boleh dikombinasikan dan dihitung kumulatif:

### Jenis Kegiatan
- **Magang atau Praktek Kerja**: Di perusahaan swasta (nasional, multinasional, UMKM, startup), perusahaan nirlaba, institusi/organisasi multilateral, lembaga pemerintah, BUMN, atau BUMD
- **Program Mahasiswa Berdampak**: Pengabdian kepada masyarakat untuk pemberdayaan masyarakat di pedesaan atau daerah terpencil
- **Pertukaran Pelajar**: Mengambil kelas atau semester di PT luar/dalam negeri berdasarkan perjanjian kerjasama
- **Penelitian atau Riset**: Riset akademik di bawah pengawasan dosen atau peneliti
- **Kompetisi/Lomba**: Minimal tingkat provinsi, nasional dan internasional, dibuktikan dengan sertifikat penghargaan

### Deteksi dari Database
1. `pdrd.akt_mhs` JOIN `ref.jenis_akt_mhs` WHERE `a_kegiatan_kampus_merdeka = 1`
2. Harus memiliki konversi SKS: `mbkm.konversi_akt_mhs` (sks_mk > 0) ATAU `mbkm.ekuiv_transfer` (sks_diakui > 0)

## Kriteria Prestasi (B)

Mahasiswa yang meraih prestasi minimal tingkat nasional:
- `pdrd.prestasi` dengan `id_tkt_prestasi IN (5, 6)` — Nasional atau Internasional
- Tahun prestasi sesuai filter

### id_tkt_prestasi Mapping
| ID | Tingkat |
|----|---------|
| 1,2,3,4,7,9 | Lokal/Regional |
| 5 | Nasional |
| 6 | Internasional |

## Konstanta
- **Target IKU 3**: 50%

## Ketentuan
- Hanya mahasiswa aktif jenjang S1 dan Diploma
- Data kegiatan MBKM dari modul MBKM terintegrasi PDUT
- Konversi SKS harus tercatat di sistem
- Prestasi harus tervalidasi oleh dosen pembimbing atau kepala prodi
- Indikator ini merupakan indikator **wajib** bagi semua perguruan tinggi

## Sumber Data di PDUT Database

### Tabel Utama
- `pdrd.kuliah_mhs` — Mahasiswa aktif per semester (id_stat_mhs = 'A') — **Denominator**
- `pdrd.akt_mhs` — Aktivitas mahasiswa (id_jns_akt_mhs, id_sms, id_smt)
- `pdrd.anggota_akt_mhs` — Peserta aktivitas (id_reg_pd, id_akt_mhs)
- `ref.jenis_akt_mhs` — Referensi jenis aktivitas (a_kegiatan_kampus_merdeka flag)
- `mbkm.konversi_akt_mhs` — Konversi SKS dari aktivitas MBKM (sks_mk)
- `mbkm.ekuiv_transfer` — Ekuivalensi transfer SKS (sks_diakui)
- `pdrd.prestasi` — Prestasi mahasiswa (id_tkt_prestasi, id_pd, thn_prestasi)
- `ref.tingkat_prestasi` — Level prestasi
- `pdrd.sms` — Program studi (id_jenj_didik, id_fak_unila)
- `pdrd.sms AS fak` — Self-join untuk Fakultas

## Implementasi Dashboard

### Backend Files
- `backend/dashboard-service/app/Repositories/Dashboard/IkuRepository.php` — Tambah IKU 3 methods
- `backend/dashboard-service/app/Services/Dashboard/IkuService.php` — Tambah buildIKU3

### API Endpoint (sama dengan IKU 1 & 2)
```
GET /api/v1/dashboard/iku?semester=20261&fakultas=<uuid>
```

### Response Shape (tambahan di `data`)
```json
{
  "iku3": {
    "id": 3,
    "code": "IKU 3",
    "title": "Mahasiswa Berkegiatan di Luar Program Studi",
    "value": 34.8,
    "target": 50.0,
    "kegiatanBreakdown": [
      { "jenis_kegiatan": "Magang/Praktek Kerja", "jumlah_mahasiswa": 150 },
      { "jenis_kegiatan": "Pertukaran Pelajar", "jumlah_mahasiswa": 80 }
    ],
    "mbkm": 400,
    "prestasiNasional": 120,
    "totalAktif": 15000,
    "totalBerkegiatan": 480,
    "trendData": [...],
    "drilldownData": [...]
  }
}
```
