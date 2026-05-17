# Blog Platform myUnila — Frontend Public (`frontend-blog/`)

**Hostname:** `blog.unila.ac.id` (apex) + `*.blog.unila.ac.id` (per-user tenant)
**Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, dark mode, ISR/SSG
**Port lokal:** 3002 (3000 = main frontend, 3001 = grafana)
**Deploy:** vm9-blog (192.168.120.49) sebagai container Docker

---

## 1. Design Principles

| Principle | Implementasi |
|---|---|
| **Read-first** | Tipografi prima, line-height generous, optimal width 65–75 char per line untuk reading comfort |
| **Modern minimal** | Grid clean, white space generous, color sparing (hindari clutter) |
| **Mobile-first** | All layouts work pada 375px width, scale up via `sm/md/lg/xl` breakpoint |
| **Dark mode** | Toggle persistent (localStorage), respect `prefers-color-scheme` |
| **Fast** | LCP < 2.5s, no client-side JS untuk konten utama (RSC + ISR) |
| **Accessible** | WCAG 2.1 AA, keyboard nav, alt text mandatory, contrast min 4.5:1 |
| **SEO-first** | Schema.org JSON-LD, sitemap, RSS, canonical, OpenGraph |
| **Brand myUnila** | Warna primer biru `#1E40AF` di apex; per-user blog bisa custom |

---

## 2. Apex (`blog.unila.ac.id`)

### 2.1 Homepage (`app/(apex)/page.tsx`)

Layout (top-to-bottom):

#### A. Sticky Header (60px)
```
┌─────────────────────────────────────────────────────────────────┐
│ [📖 Blog Unila] [Kategori▾] [Trending] [Tentang]   🔍 [🌙] [Login] │
└─────────────────────────────────────────────────────────────────┘
```
- Logo kiri (link to apex)
- Nav: Kategori (mega-menu), Trending, Tentang
- Search icon (open command-k modal)
- Dark mode toggle
- Login button → redirect `myunila.unila.ac.id/login?redirect=blog`

#### B. Hero Search Section (full viewport ~600px)
- Background: subtle gradient (light: blue-50 → indigo-50 / dark: gray-900 → gray-800)
- Centered content:
  - **Headline H1:** "Suara Civitas Akademik Universitas Lampung"
  - **Subheadline:** "Jelajahi 1,234+ artikel dari 567 penulis — mahasiswa, dosen, dan staf Unila"
  - **Big search bar** (Google-style, 600px wide):
    - Placeholder: "Cari artikel, penulis, atau topik..."
    - Icon search kiri, icon ⌘K kanan
    - Below: chip suggestions ("Penelitian", "Tutorial", "Beasiswa", "Opini")
  - **Stats row:** 📝 1,234 Artikel | 👥 567 Penulis | 👁 89,012 Dibaca | 🏛 8 Fakultas

#### C. Trending Section
```
🔥 Trending Minggu Ini                                  Lihat Semua →
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ [Cover image]    │ │                  │ │                  │
│ Kategori badge   │ │   ... post card  │ │   ... post card  │
│ Judul artikel    │ │                  │ │                  │
│ Author • 5 menit │ │                  │ │                  │
│ 👁 1.2k  ❤️ 234  │ │                  │ │                  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
                    [post card]            [post card]
                    (grid 3 col mobile=1, tablet=2, desktop=3)
```

#### D. Featured Posts
- Layout: 1 large featured + 2 small (asymmetric grid)
- Manual curated by admin (admin set `a_unggulan=TRUE`)

#### E. Latest Posts
- Grid 3-col, infinite scroll OR pagination
- Show 12 posts initial, "Load More" button (or auto-load on scroll)

#### F. Categories Grid
- 8 category cards (icon + name + post count)
- Click → `/kategori/{slug}`

#### G. Top Authors
- Horizontal scroll cards (5 visible, swipe more):
  - Avatar + nama + role badge (mhs/dosen/staf) + fakultas
  - Stats: posts | views
  - "Visit Blog →" link

#### H. Per-Fakultas Hub Tabs
- Tabs: FT | FMIPA | FH | FE | FKIP | FP | FISIP | FK | FK
- Tab content: latest 6 posts dari fakultas tsb

