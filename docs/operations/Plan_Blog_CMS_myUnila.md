# Plan: Blog & CMS myUnila

**Versi**: 1.0 — 2026-05-09
**Author**: UPT TIK Universitas Lampung
**Status**: Draft — Brainstorming

---

## 1. Executive Summary

myUnila sudah **70% punya CMS** (`manajemen-konten-service` Go di port 9008-an, container `myunila-man-konten-staging` running). Yang belum: **public blog frontend** (placeholder `blog-unila` masih `a_coming_soon=true`) + **migrasi dari Blogger eksternal** (currently auto-synced via `monitoring/blog_sync`).

**Rekomendasi Akhir**: **Opsi A — Extend `man-konten` + Build Next.js Public Site** (skor decision matrix 9.0/10).
- Leverage backend yg sudah ada (skema profesional: slug, banner, tags, pinned, featured, view_count, expiry, target_role)
- Build Next.js SSG/ISR public site `/blog` (atau subdomain `blog.myunila.ac.id`)
- Tambahkan editor modern TipTap + Media Library UI
- Migrasi konten Blogger (one-time) via `blog_sync` yg sudah ada

**Estimasi**: **MVP 6–8 minggu** (~2 bulan), tim 2-3 dev.

---

## 2. Status Quo

### 2.1 Komponen Existing yang BISA DIPAKAI
| Komponen | Tech | Status | Fungsi |
|---|---|---|---|
| **manajemen-konten-service** | Go Fiber | ✅ Running | Backend CMS — modul: pengumuman, kategori, notif, upload |
| **monitoring/blog_sync** | Go | ✅ Running | Sync post dari Google Blogger ke `monitoring.blog_posts_cache` |
| **`/dashboard/manajemen-konten`** | Next.js | ✅ Live | Admin UI (sudah ada) |
| Schema `pengumuman` table | SQL Server | ✅ Tersedia | Sudah punya field profesional: tipe (pengumuman/berita/artikel), slug, banner, tags, is_pinned, is_featured, tgl_terbit, tgl_expiry, status, target_role, view_count, allow_comment |
| **`blog-unila`** placeholder | — | ⏳ TBD | Public frontend belum ada (url=`#`) |

### 2.2 Ekosistem Eksternal
- **blog.unila.ac.id** — kemungkinan running di Google Blogger (di-sync via `blog_sync`)
- **www.unila.ac.id** — homepage utama (CMS terpisah, kemungkinan WordPress lama)
- Konten editorial saat ini terfragmentasi: Blogger + WordPress + manual sosmed posts

### 2.3 Schema `pengumuman` (sudah ada — nilainya tinggi)
```
id_pengumuman, tipe, judul, slug, ringkasan, isi,
id_kategori, banner_url, author, tags,
is_pinned, is_featured,
tgl_terbit, tgl_expiry, status,
target_role, view_count, allow_comment
```
Schema ini **sudah cukup untuk modern blog CMS**. Tinggal tambah:
- `seo_title`, `seo_description`, `og_image` (SEO/social share)
- `reading_time` (auto-calc dari word count)
- Relasi `tag_master` (kalau mau tag autocomplete)

---

## 3. Use Cases — 3 Jenis Konten

| Use Case | Audience | Channel | Tools |
|---|---|---|---|
| **A. Pengumuman Internal** | Mhs/Dosen/Tendik internal | Portal myUnila (login required) | `man-konten` (sudah ada) |
| **B. Blog/Berita Publik** | Calon mhs, alumni, publik | `blog.myunila.ac.id` (no login, SEO) | TBD (focus plan ini) |
| **C. Artikel Riset/Akademik** | Akademik internal & publik | Both | Hybrid |

Plan ini fokus ke **Use Case B** (blog publik) — tapi pakai backend yg sama (`man-konten`) supaya editor cuma 1.

---

## 4. Referensi Industri

