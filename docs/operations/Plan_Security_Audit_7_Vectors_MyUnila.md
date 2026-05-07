# Security Audit & Hardening Plan — MyUnila (7 Attack Vectors)

**Tanggal:** 2026-05-08
**Status:** PLAN (audit selesai, implementasi pending approval)
**Scope:** Audit menyeluruh 7 kategori serangan: file inclusion, XSS, CSRF, brute force, SQL injection, command injection, file upload
**Coverage:** ~1130 PHP files + ~12183 TS/TSX files

---

## 1. Executive Summary

Audit ini dilakukan setelah security finding eksternal (Broken Access Control di portal-apps) yang sudah di-fix di hari yang sama. Permintaan user: lakukan deep-dive untuk 7 attack vector lain agar tahu posisi keseluruhan postur keamanan MyUnila.

### Hasil Ringkas

| Kategori | Severity | Likelihood | Status |
|---|---|---|---|
| 1. File Inclusion (LFI/RFI) | 🟢 Low | Low | Aman — Laravel framework + strict path API |
| 2. XSS Attack | 🟡 Medium | Medium | Ada risiko di search highlight + RichTextEditor |
| 3. CSRF Attack | 🟢 Low | Low | Mitigated by JWT-only stateless API |
| 4. **Brute Force** | 🔴 **HIGH** | **HIGH** | **Login endpoint belum ada rate limit + account lockout logic missing** |
| 5. SQL Injection | 🟢 Low | Low | Parameter binding konsisten Laravel + Go |
| 6. Command Injection | 🟢 Low | Low | Pemanggilan shell terbatas, hardcoded paths |
| 7. **File Upload Vuln** | 🟡 **Medium** | Medium | MIME spoofing risk (no magic number check) + CORS misconfig di SIMBAK preview |

### Top 3 Critical Items

1. **Login brute force protection MISSING** — endpoint `/api/v1/auth/login` tidak ada rate limit; kolom `failed_login_attempts` ada di DB tapi tidak ada increment/check logic.
2. **MIME type spoofing risk** — file upload validasi MIME via `Content-Type` header (bisa di-spoof). Tidak ada magic number check.
3. **CORS + CSP misconfiguration** di SIMBAK preview document — `Access-Control-Allow-Origin: *` + `frame-ancestors *` membuka iframe clickjacking surface.

---

## 2. Detail Audit Per Kategori

### 2.1 File Inclusion (LFI/RFI)

**Severity:** 🟢 Low
**Likelihood:** Low

#### ✅ Proteksi yang sudah ada

- `FileUploadController.php:98` (si-prestasi) — Path traversal guard: `if (str_contains($path, '..'))`
- UUID-based filename via `Storage::put()` dengan structured path `{parent_tipe}/{id_parent}/{jenis}/{uuid}.{ext}` — tidak ada user-controlled path components
- `MinioService.php` (simbak) — abstrasi Laravel filesystem, tidak ada `include`/`require` dengan user input
- Laravel framework otomatis sanitize bootstrap loaders (`require __DIR__ . '/...'` — hardcoded paths)

#### 🔴 Kelemahan

**Tidak ditemukan vulnerability serius** di kategori ini. Pattern berbahaya seperti `include $variable`, `require $_GET[...]`, `file_get_contents($_REQUEST[...])` tidak ada di codebase.

#### 📋 Rekomendasi

- (Opsional) Aktifkan PHP `allow_url_include = Off` & `allow_url_fopen = Off` di production (defense in depth)

**Effort:** 5 menit (config `php.ini`).

---

### 2.2 XSS Attack

**Severity:** 🟡 Medium
**Likelihood:** Medium

#### ✅ Proteksi yang sudah ada

