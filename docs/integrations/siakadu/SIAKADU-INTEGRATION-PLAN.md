# SIAKADU Integration Plan — MyUnila Integrator

## Overview
Integrasi API SIAKADU (192.168.120.37:4000) ke MyUnila Integrator, mengikuti pola SIKEP sync yang sudah ada.

## Source API
- **URL:** http://192.168.120.37:4000/api/v1
- **Auth:** JWT Bearer token (login via /api/v1/auth/login)
- **Docs:** http://192.168.120.37:4000/api/docs/v1
- **Stack:** Go + PostgreSQL + Redis
- **Total:** 73 endpoints (15 modul + 40+ referensi)

## Existing State
- **Frontend:** 9 pages sudah ada di `/dashboard/integrator/siakadu/` tapi semua "Coming Soon"
- **Backend:** Belum ada siakadu module di `myunila-service`
- **Pattern:** Ikuti `apps/sikep/pegawai/` (handler + service + repository + router + external API client)
- **Scheduler:** Sudah ada di `apps/scheduler/` — perlu extend untuk sync types SIAKADU

---

## API Mapping — SIAKADU → MyUnila

### Modul Data (Sync ke SQL Server pdut)

| # | SIAKADU API | Target Table (pdut) | Sync Mode | Priority |
|---|-------------|---------------------|-----------|----------|
| 1 | `/mahasiswa/list` | `pdrd.peserta_didik` + `pdrd.reg_pd` | Full + Incremental | 🔴 P1 |
| 2 | `/mahasiswa/detail` | Detail biodata mahasiswa | On-demand | 🔴 P1 |
| 3 | `/pegawai/list` | `pdrd.sdm` + `pdrd.reg_ptk` | Full + Incremental | 🔴 P1 |
| 4 | `/pegawai/detail` | Detail biodata pegawai/dosen | On-demand | 🔴 P1 |
| 5 | `/kelas/list` | `pdrd.kelas_kuliah` | Per semester | 🟡 P2 |
| 6 | `/kelas/peserta/list` | `pdrd.kuliah_mhs` (KRS detail) | Per kelas | 🟡 P2 |
| 7 | `/kelas/jadwal_kuliah/list` | `pdrd.jadwal_kelas` | Per semester | 🟡 P2 |
| 8 | `/kurikulum/list` | `pdrd.matkul_kurikulum` | Full | 🟡 P2 |
| 9 | `/matakuliah/list` | `pdrd.matkul` | Full | 🟡 P2 |
| 10 | `/krs/list` | `pdrd.kuliah_mhs` | Per semester | 🟡 P2 |
| 11 | `/khs/list` | `pdrd.nilai_smt_mhs` | Per semester | 🟡 P2 |
| 12 | `/transkrip/list` | `pdrd.nilai_transkrip` | Per mahasiswa | 🟢 P3 |
| 13 | `/kuliah/list` | `pdrd.kuliah_mhs` (status) | Per semester | 🟡 P2 |
| 14 | `/presensi/list` | `presensi.kehadiran_mhs` | Per kelas/semester | 🟢 P3 |
| 15 | `/presensi/peserta/list` | Detail presensi per peserta | Per kelas | 🟢 P3 |
| 16 | `/nilai/transfer/list` | Transfer nilai | On-demand | 🟢 P3 |
| 17 | `/keuangan/list` | `keuangan.spp_mhs` | Per semester | 🟡 P2 |
| 18 | `/wisuda/periode/list` | Periode wisuda | Full | 🟢 P3 |
| 19 | `/wisuda/peserta/list` | Peserta wisuda per periode | Per periode | 🟢 P3 |

### Modul Referensi (40+ endpoint)

