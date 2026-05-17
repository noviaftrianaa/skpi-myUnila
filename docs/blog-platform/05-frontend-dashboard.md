# Blog Platform myUnila — Frontend Dashboard (Admin & Author)

**Lokasi:** `frontend/src/app/dashboard/blog-platform/`
**Stack:** Next.js 15 App Router (existing MyUnila), Tailwind, HeroUI (sesuai pattern existing), TipTap editor
**Auth:** SSO MyUnila — civitas yang sudah login bisa langsung akses (dgn `useRequireAppAccess` pattern)
**App key:** `blog-platform` (perlu seed di `pdut.man_akses.aplikasi`)

---

## 1. Sidebar Menu (`config/menuConfig.tsx`)

```
Blog Platform
├── 🏠 Dashboard            /dashboard/blog-platform
├── 📝 My Blog
│   ├── Posts               /dashboard/blog-platform/posts
│   ├── Tulis Baru          /dashboard/blog-platform/posts/baru
│   ├── Draft               /dashboard/blog-platform/posts?status=draft
│   ├── Terjadwal           /dashboard/blog-platform/posts?status=scheduled
│   └── Trash               /dashboard/blog-platform/posts?status=trash
├── 🖼️ Media                /dashboard/blog-platform/media
├── 💬 Komentar (P2)        /dashboard/blog-platform/komentar
├── 📊 Analytics            /dashboard/blog-platform/analytics
├── ⚙️ Settings
│   ├── Profile Blog        /dashboard/blog-platform/settings/profile
│   ├── Subdomain           /dashboard/blog-platform/settings/subdomain
│   ├── Theme               /dashboard/blog-platform/settings/theme
│   └── SEO                 /dashboard/blog-platform/settings/seo
│
│   --- Admin Only ---
├── 🛡️ Moderation
│   ├── Klaim Subdomain     /dashboard/blog-platform/admin/klaim
│   ├── Laporan Post (P2)   /dashboard/blog-platform/admin/laporan
│   ├── Featured Posts      /dashboard/blog-platform/admin/featured
│   └── Reserved Words      /dashboard/blog-platform/admin/kata-terlarang
├── 📚 Manajemen
│   ├── Semua Blog          /dashboard/blog-platform/admin/blogs
│   ├── Kategori            /dashboard/blog-platform/admin/kategori
│   └── Templates           /dashboard/blog-platform/admin/templates
└── 📜 Audit Log            /dashboard/blog-platform/admin/audit
```

Note: menu admin di-filter via `roles: ["developer", "blog_admin"]` di config.

---

## 2. Halaman & Komponen MVP

### 2.1 Dashboard (`/dashboard/blog-platform`)

**Layout:** Welcome + stats cards + recent activity.

Komponen:
- **Welcome card** — "Halo {nm_tampilan}, blog kamu live di [{subdomain}.blog.unila.ac.id]"
- **4 stats cards:**
  - Total Post (dgn % growth 30d)
  - Total View (lifetime, 30d)
  - Total Komentar (P2 placeholder)
  - Subscribers/Follower (P2 placeholder)
- **Chart:** Views per day last 30 days (recharts line chart)
- **Top 5 posts** (list ringkas: judul, view, like, link)
- **Recent activity** (5 aksi terakhir dari audit log)
- **Quick actions:** [Tulis Post Baru] [Lihat Blog Saya] [Settings]

### 2.2 Posts List (`/dashboard/blog-platform/posts`)

**Layout:** Filter bar + table.

- **Filter:** status (all/draft/published/scheduled/archived/trash), kategori, search judul, range tgl_terbit
- **Table columns:**
  - Cover (thumbnail 60×60)
  - Judul + slug (clickable)
  - Status badge (color-coded)
  - Visibility icon (public/private/unlisted/password)
  - Kategori
  - Tgl terbit
  - Views | Likes | Komentar (count)
  - Actions: Edit / View / Duplicate / Move to trash
