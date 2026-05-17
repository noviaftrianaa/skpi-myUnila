# Blog Platform myUnila — API Endpoints

**Backend service:** `blog-service` (Go + Fiber)
**Internal port:** 8091
**Kong route:** `/blog-service/*` → `http://blog-service:8091/api/v1/*`
**Auth:** JWT via Kong (HS256 shared secret), Kong-trust pattern (backend parse claim, Kong verify signature)

Semua response format konsisten:

```json
{ "success": true, "data": {...}, "meta": { "page": 1, "total": 123 } }
{ "success": false, "message": "..." }
```

---

## 1. Public Endpoints (no auth)

### 1.1 Apex Aggregator

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/v1/public/trending` | Top trending posts (cached redis 1 jam). Query: `?limit=20&kategori={slug}&tipe_role={MHS|STAF|DOSEN|ALUMNI}&fakultas={kode}` |
| GET | `/api/v1/public/latest` | Latest published. Query: `?limit=20&offset=0` |
| GET | `/api/v1/public/featured` | Admin-curated featured (a_unggulan). Query: `?limit=10` |
| GET | `/api/v1/public/top-authors` | Top authors last 30d by views. Query: `?limit=10` |
| GET | `/api/v1/public/top-categories` | Top categories by post count. Query: `?limit=10` |
| GET | `/api/v1/public/categories` | List semua kategori |
| GET | `/api/v1/public/categories/:slug/posts` | Posts in kategori. Query: `?limit=20&offset=0&sort={latest|popular}` |
| GET | `/api/v1/public/tags` | List top tags. Query: `?limit=50` |
| GET | `/api/v1/public/tags/:slug/posts` | Posts dengan tag. Query: `?limit=20&offset=0` |
| GET | `/api/v1/public/fakultas/:kode/posts` | Posts dari penulis fakultas tertentu |
| GET | `/api/v1/public/search` | Full-text search via Meilisearch. Query: `?q=...&kategori=...&tipe_role=...&sort={relevance|latest|popular}&limit=20&offset=0` |

### 1.2 Per-User Blog (subdomain)

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/v1/public/blogs/:subdomain` | Get blog metadata + theme config |
| GET | `/api/v1/public/blogs/:subdomain/posts` | List posts blog ini. Query: `?status=published&limit=20&offset=0&kategori=...&tag=...` |
| GET | `/api/v1/public/blogs/:subdomain/posts/:slug` | Single post + increment view (debounced via ip_hash) |
| GET | `/api/v1/public/blogs/:subdomain/about` | About page content |
| GET | `/api/v1/public/blogs/:subdomain/archive` | Posts grouped by year/month |
| GET | `/api/v1/public/blogs/:subdomain/feed.xml` | RSS feed |
| GET | `/api/v1/public/blogs/:subdomain/sitemap.xml` | Per-blog sitemap |
| POST | `/api/v1/public/blogs/:subdomain/posts/:slug/view` | Record view (called from frontend after debounce). Body: `{referer}` |

### 1.3 SEO

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/v1/public/sitemap.xml` | Apex sitemap index |
| GET | `/api/v1/public/sitemap-posts-:n.xml` | Sub-sitemap (10k posts per file) |
| GET | `/api/v1/public/feed.xml` | Apex RSS (latest 50 posts) |
| GET | `/api/v1/public/robots.txt` | (atau di nginx) |

---

## 2. Author Endpoints (auth required, scope=`author`)

User harus login MyUnila dashboard. JWT carry `id_pengguna_pdut`.

### 2.1 My Blog

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/v1/me/blog` | Get my blog (auto-create kalau belum ada blog & user punya subdomain) |
| PATCH | `/api/v1/me/blog` | Update profile blog: nm_blog, tagline, bio, sosmed, dst |
| PUT | `/api/v1/me/blog/theme` | Update theme: id_template_theme + theme_config_json |
| PUT | `/api/v1/me/blog/avatar` | Upload avatar (multipart) |
| PUT | `/api/v1/me/blog/cover` | Upload cover (multipart) |

### 2.2 Subdomain Claim

