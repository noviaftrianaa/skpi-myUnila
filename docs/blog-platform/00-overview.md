# Blog Platform myUnila — Overview & Decision Log

**Status:** Plan v3 (revisi v2 dari memory 2026-05-13)
**Tanggal:** 2026-05-13
**Owner:** Tim Dev MyUnila / UPA TIK Unila
**Target rilis MVP:** ~6–8 minggu setelah plan approval

---

## 1. Tujuan

Membangun platform blog untuk seluruh civitas akademik Unila (mahasiswa, staf/tendik, dosen, alumni) di domain `blog.unila.ac.id` sebagai:

- **Aggregator publik** — homepage `blog.unila.ac.id` menampilkan kumpulan artikel seluruh civitas, mirip pengalaman *Google Search* / *Medium discover*: trending, latest, search, filter, kategori, top authors.
- **Per-user blog** — setiap civitas mendapat subdomain personal `{slug}.blog.unila.ac.id` untuk publikasi artikel mereka, dengan *default theme* siap pakai dan opsi custom theme di phase berikutnya.
- **Author panel terintegrasi** — penulis kelola post mereka langsung dari MyUnila dashboard (`myunila.unila.ac.id/dashboard/blog-platform/`) menggunakan SSO yang sudah ada — tanpa perlu akun baru.

---

## 2. Decision Log (lock-in 2026-05-13)

| # | Keputusan | Pilihan | Alasan |
|---|---|---|---|
| 1 | Repo strategy | **Monorepo** (`my-unila/`) | Solo/tim kecil, API contract masih iteratif, share infra natural, pattern existing konsisten. Mudah di-split nanti via `git filter-repo`. |
| 2 | Backend service | **`backend/blog-service/`** (Go + Fiber, baru, terpisah dari `manajemen-konten-service`) | Scope blog jauh berbeda (komentar, theme, multi-tenant per-user). Tabel & DB terpisah. |
| 3 | Database | **PostgreSQL 16**, DB name `blog_unila` | Konsisten dgn `simbak`/`si_prestasi`. Cocok untuk JSONB (theme config, SEO meta), full-text search fallback, partial index. |
| 4 | Schema convention | **Mengikuti `simbak` & `si_prestasi`** | UUID PK `gen_random_uuid()`, `id_<table>`, `nm_<field>`, `tgl_<field>`, `a_<field>` BOOLEAN, audit (`id_creator`, `id_updater`, `created_at`, `updated_at`, `soft_delete`), schemas terpisah (`ref/blog/media/interaction/moderation/audit`). |
| 5 | Editor rich text | **TipTap v2** (MIT, headless, ProseMirror-based) | Lengkap, opensource, mudah custom (Tailwind-friendly), 80+ plugins, output HTML+JSON, update via npm semver. |
| 6 | Frontend admin/author | **Tetap di `frontend/`** existing (`/dashboard/blog-platform/`) | Author = civitas yang sudah login SSO MyUnila. No duplikasi auth. |
| 7 | Frontend public | **Project baru `frontend-blog/`** standalone (sibling `frontend/`) | Beda perf needs (SSR/ISR untuk SEO, Cloudflare cache aggressive, lighter bundle). Boundary clean → mudah split repo nanti. |
| 8 | Subdomain rendering | **1 Next.js app** (apex + per-user) via middleware baca `host` header | Hemat resource, satu deploy. Hostname → resolve owner → render layout/theme. |
| 9 | Refactor `dashboard/manajemen-konten/` | **Pindah jadi sub** dari `dashboard/manajemen-apps/manajemen-konten/` | Manajemen Apps = parent baru untuk seluruh manajemen MyUnila ke depan. Plan terpisah. |
| 10 | Kong route | **`/blog-service`** | Konsisten dgn `/sister-service`, `/feeder-service`, dst. |
| 11 | Backend port | **8091** (Go `blog-service`) + **3002** (Next.js `frontend-blog`) | 9090 dipakai Prometheus. 8091 sequential setelah 8090 (`manajemen-konten`). 3002 setelah 3000/3001. Verified via `deployment/production/PORTS-DOCUMENTATION.md`. |
| 12 | VM production | **vm9-blog** (baru) | Sesuai instruksi "VM sendiri saja". Setelah vm8-simbak. |
| 13 | Storage | **MinIO** bucket `blog-media` | Sudah deployed, S3-compatible, mudah scale. |
| 14 | Search | **Meilisearch** index `blog_posts` | Sudah deployed, latency rendah, typo-tolerant, faceted search. |
| 15 | Cache | **Redis** | Sudah deployed. Cache trending list, top posts, theme config. |
| 16 | Subdomain UX | **Picker dari 1–5 opsi auto-generated** (NO free typing) | Pattern seragam, mencegah subdomain spam/aneh, brand consistency. Validasi 4-layer dijalankan saat generate. Manual appeal tersedia untuk edge case. |
| 17 | Profile per-user blog | **CV-style portfolio** (LinkedIn-inspired) | Hero + sosmed + stats SEO + bagian pendidikan/pengalaman/skills/sertifikasi/publikasi/bahasa. Privacy: NIM/NIP/IPK/alamat/telp/NIK NEVER ditampilkan. Schema kolom `cv_json` JSONB di `blog.blog`. |

---

## 3. Deviation dari Plan v2 (PDF May 2026)