- `frontend/src/shared/utils/validators.ts:157-162` — `sanitizeInput()` pakai `textContent → innerHTML` pattern
- `simbak NotificationService.php:127,296` — `Mail::html()` dengan template system (no concatenation)
- `sister-service apps/dosen/controller.go:97` — CSP `default-src 'none'` untuk endpoint foto (good!)
- `public-service config/session.php:172,185,202` — Cookie session pakai `secure`, `http_only=true`, `same_site=lax`
- React/Next.js auto-escape default behavior

#### 🔴 Kelemahan

1. **DOM XSS via Meilisearch highlight** (32 instances)
   - File: `frontend/src/shared/components/search/result-cards/BidangIlmuResultCard.tsx:56-59,69-72` (dan 30+ files lain di `result-cards/`)
   - Pattern: `dangerouslySetInnerHTML={{__html: result.highlight?.nama_bidang}}` — render raw HTML dari hasil Meilisearch
   - Risk: Kalau ada stored XSS di data sumber (artikel, prodi description, dll), Meilisearch return highlighted version → render tanpa sanitasi → DOM XSS
   - Severity: Medium (limited ke search context)

2. **RichTextEditor pakai deprecated API**
   - File: `frontend/src/shared/components/manajemen-konten/RichTextEditor.tsx:44-45,52,73`
   - Pattern: `editorRef.current.innerHTML = value` + `document.execCommand()` deprecated
   - Risk: Konten yang diketik admin tidak di-sanitize sebelum render
   - Severity: Low (admin-only context, tapi practice tidak ideal)

3. **CORS + CSP wildcard di SIMBAK preview**
   - File: `simbak-service DokumenController.php:49-51,84-86`
   - Pattern: `Access-Control-Allow-Origin: *` + `Content-Security-Policy: frame-ancestors *`
   - Risk: Page lain bisa iframe SIMBAK preview document → clickjacking
   - Severity: Medium

4. **Tidak ada global CSP header** di main Laravel services (auth-service, public-service, dashboard-service) — only endpoint-specific.

#### 📋 Rekomendasi

| Item | Fix | Effort |
|---|---|---|
| 1. Sanitize Meilisearch highlight | Install `DOMPurify`, wrap setiap `dangerouslySetInnerHTML` highlight dgn `DOMPurify.sanitize(html)` | 2 jam (32 instances) |
| 2. Replace RichTextEditor | Migrate ke Tiptap atau ProseMirror (battle-tested, sanitization built-in) | 1 hari (UI rewrite) |
| 3. Tighten CORS + CSP SIMBAK | Replace `*` dgn specific origin (e.g. `https://my.unila.ac.id`); ganti `frame-ancestors *` ke `frame-ancestors 'self'` | 30 menit |
| 4. Global CSP middleware | Tambah middleware CSP di nginx atau Laravel: default-src self, script-src self + cdn yang dipakai, dll | 2 jam (test compatibility) |

**Total effort Phase XSS:** ~1.5 hari

---

### 2.3 CSRF Attack

**Severity:** 🟢 Low
**Likelihood:** Low

#### ✅ Proteksi yang sudah ada

- API-first architecture (Kong Gateway + JWT) — stateless, tidak rely on cookie session untuk authentication state
- `auth-service routes/api.php` — semua state-changing endpoint protected dengan `jwt.auth` middleware
- Session config `same_site=lax` (mencegah cross-site cookie attachment)
- Cookie fallback di api-service KongAuth sudah di-restrict ke `/docs` only (sudah di-fix sesi sebelumnya, commit `f1dea1f78`)
- VerifyCsrfToken middleware tersedia di Laravel `web.php` route group (tidak dipakai karena no web routes)

#### 🔴 Kelemahan

1. **Go services tidak ada CSRF middleware** — namun mitigated by JWT requirement (request needs valid JWT → CSRF via form attack tidak feasible).
2. **State-changing endpoint via cookie** — kalau cookie dipakai (di Scalar /docs), masih ada risiko CSRF kalau attacker control sub-domain. Mitigated by `SameSite=Lax` + restrict cookie path ke /docs only.

