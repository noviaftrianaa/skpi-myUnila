# MyUnila - Project Context for Claude Code

## Project Overview

MyUnila adalah platform digital terintegrasi Universitas Lampung (Unila) yang menggabungkan data akademik, kepegawaian, keuangan, dan monitoring web dalam satu sistem.

## Architecture

**Monorepo** dengan microservices:

```
my-unila/
├── frontend/          → Next.js 15 + TypeScript + Tailwind CSS
├── backend/
│   ├── auth-service/       → Laravel (PHP) - Autentikasi & SSO
│   ├── dashboard-service/  → Laravel (PHP) - Dashboard pimpinan
│   ├── public-service/     → Laravel (PHP) - Portal publik & Meilisearch
│   ├── sister-service/     → Go + Fiber - Data dosen (SISTER API)
│   ├── feeder-service/     → Go + Fiber - Data mahasiswa (Feeder DIKTI)
│   ├── myunila-service/    → Go + Fiber - Portal MyUnila
│   ├── api-service/        → Go + Fiber - API gateway internal
│   ├── keuangan-service/   → Go + Fiber - Data keuangan
│   └── monitoring/         → Go + Fiber - Web monitoring & threats
├── data-model/        → SQL Server scripts & PowerDesigner models
├── deployment/        → Docker Compose, Ansible, Kong configs
└── docs/              → Documentation
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, Zustand, TanStack Query, ECharts |
| Backend PHP | Laravel 11, PHP 8.3, SQL Server (sqlsrv driver) |
| Backend Go | Go 1.24+, Fiber v2, sqlx, go-mssqldb |
| Database | Microsoft SQL Server (external: 192.168.123.119) |
| Search | Meilisearch |
| Cache | Redis |
| Gateway | Kong API Gateway |
| Deployment | Docker, Docker Compose, Ansible |

## Database

- **Engine:** Microsoft SQL Server
- **Main DB:** `pdut` (shared across services)
- **PHP driver:** `sqlsrv` (DB_CONNECTION=sqlsrv)
- **Go driver:** `github.com/microsoft/go-mssqldb`
- **Schema files:** `data-model/script/sqlserver/`

## Key Conventions

### Frontend (Next.js)
- App Router (`src/app/`)
- Service layer di `src/lib/services/`
- Shared components di `src/shared/components/`
- API endpoints config di `src/shared/api/endpoints.ts`
- State management: Zustand stores
- HTTP client: Axios

### Backend PHP (Laravel)
- Repository pattern: `app/Repositories/`
- Service layer: `app/Services/`
- Routes: `routes/api.php`
- Entry point: Controller → Service → Repository → DB

### Backend Go (Fiber)
- Entry point: `cmd/api/main.go`
- Domain modules: `apps/{module}/` (controller, service, repository, router)
- Config: `internal/config/`
- Shared packages: `pkg/`
- Pattern: Router → Controller → Service → Repository → DB

## Deployment (VM5 Staging)

Semua service jalan di VM5 (192.168.120.45) sebagai Docker containers:

```bash
# Rebuild specific service
cd /var/www/my-unila/deployment/production/vm5-staging
./scripts/rebuild-service.sh <service>

# Available: postgres, redis, meilisearch, kong, frontend, nginx,
#            auth, dashboard, public, sister, feeder, myunila,
#            api, keuangan, monitoring

# Check status
docker ps --format "table {{.Names}}\t{{.Status}}" | grep staging

# View logs
docker logs -f myunila-<service>-staging

# Exec into container
docker exec -it myunila-<service>-staging sh
```

## Kong API Routes

All API calls go through Kong Gateway (port 9800):

| Path | Service | Upstream |
|------|---------|----------|
| /auth-service | Auth | nginx:80 |
| /public-service | Public | nginx:81 |
| /dashboard-service | Dashboard | nginx:82 |
| /sister-service | Sister | sister:8083 |
| /feeder-service | Feeder | feeder:8084 |
| /api-service | API | api:8085 |
| /myunila-service | MyUnila | myunila:8086 |
| /keuangan-service | Keuangan | keuangan:8088 |
| /webmon-service | Monitoring | monitoring:8089 |

## Important Notes

- VM5 staging shares **production database** (pdut) — JANGAN jalankan migration atau seeder yang destructive
- `pddikti:sync` dan `pddikti:sync-desc` adalah command yang WRITE ke DB — jangan jalankan di VM5
- Scheduler (`search:import`) aman karena read-only (sync ke Meilisearch)
- Setelah edit code, rebuild container: `./scripts/rebuild-service.sh <service>`
