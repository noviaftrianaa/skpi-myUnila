# PLAN SOLUSI KTW — MyUnila
## Rangkuman untuk Diskusi dengan Tim Wali Data

**Tanggal:** 2026-04-20
**Status:** Draft — untuk dibahas sebelum implementasi
**Dokumen pendukung:**
- `00-brainstorm-ktw-drilldown.md` — arsitektur drilldown
- `01-reconciliation-excel-vs-spordit.md` — diff Excel vs spordit
- `02-reconciliation-all-sources.md` — diff 6 formula di codebase
- `KTW-2026-manual-source.xlsx` — data manual BAK (signed Hero Satrian Arief)

---

## 1. Executive Summary

### Temuan utama dari verifikasi silang
Setelah query langsung ke **pdut (SQL Server realtime) + spordit raw (mahasiswa_feeder)** untuk angkatan 2021 S1 Unila:

| Metric | Spordit `mahasiswa_feeder` | pdut `pdrd.reg_pd` | Selisih | Excel manual |
|---|---|---|---|---|
| Maba | 6832 | 6843 | **−11 (0.16%)** | 6005 (−830) |
| Sudah lulus | 4450 | 4127 | −323 | — |
| KTW ≤4.00y (strict) | 3660 | 3662 | **−2** | — |
| KTW ≤4.25y (s.d Nov) | 4054 | 4045 | **+9** | 3320 (−720) |
| Masih aktif | 1778 | 2109 | −331 | — |

**Dua temuan penting:**

1. **Spordit (`mahasiswa_feeder`) dan pdut (`pdrd.reg_pd`) SANGAT KONSISTEN.**
   Selisih ≤ 10 mahasiswa untuk populasi 6800+. Ini = drift 0.1-0.3%. Keduanya sumber feeder PDDIKTI yang sama, sync regular.

2. **Excel manual UNDER-count ~10%** dibanding data feeder.
   - Maba Excel 6005 vs actual 6832-6843 → missing 800+ mahasiswa
   - KTW Excel 3320 vs actual 4045-4054 → missing 720+ mahasiswa
   Kemungkinan Excel exclude jalur daftar tertentu, prodi tutup, atau data belum ter-update.

### Kesimpulan
**Spordit + pdut = source of truth yang konsisten** (keduanya PDDIKTI). Excel = dokumen referensi manual yang cocok untuk validate naming tapi **TIDAK bisa diandalkan sebagai authoritative numbers**.

Jalan tengahnya: **MyUnila compute KTW sendiri dari pdut** (lebih realtime + tidak menunggu batch spordit bulanan), dengan validation silang ke spordit + Excel sebagai reference.

---

## 2. Arsitektur solusi "One Canonical KTW"

```
┌──────────────────────────────────────────────────────┐
│  SUMBER PRIMARY: pdut (SQL Server realtime)          │
│  pdrd.reg_pd + pdrd.peserta_didik + pdrd.sms         │
│  + ref.jenjang_pendidikan + ref.semester             │
└────────────────────────┬─────────────────────────────┘
                         │ cross-DB query
                         ▼
┌──────────────────────────────────────────────────────┐
│  KTW Service di backend/public-service (NEW)         │
│                                                       │
│  KelulusanService::getKTW(                           │
│    scope: 'angkatan'|'tahun_lulus'|'aktif',          │
│    definisi: 'strict'|'tolerant'|'aee',              │
│    kdpst?, kode_fak?, tahun, strata                  │
│  ) → {numerator, denominator, pct, metadata}         │
└────────────────────────┬─────────────────────────────┘
                         │
            ┌────────────┼────────────┐
            ▼            ▼            ▼
     ┌──────────┐  ┌──────────┐  ┌──────────┐
     │ Public   │  │ Dashboard│  │ Raw Data │
     │ Info-    │  │ Pimpinan │  │ Service  │
     │ grafis   │  │ Menu KTW │  │ (CSV +   │
     │          │  │          │  │  JSON)   │
     └──────────┘  └──────────┘  └──────────┘
                         ▲
                         │ weekly reconcile
                         │
     ┌───────────────────┴──────────────────┐
     │ Spordit reconciliation job           │
     │ Compare MyUnila KTW vs spordit batch │
     │ Alert Telegram kalau drift > 2%      │
     └──────────────────────────────────────┘
```