#### I. Footer
```
┌─────────────────────────────────────────────────────────────────┐
│ Blog Unila — Wadah Publikasi Civitas Akademik                  │
│                                                                 │
│ Kategori          | Akun           | Bantuan        | Tentang  │
│ - Teknologi       | - Login        | - FAQ          | - About  │
│ - Riset           | - Daftar Blog  | - Hubungi      | - Privacy│
│ - dst             |                | - API Docs     | - Terms  │
│                                                                 │
│ © 2026 Universitas Lampung • blog.unila.ac.id                  │
│ [Twitter] [Instagram] [YouTube] [GitHub]                       │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Search Page (`app/(apex)/search/page.tsx`)

- Top: search bar (filled with query) + filters bar
- **Filter sidebar (left, sticky on desktop, collapsible on mobile):**
  - Kategori (multi-select checkbox)
  - Tipe penulis (mhs/staf/dosen/alumni)
  - Fakultas (multi-select)
  - Tahun (range slider)
  - Bahasa (id/en) — P2
- **Sort:** Relevance / Latest / Popular
- **Results:** List view (lebih detail dari card grid), highlight matched terms
- **Pagination:** Load more / numeric (toggle user pref)
- **Empty state:** "Tidak ada hasil. Coba kata kunci berbeda atau lihat trending" + suggestion chips

Implementation: client-side InstantSearch.js (Meilisearch) — instant feedback typing.

### 2.3 Kategori (`app/(apex)/kategori/[slug]/page.tsx`)

- Hero: kategori icon + nama + deskripsi + jumlah post
- Filter tag cloud (top 20 tag dalam kategori ini)
- Sort: Latest / Popular
- Grid posts

### 2.4 Tag (`app/(apex)/tag/[slug]/page.tsx`)

Mirip kategori. Hero: "Posts dengan tag #{nama_tag}".

### 2.5 Fakultas Hub (`app/(apex)/fakultas/[kode]/page.tsx`)

- Hero: nama fakultas + jumlah penulis + jumlah post
- Top authors dari fakultas ini
- Latest posts grid

### 2.6 Trending (`app/(apex)/trending/page.tsx`)

- Tabs: Today / This Week / This Month / All Time
- Numbered list (1–50) dgn rank besar di kiri + post card di kanan
- Algoritma sama dgn homepage trending section, tapi window berbeda

### 2.7 Tentang (`app/(apex)/tentang/page.tsx`)

- Static markdown content (mission, how to join, FAQ, T&C)
- "Mau ikut menulis?" → CTA link to MyUnila SSO

---

## 3. Per-User Blog (Tenant `*.blog.unila.ac.id`)

### 3.1 Default Theme: `modern`

Layout (top-to-bottom):

#### A. Sticky Header (50px)
```
┌─────────────────────────────────────────────────────────────────┐
│ [Avatar] {nm_blog}              [Kategori▾] [Tentang]  🔍 [🌙]  │
└─────────────────────────────────────────────────────────────────┘
```
Per-blog header. Click avatar → blog homepage. Tidak ada login button (read-only).

#### B. Hero / Author Banner (300–400px)
```
┌─────────────────────────────────────────────────────────────────┐
│ [Cover image background, gradient overlay]                      │
│                                                                 │
│              [Avatar 120×120 circular]                          │
│                                                                 │
│              {nm_tampilan} • Verified ✓                         │
│              Mahasiswa • FMIPA • Ilmu Komputer                  │
│              ─────────────────────────                          │
│              {tagline blog — italic, ~120 char}                 │
│              ─────────────────────────                          │
│              [Twitter] [GitHub] [LinkedIn]                      │
│                                                                 │
│              📝 23 Posts  👁 1.2k Views  👥 45 Followers (P2)  │
└─────────────────────────────────────────────────────────────────┘
```

#### C. Bio Section (collapsible, default expand if mobile)
- Bio text (max 500 char)
- "Read more" → about page

#### D. Pinned Post (kalau ada)
- Highlighted card di top (badge "📌 Pinned")

#### E. Posts Grid
- Default: 2-col grid (mobile 1-col)
- Toggle: Grid view / List view (icon top-right)
- Filter chip bar: All | Tag1 | Tag2 | Tag3 (top 5 tags)
- Sort: Latest (default) / Popular
- Pagination atau load more

#### F. Sidebar (kalau layout = sidebar-right)
- Search (within blog)
- Kategori dgn count
- Tag cloud
- Recent posts (5 latest)
- Follow button (P2)
- RSS link icon

#### G. Footer (per-blog custom)
- "Powered by myUnila Blog"
- Custom footer links dari `theme_config_json`

### 3.2 Single Post Page (`app/(tenant)/posts/[slug]/page.tsx`)

#### A. Header (sama dgn blog homepage)

#### B. Article Hero
- Cover image (full-width 16:9, max 600px height)
- Kategori badge (clickable)
- **H1 Judul** (display, font-heading, 48px desktop / 32px mobile)
- Author chip: avatar + nama + tgl_terbit relative ("3 hari lalu") + reading time
- Tag chips (clickable)
- Action bar: 👁 1.2k | ❤️ Like (P2) | 💬 Komentar (P2) | 🔖 Bookmark (P2) | 🔗 Share (modal: WA/Twitter/Telegram/copy link)

#### C. Article Body (max-width 720px centered, prose styling)
- Render TipTap HTML output dengan styling:
  - H2/H3 with anchor link
  - Code block dengan syntax highlight (Shiki)
  - Image dengan alt + caption + zoom on click (lightbox)
  - Blockquote stylized
  - Table responsive (horizontal scroll on mobile)
  - YouTube embed responsive
  - KaTeX inline & block
- Reading progress bar sticky top (4px height)
- Floating share buttons (left side desktop, bottom mobile)

#### D. Author Bio Footer
- Card dengan avatar besar + bio + "Visit blog →" + sosmed icons

#### E. Related Posts (3 posts)
- "More from {nm_tampilan}" — same blog, by recency atau related tag

#### F. Comments (P2 placeholder MVP)
- "💬 Komentar akan tersedia segera"

#### G. Footer (sama dgn homepage)

### 3.3 About Page (`app/(tenant)/about/page.tsx`)

- Author profile detail (avatar besar, bio panjang, lokasi, fakultas/prodi)
- Sosmed links
- Statistik: total post, total view, member sejak
- Top categories yg ditulis
- "Latest Post" link

### 3.4 Archive (`app/(tenant)/archive/page.tsx`)

- Group by year → month → list posts
- Or by kategori → list posts
- Toggle view

---

## 4. Komponen Library (`src/shared/components/`)

| Komponen | Tujuan |
|---|---|
| `<PostCard>` | Card 3 variant: `default` (cover top + meta), `compact` (no cover), `featured` (large) |
| `<PostList>` | List view 1-col |
| `<PostReader>` | Render TipTap HTML dgn styling prose |
| `<AuthorChip>` | Avatar + nama + role + tgl |
| `<AuthorHeader>` | Big banner di tenant homepage |
| `<SearchBar>` | Apex hero search (large) |
| `<SearchModal>` | Cmd-K command bar |
| `<KategoriBadge>` | Color-coded badge |
| `<TagChip>` | Clickable tag |
| `<TagCloud>` | Cloud weighted by frekuensi |
| `<ShareModal>` | WA/Twitter/Telegram/copy URL |
| `<ReadingProgress>` | Sticky progress bar |
| `<TableOfContents>` | Auto-generated dari H2/H3 (sticky right rail) |
| `<DarkModeToggle>` | next-themes wrapper |
| `<LoadMore>` | Button infinite scroll |
| `<EmptyState>` | Centered empty illustration + CTA |
| `<ErrorBoundary>` | Wrapper |

---

## 5. Themes (`src/shared/themes/`)

```
themes/
├── modern/                # default
│   ├── layout.tsx         # full layout component
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── AuthorHero.tsx
│   │   ├── PostGrid.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── styles.css         # CSS variables
│   └── manifest.json      # spec
└── minimalist/
    ├── layout.tsx
    ├── components/
    │   ├── Header.tsx     # ultra-minimal logo only
    │   ├── PostList.tsx   # vertical list, no cover
    │   └── Footer.tsx
    ├── styles.css
    └── manifest.json
