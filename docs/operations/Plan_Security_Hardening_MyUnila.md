# Security Hardening Plan — MyUnila API & Authentication

**Tanggal:** 2026-05-07
**Status:** PLAN (belum diimplementasikan)
**Severity:** Medium-High (auth surface area)
**Trigger:** Investigasi cookie-fallback bypass di Scalar `/docs`, sesi 7 Mei 2026

---

## 1. Executive Summary

Saat audit ws_authorization, ditemukan bahwa endpoint `/v1/*` di `api-service` bisa diakses tanpa explicit `Authorization: Bearer <jwt>` header — hanya bermodal cookie session yang otomatis terbawa dari login MyUnila di browser yang sama.

**Bukan bypass total** (KongAuth tetap minta credential), tapi **misalignment antara Kong gateway policy dan api-service KongAuth middleware**:

- **Kong** validate JWT dari `header_names: ["authorization"]` saja (`cookie_names: []` — kosong).
- **api-service KongAuth middleware** punya fallback baca cookie `token` / `access_token`.

Akibat: traffic yang lolos Kong (karena Kong route bersifat optional auth atau via path tertentu) bisa tetap di-trust api-service via cookie, **bahkan kalau Kong tidak validasi cookie tersebut**. Trust kepercayaan jadi inkonsisten antar layer.

Plus: cookie scope `*.unila.ac.id` membuka CSRF surface area di lintas-subdomain.

---

## 2. Threat Model

### 2.1 Skenario eksploitasi

| Skenario | Severity | Likelihood | Impact |
|---|---|---|---|
| Shared workstation: User B akses akun User A via Scalar yang masih ada cookie | Medium | High | Akses data alumni/mhs/dosen sebagai User A |
| CSRF via subdomain XSS: page malicious di `*.unila.ac.id` craft request ke `api.unila.ac.id` dengan cookie auto-attached | High | Medium | Bypass auth untuk POST/PUT/DELETE — bisa modify data |
| Cookie leakage via misconfigured domain: cookie diset tanpa Secure flag, ter-leak di HTTP request ke subdomain non-HTTPS | High | Low | Token exfiltration via passive eavesdrop |
| Browser tab leakage: developer login MyUnila di browser, lalu dev server dia di subdomain Unila bisa baca cookie kalau HttpOnly tidak set | Medium | Low | Local dev token leakage |

### 2.2 Asumsi proteksi yang TIDAK boleh berkurang

- JWT signed dengan secret yang strong dan rotated periodically
- HTTPS terminator di Cloudflare/Kong dengan TLS 1.2+
- Frontend MyUnila pakai axios interceptor yang attach `Authorization: Bearer` secara explicit
- Server-to-server clients (tracer, sister, simbak, dll) PASTI pakai Bearer header (bukan cookie)

---

## 3. Findings — Detail Teknis

### 3.1 api-service KongAuth fallback ke cookie

File: `backend/api-service/internal/middleware/kong_auth.go` line 49-58:

```go
if tokenString == "" {
    tokenString = c.Cookies("token")
}
if tokenString == "" {
    tokenString = c.Cookies("access_token")
}
```

**Masalah:** Cookie fallback aktif untuk SEMUA path, termasuk endpoint API sensitif `/v1/tracer/*`, `/v1/mahasiswa/*`, `/v1/kkn/*`, dll. Padahal Scalar UI saja yang butuh fallback ini.

### 3.2 Kong route hanya extract dari Authorization header

File: `deployment/production/vm1-frontend-kong/scripts/setup-kong-routes.sh`:

```json
{
  "header_names": ["authorization"],
  "cookie_names": []
}
```

Kong tidak validate cookie sebagai JWT source. Cookie melewati Kong tanpa di-cek, lalu di-trust api-service saat sampai upstream. **Trust chain inkonsisten.**

### 3.3 Cookie attribute tidak terverifikasi

Belum di-audit apakah auth-service set cookie dengan:
- `HttpOnly: true`
- `Secure: true`
- `SameSite: Strict` atau minimal `Lax`
- `Domain: .unila.ac.id` (intended) atau `Domain: my.unila.ac.id` (tighter)

Tanpa atribut ini → exposed ke XSS, CSRF, MITM attack.

### 3.4 Tidak ada CSRF protection untuk state-changing endpoint

`POST /v1/tracer/hasil_tracer`, `PUT /v1/tracer/hasil_tracer/{id}`, `DELETE /v1/.../`, dll — tidak ada CSRF token. Cookie-based auth tanpa CSRF = vulnerable.

---

## 4. Action Plan (Phase 1-3)