#### 📋 Rekomendasi

| Item | Fix | Effort |
|---|---|---|
| 1. CSRF token untuk Scalar UI | Untuk POST/PUT/DELETE via Scalar (cookie auth path), tambah CSRF token validation. SPA pakai Bearer header → skip CSRF | 4 jam |
| 2. Audit subdomain wildcard cookie | Pastikan cookie scope `Domain=my.unila.ac.id` (single subdomain), bukan `.unila.ac.id` (cross-sub) | 30 menit |

**Total effort Phase CSRF:** 0.5 hari (low priority — JWT architecture sudah cukup mitigate).

---

### 2.4 Brute Force ⚠️ CRITICAL

**Severity:** 🔴 HIGH
**Likelihood:** HIGH

#### ✅ Proteksi yang sudah ada

- DB schema sudah punya kolom `failed_login_attempts INT` & `locked_until DATETIME` di `man_akses.pengguna`
- `google2fa_enabled` flag (2FA infrastructure ada)
- Password reset throttle: 60 detik per user (`config/auth.php:98`)
- `api-service/internal/middleware/rate_limit.go` — rate limiter 10 req/sec per user (tapi cuma di api-service, bukan auth-service)

#### 🔴 Kelemahan KRITIS

1. **Login endpoint NO rate limit**
   - File: `auth-service/routes/api.php:61` — `POST /login` tidak wrapped dgn rate limit middleware
   - Risk: Attacker bisa coba unlimited password tanpa throttle. Dengan 10 ribu user, password lemah sangat vulnerable.

2. **Account lockout logic MISSING**
   - File: `auth-service/app/Services/Auth/AuthService.php:30-42`
   - Login flow tidak:
     - Check `locked_until` sebelum verify password
     - Increment `failed_login_attempts` saat password salah
     - Set `locked_until = NOW() + N minutes` setelah X kali gagal
   - Schema sudah ada, **logic implementasi yang kosong**.

3. **NO Captcha/reCaptcha** di login + reset password flow

4. **Password reset endpoint** — masih TODO/commented out (`routes/api.php:73-75`). Risiko low karena belum live, tapi nanti setup-nya harus dgn rate limit + captcha.

#### 📋 Rekomendasi (PRIORITY)

| # | Item | Implementation | Effort |
|---|---|---|---|
| 1 | Rate limit login endpoint | Add Laravel `throttle:5,1` middleware atau custom: 5 attempts/minute per IP+username | 1 jam |
| 2 | Account lockout logic | Modify `AuthService::login()`: check `locked_until` → reject 423; increment `failed_login_attempts` → kalau >= 5, set `locked_until = NOW() + 15min`; reset counter on success | 3 jam |
| 3 | Tambah audit log per login attempt | Log ke `logger.log_jwt` dengan flag berhasil/gagal | 1 jam |
| 4 | (Opsional) reCaptcha v3 | Setelah 3 attempt gagal, require reCaptcha token di next login attempt | 4 jam |
| 5 | Email notification suspicious login | Send email kalau lockout triggered atau login dari IP/device baru | 4 jam |

**Total effort Phase Brute Force:** 1-2 hari (priority = SEKARANG, ini real-world attack vector yang sering dipakai).

---

### 2.5 SQL Injection

**Severity:** 🟢 Low
**Likelihood:** Low

#### ✅ Proteksi yang sudah ada

- Laravel: parameter binding konsisten — `DB::select($query, $bindings)`, Eloquent ORM, query builder
  - Example: `auth-service PenggunaRepository.php:663-666` — UPDATE dengan `?` placeholders + bindings array
- Go: SQL Server parameterized queries dengan `@p1, @p2, ...`
  - Example: `monitoring/apps/keywords/repository.go:42-54`, `keuangan-service spp_mhs/repository.go:414`
- Search query: `LIKE '%' + @p1 + '%'` dengan parameter, bukan concatenation
- `sqlx` library untuk Go (struct scan, parameterized queries)

