# KTW — Reconciliation 5 Sumber + Kesimpulan

**Tanggal:** 2026-04-20
**Tujuan:** Consolidate semua formula KTW di codebase Unila + Excel manual + spordit → tentukan definisi authoritative.

## Executive summary — ADA 6 DEFINISI BERBEDA

Berikut ini semua formula KTW / masa studi tepat waktu yang kami temukan di codebase + sumber eksternal:

| # | Sumber | Tipe metrik | Denominator | Numerator (Threshold) | Dipakai untuk |
|---|---|---|---|---|---|
| 1 | **Excel manual** | Cohort (angkatan) | Maba angkatan X | Lulus s.d November (~4.25y S1) | Laporan BAN-PT internal |
| 2 | **Spordit `prosentase_ktw`** | Cohort pada lulusan | Lulusan angkatan X | KTW (masa_mukim ≤ 4.00y tepat) | Dashboard internal spordit |
| 3 | **Spordit `prosentase_ks`** | Cohort rate kelulusan | Maba angkatan X | Total lulusan angkatan X | Dashboard internal spordit |
| 4 | **public-service `KelulusanRepository`** | Year-based flow | Lulusan tahun X (5 thn) | Lulus tepat waktu (DATEDIFF/365.25 ≤ norm) | Infografis public (current) |
| 5 | **SIMBAK `PdutRepository`** | Ever flow | Semua lulus ever | Lulus (DATEDIFF/6+1 ≤ norm_smt) | Monitoring BAK dashboard |
| 6 | **dashboard-service IKU 1 AEE** | Active flow | Mahasiswa AKTIF per semester | Lulus tepat waktu tahun X | IKU 1 Kemdiktisaintek |

**Tidak ada satu angka "benar"** — masing-masing jawab pertanyaan yang berbeda. User harus pilih mana untuk konteks apa.

---

## Detail per-sumber

### 1. Excel manual (KTW-2026-manual-source.xlsx)

- **Sheet per-strata + angkatan:** d3/2022, s1/2021, s2/2023, s3/2021
- **Denominator:** Maba angkatan (populasi awal masuk)
- **Numerator:** Total KTW s.d November (lulus dari angkatan sebelum akhir tahun ke-normatif)
- **Rumus:** `KTW / Maba × 100`
- **Jenjang toleransi:** implisit s.d November (~4.25y untuk S1 yang masuk Agustus)
- **Signed:** Kepala Biro Akademik Hero Satrian Arief, NIP 196802251987031001

Example: S1 angkatan 2021 Total = 3320/6005 = **55.29%**.

### 2. Spordit `masa_studi_generate_lulusan.prosentase_ktw`

- **Engine:** PostgreSQL 192.168.123.39 → database `spordit`
- **Pre-aggregated by batch** (terakhir 2026-04-06, 44116 lulusan)
- **Denominator:** `jml_lulusan_angkatan` (total yang sudah lulus dari angkatan tsb)
- **Numerator:** `jml_ktw` = mahasiswa dengan `masa_mukim_by_tglkeluar ≤ 4.0000` (S1)
- **Rumus:** `prosentase_ktw = jml_ktw / jml_lulusan_angkatan × 100`
- **Grouping:** per-prodi (kdpst), per-tahun (cohort), per-flag_pindahan

Example: S1 Ilmu Hukum 2021 = 420/779 (reguler) → 53.9%. Excel hitung 518/779 = 66.5% karena include Sept-Nov.

**Kelebihan unik spordit:** ada `avg/max/min/modus_masa_mukim + deviasi + flag_bawah_standar`.

### 3. Spordit `prosentase_ks` (kelulusan seluruh)

- Same source tapi formula beda: `jml_lulusan_angkatan / jml_mahasiswa × 100`
- **Pembilang:** total lulus dari angkatan (tidak peduli tepat waktu atau tidak)
- **Penyebut:** total Maba angkatan
- **Arti:** "dari angkatan X, berapa % akhirnya lulus (tepat waktu + terlambat)?"
- Useful metric: **survival rate** angkatan.

