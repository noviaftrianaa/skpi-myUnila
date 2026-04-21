# KTW (Kelulusan Tepat Waktu) — Analisis & Drilldown per-Prodi

**Status:** brainstorm (2026-04-20)
**Author:** Dev team MyUnila

## Konteks

Public infografis MyUnila sudah punya `KelulusanTepatWaktu` component (di `frontend/src/app/(public)/infografis/page.tsx`) yang tampilkan statistik ringkas. User minta lebih **kompleks + detail + drilldown per-prodi** yang akurat.

Dua sumber data tersedia — perlu di-cross check biar akurat:

1. **pdut** (SQL Server, 192.168.123.119) — source of truth feeder PDDIKTI
2. **spordit** (PostgreSQL, 192.168.123.39) — dashboard internal sistem operasional (punya tabel pre-agregasi KTW yang jauh lebih kaya)

---

## Definisi KTW (per regulasi PDDIKTI / Kemdiktisaintek)

Lulusan dianggap **Tepat Waktu** kalau masa studi ≤ masa studi normatif per jenjang:

| Jenjang | Kode PDDIKTI | Masa normatif |
|---|---|---|
| D1 | 20 | 1 tahun |
| D2 | 21 | 2 tahun |
| D3 | 22 | 3 tahun |
| D4 | 23 | 4 tahun |
| S1 | 30 | 4 tahun |
| S2 (Magister) | 35 | 2 tahun |
| S3 (Doktor) | 40 | 3 tahun (atau 4 untuk program tertentu) |
| Profesi | 31–37 (bervariasi) | 2 tahun (umumnya) |

Masa studi = `tgl_keluar - tgl_masuk_sp` (dalam tahun, biasanya dibulatkan 2 desimal).

**Formula:**
```
KTW (%) = (lulusan dengan masa_studi ≤ normatif per jenjang) / total_lulusan * 100
```

Catatan: beberapa institusi definisikan penyebut sebagai **angkatan** (`total_mhs_angkatan`), bukan total lulusan. Bedanya:
- **KTW / total_lulusan** = "dari yang lulus, berapa % tepat waktu?" — bias bagus karena yang drop-out tidak masuk
- **KTW / total_angkatan** = "dari yang masuk angkatan X, berapa % lulus tepat waktu?" — lebih jujur tapi butuh tunggu 4+ tahun

Spordit punya **dua**:
- `jml_ktw / jml_lulusan_angkatan` → `prosentase_ktw` (KTW terhadap lulusan angkatan)
- `jml_lulusan_angkatan / jml_mahasiswa` → `prosentase_ks` (kelulusan seluruh — berapa persen yang lulus dari angkatan)

Kedua-duanya useful. **Idealnya tampilkan dua-duanya.**

---

## Sumber data 1 — pdut (SQL Server)

### Relevant tables

```
pdrd.peserta_didik     — master mahasiswa (id_pd, nim, nm_pd)
pdrd.reg_pd            — registrasi per semester (id_reg_pd, id_pd, id_sms, tgl_masuk_sp, tgl_keluar, id_jns_keluar, no_seri_ijazah)
pdrd.sms               — prodi/fakultas (id_sms, id_jns_sms=3, id_fak_unila, id_jenj_didik, nm_lemb, kode_prodi)
ref.jenjang_pendidikan — D1..S3 (id_jenj_didik, nm_jenj_didik)
ref.semester           — referensi semester aktif
```

### Implementasi existing (backend/public-service/app/Repositories/KelulusanRepository.php)

- Hitung KTW **inline SQL** pakai `DATEDIFF` tanpa cache
- Threshold per-jenjang hardcode di CASE WHEN (20/21/22/23/30/31/32/35/36/37/40/...)
- Filter `reg.id_jns_keluar='1'` (Lulus) AND `no_seri_ijazah IS NOT NULL` (sudah wisuda formal)
- `reg.id_sp = UNILA_ID_SP` (scope ke Unila)
- Scope tahun: 5 tahun terakhir

**Endpoint existing:** `GET /kelulusan/statistics` (public-service/OpenApi).

### Plus & minus pdut source

✅ Source of truth PDDIKTI — selalu selaras dengan laporan resmi
✅ Real-time (data berubah begitu mahasiswa lulus)
✅ Detail per-mahasiswa bisa di-drilldown
❌ Query berat kalau range tahun besar atau ribuan prodi
❌ Tidak ada pre-agregasi
❌ Penyebut (angkatan vs lulusan) tidak disiapkan — harus di-derive

---

## Sumber data 2 — spordit (PostgreSQL)

### Relevant tables