#### 🔴 Kelemahan

1. **`fmt.Sprintf` dipakai untuk WHERE clause assembly** (Go services)
   - File: `monitoring/apps/keywords/repository.go:52,60`, `monitoring/apps/site/repository.go:77,279`
   - Pattern: `fmt.Sprintf("SELECT ... WHERE %s", whereStr)` di mana `whereStr` = join dari conditions yang DI-BUILD via `fmt.Sprintf("%s = @p%d", col, idx)`
   - Risk: Kalau `col` (column name) berasal dari user input → SQL injection
   - **Audit hasil:** Di codebase, kolom selalu dari hardcoded list / allowlist, BUKAN user input. **Aman**.
   - Best practice: pakai builder pattern dengan column whitelist explicit (sudah ada di api-service `helper/conditions_builder.go`).

#### 📋 Rekomendasi

- Audit setiap `fmt.Sprintf` di Go repository — pastikan WHERE clause column names bersumber dari hardcoded constants atau allowlist, BUKAN dari user input
- Tambah linter rule (gosec atau staticcheck) untuk detect `fmt.Sprintf` dengan SQL pattern

**Effort:** 4 jam (audit + linter setup).

---

### 2.6 Command Injection

**Severity:** 🟢 Low
**Likelihood:** Low

#### ✅ Proteksi yang sudah ada

- Pemanggilan shell sangat terbatas:
  - `public-service AkreditasiMergeSeeder.php:113,122` — satu-satunya `exec()` ditemukan, untuk run Python seeder
  - Argument hardcoded: `$pythonExecutable = 'python'`, `$banptScript = $scriptsDir . '/fetch_banpt_api.py'`
  - File existence check: `file_exists($banptScript)` di line 119 sebelum exec

- Tidak ditemukan `shell_exec`, `passthru`, `system`, `proc_open`, atau backticks dengan user input
- Go: tidak ditemukan `os/exec.Command` dengan user-controlled argument

#### 🔴 Kelemahan

1. **Seeder script context** — db:seed adalah dev/operator command, tidak accessible via HTTP. Risiko nyaris nol.
2. **Python executable hardcoded** = `'python'` — operational risk, gak security risk.

#### 📋 Rekomendasi

- (Opsional) Migrate dari `exec()` ke `Symfony\Component\Process\Process` untuk lebih secure subprocess handling
- Kalau ada file upload yang trigger exec (e.g. ImageMagick), audit dengan extra hati-hati

**Effort:** N/A — no action needed kecuali nanti tambah feature yang butuh shell exec.

---

### 2.7 File Upload Vulnerability

**Severity:** 🟡 Medium
**Likelihood:** Medium

#### ✅ Proteksi yang sudah ada

- **MIME type whitelist**: `[application/pdf, image/jpeg, image/png]` di `FileUploadController.php:44`
- **UUID filename**: `Str::uuid() . '.' . $ext` — tidak bisa enumerate, tidak ada filename collision
- **Structured storage path**: `{parent_tipe}/{id_parent}/{jenis}/{filename}` — tidak ada user-controlled path
- **Max size**: 10MB hardcoded (`FileUploadController.php:60`)
- **Path traversal guard**: `if (str_contains($path, '..'))` di delete endpoint (line 98)
- **MinIO + Laravel Storage abstraction** — separasi dari web root
- **Specialized upload methods** di simbak: `uploadDokumenPengajuan`, `uploadSkBatch`, dll dengan path-validated

#### 🔴 Kelemahan

1. **MIME spoofing risk**
   - File: `FileUploadController.php:53` — validasi pakai `$file->getMimeType()` yang berasal dari `Content-Type` header (client-controlled)
   - Risk: Attacker upload `.php` file dengan `Content-Type: application/pdf` — server accept
   - Mitigation: tambah magic number validation:
     ```php
     // Untuk image
     if (!in_array(exif_imagetype($file->getRealPath()), [IMAGETYPE_JPEG, IMAGETYPE_PNG])) reject();

     // Untuk PDF
     $header = file_get_contents($file->getRealPath(), false, null, 0, 4);
     if ($header !== '%PDF') reject();
     ```

