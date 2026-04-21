# SI-Prestasi × SIMKATMAWA — Overview & Scope

**Status:** PLAN (belum implementasi)
**Tanggal:** 2026-04-19
**Owner:** Dev team MyUnila
**Sumber API:** https://documenter.getpostman.com/view/4139231/2sBXcLebzg

---

## Ringkasan 1 paragraf

SIMKATMAWA (Sistem Informasi Kemahasiswaan, Kemdiktisaintek) menerima laporan prestasi, sertifikasi, dan rekognisi mahasiswa dari perguruan tinggi via REST API. Unila saat ini belum punya aplikasi internal yang jadi *system of record* untuk data prestasi mahasiswa dalam format yang SIMKATMAWA minta. Plan ini merancang **SI-Prestasi** — sub-aplikasi di portal MyUnila (frontend `sim-prestasi/` + backend service baru) untuk: (1) mahasiswa / operator fakultas menginput prestasi, (2) sistem push ke SIMKATMAWA, (3) jangka panjang sync dua arah.

---

## Kenapa perlu aplikasi baru (bukan extend yang ada)

Existing di database `pdut` (SQL Server):

| Table | Rows | Fungsi sekarang |
|---|---|---|
| `pdrd.prestasi` | 751 | Feeder PDDIKTI prestasi — struktur legacy, single-student, minim field |
| `ref.jenis_prestasi` | 4 (Sains, Seni, Olahraga, Lain-lain) | Referensi lama, tidak cocok dengan kategori SIMKATMAWA |
| `ref.tingkat_prestasi` | 8 (Sekolah, Kecamatan, Kab/kota, Propinsi, Nasional, Internasional, Regional, Lainnya) | Overlap dengan `level` SIMKATMAWA tapi kode beda |
| `pdrd.rwy_sertifikasi`, `dok.dok_rwy_sertifikasi`, `ref.lembaga_sertifikasi` | ? | Sertifikasi **pegawai/dosen** (riwayat kepegawaian), BUKAN mahasiswa |

Sudah ada juga Go module `backend/feeder-service/apps/prestasi/` yang handle sync feeder PDDIKTI → `pdrd.prestasi`. Itu **domain berbeda**: feeder PDDIKTI adalah pelaporan PDDIKTI (akademik standar). SIMKATMAWA adalah pelaporan prestasi kemahasiswaan yang lebih kaya (kategori lomba, bentuk daring/luring, multi-mahasiswa, dosen pembimbing, URL dokumen pendukung).

Kesimpulan: **tidak boleh alter `pdrd.prestasi`** (akan merusak feeder PDDIKTI), dan existing schema tidak akomodatif untuk SIMKATMAWA. Rekomendasi: database + service baru khusus SI-Prestasi.

---

## Scope (phase breakdown)

### Phase 1 — Foundation & Entry (4–6 minggu)
- Schema PostgreSQL `si_prestasi` (database baru, mirror pola SIMBAK)
- Seed referensi sesuai enum SIMKATMAWA (level, kategori, peringkat, bentuk, kelompok, jenis_rekognisi)
- Backend service `si-prestasi-service` (Laravel atau Go — keputusan di §07)
- Frontend `frontend/src/app/dashboard/sim-prestasi/` — CRUD prestasi mandiri, sertifikasi, rekognisi
- Integrasi data mahasiswa dari PDUT (lookup NIM → nama/prodi) dan dosen (lookup NUPTK/NIDN)
- Authorization: admin fakultas, admin kemahasiswaan pusat, mahasiswa (draft only)
- Upload dokumen (surat tugas, foto, sertifikat, undangan) — storage MinIO atau local volume (mirror SIMBAK)

### Phase 2 — Push ke SIMKATMAWA (2–3 minggu)
- Module `simkatmawa-client` (HTTP client terisolasi)
- Login flow + token refresh (cached di Redis, TTL sesuai expiry server)
- Queue job "kirim ke SIMKATMAWA" (Laravel queue atau Go worker)
- Tracking status per record: `draft` → `ready` → `sent` → `acknowledged` / `error`
- Simpan response SIMKATMAWA (`id`, `kode_pt`, `tahun`) di kolom sync
- Retry policy + error log + UI untuk ops melihat status push

### Phase 3 — Sync 2 arah (menunggu GET endpoint SIMKATMAWA tersedia)
- **BLOCKED**: Postman collection saat ini hanya expose POST (create). Tidak ada GET/LIST/DETAIL endpoint.
- Opsi A: Minta DIKTI expose GET endpoint (NIM, tahun, kode_pt).
- Opsi B: Hanya simpan hasil push lokal (yang kita kirim sendiri) — "sync" jadi tidak perlu.
- Opsi C: Scraping halaman admin SIMKATMAWA (tidak direkomendasikan).

Tindakan: dokumentasikan blocker, push rencana Phase 3 ke backlog sampai ada endpoint read.

### Phase 4 — Analitik & Ranking (opsional)
- Dashboard pimpinan: statistik prestasi per fakultas, trend tahun, ranking mahasiswa (IKU-related)
- Integrasi dengan `frontend/src/app/dashboard/pimpinan/prestasi/page.tsx` (existing, masih pakai `pdrd.prestasi`)
- Export CSV / laporan semester

---

## Keputusan yang perlu user konfirmasi sebelum coding

1. **Arah integrasi Phase 1**: "narik datanya dari SIMKATMAWA" — API cuma expose POST (write). Kami asumsikan maksud user adalah:
   - Phase 1 = Unila push ke SIMKATMAWA (create prestasi di SIMKATMAWA dari data internal MyUnila)
   - Phase 3 = sync 2-arah (butuh GET endpoint dari DIKTI, belum ada)
   → **Konfirmasi arah benar?**
2. **Stack backend**: Laravel (konsisten dengan SIMBAK, auth, lebih cepat develop) atau Go/Fiber (konsisten dengan keuangan/sister, performant, less resource)? Rekomendasi: **Laravel** (alasan di §07).
3. **Database engine**: PostgreSQL baru (konsisten dengan SIMBAK) atau schema baru di SQL Server `pdut`? Rekomendasi: **PostgreSQL**.
4. **Kode PT** (`kode_pt: "000000"` di response) — apakah sudah ada kredensial SIMKATMAWA production untuk Unila? Perlu dari tim kemahasiswaan.
5. **Auth pengguna SI-Prestasi**: pakai SSO auth-service existing atau role baru `simkatmawa_operator`?
6. **Siapa yang boleh kirim** ke SIMKATMAWA — per fakultas, atau cuma admin pusat? (berefek ke workflow Phase 2)

---

## Dokumen lain di folder ini

- `01-simkatmawa-api-map.md` — full endpoint map & schema
- `02-existing-data-audit.md` — survey database existing & kode yang relevan
- `03-gap-analysis.md` — mapping field SIMKATMAWA ↔ existing + apa yang hilang
- `04-proposed-schema-postgres.md` — DDL PostgreSQL `si_prestasi`
- `05-architecture.md` — diagram service, queue, storage, auth
- `06-api-design.md` — REST API SI-Prestasi backend
- `07-stack-decision.md` — alasan pilih Laravel vs Go
- `08-workflow-dan-state.md` — state machine record prestasi
- `09-security-privacy.md` — token SIMKATMAWA, data mahasiswa, file upload
- `10-risk-dan-open-questions.md` — daftar risiko & pertanyaan terbuka
- `11-deployment-plan.md` — rollout VM, Kong route, env vars
- `12-timeline-dan-milestones.md` — jadwal per phase
