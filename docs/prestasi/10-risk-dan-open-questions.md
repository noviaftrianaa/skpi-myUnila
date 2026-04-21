# Risk Register & Open Questions

Yang harus dijawab / diputuskan sebelum coding.

---

## ✅ Sudah diputuskan (2026-04-19)

### ~~Q1. Arah integrasi Phase 1~~ — RESOLVED

**Keputusan:** Phase 1 = **push ke SIMKATMAWA** (Unila kirim prestasi ke DIKTI). Pull tidak mungkin — probe langsung confirm SIMKATMAWA API hanya expose 4 route POST. Phase 3 (pull/sync 2 arah) BLOCKED sampai DIKTI expose GET endpoint baru.

### ~~Q4. Stack backend~~ — RESOLVED

**Keputusan:** LOCKED **identik SIMBAK**. Laravel 11 + PHP 8.2-fpm-alpine + Supervisor + PostgreSQL + sqlsrv pdut + Redis. Detail di `07-stack-decision.md`.

---

## 🔴 Blocker — masih butuh jawaban user

### Q2. Kredensial SIMKATMAWA untuk Unila

Apakah tim kemahasiswaan sudah punya akun + password SIMKATMAWA untuk Unila? Kalau belum, ini prasyarat Phase 2 (tidak bisa di-fake pakai akun lain).

### Q3. Kode PT

Nilai `kode_pt` Unila di SIMKATMAWA (contoh di dokumen: `"000000"` placeholder). Perlu angka asli dari tim kemahasiswaan.

### Q-PDUT-MIGRATION. Backfill `pdrd.prestasi`

751 baris prestasi PDDIKTI feeder existing — mau di-import ke SI-Prestasi sebagai seed awal, atau mulai kosong?

**Opsi A (import):**
- Ops punya historical context dari hari pertama
- Banyak field placeholder (cabang=NULL, tgl_sertifikat=YYYY-12-31, urls=NULL, dosen=empty)
- Butuh review manual per record sebelum ubah status ke `ready`
- Risiko kualitas data rendah di record-record lama

**Opsi B (mulai kosong):**
- Cleaner — tiap entry di SI-Prestasi punya data lengkap sesuai form SIMKATMAWA
- Kehilangan history untuk analitik tahun-tahun lama
- pdrd.prestasi tetap ada untuk dashboard legacy

Rekomendasi saya: **Opsi B** untuk kesederhanaan, + tambah fitur "analitik gabungan pdrd + si_prestasi" di Phase 4 kalau pimpinan butuh view historis.

---

## 🟡 Keputusan desain — butuh input

### Q5. Database terpisah atau shared?

Opsi:
- (a) Database PostgreSQL baru `si_prestasi` (rekomendasi) — clean isolation.
- (b) Schema baru di database SIMBAK existing — ringan dari sisi infra.

Rekomendasi: (a), tapi di host PostgreSQL yang sama supaya tidak multiply container.

### Q6. Multi-tenancy per fakultas

- Operator fakultas hanya lihat prestasi fakultasnya — enforced.
- Tapi mahasiswa lintas fakultas di satu tim? (lomba kolaboratif). → **Aturan:** "ownership = fakultas ketua tim" (field `id_fakultas` di parent table). Operator fakultas lain punya view-only ke prestasi yang ada mahasiswanya. Konfirmasi apakah ini OK.

### Q7. Apakah mahasiswa bisa input sendiri?

- Opsi A: Mahasiswa create draft → operator fakultas review → admin submit. UX lebih kompleks tapi engagement tinggi.
- Opsi B: Hanya operator fakultas yang input (mahasiswa kirim lewat form paper/email). Simpler Phase 1.

Rekomendasi Phase 1: **B** (operator only). Phase 2+ buka untuk mahasiswa.

### Q8. Verifikasi dokumen sebelum kirim ke SIMKATMAWA

- Apakah perlu approval bertingkat (fakultas → kemahasiswaan → kirim)?
- Atau cukup satu approval (admin kemahasiswaan saja)?
- Kalau ketat (multi-level): mirip SIMBAK pattern — reuse workflow engine.
- Kalau ringan: 1 tombol "submit" oleh admin.