2. **No content scanning**
   - Polyglot files (PDF dengan embedded JS, image dengan EXIF code) bisa lolos
   - Mitigation: pakai ClamAV scan (kalau ada antivirus) atau library validation (e.g. `pdfparser` untuk inspect PDF metadata)

3. **Public-served storage**
   - File serve via nginx `/files/` — kalau attacker upload `polyglot.pdf` yang juga valid HTML, browser bisa render sebagai HTML
   - Mitigation: enforce `Content-Disposition: attachment` (sudah ada untuk download), tapi inline preview/iframe bypass
   - Plus: `X-Content-Type-Options: nosniff` header WAJIB di response

4. **Tidak ada upload audit log** — siapa upload apa kapan tidak di-log. Forensic value rendah.

#### 📋 Rekomendasi

| # | Item | Implementation | Effort |
|---|---|---|---|
| 1 | Magic number validation | Tambah method `validateFileSignature($file, $mime)` di FileUploadController | 1 jam |
| 2 | Add `X-Content-Type-Options: nosniff` | Nginx config global atau Laravel response middleware | 30 menit |
| 3 | Upload audit log | Log ke `log.aktivitas_data` setiap upload (user, file, hash, size, timestamp) | 2 jam |
| 4 | (Opsional) ClamAV integration | Scan upload sebelum save — bisa async via queue | 1 hari |
| 5 | Tighten CORS/CSP SIMBAK preview | (Sudah di section 2.2) | 30 menit |

**Total effort Phase File Upload:** 1 hari (Phase 1 + 2 + 3 + 5).

---

## 3. Action Plan Prioritas

### Phase 1 — Critical Fix (target: 1 hari kerja)

**P1.1 Brute Force Protection** ⚠️ TOP PRIORITY
- Rate limit login endpoint (Laravel throttle middleware, 5/min per IP+user)
- Implement account lockout logic di `AuthService::login()` (5 fail = 15 min lock)
- Add audit log per login attempt

**Effort:** 4 jam | **Impact:** Mencegah brute force credential stuffing

**P1.2 Magic Number Validation** untuk File Upload
- Modify `FileUploadController::store()` — tambah magic number check setelah MIME validation

**Effort:** 1 jam | **Impact:** Mencegah upload file PHP/script via MIME spoofing

**P1.3 Tighten SIMBAK preview CORS/CSP**
- Replace `*` dengan `https://my.unila.ac.id` di Access-Control-Allow-Origin
- Replace `frame-ancestors *` dengan `frame-ancestors 'self' https://my.unila.ac.id`

**Effort:** 30 menit | **Impact:** Mencegah clickjacking via iframe

### Phase 2 — High Priority (target: 2 hari kerja)

**P2.1 Sanitize Meilisearch Highlight** (32 instances)
- Install `DOMPurify`
- Wrap setiap `dangerouslySetInnerHTML` dgn `DOMPurify.sanitize()`

**Effort:** 2 jam | **Impact:** Mitigasi DOM XSS via search

**P2.2 Add `X-Content-Type-Options: nosniff` header**
- Tambah di nginx config global atau Laravel SecurityHeaders middleware

**Effort:** 30 menit | **Impact:** Mencegah MIME sniffing attack

**P2.3 Upload audit log**
- Log setiap file upload ke `log.aktivitas_data`

**Effort:** 2 jam | **Impact:** Forensic + audit trail

**P2.4 Global CSP header**
- Implement Content-Security-Policy header di Laravel middleware
- Test compatibility dengan inline scripts (Scalar UI, dll) — perlu tambah nonce atau hash