| Aspek | v2 (PDF May) | v3 (sekarang) | Why |
|---|---|---|---|
| Subdomain pattern | `{NIM}-mhs` / `{base}-staf` / `{base}-dosen` | **Sama** | Lock-in dari v2. |
| Backend stack | Dedicated `blog-service` Go | **Sama** | Lock-in dari v2. |
| Public frontend | "Next.js public site" (lokasi belum ditentukan) | **Project baru `frontend-blog/`** sibling `frontend/` | Untuk SEO/perf isolation + clean boundary. |
| Author panel | Belum jelas dimana | **Di `frontend/dashboard/blog-platform/`** | Reuse SSO MyUnila, no auth duplication. |
| Default per-user theme | "Multi-template" sebagai feature | **Default theme `modern`** ready dari MVP, custom upload defer phase 2 | User explicit minta default template ada dari awal demo. |
| Komentar/reactions/plagiarism | Belum prioritized | **Defer phase 2** | Fokus MVP ke editor + post + media + theme + apex aggregator. |
| Refactor manajemen-konten | Tidak disebut | **Pindah ke `manajemen-apps/`** | User minta `manajemen-konten` jadi sub dari "Manajemen Apps" baru. |

---

## 4. Scope MVP vs Phase 2

### MVP (target 6–8 minggu)

**Backend (`blog-service`):**
- Schema PostgreSQL `blog_unila` lengkap (semua tabel, scaffolded)
- Modul Go scaffolded: `post`, `blog`, `kategori`, `tag`, `media`, `theme`, `klaim_subdomain`
- Endpoint CRUD post, list posts, get post by slug
- Endpoint blog by subdomain
- Endpoint apex: trending, latest, search (proxy ke Meilisearch)
- Upload media via MinIO
- JWT auth via Kong (reuse pattern existing)

**Frontend admin/author (`frontend/dashboard/blog-platform/`):**
- Sidebar + layout (mengikuti pattern modul lain)
- Halaman: Dashboard / Posts list / Post editor (TipTap) / Media library / Categories / Settings (subdomain claim, theme picker, blog profile) / Comments (placeholder) / Analytics (placeholder)
- Dummy data untuk demo

**Frontend public (`frontend-blog/`):**
- Next.js 15 App Router, hostname-based middleware
- Apex `blog.unila.ac.id`: hero search + trending + latest + categories grid + top authors
- Per-user `{slug}.blog.unila.ac.id`: default `modern` theme — author header (avatar/bio/sosmed), post grid, single post reader page, archive by tag/year
- Responsive (mobile-first), modern UI/UX, dark mode toggle, RSS link
- Dummy data untuk demo

**Deployment:**
- Entry di `deployment/local/scripts/` untuk local dev
- `deployment/production/vm9-blog/` skeleton (docker-compose, nginx, .env.example)
- Update `deployment/local/deploy.sh` menu

### Phase 2 (after MVP user testing)

- Komentar (threaded, moderasi, anti-spam)
- Like / clap / bookmark
- Follower / notifications
- Plagiarism API integration
- Custom theme upload/import (zip + manifest.json)
- Series, co-author, cross-posting
- Email digest, newsletter
- Analytics granular
- Moderation tooling (reports queue, ban user)
- Pre-claim VIP list, reserved words editor

### Phase 3 (long-term)

- Mobile apps (React Native / Flutter)
- AI assist (autocomplete, summarize, translate ID↔EN)
- Recommendation engine
- Monetization (sponsored posts, ads — kalau policy approve)

---

## 5. Open Questions (tetap dari v2, plus baru)

| # | Pertanyaan | Status | Penanggung Jawab |
|---|---|---|---|
| 1 | DNS wildcard `*.blog.unila.ac.id` + DNS API token bisa diakomodir tim infra? | Pending | Mizar ↔ Tim Infra Unila |
| 2 | Migrasi `blog.unila.ac.id` legacy WP — berapa banyak artikel & 301 redirect? | Pending | Cek dengan admin lama |
| 3 | Plagiarism API: Turnitin (existing subscription?) atau Plagscan? | Pending phase 2 | — |
| 4 | Comment moderation: native vs Giscus/Disqus? | Pending phase 2 | — |
| 5 | Cloudflare Pro budget ~Rp 350k/bulan disetujui? | Pending | Pimpinan UPA TIK |
| 6 | Reserved word list (~200) — review humas/legal? | Pending | Humas + Legal |
| 7 | Pre-claim VIP list — siapa saja? | Pending | Pimpinan |
| 8 | Mhs lulus → alumni: subdomain NIM tetap atau migrasi ke `-alumni`? | Pending | Pimpinan + BAK |

---

## 6. Referensi Plan Existing

- `docs/blog-platform/myunila_blog_platform_plan_v2.pdf` — review PDF v2 (May 2026)
- `docs/operations/Plan_Blog_CMS_myUnila.md` — older plan dari tim (decision matrix scored 9.0 untuk Opsi A — dedicated service)
- `backend/manajemen-konten-service/` — reference pattern Go service
- `data-model/script/postgresql/simbak/01-simbak_v1.0_fresh.sql` — reference pattern PostgreSQL schema
- `data-model/script/postgresql/si_prestasi/si_prestasi_v1.0_fresh.sql` — reference audit/cross-DB pattern

---

## 7. File-File di docs/blog-platform/

| File | Isi |
|---|---|
| `00-overview.md` | (ini) Decision log, scope, deviation dari v2 |
| `01-features.md` | Brainstorm fitur lengkap (mirror WP/Blogger custom) + roadmap phasing |
| `02-database-schema.md` | Narasi schema PostgreSQL + ER diagram + relasi |
| `03-api-endpoints.md` | REST API design (public, author, admin) |
| `04-architecture.md` | System architecture: backend layers, frontend split, hostname routing, auth flow |
| `05-frontend-dashboard.md` | Admin/author dashboard UI design |
| `06-frontend-public.md` | `blog.unila.ac.id` public site UI/UX |
| `07-deployment.md` | vm9-blog spec, docker-compose, kong, nginx, DNS wildcard, SSL |
