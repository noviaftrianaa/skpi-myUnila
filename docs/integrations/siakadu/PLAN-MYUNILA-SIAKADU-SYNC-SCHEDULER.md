# Plan: myunila-service — SIAKADU Sync Scheduler + Integrator Log

**Status:** Draft — untuk eksekusi terpisah dari ws-api Batch 11.
**Konteks ditemukan saat:** Batch 11 (ws-api `/v1/siakadu/*` GET endpoints) — user flag bahwa sync SIAKADU → pdut `siakadu.*` belum tercatat di dashboard integrator log.

## Masalah yang ditemukan

1. **Sync mahasiswa jalan, tapi tidak tercatat di log**
   - URL log dashboard: `https://my.unila.ac.id/dashboard/integrator/logs`
   - User test manual sync mahasiswa (via myunila-service command/endpoint) — data masuk tapi tidak ada entri di integrator log
   - Kemungkinan: myunila-service sync tidak publish event ke integrator log service

2. **Sync endpoint lain belum diverifikasi**
   - SIAKADU endpoints yang ada di myunila-service: nilai, akademik, wisuda, pegawai, referensi
   - Belum dites manual apakah berhasil populate `siakadu.*` tables di pdut
   - Ws-api `/v1/siakadu/*` Batch 11 akan return kosong untuk tabel yang belum di-sync

3. **Tidak ada auto-sync (scheduler)**
   - Sync saat ini manual trigger
   - Sister-service sudah punya pattern scheduler (contoh: foto dosen sync 3 worker, rate 200ms)
   - myunila-service butuh scheduler serupa — sync nightly/per-jam supaya data SIAKADU tetap fresh

## Rencana (3 work items)

### Item 1 — Fix integrator log untuk sync mahasiswa
**Objective:** setiap sync mahasiswa (dan endpoint lain) tercatat di `https://my.unila.ac.id/dashboard/integrator/logs`.

**Investigate:**
- Di myunila-service: apakah repository `UpsertMahasiswa` call log service? Grep `integrator` / `log.*sync` di `backend/myunila-service/`.
- Di integrator log service: identify tabel log (mungkin `man_akses.sync_log` atau `siakadu.sync_log` — schema siakadu v2 punya table `siakadu.sync_log`).
- Cek frontend log dashboard — API endpoint yang dia pakai, field yang di-expect.

**Fix:**
- Tambah log write di setiap sync handler myunila-service (endpoint_name, sync_type, status, total_records, inserted/updated/failed, duration_ms).
- Optionally: bikin middleware sync yang auto-log sebelum/sesudah setiap sync call.

### Item 2 — Verify semua endpoint sync bekerja
**Objective:** konfirmasi semua 5 domain SIAKADU sync berjalan dan populate tabel pdut.

**Tasks:**
1. Test manual tiap sync endpoint myunila-service:
   - `/api/v1/mahasiswa/sync` → siakadu.mahasiswa + keluarga_mhs ✅ (user tested)
   - `/api/v1/nilai/sync/khs|transkrip|kuliah` → siakadu.nilai_smt_mhs + nilai_transkrip + kuliah_mhs
   - `/api/v1/akademik/sync/kelas|kurikulum|matakuliah|jadwal` → siakadu.kelas_kuliah + matkul + matkul_kurikulum + jadwal_kelas
   - `/api/v1/wisuda/sync/periode|peserta` → siakadu.periode_wisuda + wisuda_mahasiswa
   - `/api/v1/pegawai/sync` → siakadu.sdm + reg_ptk
   - `/api/v1/referensi/sync/{type}` → siakadu.ref_*

2. Check row count di pdut untuk tiap tabel pre- & post-sync.
3. Dokumentasi endpoint myunila-service + expected rowcount.

### Item 3 — Add Sync Scheduler (pattern dari sister-service)
**Objective:** sync otomatis nightly (tengah malam) untuk semua endpoint.

**Pattern:**
- Gunakan `backend/myunila-service/migrations/create_sync_scheduler_table.sql` (sudah ada — tabel scheduler config)
- Goroutine di main.go yang baca config + schedule cron jobs
- Worker pool (misal 3 worker concurrent, mirror sister-service foto sync pattern)
- Rate limiting per endpoint untuk hindari overload SIAKADU WS
- Write ke integrator log saat setiap sync mulai/selesai (see Item 1)

**Konfigurasi scheduler table (contoh rows yg perlu):**
```
endpoint_key         | schedule_cron    | enabled | rate_limit_ms
siakadu_mahasiswa    | 0 0 1 * * *      | true    | 500
siakadu_nilai_khs    | 0 0 2 * * *      | true    | 300
siakadu_wisuda       | 0 0 3 * * *      | true    | 300
siakadu_pegawai      | 0 0 4 * * *      | true    | 300
siakadu_akademik     | 0 0 5 * * *      | true    | 300
siakadu_referensi    | 0 30 5 * * *     | true    | 100
```

(Kolom cron = midnight → 5:30am range, non-overlapping).

**Manual trigger tetap disediakan:**
- `POST /api/v1/sync/:endpoint_key` untuk sync on-demand (testing/force refresh)
- Bisa juga UI di dashboard integrator

## Dependencies

- `siakadu.sync_log` table (line 1283 schema v2.0_fresh) — sudah exist, tinggal dipakai
- `create_sync_scheduler_table.sql` di myunila-service migrations — sudah exist

## Effort estimate

| Item | Effort | Priority |
|---|---|---|
| Item 1 — log fix | ~4 jam | HIGH (kehilangan visibility) |
| Item 2 — verify endpoints | ~2 jam (testing) | MEDIUM |
| Item 3 — scheduler | ~6 jam | MEDIUM (manual sync work for now) |

Total: ~12 jam. Bisa dieksekusi bertahap — Item 1 dulu (quick fix), lalu Item 2 (validasi), terakhir Item 3 (automation).

## Out of scope

- **Ws-api Batch 11 endpoints** — sudah selesai (18 endpoint GET-only), tidak tergantung scheduler ini. Endpoints akan return data yang ada saat itu di `siakadu.*` tables, konsisten dengan sync state.
- **Redis cache invalidation ws-api** — cache TTL 10 menit udah cukup, tidak perlu invalidasi manual setelah sync.

## Referensi

- myunila-service SIAKADU client: `backend/myunila-service/external/siakadu_api/client.go`
- myunila-service modules: `backend/myunila-service/apps/siakadu/{mahasiswa,nilai,akademik,wisuda,referensi}/`
- sister-service scheduler pattern: `backend/sister-service/apps/dosen/photo_sync_service.go` (foto sync dgn worker pool + rate limit)
- Scheduler table DDL: `backend/myunila-service/migrations/create_sync_scheduler_table.sql`
- Integrator log dashboard: `https://my.unila.ac.id/dashboard/integrator/logs`
