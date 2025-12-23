# Kong Centralized Logging Implementation

## Overview

Implementasi centralized logging menggunakan Kong API Gateway HTTP Log Plugin yang mencatat semua request/response dari **SEMUA microservices** ke database table `logger.log_akses_jwt`.

### Architecture Flow

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ HTTP Request
       ▼
┌──────────────────────────────────────────────┐
│         Kong API Gateway (Port 9800)         │
│  ┌────────────────────────────────────────┐  │
│  │  1. JWT Authentication (if required)   │  │
│  │  2. CORS Plugin                        │  │
│  │  3. HTTP Log Plugin ◄──────────────────┼──┐
│  └────────────────────────────────────────┘  │ │
└──────┬───────────────────────────────────────┘ │
       │ Forwarded to Service                    │
       ▼                                          │
┌──────────────────────────────────────────┐    │
│     Microservices (auth, dashboard, etc) │    │
│     - Fokus ke business logic            │    │
│     - Tidak perlu logging middleware     │    │
└──────────────────────────────────────────┘    │
                                                 │ Async POST
┌────────────────────────────────────────────────┘
│ Kong sends log data via HTTP POST
▼
┌──────────────────────────────────────────┐
│    Auth Service - Kong Log Receiver      │
│    /api/v1/internal/kong-logs            │
│                                           │
│    ┌───────────────────────────────────┐ │
│    │  Parse Kong log JSON              │ │
│    │  Extract: method, uri, status,    │ │
│    │           latency, service, etc   │ │
│    └──────────┬────────────────────────┘ │
│               │                           │
│               ▼                           │
│    ┌───────────────────────────────────┐ │
│    │  INSERT INTO logger.log_akses_jwt │ │
│    │  - id_log_jwt (from JWT token)    │ │
│    │  - menu_akses (URI)               │ │
│    │  - method (GET/POST/etc)          │ │
│    │  - request_list (JSON metadata)   │ │
│    │  - waktu_akses (timestamp)        │ │
│    │  - a_berhasil (1=success, 0=fail) │ │
│    │  - ket (status message)           │ │
│    └───────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

---

## Components

### 1. **Kong HTTP Log Plugin**

Kong plugin yang mengirim log setiap request ke HTTP endpoint.

**Configuration:**
```json
{
  "name": "http-log",
  "config": {
    "http_endpoint": "http://myunila-nginx:80/api/v1/internal/kong-logs",
    "method": "POST",
    "timeout": 5000,
    "keepalive": 60000,
    "retry_count": 3,
    "queue_size": 1000,
    "flush_timeout": 2
  }
}
```

**What Kong Sends:**
```json
{
  "request": {
    "method": "GET",
    "uri": "/api/v1/manakses/pengguna",
    "headers": {
      "authorization": ["Bearer eyJ..."],
      "user-agent": ["Mozilla/5.0..."]
    },
    "querystring": {},
    "size": 123
  },
  "response": {
    "status": 200,
    "size": 456,
    "headers": {}
  },
  "latencies": {
    "request": 45,
    "kong": 2,
    "proxy": 43
  },
  "service": {
    "name": "auth-service"
  },
  "route": {
    "name": "auth-service-route"
  },
  "client_ip": "127.0.0.1",
  "started_at": 1640000000000
}
```

### 2. **Kong Log Receiver Controller**

**File:** `backend/auth-service/app/Http/Controllers/Api/Logger/KongLogController.php`

**Endpoint:** `POST /api/v1/internal/kong-logs`

**What it does:**
1. Receives JSON from Kong
2. Extracts request/response metadata
3. Parses JWT token to get `id_log_jwt`
4. Determines success/failure (2xx/3xx = success, 4xx/5xx = failed)
5. Stores to `logger.log_akses_jwt`

### 3. **Database Table**

**Table:** `logger.log_akses_jwt`

**Structure:**
```sql
CREATE TABLE logger.log_akses_jwt (
    id_log_akses_jwt UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    id_log_jwt UNIQUEIDENTIFIER NULL,                -- Link to JWT token
    menu_akses NVARCHAR(1000),                       -- Request URI
    method NVARCHAR(10),                             -- HTTP method
    request_list NVARCHAR(MAX),                      -- JSON metadata
    waktu_akses DATETIME DEFAULT GETDATE(),          -- Timestamp
    a_berhasil BIT,                                  -- 1=success, 0=failed
    ket NVARCHAR(MAX),                               -- Status message
    FOREIGN KEY (id_log_jwt) REFERENCES logger.log_jwt(id_log_jwt)
);
```