### Phase 1 — Quick Wins (target: 1 hari kerja, low risk)

**1.1 Restrict cookie fallback di KongAuth middleware**

File: `backend/api-service/internal/middleware/kong_auth.go`

Modifikasi: cookie fallback HANYA aktif untuk path Scalar Docs.

```go
// Ganti baris 49-58 dengan:
allowCookie := strings.HasPrefix(c.Path(), "/docs") ||
               strings.HasPrefix(c.Path(), "/openapi") ||
               c.Path() == "/scalar"

if tokenString == "" && allowCookie {
    if t := c.Cookies("token"); t != "" {
        tokenString = t
    } else if t := c.Cookies("access_token"); t != "" {
        tokenString = t
    }
}
```

**Effort: 15 menit** (code + rebuild + test)
**Impact:** Endpoint API `/v1/*` wajib explicit `Authorization: Bearer` header. Scalar UI tetap usable lewat cookie.

**Risk:** Kalau ada client lain yang andalkan cookie auth ke `/v1/*` → break. **Action needed**: audit semua consumer api-service sebelum apply.

**1.2 Audit cookie attribute di auth-service**

File: `backend/auth-service/app/Http/Controllers/AuthController.php` (atau pattern serupa)

Pastikan response set cookie dengan:
```php
return response()->json([...])->cookie(
    'token', $token, $minutes,
    '/',                        // path
    '.unila.ac.id',             // domain
    secure: true,               // ✓ HTTPS only
    httpOnly: true,             // ✓ no JS access
    raw: false,
    sameSite: 'Strict'          // ✓ no cross-site
);
```

**Effort: 30 menit** (cek code path login + logout + refresh)
**Impact:** Mitigasi CSRF + XSS + MITM attack basic.

**1.3 Test regression**

- [ ] Curl `/v1/kkn/list_peserta` tanpa header → harus 401
- [ ] Curl `/v1/kkn/list_peserta` dgn cookie aja → harus 401 (was 200 sebelumnya)
- [ ] Browser login → buka `/docs` → try-it-out → harus tetap works (cookie-allowed)
- [ ] Browser login → buka `/v1/kkn/list_peserta` di address bar → harus 401 (cookie ditolak untuk path ini)
- [ ] Frontend MyUnila navigate menu → semua API call harus tetap works (axios pakai header)
- [ ] Postman/insomnia dgn Bearer header → tetap works

### Phase 2 — Kong-level Hardening (target: 2 hari kerja)

**2.1 Aktifkan Kong rate limiting per consumer**

Sekarang rate limiter ada di api-service Go (per IP). Tambahkan Kong-level rate limit per consumer (per user JWT) untuk DDoS protection di gateway.

```bash
curl -X POST http://kong-admin/services/api-service/plugins \
  -d "name=rate-limiting" \
  -d "config.minute=300" \
  -d "config.policy=local" \
  -d "config.identifier=consumer"
```

**Effort: 1-2 jam**

**2.2 Tambah Kong CORS plugin yang ketat**

Saat ini CORS dihandle di api-service. Pindahkan ke Kong agar consistent:

```bash
curl -X POST http://kong-admin/services/api-service/plugins \
  -d "name=cors" \
  -d "config.origins=https://my.unila.ac.id" \
  -d "config.methods=GET,POST,PUT,DELETE" \
  -d "config.credentials=true" \
  -d "config.max_age=3600"
```

**Effort: 1 jam**
**Impact:** Cross-origin request hanya dari `my.unila.ac.id`, blok subdomain lain.

**2.3 Audit semua Kong route untuk JWT enforcement**

Cek semua route di Kong:
- Apakah punya plugin `jwt` aktif?
- Apakah `header_names: ["authorization"]` set?
- Apakah `cookie_names: []` (kosong, jangan validate cookie)?
- Apakah ada route yang accidentally `auth: optional`?

Output: report semua route + plugin status di tabel.

**Effort: 2 jam**

### Phase 3 — CSRF Protection (target: 3-5 hari kerja, kalau dibutuhkan)

**3.1 Tambah CSRF token middleware untuk state-changing requests**

Untuk POST/PUT/PATCH/DELETE — wajib include header `X-CSRF-Token` yang match dengan token di cookie atau session.

Pattern:
1. Login → server set 2 cookie:
   - `token` (HttpOnly, JWT) — gak bisa dibaca JS
   - `csrf_token` (NOT HttpOnly, random) — bisa dibaca JS
2. Frontend baca `csrf_token` dari cookie via JS
3. Setiap state-changing request → kirim `X-CSRF-Token: <csrf_value>` di header
4. Server validasi: header value harus match dengan cookie value