| Platform | Tipe | Pros | Cons |
|---|---|---|---|
| **WordPress.com / self-host** | Open-source, PHP | Mature, banyak plugin (Yoast SEO, multilingual, image), editor WYSIWYG, ekosistem besar | Stack PHP + MySQL beda dari myUnila, attack surface, sync ke man-konten kompleks |
| **Headless WordPress + Next.js** | Hybrid | Editor familiar, frontend modern | Double maintenance |
| **Strapi** | Headless, Node.js | Free, admin UI bagus, REST/GraphQL | Tambah stack Node, perlu hosting baru |
| **Directus** | Headless, Node.js + Postgres | Postgres native, powerful | Sama, tambah stack |
| **Sanity.io** | SaaS | Fast, structured content, GROQ query | Vendor lock-in, biaya bulanan |
| **Ghost** | Open-source Node.js | Newsletter native, modern UI | Bukan general CMS, terbatas blog only |
| **Hugo / Jekyll (SSG)** | Static | Fast, SEO, gratis hosting | Editor butuh Git knowledge — tidak ramah PR officer |
| **Custom Go (man-konten existing)** | Sudah ada | Stack konsisten myUnila | Harus build editor & media UI |
| **Google Blogger** (current) | SaaS gratis | Simple, sync ke search engine | UX kuno, customization terbatas, vendor lock-in (Google) |

---

## 5. Empat Opsi Strategis

### 5.1 Opsi A — Extend `man-konten` + Next.js Public Site ⭐ (RECOMMENDED)

**Konsep**: Backend tetap pakai `man-konten` yg sudah running. Tambahkan editor modern + media library yg bagus, lalu build Next.js public frontend untuk blog SEO-friendly.

**Apa yang dibangun:**
1. **Tambahan kolom SEO** di tabel `pengumuman`: `seo_title`, `seo_description`, `og_image`, `reading_time`, `meta_keywords`
2. **Editor modern**: TipTap atau EditorJS di dashboard admin (Next.js sudah pakai React)
3. **Media Library UI** — drag-drop upload, crop, alt-text, kategorisasi (sudah ada modul `upload`, perlu UI)
4. **Tag autocomplete** + relasi `tag_master`
5. **Public frontend** Next.js standalone:
   - Route: `blog.myunila.ac.id` atau `myunila.ac.id/blog`
   - SSG (Static Site Generation) untuk performa & SEO
   - ISR (Incremental Static Regeneration) — auto-update konten baru tanpa rebuild
   - Sitemap.xml, robots.txt, RSS feed, OpenGraph, JSON-LD
   - Search via Meilisearch (sudah ada di myUnila)
6. **Komentar** (Phase 2) — disqus/giscus/native
7. **Newsletter** (Phase 2) — newsletter subscriber + email cron
8. **Migration dari Blogger**: jalankan `blog_sync` → import `blog_posts_cache` ke `pengumuman` (one-time)

**Pros:**
- Stack 100% konsisten dengan myUnila (Go + Next.js + SQL Server)
- Single auth, single source of truth
- 70% backend sudah jadi → time-to-market cepat
- Tidak ada vendor lock-in
- SEO control penuh (Next.js paling top untuk SEO)

**Cons:**
- Harus build editor (TipTap setup ~1 minggu)
- Build Media Library UI (~2 minggu)
- Migrasi Blogger butuh transformation logic

**Estimasi**: **MVP 6–8 minggu**, full feature 12 minggu.

---

### 5.2 Opsi B — Headless WordPress + Next.js
Self-host WordPress, expose via WPGraphQL/REST, build Next.js frontend.

**Pros**: Content editor familiar untuk PR officer; plugin ekosistem (Yoast, ACF, dll); WordPress mobile app native.
**Cons**: Tambah stack PHP+MySQL; perlu sync atau abandon `man-konten`; double maintenance; security WP terkenal banyak vuln.

**Estimasi**: 8–10 minggu. Skip kalau tim TIK tidak mau extra stack.

---

### 5.3 Opsi C — Headless CMS (Directus / Strapi) + Next.js
Pakai Directus (Postgres native) atau Strapi (Node.js).

**Pros**: Admin UI super polished out-of-the-box; modern editor; multi-content-type; revision history; role-based access bawaan.
**Cons**: Tambah stack Node.js + Postgres; abandon `man-konten` yg sudah running; learning curve; data harus migrasi dari SQL Server `pengumuman` ke Postgres Directus.

