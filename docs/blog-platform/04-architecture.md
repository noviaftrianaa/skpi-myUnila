# Blog Platform myUnila — Architecture

---

## 1. High-Level Diagram

```
                          ┌──────────────────────────────────┐
                          │    DNS *.blog.unila.ac.id A→VM9   │
                          │    DNS blog.unila.ac.id  A→VM9    │
                          └─────────────────┬────────────────┘
                                            │
                                            ▼
            ┌───────────────────────────────────────────────────────┐
            │  VM9-blog (192.168.120.49)                            │
            │  ┌─────────────────────────────────────────────────┐  │
            │  │ Nginx (80/443)                                  │  │
            │  │  ├── *.blog.unila.ac.id → frontend-blog:3002   │  │
            │  │  ├── blog.unila.ac.id   → frontend-blog:3002   │  │
            │  │  └── api.blog.unila.ac.id → blog-service:8091  │  │
            │  └─────────────────────────────────────────────────┘  │
            │  ┌──────────────────┐  ┌──────────────────────────┐  │
            │  │ frontend-blog    │  │ blog-service             │  │
            │  │ (Next.js 15)     │  │ (Go + Fiber)             │  │
            │  │ Port: 3002       │  │ Port: 8091               │  │
            │  │                  │  │                          │  │
            │  │ middleware:      │  │ apps/                    │  │
            │  │  host →          │  │  ├── post                │  │
            │  │   apex|tenant    │  │  ├── blog                │  │
            │  │                  │  │  ├── kategori            │  │
            │  └──────────────────┘  │  ├── tag                 │  │
            │  ┌──────────────────┐  │  ├── media               │  │
            │  │ PostgreSQL 16    │  │  ├── theme               │  │
            │  │ (blog_unila)     │  │  ├── klaim_subdomain     │  │
            │  │ Port: 5432       │  │  ├── komentar (P2)       │  │
            │  └──────────────────┘  │  ├── analytics           │  │
            │  ┌──────────────────┐  │  └── moderation          │  │
            │  │ Redis            │  └──────────┬───────────────┘  │
            │  │ Port: 6379       │             │                  │
            │  │ (trending cache, │             │ external svc:    │
            │  │  session)        │             │  - MinIO (vmX)   │
            │  └──────────────────┘             │  - Meilisearch   │
            │                                   │  - SMTP relay    │
            └───────────────────────────────────┼──────────────────┘
                                                │
                                                ▼
                          ┌─────────────────────────────────────┐
                          │  Kong Gateway (vm1: 192.168.120.41) │
                          │  Routes: /blog-service/*            │
                          │  Auth: JWT HS256 (shared dgn        │
                          │        myunila portal)              │
                          └─────────────────┬───────────────────┘
                                            │
                          ┌─────────────────┴────────────────┐
                          │                                  │
                          ▼                                  ▼
                ┌──────────────────┐              ┌──────────────────┐
                │ frontend (3000)  │              │ pdut SQL Server  │
                │ MyUnila Portal & │              │ (192.168.123.119)│
                │ Dashboard Admin  │ ──cross-DB──▶│ man_akses,       │
                │                  │   resolve    │ siakadu, pdrd    │
                │ /dashboard/      │              └──────────────────┘
                │  blog-platform/  │
                └──────────────────┘
```

---

## 2. Backend (`blog-service`)

### 2.1 Stack

| Layer | Tech |
|---|---|
| Language | Go 1.24+ |
| Framework | Fiber v2 |
| DB driver | sqlx + `lib/pq` (atau `jackc/pgx/v5/stdlib`) |
| Validation | go-playground/validator |
| JWT | golang-jwt/jwt/v5 |
| Logger | Fiber default + structured (slog) |
| Migration | (manual SQL atau `golang-migrate` opsional) |
| Search | Meilisearch HTTP client |
| Storage | MinIO Go client (S3-compatible) |
| Cache | go-redis/v9 |