### 4. public-service `KelulusanRepository` (existing di infografis public)

```sql
-- Formula di backend/public-service/app/Repositories/KelulusanRepository.php
SUM(CASE
    WHEN sms.id_jenj_didik = 22 AND ROUND(DATEDIFF(DAY, reg.tgl_masuk_sp, reg.tgl_keluar)/365.25, 2) <= 3 THEN 1  -- D3
    WHEN sms.id_jenj_didik = 30 AND ... <= 4 THEN 1  -- S1
    WHEN sms.id_jenj_didik = 35 AND ... <= 2 THEN 1  -- S2
    WHEN sms.id_jenj_didik = 40 AND ... <= 3 THEN 1  -- S3
    ...
END) AS tepat_waktu_count
/ COUNT(*) AS total_lulusan_tahun_ini
```

- **Tipe:** Year-based flow — per tahun lulus, tidak tracking angkatan
- **Denominator:** total lulusan DI TAHUN X (bukan angkatan)
- **Numerator:** lulusan tahun X yang masa studinya ≤ normatif (tahun desimal `/365.25 ≤ norm`)
- **Filter:** `id_jns_keluar=1` (Lulus) + `no_seri_ijazah IS NOT NULL`
- **Threshold pendek pertama ke-2 desimal** (strict, setara spordit)
- **Tampilan:** trend per tahun 5 tahun terakhir

### 5. SIMBAK `PdutRepository::getLulusanPaginated`

```sql
CASE
    WHEN jp.nm_jenj_didik = 'D3' AND DATEDIFF(MONTH, rp.tgl_masuk_sp, rp.tgl_keluar)/6 + 1 <= 6 THEN 1  -- D3: 6 smt
    WHEN jp.nm_jenj_didik = 'S1' AND ... <= 8 THEN 1  -- S1: 8 smt
    WHEN jp.nm_jenj_didik = 'S2' AND ... <= 4 THEN 1  -- S2: 4 smt
    WHEN jp.nm_jenj_didik = 'S3' AND ... <= 6 THEN 1  -- S3: 6 smt
END AS tepat_waktu
```

- **Tipe:** Dihitung per-row lulusan (kolom `tepat_waktu` di listing)
- **Unit:** SEMESTER (DATEDIFF MONTH / 6 + 1)
- **Threshold:** 6/8/4/6 semester untuk D3/S1/S2/S3
- Plus: `getMonitoringStats()` sumatif semua lulus ever → `persen_tepat_waktu`

**Perhatian:** SIMBAK formula `/6+1` menggunakan semester (1-based), sedikit beda dengan yang lain. Contoh mahasiswa masuk Agustus 2021, keluar Juli 2025 (8 bulan × 6 = 48 bulan) → 48/6+1 = 9 semester → **tidak tepat waktu** menurut SIMBAK (threshold S1 ≤ 8).

Bandingkan public-service pakai `DATEDIFF DAY / 365.25`: 1461 hari / 365.25 = 3.998 tahun ≤ 4 → **tepat waktu**.

Jadi SIMBAK lebih strict ~1 semester dari public-service untuk edge case!

### 6. dashboard-service IKU 1 AEE

Config:
```
D3: masa_studi_tahun=3, aee_ideal=33% (1/3 mhs lulus per tahun = ideal)
S1: masa_studi_tahun=4, aee_ideal=25%
S2: masa_studi_tahun=2, aee_ideal=50%
S3: masa_studi_tahun=3, aee_ideal=33%
Target default: 80% tingkat_pencapaian
```

Formula:
```
AEE_realisasi_jenjang = lulus_tepat_waktu_tahun_X / mahasiswa_aktif_semester_X × 100
tingkat_pencapaian     = AEE_realisasi / aee_ideal × 100
AEE_PT                 = rata-rata tingkat_pencapaian semua jenjang
```