**Estimasi**: 10–14 minggu.

---

### 5.4 Opsi D — Pure WordPress Self-Host (Status Quo Improved)
Tetap pakai WordPress (atau pindah dari Blogger ke self-host WP), tidak terintegrasi dengan myUnila.

**Pros**: Simple, deploy WP biasa, banyak template university gratis.
**Cons**: SILO total — 2 portal terpisah, SSO sulit, double login, branding tidak konsisten, `man-konten` jadi sia-sia.

**Estimasi**: 4 minggu. **NOT recommended** kecuali mau total separation.

---

## 6. Decision Matrix

| Kriteria | Bobot | Opsi A (Extend) | Opsi B (Headless WP) | Opsi C (Directus) | Opsi D (Pure WP) |
|---|:---:|:---:|:---:|:---:|:---:|
| Time to market | 25% | 9 | 6 | 5 | 8 |
| Reuse existing (man-konten) | 20% | 10 | 4 | 3 | 1 |
| UX seragam myUnila | 15% | 10 | 8 | 8 | 3 |
| Editor experience | 15% | 7 | 10 | 10 | 9 |
| Maintenance jangka panjang | 10% | 9 | 6 | 7 | 5 |
| SEO performance | 10% | 10 | 8 | 9 | 6 |
| Cost (lisensi + dev) | 5% | 10 | 7 | 8 | 9 |
| **TOTAL SKOR** | 100% | **9.00** | **6.50** | **6.45** | **5.30** |

**Pilihan**: **Opsi A — Extend man-konten + Next.js Public Site** (skor 9.00/10).

---

## 7. Stack & Arsitektur (Opsi A)

### 7.1 Komponen
| Layer | Tech | Status | Catatan |
|---|---|---|---|
| Backend CMS | **`man-konten-service`** (Go Fiber) | ✅ Existing | Tambah field SEO + endpoint baru |
| Admin UI | **Next.js 15** di myUnila | ✅ Existing | Tambah TipTap editor + Media Library |
| Public frontend | **Next.js 15 (new)** | ⏳ Build | SSG/ISR, deploy di subdomain blog.myunila.ac.id |
| Database | **SQL Server pdut** schema `man_konten` | ✅ Existing | Tambah kolom SEO + tabel `tag_master` |
| Search | **Meilisearch** | ✅ Existing | Tambah indeks `blog_posts` |
| Media | **Minio S3-compatible** atau Filesystem + CDN | TBD | Untuk gambar/banner berita |
| Image Optimization | **Next.js Image** + sharp | ✅ Existing | Auto resize/webp/lazy-load |
| Sync Blogger (legacy) | **monitoring/blog_sync** (Go) | ✅ Existing | One-time import + ongoing sync (opsional) |
| Notif/Newsletter (Phase 2) | **Email Service** (myUnila SMTP) | TBD | Cron + queue |
| Comments (Phase 2) | **Giscus / Disqus / native** | TBD | Pilih saat Phase 2 |

### 7.2 Diagram

```
[Public Internet]                     [Internal myUnila Users]
      ↓                                        ↓
[blog.myunila.ac.id]               [myUnila Portal /dashboard/...]
  Next.js SSG/ISR                    Next.js (admin UI)
      ↓                                        ↓
      └────────► REST API ◄───────────────────┘
                    ↓
        [man-konten-service] (Go Fiber)
                    ↓
      ┌─────────────┴──────────────┐
      ↓                            ↓
[SQL Server pdut]          [Minio / FS Storage]
schema: man_konten         (media files)
   tabel:
   - pengumuman (extended)
   - kategori
   - tag_master (NEW)
   - upload (existing)
                    ↓
            [Meilisearch]
            (search index)
                    ↑
            [blog_sync (Go)] — opsional, fetch dari Blogger lama
```

### 7.3 Schema Extensions

**Tabel `man_konten.pengumuman` — TAMBAH kolom**:
```sql
ALTER TABLE man_konten.pengumuman ADD
  seo_title NVARCHAR(200) NULL,
  seo_description NVARCHAR(500) NULL,
  og_image NVARCHAR(500) NULL,
  meta_keywords NVARCHAR(300) NULL,
  reading_time INT NULL DEFAULT 0,
  cover_caption NVARCHAR(255) NULL;
```