```

Theme switching:
```typescript
// app/(tenant)/layout.tsx
import { headers } from "next/headers";
import { fetchBlog } from "@/lib/api";
import ModernTheme from "@/shared/themes/modern/layout";
import MinimalistTheme from "@/shared/themes/minimalist/layout";

const themes = { modern: ModernTheme, minimalist: MinimalistTheme };

export default async function TenantLayout({ children }) {
  const subdomain = (await headers()).get("x-tenant-subdomain");
  const blog = await fetchBlog(subdomain);
  const ThemeComponent = themes[blog.kode_template] ?? ModernTheme;
  return <ThemeComponent blog={blog}>{children}</ThemeComponent>;
}
```

---

## 6. Color & Typography

### Apex (default)

| Token | Light | Dark |
|---|---|---|
| `--color-bg` | `#FFFFFF` | `#0F172A` |
| `--color-fg` | `#0F172A` | `#F1F5F9` |
| `--color-primary` | `#1E40AF` (myUnila blue) | `#3B82F6` |
| `--color-secondary` | `#0EA5E9` | `#0284C7` |
| `--color-accent` | `#F59E0B` | `#FBBF24` |
| `--color-muted` | `#64748B` | `#94A3B8` |
| `--color-border` | `#E2E8F0` | `#334155` |
| `--color-card` | `#F8FAFC` | `#1E293B` |

### Typography

- **Font heading:** Inter (variable, weight 400–800) atau Plus Jakarta Sans
- **Font body:** Source Serif Pro atau Inter (untuk reading)
- **Font mono:** JetBrains Mono (code blocks)
- **Sizes (Tailwind):**
  - H1: `text-5xl lg:text-6xl`
  - H2: `text-3xl lg:text-4xl`
  - H3: `text-2xl lg:text-3xl`
  - Body: `text-base lg:text-lg leading-relaxed`
  - Caption: `text-sm`