- **Denominator:** Mahasiswa AKTIF (berdasarkan `pdrd.kuliah_mhs.id_stat_mhs='A'` semester X) — BUKAN Maba, bukan lulusan, tapi "populasi di tengah studi"
- **Numerator:** Lulus tepat waktu di tahun X dengan `DATEDIFF/365.25 ≤ masa_studi_tahun`
- **Filter ketat:** `id_jns_keluar=1` + `no_seri_ijazah IS NOT NULL` + `sms.stat_prodi='A'`
- **Tujuan:** Kemdiktisaintek IKU Berdampak 2025-2029 (regulasi resmi)

---

## Ilustrasi numerik — 1 prodi, 6 angka beda

Contoh **S1 Ilmu Hukum angkatan 2021, laporan 2025**:

```
Asumsi:
- Maba 2021: 779 mahasiswa
- Lulus s.d Agustus 2025 (tepat waktu strict): 420 mhs (dari spordit jml_ktw)
- Lulus Sep-Nov 2025 (dalam masa tolerance s.d November): 98 mhs tambahan
- Lulus Des 2025 - Juli 2026 (semester ke-9): ??? (future)
- Masih aktif di akhir 2025 (belum lulus): 779 - 518 = 261 mhs
- Mahasiswa aktif S1 Hukum semua angkatan di 2025: ~3000 (estimasi 779×5 - dropout)
- Lulus Hukum S1 tahun 2025 (semua angkatan, tepat waktu): ~420 (asumsi sama dengan jml_ktw 2021)
```

6 angka KTW untuk prodi yang sama:

| # | Definisi | Angka |
|---|---|---|
| 1 | Excel: lulus angkatan 21 s.d Nov / Maba | 518/779 = **66.5%** |
| 2 | Spordit prosentase_ktw: KTW / lulusan_angkatan | 420/779 = **53.9%** (sebenarnya /lulusan_total, tapi misal lulusan = Maba) |
| 3 | Spordit prosentase_ks: lulusan / Maba | 560/779 = **71.9%** (semua yg sudah lulus) |
| 4 | public-service: KTW tahun 2025 / lulusan tahun 2025 | 420/500 = **84.0%** (dari semua yang lulus 2025, 420 tepat waktu) |
| 5 | SIMBAK: semester ≤ 8 (strict) → mirip (4) tapi more strict | 380/500 = **76.0%** |
| 6 | IKU 1 AEE: KTW / mhs aktif | 420/3000 = **14.0%** realisasi vs 25% ideal = **56%** tingkat_pencapaian |

Bisa beda dari 14% sampai 84% tergantung definisi! Ini kenapa user bingung.

---

## Kesimpulan — "Benar" itu konteksual

