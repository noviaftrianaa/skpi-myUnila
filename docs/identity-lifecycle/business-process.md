# Identity Lifecycle Management Unila — Business Process Document

**Inisiatif:** Otomasi Provisioning Email Microsoft 365 & Google Workspace
**Status:** Draft v1 — untuk review stakeholder
**Tanggal:** 13 Mei 2026
**Owner:** UPA TIK Universitas Lampung
**Repo terkait:** `my-unila/` (platform MyUnila), `si-registrasi/` (registrasi calon mahasiswa)
**Target rilis MVP:** Q3 2026 (12–14 minggu setelah plan disetujui)

---

## Daftar Isi

1. [Executive Summary](#1-executive-summary)
2. [Current State](#2-current-state)
3. [Target State](#3-target-state)
4. [Comparison: Microsoft Graph API vs Google Admin Directory API](#4-comparison-microsoft-graph-api-vs-google-admin-directory-api)
5. [Architecture](#5-architecture)
6. [Detailed Flows (6 Skenario)](#6-detailed-flows)
7. [Database Schema](#7-database-schema)
8. [Security & Compliance](#8-security--compliance)
9. [Implementation Roadmap](#9-implementation-roadmap)
10. [Cost Analysis](#10-cost-analysis)
11. [Risk Register](#11-risk-register)
12. [Appendix: API Examples](#12-appendix-api-examples)
13. [Open Questions for Stakeholder Review](#13-open-questions-for-stakeholder-review)

---

## 1. Executive Summary

### Latar Belakang

Setiap tahun Unila menerima ribuan mahasiswa baru dan harus menyediakan akun email institusional di dua platform: **Microsoft 365** (lisensi A1 for Education) dan **Google Workspace for Education Fundamentals**. Saat ini proses ini dilakukan **manual** — admin TIK mengunggah file CSV ke admin console masing-masing platform setelah NPM mahasiswa baru diterbitkan dari SI-Registrasi.

Pola ini memiliki tiga keterbatasan utama:

1. **Latency tinggi** — jeda antara NPM terbit dan email tersedia berkisar 1–7 hari, tergantung jadwal batch admin.
2. **Inkonsistensi data** — nama, prodi, fakultas yang ditampilkan di profil M365/Workspace sering tidak sinkron dengan SIAKADU karena re-upload tidak otomatis.
3. **Beban operasional** — pada periode penerimaan mahasiswa baru (PMB), satu admin bisa menghabiskan 40–60 jam/bulan hanya untuk maintain upload identitas.

### Solusi yang Diusulkan

Membangun **modul Identity Lifecycle Management** sebagai bagian dari platform MyUnila yang:

- Mengintegrasikan **Microsoft Graph API** dan **Google Admin Directory API** secara native.
- Memberikan **frontend `manajemen-akses`** sebagai pusat kontrol provisioning (queue, approve, retry, audit).
- **Tidak mengubah** alur eksisting di SI-Registrasi (NPM → SIAKAD → SSO Unila tetap berjalan).
- Hanya menambahkan **hook event** pasca-NPM-terbit yang push data ke MyUnila untuk provisioning lanjutan.

### Pertimbangan Make vs Buy

Studi sebelumnya menguji opsi membeli IDP komersial (Okta Workforce, JumpCloud, Microsoft Entra Premium P2). Keputusan: **build sendiri**, dengan alasan:

- Microsoft Graph & Google Admin Directory **gratis penuh** untuk tenant edukasi (M365 A1 + Workspace Education Fundamentals) — tidak ada biaya per-API-call.
- Logika provisioning Unila spesifik (mapping prodi → OU, mapping jenjang → license SKU, lifecycle alumni) tidak terlayani out-of-the-box oleh produk komersial.
- Tim sudah punya kapasitas Go/Laravel dan platform MyUnila sebagai host alami.
- Vendor lock-in dihindari, audit log tetap di datacenter Unila.

### Manfaat Utama

| Aspek | Saat ini (Manual) | Target (Otomatis) |
|---|---|---|
| Latency NPM → email aktif | 1–7 hari | < 5 menit |
| Beban admin /bulan saat PMB | 40–60 jam | < 4 jam (review queue & exception) |
| Inkonsistensi data antar sistem | ~5–10% record | < 0.5% (reconciliation otomatis) |
| Audit trail siapa-buat-akun-siapa | Manual log Excel | Database + dashboard real-time |
| Offboarding (lulus/DO/pensiun) | Sering terlewat | Scheduled job + manual approve |

### Investasi

- **Engineering effort:** ~12–14 minggu (1 backend engineer + 1 frontend, paralel dengan inisiatif lain).
- **Biaya lisensi tambahan:** **Rp 0** — semua API dalam paket edu yang sudah dimiliki.
- **Infrastruktur tambahan:** 1 service Go baru (~256 MB RAM) di-host di VM eksisting.

---

## 2. Current State

### 2.1 Alur Registrasi Mahasiswa Baru (Eksisting di SI-Registrasi)

SI-Registrasi (`E:/laragon/www/si-registrasi/`, repo terpisah dari MyUnila) menangani pipeline dari calon daftar sampai NPM terbit. Berdasarkan eksplorasi kode:

**Tabel inti** (schema `regis` di PostgreSQL):

- `regis.calon_peserta_didik` — data biodata calon
- `regis.reg_peserta_didik` — record registrasi (35 kolom: NPM, prodi, status, audit, plus kolom sync: `a_sudah_sync_siakadu`, `a_sudah_sync_sso`, `a_sudah_sync_pddikti`)
- `regis.counter_npm` — counter sequence NPM per (prodi, tahun, jalur)

**State machine status `stat_lapor_diri`:**

```
(-) Belum Mengajukan
 ↓ submit verifikasi (calon)
(P) Pending
 ↓ verify (admin)        ↓ reject (admin)
(V) Terverifikasi        (R) Ditolak → calon perbaiki → (P)
 ↓ finalize (admin, a_valid=1)
(F) Final → NPM generated
```

**Format NPM** (10–11 digit, generated lokal di `NpmGeneratorService.php` 1322 baris):

- D3–S1: `YY J PPPP NNN` (10 digit) — contoh `2617051073` = tahun 26, jenis 1 (S1 reguler), prodi 7051, urutan 073.
- S2/S3/Profesi: `YY J PPPP NNNN` (11 digit, counter 4-digit).
- Atomicity: SELECT FOR UPDATE pada `counter_npm` + app-level lock di `regis.npm_lock` (TTL 30 s).
- PDDIKTI counter sync: scheduled daily 00:00 (read-only ke SQL Server PDDIKTI).

**Sync ke SIAKADU** (`SiakadService.php`, 626 baris):

- Endpoint `POST {base_url}/api/v1/mahasiswa/create`, auth JWT Bearer (cache 30 menit di Redis).
- Payload 30+ field di-join dari 5 tabel + mapping table `ref.mapping_siakadu`.
- Retry on 401 → refresh token, retry once.
- **Belum di-orkestrasi otomatis** pasca-NPM — service tersedia tapi belum di-wire ke workflow.

**Sync ke SSO Unila** (`SsoService.php`, 295 baris):

- Endpoint `POST {base_url}/sso-radius/create`, self-signed JWT HMAC-SHA256 (11 claim).
- Payload: `username = npm`, **`email = {npm}@students.unila.ac.id` (HARDCODED, baris 243)**.
- Password: `YYYYMMDD + NPM` → di-SHA1 oleh SSO API sebelum disimpan.
- **Belum di-orkestrasi otomatis** — service dormant, dipanggil manual.

### 2.2 Provisioning Email Saat Ini (Manual)

Setelah NPM terbit di SI-Registrasi:

1. Admin TIK download CSV mahasiswa baru (filter: bulan/periode).
2. Admin TIK **format ulang CSV** sesuai template Microsoft (FirstName, LastName, UserName, Password, etc).
3. Upload via **Microsoft 365 Admin Center → Active users → Add multiple users**.
4. Ulangi format CSV untuk template Google (familyName, givenName, primaryEmail, password).
5. Upload via **Google Workspace Admin → Users → Bulk upload users**.
6. Manual assign license M365 (A1 for Students) — dilakukan di portal admin, satu per satu atau via grup auto-assign.
7. Manual assign OU di Google Workspace (`/Mahasiswa/2026/FT/Informatika` misalnya).

### 2.3 Masalah yang Terjadi

| # | Masalah | Dampak |
|---|---|---|
| M1 | **Latency tinggi** — admin batch upload mingguan / bulanan | Mahasiswa baru tidak bisa login Teams/Classroom di hari pertama orientasi |
| M2 | **Format CSV beda** antara M365 dan Google → admin maintain 2 template + 2 mapping prodi | Mudah typo, sering duplicate row, password leaked di file Excel |
| M3 | **License assignment terlewat** — user dibuat tapi belum di-assign license A1 | Mahasiswa login tapi Office desktop tidak bisa diaktifkan |
| M4 | **OU/Group mismatch** — beberapa user nyangkut di `/` root karena admin lupa pilih OU | Policy GroupDriveAccess tidak ter-apply → akses Drive seharusnya tidak ada |
| M5 | **Tidak ada audit "siapa-bikin-akun-siapa"** — kalau ada akun ganjil, sulit lacak | Risiko security (akun fiktif untuk phishing) |
| M6 | **Offboarding tidak konsisten** — alumni/DO/pensiun: email tetap aktif karena tidak ada trigger | Lisensi terbuang, akun lama jadi target phishing |
| M7 | **Reconciliation manual** — admin pernah temukan ada 1.700 akun M365 yang tidak ada di SIAKADU (dan sebaliknya) | Tidak bisa quick fix tanpa scripting ad-hoc |
| M8 | **Password generation tidak konsisten** — kadang YYYYMMDD+NPM, kadang random | UX login awal membingungkan; tidak terstandar |
| M9 | **Tidak ada self-service reset** end-to-end yang terlink ke SIAKAD | Mahasiswa hubungi helpdesk manual → tiket numpuk |

### 2.4 Beban Kerja Admin (Estimasi)

Berdasarkan log eksekusi tim TIK selama periode PMB 2025 (Jul–Sep):

| Aktivitas | Frekuensi | Durasi /sesi | Total /bulan |
|---|---|---|---|
| Download CSV dari SI-Registrasi | 2–3×/minggu | 30 menit | 4–6 jam |
| Format & validasi CSV (dedup, mapping prodi) | 2–3×/minggu | 1.5 jam | 12–18 jam |
| Upload M365 + assign license | 2–3×/minggu | 1 jam | 8–12 jam |
| Upload Google Workspace + set OU | 2–3×/minggu | 1 jam | 8–12 jam |
| Handle exception (akun gagal, password reset) | Harian | 30 menit | 10–15 jam |
| **Total** | | | **42–63 jam/bulan** |

Diluar periode PMB, tetap ada beban ~10–15 jam/bulan untuk handle mutasi, offboarding, dan ad-hoc request.

---

## 3. Target State

### 3.1 Prinsip Desain

1. **Source of truth tetap di SIAKADU** — provisioning hanya mengikuti data resmi yang sudah final.
2. **Trigger event-driven, bukan polling** — pasca-NPM-terbit, push event ke MyUnila auth-service.
3. **Frontend `manajemen-akses` adalah cockpit, bukan trigger satu klik** — ada queue review, dry-run, manual approve untuk batch besar.
4. **Idempotent end-to-end** — retry aman, dedup berdasarkan `external_identity` mapping.
5. **Decoupled** — kalau Google API down, M365 tetap jalan (dan sebaliknya).
6. **Auditable** — setiap call API + hasilnya ter-log dengan retention ≥ 5 tahun.

### 3.2 Alur End-to-End (Otomatis)

```
[SI-Registrasi]
   Calon daftar → Submit → Admin Verify → Finalize → NPM generated
                                                          │
                                                          ▼
                                            Sync ke SIAKADU (eksisting)
                                                          │
                                                          ▼
                                            Sync ke SSO Unila (eksisting)
                                                          │
                                                          ▼
                                            POST event ke MyUnila
                                            auth-service (BARU)
                                                          │
                                                          ▼
                              [MyUnila — Identity Lifecycle Service (BARU)]
                                            Queue: provision_request
                                                          │
                              ┌───────────────────────────┼───────────────────────────┐
                              ▼                                                       ▼
                  Worker M365 (Microsoft Graph)                    Worker Google (Admin SDK)
                              ▼                                                       ▼
                  POST /users + assignLicense                       POST /users + assign OU
                              │                                                       │
                              ▼                                                       ▼
                  external_identities (M365)                        external_identities (Google)
                                            │
                                            ▼
                  Frontend `manajemen-akses` menampilkan:
                  - queue provision (pending/synced/failed)
                  - audit log
                  - manual retry / batch approve
                  - reconciliation report
```

### 3.3 Komitmen Layanan (SLA Internal)

| Metric | Target |
|---|---|
| Latency NPM-terbit → akun aktif di M365 dan Google | ≤ 5 menit (P95) |
| Success rate provisioning otomatis | ≥ 99% |
| Reconciliation drift (akun beda antara SIAKADU & cloud) | ≤ 0.5% |
| Time-to-revoke (alumni/DO/pensiun) sejak status berubah | ≤ 24 jam (nightly job) |
| Audit log retention | ≥ 5 tahun |

---

## 4. Comparison: Microsoft Graph API vs Google Admin Directory API

### 4.1 Tabel Komparasi Lengkap

| Aspek | **Microsoft Graph API** | **Google Admin Directory API** |
|---|---|---|
| **Base URL** | `https://graph.microsoft.com/v1.0` | `https://admin.googleapis.com/admin/directory/v1` |
| **Lisensi edu (gratis)** | M365 A1 for Faculty/Students — unlimited API call | Workspace for Education Fundamentals — quota 150 k req/hari/project |
| **Authentication** | OAuth 2.0 — Client Credentials Flow (app-only) | OAuth 2.0 — Service Account + Domain-Wide Delegation (impersonate super-admin) |
| **Token lifetime** | 1 jam (configurable hingga 24 jam) | 1 jam (re-generate via JWT bearer assertion) |
| **Required scopes (provisioning)** | `User.ReadWrite.All`, `Directory.ReadWrite.All`, `Group.ReadWrite.All`, `Organization.Read.All` | `https://www.googleapis.com/auth/admin.directory.user`, `...group`, `...orgunit` |
| **Endpoint Create User** | `POST /users` | `POST /users` |
| **Required fields** | `accountEnabled`, `displayName`, `mailNickname`, `userPrincipalName`, `passwordProfile` | `primaryEmail`, `name.givenName`, `name.familyName`, `password` |
| **Response code (success)** | `201 Created` + body User object dengan `id` (GUID Entra ID) | `200 OK` + body User object dengan `id` (numeric string) |
| **Endpoint Update User** | `PATCH /users/{id}` | `PUT /users/{userKey}` (full replace) atau `PATCH /users/{userKey}` (delta) |
| **Endpoint Delete User** | `DELETE /users/{id}` (soft delete → recycle bin 30 hari) | `DELETE /users/{userKey}` (langsung hard delete) |
| **Endpoint Suspend User** | `PATCH /users/{id}` set `accountEnabled: false` | `PATCH /users/{userKey}` set `suspended: true` |
| **License assignment** | `POST /users/{id}/assignLicense` body `{addLicenses:[{skuId}], removeLicenses:[]}` | `POST https://licensing.googleapis.com/apps/licensing/v1/product/{productId}/sku/{skuId}/user` (API terpisah) |
| **Group/OU model** | Groups (security + M365) + Administrative Units (AU) — flat, no hierarchy of containers | Organizational Units (OU) — true hierarchical tree (`/Mahasiswa/2026/FT/Informatika`) + Groups |
| **Endpoint add to group** | `POST /groups/{id}/members/$ref` body `{"@odata.id":"...users/{id}"}` | `POST /groups/{groupKey}/members` body `{email, role}` |
| **Email alias** | `proxyAddresses` array di user object — prefix `SMTP:` (primary) / `smtp:` (alias) | `POST /users/{userKey}/aliases` endpoint terpisah |
| **Email forwarding** | Lewat `mailbox-settings` (Outlook API, scope berbeda) | Set di Gmail settings via Gmail API (bukan Directory API) |
| **Password policy** | `passwordProfile.password` + `forceChangePasswordNextSignIn:true`; policy global di tenant | `password` (string atau SHA1/MD5 hash via `hashFunction`); `changePasswordAtNextLogin:true` |
| **Rate limit / throttling** | Token bucket per app + per tenant; limit Outlook 10 k req/10 min/user; limit directory write 15 k–30 k req/5 min/app/tenant; respons `429` + `Retry-After` | 15 req/detik/user (default), 150 k req/hari/project; `503` atau `403 userRateLimitExceeded` |
| **Bulk operations** | `$batch` endpoint — max **20 request per batch**, atomik per item (bukan transactional) | Tidak ada endpoint batch resmi untuk Directory; pakai concurrent individual call (thread / goroutine) |
| **Audit log API** | `GET /auditLogs/directoryAudits`, `GET /auditLogs/signIns` | `GET /admin/reports/v1/activity/users/all/applications/admin` (Reports API) |
| **Webhook / event subscription** | `POST /subscriptions` — webhook untuk resource changes (user lifecycle, group members, dst); harus diperpanjang berkala (max 3 hari) | Tidak ada webhook native untuk user changes; harus polling Reports API atau Pub/Sub via Cloud Identity Events (lebih kompleks) |
| **SCIM endpoint** | Entra ID adalah **SCIM consumer** (terima provisioning dari IdP lain); juga **SCIM producer** untuk app gallery | Workspace adalah **SCIM consumer** (Google Cloud Identity sebagai SCIM endpoint) untuk inbound provisioning dari Okta/Entra |
| **SDK resmi** | .NET, Java, JavaScript/TypeScript, PHP, Python, Go (`msgraph-sdk-go`), PowerShell | Java, Python, Node.js, Go (`google.golang.org/api/admin/directory/v1`), Ruby, PHP, .NET |
| **Sandbox / test tenant** | Microsoft 365 Developer Program — gratis 25 user sandbox, renew tiap 90 hari | Workspace Free Trial 14 hari (tidak ideal); pakai sub-OU tenant produksi untuk uji |
| **Documentation** | learn.microsoft.com/en-us/graph (sangat lengkap, contoh per bahasa) | developers.google.com/workspace/admin/directory (lengkap, contoh terbatas pada Java/Python) |
| **Propagation delay** | ~30 detik untuk akun aktif di seluruh service M365 | "Propagation delay" — mutate call segera setelah create kadang gagal; retry after delay direkomendasikan |

### 4.2 Ringkasan Perbedaan Strategis

| Kategori | Implikasi untuk Unila |
|---|---|
| **Hierarki organisasi** | Google OU = hierarchy alami untuk `/Mahasiswa/2026/FT/Informatika`. M365 pakai kombinasi Group + AU. Mapping data prodi → kedua model berbeda, perlu **mapping tabel** di sisi kita. |
| **License lifecycle** | M365 license dinamis via API (gratis pool, assignLicense terpisah). Google license terpisah di Licensing API (productId + skuId). Worker M365 dan Google butuh dua langkah berbeda. |
| **Event-driven vs polling** | M365 punya webhook resmi → bisa pull event "user.deleted" dari M365 admin manual ke MyUnila. Google tidak ada native webhook → kita pakai **polling Reports API tiap N menit** untuk audit drift. |
| **Rate limit profile** | M365 lebih longgar untuk directory write. Google ketat pada 15 req/s — perlu queue + exponential backoff untuk burst NPM (PMB Day 1: 3.000+ akun). |
| **Recycle bin** | M365 menahan user yang di-delete 30 hari (`Microsoft.DirectoryServices.DeletedItems`). Google langsung hard-delete. Konsekuensi: rollback alumni di Google = create new user, bukan undelete. |

### 4.3 Pendekatan Auth Disarankan

- **M365:** Daftarkan **App Registration** di Entra ID portal tenant `unila.ac.id`. Gunakan **Client Credentials Flow** dengan certificate-based auth (lebih aman dari client secret). Scope: `User.ReadWrite.All`, `Directory.ReadWrite.All`, `Group.ReadWrite.All`, `Organization.Read.All`. Admin consent di Entra portal.
- **Google:** Buat **Service Account** di Google Cloud Console (project khusus `unila-iam-provisioning`). Generate JSON key. Enable **Domain-Wide Delegation**. Super-admin Unila buka Admin Console → Security → API Controls → Domain-wide delegation → add Client ID dengan scope yang dibutuhkan. Worker impersonate `iam-bot@unila.ac.id` (super-admin teknis).

### 4.4 Library Go Rekomendasi

| Platform | Library | Repo |
|---|---|---|
| Microsoft Graph | `github.com/microsoftgraph/msgraph-sdk-go` | resmi MS |
| Microsoft Auth | `github.com/AzureAD/microsoft-authentication-library-for-go` (MSAL Go) | resmi MS |
| Google Admin SDK | `google.golang.org/api/admin/directory/v1` | resmi Google |
| Google Auth | `golang.org/x/oauth2/google` + `golang.org/x/oauth2/jwt` | resmi Google |

Kedua SDK Go bersifat **stable** (v1+) dan masuk standar `googleapis` / `microsoftgraph` namespace.

---

## 5. Architecture

### 5.1 Komponen

```
┌──────────────────────────────────────────────────────────────────────┐
│                         si-registrasi (eksisting)                     │
│  Status flow: - → P → V → F                                          │
│  NpmGeneratorService  →  SiakadService  →  SsoService                │
│                                  │                                    │
│                                  ▼ (BARU)                             │
│        POST /webhook/identity-event  (HMAC-signed payload)            │
└──────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│                  MyUnila — auth-service (eksisting Laravel)           │
│  Endpoint baru: POST /api/identity/inbound-event                      │
│   - validate HMAC, idempotency key, dedup                             │
│   - insert ke regis_identity_inbox                                    │
│   - publish ke queue identity:provision                               │
└──────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│       MyUnila — identity-service  (BARU, Go + Fiber, port 8092)       │
│                                                                       │
│   ┌────────────────────┐    ┌──────────────────────┐                  │
│   │   Worker M365      │    │   Worker Google      │                  │
│   │  (Microsoft Graph) │    │  (Admin Directory)   │                  │
│   └────────────────────┘    └──────────────────────┘                  │
│             │                            │                            │
│             ▼                            ▼                            │
│       Microsoft Graph              Google Admin SDK                   │
│       graph.microsoft.com          admin.googleapis.com               │
│                                                                       │
│   Scheduler:                                                          │
│   - reconciliation (nightly 02:00) → diff SIAKADU vs M365/Google      │
│   - lifecycle audit (nightly 03:00) → detect alumni/DO/pensiun        │
│                                                                       │
│   Tables:                                                             │
│   - identity.external_identity                                        │
│   - identity.provision_queue                                          │
│   - identity.audit_log                                                │
│   - identity.reconciliation_run                                       │
└──────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│      MyUnila — frontend manajemen-akses (eksisting Next.js)           │
│      /dashboard/manajemen-akses/identity-lifecycle                    │
│                                                                       │
│   - Tab Queue: pending / synced / failed (filter by platform)         │
│   - Tab Audit: log per user (kapan create, oleh siapa, status)        │
│   - Tab Reconciliation: drift report + manual fix action              │
│   - Tab Lifecycle: alumni candidate, pensiun candidate, manual revoke │
│   - Tab Settings: license SKU mapping, OU mapping, default policy     │
└──────────────────────────────────────────────────────────────────────┘
```

### 5.2 Pemilihan Stack

| Komponen | Stack | Alasan |
|---|---|---|
| `identity-service` | Go + Fiber v2 | Konsisten dengan `sister-service`, `feeder-service`, `myunila-service`. Native concurrency cocok untuk worker pool. SDK Microsoft Graph dan Google Admin tersedia di Go. |
| Database | PostgreSQL `identity` (schema baru) | Konsisten dengan `simbak`, `si_prestasi`, `blog_unila`. JSONB untuk payload audit, partial index untuk queue. |
| Queue | Redis Streams atau PostgreSQL row-level lock (`SKIP LOCKED`) | Sudah tersedia di stack. PostgreSQL `SKIP LOCKED` cukup untuk volume Unila (puncak ~3 k event/hari saat PMB). |
| Scheduler | Laravel scheduler di auth-service (sudah ada) yang POST trigger ke identity-service | Reuse pattern existing |
| Auth ke M365 | MSAL Go + certificate (X.509 di vault) | Best practice MS — certificate > client secret |
| Auth ke Google | Service Account JSON key + Domain-Wide Delegation | Standar Google untuk server-to-server |
| Secret storage | File-based encrypted secret + filesystem ACL di VM (atau HashiCorp Vault jika prioritas naik) | Sederhana, terkontrol, audit-friendly |

### 5.3 Deployment

- **Service baru:** `identity-service` di `backend/identity-service/` (Go + Fiber).
- **Port:** 8092 (sequential setelah 8091 blog-service).
- **Kong route:** `/identity-service` (atau di-mount internal-only — pertimbangan keamanan; akses hanya dari auth-service dan frontend admin).
- **VM:** awal di **VM5 staging** untuk testing, lalu pindah ke **VM produksi yang dialokasikan** (TBD — pertanyaan terbuka).
- **Container:** Docker, ikuti pattern existing.

### 5.4 Decision Log

| # | Keputusan | Pilihan | Alasan |
|---|---|---|---|
| 1 | Trigger event | **Webhook HMAC dari si-registrasi → auth-service** | Decoupled, mudah retry dari kedua sisi, tidak perlu shared DB. |
| 2 | Posisi auto-provision | **Manual approve per batch (default), opsi auto-provision flagged** | Aman untuk pilot phase; bisa di-toggle saat stable. |
| 3 | Microsoft auth | **Client Credentials + Certificate** | Lebih aman dari client secret; rotation mudah via cert lifecycle. |
| 4 | Google auth | **Service Account + Domain-Wide Delegation** | Standar Google untuk server-to-server provisioning. |
| 5 | Service language | **Go + Fiber** | Konsisten dengan service Go lain di MyUnila. |
| 6 | DB | **PostgreSQL schema `identity` di DB MyUnila eksisting** | Tidak perlu DB baru; share koneksi pool. |
| 7 | Queue | **PostgreSQL `FOR UPDATE SKIP LOCKED`** | Volume Unila tidak butuh Redis Streams; satu less moving part. |
| 8 | Reconciliation cadence | **Nightly 02:00 + on-demand** | Cukup untuk drift detection; tidak overload API. |
| 9 | Email format | **`{NPM}@students.unila.ac.id`** (sama dengan SSO Unila sekarang) | Konsisten lintas sistem; perlu konfirmasi stakeholder apakah ada keinginan ubah format. |
| 10 | License SKU mapping | **Tabel `identity.sku_mapping`** (prodi → jenjang → SKU M365 + SKU Google) | Konfigurasi business, bukan code — admin bisa update via UI tanpa deploy. |
| 11 | OU mapping Google | **Tabel `identity.ou_mapping`** (prodi → path OU) | Sda. |
| 12 | Frontend lokasi | **`frontend/src/app/dashboard/manajemen-akses/identity-lifecycle/`** | Sub-modul dari `manajemen-akses` yang sudah ada. |

---

## 6. Detailed Flows

### Flow 1 — Onboarding Mahasiswa Baru (Replace, berdasarkan si-registrasi real)

**Tujuan:** Otomatis provision email M365 + Google saat mahasiswa baru selesai registrasi.

**Trigger:** NPM generated di SI-Registrasi (status → F + `a_sudah_sync_sso=1`).

**Sequence:**

```
Calon Mahasiswa     SI-Registrasi      MyUnila auth         identity-service    Microsoft Graph   Google Admin
     │                  │                  │                      │                  │                │
     │  daftar → P      │                  │                      │                  │                │
     │─────────────────>│                  │                      │                  │                │
     │                  │ admin verify→V   │                      │                  │                │
     │                  │ admin final →F   │                      │                  │                │
     │                  │ NPM generated    │                      │                  │                │
     │                  │ SIAKAD sync OK   │                      │                  │                │
     │                  │ SSO Unila sync OK│                      │                  │                │
     │                  │  POST /webhook   │                      │                  │                │
     │                  │  (HMAC signed)   │                      │                  │                │
     │                  │─────────────────>│                      │                  │                │
     │                  │                  │ insert inbox + enqueue                  │                │
     │                  │                  │─────────────────────>│                  │                │
     │                  │                  │                      │ Worker M365      │                │
     │                  │                  │                      │  POST /users     │                │
     │                  │                  │                      │─────────────────>│                │
     │                  │                  │                      │  201 + id        │                │
     │                  │                  │                      │  assignLicense   │                │
     │                  │                  │                      │─────────────────>│                │
     │                  │                  │                      │  Worker Google   │                │
     │                  │                  │                      │  POST /users     │                │
     │                  │                  │                      │───────────────────────────────────>│
     │                  │                  │                      │  200 + id        │                │
     │                  │                  │                      │  add to OU       │                │
     │                  │                  │                      │───────────────────────────────────>│
     │                  │                  │                      │ insert external_identity            │
     │                  │                  │                      │ status=synced                       │
     │  email aktif <5 menit setelah NPM ────────────────────────────────────────────────────────────────│
```

**Data yang dikirim** (webhook ke auth-service):

```json
{
  "event": "student.onboarded",
  "idempotency_key": "registrasi-{id_reg_pd}-onboard-v1",
  "source": "si-registrasi",
  "occurred_at": "2026-08-15T10:23:45+07:00",
  "data": {
    "npm": "2617051073",
    "nama_lengkap": "...",
    "jenis_kelamin": "L",
    "tgl_lahir": "2007-05-12",
    "prodi_kode_npm": "17051",
    "prodi_nama": "S1 Teknik Informatika",
    "fakultas_nama": "Fakultas Teknik",
    "jenjang": "S1",
    "tahun_masuk": 2026,
    "email_kampus": "{npm}@students.unila.ac.id"
  }
}
```

**Mapping data ke API call:**

| Field MyUnila | Microsoft Graph | Google Admin |
|---|---|---|
| `npm` | `mailNickname`, `userPrincipalName` prefix | `primaryEmail` prefix |
| `nama_lengkap` (split) | `displayName`, `givenName`, `surname` | `name.fullName`, `name.givenName`, `name.familyName` |
| `prodi_nama` | `department` | `organizations[0].department` |
| `fakultas_nama` | `companyName` | `organizations[0].name` |
| `jenjang` + `prodi_kode_npm` | lookup `sku_mapping` → `assignLicense.skuId` | lookup `ou_mapping` → `orgUnitPath` + license terpisah |
| `tgl_lahir` + `npm` | `passwordProfile.password` (forceChange=true) | `password` (changePasswordAtNextLogin=true) |

**Penanganan error:**

- Worker idempotent: cek `external_identity` dulu — kalau sudah ada `external_id`, skip create, hanya update.
- Retry: exponential backoff (1 s, 2 s, 4 s, 8 s, 16 s, 32 s, max 3 menit).
- Gagal final → status `failed`, masuk dead-letter queue, muncul di UI dengan tombol Retry.

### Flow 2 — Konversi Alumni

**Tujuan:** Convert email mahasiswa yang lulus (`@students.unila.ac.id`) ke akun alumni dengan kebijakan lisensi berbeda.

**Trigger:** Field `status_mahasiswa = 'L' (Lulus)` di SIAKADU + `tgl_lulus` terisi → terdeteksi oleh nightly reconciliation job.

**Aksi:**

1. Di M365: **downgrade** license dari `STANDARDWOFFPACK_STUDENT` ke `STANDARDWOFFPACK_ALUMNI` (atau revoke jika tidak ada policy alumni).
2. Di Google: **pindahkan OU** dari `/Mahasiswa/{angkatan}/{fak}/{prodi}` ke `/Alumni/{tahun_lulus}/{fak}`.
3. Tambah suffix `(Alumni)` di `displayName`.
4. Optional: forward inbox ke alamat alternatif jika alumni mendaftarkan.
5. Log ke `identity.audit_log` event `alumni.converted`.

**Catatan:** Email tetap `{npm}@students.unila.ac.id` (tidak rename) untuk konsistensi historis dan citation paper alumni.

### Flow 3 — Offboarding (Pensiun / DO / Mengundurkan Diri)

**Tujuan:** Suspend / hapus akun yang sudah tidak aktif.

**Trigger detection (nightly reconciliation):**

- Pensiun (pegawai): `tgl_pensiun < CURRENT_DATE` di SIMPEG.
- DO (mahasiswa): `status_mahasiswa IN ('D', 'K')` di SIAKADU (D=Drop out, K=Keluar).
- Mengundurkan diri: status manual di SIMBAK `UNDUR_DIRI` terbit + `tgl_efektif < CURRENT_DATE`.

**Aksi staged (default tidak langsung delete):**

| T+ | Aksi M365 | Aksi Google |
|---|---|---|
| Hari 0 (status berubah) | `accountEnabled: false` (block sign-in) | `suspended: true` |
| Hari 0 | Remove dari group "All Students" / "All Staff" | Remove dari group |
| Hari 30 | Revoke semua license (free up SKU) | Revoke license |
| Hari 90 | Notifikasi ke admin untuk delete final (manual approve di UI) | Sda |
| Hari 180 | Delete user (M365 ke recycle bin, Google hard delete) — **manual approve required** | Sda |

**Catatan:** Hari 0–90 admin masih bisa **reaktivasi 1-klik** di UI manajemen-akses tanpa create akun baru.

### Flow 4 — Nightly Reconciliation

**Tujuan:** Deteksi drift antara SIAKADU/SIMPEG (source of truth) dan kondisi M365 + Google.

**Cadence:** 02:00 WIB tiap hari (configurable).

**Langkah:**

1. **Snapshot SIAKADU + SIMPEG** — list semua user aktif dengan NPM/NIP + nama + prodi/unit + status.
2. **Snapshot M365** — `GET /users?$select=id,mail,displayName,accountEnabled,assignedLicenses` (paginate).
3. **Snapshot Google** — `GET /users?customer=my_customer&projection=full` (paginate).
4. **Diff per kategori:**
   - Ada di SIAKADU, tidak ada di M365/Google → **create candidate**.
   - Ada di M365/Google, tidak ada di SIAKADU → **orphan candidate** (perlu investigate).
   - Ada di kedua, tapi field beda (nama, prodi, OU, license) → **drift candidate**.
5. **Tulis ke `identity.reconciliation_run`** + per-record di `identity.reconciliation_diff`.
6. **Tampilkan di UI** — admin review, bulk-approve fix.

**Catatan keamanan:** orphan tidak di-delete otomatis (bisa jadi pegawai kontrak yang belum ada di SIMPEG). Tetap manual approve.

### Flow 5 — Manual Trigger via UI `manajemen-akses`

**Tujuan:** Admin bisa override otomasi untuk kasus khusus.

**Aksi yang tersedia di UI:**

- **Provision single user** — admin pilih user dari list SIAKADU, klik "Provision sekarang".
- **Bulk provision** — upload CSV NPM/NIP atau filter (prodi, angkatan, status), preview dry-run, klik approve.
- **Reset password** — generate password baru, push ke M365 + Google (force change next login), kirim ke email pribadi user via SI-Registrasi data.
- **Force sync (re-update profile)** — kalau ada perubahan prodi/nama di SIAKADU, force PATCH ke M365 + Google.
- **Revoke license** — manual untuk kasus sanksi akademik / suspect compromise.
- **Suspend / unsuspend** — bypass nightly schedule.
- **Delete (with confirmation)** — manual force delete (hanya admin level 2).

Setiap aksi tercatat di `identity.audit_log` dengan `actor_id` (NIP admin yang trigger).

### Flow 6 — Re-activation

**Tujuan:** Aktifkan ulang akun yang sudah di-suspend / akan didelete (kasus: mahasiswa cuti kembali aktif, pegawai kontrak diperpanjang).

**Trigger:**

- Auto: jika status SIAKADU berubah dari `'C'` (cuti) atau `'B'` (berhenti sementara) → `'A'` (aktif).
- Manual: admin klik "Reaktivasi" di UI.

**Aksi:**

1. Cek `external_identity` — masih ada `external_id`?
2. M365: `PATCH /users/{id}` set `accountEnabled: true`. Reassign license dari pool.
3. Google: `PATCH /users/{userKey}` set `suspended: false`. Pindah balik OU ke `/Mahasiswa/...` atau `/Pegawai/...`.
4. Tambah kembali ke group "All Students" / "All Staff".
5. Kirim notifikasi ke email pribadi user.
6. Log event `account.reactivated` di audit_log.

**Window batas:** kalau akun sudah dihapus (T+180 di Flow 3) dan recycle bin M365 expired (30 hari setelah delete), maka reaktivasi = create new (kembali ke Flow 1).

---

## 7. Database Schema

### 7.1 Schema `identity` (PostgreSQL)

```sql
CREATE SCHEMA IF NOT EXISTS identity;

-- Mapping data internal ke akun di platform eksternal
CREATE TABLE identity.external_identity (
    id_external_identity      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nik_internal              VARCHAR(32) NOT NULL,   -- NPM untuk mhs, NIP untuk pegawai
    tipe_subject              VARCHAR(16) NOT NULL CHECK (tipe_subject IN ('mahasiswa','pegawai','alumni')),
    platform                  VARCHAR(16) NOT NULL CHECK (platform IN ('m365','google')),
    external_id               VARCHAR(256) NOT NULL,  -- GUID Entra ID atau numeric ID Google
    primary_email             VARCHAR(256) NOT NULL,
    display_name              VARCHAR(256),
    status                    VARCHAR(16) NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active','suspended','deleted','pending_delete')),
    last_synced_at            TIMESTAMPTZ,
    last_known_payload        JSONB,                  -- snapshot terakhir dari platform
    tgl_create                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_update               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    soft_delete               BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (platform, external_id)
);

CREATE INDEX idx_external_identity_nik
    ON identity.external_identity(nik_internal) WHERE soft_delete = FALSE;
CREATE INDEX idx_external_identity_status
    ON identity.external_identity(status, platform) WHERE soft_delete = FALSE;

-- Queue request provisioning yang dieksekusi worker
CREATE TABLE identity.provision_queue (
    id_provision              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key           VARCHAR(128) NOT NULL UNIQUE,
    nik_internal              VARCHAR(32) NOT NULL,
    tipe_subject              VARCHAR(16) NOT NULL,
    operation                 VARCHAR(32) NOT NULL,   -- create, update, suspend, reactivate, delete, license_change
    platform                  VARCHAR(16) NOT NULL,   -- m365 / google / both
    payload                   JSONB NOT NULL,
    status                    VARCHAR(16) NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending','in_progress','synced','failed','dead_letter')),
    attempt_count             INTEGER NOT NULL DEFAULT 0,
    last_error                TEXT,
    next_retry_at             TIMESTAMPTZ,
    requested_by              VARCHAR(64),            -- system / NIP admin
    requested_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at              TIMESTAMPTZ,
    soft_delete               BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_provision_queue_pickup
    ON identity.provision_queue(status, next_retry_at)
    WHERE status IN ('pending','failed') AND soft_delete = FALSE;

-- Audit log lengkap, retention >= 5 tahun
CREATE TABLE identity.audit_log (
    id_audit                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type                VARCHAR(64) NOT NULL,   -- account.created, license.assigned, suspended, dll
    platform                  VARCHAR(16),            -- m365 / google / system
    nik_internal              VARCHAR(32),
    external_id               VARCHAR(256),
    actor                     VARCHAR(64),            -- 'system' atau NIP admin
    operation                 VARCHAR(32),
    request_payload           JSONB,
    response_payload          JSONB,
    http_status               INTEGER,
    success                   BOOLEAN NOT NULL,
    error_message             TEXT,
    duration_ms               INTEGER,
    occurred_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_nik ON identity.audit_log(nik_internal, occurred_at DESC);
CREATE INDEX idx_audit_log_event ON identity.audit_log(event_type, occurred_at DESC);

-- Mapping konfigurasi: prodi/jenjang → SKU M365 dan license Google
CREATE TABLE identity.sku_mapping (
    id_sku_mapping            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipe_subject              VARCHAR(16) NOT NULL,   -- mahasiswa, pegawai, alumni
    jenjang                   VARCHAR(8),             -- D3, S1, S2, S3, PROFESI; NULL = wildcard
    prodi_kode_npm            VARCHAR(8),             -- NULL = wildcard
    platform                  VARCHAR(16) NOT NULL,
    sku_id                    VARCHAR(128) NOT NULL,  -- M365 SKU GUID atau Google productId/skuId
    sku_label                 VARCHAR(256),
    a_aktif                   BOOLEAN NOT NULL DEFAULT TRUE,
    tgl_create                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_update               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    soft_delete               BOOLEAN NOT NULL DEFAULT FALSE
);

-- Mapping konfigurasi: prodi → OU path di Google Workspace
CREATE TABLE identity.ou_mapping (
    id_ou_mapping             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipe_subject              VARCHAR(16) NOT NULL,
    angkatan                  INTEGER,                -- NULL = wildcard
    fakultas_kode             VARCHAR(8),
    prodi_kode_npm            VARCHAR(8),
    org_unit_path             VARCHAR(512) NOT NULL,  -- /Mahasiswa/2026/FT/Informatika
    a_aktif                   BOOLEAN NOT NULL DEFAULT TRUE,
    tgl_create                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_update               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    soft_delete               BOOLEAN NOT NULL DEFAULT FALSE
);

-- Hasil eksekusi reconciliation
CREATE TABLE identity.reconciliation_run (
    id_run                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at               TIMESTAMPTZ,
    triggered_by              VARCHAR(64) NOT NULL,   -- scheduler / NIP admin
    total_siakad              INTEGER,
    total_m365                INTEGER,
    total_google              INTEGER,
    drift_create_count        INTEGER,
    drift_update_count        INTEGER,
    drift_orphan_count        INTEGER,
    status                    VARCHAR(16) NOT NULL DEFAULT 'running',
    notes                     TEXT
);

CREATE TABLE identity.reconciliation_diff (
    id_diff                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_run                    UUID NOT NULL REFERENCES identity.reconciliation_run(id_run),
    platform                  VARCHAR(16) NOT NULL,
    nik_internal              VARCHAR(32),
    external_id               VARCHAR(256),
    diff_type                 VARCHAR(16) NOT NULL,   -- create_needed, update_needed, orphan
    diff_payload              JSONB NOT NULL,         -- {expected: {...}, actual: {...}}
    resolution                VARCHAR(16) DEFAULT 'open',  -- open, resolved, ignored
    resolved_by               VARCHAR(64),
    resolved_at               TIMESTAMPTZ,
    tgl_create                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recon_diff_run ON identity.reconciliation_diff(id_run, diff_type);

-- Inbox untuk webhook dari si-registrasi (idempotency + replay protection)
CREATE TABLE identity.inbound_event (
    id_event                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key           VARCHAR(128) NOT NULL UNIQUE,
    source                    VARCHAR(64) NOT NULL,
    event_type                VARCHAR(64) NOT NULL,
    payload                   JSONB NOT NULL,
    signature                 VARCHAR(256),
    received_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at              TIMESTAMPTZ,
    processing_result         VARCHAR(16),            -- enqueued, duplicate, invalid
    error_message             TEXT
);
```

### 7.2 Catatan Konvensi

- Mengikuti pattern existing `simbak`, `si_prestasi`, `blog_unila`: UUID PK `gen_random_uuid()`, `id_<table>`, `tgl_create`, `last_update`, `soft_delete`, schema terpisah.
- JSONB digunakan untuk payload yang variatif (audit, last_known_payload, diff_payload).
- Partial index pada `WHERE soft_delete = FALSE` untuk performa.

### 7.3 Retensi Data

| Tabel | Retention | Cleanup Strategy |
|---|---|---|
| `external_identity` | Selama akun aktif + 7 tahun setelah delete | Soft delete, archive offline >7 tahun |
| `provision_queue` | 1 tahun (status synced/dead_letter) | Archive ke `provision_queue_archive` >90 hari |
| `audit_log` | **≥ 5 tahun** (compliance requirement) | Partition by year, archive >5 tahun ke cold storage |
| `reconciliation_run` + `diff` | 2 tahun | Auto-delete >2 tahun |
| `inbound_event` | 90 hari (replay protection cukup) | Auto-delete >90 hari |
| `sku_mapping`, `ou_mapping` | Selamanya (konfigurasi) | Soft delete only |

---

## 8. Security & Compliance

### 8.1 Secret Management

| Asset | Storage | Akses | Rotation |
|---|---|---|---|
| Certificate M365 (X.509 private key + thumbprint) | File terenkripsi di VM identity-service (ACL `0400`, owner = service user) | Hanya proses identity-service | Tahunan, sebelum exp |
| Service Account JSON key Google | Sda | Sda | 6 bulanan |
| HMAC secret webhook si-registrasi → MyUnila | Variable env masing-masing service | Sda | Tahunan |
| DB password identity-service | env file di VM | Sda | Sesuai kebijakan DB admin |
| OAuth refresh token (jika dipakai delegated flow) | Tidak digunakan — app-only flow | — | — |

**Roadmap:** evaluate HashiCorp Vault atau Doppler jika jumlah secret bertambah signifikan (>10).

### 8.2 Network & Akses

- `identity-service` listen di internal network only; tidak ter-expose ke public Kong route.
- Akses hanya dari: auth-service (untuk enqueue), frontend admin via auth-service proxy (untuk UI), scheduler (untuk trigger reconciliation).
- Egress ke `graph.microsoft.com`, `login.microsoftonline.com`, `admin.googleapis.com`, `oauth2.googleapis.com` — whitelist outbound di firewall VM.

### 8.3 Authentication Frontend Admin

- Frontend `manajemen-akses` reuse SSO MyUnila (JWT existing).
- RBAC level (di tabel `man_akses.role_permission` existing):
  - **identity:viewer** — lihat queue, audit, reconciliation report.
  - **identity:operator** — approve/retry/manual sync.
  - **identity:admin** — manage SKU mapping, OU mapping, force delete.
- Two-person rule untuk `force_delete` (admin level 2 + admin approval).

### 8.4 Data Privacy

- **Tidak menyimpan password plaintext** — password generation hanya untuk write-once ke API, tidak ditulis ke DB.
- Audit log payload **scrub field sensitif** sebelum disimpan: `password`, `passwordProfile.password`, `value` (yang dipakai SSO Unila).
- Email pribadi user (untuk notifikasi) di-encrypt at rest jika dimasukkan ke `external_identity.last_known_payload`.
- PII mahasiswa (NIK, tgl lahir, alamat) **tidak di-mirror** ke `identity` schema — query on-demand ke SIAKADU saat butuh.

### 8.5 Compliance

| Aturan | Kepatuhan |
|---|---|
| UU PDP No. 27/2022 (Indonesia) | Data subject = mahasiswa/pegawai Unila; basis hukum: kontrak akademik / kepegawaian (Pasal 20). Audit log mendukung hak akses & koreksi. |
| Kemendikbud Permendikbud terkait PDDIKTI | Tidak mengubah pelaporan PDDIKTI; data tetap sumber SIAKADU. |
| Microsoft Customer Trust Center | Pembatasan scope OAuth, certificate-based auth, audit log. |
| Google Workspace Trust & Security | Service Account least privilege, Domain-Wide Delegation scope minimum. |
| ISO 27001 (jika Unila pursue) | Audit trail, separation of duty (two-person rule), retention policy ≥ 5 tahun. |

### 8.6 Insiden & Disaster Recovery

- Kalau certificate / SA key terkompromi: revoke di portal Microsoft/Google, generate baru, deploy ke service, force re-sync.
- Kalau identity-service down: webhook si-registrasi auto-retry (Laravel queue retry policy). Queue di DB tidak hilang. Frontend tetap bisa baca audit log lama.
- Backup DB harian (sudah eksisting via Postgres dump policy MyUnila).
- DR plan: identity-service stateless (state ada di DB) — restore = redeploy + DB restore.

---

## 9. Implementation Roadmap

### 9.1 Fase

| Fase | Durasi | Output | Dependencies |
|---|---|---|---|
| **Fase 0 — Foundation & Spike** | 1 minggu | Sandbox M365 Developer + Workspace test OU; service account + app registration; spike auth flow Go → POST /users 1 user di sandbox | — |
| **Fase 1 — Backend Core** | 3 minggu | identity-service scaffolded; schema `identity` deployed; worker M365 (create, update, suspend, license); worker Google (sda + OU); webhook inbox handler | Fase 0 |
| **Fase 2 — si-registrasi Webhook Hook** | 1 minggu | Tambah hook di si-registrasi pasca SSO sync → POST ke MyUnila; HMAC signing; idempotency; test end-to-end di sandbox | Fase 1 |
| **Fase 3 — Frontend manajemen-akses** | 2 minggu | UI: tab Queue, Audit, Reconciliation, Manual Trigger, Lifecycle, Settings; integrasi API identity-service | Fase 1 |
| **Fase 4 — Reconciliation & Lifecycle Jobs** | 2 minggu | Nightly reconciliation; lifecycle audit (alumni, pensiun, DO); staged offboarding schedule; reactivation flow | Fase 1, mapping data SIMPEG |
| **Fase 5 — Pilot & Production Rollout** | 2 minggu | Pilot ke 1 prodi (50 user); monitor 1 minggu; rollout penuh untuk angkatan PMB 2026/2027 | Fase 1–4 selesai, stakeholder sign-off |
| **Fase 6 (post-MVP)** — Self-service & polish | TBD | Self-service password reset; email forward request; user dashboard "akunku" | Fase 5 stable |

**Total durasi inti:** ~11 minggu (Fase 0–5).
**Buffer:** +2–3 minggu untuk security review, dokumentasi, training admin.
**Total realistis:** 13–14 minggu.

### 9.2 Critical Path

```
Fase 0 (1) → Fase 1 (3) → Fase 2 (1) → Fase 5 (2) = 7 minggu critical
                       └→ Fase 3 (2) → Fase 5
                       └→ Fase 4 (2) → Fase 5
```

Fase 2, 3, 4 dapat dikerjakan paralel (oleh tim 2 orang) sehingga total wall-time 7 + 2 buffer = ~9–10 minggu wall-time.

### 9.3 Milestone & Gate

| Milestone | Definition of Done | Sign-off |
|---|---|---|
| M1 | 1 user dibuat end-to-end di sandbox M365 + Google via API | Tech lead |
| M2 | si-registrasi → MyUnila webhook resolve 100 event tanpa error di staging | Tech lead + admin TIK |
| M3 | UI manajemen-akses lengkap, demo ke admin TIK | Admin TIK approval |
| M4 | Reconciliation drift report akurat (validate manual untuk 1 prodi) | Admin TIK |
| M5 | Pilot 50 user (1 prodi) sukses, monitoring 1 minggu zero issue | Kepala UPA TIK |
| M6 | Production rollout angkatan PMB 2026/2027 | Rektor / WR Akademik (jika diperlukan) |

### 9.4 Team & Allocation

- **1 Backend Engineer (Go)** — full-time selama 11 minggu.
- **1 Frontend Engineer (Next.js)** — full-time 2 minggu di Fase 3, support 1 minggu Fase 5.
- **1 DBA / Senior Backend (Laravel)** — part-time 1 minggu untuk webhook hook di si-registrasi.
- **1 Admin TIK** — part-time review UX, prepare M365 + Google production credential, sign-off pilot.

---

## 10. Cost Analysis

### 10.1 Biaya Lisensi (Rp 0)

| Item | Status | Catatan |
|---|---|---|
| Microsoft Graph API call | **Gratis** | Termasuk dalam M365 A1 for Faculty / A1 for Students yang sudah dimiliki Unila |
| Google Admin Directory API call | **Gratis** | Termasuk Workspace for Education Fundamentals (gratis penuh untuk institusi pendidikan terakreditasi) |
| Microsoft 365 Developer Sandbox | **Gratis** | 25 user, renewable tiap 90 hari, untuk Fase 0 dan testing CI |
| HashiCorp Vault (optional) | OSS gratis | Hanya jika roadmap secret bertambah signifikan |
| PostgreSQL, Redis | Sudah eksisting | — |

### 10.2 Infrastruktur Tambahan

| Item | Spesifikasi | Estimasi |
|---|---|---|
| `identity-service` container | 1 vCPU, 512 MB RAM, 5 GB disk | Bisa di-host di VM5/VM3 eksisting |
| Storage DB tambahan | ~10 GB/tahun (audit_log dominant) | Marginal — DB MyUnila eksisting masih cukup |
| Bandwidth keluar (API call) | ~5 GB/bulan saat PMB peak | Diabaikan |

**Tidak perlu VM baru** untuk MVP. Bisa dipertimbangkan terpisah jika observability butuh isolasi.

### 10.3 Engineering Effort

| Resource | Hari kerja | Catatan |
|---|---|---|
| Backend Go (Fase 0–5) | ~55 hari | 1 engineer × 11 minggu |
| Frontend (Fase 3 + 5 support) | ~15 hari | 1 engineer × 3 minggu efektif |
| Laravel hook (Fase 2) | ~5 hari | 1 engineer × 1 minggu |
| Admin TIK review + UAT | ~10 hari | Part-time sepanjang proyek |
| **Total** | **~85 hari kerja** | — |

Mengasumsikan tim internal — **tidak ada biaya vendor eksternal** untuk skenario base case.

### 10.4 Penghematan Operasional

- Beban admin saat PMB: dari 42–63 jam/bulan → **<4 jam/bulan** (penghematan ~50 jam/bulan).
- Tahunan ekuivalen (PMB intensif 3 bulan): **~150 jam/tahun**.
- Latency akun aktif: dari 1–7 hari → <5 menit → **DX mahasiswa baru meningkat signifikan**.
- License utilization meningkat (offboarding tepat waktu → SKU kembali ke pool).

### 10.5 Total Cost of Ownership (TCO) 3 Tahun

| Komponen | Tahun 1 | Tahun 2 | Tahun 3 |
|---|---|---|---|
| Lisensi API & cloud | Rp 0 | Rp 0 | Rp 0 |
| Infrastruktur tambahan | Rp 0 (reuse) | Rp 0 | Rp 0 |
| Engineering build | ~85 hari kerja | — | — |
| Maintenance & operasional | ~10 hari/bulan part-time | ~5 hari/bulan | ~5 hari/bulan |
| **Total cash outflow** | **Rp 0** | **Rp 0** | **Rp 0** |

(Engineering effort = beban internal yang sudah ada di payroll TIK, tidak masuk cash outflow.)

---

## 11. Risk Register

| ID | Risiko | Likelihood | Impact | Mitigasi |
|---|---|---|---|---|
| R1 | Quota Google 150 k/hari terlampaui saat PMB peak (3 k user × beberapa API call) | Medium | Medium | Batch dengan delay; spread provisioning sepanjang hari; request quota increase ke Google (gratis, biasanya disetujui) |
| R2 | Microsoft Graph throttling 429 saat bulk create | Medium | Low | Implement Retry-After header handling; worker pool concurrency cap; exponential backoff |
| R3 | Race condition: si-registrasi kirim event sebelum NPM commit final | Low | High | Idempotency key + DB transaction commit-after-event; ACK from MyUnila baru lanjut hook |
| R4 | Service account Google key bocor | Low | Critical | File ACL strict; rotation 6 bulan; alert pada usage anomali; revoke kebijakan jelas |
| R5 | Certificate M365 expired tidak ter-renew | Low | High | Monitoring expiry (alert 30 hari sebelum); calendar renewal 1×/tahun; auto-rotation roadmap |
| R6 | Mapping prodi → OU / SKU salah (semua user dapat license A3 padahal harusnya A1) | Medium | Medium | Default ke license terendah; tabel mapping dengan review approval; dry-run di UI sebelum apply |
| R7 | Reconciliation false-positive (mahasiswa transfer baru detected sebagai orphan) | Medium | Low | Tidak auto-delete dari reconciliation; semua keputusan butuh manual approve |
| R8 | Webhook si-registrasi → MyUnila gagal saat MyUnila down | Medium | Low | Retry policy di Laravel queue; idempotency aman; admin bisa replay via UI |
| R9 | Audit log explosion (>10 GB/tahun) | Low | Low | Partitioning per tahun; archive ke cold storage; retention >5 tahun di S3-compatible MinIO |
| R10 | API breaking change dari Microsoft / Google | Low | Medium | Subscribe ke deprecation notice; pin SDK version; quarterly health check |
| R11 | Adopsi admin TIK rendah (lebih percaya manual upload) | Medium | Medium | Training; UI design intuitif; pilot phase pakai dual-track (manual + otomatis), bandingkan hasil |
| R12 | Email forwarding setting hilang setelah reactivation | Low | Low | Snapshot mailbox-settings sebelum suspend (M365 Outlook API tambahan, defer phase 2) |
| R13 | Konflik dengan kebijakan kampus lain (misal: jurusan ingin pakai format email custom) | Medium | Low | Decision lock-in di tabel `sku_mapping`/`ou_mapping`; eskalasi ke pimpinan UPA TIK untuk format universal |
| R14 | Phishing menggunakan akun mahasiswa yang baru tidak terpakai | Medium | High | Default `forceChangePasswordNextSignIn=true`; MFA enforcement di tenant level; revoke jika idle >180 hari |

---

## 12. Appendix: API Examples

### 12.1 Microsoft Graph — Create User

**Request:**

```http
POST https://graph.microsoft.com/v1.0/users
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "accountEnabled": true,
  "displayName": "Nama Mahasiswa Contoh",
  "givenName": "Nama",
  "surname": "Mahasiswa",
  "mailNickname": "2617051073",
  "userPrincipalName": "2617051073@students.unila.ac.id",
  "department": "Teknik Informatika",
  "companyName": "Universitas Lampung",
  "jobTitle": "Mahasiswa S1",
  "usageLocation": "ID",
  "passwordProfile": {
    "forceChangePasswordNextSignIn": true,
    "password": "InitialPwd!2026"
  }
}
```

**Response:**

```http
HTTP/1.1 201 Created
Content-type: application/json

{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users/$entity",
  "id": "87d349ed-44d7-43e1-9a83-5f2406dee5bd",
  "displayName": "Nama Mahasiswa Contoh",
  "userPrincipalName": "2617051073@students.unila.ac.id",
  "mail": "2617051073@students.unila.ac.id",
  "businessPhones": [],
  "preferredLanguage": null
}
```

### 12.2 Microsoft Graph — Assign License

```http
POST https://graph.microsoft.com/v1.0/users/87d349ed-44d7-43e1-9a83-5f2406dee5bd/assignLicense
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "addLicenses": [
    {
      "disabledPlans": [],
      "skuId": "94763226-9b3c-4e75-a931-5c89701abe66"
    }
  ],
  "removeLicenses": []
}
```

`skuId` di atas = M365 A1 for Students contoh. SKU GUID dapat di-list via `GET /subscribedSkus`.

### 12.3 Microsoft Graph — Suspend User (Disable Sign-in)

```http
PATCH https://graph.microsoft.com/v1.0/users/87d349ed-44d7-43e1-9a83-5f2406dee5bd
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "accountEnabled": false
}
```

### 12.4 Microsoft Graph — OAuth Token (Client Credentials + Certificate)

```http
POST https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token
Content-Type: application/x-www-form-urlencoded

client_id={app_id}
&scope=https%3A%2F%2Fgraph.microsoft.com%2F.default
&client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer
&client_assertion={signed_jwt_with_cert}
&grant_type=client_credentials
```

### 12.5 Google Admin — Create User

```http
POST https://admin.googleapis.com/admin/directory/v1/users
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "primaryEmail": "2617051073@students.unila.ac.id",
  "name": {
    "givenName": "Nama",
    "familyName": "Mahasiswa"
  },
  "password": "InitialPwd!2026",
  "changePasswordAtNextLogin": true,
  "orgUnitPath": "/Mahasiswa/2026/FT/Informatika",
  "organizations": [
    {
      "name": "Universitas Lampung",
      "department": "Teknik Informatika",
      "title": "Mahasiswa S1",
      "primary": true,
      "type": "school"
    }
  ],
  "recoveryEmail": "calon-recovery@gmail.com"
}
```

**Response:**

```http
HTTP/1.1 200 OK
Content-type: application/json

{
  "kind": "admin#directory#user",
  "id": "104891234567890123456",
  "primaryEmail": "2617051073@students.unila.ac.id",
  "name": {
    "givenName": "Nama",
    "familyName": "Mahasiswa",
    "fullName": "Nama Mahasiswa"
  },
  "isAdmin": false,
  "creationTime": "2026-08-15T03:23:50.000Z",
  "orgUnitPath": "/Mahasiswa/2026/FT/Informatika"
}
```

### 12.6 Google Admin — Suspend User

```http
PATCH https://admin.googleapis.com/admin/directory/v1/users/2617051073@students.unila.ac.id
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "suspended": true,
  "suspensionReason": "ALUMNI_PENDING_REVIEW"
}
```

### 12.7 Google Licensing — Assign License

```http
POST https://licensing.googleapis.com/apps/licensing/v1/product/Google-Apps/sku/1010020027/user
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "userId": "2617051073@students.unila.ac.id"
}
```

(`1010020027` = Google Workspace for Education Fundamentals contoh skuId.)

### 12.8 Google Admin — OAuth via Service Account (JWT Bearer)

JWT payload:

```json
{
  "iss": "iam-bot-sa@unila-iam-prov.iam.gserviceaccount.com",
  "sub": "iam-admin@unila.ac.id",
  "scope": "https://www.googleapis.com/auth/admin.directory.user https://www.googleapis.com/auth/admin.directory.group",
  "aud": "https://oauth2.googleapis.com/token",
  "iat": 1715587200,
  "exp": 1715590800
}
```

Token exchange:

```http
POST https://oauth2.googleapis.com/token
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer
&assertion={signed_jwt}
```

### 12.9 Webhook si-registrasi → MyUnila (Payload Contoh)

```http
POST https://myunila.unila.ac.id/auth-service/api/identity/inbound-event
X-Signature: sha256={hmac_signature}
X-Idempotency-Key: registrasi-{id_reg_pd}-onboard-v1
Content-Type: application/json

{
  "event": "student.onboarded",
  "source": "si-registrasi",
  "occurred_at": "2026-08-15T10:23:45+07:00",
  "data": {
    "id_reg_pd": "....-uuid-....",
    "npm": "2617051073",
    "nama_lengkap": "Nama Mahasiswa Contoh",
    "jenis_kelamin": "L",
    "tgl_lahir": "2007-05-12",
    "prodi_kode_npm": "17051",
    "prodi_nama": "S1 Teknik Informatika",
    "fakultas_kode": "FT",
    "fakultas_nama": "Fakultas Teknik",
    "jenjang": "S1",
    "tahun_masuk": 2026,
    "email_kampus": "2617051073@students.unila.ac.id",
    "email_pribadi": "calon-recovery@gmail.com"
  }
}
```

### 12.10 Audit Log Sample

```json
{
  "id_audit": "...uuid...",
  "event_type": "account.created",
  "platform": "m365",
  "nik_internal": "2617051073",
  "external_id": "87d349ed-44d7-43e1-9a83-5f2406dee5bd",
  "actor": "system",
  "operation": "create",
  "http_status": 201,
  "success": true,
  "duration_ms": 487,
  "occurred_at": "2026-08-15T10:24:18+07:00",
  "request_payload": {
    "accountEnabled": true,
    "displayName": "Nama Mahasiswa Contoh",
    "userPrincipalName": "2617051073@students.unila.ac.id",
    "passwordProfile": "[REDACTED]"
  },
  "response_payload": {
    "id": "87d349ed-44d7-43e1-9a83-5f2406dee5bd",
    "userPrincipalName": "2617051073@students.unila.ac.id"
  }
}
```

---

## 13. Open Questions for Stakeholder Review

Daftar keputusan yang membutuhkan input pemangku kepentingan sebelum implementasi dimulai:

| # | Pertanyaan | Pihak yang Diharapkan Menjawab |
|---|---|---|
| Q1 | **Format email mahasiswa** — pertahankan `{NPM}@students.unila.ac.id` atau ada keinginan ubah ke format lain (misal nama berbasis: `nama.belakang.NPM@students.unila.ac.id`)? | UPA TIK + WR Akademik |
| Q2 | **Format email pegawai** — gunakan `{NIP}@unila.ac.id`, `{nama}.{nama_belakang}@unila.ac.id`, atau hybrid? Konsistensi vs readability. | UPA TIK + Biro Kepegawaian |
| Q3 | **OU strategy Google** — `/Mahasiswa/{angkatan}/{fak}/{prodi}` (4-level deep) atau lebih flat (`/Mahasiswa/{fak}`)? Berdampak ke kompleksitas policy. | UPA TIK + admin Workspace |
| Q4 | **License SKU mapping** — siapa yang berhak SKU mana? (D3/S1 = A1, S2/S3/Profesi = A3?). Perlu inventory SKU eksisting + kuota. | Admin Microsoft 365 + UPA TIK |
| Q5 | **Default auto-provision vs manual approve** — di Fase 5 (pilot), default ke manual approve. Apakah setelah stabil mau di-toggle ke auto? Jika ya, kapan & kriteria? | Kepala UPA TIK |
| Q6 | **Offboarding policy timing** — staged hari 0/30/90/180 sesuai usulan? Atau ada kebijakan kampus yang berbeda (misal alumni email selamanya)? | Pimpinan Unila (formal policy diperlukan) |
| Q7 | **Alumni email policy** — convert ke `@alumni.unila.ac.id` (perlu domain baru), tetap `@students.unila.ac.id`, atau revoke? | UPA TIK + WR Kemahasiswaan |
| Q8 | **Source of truth pegawai** — SIMPEG eksisting cukup atau perlu integrasi tambahan (BKD)? Mapping NIP → email pegawai. | Biro Kepegawaian + UPA TIK |
| Q9 | **MFA enforcement** — default-on saat akun dibuat atau opt-in? Berdampak ke UX onboarding. | UPA TIK Security |
| Q10 | **Webhook signing secret rotation owner** — siapa yang pegang dan rotate? Procedure handover. | Tim Dev MyUnila |
| Q11 | **Pilot prodi yang dipilih** — usulan: prodi dengan IT-savvy faculty, jumlah mahasiswa baru ~50–100. Pilihan? | UPA TIK |
| Q12 | **Notifikasi onboarding ke mahasiswa baru** — kirim email ke alamat pribadi (yang ada di si-registrasi) berisi password awal & link MFA? Channel-nya: email saja atau plus WhatsApp/SMS? | UPA TIK + Humas |
| Q13 | **VM produksi identity-service** — VM5 staging dulu, lalu ke VM baru atau co-host dengan service eksisting? Spesifikasi & lokasi. | Tim Infrastruktur |
| Q14 | **Recovery email** — wajib di-isi calon mahasiswa saat registrasi atau optional? Jika optional, fallback ke nomor HP? | si-registrasi product owner |
| Q15 | **Public communication** — pengumuman ke civitas tentang perubahan ini (mahasiswa baru akan dapat email dalam 5 menit, lama dibanding sebelumnya 1–7 hari) — siapa yang publish & kapan? | Humas + UPA TIK |

---

**Versi dokumen:** v1 (draft)
**Update terakhir:** 13 Mei 2026
**Untuk pertanyaan teknis:** Tim Dev MyUnila / UPA TIK Unila