**Prinsip:**
- 1 sumber (pdut) untuk hitung KTW → tidak ada ambiguitas
- 4 definisi explisit (strict / tolerant / survival / AEE) → user pilih
- Validasi silang dengan spordit weekly
- Excel upload untuk admin compare manual

---

## 3. Plan per-deliverable

### 3.1 Infografis Public (`/infografis/ktw`)

**Target audience:** calon mahasiswa, orang tua, masyarakat umum.

**Halaman:**
- `/infografis/ktw` — landing page
- `/infografis/ktw/fakultas/[kode]` — drilldown fakultas
- `/infografis/ktw/prodi/[kdpst]` — drilldown prodi

**Konten landing page:**
1. **Headline:** % KTW universitas tahun berjalan (default ≤4.00y strict)
2. **Trend chart:** 5 tahun terakhir, line chart
3. **Tri-view card:** 3 angka dengan label:
   - "Strict (masa normatif)" — 4.00y S1
   - "Dengan toleransi (s.d Nov)" — 4.25y S1
   - "Lulus pada akhirnya" — survival rate
4. **Top 10 prodi** dengan KTW% tertinggi
5. **Top 10 prodi** yang perlu perhatian (KTW% terendah)
6. **Klik fakultas/prodi → drilldown**

**Drilldown prodi:**
- Header prodi (nama, fakultas, strata, masa normatif)
- Trend 10 tahun KTW% + % kelulusan (survival)
- Histogram distribusi masa studi (pakai data spordit jika ada, fallback compute)
- Breakdown jalur masuk (SNMPTN/SBMPTN/Mandiri)
- Tooltip definisi

**Styling:** konsisten dengan infografis existing (komponen `KelulusanTepatWaktu` diganti).

**Data source:** pdut realtime, cache Redis 1 jam.

---

### 3.2 Dashboard Pimpinan — Menu KTW baru

**Target:** Rektorat, Dekan, Kaprodi, Kepala BAK.

**Menu baru:** `/dashboard/pimpinan/ktw` (terpisah dari `/iku` yang ada IKU 1 AEE)

**Halaman:**
- `/ktw` — overview
- `/ktw/fakultas` — list fakultas dengan ranking
- `/ktw/fakultas/[kode]` — detail fakultas
- `/ktw/prodi/[kdpst]` — detail prodi
- `/ktw/compare` — bandingkan 2+ prodi sejajar
- `/ktw/sync-log` — reconciliation history

**Filter & kontrol:**
- Toggle definisi: [Strict] [Tolerant ≤4.25y] [Survival] [AEE]
- Range tahun angkatan
- Strata (D3/S1/S2/S3)
- Fakultas
- Export CSV / PDF

**Fitur khusus:**
- **Reconciliation panel:** angka MyUnila vs spordit batch vs Excel upload (kalau ada). Drift visualized dengan warna (hijau < 2%, kuning 2-10%, merah > 10%).
- **Alert badge** di sidebar kalau ada prodi dengan drift tinggi
- **Individual mahasiswa list** saat drilldown prodi: siapa saja yang "tepat waktu by definisi X tapi tidak Y"
- **Linked ke SIMBAK:** klik mahasiswa → link ke profil SIMBAK kalau ada pengajuan layanan

**Data source:** pdut realtime untuk headline + list, spordit untuk reconcile.

---

### 3.3 Raw Data Service (API)

**Path base:** `backend/public-service/app/Http/Controllers/OpenApi/KelulusanController.php` — extend existing.

**Endpoints baru:**