| Method | Path | Keterangan |
|---|---|---|
| POST | `/api/v1/me/blog/check-subdomain` | Body: `{subdomain}`. Return: `{available, validation: {layer1, layer2, layer3, layer4}, suggestions}` |
| POST | `/api/v1/me/blog/claim-subdomain` | Body: `{subdomain, alasan?}`. Return: `{status: 'auto_approved'|'manual_review', subdomain?, id_klaim?}` |
| GET | `/api/v1/me/blog/claim-history` | History semua klaim user ini |

### 2.3 Posts (CRUD)

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/v1/me/posts` | List my posts. Query: `?status=...&limit=20&offset=0&search=...` |
| POST | `/api/v1/me/posts` | Create new post (default status=draft) |
| GET | `/api/v1/me/posts/:id` | Get single (with full HTML+JSON) |
| PUT | `/api/v1/me/posts/:id` | Update post (auto-create revision) |
| PATCH | `/api/v1/me/posts/:id/status` | Change status: `{status: 'published'\|'draft'\|'archived'\|'trash', tgl_jadwal?}` |
| PATCH | `/api/v1/me/posts/:id/visibilitas` | Change visibility: `{visibilitas, password?}` |
| POST | `/api/v1/me/posts/:id/auto-save` | Save draft tanpa create revision (debounced 30s di frontend) |
| GET | `/api/v1/me/posts/:id/revisions` | List revisions |
| POST | `/api/v1/me/posts/:id/revisions/:nomor/restore` | Rollback ke revisi tertentu |
| DELETE | `/api/v1/me/posts/:id` | Soft delete (status=trash) |
| DELETE | `/api/v1/me/posts/:id/permanent` | Hard delete (only after status=trash) |

### 2.4 Media

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/v1/me/media` | List my media. Query: `?jenis_media=...&search=...&limit=20&offset=0` |
| POST | `/api/v1/me/media` | Upload (multipart). Auto-generate variants kalau image |
| GET | `/api/v1/me/media/:id` | Get metadata |
| PATCH | `/api/v1/me/media/:id` | Update alt_text, caption |
| DELETE | `/api/v1/me/media/:id` | Soft delete |

### 2.5 Tags & Categories Helpers

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/v1/me/tags/autocomplete` | Query: `?q=nex` → top tags matching |
| GET | `/api/v1/me/categories` | Same as public list (helper untuk dropdown) |

### 2.6 Analytics (basic)

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/v1/me/analytics/overview` | Total view (lifetime, 30d, 7d), like, komentar, top 5 posts |
| GET | `/api/v1/me/analytics/posts/:id` | Per-post: views per day last 30d, top referer, like count |

### 2.7 Comments (P2 — author moderate own)

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/v1/me/komentar` | List komentar di posts saya. Query: `?status_moderasi=pending` |
| PATCH | `/api/v1/me/komentar/:id/approve` | |
| PATCH | `/api/v1/me/komentar/:id/spam` | |
| DELETE | `/api/v1/me/komentar/:id` | Soft delete |

### 2.8 Notifications (P2)

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/v1/me/notifikasi` | List inbox |
| PATCH | `/api/v1/me/notifikasi/:id/read` | Mark read |
| DELETE | `/api/v1/me/notifikasi/:id` | Delete |

---

## 3. Admin Endpoints (auth + scope=`admin`)

Hanya role `admin` MyUnila atau peran khusus `blog_admin`.

### 3.1 Blogs Management

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/v1/admin/blogs` | List semua blog. Query: `?subdomain=...&id_tipe_role=...&a_aktif=true` |
| GET | `/api/v1/admin/blogs/:id` | Detail |
| PATCH | `/api/v1/admin/blogs/:id/suspend` | Suspend (a_aktif=false) |
| PATCH | `/api/v1/admin/blogs/:id/verify` | Verified badge (a_terverifikasi=true) |
| DELETE | `/api/v1/admin/blogs/:id` | Soft delete |

### 3.2 Klaim Subdomain Queue

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/v1/admin/klaim` | List. Query: `?status=manual_review` (24h SLA borderline) |
| GET | `/api/v1/admin/klaim/:id` | Detail klaim + alasan + validasi result |
| PATCH | `/api/v1/admin/klaim/:id/approve` | Body: `{catatan?}` |
| PATCH | `/api/v1/admin/klaim/:id/reject` | Body: `{catatan, suggestion?}` |