### 2.2 Layout

```
backend/blog-service/
├── cmd/api/main.go                # entry point, init Fiber, register modules
├── internal/
│   ├── config/config.go           # env loader
│   ├── middleware/jwt.go          # Kong-trust JWT parser
│   ├── middleware/scope.go        # author / admin scope check
│   └── shared/
│       ├── response.go            # success/error response helpers
│       ├── pagination.go
│       └── slug.go                # slugify utility
├── external/
│   ├── database/postgres.go       # pgx/sqlx connection
│   ├── storage/minio.go           # MinIO client
│   ├── search/meilisearch.go      # Meilisearch client
│   └── cache/redis.go
├── apps/
│   ├── post/
│   │   ├── entity.go              # struct Post + Request/Response DTO
│   │   ├── repository.go          # query SQL
│   │   ├── service.go             # business logic
│   │   ├── handler.go             # Fiber handlers
│   │   └── router.go              # route registration
│   ├── blog/
│   ├── kategori/
│   ├── tag/
│   ├── media/
│   ├── theme/
│   ├── klaim_subdomain/
│   ├── komentar/    # P2 stub
│   ├── analytics/
│   └── moderation/
├── go.mod
├── go.sum
├── Dockerfile
└── .env.example
```

### 2.3 Module Pattern (mengikuti `manajemen-konten-service`)

Tiap modul punya 5 file (`entity`, `repository`, `service`, `handler`, `router`). `Init(group, db, deps)` function di-call dari `cmd/api/main.go`.

### 2.4 Auth Flow

1. User login MyUnila portal → auth-service issue JWT.
2. JWT carry: `{id_pengguna_pdut, peran[], scope[], exp}`.
3. Frontend pakai JWT di header `Authorization: Bearer <token>`.
4. Kong verify signature (`/blog-service/*` route).
5. Backend `internal/middleware/jwt.go` parse claim, set `c.Locals("user", claims)`.
6. Per-endpoint middleware: `requireAuth()` / `requireScope("admin")`.

---

## 3. Frontend Public (`frontend-blog/`)

### 3.1 Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 + shadcn/ui (selektif) |
| Editor display | TipTap renderer (read-only) atau langsung HTML render |
| Search UI | InstantSearch.js (Meilisearch client) |
| Icons | react-icons + lucide-react |
| Charts | recharts (untuk public stats kalau ada) |
| Theme dark mode | next-themes |
| ISR / SSG | App Router `revalidate: 300` (5 min) untuk post pages |

### 3.2 Layout

```
frontend-blog/
├── src/
│   ├── app/
│   │   ├── (apex)/                # blog.unila.ac.id
│   │   │   ├── page.tsx           # homepage Google-style
│   │   │   ├── search/page.tsx
│   │   │   ├── kategori/[slug]/page.tsx
│   │   │   ├── tag/[slug]/page.tsx
│   │   │   ├── fakultas/[kode]/page.tsx
│   │   │   ├── trending/page.tsx
│   │   │   ├── tentang/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (tenant)/              # *.blog.unila.ac.id
│   │   │   ├── page.tsx           # blog homepage (post grid)
│   │   │   ├── posts/[slug]/page.tsx
│   │   │   ├── about/page.tsx
│   │   │   ├── archive/page.tsx
│   │   │   └── layout.tsx         # apply per-blog theme
│   │   ├── api/
│   │   │   └── revalidate/route.ts # webhook revalidate dari backend
│   │   └── globals.css
│   ├── middleware.ts              # KEY: hostname → route group
│   ├── lib/
│   │   ├── api.ts                 # fetch wrapper (NEXT_PUBLIC_BLOG_API)
│   │   ├── seo.ts                 # generateMetadata helpers
│   │   └── tenant.ts              # extract subdomain from host
│   ├── shared/
│   │   ├── components/
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostReader.tsx
│   │   │   ├── AuthorHeader.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── TagCloud.tsx
│   │   │   └── ThemeProvider.tsx
│   │   └── themes/
│   │       ├── modern/             # default theme
│   │       └── minimalist/
│   └── types/
├── public/
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── Dockerfile
```

