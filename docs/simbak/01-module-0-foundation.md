# Module 0: Foundation (Setup & Scaffold)

## Status: DONE

## Backend Files (`backend/bak-service/`)

| # | File | Keterangan | Status |
|---|------|-----------|--------|
| 1 | `composer.json` | Laravel 11, PHP 8.2, flysystem-aws-s3-v3, firebase/php-jwt | Done |
| 2 | `config/database.php` | Dual DB: pgsql (simbak) + sqlsrv (pdut) | Done |
| 3 | `config/filesystems.php` | Disk minio: S3 driver, VM7 | Done |
| 4 | `.env.example` | PG_*, SQLSRV_*, MINIO_*, REDIS_*, JWT_SECRET | Done |
| 5 | `bootstrap/app.php` | Route api.php, middleware aliases | Done |
| 6 | `app/Http/Middleware/JwtAuthenticate.php` | JWT validation (port dari auth-service) | Done |
| 7 | `app/Http/Middleware/CheckCrudPermission.php` | Permission check (port dari auth-service) | Done |
| 8 | `app/Http/Middleware/ForceJsonResponse.php` | Force JSON response | Done |
| 9 | `app/Traits/ApiResponse.php` | successResponse, errorResponse, paginatedResponse | Done |
| 10 | `app/Repositories/BaseRepository.php` | Dual DB helpers: pgSelect, pgInsertReturning, pdutSelect | Done |
| 11 | `app/Services/MinioService.php` | upload, download, delete, getTemporaryUrl | Done |
| 12 | `app/Services/AuditService.php` | Write ke log.jejak_audit | Done |
| 13 | `app/Http/Controllers/Api/HealthController.php` | /health endpoint | Done |
| 14 | `routes/api.php` | Full route skeleton /v1 | Done |
| 15 | `Dockerfile` | php:8.2-fpm-alpine + pdo_pgsql + sqlsrv | Done |
| 16 | `docker/supervisord.conf` | PHP-FPM + queue worker | Done |

## Deployment Files

| # | File | Keterangan | Status |
|---|------|-----------|--------|
| 17 | `deployment/local/services/3-backend/docker-compose.bak.yml` | Container bak-service | Done |
| 18 | `deployment/local/deploy.sh` | Menu items 44-46 (rebuild, restart, dev rebuild) | Done |

## Frontend Files (`frontend/src/`)

| # | File | Keterangan | Status |
|---|------|-----------|--------|
| 19 | `lib/api/bakClient.ts` | Axios client + JWT interceptor | Done |
| 20 | `app/dashboard/sim-bak/layout.tsx` | useRequireAuth() wrapper | Done |
| 21 | `app/dashboard/sim-bak/page.tsx` | Dashboard landing (placeholder) | Done |
| 22 | `app/dashboard/sim-bak/config/menuConfig.tsx` | Sidebar menu config (9 items) | Done |
| 23 | `lib/services/sim-bak/types.ts` | TypeScript interfaces (semua entity) | Done |
| 24 | `lib/services/sim-bak/simBakService.ts` | Service skeleton (semua API calls) | Done |

## Database

- Schema SQL: `data-model/script/postgresql/simbak_v1.0_fresh.sql`
- 15 tabel, 4 schema, 42 index, 24 trigger
- Execute manual di PostgreSQL server

## Key Decisions

- **Raw SQL** (`DB::select()`) over Eloquent — ikut pattern existing services
- **JWT validation only** — token diterbitkan auth-service, bak-service validasi saja
- **Dual DB** — PostgreSQL untuk transactional, SQL Server pdut untuk reference data
- **`gen_random_uuid()`** — built-in PostgreSQL 13+, tidak perlu extension uuid-ossp
- **MinIO via S3 driver** — `league/flysystem-aws-s3-v3` dengan `use_path_style_endpoint`
- **Audit session context** — `SET LOCAL simbak.id_pengguna` dalam transaction untuk trigger