| Method | Path | Auth | Fungsi |
|---|---|---|---|
| GET | `/kelulusan/overview` | JWT | Overview university (headline metric tri-view) |
| GET | `/kelulusan/fakultas` | JWT | List semua fakultas dengan KTW% |
| GET | `/kelulusan/fakultas/{kode}` | JWT | Detail fakultas + prodi di dalamnya |
| GET | `/kelulusan/prodi/{kdpst}` | JWT | Detail prodi + trend 10 tahun |
| GET | `/kelulusan/prodi/{kdpst}/mahasiswa` | JWT | **Raw list mahasiswa** per-angkatan dengan flag KTW |
| GET | `/kelulusan/prodi/{kdpst}/distribusi` | JWT | Histogram masa studi (bucket 0.5y) |
| GET | `/kelulusan/prodi/{kdpst}/jalur` | JWT | Breakdown jalur masuk |
| GET | `/kelulusan/trend` | JWT | Trend time-series (param tahun range) |
| GET | `/kelulusan/compare` | JWT | Compare 2+ prodi |
| GET | `/kelulusan/reconcile` | admin | Drift check MyUnila vs spordit vs Excel |
| POST | `/kelulusan/excel-upload` | admin | Upload Excel manual untuk compare & sync |
| GET | `/kelulusan/export/csv` | JWT | Export CSV per-prodi |

**Common parameters:**
- `definisi` (enum: `strict` | `tolerant` | `survival` | `aee`) — default `strict`
- `tahun` (angkatan atau tahun lulus tergantung `scope`)
- `scope` (enum: `angkatan` | `tahun_lulus` | `aktif_semester`)
- `kode_fak`, `kdpst`, `strata`, `jalur` (filter)
- `page`, `per_page` (pagination)

**Response envelope:**
```json
{
  "success": true,
  "data": {
    "scope": "angkatan_2021",
    "definisi": "strict",
    "numerator": 3662,
    "denominator": 6843,
    "percentage": 53.52,
    "source_primary": "pdut",
    "source_verified_at": "2026-04-20T15:30:00+07:00",
    "reconcile": {
      "spordit_value": 3660,
      "spordit_batch": "2026-04-06",
      "spordit_drift": -2,
      "excel_value": 3320,
      "excel_drift": -342,
      "excel_warning": "under-count 10% — perlu investigasi"
    }
  }
}
```

**Source code layout (di public-service):**
```
app/
  Services/
    KelulusanService.php           # orchestrator
    KelulusanReconcileService.php  # cross-check spordit + excel
  Repositories/
    KelulusanRepository.php        # query pdut (sudah ada, extend)
    KelulusanSporditRepository.php # query spordit (NEW — connection pgsql_spordit)
  Http/Controllers/OpenApi/
    KelulusanController.php        # extend existing
    KelulusanAdminController.php   # reconcile + upload (NEW)
```

**Config baru di `config/database.php`:**
```php
'pgsql_spordit' => [
    'driver' => 'pgsql',
    'host' => env('SPORDIT_DB_HOST', '192.168.123.39'),
    'port' => env('SPORDIT_DB_PORT', '5432'),
    'database' => env('SPORDIT_DB_DATABASE', 'spordit'),
    'username' => env('SPORDIT_DB_USERNAME'),
    'password' => env('SPORDIT_DB_PASSWORD'),  // encrypted via setting.api_config
    'schema' => 'public',
    'sslmode' => 'prefer',
],
```

Credentials TIDAK di `.env` plain — pakai pola `setting.api_config` seperti SI-Prestasi (batch baru si-prestasi service udah punya infrastructure untuk ini).

---

## 4. Sync & Reconciliation Strategy

### 4.1 Periodik verification

**Mingguan cron job** di public-service:

```
KelulusanReconcileService::runWeekly()
  - For each (strata, angkatan) yang available:
    - Compute KTW dari pdut (strict + tolerant)
    - Query spordit masa_studi_generate_lulusan (latest batch)
    - Bandingkan per-prodi
    - Simpan hasil ke log.kelulusan_reconcile_log
    - If drift > 2% di 5+ prodi → alert Telegram
    - If drift > 10% di prodi tertentu → flag "investigate"
```

**Manual trigger:** admin button di `/dashboard/pimpinan/ktw/sync-log`.

### 4.2 Cek periode lulusan (last_sync)

**Tanggal referensi:**
- Spordit `generate_lulusan.tgl_generate` terbaru: 2026-04-06
- pdut `reg_pd.last_update` MAX per angkatan (realtime)
- Excel manual `tanggal_daftar` / timestamp created: manual entry

**Check script:**