```
akademik.mahasiswa_feeder              — snapshot semua mahasiswa feeder (137k rows, periode 20101–20252)
akademik.generate_lulusan              — header batch generate (tgl_generate, total_lulusan, flag_finish)
akademik.detail_generate_lulusan       — breakdown total lulusan by strata + flag_pindahan + tahun
akademik.detail_generate_lulusan_tahunan — breakdown by tahun
akademik.detail_byjalur_generate_lulusan — breakdown by jalur daftar (SNMPTN/SBMPTN/Mandiri/dll)
akademik.detail_status_mhs_tahunan     — breakdown status mahasiswa per tahun
akademik.masa_studi_generate_lulusan   — ⭐ PRE-AGGREGATED per-prodi per-tahun dengan:
  - jml_mahasiswa (angkatan)
  - jml_lulusan_angkatan
  - jml_ktw
  - prosentase_ktw
  - prosentase_ks
  - avg/max/min/modus masa_mukim + jumlahnya
  - deviasi (standar deviasi)
  - flag_ktw_bawah_standar, flag_ks_bawah_standar
  - flag_pindahan (pisah mhs reguler vs transfer)
akademik.rekap_lulusan_lima_terakhir   — rekap 5 tahun terakhir
master_ref.program_studi               — daftar prodi + kode_fak + kode_strata + nama_program_studi
master_ref.fakultas                    — daftar fakultas
master_ref.strata_program              — D1/D2/D3/D4/S1/S2/S3/Profesi
master_ref.masa_studi                  — referensi masa studi normatif
master_ref.status_mahasiswa            — referensi id_jenis_keluar
```

### Contoh data live

```
 tahun | kdpst | nama_program_studi                 | strata | total | ktw | %_ktw   | %_ks    | avg_mukim
-------+-------+------------------------------------+--------+-------+-----+---------+---------+----------
  2022 | 11201 | Pendidikan Dokter                  | S1     |   184 | 184 |  74.80  |  74.80  | 3.40
  2022 | 74101 | Ilmu Hukum                         | S2     |   107 |  58 |  46.77  |  86.29  | 2.07
  2022 | 63411 | Administrasi Perkantoran           | D3     |    14 |  13 |  72.22  |  77.78  | 2.87
  ...
```

Ada 44116 rows lulusan total per batch terbaru (2026-04-06). Pre-agregasi dijalankan ulang oleh scheduler — terakhir update 2026-04-06, sebelumnya 2026-03-09.

### Plus & minus spordit source

✅ PRE-AGGREGATED — query sangat cepat, cocok dashboard
✅ Statistik lengkap: avg/max/min/modus masa_mukim, deviasi, flag bawah standar
✅ Ada `flag_pindahan` untuk pisah reguler vs transfer
✅ Breakdown per-jalur daftar (SNMPTN/SBMPTN/Mandiri)
✅ Penyebut angkatan + lulusan sudah siap (prosentase_ktw + prosentase_ks)
❌ Tidak real-time — tergantung schedule (bulanan?)
❌ Beda DB, beda credentials, beda network
❌ Data historical — kalau mau evolusi selama semester berjalan, tidak bisa
❌ Kemungkinan beda sama pdut kalau sync lag

---

## Strategi cross-check (akurasi)

Tampilkan kedua sumber dengan label jelas:

| Metric | pdut (realtime) | spordit (snapshot) | Selisih |
|---|---|---|---|
| Total lulusan 2024 | 4500 | 4498 | -2 (0.04%) |
| KTW % S1 2024 | 62.3 | 62.5 | +0.2 |
| ... | | | |

Kalau selisih < 2% → pakai spordit (cepat). Kalau ≥ 2% → flag "perlu reconcile", sementara fallback ke pdut.

**Reconcile logic:**
```
IF abs(spordit.val - pdut.val) / spordit.val < 0.02
THEN trust spordit
ELSE trust pdut + log discrepancy
```

Di admin panel, ops bisa trigger "Sync Reconcile" yang bandingkan per-prodi + highlight mana yang drift.

---

## Drilldown architecture

### Level 0 — University overview
- Total lulusan 5 tahun terakhir
- KTW % university-wide (weighted average)
- Trend line 5 tahun
- Leaderboard top/bottom prodi by KTW%

### Level 1 — Fakultas
- Pilih fakultas → tampilkan prodi di fakultas tsb
- KTW% per-prodi dalam fakultas
- Ranking prodi dalam fakultas
- Trend per-prodi overlaid

### Level 2 — Prodi (paling detail)
- Header: nama prodi, strata, masa normatif
- KTW% trend 10 tahun (line chart)
- Distribusi masa_mukim histogram (pakai max/min/modus/avg/deviasi dari spordit)
- Breakdown by jalur_daftar (SNMPTN/SBMPTN/Mandiri) — pakai `detail_byjalur_generate_lulusan`
- Breakdown reguler vs pindahan (`flag_pindahan`)
- Breakdown by gender (`total_lulusan_l` / `total_lulusan_p`)
- Table list lulusan (dari pdut realtime atau mahasiswa_feeder) dengan filter
- Flag warning kalau `flag_ktw_bawah_standar=1` atau `flag_ks_bawah_standar=1`