Implementasi:
- Middleware baru di api-service: `internal/middleware/csrf.go`
- Update auth-service untuk issue 2 cookie saat login
- Update frontend axios interceptor untuk attach X-CSRF-Token

**Effort: 2-3 hari**
**Trade-off:** Break API consumer yang bukan SPA (server-to-server). Solusi: skip CSRF check untuk endpoint yang authenticate via Bearer header (bukan cookie).

**3.2 Set cookie SameSite=Strict (kalau Phase 1.2 belum jadi Strict)**

`SameSite=Strict` menolak cookie di cross-site request — mitigasi CSRF tanpa CSRF token. Tapi break login flow kalau auth-service redirect dari domain lain.

---

## 5. Decision Points

Sebelum implementasi, perlu konfirmasi:

1. **Audit consumer api-service** — apakah ada client selain frontend MyUnila + Scalar yang andalkan cookie auth ke `/v1/*`? Kalau ada, perlu transition plan ke Bearer header sebelum Phase 1.1 deploy.
2. **Cookie domain scope** — pertahankan `.unila.ac.id` (cross-subdomain SSO) atau perketat ke `my.unila.ac.id` (single-app)?
3. **CSRF di Phase 3** — implementasi sekarang atau tunggu sampai ada incident? Subject ke risk appetite.
4. **Rate limit threshold** — 300 req/min per user wajar atau tighter?

---

## 6. Effort Estimation

| Phase | Item | Effort | Dependencies |
|---|---|---|---|
| 1.1 | Restrict cookie fallback path | 15 min | Audit consumer (1 jam) |
| 1.2 | Cookie attribute audit & fix | 30 min | Akses repo auth-service |
| 1.3 | Regression test | 1 jam | Staging env ready |
| 2.1 | Kong rate limit per consumer | 1-2 jam | Akses Kong admin |
| 2.2 | Kong CORS plugin | 1 jam | Akses Kong admin |
| 2.3 | Kong route audit | 2 jam | Akses Kong admin + dokumentasi |
| 3.1 | CSRF middleware | 2-3 hari | Phase 1 done, audit code paths |
| 3.2 | Cookie SameSite=Strict review | 1 jam | Test SSO flow |

**Total Phase 1: ~2 jam.**
**Total Phase 1+2: ~6-8 jam (1 hari kerja).**
**Total all phases: ~3-4 hari kerja.**

---

## 7. Communication & Rollout

- **Phase 1 deploy:** rolling — staging dulu (1 hari), monitoring 24 jam, baru production. Comms ke developer team via Telegram channel sebelum & sesudah.
- **Phase 2 deploy:** feature flag (gradual rollout per service). Test di Kong staging dulu.
- **Phase 3 deploy:** breaking change — perlu coordination dengan semua consumer (frontend, mobile, third-party). Deprecation notice 2 minggu sebelumnya.

---

## 8. Reference / Related Files

- `backend/api-service/internal/middleware/kong_auth.go` — cookie fallback logic
- `backend/api-service/internal/middleware/ws_auth.go` — ws_authorization check
- `backend/auth-service/app/Http/...` — JWT issuance (audit pending)
- `deployment/production/vm1-frontend-kong/scripts/setup-kong-routes.sh` — Kong route + JWT plugin config
- `deployment/production/vm1-frontend-kong/scripts/setup-kong-jwt-consumer.sh` — JWT consumer setup

---

## 9. Implementation Tracking

- [ ] Phase 1.1 — Restrict cookie fallback ke /docs path only
- [ ] Phase 1.2 — Cookie attribute (HttpOnly, Secure, SameSite=Strict)
- [ ] Phase 1.3 — Regression test (curl + browser + Postman)
- [ ] Phase 2.1 — Kong rate limit per consumer
- [ ] Phase 2.2 — Kong CORS plugin
- [ ] Phase 2.3 — Kong route audit
- [ ] Phase 3.1 — CSRF middleware
- [ ] Phase 3.2 — SameSite=Strict review

---

## 10. References & Standards

- OWASP Top 10 2024: A07 — Identification and Authentication Failures
- OWASP Top 10 2024: A01 — Broken Access Control
- RFC 6749 — OAuth 2.0 (Bearer Token Usage)
- RFC 6265bis — HTTP Cookies (SameSite, Secure, HttpOnly)
- Mozilla Web Security Guidelines — Cookie best practices
- Kong Plugin Hub — JWT, Rate Limiting, CORS

---

*Doc ini akan di-update saat implementasi dimulai. Versi terbaru di repo: `docs/security/Plan_Security_Hardening_MyUnila.md`*