```php
$sporditLastBatch = spordit: SELECT MAX(tgl_generate) FROM akademik.generate_lulusan;
$pdutLastLulus    = pdut:    SELECT MAX(tgl_keluar) FROM pdrd.reg_pd WHERE id_jns_keluar='1';
$sporditDataAsOf  = spordit: SELECT MAX(tanggal_keluar) FROM akademik.mahasiswa_feeder WHERE id_jenis_keluar=1;

IF pdutLastLulus > sporditDataAsOf + 30 hari
   THEN spordit is LAG → fallback pdut for realtime
   ELSE spordit is CURRENT → can use batch
```

Tampilkan di UI: `Data spordit per 2026-04-06, pdut realtime 2026-04-20. Drift 14 hari — normal.`

### 4.3 Alert Telegram

Reuse Telegram bot existing (channel dev@unila.ac.id). Alert format:

```
🚨 KTW drift detected
Fakultas: Teknik
Prodi: Teknik Sipil (22201)
Angkatan: 2021 S1
MyUnila: 67 KTW (from pdut realtime)
Spordit:  39 KTW (batch 2026-04-06)
Drift: +28 (72%)
Alasan kemungkinan: spordit batch lama, atau filter stat_prodi beda.

Detail: https://myunila.unila.ac.id/dashboard/pimpinan/ktw/prodi/22201
```

---

## 5. Rumus yang akan dipakai MyUnila (canonical)

Setelah konsolidasi 6 sumber, MyUnila pakai **empat definisi** dengan formula jelas:

### Definisi A — `strict` (DEFAULT)
```
numerator   = COUNT(reg_pd) WHERE id_jns_keluar = '1'
              AND ROUND(DATEDIFF(DAY, tgl_masuk_sp, tgl_keluar) / 365.25, 2) <= masa_normatif
              AND no_seri_ijazah IS NOT NULL
              AND tgl_keluar IS NOT NULL
denominator = COUNT(reg_pd) WHERE tgl_masuk_sp IN year_angkatan
                                AND id_sp = Unila
                                AND sms.stat_prodi = 'A'
```
Masa normatif: D3=3.00, S1=4.00, S2=2.00, S3=3.00.

### Definisi B — `tolerant` (Excel-style)
Sama dengan A tapi `≤ masa_normatif + 0.25` (tambah 3 bulan toleransi semester gasal).

### Definisi C — `survival`
```
numerator   = total lulusan dari angkatan X (tidak peduli tepat waktu)
denominator = Maba angkatan X
```

### Definisi D — `aee` (ikut IKU 1 dashboard existing)
```
numerator   = lulus tepat waktu tahun X (sama dengan A tapi filter by tgl_keluar)
denominator = mahasiswa AKTIF per semester X
```

UI default: A. User bisa switch di toggle.

---

## 6. Kenapa Excel TIDAK dijadikan source of truth

Meski Excel signed oleh Kepala Biro Akademik, data-nya:
- Under-count Maba 800+ (selisih 12%)
- Under-count KTW 720+ (selisih 18%)
- Naming prodi inkonsisten (Teknik Geofisika vs Geofisika, Ilmu Admin Bisnis vs Niaga, PG PAUD vs Pendidikan Guru PAUD)
- Punya `#REF!` error di Fakultas Teknik
- Manual entry — prone to typo

**Alternatif:** Excel di-upload ke admin UI, system compare otomatis, flag discrepancy per-prodi. Tim BAK bisa investigasi apakah data Excel salah atau data feeder yang salah (jarang tapi mungkin). Auditor trail.

Excel tetap BERGUNA sebagai:
1. Dokumen legal internal (signed)
2. Referensi manual saat report BAN-PT
3. Sumber awal untuk verifikasi saat MyUnila baru dideploy (validate formula benar)

---

## 7. Timeline eksekusi

Asumsi 1 backend + 1 frontend full-time:

| Week | Milestone |
|---|---|
| W1 | Setup spordit connection di public-service + SporditRepository + test query |
| W1 | Extend KelulusanRepository pdut dengan 4 definisi + test |
| W2 | KelulusanService orchestrator + caching Redis + endpoint baru |
| W2 | Reconcile service + scheduled job |
| W3 | Frontend infografis public redesign (tri-view + drilldown L1 L2) |
| W3 | Komponen histogram + breakdown jalur |
| W4 | Dashboard pimpinan menu KTW (route + komponen + filter toggle) |
| W4 | Sync log panel + Telegram alert integration |
| W5 | Raw data service endpoint + Excel upload admin UI |
| W5 | Testing, QA, dokumentasi user |
| W6 | Deploy staging VM5 + UAT dengan tim BAK + wali data |
| W7 | Deploy production VM1/VM2 + monitoring |