### 3.3 Hostname Routing (Critical)

`src/middleware.ts`:

```typescript
import { NextResponse, type NextRequest } from "next/server";

const APEX_HOST = "blog.unila.ac.id";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const cleanHost = host.split(":")[0]; // strip port
  const url = req.nextUrl.clone();

  // Apex: blog.unila.ac.id → rewrite to /(apex)/...
  if (cleanHost === APEX_HOST || cleanHost === "www.blog.unila.ac.id") {
    url.pathname = `/(apex)${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Tenant: {sub}.blog.unila.ac.id → rewrite to /(tenant)/... + set header
  if (cleanHost.endsWith(".blog.unila.ac.id")) {
    const subdomain = cleanHost.replace(".blog.unila.ac.id", "");
    url.pathname = `/(tenant)${url.pathname}`;
    const res = NextResponse.rewrite(url);
    res.headers.set("x-tenant-subdomain", subdomain);
    return res;
  }

  // Localhost dev: ?tenant=2117051070-mhs query param fallback
  const tenantQuery = url.searchParams.get("tenant");
  if (tenantQuery) {
    url.pathname = `/(tenant)${url.pathname}`;
    const res = NextResponse.rewrite(url);
    res.headers.set("x-tenant-subdomain", tenantQuery);
    return res;
  }

  // Default: apex
  url.pathname = `/(apex)${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"],
};
```

In tenant pages, read header:

```typescript
// src/app/(tenant)/page.tsx
import { headers } from "next/headers";

export default async function TenantHome() {
  const subdomain = (await headers()).get("x-tenant-subdomain");
  const blog = await fetchBlog(subdomain);
  // render with blog.theme_config_json
}
```

### 3.4 Theme System

Per-blog `theme_config_json`:

```json
{
  "kode_template": "modern",
  "warna_primer": "#3B82F6",
  "warna_sekunder": "#1E40AF",
  "warna_aksen": "#F59E0B",
  "font_heading": "Inter",
  "font_body": "Source Serif Pro",
  "layout": "single-column",
  "header_logo_url": null,
  "footer_links": [
    { "label": "GitHub", "url": "https://github.com/..." }
  ]
}
```

Frontend tenant layout:
- Load theme component dari `src/shared/themes/{kode_template}/`
- Inject CSS variables dari config (Tailwind arbitrary values)
- Server-render dengan `generateMetadata` untuk SEO

### 3.5 ISR Strategy

| Page | Revalidate |
|---|---|
| Apex homepage | 300s (5 min) |
| Apex trending | 600s (10 min) |
| Tenant homepage | 600s (10 min) |
| Tenant single post | 3600s (1 hour) — invalidated via webhook saat author edit |
| Search results | no-cache (dinamis) |
| Sitemap | 86400s (1 day) |

Webhook revalidation: backend POST ke `/api/revalidate?secret=...&path=...` saat post update.

---

## 4. Frontend Admin/Author (`frontend/dashboard/blog-platform/`)

Hidup di `frontend/` existing. Pattern:

- Per-modul `config/menuConfig.tsx`
- Layout dgn `useRequireAppAccess({ appKey: "blog-platform" })` (perlu seed di `pdut.man_akses.aplikasi`)
- Service di `lib/services/blog-platform/blogService.ts`
- Endpoint config di `shared/api/endpoints.ts` → tambah `BLOG_SERVICE`

Detail UI di `05-frontend-dashboard.md`.

---

## 5. Data Flow Examples

### 5.1 Penulis publish post

```
User di MyUnila dashboard /blog-platform/posts/[id]/edit
  → klik "Publish"
  → frontend POST /api/v1/me/posts/:id/status {status:'published'}
  → Kong verify JWT, forward ke blog-service:8091
  → service.PublishPost():
      1. Update post: status=published, tgl_terbit=NOW()
      2. Create revision (catatan='publish')
      3. Update blog.jumlah_post (trigger)
      4. Kirim ke Meilisearch index blog_posts
      5. Invalidate Redis cache (trending, latest)
      6. Webhook ke frontend-blog: revalidate /(tenant)/posts/[slug]
      7. Audit log
  → response success
  → frontend toast & redirect ke posts list
```

### 5.2 Pembaca buka per-user blog

```
GET https://2117051070-mhs.blog.unila.ac.id/posts/intro-nextjs-app-router
  → Cloudflare cache check (HIT? return cached, MISS? continue)
  → VM9 Nginx → frontend-blog:3002
  → Next.js middleware.ts:
      - host = "2117051070-mhs.blog.unila.ac.id"
      - rewrite to /(tenant)/posts/intro-nextjs-app-router
      - set header x-tenant-subdomain=2117051070-mhs
  → app/(tenant)/posts/[slug]/page.tsx (RSC):
      - fetch /api/v1/public/blogs/2117051070-mhs (cached ISR 1h)
      - fetch /api/v1/public/blogs/2117051070-mhs/posts/intro-nextjs-app-router
      - render dgn theme dari blog.theme_config_json
  → response HTML
  → client-side: setelah 3 detik (debounce reading), POST /view tracking
```

### 5.3 Search di apex

```
User di blog.unila.ac.id ketik "next.js routing"
  → frontend-blog client-side: instant search ke Meilisearch
      (langsung via NEXT_PUBLIC_MEILI_HOST + search-only key)
  → ATAU server-side: GET /api/v1/public/search?q=...
  → results render
```

---

## 6. Caching Strategy

| Layer | Cache | TTL | Invalidation |
|---|---|---|---|
| Cloudflare CDN | Public pages (apex + tenant) | 5 min — 1 hour | Purge URL via API saat post update |
| Next.js ISR | Same | Per page revalidate | Webhook revalidate from backend |
| Redis (backend) | Trending list, top authors, top categories, blog metadata | 10 min — 1 hour | Cron rebuild + manual on event |
| Browser | Static assets (images, fonts) | 1 year (immutable filename) | Hash in filename |

---

## 7. Security

| Layer | Mechanism |
|---|---|
| Auth | JWT HS256 dari auth-service MyUnila, verify di Kong |
| CORS | Allow `myunila.unila.ac.id`, `*.unila.ac.id`, dev `localhost:3000/3002` |
| Rate limit | Kong plugin per-route |
| XSS (post content) | Sanitize HTML dari TipTap output via DOMPurify (server-side) sebelum simpan |
| SQL injection | Parameterized queries via sqlx (no string concat) |
| File upload | Whitelist MIME, max size, scan kalau perlu (clamav P2) |
| Subdomain hijack | Reserved words check, anti-impersonation layer 4 |
| Password post | bcrypt hash, plaintext never stored |
| Audit | Setiap aksi destructive logged ke `audit.jejak_audit` |
| GDPR-like | Soft delete + 30 hari grace + hard delete cron, export user data API (P3) |

---

## 8. Performance Targets

| Metric | Target |
|---|---|
| TTFB apex homepage | < 200ms (cached) |
| TTFB tenant post page | < 300ms (ISR) |
| LCP | < 2.5s (75th percentile, mobile 3G) |
| FID / INP | < 100ms |
| CLS | < 0.1 |
| Search result render | < 500ms |
| Editor save (auto) | < 1s p95 |
| Upload image | < 3s p95 (5MB image) |

---

## 9. Observability (P2)

- Prometheus metrics di `blog-service /metrics`
- Logs via Loki / Promtail (sudah ada di vm4-monitoring)
- Grafana dashboard: request rate, error rate, p95 latency, DB pool, Redis hit ratio
- Alert: 5xx rate > 1%, p95 > 1s, DB connection saturation
