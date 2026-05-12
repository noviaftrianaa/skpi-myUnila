# CMS Integration Plan - MyUnila Portal

> **Status**: Planning Phase
> **Last Updated**: 2026-02-14

---

## 1. Context

Universitas Lampung memiliki:
- **Google Workspace** aktif (email @unila.ac.id via Google)
- Beberapa unit sudah punya **Blogger/Blogspot**
- Portal MyUnila dengan **auth-service** (custom JWT-based SSO via `akses.unila.ac.id`)
- Kebutuhan mengelola blog/CMS per unit secara terpusat

### Temuan Kritis: SSO Bukan CAS Standar

SSO `akses.unila.ac.id` menggunakan **custom JWT-based flow**:

```
1. App redirect → akses.unila.ac.id/api/live/v1/auth/login/sso?app_key=...
2. User login di SSO
3. SSO redirect back → callback_url?token=<JWT>
4. Auth-service validate JWT (HMAC SHA256 + shared secret)
5. JWT claims: id_pengguna, username, nm_pengguna, peran_pengguna, email, dll
```

Ini berarti plugin CAS standar (WP Cassify, miniOrange CAS) **TIDAK kompatibel** langsung.

---

## 2. Perbandingan 3 Opsi CMS

| Aspek | Opsi A: Blogger + Aggregator | Opsi B: WordPress + Kong SSO | Opsi C: Custom CMS (Go Fiber) |
|-------|------------------------------|------------------------------|-------------------------------|
| **Effort** | 2-3 minggu | 4-6 minggu | 16-24 minggu |
| **Risiko hack/judol** | Hampir nol (Google infra) | Tinggi (WordPress target utama) | Rendah (custom, tidak target) |
| **Server cost** | Gratis (Google hosting) | Server + maintenance | Server |
| **SSO Integration** | Via Google Workspace (sudah ada) | Custom mu-plugin + Kong | Fully integrated (native) |
| **Staff familiarity** | Tinggi (Blogger sudah dipakai) | Sedang (WordPress umum) | Rendah (UI baru) |
| **Editor quality** | Blogger editor (basic) | Gutenberg (excellent) | Harus dibangun |
| **Plugin ecosystem** | Tidak ada | Sangat kaya | Tidak ada |
| **Data ownership** | Google (export available) | Server sendiri | Server sendiri |
| **Maintenance** | Nol | Tinggi (update, patch, security) | Sedang (custom code) |
| **Scalability** | Google handles | Manual scaling | Manual scaling |

---

## 3. Opsi A: Blogger + Aggregator (RECOMMENDED)

### Kenapa Ini Rekomendasi Utama

1. **Unila sudah pakai Google Workspace** → semua staff punya Google Account
2. **Beberapa unit sudah pakai Blogger** → tidak perlu migrasi
3. **Zero infrastructure** → tidak perlu deploy/maintain CMS server
4. **Security** → Google infra hampir tidak mungkin diinjeksi judol
5. **Fastest to implement** → hanya perlu aggregator service

### Architecture

```
┌────────────────────┐
│ Staff/Dosen        │
│ Login blogger.com  │
│ pakai @unila.ac.id │
│ (Google Workspace) │
└────────┬───────────┘
         │ Write/Edit
         ▼
┌────────────────────┐         ┌──────────────────────────┐
│ Blogger/Blogspot   │ ◀─Sync─ │ webmon-service            │
│ Per Unit:          │  (API)  │ (Go Fiber)                │
│ - fkip.blogspot    │         │                           │
│ - feb.blogspot     │         │ • Fetch Blogger API v3    │
│ - fh.blogspot      │         │ • Cache di SQL Server     │
│ - ...              │         │ • Serve ke Next.js        │
└────────────────────┘         └─────────────┬────────────┘
                                              │
                                              ▼
                               ┌──────────────────────────┐
                               │ Portal MyUnila (Next.js)  │
                               │ /berita         (public)  │
                               │ /berita/[slug]  (public)  │
                               │ /dashboard/webmon (auth)  │
                               └──────────────────────────┘
```

