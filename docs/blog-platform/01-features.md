# Blog Platform myUnila — Feature Modules & Roadmap

Brainstorm lengkap fitur sekelas WordPress / Blogger / Medium, di-customize untuk konteks civitas akademik Unila.

Format: **MVP** = wajib di rilis pertama. **P2** = phase 2 setelah user feedback. **P3** = long-term.

---

## 1. Editor & Komposisi Post

| Fitur | Tier | Catatan |
|---|---|---|
| **TipTap rich editor** (heading H1–H6, bold/italic/underline/strike) | MVP | Toolbar floating + bubble menu |
| Bullet & numbered list | MVP | |
| Blockquote | MVP | |
| Code block + syntax highlight (Shiki) | MVP | Bahasa: js/ts/py/go/php/sql/bash/json/yaml/markdown |
| Inline code | MVP | |
| Link insert/edit (with target) | MVP | Auto-detect URL paste → link |
| Image upload (drag-drop / paste / url) | MVP | Auto resize ke variants |
| Image caption + alt text | MVP | Accessibility |
| Table (insert, resize, header row) | MVP | |
| Horizontal rule | MVP | |
| Math equation (KaTeX) | MVP | Inline `$...$` & block `$$...$$` |
| YouTube embed | MVP | Auto-detect youtube URL paste |
| Twitter/X embed | P2 | |
| File attachment (PDF/DOCX/PPTX/XLSX) | MVP | Max 20MB |
| Mention `@user` (autocomplete civitas SSO) | P2 | |
| Hashtag `#tag` autocomplete dari frequent tags | MVP | |
| Auto-save draft (every 30s) | MVP | |
| **Revision history** (rollback) | MVP | Tabel `blog.post_revision` |
| Slug auto-generate dari judul + manual edit | MVP | Validasi unique per blog |
| Excerpt (auto 160 char OR manual) | MVP | |
| Cover image (upload + crop preview) | MVP | Aspect ratio 16:9 |
| **Status:** draft / review / published / scheduled / archived / trash | MVP | `review` dipakai kalau blog requires moderation |
| **Visibilitas:** public / unlisted / private (login-only) / password | MVP | Password store as bcrypt hash |
| Reading time auto-calc (150 wpm) | MVP | Cached di kolom `waktu_baca_menit` |
| Word count display | MVP | |
| **SEO meta:** title / description / og:image / canonical URL | MVP | JSONB `meta_seo_json` |
| Schedule publish (post-date) | MVP | Cron job di `blog-service` cek setiap menit |
| Co-author / collaborator | P2 | |
| Series / collection (group post berurutan) | P2 | Tabel `blog.series` baru |
| Cross-posting / re-blog dari blog lain | P2 | |
| AI assist (summarize, autocomplete, translate ID↔EN) | P3 | |

---

## 2. Media Library

| Fitur | Tier | Catatan |
|---|---|---|
| Upload single / batch (drag-drop) | MVP | Limit per file 50MB (image), 200MB (video) |
| Image variants auto-generate | MVP | thumbnail 150 / medium 400 / large 1024 / original |
| Video upload + thumbnail extraction | MVP | ffmpeg di backend |
| Document upload (PDF/DOCX/PPTX/XLSX) | MVP | Preview via embed |
| Audio upload (mp3/wav) | P2 | Untuk podcast |
| Search by filename | MVP | |
| Filter by jenis_media (image/video/doc/audio) | MVP | |
| Inline insert ke editor | MVP | Click → masukkan ke cursor |
| Alt text + caption editing | MVP | |
| Bulk delete | MVP | |
| Storage: MinIO bucket `blog-media` | MVP | Per-blog folder isolation |
| CDN / Cloudflare cache untuk public URLs | MVP | TTL 1 tahun, immutable filename |
| Image CDN transform (on-the-fly resize) | P2 | imgproxy atau Cloudflare Images |

---

## 3. Categories & Tags

| Fitur | Tier | Catatan |
|---|---|---|
| **Kategori global** (admin-managed): Teknologi, Pendidikan, Riset, Opini, Sastra, Olahraga, Berita Kampus, dll | MVP | Tabel `ref.kategori_post` — admin curate ~20 kategori |
| Pilih kategori dari dropdown saat tulis post | MVP | Multi-select sampai 3 per post |
| **Tag bebas** (auto-create) | MVP | Tabel `ref.tag` + `blog.post_tag` |
| Autocomplete tag dari frequent tags | MVP | |
| Tag cloud di per-user blog & apex | MVP | |
| Per-kategori archive page | MVP | `blog.unila.ac.id/kategori/teknologi` |
| Per-tag archive page | MVP | `blog.unila.ac.id/tag/nextjs` |
| Tag merge / rename (admin) | P2 | |