Rekomendasi Phase 1: ringan. Tambah kompleksitas Phase 2 kalau perlu.

### Q9. Storage dokumen publik

- (a) Nginx static di VM target — simpel, tapi URL pakai subdomain (butuh DNS + cert).
- (b) MinIO public bucket — S3 compatible, URL panjang tapi no DNS change.
- (c) Cloudflare R2 / CDN — eksternal, berbayar.

Rekomendasi: (a) dengan subdomain `prestasi.unila.ac.id` atau similar.

### Q10. Enum master-data: boleh diedit admin atau seed only?

Kategori SIMKATMAWA adalah enum tertutup (DIKTI yang menentukan). Kalau admin bisa edit, mereka bisa bikin kategori yang SIMKATMAWA tolak. **Rekomendasi: read-only di UI, hanya diubah via migration saat DIKTI update enum.**

---

## 🟢 Risiko yang bisa dikelola

### R1. SIMKATMAWA API berubah tanpa pemberitahuan

DIKTI bisa rotate field / enum / URL. Mitigasi:
- Pakai contract test: mingguan test payload minimal ke endpoint, alert kalau 4xx baru.
- Log full response → mudah debug.
- Version cap di config (`config/simkatmawa.php` → `api_version: 'v1-2026-03'`).

### R2. Data SIMKATMAWA diedit admin DIKTI manual → drift dengan kita

Kita tidak punya GET, jadi drift tidak terdeteksi.
Mitigasi Phase 1: ops manual spot-check portal SIMKATMAWA vs `sync.submission`.
Mitigasi Phase 3: minta GET endpoint.

### R3. Double-submit

User klik "Submit" dua kali → duplikat di SIMKATMAWA (tidak ada idempotency key).
Mitigasi:
- State machine lock (`sending` state)
- Tombol disabled + loading UI
- `Idempotency-Key` header di backend (in-memory dedup 10 detik)

### R4. Volume mengirim melonjak saat deadline pelaporan

Akhir semester kemahasiswaan biasanya dorong banyak prestasi sekaligus. Risk overload SIMKATMAWA atau rate limit.
Mitigasi:
- Queue worker batasi concurrency (misal 3 parallel)
- Throttle per IP di SIMKATMAWA ke 30/menit
- Ops monitor queue depth

### R5. Mahasiswa NIM tidak ditemukan di pdut

Bisa karena: NIM baru (belum sync feeder), NIM salah ketik, mahasiswa drop out.
Mitigasi: saat input, suggest NIM dari autocomplete. Allow override dengan alasan.

### R6. Nama mahasiswa di pdut ≠ nama di sertifikat lomba

Misal nama lengkap vs panggilan. Tetap pakai pdut sebagai source of truth untuk konsistensi nasional (PDDIKTI compat).

### R7. Storage file grow tanpa batas

Cleanup policy:
- File yang tidak direferensikan oleh prestasi record apapun setelah 30 hari → delete.
- Cron job `cleanup_orphan_files` weekly.

### R8. Performance query cross-DB (pdut + si_prestasi)

Lookup mahasiswa by NIM ke SQL Server — network RTT matters kalau VM SI-Prestasi ≠ VM pdut.
Mitigasi: cache Redis 5 menit per NIM, invalidate on demand.

### R9. Backup/DR

PostgreSQL baru belum ada di backup rotation. Perlu koordinasi dengan DBA untuk:
- pg_dump ke backup server (daily)
- WAL archiving untuk point-in-time recovery (kalau penting)

---

## 🔵 Untuk catatan kemudian

### N1. UI/UX wireframe

Plan ini teknis, belum ada wireframe. Phase 1 start implementation bisa pakai Figma tiruan SIMBAK untuk speed.

### N2. Nama aplikasi

"SI-Prestasi" placeholder. Bisa diganti (SI-MABA, SI-KATMA, ...) — user yang putuskan untuk branding portal.

### N3. Target VM deploy

Belum ditetapkan. Opsi: deploy bareng SIMBAK di VM8 (resource share) atau VM baru (VM9). Bergantung load forecast.

### N4. Dokumentasi user (manual book)

Untuk operator fakultas + admin kemahasiswaan. Masuk Phase 1 deliverable.