### Level 3 — Mahasiswa individual
- NIM/npm, nama, tanggal masuk/keluar, masa_mukim
- Transkrip/IPK lulus (ipk_lulus di spordit)
- Jalur masuk
- Opsi export CSV

---

## Endpoint plan (public-service API)

Extend existing `KelulusanRepository` + `KelulusanService` + `KelulusanController`:

```
GET /kelulusan/statistics                      — current endpoint, retain untuk backward-compat
GET /kelulusan/overview                        — level 0 dashboard data
GET /kelulusan/fakultas                        — list dengan KTW% per-fakultas
GET /kelulusan/fakultas/{kode_fak}             — level 1 (fakultas detail + daftar prodi)
GET /kelulusan/prodi                           — list semua prodi paginated
GET /kelulusan/prodi/{kdpst}                   — level 2 (prodi detail + trend)
GET /kelulusan/prodi/{kdpst}/mahasiswa         — level 3 list
GET /kelulusan/prodi/{kdpst}/distribusi        — histogram masa_mukim
GET /kelulusan/prodi/{kdpst}/jalur             — breakdown jalur daftar
GET /kelulusan/prodi/{kdpst}/gender            — breakdown gender
GET /kelulusan/trend?dari=2018&sampai=2024&strata=S1  — time-series
GET /kelulusan/compare?kdpst[]=X&kdpst[]=Y     — compare 2+ prodi
GET /kelulusan/reconcile                       — admin only, drift check pdut vs spordit
```

Parameters umum: `tahun`, `strata` (kode), `kode_fak`, `flag_pindahan` (0/1/all), `jalur` (kode), `gender` (L/P).

Sumber data:
- Default: spordit (cepat, pre-agregasi)
- Fallback + reconcile: pdut
- Real-time drill-down list mahasiswa: pdut

---

## Perubahan frontend

### Komponen baru

```
frontend/src/app/(public)/infografis/components/
  ktw/
    KTWOverview.tsx          — level 0 card + trend line
    KTWFakultasList.tsx      — level 1 list fakultas
    KTWProdiDetail.tsx       — level 2 dashboard per-prodi
    KTWDistributionChart.tsx — histogram masa_mukim
    KTWJalurBreakdown.tsx    — pie chart jalur daftar
    KTWGenderBreakdown.tsx   — pie/bar L vs P
    KTWProdiCompare.tsx      — bandingkan 2+ prodi
    KTWReconcileAlert.tsx    — warning drift pdut vs spordit
```

### Halaman baru / extend

- `/infografis/ktw` — landing KTW (public)
- `/infografis/ktw/fakultas/[kode]` — drilldown level 1
- `/infografis/ktw/prodi/[kdpst]` — drilldown level 2
- Dashboard internal `/dashboard/pimpinan/lulusan` extend dengan komponen yang sama

### UX pattern

- Breadcrumb: Overview → Fakultas XX → Prodi YY
- Filter chip: Tahun range, Strata (D1-S3), Jalur
- Tombol export CSV per-level
- Tombol "Compare" untuk pilih 2+ prodi sejajar
- Tooltip definisi KTW + masa normatif per strata
- Flag visual merah kalau bawah standar (BAN-PT biasanya 50% KTW sebagai threshold)

---

## Edge cases yang perlu dihandle

1. **Mahasiswa cuti** — masa studi dihitung termasuk cuti atau dikurangi? Per regulasi PDDIKTI, cuti resmi (id_smt 1-2 kali) di-EXCLUDE dari masa studi. `masa_mukim_by_periode_keluar` di spordit mungkin sudah akomodir ini (perlu verify).
2. **Pindahan / transfer** — `flag_pindahan=1` di spordit. Secara default, KTW dihitung terpisah karena SKS diakui dari PT asal. Di IKU, Unila biasanya report reguler saja.
3. **Mahasiswa lanjutan** (melanjutkan dari D3 ke S1) — hitung sebagai pindahan atau reguler? Per jalur `id_jalur_daftar`, biasanya ada kode khusus.
4. **Mahasiswa aktif lewat masa studi** — mereka belum lulus tapi sudah lewat 4 tahun untuk S1. Tidak masuk KTW karena belum lulus. Tapi muncul di `flag_ktw_bawah_standar=1` via pengurangan.
5. **Data tidak lengkap** — `tgl_keluar IS NULL` atau `no_seri_ijazah IS NULL` harus di-filter (mereka tercatat "Lulus" tapi admin belum entry). Spordit masih hitung karena sudah di-aggregate.
6. **Prodi baru / tutup** — `stat_prodi='A'` vs `stat_prodi='N'` di pdut. Kalau prodi tutup, KTW historical tetap tampil tapi no-new-data.
7. **Reconciliation lag** — spordit update bulanan, pdut real-time. Kalau ada mahasiswa lulus kemarin, di spordit baru muncul bulan depan. UI harus disclaim "data per tanggal ...".

