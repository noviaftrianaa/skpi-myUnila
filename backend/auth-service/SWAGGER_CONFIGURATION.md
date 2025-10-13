# Swagger/OpenAPI Configuration Guide

## Architecture Overview

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend  │─────▶│ Kong Gateway │─────▶│ Auth Service │
│ (Port 3000) │      │  (Port 9800) │      │  (Port 8081) │
└─────────────┘      └──────────────┘      └──────────────┘
                             │
                             │
                     ┌───────▼──────┐
                     │   Swagger UI │
                     │ (Port 8081)  │
                     └──────────────┘
```

## Best Practice: Environment-Based Configuration

Swagger UI dapat dikonfigurasi untuk menggunakan 2 server berbeda:

### 1. Kong API Gateway (RECOMMENDED for Production & Frontend Testing)
- **URL**: `http://localhost:9800/auth-service`
- **Use Case**: Testing dari frontend, external clients, production
- **Advantages**:
  - CORS handled by Kong
  - Rate limiting, monitoring, logging centralized
  - Same endpoint as production
  - Authentication/Authorization plugin support

### 2. Direct Access (Development Only)
- **URL**: `http://localhost:8081`
- **Use Case**: Internal development, debugging, service-to-service
- **Advantages**:
  - Faster (no gateway overhead)
  - Direct error messages
  - Easier debugging

## Configuration

### Environment Variables (`.env`)

```bash
# ===========================================
# API Documentation (Swagger/OpenAPI)
# ===========================================
# Base path for API endpoints
L5_SWAGGER_BASE_PATH=/api/v1

# Default server URL (Kong Gateway with service prefix)
L5_SWAGGER_CONST_HOST=http://localhost:9800/auth-service
```

### Swagger Configuration (`config/l5-swagger.php`)

```php
'constants' => [
    'L5_SWAGGER_CONST_HOST' => env('L5_SWAGGER_CONST_HOST', 'http://my-default-host.com'),
],
```

### OpenAPI Annotation (`app/Swagger/OpenApiInfo.php`)

```php
/**
 * @OA\Server(
 *     url=L5_SWAGGER_CONST_HOST,
 *     description="Kong API Gateway (Recommended for production)"
 * )
 *
 * @OA\Server(
 *     url="http://localhost:8081",
 *     description="Direct Access (Development only)"
 * )
 */
```

## How to Use in Swagger UI

1. **Access Swagger UI**: `http://localhost:8081/api/documentation`

2. **Select Server**:
   - Click dropdown di bagian atas Swagger UI
   - Pilih server yang sesuai:
     - **Kong API Gateway** → untuk testing seperti frontend
     - **Direct Access** → untuk development/debugging

3. **Execute Endpoint**:
   - Swagger akan otomatis menggunakan base URL dari server yang dipilih
   - Contoh:
     - Kong Gateway: `http://localhost:9800/auth-service/api/v1/auth/login`
     - Direct Access: `http://localhost:8081/api/v1/auth/login`

## Why This Approach?

### ✅ Best Practice Benefits:

1. **Production Parity**
   - Swagger testing menggunakan Kong sama dengan production environment
   - Frontend dan Swagger menggunakan endpoint yang sama

2. **Flexibility**
   - Developer bisa switch between Kong dan direct access
   - Useful untuk debugging Kong-specific issues

3. **Documentation Accuracy**
   - API documentation mencerminkan real-world usage
   - External consumers melihat production endpoint

4. **CORS Handling**
   - Kong menangani CORS secara terpusat
   - Tidak perlu konfigurasi CORS di setiap service

5. **Centralized Gateway Features**
   - Rate limiting
   - Authentication/Authorization
   - Request/Response transformation
   - Logging & Monitoring

### ❌ Why NOT Direct Access to Service?

Direct access (bypass Kong) di production adalah **anti-pattern** karena:
- No CORS handling
- No rate limiting
- No centralized logging
- No authentication plugins
- Security risks (direct exposure)

## Environment-Specific Configuration

### Development (`.env`)
```bash
L5_SWAGGER_CONST_HOST=http://localhost:9800/auth-service
```

### Staging
```bash
L5_SWAGGER_CONST_HOST=https://api-staging.myunila.ac.id/auth-service
```

### Production
```bash
L5_SWAGGER_CONST_HOST=https://api.myunila.ac.id/auth-service
```

## Testing Endpoints

### Via Kong Gateway (Recommended)
```bash
curl -X POST http://localhost:9800/auth-service/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}'
```

### Via Direct Access (Development)
```bash
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}'
```

## Frontend Configuration

Frontend **HARUS** menggunakan Kong Gateway:

```typescript
// .env.local
NEXT_PUBLIC_API_URL=http://localhost:9800/auth-service/api/v1
```

**NEVER** use direct service URL in frontend:
```typescript
// ❌ WRONG - CORS issues, no gateway features
NEXT_PUBLIC_API_URL=http://localhost:8081/api/v1
```

## Troubleshooting

### Issue: Swagger shows 404 "route not found"

**Cause**: Swagger menggunakan Kong Gateway URL tetapi endpoint include path prefix

**Solution**:
- Kong route `/auth-service` sudah strip prefix
- Endpoint di Swagger: `/api/v1/auth/login`
- Full URL: `http://localhost:9800/auth-service/api/v1/auth/login`

### Issue: CORS error when testing from Swagger

**Cause**: CORS plugin belum enabled di Kong

**Solution**:
```bash
# Check CORS plugin
curl http://localhost:9801/plugins | jq '.data[] | select(.name=="cors")'

# Should show:
# "enabled": true,
# "origins": ["*"]
```

### Issue: Different response from Kong vs Direct

**Cause**: Kong plugins might transform request/response

**Solution**: Check Kong plugins configuration:
```bash
curl http://localhost:9801/plugins
```

## Summary

**Recommended Architecture**:
- ✅ Frontend → Kong Gateway → Auth Service
- ✅ Swagger UI → Kong Gateway → Auth Service (default)
- ⚠️ Swagger UI → Direct Access (optional for debugging)
- ❌ Frontend → Direct Access (NEVER do this)

**Key Takeaway**:
Swagger UI mendukung multiple servers, jadi Anda bisa test dengan Kong Gateway (recommended) atau direct access (debugging). Frontend HARUS selalu menggunakan Kong Gateway.
