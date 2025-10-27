# Sister Service - Troubleshooting Guide

## Issue: Sync Endpoint Returns 500 Error

### Root Cause Identified ✅
**SISTER API Token Expired**

Error message:
```
"failed to fetch from Sister API: Sister API error: Terjadi kesalahan - Token expired"
```

### Solution: Generate New SISTER API Token

#### Method 1: Using Python Script (Recommended)

```bash
cd /c/laragon/www/my-unila/backend/sister-service
python generate_sister_token.py
```

#### Method 2: Manual via curl

```bash
curl -X POST https://sister-api.kemdikbud.go.id/ws.php/1.0/authorize \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "your_sister_username",
    "password": "your_sister_password"
  }'
```

Response will contain:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Method 3: Via SISTER Dashboard

1. Login to https://sister.kemdikbud.go.id
2. Go to **Profile** → **API Token**
3. Click **Generate New Token**
4. Copy the token

### Update Sister Service with New Token

#### Option 1: Update .env file

Edit `.env` file:
```bash
SISTER_API_TOKEN=<new_token_here>
```

Then restart:
```bash
docker-compose restart sister-service
```

#### Option 2: Update docker-compose.yml

Edit `docker-compose.yml`:
```yaml
services:
  sister-service:
    environment:
      SISTER_API_TOKEN: "<new_token_here>"
```

Then:
```bash
docker-compose up -d sister-service
```

#### Option 3: Update via Docker command

```bash
docker exec myunila-sister-service sh -c 'export SISTER_API_TOKEN="<new_token>"'
docker restart myunila-sister-service
```

---

## Issue: Database Table Not Found

### Error
```
mssql: Invalid object name 'ref.agama'
```

### Solution

Run the migration script:

```bash
# Connect to SQL Server and run:
sqlcmd -S 192.168.123.119 -U mizarzulmi -P <password> \
  -i migrations/001_create_ref_agama.sql
```

Or via SSMS:
1. Open SQL Server Management Studio
2. Connect to `192.168.123.119`
3. Open file `migrations/001_create_ref_agama.sql`
4. Execute (F5)

---

## Issue: 401 Unauthorized from Kong Gateway

### Root Cause
Kong JWT plugin is validating the JWT token.

### Solution (Development Only)

**Option 1: Disable JWT Plugin Temporarily**

```bash
curl -X PATCH http://localhost:9801/plugins/8ad4de4f-13de-4a2c-a975-d18b742d28ba \
  -H 'Content-Type: application/json' \
  -d '{"enabled": false}'
```

**Option 2: Use Valid JWT Token**

1. Login to portal: http://localhost:3001/login
2. Token will be stored in localStorage
3. Token is automatically sent in Authorization header

**Re-enable JWT for Production:**

```bash
curl -X PATCH http://localhost:9801/plugins/8ad4de4f-13de-4a2c-a975-d18b742d28ba \
  -H 'Content-Type: application/json' \
  -d '{"enabled": true}'
```

---

## Testing Sister Service

### 1. Health Check

```bash
curl http://localhost:9800/sister-service/health
```

### 2. Get Agama Data (Requires valid token or JWT disabled)

```bash
curl http://localhost:9800/sister-service/api/v1/referensi/agama
```

### 3. Sync Agama from SISTER API

```bash
curl -X POST http://localhost:9800/sister-service/api/v1/referensi/agama/sync \
  -H "Content-Type: application/json" \
  -d '{"synced_by":"system"}'
```

### 4. Test Direct to Service (Bypass Kong)

```bash
curl http://localhost:8083/api/v1/referensi/agama
```

---

## Current Status

### ✅ Working
- Frontend page loads successfully
- Kong Gateway routing
- Sister Service health endpoint
- Database connection

### ⚠️ Needs Fix
- **SISTER API Token** - EXPIRED (need new token)
- Database table `ref.agama` might not exist (run migration)

### 🔧 Temporarily Disabled (for development)
- Kong JWT Plugin - Disabled
- Sister Service Auth Middleware - Disabled

**Remember to re-enable authentication before production!**

---

## Quick Fix Summary

**To get sync working right now:**

1. **Generate new SISTER token:**
   ```bash
   python generate_sister_token.py
   ```

2. **Update .env:**
   ```
   SISTER_API_TOKEN=<new_token>
   ```

3. **Restart service:**
   ```bash
   docker-compose restart sister-service
   ```

4. **Test sync:**
   - Open: http://localhost:3001/dashboard/sister-integrator/referensi/agama
   - Click "Sync" button
   - Should show success ✅

---

## Contact

For SISTER API access issues, contact:
- SISTER Support: https://sister.kemdikbud.go.id
- Internal: Developer team
