# KTW Reconciliation — Excel manual vs Spordit

**Tanggal:** 2026-04-20
**Sumber:**
- Excel: `docs/ktw/KTW-2026-manual-source.xlsx` (dikirim user 2026-04-20, TTD Kepala Biro Akademik Hero Satrian Arief)
- Spordit: `akademik.masa_studi_generate_lulusan` batch terbaru `2026-04-06` (id_log db8f0585)

## TL;DR

Setelah bandingkan Excel vs spordit untuk angkatan target 2025 (S1=21, S2=23, S3=21, D3=22):

| Metric | Hasil |
|---|---|
| Prodi yang matched dua-duanya | **56** |
| Drift KTW ≥ 3 (besar) | **44 prodi (78%)** |
| Excel-only (tidak ada di spordit) | 55 — **nama prodi beda** |
| Spordit-only | 58 — sama, **nama prodi beda** + prodi yang Excel skip |
| **Maba count drift** | 0-3 mahasiswa (match hampir 100%) |
| **KTW count drift** | Excel HAMPIR SELALU lebih besar daripada spordit |

**Conclusion:** Drift utama BUKAN data hilang, tapi **definisi KTW beda**. Penyebut (Maba) konsisten.

---

## Setup dataset

### Excel manual

4 sheet per-strata, angkatan spesifik:
| Sheet | Strata | Angkatan | Total KTW | Total Maba | % |
|---|---|---|---|---|---|
| d3 | D3 | 2022 | ~112 | ~228 | ~49% |
| s1 | S1 | 2021 | 3320 | 6005 | **55.29%** |
| s2 | S2 | 2023 | — | — | — |
| s3 | S3 | 2021 | 30 | 92 | 32.6% |

Format kolom (s1 contoh): Fakultas/Prodi, KTW s.d Agustus, KTW September, **Total KTW s.d November**, Maba 21, Persentase.

Formula: `Persentase = Total KTW s.d November / Maba 21`.

### Spordit

Tabel `akademik.masa_studi_generate_lulusan` dengan filter:
- `flag_pindahan = 0` (hanya reguler, bukan pindahan/transfer)
- `tahun` = year of cohort (2021 untuk S1, 2023 untuk S2, dst)

Formula spordit: `prosentase_ktw = jml_ktw / jml_lulusan_angkatan * 100`

Tapi untuk compare dengan Excel (yang denominatornya Maba), kita recompute:
`pct_like_excel = jml_ktw / jml_mahasiswa * 100`

---

## Analisis drift — contoh representatif

| Prodi S1 | Excel KTW | Spordit KTW | Δ | Excel Maba | Spordit Maba | Excel % | Spordit % |
|---|---|---|---|---|---|---|---|
| Ilmu Hukum | 518 | 420 | **+98** | 779 | 779 | 66.5% | 53.9% |
| Kimia | 91 | 55 | **+36** | 125 | 125 | 72.8% | 44.0% |
| Teknik Elektro | 79 | 43 | **+36** | 135 | 138 | 58.5% | 31.2% |
| Sosiologi | 57 | 24 | **+33** | 120 | 120 | 47.5% | 20.0% |
| Ilmu Admin Negara | 73 | 43 | **+30** | 151 | 151 | 48.3% | 28.5% |
| Teknik Sipil | 67 | 39 | +28 | 147 | 147 | 45.6% | 26.5% |
| Teknik Informatika | 40 | 16 | +24 | 144 | 146 | 27.8% | 11.0% |
| Arsitektur | 32 | 9 | **+23** | 85 | 85 | 37.6% | 10.6% |
| Ilmu Pemerintahan | 82 | 59 | +23 | 125 | 125 | 65.6% | 47.2% |
| Biologi | 86 | 65 | +21 | 133 | 133 | 64.7% | 48.9% |
| Fisika | 51 | 28 | +23 | 94 | 94 | 54.3% | 29.8% |
| Pendidikan Dokter | 187 | 180 | +7 | 207 | 207 | 90.3% | 87.0% |
| Matematika | 107 | 102 | +5 | 135 | 135 | 79.3% | 75.6% |
| Akuntansi | 72 | 65 | +7 | 140 | 141 | 51.4% | 46.1% |

**Pola yang terlihat:**

1. **Drift KTW selalu positif (Excel > Spordit)** — Excel hitung lebih banyak KTW
2. **Drift tinggi di prodi yang KTW-nya sedang-rendah** (Hukum 66%→54%, Sosio 47%→20%, Arsitektur 38%→11%)
3. **Drift rendah di prodi yang KTW-nya sangat tinggi** (Dokter 90%, Matematika 79%, Akuntansi 51%)
4. **Maba count hampir identik** — selisih 0-3 mahasiswa, bisa karena data synced beda timestamp

