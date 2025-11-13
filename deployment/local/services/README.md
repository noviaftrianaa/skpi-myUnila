# Local Services Structure

This directory contains organized Docker Compose files for local Windows development environment.

## Structure

```
services/
├── 1-infrastructure/          # Core infrastructure services
│   ├── docker-compose.redis.yml
│   └── docker-compose.meilisearch.yml
├── 2-gateway/                 # API Gateway
│   └── docker-compose.kong.yml
├── 3-backend/                 # Backend microservices
│   ├── docker-compose.dashboard.yml
│   ├── docker-compose.auth.yml
│   ├── docker-compose.sister.yml
│   └── docker-compose.nginx.yml
└── 4-frontend/                # Frontend services (optional)
```

## Service Layers

### 1. Infrastructure Layer
- **Redis**: Caching and session storage
- **MeiliSearch**: Search engine for fast full-text search

### 2. Gateway Layer
- **Kong**: API Gateway with routing and rate limiting
- **Kong UI**: Simple dashboard for Kong management

### 3. Backend Layer
- **Dashboard Service**: Main dashboard API (Laravel/PHP)
- **Auth Service**: Authentication and authorization (Laravel/PHP)
- **Sister Service**: SISTER API integration (Go)
- **Nginx**: Reverse proxy for PHP services

### 4. Frontend Layer
- Reserved for future frontend applications

## Key Changes from testing-vm1

### Path Adaptations
- Changed from absolute Linux paths (`/var/www/my-unila`) to relative Windows paths
- Build context uses `../../../../backend/[service]` to reference backend services
- Volume paths remain container-based

### Host Configuration
- Database hosts changed from VM IP (`192.168.123.172`) to `host.docker.internal` for Windows Docker Desktop
- Kong Postgres connection uses `host.docker.internal`
- Services can access host machine databases/services

### Environment
- APP_ENV defaults to `local` (was `production`)
- APP_DEBUG defaults to `true` (was `false`)
- MEILI_ENV defaults to `development` (was `production`)

### Network
- All services use shared `myunila-network` bridge network
- Consistent container naming: `myunila-[service-name]`

## Port Mapping

| Service | Port | URL |
|---------|------|-----|
| Auth Service | 8081 | http://localhost:8081 |
| Dashboard Service | 8082 | http://localhost:8082 |
| Sister Service | 8083 | http://localhost:8083 |
| Kong Gateway | 9800 | http://localhost:9800 |
| Kong Admin | 9801 | http://localhost:9801 |
| Kong UI | 9803 | http://localhost:9803 |
| Redis | 6379 | localhost:6379 |
| MeiliSearch | 7700 | http://localhost:7700 |

## Usage

### Start All Services
```bash
cd deployment/local/scripts
bash clean-rebuild-all.sh
```

### Rebuild Specific Service
```bash
bash quick-rebuild.sh dashboard
bash quick-rebuild.sh auth
bash quick-rebuild.sh sister
```

### Manual Service Control
```bash
cd deployment/local

# Start infrastructure
docker compose -f services/1-infrastructure/docker-compose.redis.yml up -d
docker compose --env-file .env -f services/1-infrastructure/docker-compose.meilisearch.yml up -d

# Start gateway
docker compose --env-file .env -f services/2-gateway/docker-compose.kong.yml up -d

# Start backend
docker compose --env-file .env -f services/3-backend/docker-compose.dashboard.yml up -d
docker compose --env-file .env -f services/3-backend/docker-compose.auth.yml up -d
docker compose --env-file .env -f services/3-backend/docker-compose.sister.yml up -d
docker compose -f services/3-backend/docker-compose.nginx.yml up -d
```

## Environment Variables

All services use `.env` file located at `deployment/local/.env`

Required variables:
- Database connections (AUTH_DB_*, DASHBOARD_DB_*, SISTER_DB_*)
- JWT secrets
- API keys (MEILISEARCH_KEY, API_CONFIG_ENCRYPTION_KEY)
- SISTER API credentials

## Development Workflow

1. **Initial Setup**: Run `clean-rebuild-all.sh` to build all images
2. **Code Changes**: Use `quick-rebuild.sh [service]` for fast rebuilds
3. **Testing**: Access services via localhost ports
4. **Logs**: `docker logs myunila-[service-name] --tail 50`

## Notes

- Services start in order: Infrastructure → Gateway → Backend
- All services depend on Redis being healthy
- Kong requires Postgres database (external to this setup)
- Volumes are named `myunila-[service]-[type]` for consistency
