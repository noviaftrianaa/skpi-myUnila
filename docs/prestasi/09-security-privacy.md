# Security & Privacy

Data yang kita handle: sertifikat mahasiswa, foto kegiatan, surat tugas dosen, nomor identitas (NIM, NUPTK/NIDN). Beberapa perhatian.

---

## 1. Kredensial SIMKATMAWA (dan API eksternal lain)

Kredensial disimpan di tabel **`setting.api_config`** (lihat schema §04), bukan di `.env`. Alasan:
- `.env` bisa ter-commit accidentally atau bocor saat deploy
- Rotasi password tanpa redeploy container
- Audit trail perubahan via `setting.api_config_log`
- Support multi-API (bearer / api_key / basic / oauth2) dalam satu pola

**Pola:**
- Kolom encrypted (`auth_username_encrypted`, `auth_password_encrypted`, `auth_api_key_encrypted`) pakai Laravel `Crypt::encryptString()` — kunci di `APP_KEY`
- `.env` HANYA berisi `APP_KEY` (master encryption key). Kehilangan `APP_KEY` = tidak bisa decrypt kredensial.
- Backup terpisah: dump `setting.api_config` tanpa `APP_KEY` (di VM lain) dan `APP_KEY` tanpa dump (di password manager/Vault)

**Rotation policy:**
- Ganti password SIMKATMAWA setiap 6 bulan atau saat staff kemahasiswaan rotasi
- `APP_KEY` rotation: jarang, tapi kalau harus, re-encrypt semua record setting via migration script
- Audit log `setting.api_config_log` setiap kali kredensial diubah (action=ROTATE_PASSWORD)

**UI:**
- Admin kemahasiswaan punya halaman "Integrasi API" (route `/dashboard/sim-prestasi/master-data/api-config`)
- Password field: placeholder `********`, submit kosong = jangan ubah (pola SIMBAK smtp_password)
- Tombol "Test Connection" → panggil `POST /api/admin/api-config/{kode}/test` yang login ke API target dan return {success, message} (tanpa expose token)

### Token

- JWT SIMKATMAWA cached di Redis dengan TTL = exp - 60s.
- Jangan log full token — redact ke `Bearer <sha256-first-8>...`.
- Kalau ada kebocoran suspect, tombol "invalidate session" di master-data UI untuk paksa re-login.

---

## 2. File upload publik

Dokumen yang dikirim ke SIMKATMAWA via URL akan **accessible publik**:

| Bolehkah upload? | Alasan |
|---|---|
| Sertifikat lomba | ✅ Ya — memang perlu publik |
| Foto kegiatan | ✅ Ya — asal tidak ada informasi pribadi sensitif |
| Surat tugas dosen | ⚠️ Hati-hati — surat tugas biasanya ada tanda tangan + NIP. NIP itu sensitive tapi umum dibagikan |
| Scan KTP | ❌ Tidak boleh — data pribadi |
| Transkrip nilai | ❌ Tidak — data akademik rahasia |
| Surat rekomendasi pribadi | ❌ Tidak |

Enforce di backend:
- Content-type whitelist (PDF / image only)
- Size limit 10 MB
- Filename di-randomize (UUID) supaya tidak guessable
- Simpan "hash" file untuk deteksi duplikat (opsional)

URL public berbentuk `https://prestasi.unila.ac.id/files/{uuid}.ext` — tidak ada listing, tidak ada direktori browsable. Nginx config:

```nginx
location /files/ {
    autoindex off;
    try_files $uri =404;
    add_header Cache-Control "public, max-age=31536000";
    add_header X-Content-Type-Options "nosniff";
    add_header X-Frame-Options "SAMEORIGIN";
}
```

---

## 3. Data mahasiswa

- NIM, nama, prodi, fakultas di-cache di table child. Cache ini bisa jadi stale (mahasiswa ganti prodi jarang terjadi, tapi nama bisa koreksi).
- Trigger refresh: saat record transisi `draft → ready`, re-fetch NIM dari pdut. Kalau beda, flag untuk review.
- Mahasiswa yang sudah lulus / drop out (`id_jns_keluar IS NOT NULL`) tetap boleh punya prestasi historis (prestasinya memang dari masa aktif). Jangan reject.

---

## 4. Akses backend

- Semua endpoint behind JWT Unila. Gateway Kong enforce JWT consumer.
- Middleware RBAC di Laravel: `Can::class` policy.
- Admin endpoints (`/master-data`, `/sync-log`, `/credentials`) hanya role `admin_kemahasiswaan`.
- Rate limit per user: 300 req/menit. Abuse detection: log WARN kalau ada 50+ 4xx dari satu user dalam 1 menit.

---

## 5. SSL/TLS

- Kong terminate TLS di VM1 (produksi frontend+kong). Upstream si-prestasi-service bisa HTTP internal (VPC).
- SIMKATMAWA adalah HTTPS, pastikan client verify cert (default Guzzle).
- Pin certificate (opsional) — DIKTI cert bisa rotasi, jangan pin.

---

## 6. Audit log

Semua mutasi masuk `log.activity`. Data yang harus tercatat minimal:
- user id + IP
- action (create/update/submit/retry/archive)
- before/after diff (untuk update)
- timestamp

Retensi: minimal 2 tahun (match Kemendikbud audit). Archive ke cold storage setelah 6 bulan (opsional).

---

## 7. Backup

- PostgreSQL `si_prestasi`: dump harian, retain 30 hari
- Files publik: sync mingguan ke storage sekunder
- SIMKATMAWA response (`sync.submission.response_body`) — sudah di DB, ikut backup

---

## 8. Ancaman & mitigasi

| Threat | Mitigasi |
|---|---|
| SQL injection | Parametrized queries via ORM + DB::bind |
| XSS di frontend | React auto-escape, backend validasi URL format |
| CSRF | SSO JWT di header, bukan cookie |
| Credential bocor di log | Redact token/password di log middleware |
| File upload malicious | Content-type + ext whitelist, scan di Phase 2 |
| Over-fetch data mahasiswa | Backend filter by fakultas (RBAC), pagination wajib |
| DDoS ke /api/files | Rate limit + cache Cloudflare/CDN (opsional) |
| SIMKATMAWA side compromise | Pakai throwaway password (bukan password Unila lainnya) |