**Tabel baru `man_konten.tag_master`**:
```sql
CREATE TABLE man_konten.tag_master (
  id_tag UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  nama VARCHAR(80) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  jumlah_pakai INT DEFAULT 0,
  tgl_create DATETIME DEFAULT GETDATE()
);
CREATE TABLE man_konten.pengumuman_tag (
  id_pengumuman UNIQUEIDENTIFIER NOT NULL,
  id_tag UNIQUEIDENTIFIER NOT NULL,
  PRIMARY KEY (id_pengumuman, id_tag),
  FOREIGN KEY (id_pengumuman) REFERENCES man_konten.pengumuman(id_pengumuman),
  FOREIGN KEY (id_tag) REFERENCES man_konten.tag_master(id_tag)
);
```

**Tabel baru `man_konten.newsletter_subscriber`** (Phase 2):
```sql
CREATE TABLE man_konten.newsletter_subscriber (
  id_subscriber UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  email VARCHAR(255) NOT NULL UNIQUE,
  nama VARCHAR(150),
  status VARCHAR(20) DEFAULT 'active',
  tgl_subscribe DATETIME DEFAULT GETDATE(),
  unsubscribe_token VARCHAR(64)
);
```

---

## 8. Feature Roadmap

### 8.1 MVP — Minggu 1–8

| Minggu | Fitur | Owner |
|---|---|---|
| 1 | DDL extension + migrasi schema | Backend Go |
| 1-2 | Endpoint baru man-konten: tag CRUD, search by tag, related posts, sitemap data | Backend Go |
| 2-3 | Admin UI: TipTap editor (rich text + image inline), tag autocomplete, slug auto-gen | Frontend |
| 3-4 | Admin UI: Media Library page (upload, browse, alt-text, copy URL) | Frontend |
| 4-5 | Public Next.js site setup (subdomain DNS, blog.myunila.ac.id atau /blog di portal) | DevOps + Frontend |
| 5-6 | Public site pages: home (latest+featured+pinned), single post, kategori, tag, search, archive | Frontend |
| 6-7 | SEO: meta tags, OpenGraph, JSON-LD, sitemap.xml, robots.txt, RSS feed | Frontend |
| 7 | Migration script: import dari `blog_posts_cache` (Blogger) ke `pengumuman` | Backend Go |
| 7 | Meilisearch integration: index search publik | Backend |
| 8 | UAT, fix bugs, manual editor + content team | Tech Writer + QA |

**Output MVP**:
- ✅ Editor admin yg modern (TipTap)
- ✅ Media library
- ✅ Public blog SEO-friendly (sitemap, RSS, OG)
- ✅ Migrasi dari Blogger lama
- ✅ Search publik

### 8.2 Phase 2 — Minggu 9–16

| Fitur | Detail |
|---|---|
| **Komentar publik** | Pilih: Giscus (GitHub), Disqus, atau native (perlu moderation) |
| **Newsletter subscriber** | Form subscribe di footer + email cron tiap minggu |
| **Email send service** | Integrate dengan SMTP myUnila / SES |
| **Multi-author + permission** | Editor / Author / Contributor roles (extend man_akses peran fungsional) |
| **Workflow draft → review → publish** | Approval workflow seperti SIMBAK |
| **Scheduled publish** | Auto-publish di tanggal tertentu (cron job) |
| **Image CDN** | CloudFlare / KeyCDN untuk image hosting |
| **Multilingual (ID/EN)** | Support translation per post |
| **Analytics** | Google Analytics 4 atau Plausible self-host |
| **Heatmap** (opsional) | Hotjar atau Microsoft Clarity (gratis) |

### 8.3 Phase 3 — Bulan 5+ (advanced)