---

## 4. Subdomain & Per-User Blog

| Fitur | Tier | Catatan |
|---|---|---|
| **Subdomain pattern**: `{NIM}-mhs` / `{base}-staf` / `{base}-dosen` / `{base}-alumni` | MVP | Lock dari v2 |
| Mahasiswa: auto-assigned dari NIM | MVP | NIM unique guaranteed. **Locked**, tidak bisa pilih opsi lain. |
| Staf/Dosen: **PICKER 5 opsi auto-generated** dari profil (no free typing) | MVP | Variasi: nama depan, nama belakang, inisial+belakang, dst. **4-layer validation INHERENT** (semua opsi pre-validated server-side: format/reserved/unique/anti-impersonation). User tinggal pilih satu. Konsistensi pattern, no spam. |
| Manual appeal (subdomain di luar daftar generated) | MVP | Untuk edge case / brand pribadi. SLA 24h moderator review. |
| Wildcard SSL `*.blog.unila.ac.id` | MVP | Let's Encrypt DNS-01 + acme.sh |
| Cooldown 90 hari setelah rename | MVP | Field `tgl_rename_terakhir` |
| Pre-claim VIP list (rektor, dekan, kaprodi, profesor) | P2 | Admin upload CSV |
| Suggestion engine kalau bentrok | MVP | nm_belakang → fakultas → prodi → inisial → numeric |
| Admin override claim ongoing | MVP | UI di `dashboard/blog-platform/users` |
| Suspend blog (a_aktif=false) | MVP | Admin only |
| Export blog (zip semua post + media) | P2 | Untuk archival / migrate |
| Delete blog (soft delete + 30 hari grace) | P2 | |

---

## 5. Theme & Customization

| Fitur | Tier | Catatan |
|---|---|---|
| **Default theme `modern`** (built-in, ready dari MVP) | MVP | Hero penulis + bio + post grid + sidebar tag cloud |
| Theme `minimalist` (single column, focus reading) | MVP | Serif font, no sidebar, narrow column — cocok literary/opini |
| Theme `magazine` (multi-column editorial, featured grid asimetris) | MVP-rich | Cocok redaksi BEM/HMJ — registered, render phase 2 |
| Theme `academic` (mirip ResearchGate/Scholar, hero publikasi) | MVP-rich | Cocok dosen/peneliti |
| Theme `gallery` (visual-first masonry) | MVP-rich | Cocok fotografer/desainer |
| Theme `devlog` (dark default, monospace, terminal vibe) | MVP-rich | Cocok mahasiswa Ilkom/TI |
| Theme `portfolio` (showcase agency-vibe, hero statement) | MVP-rich | Cocok freelancer/wirausaha civitas |
| **Total stok template MVP**: 7 entries (modern, minimalist + 5 brand-flavored) | MVP | Pickerable di settings; modern + minimalist fully rendered, lainnya register dgn fallback ke modern + indicator badge di header tenant |
| Per-blog theme picker (rich preview grid + status badge stable/beta/soon) | MVP | Card grid 3-col, status badge, klik untuk select |
| Custom builder visual (drag-drop, edit live preview) | P2 | "Bikin Template Sendiri" — author bisa kreatif |
| Per-blog warna primer & sekunder | MVP | Color picker, simpan di `theme_config_json` |
| Per-blog font heading & body | MVP | Pilihan: Inter, Source Serif, JetBrains Mono, etc |
| Per-blog layout option (sidebar kiri/kanan/none) | MVP | |
| Header/footer customization (logo, link sosmed) | MVP | |
| Custom CSS (advanced) | P2 | Sanitize via DOMPurify |
| **Theme import/export** (zip + manifest.json) | P2 | WordPress-style |
| Theme marketplace (community-shared) | P3 | |
| Live preview before save | MVP | |

---

## 6. Author Profile

| Fitur | Tier | Catatan |
|---|---|---|
| Avatar (auto dari SSO MyUnila atau upload) | MVP | |
| Cover image | MVP | |
| Bio (max 500 char, support markdown ringan) | MVP | |
| Lokasi (free text) | MVP | |
| Social links: Twitter/X, Instagram, LinkedIn, GitHub, ORCID, ResearchGate, Google Scholar, website pribadi | MVP | JSONB `sosmed_json` |
| About page | MVP | Markdown editable, separate dari bio |
| Show real name vs pseudonym | MVP | Field `nm_tampilan` di `blog.blog` |
| Show fakultas/prodi badge | MVP | Resolve via cross-DB ke `pdut.man_akses.unit_organisasi` |
| Verified badge (admin-assigned) | MVP | Untuk akun resmi pimpinan |
| Follow / unfollow | P2 | |