| Group | Endpoints | Target Schema |
|-------|-----------|---------------|
| **Akademik** | tahun_kurikulum, tahun_ajaran, unit, jenjang_didik, jenis_mk, kelompok_matkul, praktikum, slot_waktu, kelas_perkuliahan, kelompok_perkuliahan, bidang_ilmu, event_akademik, jenis_pertemuan, status_hadir | `ref.*` |
| **Registrasi** | agama, jalur_daftar, jenis_daftar, status_mahasiswa, kota, sekolah, jenis_sekolah, pt, negara, suku, jenis_tinggal, transport, kebutuhan_khusus, pekerjaan, penghasilan, gelombang, info_pendaftaran, sumber_informasi, tahap_pendaftaran, sistem_kuliah | `ref.*` |
| **Keuangan** | kategori_ukt, frek_tagihan, jenis_tagihan | `ref.*` |
| **Wisuda** | periode_wisuda, syarat_wisuda, jenis_sertifikat, jenis_do, jenis_ta | `ref.*` |
| **Kepegawaian** | jenis_pegawai, gol_pangkat, jab_struktural, jab_fungsional | `ref.*` / `sikep.*` |

---

## Architecture

```
SIAKADU API (192.168.120.37:4000)
     ↑ HTTP/JSON (JWT auth)
     |
MyUnila Service (myunila-service, VM3/VM5)
  ├── external/siakadu_api/client.go     ← API client (auth + endpoints)
  ├── apps/siakadu/
  │    ├── mahasiswa/   ← sync mahasiswa
  │    ├── kelas/       ← sync kelas + jadwal + peserta
  │    ├── akademik/    ← sync matkul + kurikulum + nilai
  │    ├── keuangan/    ← sync pembayaran
  │    ├── presensi/    ← sync kehadiran
  │    ├── wisuda/      ← sync wisuda
  │    └── referensi/   ← sync semua data referensi
  └── apps/scheduler/  ← extend sync types for SIAKADU
     ↓ SQL Server (pdut)
```

## Sync Modes

### 1. Manual Sync (tombol "Sync Now" di frontend)
- User klik sync → POST `/api/v1/siakadu/mahasiswa/sync`
- Service fetch dari SIAKADU API → upsert ke pdut SQL Server
- Return: `{ inserted: N, updated: M, skipped: K, errors: E }`

### 2. Scheduled Sync (via Scheduler)
- Cron expression (misal: setiap hari jam 2 pagi)
- Background job, auto-retry on failure
- Log ke `monitoring.sync_logs`

### 3. Incremental Sync
- Param `last_update` dikirim ke SIAKADU API
- Hanya sync data yang berubah sejak terakhir sync
- Lebih cepat untuk data besar (mahasiswa 190K+)

### 4. Progress Tracking
- Real-time progress via WebSocket atau polling
- Frontend tampilkan: `Syncing... 45% (4500/10000 records)`
- Stored in Redis: `sync_progress:{sync_id}`

---

## Implementation Phases

### Phase 1: API Client + Referensi Sync (2-3 jam)
1. **`external/siakadu_api/client.go`** — HTTP client, JWT auth, auto-refresh token
2. **`apps/siakadu/referensi/`** — Sync 40+ referensi tables
3. Update scheduler sync types: `siakadu_referensi`
4. Frontend: activate referensi page (replace ComingSoon)

### Phase 2: Mahasiswa + Pegawai Sync (3-4 jam)
1. **`apps/siakadu/mahasiswa/`** — Sync mahasiswa (peserta_didik + reg_pd)
   - Paginated fetch (500/batch)
   - Upsert by `nipd` or `id_pd`
   - Map SIAKADU fields → pdut columns
2. **`apps/siakadu/pegawai/`** — Sync pegawai/dosen (sdm + reg_ptk)
3. Progress tracking (Redis)
4. Frontend: activate mahasiswa + pegawai pages

### Phase 3: Akademik Sync (3-4 jam)
1. **`apps/siakadu/akademik/`** — Sync:
   - Kurikulum → `matkul_kurikulum`
   - Mata kuliah → `matkul`
   - Kelas → `kelas_kuliah`
   - Jadwal → `jadwal_kelas`
   - KRS → `kuliah_mhs`
2. Frontend: activate kurikulum, mata-kuliah, kelas pages

### Phase 4: Nilai + Presensi + Wisuda (2-3 jam)
1. **Nilai:** KHS → `nilai_smt_mhs`, Transkrip → `nilai_transkrip`
2. **Presensi:** → `kehadiran_mhs`
3. **Wisuda:** → wisuda data
4. **Keuangan:** → `spp_mhs`
5. Frontend: activate remaining pages