| Fitur | Detail |
|---|---|
| **AI-assisted writing** | Anthropic API utk draft article, rewrite, SEO suggest |
| **Auto-translate** | English versi auto-generate via DeepL atau Anthropic |
| **Podcast/Video** | Audio embed, video player native |
| **Author profile pages** | Profile lengkap dosen/staf yg sering nulis |
| **Related research** | Auto-link artikel ke publikasi dosen di SI Penelitian |
| **Mobile app** (opsional) | Reader app pakai React Native (kalau perlu) |

---

## 9. Integrasi dengan Modul myUnila Existing

| Modul Existing | Integrasi Blog |
|---|---|
| **manajemen-konten** (existing) | Reuse backend, extend untuk public-facing |
| **monitoring/blog_sync** (existing) | One-time migration dari Blogger; ongoing sync optional |
| **public-service** (existing) | Tambah endpoint blog data ke search Meilisearch |
| **Meilisearch** (existing) | Index `blog_posts` baru, expose ke search bar utama myUnila |
| **Manajemen Akses** | Peran "Editor Konten" / "Author" custom (peran fungsional, bukan identitas) |
| **SI Penelitian / SI Pengabdian / SI Publikasi** | Auto-generate "Related Articles" dari publikasi dosen |
| **Tracer Study** | Embed call-to-action ke alumni di artikel relevan |
| **LMS (future)** | Embed materi blog jadi reading material di kelas |
| **Akreditasi** | Export data partisipasi konten dosen utk borang BAN-PT (publikasi populer) |

---

## 10. Effort & Resource

### 10.1 Tim Inti
| Role | Tugas | Effort MVP |
|---|---|---|
| **Backend Go** | Extend man-konten, tag CRUD, sitemap endpoint, migrasi Blogger | 0.7 FTE × 8 minggu |
| **Frontend Next.js** | Editor TipTap, Media Library, public site SEO | 1.0 FTE × 8 minggu |
| **DevOps** | Subdomain DNS, Minio setup, SMTP config (Phase 2) | 0.3 FTE × 4 minggu |
| **Content/Editor** | Migrasi konten lama, write 10 artikel sample | 0.5 FTE × 4 minggu |
| **PM/Lead** | Koordinasi, validasi PR officer | 0.3 FTE × 8 minggu |
| **QA/Tester** | Cross-browser, mobile, SEO test, Lighthouse score | 0.3 FTE × 2 minggu |

**Total**: ~3 FTE selama 8 minggu MVP.

### 10.2 Infrastruktur
| Item | Spek | Estimasi biaya |
|---|---|---|
| Subdomain `blog.myunila.ac.id` | DNS A record | Gratis (sudah punya) |
| Container Next.js public | 2 vCPU, 4GB RAM | Existing VM5 atau VM baru |
| Storage media (Minio) | 500GB awal | Existing atau ~Rp 200k/bln |
| CDN image (opsional) | CloudFlare free tier | Gratis (tier free cukup) |
| SMTP service | Existing or SES (Phase 2) | ~Rp 100k/bln SES |
| Email subscriber list size | Up to 10k MVP, 100k+ Phase 2 | (mostly free di self-host) |

### 10.3 Budget Software
| Item | Tipe | Biaya |
|---|---|---|
| TipTap editor | Open source MIT | **Gratis** |
| Meilisearch | Open source | Existing (gratis) |
| Next.js | MIT | Gratis |
| Image processing (sharp) | MIT | Gratis |
| Plagiarism check (Phase 3) | SaaS opsional | TBD |
| AI writing (Phase 3) | Anthropic API | Pay-per-use, ~Rp 500-1000/artikel |

---

## 11. Risk & Mitigation

| Risk | Probabilitas | Impact | Mitigasi |
|---|:---:|:---:|---|
| Editor lambat dgn artikel panjang | Med | Med | Lazy load images, debounce save, autosave per 30s |
| SEO ranking turun saat migrate dari Blogger | High | High | 301 redirect tiap URL Blogger → Next.js, robots.txt, submit sitemap baru ke GSC |
| Spam komentar | High | Med | reCAPTCHA + moderation queue (Phase 2) |
| Editor PR officer kurang tech-savvy | High | Med | Training video + doc, undo/redo, autosave, paste from Word |
| Image storage penuh | Med | Med | Quota per author + auto-cleanup unused media >1 thn |
| DDoS public site | Low | High | CloudFlare proxy, rate limit Kong |
| GDPR/data privacy newsletter | Low | Med | Double-opt-in + unsubscribe link |
| Konten tidak terbaca mobile | Med | Med | Mobile-first design, Lighthouse score >90 |
| Backup konten gagal | Low | High | Daily backup DB + media to off-site |