- **Bulk actions:** Publish / Unpublish / Delete / Change category
- **Pagination:** 20 per page, cursor-based

### 2.3 Post Editor (`/dashboard/blog-platform/posts/baru` & `/posts/[id]/edit`)

**Layout:** Split panel — main editor (75%) + sidebar settings (25%).

#### Main Editor Area

- **Title input** (large H1 textarea, auto-resize)
- **Slug** (auto-generated dari judul, editable, validation real-time)
- **TipTap toolbar** (sticky top):
  - Block: P / H1-H6 / Quote / Code / List (ol/ul) / Table / HR / Image / YouTube / KaTeX
  - Inline: Bold / Italic / Underline / Strike / Code / Link / Highlight / Color
  - Action: Undo / Redo / Clear formatting
- **Editor canvas** (TipTap, full-width, focus mode toggle)
- **Bottom bar:** Word count | Reading time | Last saved (auto-save status)

#### Sidebar Settings (collapsible accordion)

1. **Status & Publish**
   - Status dropdown (draft/review/published/scheduled/archived)
   - Visibility (public/unlisted/private/password) + password input kalau dipilih
   - Tgl terbit (DateTimePicker, kalau scheduled)
   - Button: [Save Draft] [Preview] [Publish] (atau Update kalau edit)
2. **Kategori & Tag**
   - Kategori dropdown (single select dari list public)
   - Tag input (autocomplete + create-on-enter)
3. **Cover Image**
   - Drag-drop / browse
   - Preview + crop tool
   - Alt text input
4. **Excerpt (Ringkasan)**
   - Textarea max 500 char
   - "Auto-generate from content" button
5. **SEO**
   - Title (max 70 char, char counter)
   - Meta description (max 160 char)
   - OG image (separate dari cover)
   - Canonical URL (override)
   - No-index toggle
6. **Advanced**
   - Allow comments toggle
   - Pin to top toggle
   - Bahasa (id/en)

#### Right rail (always visible)

- **Revision history** (list 10 latest, click to preview/restore)

### 2.4 Media Library (`/dashboard/blog-platform/media`)

**Layout:** Grid 4-col + filter sidebar.

- **Toolbar:** [Upload] (drag-drop area) | Search | Filter (image/video/audio/doc) | Sort
- **Grid item:** Thumbnail + filename (truncated) + size + date + checkbox (bulk select)
- **Click item:** Modal detail — preview besar, alt text edit, caption edit, copy URL, copy markdown, copy embed code, delete
- **Bulk:** Delete selected
- **Storage indicator:** "Used 234MB / 5GB" (per-blog quota)

### 2.5 Settings — Profile (`/settings/profile`)

Form:
- Avatar (upload + preview circular)
- Cover (upload + preview banner)
- Nama tampilan (override SSO name)
- Tagline blog (255 char)
- Deskripsi blog (markdown ringan, 1000 char)
- Bio author (500 char)
- Lokasi
- Sosmed: Twitter / Instagram / LinkedIn / GitHub / ORCID / Scholar / Website
- Bahasa default
- Timezone
- Toggle: Show fakultas badge / Show prodi badge

### 2.6 Settings — Subdomain (`/settings/subdomain`)

**Untuk mahasiswa:** Display read-only "{NIM}-mhs.blog.unila.ac.id" + tombol "Buka blog saya".

**Untuk staf/dosen:**
- Status klaim saat ini (kalau sudah klaim: tampilkan)
- Form klaim baru:
  - Input subdomain → real-time validation (4 layer)
  - Hijau: tersedia
  - Kuning: borderline (perlu manual review)
  - Merah: ditolak (alasan: format/reserved/taken/impersonation)
  - Suggestion list (kalau bentrok)
  - Field "Alasan" (kalau borderline)
  - [Submit Klaim]
- Riwayat klaim (table kalau pernah)
- Cooldown info: "Bisa rename lagi pada 2026-08-13" (kalau dalam cooldown)