---

## 7. Komentar (Phase 2)

| Fitur | Tier | Catatan |
|---|---|---|
| Threaded reply (max depth 3) | P2 | Tabel `interaction.komentar` (sudah disiapkan di schema) |
| Login required (SSO) atau anonymous (name+email) | P2 | Per-blog setting |
| Moderasi: pending → approved → rejected | P2 | Admin per-blog approve |
| Spam detection (keyword + rate limit) | P2 | |
| Pin comment (author/admin) | P2 | |
| Like comment | P2 | |
| Edit window 5 menit | P2 | |
| Email notif new comment ke author | P2 | |
| Block user | P2 | |
| Native vs Giscus/Disqus — pending decision | — | Open question #4 |

---

## 8. Reactions & Engagement (Phase 2)

| Fitur | Tier | Catatan |
|---|---|---|
| Like / clap (Medium-style accumulating) | P2 | Tabel `interaction.like_post` |
| Bookmark (private save) | P2 | |
| Share button (Twitter/WA/Telegram/LinkedIn/copy link) | MVP | Frontend only, no DB |
| View tracking (untuk trending) | MVP | Tabel `interaction.view_post` (anonymous via ip_hash) |
| Follower / following | P2 | Tabel `interaction.follower` |
| @-mention notif | P2 | |

---

## 9. Discovery (Apex `blog.unila.ac.id`)

| Fitur | Tier | Catatan |
|---|---|---|
| **Hero search** (Google-style) — full-text via Meilisearch | MVP | Field: judul, ringkasan, konten, nm_blog, tags |
| **Trending posts** (time-decayed) | MVP | Algoritma: `score = (view*1 + like*5 + komentar*10) * exp(-age_hours/72)` |
| Latest posts feed | MVP | ORDER BY tgl_terbit DESC |
| Featured posts (admin curated) | MVP | Admin set `a_unggulan=TRUE` |
| Filter by kategori | MVP | |
| Filter by tag | MVP | |
| Filter by tipe author (mhs/staf/dosen/alumni) | MVP | |
| Filter by fakultas | MVP | Resolve via cross-DB |
| Filter by tahun | MVP | |
| Sort: relevance / latest / most-read / most-liked | MVP | |
| Top authors (most viewed last 30d) | MVP | Cached redis 1 jam |
| Top categories | MVP | |
| Per-fakultas hub `blog.unila.ac.id/fakultas/{kode}` | MVP | |
| Pagination (cursor-based untuk perf) | MVP | |
| Infinite scroll fallback | MVP | |
| Bahasa filter (ID/EN) | P2 | Field `bahasa` di post |
| Reading list (untuk login user) | P2 | |

---

## 10. SEO & Distribution

| Fitur | Tier | Catatan |
|---|---|---|
| `sitemap.xml` per-blog | MVP | Generated on-demand, cached 1 jam |
| Apex `sitemap.xml` (semua public posts) | MVP | Sitemap index + sub-sitemaps per 10k posts |
| `robots.txt` | MVP | Allow indexing, disallow `/draft/` |
| RSS feed per-blog | MVP | `/{slug}.blog.unila.ac.id/feed.xml` |
| RSS feed apex (latest published) | MVP | `blog.unila.ac.id/feed.xml` |
| OpenGraph meta (og:title, og:image, og:description) | MVP | |
| Twitter card | MVP | |
| Schema.org JSON-LD (Article, BlogPosting, Person) | MVP | Untuk Google rich results |
| Canonical URL | MVP | Default = self URL, override via meta_seo_json |
| 301 redirect dari legacy `blog.unila.ac.id/...` (WP migration) | P2 | Tabel mapping `moderation.legacy_redirect` |
| Google Search Console verification | MVP | Meta tag injection |
| Hreflang ID/EN | P2 | |

---

## 11. Notifications & Email

| Fitur | Tier | Catatan |
|---|---|---|
| In-app notif (bell icon di MyUnila dashboard) | P2 | Reuse pattern `manajemen-konten-service/notif` |
| Email notif: post moderasi result | P2 | |
| Email notif: new comment on your post | P2 | |
| Email notif: new follower | P2 | |
| Email digest weekly (top posts user follow) | P2 | Cron job |
| Newsletter subscription (per-blog) | P3 | |
| Push notif (web push API) | P3 | |