### Content Flow

**Menulis konten**:
```
Staff login blogger.com pakai @unila.ac.id (Google Workspace)
  → Tulis/edit post di Blogger editor
  → Publish
```

**Sync ke portal** (otomatis via cron setiap 15 menit):
```
webmon-service:
  → GET https://www.googleapis.com/blogger/v3/blogs/{blogId}/posts?key={API_KEY}
  → Parse: title, content, author, labels, images
  → Upsert ke monitoring.blog_posts_cache
  → Invalidate Redis cache
```

**Tampil di portal**:
```
User buka my.unila.ac.id/berita
  → Next.js fetch dari webmon-service (cached, unified design)
  → SEO-friendly: /berita/fkip/judul-artikel
```

### Blogger API v3 Endpoints

```
# Public read (API Key only - no user auth needed)

# Get blog info by URL
GET https://www.googleapis.com/blogger/v3/blogs/byurl
    ?url=https://blog-fkip.blogspot.com
    &key={API_KEY}

# List published posts
GET https://www.googleapis.com/blogger/v3/blogs/{blogId}/posts
    ?key={API_KEY}
    &maxResults=50
    &status=live
    &orderBy=published
    &fields=items(id,title,content,author,labels,images,published,updated,url)

# Get single post
GET https://www.googleapis.com/blogger/v3/blogs/{blogId}/posts/{postId}
    ?key={API_KEY}

# Search posts in blog
GET https://www.googleapis.com/blogger/v3/blogs/{blogId}/posts/search
    ?q=keyword
    &key={API_KEY}

# Pagination (use nextPageToken from response)
GET .../posts?key={API_KEY}&pageToken={nextPageToken}
```

**Setup**: Google Cloud Console → Enable Blogger API v3 → Create API Key
**Rate Limit**: 10,000 queries/day (free tier) - sangat cukup untuk sync 15 menit

### Database Tables (di schema `monitoring`)

Menggunakan tabel yang sudah didefinisikan di `web-monitoring-plan.md`:
- `monitoring.sites` - Registry blog (platform = 'blogger', blogger_blog_id, blogger_api_key)
- `monitoring.blog_posts_cache` - Cache konten
- `monitoring.blog_sync_logs` - Log sync

### Frontend Pages

**Public**:
- `/berita` - Grid cards: thumbnail, title, excerpt, author, date, unit badge
- `/berita/[slug]` - Full article, unified design, related posts

**Dashboard** (authenticated):
- `/dashboard/webmon/sites` - Register Blogger URLs, auto-detect blogId, sync status

### Kekurangan & Mitigasi

| Kekurangan | Mitigasi |
|------------|----------|
| Blogger editor basic (vs Gutenberg) | Sudah familiar, cukup untuk blog |
| Data di Google | Export available via Blogger API |
| Tidak bisa custom post types | Gunakan labels sebagai kategorisasi |
| Tampilan Blogspot standar | Pembaca melihat via portal (unified) |
| Tidak ada approval workflow | Kelola via Google Workspace admin |

---

## 4. Opsi B: WordPress + Kong Auto-Login SSO

### Kapan Pilih Ini
- Butuh **Gutenberg editor** (rich content editing)
- Butuh **plugin ecosystem** (forms, e-commerce, LMS, dll)
- Butuh **custom post types** dan advanced taxonomy
- Data harus **di server sendiri** (compliance)

### Architecture

```
┌────────────────────┐
│ Staff/Dosen        │
│ Login Portal       │
│ MyUnila            │
└────────┬───────────┘
         │ JWT Token
         ▼
┌────────────────────┐         ┌──────────────────────────┐
│ Kong Gateway       │────────▶│ WordPress                │
│ Port 9800          │  +Hdrs  │ (self-hosted, Docker)    │
│                    │         │                           │
│ Validate JWT       │         │ mu-plugin baca headers:  │
│ Forward headers:   │         │  X-Auth-Username          │
│  X-Auth-User-Id    │         │  X-Auth-Email             │
│  X-Auth-Username   │         │  → auto find/create user  │
│  X-Auth-Email      │         │  → wp_set_auth_cookie()   │
│  X-Auth-Name       │         │  → user masuk WP Admin    │
│  X-Auth-Role       │         │                           │
└────────────────────┘         └──────────────────────────┘
```

