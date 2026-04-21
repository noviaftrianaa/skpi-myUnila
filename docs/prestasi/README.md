# SI-Prestasi × SIMKATMAWA — Documentation Index

Folder ini berisi plan awal aplikasi **SI-Prestasi** yang akan diintegrasikan dengan API SIMKATMAWA (Kemdiktisaintek) untuk pelaporan prestasi, sertifikasi, dan rekognisi mahasiswa Unila.

**Status:** PLAN — belum ada kode / infra ditulis.
**Tanggal terakhir update:** 2026-04-19 (revisi 2)

**Keputusan yang sudah LOCKED:**
- ✅ Database: **PostgreSQL dedicated `si_prestasi`** (bukan alter pdut)
- ✅ Stack: **IDENTIK SIMBAK** — Laravel 11 + PHP 8.2-fpm-alpine + Supervisor (PHP-FPM + queue) + Redis + sqlsrv pdut read-only
- ✅ Schema convention: ikut SIMBAK (PK `id_<tabel>` UUID, `nm_*`, `a_*`, `tgl_*`, `idx_*`, schemas `ref/prestasi/sync/log`, drop `public`)
- ✅ Referensi: mendukung pdut (level, kategori, peringkat punya kolom `_pdut` untuk mapping ke `pdut.ref.*` dan `pdrd.prestasi`)
- ✅ Kredensial API: di tabel generik `setting.api_config` (encrypted, support bearer/api_key/oauth2), bukan di `.env`
- ✅ API SIMKATMAWA: confirmed hanya 4 route POST (probe verified) — Phase 3 pull BLOCKED sampai DIKTI expose GET

---

## Urutan baca

1. [00-overview-dan-scope.md](./00-overview-dan-scope.md) — ringkasan, phase, keputusan penting
2. [01-simkatmawa-api-map.md](./01-simkatmawa-api-map.md) — full endpoint map + hasil probe
3. [02-existing-data-audit.md](./02-existing-data-audit.md) — apa yang sudah ada di pdut + kode repo
4. [03-gap-analysis.md](./03-gap-analysis.md) — mapping field SIMKATMAWA ↔ existing
5. [04-proposed-schema-postgres.md](./04-proposed-schema-postgres.md) — DDL target (SIMBAK convention + pdut mapping)
6. [05-architecture.md](./05-architecture.md) — diagram komponen
7. [06-api-design.md](./06-api-design.md) — REST API SI-Prestasi
8. [07-stack-decision.md](./07-stack-decision.md) — **LOCKED** identik SIMBAK
9. [08-workflow-dan-state.md](./08-workflow-dan-state.md) — state machine record
10. [09-security-privacy.md](./09-security-privacy.md) — kredensial, file publik, privacy
11. [10-risk-dan-open-questions.md](./10-risk-dan-open-questions.md) — ⚠️ **Pertanyaan tersisa untuk user**
12. [11-deployment-plan.md](./11-deployment-plan.md) — docker-compose + Kong + env (mirror SIMBAK)
13. [12-timeline-dan-milestones.md](./12-timeline-dan-milestones.md) — estimasi phase
14. [13-pdut-reference-mapping.md](./13-pdut-reference-mapping.md) — **NEW** field-level mapping SIMKATMAWA ↔ si_prestasi ↔ pdut

---

## Ringkas sekali bacaan

| Pertanyaan | Jawaban |
|---|---|
| Butuh schema baru? | ✅ Ya, PostgreSQL `si_prestasi` |
| Butuh service baru? | ✅ Ya, `si-prestasi-service` (Laravel, **identik SIMBAK**) |
| Butuh frontend baru? | ✅ Ya, `frontend/src/app/dashboard/sim-prestasi/` |
| Support referensi pdut? | ✅ Ya, tabel ref punya `id_jenis_prestasi_pdut`, `id_tkt_prestasi_pdut`, `peringkat_pdut`, dst |
| Bisa backfill 751 rows dari `pdrd.prestasi`? | ⚠️ Opsional via Artisan command — banyak field default (cabang, url, tgl_sertifikat). Butuh review ops |
| API SIMKATMAWA lengkap? | ❌ Cuma 4 route POST (probe sudah verifikasi) — Phase 3 pull BLOCKED |
| Phase 1 durasi? | 4–6 minggu (entry CRUD) |
| Phase 2 durasi? | 2–3 minggu (push ke SIMKATMAWA) |
| Phase 3 durasi? | BLOCKED — tunggu DIKTI expose GET |