### Phase 5: Scheduler + Background Jobs (1-2 jam)
1. Extend scheduler sync types:
   ```
   siakadu_referensi, siakadu_mahasiswa, siakadu_pegawai,
   siakadu_kelas, siakadu_kurikulum, siakadu_matakuliah,
   siakadu_krs, siakadu_khs, siakadu_transkrip,
   siakadu_presensi, siakadu_keuangan, siakadu_wisuda
   ```
2. Default schedules:
   - Referensi: weekly (Minggu 01:00)
   - Mahasiswa: daily (02:00)
   - Kelas + KRS: daily (03:00)
   - Nilai: daily (04:00)
   - Presensi: daily (05:00)

---

## Field Mapping — Key Tables

### Mahasiswa (SIAKADU → pdut)
```
SIAKADU /mahasiswa/list     →  pdrd.peserta_didik + pdrd.reg_pd
─────────────────────────────────────────────
nipd                        →  reg_pd.nipd
nm_pd                       →  peserta_didik.nm_pd
jk                          →  peserta_didik.jk
tmpt_lahir                  →  peserta_didik.tmpt_lahir
tgl_lahir                   →  peserta_didik.tgl_lahir
nik                         →  peserta_didik.nik
kode_prodi / id_unit        →  reg_pd.id_sms (lookup)
angkatan / smt_masuk        →  reg_pd.id_semester_masuk
status                      →  kuliah_mhs.id_stat_mhs
ipk                         →  reg_pd.ipk
```

### Kelas (SIAKADU → pdut)
```
SIAKADU /kelas/list         →  pdrd.kelas_kuliah
─────────────────────────────────────────────
id_kls                      →  kelas_kuliah.id_kls
kode_mk                     →  lookup matkul.id_mk by kode_mk
nm_kls                      →  kelas_kuliah.nm_kls
sks_mk                      →  kelas_kuliah.sks_mk
id_smt                      →  kelas_kuliah.id_smt
```

### KHS / Nilai (SIAKADU → pdut)
```
SIAKADU /khs/list           →  pdrd.nilai_smt_mhs
─────────────────────────────────────────────
id_reg_pd                   →  nilai_smt_mhs.id_reg_pd
id_kls                      →  nilai_smt_mhs.id_kls
nilai_angka                 →  nilai_smt_mhs.nilai_angka
nilai_huruf                 →  nilai_smt_mhs.nilai_huruf
nilai_indeks                →  nilai_smt_mhs.nilai_indeks
```

---

## API Client Config

### Environment Variables
```env
# SIAKADU API Configuration
SIAKADU_API_BASE_URL=http://192.168.120.37:4000/api/v1
SIAKADU_API_USERNAME=<username>
SIAKADU_API_PASSWORD=<password>
SIAKADU_API_TIMEOUT=30
SIAKADU_SYNC_BATCH_SIZE=500
SIAKADU_SYNC_ENABLED=true
```

### Stored in DB (like SIKEP)
```
setting.api_configs:
  - code: SIAKADU
  - endpoint: http://192.168.120.37:4000/api/v1
  - username: (encrypted)
  - password: (encrypted)
```

---

## Estimasi Total: 2-3 malam kerja (12-16 jam)

| Phase | Effort | Output |
|-------|--------|--------|
| Phase 1: Client + Referensi | 2-3 jam | API client, 40+ ref tables synced |
| Phase 2: Mahasiswa + Pegawai | 3-4 jam | Core data sync, progress tracking |
| Phase 3: Akademik | 3-4 jam | Kelas, kurikulum, matkul, KRS |
| Phase 4: Nilai + others | 2-3 jam | KHS, transkrip, presensi, wisuda |
| Phase 5: Scheduler | 1-2 jam | Auto-sync, default schedules |

---

## Notes
- SIAKADU pakai PostgreSQL sendiri, MyUnila pakai SQL Server → field mapping perlu hati-hati (tipe data)
- Auth: JWT token, perlu auto-refresh (sama pattern seperti SIKEP client)
- Batch size: 500 records per API call (prevent timeout)
- Error handling: retry 3x, log ke monitoring, skip on individual record error
- Frontend 9 pages sudah ada (ComingSoon) — tinggal replace dengan real component
- Config API credentials simpan di `setting.api_configs` (encrypted di DB) sama seperti SIKEP