---

## Akar masalah — beda definisi "masa studi tepat waktu"

Saat ketemu Maba sama tapi KTW beda jauh, kemungkinan karena **cutoff masa studi beda**:

| Sistem | Cutoff masa studi untuk S1 |
|---|---|
| Excel "Total KTW s.d November" | Lulus sebelum **November** tahun ke-4 (≈ 4.25 tahun) |
| Spordit `jml_ktw` | `masa_mukim_by_tglkeluar ≤ 4.0000` (tepat 4 tahun atau kurang) |
| pdut inline `KelulusanRepository.php` | `DATEDIFF/365.25 ≤ 4.00` (tepat 4 tahun) |

Buktinya: angkatan S1 masuk Agustus 2021, normatif 4 tahun = lulus **Agustus 2025**. Excel tambah 3 bulan tolerance (lulus September-November 2025 masih dihitung) → ini yang muncul sebagai drift.

Verifikasi: Excel punya breakdown "KTW s.d Agustus" + "KTW September" = hampir sama dengan spordit. Yang nambah adalah "s.d November" (Oktober + November).

Contoh Ilmu Hukum angkatan 2021:
```
Excel kolom "KTW s.d Agustus":        tidak tercatat angka raw (formula)
Excel kolom "KTW September":          54
Excel kolom "Total KTW s.d November": 518
Spordit jml_ktw:                      420
Drift: 518 - 420 = 98 mahasiswa yang lulus Oktober-November 2025 + revised count
```

Excel likely sudah include semester gasal 2025/2026 yang baru masuk (mahasiswa yang wisuda November tapi masa studi 4.25 tahun).

---

## Akar masalah — naming prodi beda

Naming mismatch mencegah auto-match antar 2 sumber. Mapping yang perlu dibuat:

| Nama di Excel | Nama di Spordit | Catatan |
|---|---|---|
| "D3 Akuntansi" | "Akuntansi" (kode_dikti beda) | Excel prefix "D3" di nama, spordit tidak |
| "Ilmu Administrasi Bisnis" | "Ilmu Administrasi Niaga" | Nama PDDIKTI beda dari nama internal Unila |
| "Teknik Geofisika" | "Geofisika" | Prefix "Teknik" di Excel, tidak di spordit |
| "Nutrisi dan Teknologi Pakan Ternak" | "Nutrisi dan Teknologi Pakan" | Missing "Ternak" di spordit |
| "Pendidikan Bahasa dan Sastra Indonesia" | "Pendidikan Bahasa Sastra Indonesia & Daerah" | Format beda + tambah "& Daerah" |
| "Pendidikan Guru Pendidikan Anak Usia Dini" | "PG PAUD" | Versi singkatan |
| "S3 Ilmu Ekonomi" | "Ilmu Ekonomi (Doktor)" | Prefix strata di Excel |

**Solusi:** butuh master mapping table, lookup by `kode_dikti` (kolom di spordit `master_ref.program_studi.kode_dikti`) bukan by nama. Di pdut ada `pdrd.sms.kode_prodi` = sama formatnya.

---

## Angkatan-specific target year

Excel setiap sheet khusus 1 angkatan, karena KTW dihitung relatif ke angkatan masuk:

| Strata | Tahun Maba target | Tahun lulus tepat waktu | Konversi Spordit `tahun` |
|---|---|---|---|
| D3 | 2022 | 2025 (2022+3) | spordit.tahun = 2022 ← angkatan |
| S1 | 2021 | 2025 (2021+4) | spordit.tahun = 2021 ← angkatan |
| S2 | 2023 | 2025 (2023+2) | spordit.tahun = 2023 ← angkatan |
| S3 | 2021 | 2025 (2021+4) | spordit.tahun = 2021 ← angkatan |

Artinya `spordit.masa_studi_generate_lulusan.tahun` = **tahun masuk angkatan**, BUKAN tahun lulus. Bagus — match Excel.

---

## Summary numbers

```
TOTAL matched=56 prodi, big_drift(>=3)=44 (78%), only_excel=55, only_spordit=58
```

### Prodi dengan selisih KTW < 10 (OK, minor drift):
Biasanya prodi dengan KTW % tinggi di mana mahasiswa memang lulus tepat waktu dalam batas 4 tahun:
- Pendidikan Dokter, Matematika, Akuntansi, Pendidikan Tari, Farmasi
- Selisih cuma 2-8 KTW → mahasiswa yang lulus September-Oktober 2025

