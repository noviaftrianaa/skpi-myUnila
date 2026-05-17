# blog-service

Go (Fiber) REST API untuk Blog Platform myUnila. Port default **8091**.

## Stack
- Go 1.23 + Fiber v2
- PostgreSQL via `jmoiron/sqlx` + `lib/pq`
- Database: `blog_unila` (dedicated, schema di `data-model/script/postgresql/blog/`)

## Setup Local

```bash
# 1. Deploy schema + seed master + demo (sekali)
psql -d blog_unila -f ../../data-model/script/postgresql/blog/01-blog_unila_v1.0_fresh.sql
psql -d blog_unila -f ../../data-model/script/postgresql/blog/02-blog_unila_v1.0_seed.sql
psql -d blog_unila -f ../../data-model/script/postgresql/blog/03-blog_unila_v1.0_demo.sql

# 2. Run service
cp .env.example .env
go mod tidy
go run ./cmd/api
```

## Endpoints (MVP — Read only)

### Health
- `GET /health` · `GET /healthz`

### Blogs
- `GET /api/v1/blogs?limit=20&offset=0&search=&role=MHS&order=popular&aktif=1`
- `GET /api/v1/blogs/by-subdomain/:subdomain`
- `GET /api/v1/blogs/:id`

### Posts
- `GET /api/v1/posts?status=published&subdomain=...&kategori=...&search=...&order=trending&limit=20`
- `GET /api/v1/posts/:id`
- `GET /api/v1/posts/by-slug/:subdomain/:slug`
- `GET /api/v1/posts/status-count?id_blog=<uuid>`

### Kategori
- `GET /api/v1/kategori?aktif=1`

### Tag
- `GET /api/v1/tag?limit=100&aktif=1`
- `GET /api/v1/tag/search?q=react&limit=10`

## Write Endpoints (Sprint 6+)

CRUD post, klaim subdomain, upload media, dll akan ditambahkan setelah MVP read-side stable.

## Kong Route

Add ke Kong config (decK declarative):

```yaml
services:
  - name: blog-service
    url: http://blog:8091
    routes:
      - name: blog-service-route
        paths: ["/blog-service"]
        strip_path: true
```

Resulting public URL via Kong: `http://localhost:9800/blog-service/api/v1/...`

## Docker

```bash
docker build -t myunila-blog-service .
docker run --rm -p 8091:8091 --env-file .env myunila-blog-service
```