---

## Pertanyaan yang MASIH perlu jawaban user

Lihat detail di [10-risk-dan-open-questions.md](./10-risk-dan-open-questions.md):

1. ~~**Q1:** Arah Phase 1 — push atau pull?~~ → di-reframe jadi **push ke SIMKATMAWA** (pull tidak bisa, probe confirm)
2. **Q2:** Akun SIMKATMAWA Unila sudah ada di tim kemahasiswaan?
3. **Q3:** Kode PT Unila di SIMKATMAWA?
4. ~~**Q4:** Laravel atau Go?~~ → **LOCKED Laravel** (identik SIMBAK)
5. **Q5–Q10:** keputusan desain lain (RBAC fakultas, workflow approval, storage subdomain, enum master data editable?, mahasiswa self-input?)
6. **Q-NEW:** Backfill 751 rows `pdut.pdrd.prestasi` ke `si_prestasi` saat Phase 1 seed, atau mulai kosong? (Detail di 13-pdut-reference-mapping.md §7)

---

## Perubahan yang akan menyentuh existing code (estimasi)

| Existing | Rencana sentuhan |
|---|---|
| `backend/feeder-service/apps/prestasi/` | ❌ **Tidak disentuh** (domain beda — feeder PDDIKTI) |
| `pdrd.prestasi` | ❌ **Tidak di-alter** — tetap source of truth feeder PDDIKTI |
| `ref.jenis_prestasi`, `ref.tingkat_prestasi` | ❌ **Tidak di-alter** — di-refer dari si_prestasi via kolom `_pdut` |
| `frontend/src/app/dashboard/pimpinan/prestasi/` | ⚠️ Extend Phase 4 (gabung data source) |
| `frontend/src/app/dashboard/data-unila/tridarma/prestasi/` | ⚠️ Extend Phase 4 |
| `deployment/production/vm1-frontend-kong/` | ✅ Tambah Kong route + frontend env (Phase 2) |
| `auth-service` | ✅ Tambah role `operator_fakultas`, `admin_kemahasiswaan` (atau reuse existing) |

---

## File-file yang perlu di-copy dari SIMBAK saat implement

Short-cut untuk speed. Copy lalu rename/adapt:

| Dari SIMBAK | Ke SI-Prestasi |
|---|---|
| `backend/simbak-service/Dockerfile` | `backend/si-prestasi-service/Dockerfile` |
| `backend/simbak-service/docker/supervisord.conf` | `backend/si-prestasi-service/docker/supervisord.conf` |
| `backend/simbak-service/app/Repositories/PdutRepository.php` | extend untuk prestasi lookups |
| `backend/simbak-service/config/database.php` | copy as-is |
| `deployment/.../docker-compose.simbak.yml` | `docker-compose.si-prestasi.yml` |
| `data-model/.../simbak_v1.0_fresh.sql` | template → `si_prestasi_v1.0_fresh.sql` |

Detail di [07-stack-decision.md](./07-stack-decision.md).

---

## Catatan

- Semua dokumen di folder ini adalah **plan / desain**, bukan final spec. Boleh direvisi sebelum coding.
- Saat coding dimulai, kode-level dokumentasi (OpenAPI, README service) akan ditulis di `backend/si-prestasi-service/` terpisah.
- Prinsip hemat: **reuse pattern SIMBAK** (auth, upload, workflow, cross-DB) sebanyak mungkin. Copy-paste struktur → adapt → jangan re-invent.
