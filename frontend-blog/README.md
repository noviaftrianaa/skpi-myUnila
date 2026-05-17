# myUnila Frontend Blog

Public blog platform Universitas Lampung — hosting `blog.unila.ac.id` (apex aggregator) + `*.blog.unila.ac.id` (per-user tenant blog).

Bagian dari MyUnila monorepo. Lihat `docs/blog-platform/` untuk plan lengkap.

## Stack

- Next.js 15 App Router + React 19 + TypeScript
- Tailwind CSS 3.4 + dark mode (next-themes)
- ISR / SSG untuk SEO
- Hostname-based routing via middleware (apex vs tenant)

## Dev Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Server di **http://localhost:3002**.

### Test apex (default)
- http://localhost:3002 — homepage
- http://localhost:3002/search?q=next - search
- http://localhost:3002/kategori/teknologi
- http://localhost:3002/trending
- http://localhost:3002/tentang

### Test tenant subdomain (di lokal)

**Opsi 1 (recommended):** Edit `C:\Windows\System32\drivers\etc\hosts`:

```
127.0.0.1 blog.local
127.0.0.1 demo-mhs.blog.local
127.0.0.1 rektor-staf.blog.local
127.0.0.1 mizar-dosen.blog.local
```

Set env: `NEXT_PUBLIC_APEX_HOST=blog.local`. Akses:
- `http://blog.local:3002` — apex
- `http://demo-mhs.blog.local:3002` — tenant
- `http://rektor-staf.blog.local:3002` — tenant

**Opsi 2 (query param fallback):**
- `http://localhost:3002?tenant=demo-mhs` — render sebagai tenant
- `http://localhost:3002/posts/intro-nextjs?tenant=demo-mhs`

## Build Production

```bash
npm run build
npm start
```

Standalone output di `.next/standalone/`.

## Docker

```bash
docker build -t myunila-frontend-blog .
docker run -p 3002:3002 \
  -e NEXT_PUBLIC_BLOG_API=https://api.blog.unila.ac.id \
  -e NEXT_PUBLIC_USE_MOCK=true \
  myunila-frontend-blog
```

## Mock Data

Selama backend belum ready, set `NEXT_PUBLIC_USE_MOCK=true`. Mock data di `src/lib/_mock/`.

Setelah backend siap, set `NEXT_PUBLIC_USE_MOCK=false` dan `NEXT_PUBLIC_BLOG_API` ke URL Kong/nginx.

## Struktur

```
src/
├── middleware.ts           # hostname-based routing (apex vs tenant)
├── app/
│   ├── (apex)/             # blog.unila.ac.id
│   ├── (tenant)/           # *.blog.unila.ac.id
│   └── api/health/         # health check
├── lib/
│   ├── api.ts              # fetch wrapper
│   ├── tenant.ts           # extract subdomain
│   ├── utils.ts            # cn helper
│   └── _mock/              # dummy data
├── shared/components/      # reusable UI
└── types/                  # TypeScript types
```

## Lihat juga

- `docs/blog-platform/00-overview.md` — decision log
- `docs/blog-platform/06-frontend-public.md` — UI/UX spec
- `docs/blog-platform/07-deployment.md` — deployment vm9-blog