**Example Data:**
```
id_log_jwt: 12345678-1234-1234-1234-123456789012
menu_akses: /api/v1/manakses/pengguna?page=1&limit=10
method: GET
request_list: {
  "service": "auth-service",
  "route": "auth-service-route",
  "querystring": {"page": "1", "limit": "10"},
  "request_size": 0,
  "response_size": 1234,
  "latency_ms": 45,
  "user_agent": "Mozilla/5.0..."
}
waktu_akses: 2025-12-23 12:00:00
a_berhasil: 1
ket: Success via auth-service
```

---

## Installation & Setup

### Step 1: Deploy Updated Auth Service

```bash
# Auth service sudah include KongLogController
cd deployment/local
bash deploy.sh
# Pilih: 24) Quick Dev Rebuild - Auth Only
```

### Step 2: Setup Kong Routes with Logging

```bash
cd deployment/local/scripts

# Cara 1: Run full setup (will recreate all routes with logging)
bash setup-kong-routes.sh

# Cara 2: Only add logging to existing routes
bash kong-setup-logging.sh
```

### Step 3: Verify Log Receiver

```bash
# Test health endpoint
curl http://localhost:8081/api/v1/internal/kong-logs/health

# Expected response:
# {
#   "service": "Kong Log Receiver",
#   "status": "healthy",
#   "timestamp": "2025-12-23T12:00:00Z"
# }
```

### Step 4: Test Logging

```bash
# Make any request through Kong
curl http://localhost:9800/auth-service/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Check database
sqlcmd -S localhost -d myunila_db -Q "
  SELECT TOP 10
    menu_akses, method, a_berhasil, ket, waktu_akses
  FROM logger.log_akses_jwt
  ORDER BY waktu_akses DESC
"
```

---

## Services Covered

All requests through Kong will be logged:

✅ **Auth Service** (`/auth-service/*`)
- Login, logout, refresh token
- Manajemen akses (pengguna, aplikasi, peran, dll)
- User context switching

✅ **Dashboard Service** (`/dashboard-service/*`)
- Public endpoints (statistics, dosen, mahasiswa, dll)
- Protected user endpoints (/my-favorites)

✅ **Sister Service** (`/sister-service/*`)
- Protected API endpoints
- Public photo endpoints

✅ **Feeder Service** (`/feeder-service/*`)
- All feeder API calls

✅ **MyUnila Service** (`/myunila-service/*`)
- SIKEP integration endpoints

---

## Logged Data

For each request, the following is logged:

| Field | Description | Example |
|-------|-------------|---------|
| `id_log_jwt` | JWT token ID (if authenticated) | `12345678-...` |
| `menu_akses` | Request URI with querystring | `/api/v1/manakses/pengguna?page=1` |
| `method` | HTTP method | `GET`, `POST`, `PUT`, `DELETE` |
| `request_list` | JSON with metadata | `{"service": "auth-service", "latency_ms": 45, ...}` |
| `waktu_akses` | Request timestamp | `2025-12-23 12:00:00` |
| `a_berhasil` | Success flag | `1` (2xx/3xx), `0` (4xx/5xx) |
| `ket` | Status message | `Success via auth-service` or `HTTP 404 via dashboard-service` |

---

## Metadata in `request_list` JSON

```json
{
  "service": "auth-service",
  "route": "auth-service-route",
  "querystring": {"page": "1", "limit": "10"},
  "request_size": 0,
  "response_size": 1234,
  "latency_ms": 45,
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
}
```

---

## Benefits

### 1. **Centralized**
- Single table for ALL service logs
- No need to maintain logging code in each service
- Consistent format across all services