### Per-tenant override

Theme config inject CSS variables di tenant root:
```css
:root {
  --color-primary: #FF6B6B;  /* dari blog.theme_config_json.warna_primer */
  --font-heading: 'Playfair Display', serif;
}
```

---

## 7. Performance Optimization

| Teknik | Implementasi |
|---|---|
| **ISR** | Apex pages revalidate 5–10 min, single post 1 hour |
| **On-demand revalidation** | Webhook dari backend saat post update → POST `/api/revalidate?path=...&secret=...` |
| **Image optimization** | Next.js `<Image>` dgn `loader` custom ke MinIO/CDN. Sizes responsive. AVIF/WebP. |
| **Font loading** | `next/font` self-hosted, swap, preload critical |
| **Code splitting** | Theme components lazy load via dynamic import |
| **Prefetch** | Link prefetch on hover (default Next.js) |
| **CDN** | Cloudflare di depan VM9 (cache HTML 5 min, assets 1 year) |
| **Critical CSS** | Tailwind JIT, no unused CSS |
| **No-JS fallback** | Konten utama RSC, search & dark mode toggle butuh JS (graceful degrade) |

---

## 8. SEO Implementation

### Per-page metadata

```typescript
// app/(tenant)/posts/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await fetchPost(...);
  return {
    title: post.judul,
    description: post.ringkasan,
    openGraph: {
      title: post.judul,
      description: post.ringkasan,
      images: [post.cover_url],
      type: "article",
      publishedTime: post.tgl_terbit,
      authors: [post.nm_tampilan],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.judul,
      description: post.ringkasan,
      images: [post.cover_url],
    },
    alternates: {
      canonical: post.meta_seo_json?.canonical_url ?? `https://${subdomain}.blog.unila.ac.id/posts/${post.slug}`,
    },
  };
}
```

### JSON-LD (Schema.org BlogPosting)

```typescript
<script type="application/ld+json">{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": post.judul,
  "image": post.cover_url,
  "datePublished": post.tgl_terbit,
  "dateModified": post.updated_at,
  "author": {
    "@type": "Person",
    "name": post.nm_tampilan,
    "url": `https://${subdomain}.blog.unila.ac.id/about`
  },
  "publisher": {
    "@type": "Organization",
    "name": "Universitas Lampung",
    "logo": {"@type": "ImageObject", "url": "https://blog.unila.ac.id/logo.png"}
  },
  "mainEntityOfPage": canonical
})}</script>
```

### Sitemap

`/sitemap.xml` (apex) — index point to:
- `/sitemap-static.xml` — homepage, kategori, tag, tentang
- `/sitemap-blogs.xml` — all blog homepages
- `/sitemap-posts-1.xml`, `-2.xml`, ... — posts batched 10k each

### RSS

`/feed.xml` (apex) — latest 50 published posts (all blogs)
`/{subdomain}/feed.xml` — per-blog feed

---

## 9. Demo Dummy Data Strategy

Selama backend belum ready, FE pakai mock JSON di:

```
src/lib/_mock/
├── apex-trending.json
├── apex-latest.json
├── apex-featured.json
├── kategori.json
├── top-authors.json
├── tenant-blog.json     # one tenant for demo
└── tenant-posts.json
```

Toggle env `NEXT_PUBLIC_USE_MOCK=true` → semua fetch return mock. Setelah backend ready, ganti ke real API.

Demo subdomain di local dev: pakai query param `?tenant=demo-mhs` (middleware sudah handle).

---

## 10. URL Structure Summary

| URL | Halaman |
|---|---|
| `blog.unila.ac.id/` | Apex homepage |
| `blog.unila.ac.id/search?q=...` | Search results |
| `blog.unila.ac.id/kategori/teknologi` | Kategori archive |
| `blog.unila.ac.id/tag/nextjs` | Tag archive |
| `blog.unila.ac.id/fakultas/ft` | Per-fakultas hub |
| `blog.unila.ac.id/trending` | Trending list |
| `blog.unila.ac.id/tentang` | Static about |
| `blog.unila.ac.id/feed.xml` | Apex RSS |
| `blog.unila.ac.id/sitemap.xml` | Apex sitemap |
| `{sub}.blog.unila.ac.id/` | Tenant homepage |
| `{sub}.blog.unila.ac.id/posts/{slug}` | Single post |
| `{sub}.blog.unila.ac.id/about` | About author |
| `{sub}.blog.unila.ac.id/archive` | Archive view |
| `{sub}.blog.unila.ac.id/feed.xml` | Per-tenant RSS |
| `{sub}.blog.unila.ac.id/sitemap.xml` | Per-tenant sitemap |