### SSO Flow Detail

```
1. User sudah login di portal MyUnila (punya JWT token)
2. User klik "Blog Unit Saya" di dashboard
3. Browser hit Kong: blog-fkip.unila.ac.id/wp-admin
   - Request includes JWT (cookie atau Authorization header)
4. Kong JWT plugin:
   - Validate JWT signature
   - Decode claims: username, email, name, role
   - Forward ke WordPress upstream + custom headers
5. WordPress mu-plugin (myunila-sso.php):
   - Intercept request di 'init' hook
   - Baca headers: X-Auth-Username, X-Auth-Email, X-Auth-Name, X-Auth-Role
   - Cari WP user by email → jika tidak ada, buat baru
   - Map role: dosen → editor, admin → administrator
   - wp_set_auth_cookie($user->ID)
   - User langsung masuk WP Admin tanpa form login
6. Firewall: WordPress HANYA bisa diakses lewat Kong
   - Direct access (bypass Kong) diblokir
```

### WordPress mu-plugin (Concept)

```php
<?php
/**
 * Plugin Name: MyUnila SSO Auto-Login
 * Description: Auto-login WordPress users from Kong JWT headers
 * File: wp-content/mu-plugins/myunila-sso.php
 */

add_action('init', function() {
    // Only process if Kong headers present
    $username = $_SERVER['HTTP_X_AUTH_USERNAME'] ?? null;
    $email    = $_SERVER['HTTP_X_AUTH_EMAIL'] ?? null;
    $name     = $_SERVER['HTTP_X_AUTH_NAME'] ?? null;
    $role     = $_SERVER['HTTP_X_AUTH_ROLE'] ?? null;

    if (!$username || !$email) return;

    // Skip if already logged in as correct user
    if (is_user_logged_in()) {
        $current = wp_get_current_user();
        if ($current->user_email === $email) return;
    }

    // Find or create user
    $user = get_user_by('email', $email);
    if (!$user) {
        $user_id = wp_create_user($username, wp_generate_password(), $email);
        $user = get_user_by('id', $user_id);
        wp_update_user([
            'ID' => $user_id,
            'display_name' => $name,
            'first_name' => explode(' ', $name)[0],
            'role' => map_myunila_role($role),
        ]);
    }

    // Auto-login
    wp_set_auth_cookie($user->ID, true);
    wp_set_current_user($user->ID);
});

function map_myunila_role($role) {
    $map = [
        'admin'     => 'administrator',
        'developer' => 'administrator',
        'dosen'     => 'editor',
        'tendik'    => 'editor',
        'mahasiswa' => 'author',
    ];
    return $map[strtolower($role)] ?? 'subscriber';
}
```

### Kong Route Configuration

```yaml
# Kong route untuk WordPress site
services:
  - name: blog-fkip
    url: http://wordpress-fkip:80
    routes:
      - name: blog-fkip-route
        hosts: ["blog-fkip.unila.ac.id"]
    plugins:
      - name: jwt  # Validate JWT
      - name: request-transformer  # Forward claims as headers
        config:
          add:
            headers:
              - "X-Auth-Username:$(jwt_claim.username)"
              - "X-Auth-Email:$(jwt_claim.email)"
              - "X-Auth-Name:$(jwt_claim.nm_pengguna)"
              - "X-Auth-Role:$(jwt_claim.peran_pengguna)"
```

### WordPress Docker Setup