### 2. **Performance**
- Async logging (Kong queues logs, sends in batches)
- Non-blocking (doesn't slow down responses)
- Automatic retry on failure

### 3. **Comprehensive**
- Captures ALL requests (even failed authentication)
- Includes latency metrics
- Tracks service/route information

### 4. **Low Maintenance**
- Single configuration point (Kong)
- Auto-applied to new routes
- No code changes needed in services

### 5. **Separation of Concerns**
- Infrastructure concern (logging) at infrastructure layer (Kong)
- Services focus on business logic
- Easy to disable/change logging without touching service code

---

## Monitoring & Analytics

### View Latest Logs

```sql
SELECT TOP 100
    waktu_akses,
    method,
    menu_akses,
    a_berhasil,
    ket,
    JSON_VALUE(request_list, '$.service') as service_name,
    JSON_VALUE(request_list, '$.latency_ms') as latency_ms
FROM logger.log_akses_jwt
ORDER BY waktu_akses DESC;
```

### Count by Service

```sql
SELECT
    JSON_VALUE(request_list, '$.service') as service_name,
    COUNT(*) as total_requests,
    SUM(CASE WHEN a_berhasil = 1 THEN 1 ELSE 0 END) as successful,
    SUM(CASE WHEN a_berhasil = 0 THEN 1 ELSE 0 END) as failed,
    AVG(CAST(JSON_VALUE(request_list, '$.latency_ms') AS INT)) as avg_latency_ms
FROM logger.log_akses_jwt
WHERE waktu_akses >= DATEADD(hour, -24, GETDATE())
GROUP BY JSON_VALUE(request_list, '$.service')
ORDER BY total_requests DESC;
```

### Slowest Endpoints

```sql
SELECT TOP 20
    menu_akses,
    method,
    AVG(CAST(JSON_VALUE(request_list, '$.latency_ms') AS INT)) as avg_latency_ms,
    COUNT(*) as request_count
FROM logger.log_akses_jwt
WHERE waktu_akses >= DATEADD(hour, -24, GETDATE())
GROUP BY menu_akses, method
HAVING COUNT(*) > 10
ORDER BY avg_latency_ms DESC;
```

### Error Rate by Endpoint

```sql
SELECT
    menu_akses,
    method,
    COUNT(*) as total_requests,
    SUM(CASE WHEN a_berhasil = 0 THEN 1 ELSE 0 END) as errors,
    CAST(SUM(CASE WHEN a_berhasil = 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS DECIMAL(5,2)) as error_rate_pct
FROM logger.log_akses_jwt
WHERE waktu_akses >= DATEADD(hour, -24, GETDATE())
GROUP BY menu_akses, method
HAVING COUNT(*) > 10
ORDER BY error_rate_pct DESC;
```

---

## Troubleshooting

### Logs not appearing in database?

1. **Check log receiver health:**
```bash
curl http://localhost:8081/api/v1/internal/kong-logs/health
```

2. **Check Kong plugin is enabled:**
```bash
curl http://localhost:9801/routes/{ROUTE_ID}/plugins | python -m json.tool | grep http-log
```

3. **Check auth-service logs:**
```bash
docker logs myunila-auth-service --tail 100 | grep "Kong log receiver"
```

4. **Test log receiver directly:**
```bash
curl -X POST http://localhost:8081/api/v1/internal/kong-logs \
  -H "Content-Type: application/json" \
  -d '{
    "request": {"method": "GET", "uri": "/test"},
    "response": {"status": 200},
    "latencies": {"request": 10},
    "service": {"name": "test"},
    "route": {"name": "test"},
    "client_ip": "127.0.0.1"
  }'
```

### High latency from logging?

Kong HTTP Log plugin is async and uses batching:
- Logs are queued (queue_size: 1000)
- Sent in batches (flush_timeout: 2 seconds)
- Non-blocking (doesn't slow down responses)

If you see performance issues, increase `queue_size` or `flush_timeout`.

---

## Future Enhancements

### 1. Add Request/Response Body Logging (Optional)

Currently we don't log request/response body to save space. To enable:

```php
// In KongLogController.php
$requestBody = $logData['request']['body'] ?? [];
$responseBody = $logData['response']['body'] ?? [];

$requestList = json_encode([
    // ... existing fields ...
    'request_body' => $requestBody,  // Add this
    'response_body' => $responseBody, // Add this
]);
```

⚠️ Warning: This will significantly increase database size!

### 2. Log Retention Policy

Add automated cleanup of old logs:

```sql
-- Delete logs older than 90 days
DELETE FROM logger.log_akses_jwt
WHERE waktu_akses < DATEADD(day, -90, GETDATE());
```

Schedule this via SQL Server Agent job.

### 3. Real-time Dashboard

Create frontend dashboard to visualize:
- Request volume per service
- Error rates
- Latency trends
- Top endpoints

---

## Comparison with Middleware Approach

| Aspect | Kong HTTP Log ✅ | Middleware per Service ❌ |
|--------|------------------|---------------------------|
| **Setup Complexity** | Simple (1 config) | Complex (N services) |
| **Performance** | Async, batched | Sync, blocking |
| **Consistency** | Guaranteed same format | Risk of drift |
| **Maintenance** | Single point | Multiple files |
| **Separation of Concerns** | Infrastructure layer | Business logic layer |
| **Coverage** | ALL requests (even auth failures) | Only authenticated |
| **Best Practice** | ⭐⭐⭐⭐⭐ | ⭐⭐ |

---

## Conclusion

Kong Centralized Logging provides:
- ✅ Single table (`logger.log_akses_jwt`) for all services
- ✅ No middleware code in services
- ✅ Automatic, async, non-blocking
- ✅ Comprehensive coverage
- ✅ Easy to maintain and monitor

This is the **recommended approach** for microservice logging in production environments.