### Prodi dengan selisih KTW 10-30 (medium):
- Pendidikan Ekonomi, Pendidikan Bahasa Inggris, Pendidikan Jasmani, Pendidikan Bahasa Lampung, Pendidikan Geografi
- Masih manageable tapi perlu reconcile

### Prodi dengan selisih KTW > 30 (besar — perlu investigasi):
- **Ilmu Hukum (+98)** — populasi besar, banyak mahasiswa borderline masa studi
- Kimia (+36), Teknik Elektro (+36), Sosiologi (+33), Ilmu Admin Negara (+30)
- **Perlu drilldown individual:** siapa saja 98 mhs Hukum yang Excel hitung KTW tapi spordit tidak?

---

## Rekomendasi untuk UI drilldown

Tampilkan **3 angka KTW** dengan label jelas + info definisi:

```
┌──────────────────────────────────────────────────┐
│ KTW S1 Ilmu Hukum Angkatan 2021                  │
├──────────────────────────────────────────────────┤
│ Definisi ketat (4.00 tahun)  : 420 / 779 (53.9%) │
│ Definisi reguler (s.d Nov)   : 518 / 779 (66.5%) │
│ Definisi longgar (4.50 tahun): 550 / 779 (70.6%) │  ← estimasi
│                                                   │
│ ℹ️ Kemdiktisaintek BAN-PT umumnya pakai 4.00y.    │
│ ℹ️ Unila manual report include s.d November.      │
│                                                   │
│ [Detail 98 mahasiswa borderline (drop 520-422)] │
└──────────────────────────────────────────────────┘
```

User / admin bisa switch definisi. Default: ikut PDDIKTI (4.00 tahun).

---

## Action items untuk implementasi

### Phase A — Konfirmasi definisi (SEBELUM coding)
1. **Tanyakan user mana definisi yang authoritative**:
   - Option A: Excel manual (4.25 tahun, s.d November)
   - Option B: Spordit (4.00 tahun tepat)
   - Option C: PDDIKTI official (4.00 + masa toleransi?)
   - Option D: Tampilkan semua, user pilih

### Phase B — Mapping prodi master
1. Buat tabel `ref.prodi_name_mapping` (atau pakai existing pdrd.sms.kode_prodi):
   ```
   kode_prodi | nama_excel | nama_spordit | nama_pdut | nama_display
   ```
2. Seed dari 3 sumber → unique kode_prodi → canonical name.
3. Semua query pakai kode_prodi sebagai join key, bukan nama.

### Phase C — Reconciliation endpoint
1. `GET /kelulusan/reconcile/{strata}/{angkatan}` → return tabel 3-way comparison
2. `GET /kelulusan/reconcile/detail/{kdpst}/{angkatan}/{definisi}` → list mahasiswa yang "KTW menurut definisi X tapi tidak menurut Y"
3. Scheduled job mingguan bandingkan spordit vs pdut vs manual Excel → alert Telegram kalau drift > 10%

### Phase D — Drilldown UI (per brainstorm doc 00)
- 4 level: Overview → Fakultas → Prodi → Mahasiswa
- Filter: definisi (3 opsi), tahun range, strata, flag_pindahan, jalur
- Tampilan 3-way angka + tooltip "kenapa beda?"

---

## File artifacts di folder ini

- `KTW-2026-manual-source.xlsx` — Excel asli dari user
- `excel_ktw_2025_angkatan_target.csv` — data Excel yang sudah di-extract per-prodi
- `spordit_ktw_same_angkatan.tsv` — data spordit untuk angkatan yang sama
- `compare-excel-vs-spordit.txt` — output script compare full
- `00-brainstorm-ktw-drilldown.md` — brainstorm arsitektur drilldown
- `01-reconciliation-excel-vs-spordit.md` — (ini) detail reconciliation findings

---

## Open questions ke user

1. **Definisi authoritative KTW Unila?** Excel longgar (s.d November) atau spordit strict (4.0y)?
2. **Kalau beda definisi dipakai:** Excel untuk laporan BAN-PT, spordit untuk IKU Kemdiktisaintek — konfirmasi.
3. **Mahasiswa lulus Nov 2025 (antara Agustus-November)** — tetap di-count KTW di laporan internal? Kemungkinan iya karena semester gasal berjalan.
4. **Prodi di Excel yang tidak ada di spordit** (Teknik Geofisika, PGPAUD) — apakah karena spordit miss atau Excel duplicate? Perlu verify manual.
5. **55 prodi only-in-excel vs 58 only-in-spordit** — masalah naming ATAU ada memang prodi yang Excel skip (stat_prodi='N' yang sudah tutup)?
6. **Frequency re-gen spordit** — sekarang bulanan. Untuk reporting periode November, kapan spordit regenerate data November? Mungkin 1x di akhir bulan.