```yaml
# docker-compose untuk WordPress per unit
services:
  wordpress-fkip:
    image: wordpress:6.5-php8.2-apache
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: wp_fkip
      WORDPRESS_DB_PASSWORD: ${WP_FKIP_DB_PASS}
      WORDPRESS_DB_NAME: wp_fkip
    volumes:
      - ./mu-plugins/myunila-sso.php:/var/www/html/wp-content/mu-plugins/myunila-sso.php
    networks:
      - myunila-network
    # NO port mapping - only accessible via Kong
```

### Pertimbangan Keamanan

1. **Firewall**: WordPress TIDAK boleh diakses langsung (hanya via Kong)
2. **Header trust**: mu-plugin hanya trust headers jika request dari Kong (check IP/secret)
3. **WordPress updates**: Harus dikelola manual (security patches)
4. **Plugin audit**: Hanya install plugin yang trusted (plugin sering jadi attack vector)
5. **Backup**: Regular backup database + wp-content
6. **WAF**: Pertimbangkan Web Application Firewall di depan Kong

### Estimasi

| Task | Effort |
|------|--------|
| mu-plugin development + testing | 3-5 hari |
| Kong route + JWT plugin config | 1-2 hari |
| WordPress Docker setup (1 pilot) | 1-2 hari |
| Firewall rules | 1 hari |
| End-to-end testing | 2-3 hari |
| Documentation | 1 hari |
| **Total pilot 1 unit** | **~2 minggu** |
| Scale ke semua unit | +1 hari per unit |

### Opsi B+: WordPress Multisite

Jika banyak unit perlu WordPress, gunakan **Multisite** agar:
- 1 instalasi WordPress = 1 mu-plugin = 1 update
- Centralized theme/plugin management
- Setiap unit = 1 subsite: `blog.unila.ac.id/fkip/`, `blog.unila.ac.id/feb/`

**Tambahan effort**: +2-3 minggu untuk migrasi existing ke Multisite

---

## 5. Opsi C: Custom CMS Service (Go Fiber)

### Kapan Pilih Ini
- Butuh **integrasi sempurna** dengan arsitektur MyUnila
- Butuh **kontrol penuh** atas fitur, UI, dan data
- Butuh **custom workflow** (approval, versioning, multi-bahasa)
- Tim development cukup besar dan long-term commitment

### Architecture

```
cms-service (Go Fiber, port 8089 or 8090)
├── apps/
│   ├── post/          # CRUD posts (title, content, excerpt, status)
│   ├── category/      # Categories & tags management
│   ├── media/         # File upload & management (images, documents)
│   ├── author/        # Author profiles (link ke auth-service users)
│   └── publish/       # Publishing workflow (draft → review → published)
├── cmd/api/main.go
├── internal/
│   ├── config/
│   ├── database/
│   ├── storage/       # File storage (local/S3/MinIO)
│   └── editor/        # Content processing (markdown/HTML sanitize)
└── uploads/           # Media storage directory
```

### Database Tables