### 2.7 Settings — Theme (`/settings/theme`)

**Layout:** Picker template + customizer + live preview iframe.

- **Template picker:** Card grid (modern, minimalist) — click to select
- **Customizer panel:**
  - Warna primer (color picker)
  - Warna sekunder
  - Warna aksen
  - Font heading (dropdown: Inter/Source Serif/Poppins/Roboto/Playfair)
  - Font body (dropdown)
  - Layout (single-column / sidebar-right / sidebar-left)
  - Logo upload (opsional)
  - Footer links repeater
- **Live preview:** iframe `https://{subdomain}.blog.unila.ac.id?_preview=...` (atau pakai dev tenant query param)
- **Action:** [Reset Default] [Save Changes]

### 2.8 Settings — SEO (`/settings/seo`)

- Default OG image (upload)
- Default meta description (160 char)
- Google Search Console verification meta tag
- Bing Webmaster verification
- Twitter handle (untuk twitter:creator)

### 2.9 Analytics (`/dashboard/blog-platform/analytics`)

**Tabs:** Overview | Posts | Audience (P2) | Referrer (P2)

#### Overview
- Total view (lifetime, 90d, 30d, 7d) — comparison + sparkline
- Total like, komentar (P2)
- Avg reading time
- Bounce-equivalent (P2)
- Chart: Views per day last 30d
- Chart: Posts published per month last 12m

#### Posts
- Table: post + view + like + komentar + ctr (kalau ada referer)
- Sort by any column
- Filter by status

### 2.10 Komentar (P2 — placeholder MVP)

Halaman placeholder dengan info "Fitur komentar akan tersedia di phase 2".

---

## 3. Halaman Admin (role-gated)

### 3.1 Klaim Subdomain (`/admin/klaim`)

**Filter:** Status (manual_review / approved / rejected)

Table:
- ID Klaim | Pemohon (nama+role) | Subdomain diminta | Validation result (✓✓✓✗ visual) | Alasan | Tgl klaim | Actions (Detail / Approve / Reject)

Modal detail:
- Profile pemohon (foto, NIP/NIM, fakultas, prodi)
- Validasi 4 layer breakdown
- Alasan dari pemohon
- Suggestion (kalau bentrok)
- Catatan moderator textarea
- [Approve] [Reject + alasan]

SLA badge: "Sudah pending 18 jam dari 24h SLA"

### 3.2 Featured Posts (`/admin/featured`)

- Drag-drop reorder list featured (max 10)
- Search & add post (autocomplete judul)
- Set valid_until (opsional, auto-remove after date)
- Toggle visible/hidden

### 3.3 Reserved Words (`/admin/kata-terlarang`)

- Table: kata | kategori (system/role/brand/offensive) | keterangan | actions
- Bulk import CSV
- Add new

### 3.4 Manajemen Blog (`/admin/blogs`)

- Table semua blog: subdomain | nama | role | jumlah post | jumlah view | aktif/suspended | actions
- Filter, search, sort
- Action: Suspend / Verify / Soft delete

### 3.5 Kategori (`/admin/kategori`)

CRUD kategori_post: slug, nama, deskripsi, icon, warna, urutan, aktif.

### 3.6 Templates (`/admin/templates`)

List templates available + tombol upload custom (P2 placeholder).

### 3.7 Audit Log (`/admin/audit`)

- Filter: pengguna, aksi, entitas, range tanggal
- Table: tgl | pengguna | aksi | entitas | id_entitas | detail (modal JSON view) | IP

---

## 4. Komponen Shared (`shared/components/blog-platform/`)

