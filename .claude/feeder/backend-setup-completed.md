# Feeder Service Backend - Setup Completed

> **Date**: 2025-11-16
> **Status**: ✅ Base code completed
> **Pattern**: Same as sister-service

---

## 📦 What's Been Created

### 1. Backend Service Structure ✅

**Directory**: `backend/feeder-service/`

```
feeder-service/
├── apps/
│   └── apiconfig/          # Copied from sister-service
├── cmd/
│   └── api/
│       └── main.go         # Main entry point
├── config/                 # Empty (for future use)
├── external/
│   ├── database/           # Copied from sister-service
│   └── feeder_api/
│       └── client.go       # Neo Feeder API client
├── internal/
│   ├── config/
│   │   └── config.go       # Configuration loader
│   └── middleware/         # Copied from sister-service
├── pkg/
│   ├── crypto/             # Copied from sister-service
│   └── response/           # Copied from sister-service
├── .env                    # Environment variables
├── Dockerfile              # Docker build file
├── go.mod                  # Go module dependencies
└── go.sum                  # Go module checksums
```

### 2. Environment Configuration ✅

**File**: `backend/feeder-service/.env`

```env
# Application
APP_NAME=Feeder Service
APP_PORT=:8084
APP_ENV=development

# Neo Feeder PDDIKTI API (Fallback - Priority: Database > Environment)
FEEDER_API_BASE_URL=https://dapelmikpdpt.unila.ac.id/New/ws/Api.php
FEEDER_API_USERNAME=one_data
FEEDER_API_PASSWORD=OneData#2025

# SQL Server Database
DB_DRIVER=sqlserver
DB_HOST=192.168.123.119
DB_PORT=1433
DB_DATABASE=pdut_dev
DB_USERNAME=mizarzulmi
DB_PASSWORD=__REDACTED_DB_PASSWORD__
DB_TRUST_SERVER_CERTIFICATE=true

# Connection Pool
DB_MAX_OPEN_CONNS=25
DB_MAX_IDLE_CONNS=5
DB_CONN_MAX_LIFETIME=5m

# Logging
LOG_LEVEL=info

# API Configuration Encryption
API_CONFIG_ENCRYPTION_KEY=12345678901234567890123456789012
```

### 3. Feeder API Client ✅

**File**: `external/feeder_api/client.go`

**Features**:
- Token-based authentication (GetToken)
- Auto token refresh on expiry
- Database config priority (setting.api_configs → environment variables)
- Get Referensi data
- Get Mahasiswa data
- Get Record from specific table
- Connection testing

**Key Methods**:
```go
NewFeederClient()                           // Create client with DB/env credentials
GetToken()                                  // Authenticate and get token
GetReferensi(table, filter, limit, offset) // Get reference data
GetMahasiswa(filter, limit, offset)        // Get student data
GetRecordTable(table, filter, limit, offset) // Get data from specific table
TestConnection()                            // Test API connection
```

### 4. Docker Configuration ✅

#### Local Development

**File**: `deployment/local/services/3-backend/docker-compose.feeder.yml`

- Port: 8084
- Network: myunila-network
- Health check enabled
- Redis dependency
- Log rotation configured

#### Production (VM3)

**File**: `deployment/production/vm3-backend2/services/feeder/docker-compose.yml`

- Port: 8084
- Network: myunila-prod-network
- Resource limits: 8 CPU / 12GB RAM
- Resource reservations: 4 CPU / 4GB RAM
- Health check enabled
- Production optimizations

### 5. Environment Files Updated ✅

#### Local Development
**File**: `deployment/local/.env`

Added:
- FEEDER_APP_NAME, FEEDER_APP_PORT, FEEDER_APP_ENV
- FEEDER_DB_* (connection config)
- FEEDER_API_* (API credentials)
- FEEDER_REDIS_HOST, FEEDER_REDIS_PORT

#### Production (VM3)
**File**: `deployment/production/vm3-backend2/.env.example`

Added complete Feeder Service configuration section with:
- Application config
- Database config
- API credentials (placeholder)
- Connection pool settings

#### Frontend
**File**: `frontend/.env.local`

Added:
```env
NEXT_PUBLIC_FEEDER_API_URL=http://localhost:9800/feeder-service
```

---

## 🗄️ Database Configuration

**Table**: `setting.api_configs`