```sql
-- Schema: monitoring (or separate cms schema)

CREATE TABLE monitoring.cms_posts (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    site_id         UNIQUEIDENTIFIER NOT NULL,  -- FK to monitoring.sites
    author_id       NVARCHAR(100)    NOT NULL,  -- user ID from auth-service
    title           NVARCHAR(500)    NOT NULL,
    slug            NVARCHAR(500)    NOT NULL,
    content         NVARCHAR(MAX)    NOT NULL,   -- HTML content
    excerpt         NVARCHAR(1000)   NULL,
    status          NVARCHAR(20)     NOT NULL DEFAULT 'draft',
        -- draft / pending_review / published / archived
    featured_image  NVARCHAR(500)    NULL,
    meta_title      NVARCHAR(200)    NULL,        -- SEO
    meta_description NVARCHAR(500)   NULL,        -- SEO
    published_at    DATETIME2        NULL,
    created_at      DATETIME2        NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2        NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_cms_posts_site FOREIGN KEY (site_id)
        REFERENCES monitoring.sites (id),
    CONSTRAINT UQ_cms_posts_slug UNIQUE (site_id, slug)
);

CREATE TABLE monitoring.cms_categories (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100)    NOT NULL,
    slug        NVARCHAR(100)    NOT NULL UNIQUE,
    description NVARCHAR(500)    NULL,
    parent_id   INT              NULL,
    sort_order  INT              NOT NULL DEFAULT 0,

    CONSTRAINT FK_cms_categories_parent FOREIGN KEY (parent_id)
        REFERENCES monitoring.cms_categories (id)
);

CREATE TABLE monitoring.cms_post_categories (
    post_id     UNIQUEIDENTIFIER NOT NULL,
    category_id INT              NOT NULL,
    PRIMARY KEY (post_id, category_id),

    CONSTRAINT FK_pc_post FOREIGN KEY (post_id)
        REFERENCES monitoring.cms_posts (id) ON DELETE CASCADE,
    CONSTRAINT FK_pc_category FOREIGN KEY (category_id)
        REFERENCES monitoring.cms_categories (id) ON DELETE CASCADE
);

CREATE TABLE monitoring.cms_media (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    site_id         UNIQUEIDENTIFIER NOT NULL,
    uploaded_by     NVARCHAR(100)    NOT NULL,
    filename        NVARCHAR(500)    NOT NULL,
    original_name   NVARCHAR(500)    NOT NULL,
    mime_type       NVARCHAR(100)    NOT NULL,
    file_size       BIGINT           NOT NULL,
    storage_path    NVARCHAR(1000)   NOT NULL,
    thumbnail_path  NVARCHAR(1000)   NULL,
    alt_text        NVARCHAR(500)    NULL,
    created_at      DATETIME2        NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_cms_media_site FOREIGN KEY (site_id)
        REFERENCES monitoring.sites (id)
);

CREATE TABLE monitoring.cms_post_revisions (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    post_id     UNIQUEIDENTIFIER NOT NULL,
    content     NVARCHAR(MAX)    NOT NULL,
    edited_by   NVARCHAR(100)    NOT NULL,
    created_at  DATETIME2        NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_cms_revisions_post FOREIGN KEY (post_id)
        REFERENCES monitoring.cms_posts (id) ON DELETE CASCADE
);
```

### API Endpoints

```
# Posts
GET    /v1/cms/posts                    # List (filter: status, site, category, author)
POST   /v1/cms/posts                    # Create draft
GET    /v1/cms/posts/:id                # Detail
PUT    /v1/cms/posts/:id                # Update
DELETE /v1/cms/posts/:id                # Soft delete (archive)
POST   /v1/cms/posts/:id/publish        # Publish
POST   /v1/cms/posts/:id/unpublish      # Unpublish (back to draft)
GET    /v1/cms/posts/:id/revisions      # Revision history

# Categories
GET    /v1/cms/categories               # List (tree structure)
POST   /v1/cms/categories               # Create
PUT    /v1/cms/categories/:id           # Update
DELETE /v1/cms/categories/:id           # Delete

# Media
GET    /v1/cms/media                    # List (filter: site, type)
POST   /v1/cms/media/upload             # Upload file(s)
DELETE /v1/cms/media/:id                # Delete file
GET    /v1/cms/media/:id/thumbnail      # Get thumbnail

# Public
GET    /v1/public/posts                 # Published posts (paginated)
GET    /v1/public/posts/:slug           # Single post by slug
GET    /v1/public/categories            # Category list
```

### Frontend: Custom Editor

Perlu membangun editor di Next.js. Opsi editor library:

| Library | Pros | Cons |
|---------|------|------|
| **TipTap** (recommended) | Modern, extensible, React-native, collaborative editing ready | Learning curve |
| **Lexical** (Meta) | Fast, lightweight, React-native | Newer, less ecosystem |
| **CKEditor 5** | Mature, feature-rich, WordPress-like feel | Heavy, license for premium |
| **Quill** | Simple, lightweight | Less extensible |

**Recommended: TipTap**
```
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image
           @tiptap/extension-link @tiptap/extension-placeholder
```

### Estimasi