---

## Rekomendasi eksekusi (phased)

### Phase 1 — Backend extension (1-2 minggu)
- Tambah connection `pgsql_spordit` di `config/database.php` public-service
- `SpordiLulusanRepository` baru untuk query spordit
- Extend `KelulusanService` dengan method: `getOverview()`, `getByFakultas()`, `getProdiDetail()`, `getDistribusi()`, dll
- Cache Redis 15 menit (overview/fakultas/prodi list), 1 jam (prodi detail statis)
- Endpoint baru per §Endpoint plan

### Phase 2 — Frontend drilldown (1 minggu)
- Komponen KTW baru per §Komponen baru
- Rewire `/infografis` pakai komponen baru
- Dashboard pimpinan extend dengan chart yang sama

### Phase 3 — Reconciliation tool (3 hari)
- Admin endpoint `/kelulusan/reconcile` compare spordit vs pdut per-prodi
- Alert Telegram kalau drift > 2%
- Scheduled job 1x sehari

### Phase 4 — Advanced analytics (opsional, 2 minggu)
- Prediksi: berapa % angkatan X akan lulus tepat waktu? (ML sederhana pakai data historis IPK + SKS per semester)
- Correlation: jalur masuk vs KTW%, IPK vs KTW, dll
- Export PDF laporan per-prodi untuk akreditasi

---

## Pertanyaan / konfirmasi ke user

1. **Regulatory threshold** — berapa % KTW yang dianggap "bawah standar"? 50% (umum) atau ada angka internal Unila? Saat ini `flag_ktw_bawah_standar` di spordit sudah ada tapi threshold-nya tidak jelas.
2. **Cuti semester** — masa studi include cuti atau exclude? Per regulasi Unila formal.
3. **Target audience infografis public** — orang luar (calon mahasiswa) atau internal (dosen/BAN-PT)? Mempengaruhi tingkat detail yang di-expose.
4. **Data mahasiswa individual di level 3** — mau expose nama+NIM ke public? Atau hanya anonymized statistik? Ada concern privacy.
5. **Frequency sync** — spordit update bulanan. Mau trigger manual dari dashboard (butuh akses write) atau tunggu scheduler-nya sendiri?
6. **Scope strata** — tampilkan semua atau fokus ke S1 saja? Pasca-sarjana (S2/S3) populasinya kecil, statistik bisa tidak stabil per-tahun.

---

## Lampiran — Query akses spordit

```
Host: 192.168.123.39
Port: 5432
User: myunil4
Password: (dari user — disimpan di setting.api_config nanti saat implement)
Database: spordit (case sensitive — "myunil4" bukan "myUnil4")
```

Sample query cepat buat sanity check:

```sql
-- Top 10 prodi KTW tertinggi 2022 (reguler saja)
SELECT m.tahun, ps.nama_program_studi, sp.nama_strata,
       m.jml_lulusan_angkatan, m.jml_ktw,
       m.prosentase_ktw, m.prosentase_ks
FROM akademik.masa_studi_generate_lulusan m
LEFT JOIN master_ref.program_studi ps ON ps.kode_dikti = m.kdpst
LEFT JOIN master_ref.strata_program sp ON sp.kode_strata = m.kode_strata
WHERE m.id_log = (SELECT id_log FROM akademik.generate_lulusan ORDER BY tgl_generate DESC LIMIT 1)
  AND m.tahun = 2022
  AND m.flag_pindahan = 0
  AND m.jml_lulusan_angkatan >= 5
ORDER BY m.prosentase_ktw DESC
LIMIT 10;

-- Trend KTW S1 Pendidikan Dokter (11201) 5 tahun
SELECT tahun, jml_lulusan_angkatan, jml_ktw, prosentase_ktw, avg_masa_mukim
FROM akademik.masa_studi_generate_lulusan
WHERE id_log = (SELECT id_log FROM akademik.generate_lulusan ORDER BY tgl_generate DESC LIMIT 1)
  AND kdpst = '11201'
  AND flag_pindahan = 0
ORDER BY tahun DESC;

-- Breakdown jalur daftar
SELECT kode_strata, tahun_awal, tahun_akhir, total_lulusan,
       kode_jalur, jml_lulusan
FROM akademik.detail_byjalur_generate_lulusan
WHERE id_log = (SELECT id_log FROM akademik.generate_lulusan ORDER BY tgl_generate DESC LIMIT 1)
ORDER BY kode_strata, tahun_awal, kode_jalur;
```