| Komponen | Tujuan |
|---|---|
| `<TipTapEditor>` | Wrapper TipTap dgn toolbar default + custom extensions |
| `<TipTapToolbar>` | Toolbar (sticky) |
| `<MediaPicker>` | Modal pick existing media atau upload baru |
| `<TagInput>` | Autocomplete + create-on-enter |
| `<KategoriDropdown>` | Single-select dropdown |
| `<StatusBadge>` | Color-coded badge for post status |
| `<VisibilityIcon>` | Icon untuk visibility |
| `<RevisionList>` | List revision dgn restore action |
| `<SubdomainValidator>` | Real-time validator (4 layer) untuk input subdomain |
| `<ThemePreviewFrame>` | iframe live preview |
| `<ColorPicker>` | Wrapper react-colorful |
| `<UploadDropzone>` | Drag-drop upload via react-dropzone |

---

## 5. Service Layer (`lib/services/blog-platform/`)

```typescript
// blogService.ts — wrapper untuk endpoint /api/v1/me/blog
// postService.ts — CRUD post
// mediaService.ts — media library
// kategoriService.ts — public list + admin CRUD
// klaimService.ts — subdomain claim + check
// analyticsService.ts — analytics queries
// adminService.ts — admin endpoints
```

Semua via Axios instance dgn JWT auto-inject (interceptor existing pattern).

Endpoint config tambah di `shared/api/endpoints.ts`:

```typescript
export const BLOG_SERVICE = {
  // public
  trending: "/blog-service/api/v1/public/trending",
  // me
  myBlog: "/blog-service/api/v1/me/blog",
  myPosts: "/blog-service/api/v1/me/posts",
  // admin
  adminBlogs: "/blog-service/api/v1/admin/blogs",
  // dst
};
```

---

## 6. Refactor `manajemen-konten` → `manajemen-apps/manajemen-konten`

### Path changes

| Old | New |
|---|---|
| `frontend/src/app/dashboard/manajemen-konten/*` | `frontend/src/app/dashboard/manajemen-apps/manajemen-konten/*` |
| `frontend/src/lib/services/manajemen-konten/*` | (tetap, no change — service path tidak relevan ke URL) |
| `frontend/src/shared/components/manajemen-konten/*` | (tetap) |

### Update referensi

- Semua link/redirect di app code yg `/dashboard/manajemen-konten` → `/dashboard/manajemen-apps/manajemen-konten`
- `pdut.man_akses.aplikasi` row dgn slug `manajemen-konten` — update kolom URL kalau ada
- Sidebar.tsx (kalau nge-render menu langsung)

### Manajemen Apps shell

`dashboard/manajemen-apps/page.tsx` — landing dengan card grid:
- Card "Manajemen Konten" → `/dashboard/manajemen-apps/manajemen-konten`
- Card "Manajemen Akses" (link ke existing `/dashboard/manajemen-akses` — tidak dipindah, just cross-link)
- Card "Manajemen Pengguna" (placeholder)
- Card "Manajemen Aplikasi" (placeholder)
- Card "Manajemen Notifikasi" (placeholder)

`dashboard/manajemen-apps/config/menuConfig.tsx`:
```
Manajemen Apps
├── 🏠 Dashboard
├── 📝 Manajemen Konten
│   ├── Pengumuman
│   ├── Berita
│   ├── Artikel (deprecated → migrate ke blog)
│   ├── Semua Konten
│   ├── Kategori
│   └── Broadcast Notifikasi
├── 🔐 Manajemen Akses (link)
└── (placeholder lain)
```

---

## 7. Demo Dummy Data Strategy (MVP)

Karena backend belum ready, semua page MVP pakai **mock data inline** (atau di `lib/services/blog-platform/_mock.ts`):

```typescript
// lib/services/blog-platform/_mock.ts
export const MOCK_BLOG = { id_blog: '...', subdomain: '2117051070-mhs', nm_blog: 'Catatan Mizar', ... };
export const MOCK_POSTS = [ {...}, {...} ];
export const MOCK_KATEGORI = [ {...} ];
```

Toggle via env `NEXT_PUBLIC_BLOG_USE_MOCK=true`. Setelah backend ready, ganti via:

```typescript
const data = process.env.NEXT_PUBLIC_BLOG_USE_MOCK === 'true' ? MOCK_POSTS : await postService.list();
```