| Task | Effort |
|------|--------|
| Post CRUD + API | 2-3 minggu |
| Category + Tags | 1 minggu |
| Media upload + management | 2 minggu |
| TipTap editor integration | 2-3 minggu |
| Publishing workflow | 1-2 minggu |
| SEO metadata | 1 minggu |
| Revision history | 1 minggu |
| Image processing (thumbnail, resize) | 1 minggu |
| Frontend pages (listing, detail, editor) | 2-3 minggu |
| Testing + polish | 2 minggu |
| **Total** | **16-20 minggu** |

### Kelebihan

- Full control atas UX dan fitur
- Natively integrated dengan auth-service dan RBAC
- Tidak ada dependency external (WordPress, Google)
- Custom workflow sesuai kebutuhan kampus
- Performance optimal (Go backend)

### Kekurangan

- Effort besar (4-5 bulan development)
- Harus maintain sendiri (security, updates)
- Perlu training staff untuk editor baru
- Reinventing features yang WordPress sudah punya
- Perlu dedicated developer untuk ongoing maintenance

---

## 6. Rekomendasi Bertahap

```
Timeline:

Bulan 1-2:  Opsi A → Blogger + Aggregator (recommended start)
            ├── Register existing Blogger blogs
            ├── Sync content via Blogger API v3
            ├── Tampilkan unified di portal /berita
            └── Staff tetap edit di blogger.com

Bulan 3-4:  Evaluasi kebutuhan
            ├── Apakah Blogger editor cukup?
            ├── Apakah butuh plugin ecosystem?
            └── Apakah butuh custom workflow?

Bulan 5+:   Pilih salah satu:
            ├── Tetap Blogger (jika cukup) → selesai
            ├── Opsi B: WordPress + Kong SSO (jika butuh Gutenberg/plugins)
            └── Opsi C: Custom CMS (jika butuh full control & workflow)

Long-term:  OAuth2/OIDC di auth-service
            └── Standard Identity Provider untuk semua aplikasi kampus
```

### Decision Matrix

| Jika... | Maka pilih... |
|---------|---------------|
| Konten hanya blog/berita biasa | **Opsi A** (Blogger) |
| Butuh rich content editing (Gutenberg) | **Opsi B** (WordPress) |
| Butuh plugin (forms, events, LMS) | **Opsi B** (WordPress) |
| Butuh approval workflow / versioning | **Opsi C** (Custom) |
| Data HARUS di server sendiri | **Opsi B atau C** |
| Budget dan waktu terbatas | **Opsi A** (Blogger) |
| Tim developer besar dan long-term | **Opsi C** (Custom) |

---

## 7. Quick Reference: Setup Blogger API

### Step 1: Google Cloud Console
1. Buka https://console.cloud.google.com
2. Buat project baru: "MyUnila WebMon"
3. Enable API: **Blogger API v3**
4. Create credentials: **API Key** (untuk read-only access)
5. Restrict API Key: hanya Blogger API v3, hanya dari server IP

### Step 2: Dapatkan Blog ID
```bash
# Dari URL blogspot
curl "https://www.googleapis.com/blogger/v3/blogs/byurl?url=https://NAMA.blogspot.com&key=YOUR_API_KEY"

# Response:
{
  "kind": "blogger#blog",
  "id": "1234567890123456789",  ← ini blogId
  "name": "Blog FKIP Unila",
  "url": "https://blog-fkip.blogspot.com",
  "posts": { "totalItems": 42 }
}
```

### Step 3: Register di webmon-service
```json
POST /v1/sites
{
  "url": "https://blog-fkip.blogspot.com",
  "name": "Blog FKIP Unila",
  "platform": "blogger",
  "blogger_blog_id": "1234567890123456789",
  "blogger_api_key": "YOUR_API_KEY",
  "fakultas_id": "fkip-uuid",
  "admin_name": "Admin FKIP",
  "admin_email": "admin-fkip@unila.ac.id"
}
```

### Step 4: Content otomatis sync setiap 15 menit
Atau trigger manual: `POST /v1/sites/{id}/sync-now`