**Effort:** 4 jam | **Impact:** Defense in depth XSS

### Phase 3 — Medium Priority (target: 1 minggu)

**P3.1 RichTextEditor Migration**
- Replace deprecated `document.execCommand` dengan Tiptap/ProseMirror
- Test compatibility dengan existing content

**Effort:** 1 hari | **Impact:** Future-proof + sanitization built-in

**P3.2 reCaptcha v3 di login**
- Trigger setelah 3 fail attempts
- Backend verify token dengan Google reCaptcha API

**Effort:** 4 jam | **Impact:** Bot protection

**P3.3 ClamAV file scanning**
- Setup ClamAV daemon
- Async scan via queue

**Effort:** 1 hari | **Impact:** Malware prevention

### Phase 4 — Defense in Depth (ongoing)

- Audit `fmt.Sprintf` SQL builders di Go services (tambah linter)
- Audit cookie scope (.unila.ac.id vs my.unila.ac.id)
- Email notification untuk suspicious login
- Penetration testing eksternal (yearly)

---

## 4. Effort Summary

| Phase | Items | Total Effort | Priority |
|---|---|---|---|
| Phase 1 | 3 items (P1.1, P1.2, P1.3) | ~5.5 jam (1 hari) | **CRITICAL** |
| Phase 2 | 4 items (P2.1-P2.4) | ~9 jam (1.5 hari) | HIGH |
| Phase 3 | 3 items (P3.1-P3.3) | ~3 hari | MEDIUM |
| Phase 4 | Ongoing | Variable | LOW |

**Total Phase 1+2:** ~2.5 hari kerja untuk close 80% risk surface.
**Total full plan:** ~6-7 hari kerja.

---

## 5. Decision Points

Sebelum implementasi, perlu konfirmasi:

1. **Prioritas urutan implementasi** — confirm Phase 1 dulu (brute force urgent) atau ada item yang Bapak prioritaskan?
2. **reCaptcha** — pakai Google reCaptcha v3 (perlu API key) atau hCaptcha alternatif?
3. **2FA enforcement** — kolom `google2fa_enabled` ada, tapi belum mandatory untuk admin. Mau jadikan wajib untuk peran tertentu (Developer, Admin)?
4. **ClamAV** — mau setup integration atau cukup dengan magic number + extension validation?
5. **Pentest eksternal** — pernah dilakukan? Kalau belum, schedule yearly assessment?

---

## 6. Implementation Tracking

- [ ] **Phase 1.1** — Brute force protection (rate limit + lockout logic)
- [ ] **Phase 1.2** — File upload magic number validation
- [ ] **Phase 1.3** — SIMBAK CORS/CSP tightening
- [ ] **Phase 2.1** — DOMPurify untuk Meilisearch highlight
- [ ] **Phase 2.2** — X-Content-Type-Options nosniff
- [ ] **Phase 2.3** — Upload audit log
- [ ] **Phase 2.4** — Global CSP header
- [ ] **Phase 3.1** — RichTextEditor migration
- [ ] **Phase 3.2** — reCaptcha v3 integration
- [ ] **Phase 3.3** — ClamAV file scanning
- [ ] **Phase 4** — Defense in depth (ongoing)

---

## 7. Reference Standards

- OWASP Top 10 2024
  - A01:2021 — Broken Access Control (sudah di-fix sesi sebelumnya)
  - A03:2021 — Injection (covered by SQL Injection + Command Injection sections)
  - A05:2021 — Security Misconfiguration (CORS/CSP)
  - A07:2021 — Identification and Authentication Failures (Brute Force)
- OWASP ASVS Level 2 — Application Security Verification Standard
- CIS Benchmark — Web Application Security
- NIST 800-63B — Authentication & Lifecycle Management

---

*Audit dilakukan 2026-05-08 berdasarkan codebase pada commit `b4b8bb6d3`. Update saat implementasi dimulai.*