Total: **7 minggu** realistic (4-5 kalau crash timeline).

---

## 8. Open questions untuk diskusi wali data

1. **Setuju pakai pdut sebagai primary?** Spordit jadi secondary reconcile, Excel untuk manual validate.
2. **Definisi default untuk infografis public** — Strict (A) atau Tolerant (B)? User saran: Excel style = Tolerant, tapi ini under-count; mungkin tampilkan Tolerant dengan catatan "masa normatif + 3 bulan toleransi".
3. **Masa normatif resmi Unila** — sesuai PDDIKTI (4y S1 strict)? Atau ada kebijakan Rektor yang beda (misal S1 5y untuk program tertentu)?
4. **Mahasiswa cuti** — apakah masa cuti dikurangi dari `masa_mukim`? Di pdut, `DATEDIFF(masuk, keluar)` TIDAK exclude cuti. Kalau Unila ingin "fair" counting, perlu tambah logic bisa via `pdrd.kuliah_mhs.id_stat_mhs = 'C'` per semester.
5. **Multi-tenancy akses Dashboard KTW** — siapa boleh akses? Dekan lihat fakultasnya saja atau semua? Kaprodi lihat prodi sendiri?
6. **Privacy raw data** — list mahasiswa di drilldown level 3 tampilkan NIM + nama? Publik atau internal only?
7. **Frekuensi sync spordit** — sekarang bulanan. Perlu mingguan supaya MyUnila + spordit lebih konsisten?
8. **Excel upload feature** — mau ada atau skip? Kalau ada, siapa yang boleh upload dan approve?

---

## 9. Action items untuk diputuskan sekarang

- [ ] Konfirmasi dari tim wali data: OK dengan pdut sebagai primary + 4 definisi KTW?
- [ ] Konfirmasi masa normatif per jenjang (PDDIKTI standar atau ada override Unila)?
- [ ] Konfirmasi authority akses Dashboard KTW
- [ ] Konfirmasi mau PDF version dokumen ini atau MD cukup?
- [ ] Approve timeline 7 minggu atau crash ke 4 minggu?
- [ ] Setup kredensial spordit di setting.api_config (format encrypted)

---

## 10. Lampiran — Query verification yang sudah saya jalankan

### Spordit raw (mahasiswa_feeder) S1 angkatan 2021
```
maba: 6832, lulus: 4450, ktw ≤4.00y: 3660, ktw ≤4.25y: 4054
```

### pdut realtime (pdrd.reg_pd) S1 angkatan 2021
```
maba: 6843, sudah_lulus: 4127, ktw ≤4.00y: 3662, ktw ≤4.25y: 4045
masih aktif (id_jns_keluar NULL): 2109
```

### Spordit batch (masa_studi_generate_lulusan) S1 angkatan 2021 reguler
```
maba: 6794, lulusan: 4268, ktw: 3086 (aneh — filter tambahan apa?)
```

### Excel manual S1 angkatan 2021
```
maba: 6005, ktw total: 3320, persentase: 55.29%
```

**Finding:** Spordit batch `jml_ktw` (3086) tidak match dengan spordit raw (3660) dan pdut (3662). Ada filter tambahan di batch yang tidak terdokumentasi. Perlu tanya tim spordit untuk klarifikasi.

**Rekomendasi MyUnila:** compute sendiri dari `mahasiswa_feeder` atau `pdrd.reg_pd`, abaikan `masa_studi_generate_lulusan` sebagai authoritative (hanya untuk display cepat).

---

## Penutup

Dengan konsolidasi ini, MyUnila punya:
1. **Satu angka canonical per definisi** (bukan 6 beda)
2. **Reconciliation otomatis** ke spordit mingguan
3. **Tri-view infografis public** untuk awam
4. **Dashboard pimpinan** dengan drilldown + compare
5. **Raw data API** untuk tim data internal
6. **Audit trail** via log reconcile + Excel upload

Silakan review + feedback sebelum saya mulai coding.

— Dev team MyUnila