---

## 12. Pertanyaan untuk Pimpinan

1. **Domain**: pakai `blog.myunila.ac.id` atau gabung di `myunila.ac.id/blog`? Atau migrasi total dari `blog.unila.ac.id`?
2. **Migrasi Blogger**: kapan deadline cutover? Perlu paralel dulu (Blogger live + new live)?
3. **Editor team**: siapa yg jadi PIC konten? Humas, PR Rektorat, atau distributed per fakultas?
4. **Branding**: pakai nama "Blog Unila" / "myUnila News" / "Unila Stories"?
5. **Multi-author**: berapa user yg perlu role Author / Editor?
6. **Hosting**: subdomain di datacenter Unila atau Cloud?
7. **Komentar**: izinkan publik komentar atau closed?
8. **Newsletter**: kirim ke email semua mhs/dosen/alumni atau opt-in saja?
9. **Multilingual**: prioritas Indonesia + English atau Indonesia saja?
10. **Akreditasi**: butuh data publikasi konten dosen utk borang? Kapan deadline?

---

## 13. Quick Win — Apa yang Bisa Dimulai Minggu Depan

- ✅ **Hari 1-2**: ALTER schema `pengumuman` tambah kolom SEO (DDL siap, idempotent)
- ✅ **Hari 3-4**: Add tag_master + relasi tag (DDL)
- ✅ **Minggu 1**: Setup Next.js public site skeleton + DNS subdomain
- ✅ **Minggu 1-2**: Editor TipTap di admin UI (research + integration)
- ✅ **Minggu 2**: Test migrasi 10 post dummy dari Blogger ke pengumuman

Setelah Quick Win, kalau approval lancar → langsung ke MVP 8 minggu.

---

## 14. Comparison Cepat: Blogger vs WordPress vs Custom (untuk pimpinan)

```
                    Blogger         WordPress        Custom (Opsi A)
                    -------         ---------        ----------------
Editor friendly:    ★★★★            ★★★★★           ★★★★ (TipTap modern)
SEO power:          ★★★             ★★★★★           ★★★★★
Customization:      ★★              ★★★★             ★★★★★
Integration myUnila: ★              ★★              ★★★★★
Maintenance load:   N/A (gratis)    Medium           Low (sudah ada)
Vendor lock-in:     ★★★★ (Google)   ★                ★
Mobile experience:  ★★★             ★★★★             ★★★★★ (Next.js)
Cost per year:      Free            ~Rp 5-10jt       Internal team
```

**Custom (Opsi A) menang di 6 dari 8 kriteria.**

---

## 15. Kesimpulan

**Blog/CMS myUnila layak dibangun cepat** karena:
- 70% backend (`man-konten-service`) sudah running, schema profesional
- `blog_sync` siap migrasi konten Blogger lama
- Stack myUnila (Next.js + Go + SQL Server) cukup mumpuni untuk modern blog
- Kompetitor (Blogger lama) tidak SEO-friendly, susah customize

**Rekomendasi**: **Opsi A — Extend `man-konten` + Build Next.js Public Site**.
- MVP 8 minggu (~2 bulan)
- 3 FTE
- Software gratis, infra mostly existing
- Time-to-market paling cepat

**Setelah MVP**: Phase 2 (komentar, newsletter, multilingual) 2 bulan, Phase 3 (AI, podcast, mobile) opsional.

**Next Step**:
1. Validasi 10 pertanyaan section 12 ke pimpinan UPT TIK + Humas
2. Eksekusi Quick Win minggu 1
3. Detailed sprint plan untuk MVP 8 minggu

---

**Dokumen ini brainstorming internal UPT TIK — perlu validasi & iterasi sebelum eksekusi.**
**File**: `/var/www/my-unila/docs/operations/Plan_Blog_CMS_myUnila.{md,pdf}`