---

## 12. Analytics

| Fitur | Tier | Catatan |
|---|---|---|
| Per-post: total views, likes, komentar, share count | MVP | Denormalized di kolom `jumlah_*` |
| Per-blog: total views (lifetime, 30d, 7d), top posts, growth | MVP | Aggregate query + redis cache |
| Per-blog: traffic source (referer breakdown) | P2 | Field `referer` di view_post |
| Per-blog: reader demographic (fakultas distribution kalau login) | P2 | |
| Author dashboard chart (chart.js / recharts) | MVP | View per hari last 30d |
| Apex admin: total artikel, post per hari, top blog, slowest endpoint | MVP | |
| Export CSV (post performance) | P2 | |

---

## 13. Moderation (Admin / Superadmin)

| Fitur | Tier | Catatan |
|---|---|---|
| **Reported posts queue** | P2 | Tabel `moderation.laporan_post` |
| **Subdomain claim review queue** (manual review borderline) | MVP | SLA 24h |
| Suspend blog (a_aktif=false) | MVP | |
| Hide post (status=archived, sembunyi dari publik) | MVP | |
| Delete user content (soft_delete) | MVP | 30 hari grace, hard delete by cron |
| Activity log per-user | MVP | Tabel `audit.jejak_audit` |
| Reserved words editor | MVP | UI CRUD `ref.kata_terlarang` |
| Pre-claim VIP list editor | P2 | |
| Featured posts editor | MVP | Toggle `a_unggulan` per post |
| Ban user (block from blog platform) | P2 | |
| Export user data (GDPR-style) | P3 | |

---

## 14. Plagiarism (Phase 2)

| Fitur | Tier | Catatan |
|---|---|---|
| Pre-publish plagiarism check (Turnitin / Plagscan) | P2 | Open question #3 |
| Score display (color-coded: <15% green, 15–40% yellow, >40% red) | P2 | |
| Force review jika score > threshold | P2 | Admin setting |
| Bypass kalau dosen / verified | P2 | |

---

## 15. Author Tools (Phase 2+)

| Fitur | Tier | Catatan |
|---|---|---|
| Series (post grouping berurutan) | P2 | |
| Co-author (multi-author per post) | P2 | Tabel `blog.post_co_author` |
| Cross-posting / re-blog | P2 | |
| Email subscriber list (per-blog) | P3 | |
| Newsletter dengan template | P3 | |
| Sponsored post / ads | P3 | Kalau policy approve |
| Export blog ke static site | P3 | Hugo / Jekyll generator |

---

## 16. Roadmap Phasing

### Phase 1 — MVP (target 6–8 minggu)

**Week 1–2:** Plan finalize + DBA review + DNS wildcard + schema deploy + backend scaffolding
**Week 3–4:** TipTap editor + Post CRUD + Media upload + Subdomain claim flow
**Week 5–6:** Apex aggregator (search, trending, latest, filter) + Per-user default theme rendering
**Week 7:** SEO (sitemap, RSS, OG meta), Schema.org, analytics basic
**Week 8:** Internal testing, bug fix, soft launch ke 10 dosen pilot

### Phase 2 — Engagement (target +6 minggu setelah MVP)

- Komentar threaded + moderasi
- Like / bookmark / follower
- Email notifications
- Plagiarism API
- Custom theme upload
- Pre-claim VIP + reserved words editor

### Phase 3 — Long-term (target Q3 2026+)

- Mobile apps
- AI assist
- Recommendation engine
- Newsletter, monetization
- Open API untuk pihak ke-3

---

## 17. Non-Functional Requirements

| Aspek | Target |
|---|---|
| Latency p95 read post | < 200ms (cached) / < 500ms (fresh) |
| Latency p95 search | < 300ms (Meilisearch) |
| Subdomain activation | < 5 detik dari klaim |
| Uptime SLO | 99.5% (apex), 99% (per-user) |
| Concurrent users | 5,000 (initial), scale to 20,000 |
| Storage media | Initial 500GB, scale to 5TB |
| Backup | DB daily snapshot + media S3 versioning |
| Bahasa support | ID (default), EN, Lampung (P3) |
| Accessibility | WCAG 2.1 AA |
| Mobile | Mobile-first, PWA-ready (P2) |
| Dark mode | MVP (toggle di public site & dashboard) |