**SQL Script** (Run manually in SQL Server):
```sql
USE pdut_dev;

IF NOT EXISTS (SELECT 1 FROM setting.api_configs WHERE api_code = 'feeder_api')
BEGIN
    INSERT INTO setting.api_configs (
        api_code, api_name, api_description, base_url, auth_type,
        timeout_seconds, max_retries, retry_delay_ms,
        is_active, is_encrypted, use_env_fallback,
        created_by, tags, notes
    ) VALUES (
        'feeder_api',
        'Neo Feeder PDDIKTI API',
        'API untuk integrasi data mahasiswa dengan Neo Feeder PDDIKTI Kemendikbud',
        'https://dapelmikpdpt.unila.ac.id/New/ws/Api.php',
        'token_based',
        120, 3, 1000,
        1, 0, 1,
        'system',
        'feeder,pddikti,mahasiswa,referensi',
        'Credentials will be encrypted and stored via API.'
    );
END
GO
```

---

## 🚀 How to Run

### Local Development

1. **Run directly with Go**:
```bash
cd backend/feeder-service
go run cmd/api/main.go
```

2. **Run with Docker Compose**:
```bash
cd deployment/local/services/3-backend
docker-compose -f docker-compose.feeder.yml up --build
```

3. **Access**:
- Health check: http://localhost:8084/health
- API: http://localhost:8084/api/v1
- API Config: http://localhost:8084/apiconfig

### Production (VM3)

1. **Deploy**:
```bash
cd deployment/production/vm3-backend2/services/feeder
docker-compose up -d --build
```

2. **Access via Kong Gateway**:
- Base URL: http://192.168.120.41:9800/feeder-service
- Health: http://192.168.120.41:9800/feeder-service/health

---

## 📋 API Endpoints (Available Now)

### Health & Info
- `GET /health` - Health check
- `GET /` - Service info

### API Configuration (via apiconfig module)
- `GET /apiconfig` - Get all API configs
- `GET /apiconfig/:api_code` - Get specific config
- `POST /apiconfig` - Create new config
- `PUT /apiconfig/:id` - Update config
- `DELETE /apiconfig/:id` - Delete config
- `POST /apiconfig/test` - Test connection

---

## 🔧 Next Steps (TODO)

### Phase 3: Referensi Domain
- [ ] Create `apps/referensi` module
- [ ] Repository layer (SQL Server)
- [ ] Service layer (business logic)
- [ ] Handler layer (HTTP routes)
- [ ] Sync endpoints for 11 referensi tables

### Phase 4: PDRD Domain
- [ ] Create `apps/mahasiswa` module
- [ ] Create other PDRD modules (12 total)
- [ ] Worker pool for parallel sync
- [ ] Bulk insert optimization

### Phase 5: Monitoring & Scheduler
- [ ] Sync logs module
- [ ] Monitoring endpoints
- [ ] Scheduler for auto-sync

---

## 🔑 Credentials (Production)

**Neo Feeder PDDIKTI API**:
- URL: https://dapelmikpdpt.unila.ac.id/New/ws/Api.php
- Username: `one_data`
- Password: `OneData#2025`

**Priority**: Database config (`setting.api_configs`) > Environment variables

---

## 📝 Important Notes

1. **API Config Priority**:
   - First: Check `setting.api_configs` table
   - Fallback: Use environment variables
   - Credentials in database are encrypted using AES-256

2. **Token Management**:
   - Token expires after ~2 hours
   - Auto-refresh on 401/expired token
   - Global client instance (singleton pattern)

3. **Database Connection**:
   - Uses same SQL Server as sister-service
   - Connection pooling enabled
   - Trust server certificate for local dev

4. **Port Allocation**:
   - Local: 8084
   - Production: 8084 (via Kong: 9800/feeder-service)

---

## 🎯 Pattern Consistency

All patterns follow **sister-service** structure:
- ✅ apiconfig module for API configuration
- ✅ crypto module for encryption
- ✅ response module for standardized responses
- ✅ middleware for JWT auth (copied, not yet used)
- ✅ database module for SQL Server + Redis
- ✅ Docker multi-stage build
- ✅ Health checks and logging
- ✅ Environment-based configuration

---

**Document Version**: 1.0
**Last Updated**: 2025-11-16
**Related Docs**:
- [implementation-plan.md](.claude/feeder/implementation-plan.md)
- [api-configuration.md](.claude/feeder/api-configuration.md)