### Untuk publikasi umum / calon mahasiswa / orang tua
**Pakai Excel style (definisi #1 atau #3).**
- Mudah dipahami: "dari 779 maba angkatan 2021, 518 (66%) sudah lulus tepat waktu"
- Cocok untuk website public, brosur fakultas
- Konfirmasi: Excel ini authoritative laporan signed oleh Kepala Biro Akademik

### Untuk BAN-PT / Akreditasi
**Pakai spordit prosentase_ktw (definisi #2) dengan cohort tracking.**
- Metric PTM yang BAN-PT ekspetasi: per angkatan, per prodi, masa studi ≤ normatif strict
- Pre-aggregated di spordit = konsisten batch-to-batch
- Tambahkan data "sudah lulus total" (#3) untuk kelengkapan

### Untuk Kemdiktisaintek IKU
**Pakai IKU 1 AEE (definisi #6).**
- Sudah ada di dashboard-service, sesuai regulasi Kepmendikbudristek
- Target 80% tingkat_pencapaian
- Unit pembanding: jenjang (aee_ideal per D3/S1/S2/S3)

### Untuk monitoring internal BAK (operasional harian)
**Pakai SIMBAK (#5) atau public-service (#4).**
- Realtime dari pdut
- Listing per mahasiswa dengan flag tepat_waktu
- SIMBAK lebih strict, public-service match spordit

---

## Usulan architecture: ONE TRUTH, MULTI-VIEW

Daripada punya 6 angka yang bisa conflict, gunakan pola "single source of truth di database, multi-view di UI":

```
┌────────────────────────────────────────────────────────┐
│ Data raw di pdut (SQL Server) — SOURCE OF TRUTH        │
│ - siakadu.reg_pd + pdrd.peserta_didik + pdrd.sms        │
│   + ref.jenjang_pendidikan + ref.semester              │
└────────────────────────┬───────────────────────────────┘
                         │
     ┌───────────────────┼───────────────────┐
     ▼                   ▼                   ▼
┌─────────┐       ┌──────────────┐     ┌──────────────┐
│ Spordit │       │  (NEW) KTW   │     │ dashboard-   │
│ batch   │       │ Service di   │     │ service IKU  │
│ monthly │       │ public-      │     │ 1 AEE        │
└─────────┘       │ service      │     └──────────────┘
                  └──────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ Frontend tampilan    │
              │ tri-view:            │
              │  A. KTW angkatan     │
              │  B. KTW tahun lulus  │
              │  C. AEE (IKU)        │
              │ + tooltip definisi   │
              └──────────────────────┘
```

### KTW Service baru (extend `backend/public-service/app/Services/`)

Method konsisten dengan param `definisi`:
```
getByAngkatan(strata, angkatan, definisi='ban_pt')
getByTahunLulus(strata, tahun, definisi='ban_pt')
getByAktif(strata, semester, definisi='iku')
```

`definisi` enum:
- `excel_internal` — s.d November (Excel-like), /Maba
- `ban_pt_strict` — ≤ masa normatif tepat (spordit-like), /lulusan_angkatan
- `ban_pt_survival` — prosentase_ks (spordit-like), /Maba
- `iku_aee` — AEE formula (IKU 1 style)

Semua method return:
```json
{
  "definisi": "ban_pt_strict",
  "strata": "S1",
  "scope": "angkatan_2021",
  "numerator": 420,
  "denominator": 779,
  "percentage": 53.9,
  "source": "spordit",
  "source_as_of": "2026-04-06",
  "reconcile": {
    "pdut_realtime": 422,
    "drift_vs_source": -2,
    "ok": true
  }
}
```

### Frontend switch
Toggle di UI: **[BAN-PT Strict] [Internal Nov] [Survival] [IKU AEE]** — user pilih. Default = BAN-PT Strict.

---

## Action items (terupdate dari brainstorm sebelumnya)

### Prioritas tinggi
1. ✋ **KONFIRMASI DEFINISI AUTHORITATIVE** sebelum coding — tanya Kabag Akademik tentang which definisi dipakai untuk report formal mana.
2. **Master mapping prodi by kode_dikti** — wajib sebelum integrasi multi-sumber (lihat §naming mismatch di doc 01).
3. **Buat KTW Service** di public-service yang terima parameter definisi.
4. **Reconcile scheduled** — compare 4 sumber (excel belum realistic untuk auto, tapi spordit vs pdut vs IKU1 bisa).

### Prioritas menengah
5. Frontend drilldown dengan tri-view definisi.
6. Export Excel/PDF format mirip manual existing (BAN-PT ready).
7. Alert Telegram kalau drift antar sumber > 10%.

### Prioritas rendah
8. Excel manual upload tool di admin UI (biar BAK bisa upload per semester + auto-compare dengan spordit).
9. Mahasiswa self-service view "masa studi saya" dengan prediksi KTW.

---

## Pertanyaan terbuka (reduced dari 6 jadi 3 yang paling penting)

1. **Authoritative mana?** (definisi 1-6 di atas) — default saya: BAN-PT strict = spordit. Excel = internal reference saja.
2. **Bagaimana handle "s.d November" tolerance?** — banyak institusi akui semester ganjil tambahan. Mau dipisah sebagai definisi sendiri atau tidak?
3. **Apakah Excel harus jadi source of truth override?** Excel di-sign oleh Kepala Biro BAK = dokumen authoritative. Kalau iya, perlu upload mechanism + ubah UI prioritizes Excel values.
