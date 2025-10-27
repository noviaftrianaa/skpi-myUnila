# CORS & API Connection Troubleshooting

## Issue: CORS Failed saat akses Sister Service

### Error Log:
```
XHRGET http://kong-gateway:9800/auth-service/api/v1/sister-service/api/v1/referensi/metadata
CORS Failed
```

### Root Cause:
1. **URL salah** - Mencoba akses through Kong Gateway dan auth-service
2. **Hostname salah** - Menggunakan `kong-gateway` instead of `localhost`

### Solution:

#### 1. Direct Connection (Bypass Kong)
File: `src/lib/services/referensiService.ts`

```typescript
// BEFORE (salah):
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9800";
const SISTER_API_BASE = `${BASE_URL}/sister-service/api/v1`;

// AFTER (benar):
const SISTER_API_BASE = "http://localhost:8083/api/v1";
```

**Why:**
- Sister Service running di port **8083** langsung
- Tidak perlu melalui Kong Gateway (port 9800)
- Direct connection lebih cepat dan reliable

#### 2. Restart Next.js Dev Server

**Steps:**
```bash
# Stop server (Ctrl+C di terminal)
# Then restart:
cd /c/laragon/www/my-unila/frontend
npm run dev
```

**Or:**
- Hard refresh browser: `Ctrl + Shift + R`
- Clear browser cache

#### 3. Verify Sister Service CORS

Test CORS:
```bash
curl -v \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS \
  http://localhost:8083/api/v1/referensi/metadata
```

Expected headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
Access-Control-Allow-Headers: Origin,Content-Type,Accept,Authorization
```

#### 4. Test Endpoint Directly

```bash
curl http://localhost:8083/api/v1/referensi/metadata
```

Expected response:
```json
{
  "success": true,
  "message": "Referensi metadata retrieved successfully",
  "data": [...]
}
```

---

## Alternative: Use Kong Gateway (Production)

Jika ingin menggunakan Kong Gateway untuk routing:

### 1. Add Sister Service Route di Kong

```bash
# Create service
curl -X POST http://localhost:8001/services \
  --data name=sister-service \
  --data url=http://myunila-sister-service:8083

# Create route
curl -X POST http://localhost:8001/services/sister-service/routes \
  --data paths[]=/sister-service \
  --data strip_path=false
```

### 2. Update Frontend Service

```typescript
// Use Kong Gateway
const BASE_URL = "http://localhost:9800";
const SISTER_API_BASE = `${BASE_URL}/sister-service/api/v1`;
```

### 3. Configure Kong CORS Plugin

```bash
curl -X POST http://localhost:8001/services/sister-service/plugins \
  --data name=cors \
  --data config.origins=http://localhost:3000,http://localhost:3001 \
  --data config.methods=GET,POST,PUT,DELETE,OPTIONS \
  --data config.headers=Accept,Authorization,Content-Type \
  --data config.credentials=true
```

---

## Quick Checklist

- [ ] Sister Service running? → `curl http://localhost:8083/health`
- [ ] CORS headers correct? → Check OPTIONS request
- [ ] Frontend service updated? → Check `referensiService.ts`
- [ ] Next.js restarted? → `npm run dev`
- [ ] Browser cache cleared? → `Ctrl+Shift+R`
- [ ] Network tab shows correct URL? → Should be `localhost:8083`

---

## Current Configuration (Working)

### Backend:
- **Service:** Sister Service
- **Port:** 8083
- **CORS:** Allow all origins (`*`)
- **Endpoints:** `/api/v1/referensi/*`

### Frontend:
- **Service URL:** `http://localhost:8083/api/v1`
- **Method:** Direct connection (bypass Kong)
- **CORS:** Enabled in Sister Service

### Test Command:
```bash
# From browser console or terminal
fetch('http://localhost:8083/api/v1/referensi/metadata')
  .then(r => r.json())
  .then(d => console.log(d))
```

---

## Status:
✅ Backend CORS configured
✅ Frontend service updated
⏳ Waiting for Next.js restart