### 3.3 Featured Posts

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/v1/admin/featured` | List featured |
| POST | `/api/v1/admin/featured` | Body: `{id_post, urutan, valid_until?}` |
| DELETE | `/api/v1/admin/featured/:id` | |

### 3.4 Reports (P2)

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/v1/admin/laporan` | List. Query: `?status=pending` |
| GET | `/api/v1/admin/laporan/:id` | Detail |
| PATCH | `/api/v1/admin/laporan/:id/action` | Body: `{tindakan: 'hide_post'\|'suspend_blog'\|'warn_user'\|'ban_user'\|'dismissed', catatan}` |

### 3.5 Reserved Words

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/v1/admin/kata-terlarang` | List |
| POST | `/api/v1/admin/kata-terlarang` | Body: `{kata, kategori, keterangan}` |
| PUT | `/api/v1/admin/kata-terlarang/:id` | |
| DELETE | `/api/v1/admin/kata-terlarang/:id` | |

### 3.6 Categories

| Method | Path | Keterangan |
|---|---|---|
| POST | `/api/v1/admin/kategori-post` | Create |
| PUT | `/api/v1/admin/kategori-post/:id` | Update |
| DELETE | `/api/v1/admin/kategori-post/:id` | |

### 3.7 Templates

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/v1/admin/templates` | List semua theme template |
| POST | `/api/v1/admin/templates` | Upload custom theme (P2 — zip + manifest.json) |
| PATCH | `/api/v1/admin/templates/:id/default` | Set sebagai default |

### 3.8 Audit Log

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/v1/admin/audit` | Query: `?id_pengguna=...&aksi=...&entitas=...&tgl_dari=...&tgl_sampai=...` |

### 3.9 Stats Overview

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/v1/admin/stats` | Total blogs, posts (per status), media size, top blog, growth chart |

---

## 4. System Endpoints

| Method | Path | Keterangan |
|---|---|---|
| GET | `/health` | Health check (DB ping, Redis ping, MinIO ping, Meilisearch ping) |
| GET | `/` | Service metadata (name, version, endpoints index) |
| GET | `/metrics` | Prometheus metrics (P2) |

---

## 5. Webhooks / Events (P2)

| Event | Trigger | Payload |
|---|---|---|
| `post.published` | Status berubah ke published | `{id_post, id_blog, judul, slug, tgl_terbit, ...}` |
| `subdomain.claimed` | Klaim approved | `{subdomain, id_pengguna_pdut, ...}` |
| `report.created` | Laporan baru masuk | `{id_laporan, id_post, alasan}` |

Internal: emit ke Redis pub-sub channel `blog.events.*` untuk konsumer (notif service, analytics).

---

## 6. Rate Limiting (Kong-level)

| Endpoint group | Limit |
|---|---|
| Public read | 600/min per IP |
| Public search | 60/min per IP |
| Author write (POST/PUT) | 60/min per user |
| Author auto-save | 120/min per user (debounced 30s) |
| Admin | 300/min per user |
| View tracking | 30/min per `(ip_hash, post_id)` (anti-fraud) |

---

## 7. Error Codes

| HTTP | Use case |
|---|---|
| 400 | Validation error (return field errors) |
| 401 | Auth required / invalid JWT |
| 403 | Authorized but not authorized (e.g. mau edit post orang lain) |
| 404 | Not found |
| 409 | Conflict (subdomain taken, slug duplicate dalam blog) |
| 422 | Unprocessable (e.g. claim subdomain reject by validation layer 4) |
| 429 | Rate limit |
| 500 | Server error |

---

## 8. Versioning

- `/api/v1/*` — current
- Breaking changes → `/api/v2/*` di-introduce, v1 tetap jalan 6 bulan deprecation period
