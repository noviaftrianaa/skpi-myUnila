# Testing Results - Auth Service Token Management

**Date:** 2025-10-12  
**Account:** DWI.RETNO21  
**Environment:** Docker (localhost:8081)

---

## ✅ Test Results

### 1. Health Check
```bash
GET /api/health
```
**Status:** ✅ PASS  
**Response:** Service healthy

---

### 2. Login (Standard)
```bash
POST /api/v1/auth/login
Body: {"username":"DWI.RETNO21","password":"test123","device_name":"postman"}
```

**Status:** ✅ PASS  
**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "8A9B55FC-E142-4DCE-A736-0000356DE151",
      "username": "DWI.RETNO21",
      "name": "DWI RETNO SEPTIANA",
      "email": "DWI.RETNO21@students.unila.ac.id",
      "role": "user"
    },
    "tokens": {
      "access_token": "eyJ0eXAiOiJKV1Qi...",
      "token_type": "Bearer",
      "expires_in": 900
    }
  }
}
```

**Features Working:**
- ✅ Password SHA1 verification
- ✅ JWT token generation (15 min)
- ✅ Refresh token generation (7 days)
- ✅ Logged to logger.log_login
- ✅ Logged to logger.log_jwt
- ✅ Refresh token cookie set

---

### 3. Get Current User
```bash
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

**Status:** ✅ PASS  
**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "8A9B55FC-E142-4DCE-A736-0000356DE151",
      "name": "DWI RETNO SEPTIANA",
      "email": "DWI.RETNO21@students.unila.ac.id"
    }
  }
}
```

**Features Working:**
- ✅ JWT authentication middleware
- ✅ User data from man_akses.pengguna (native SQL)

---

### 4. Get Token Info
```bash
GET /api/v1/auth/token-info
Authorization: Bearer <access_token>
```

**Status:** ✅ PASS  
**Response:**
```json
{
  "success": true,
  "data": {
    "jti": "aa33e593-f730-4656-8ffc-86cb356076b1",
    "type": "access",
    "user_id": "8A9B55FC-E142-4DCE-A736-0000356DE151",
    "issued_at": "2025-10-12 01:35:30",
    "expires_at": "2025-10-12 01:50:30",
    "time_remaining": "865 seconds",
    "ip_address": "172.22.0.1",
    "url": "/api/v1/auth/login",
    "is_expired": false
  }
}
```

**Features Working:**
- ✅ JWT decode
- ✅ Token info from logger.log_jwt (native SQL)
- ✅ Time remaining calculation

---

### 5. Get JWT Logs (Debug)
```bash
GET /api/v1/debug/jwt-logs?limit=5
Authorization: Bearer <access_token>
```

**Status:** ✅ PASS  
**Response:**
```json
{
  "success": true,
  "data": {
    "total": 3,
    "logs": [
      {
        "id": "AA58EE32-4DB3-41F4-A0E2-3B902776C843",
        "user_id": "8A9B55FC-E142-4DCE-A736-0000356DE151",
        "token_preview": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "url": "/api/v1/auth/login",
        "ip_address": "172.22.0.1",
        "created_at": "2025-10-12 01:35:27.757",
        "expires_at": "2025-10-12 01:50:30.000",
        "status": "active"
      },
      {
        "status": "expired"
        // ... more logs
      }
    ]
  }
}
```

**Features Working:**
- ✅ Query logger.log_jwt (native SQL)
- ✅ Limit parameter working
- ✅ Status calculation (active/expired)
- ✅ Shows token preview (first 50 chars)

---

### 6. Get Active Sessions
```bash
GET /api/v1/auth/sessions
Authorization: Bearer <access_token>
```

**Status:** ✅ PASS  
**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "session_id": "77D4B752-563D-4726-8803-74895A975677",
        "device_name": "web - Unknown",
        "ip_address": "172.22.0.1",
        "browser": "Unknown",
        "os": "Unknown",
        "device_type": "web",
        "created_at": "2025-10-12 01:35:27.917",
        "is_active": true
      }
      // ... 4 more active sessions
    ],
    "active_tokens": 0
  }
}
```

**Features Working:**
- ✅ Query logger.log_login (native SQL)
- ✅ Shows all sessions for user
- ✅ Device info parsed
- ✅ Active status shown

**Note:** Device info shows "Unknown" karena User-Agent dari curl tidak detail. Dari Postman akan lebih akurat.

---

## 📊 Database Verification

### Check JWT Logs
```sql
SELECT TOP 5 *
FROM logger.log_jwt
WHERE id_pengguna = '8A9B55FC-E142-4DCE-A736-0000356DE151'
ORDER BY waktu_create DESC
```
**Result:** ✅ All tokens logged correctly

### Check Refresh Tokens
```sql
SELECT *
FROM man_akses.refresh_token
WHERE id_refresh_token IN (
    SELECT DISTINCT SUBSTRING(token_value, 
        CHARINDEX('"jti":"', token_value) + 7, 36)
    FROM logger.log_jwt
    WHERE id_pengguna = '8A9B55FC-E142-4DCE-A736-0000356DE151'
)
```
**Result:** ⚠️ No refresh tokens found in database

**Issue Identified:** Refresh token tidak ter-save ke `man_akses.refresh_token`!

---

## 🔴 Issues Found

### Issue 1: Refresh Token Not Saved
**Symptom:**
- Login berhasil, dapat refresh token di cookie
- Tapi `man_akses.refresh_token` table kosong
- Query `active_tokens` return 0

**Root Cause:** Kemungkinan error saat insert ke `man_akses.refresh_token` yang tidak ter-catch

**Fix Needed:** Check TokenService::generateRefreshTokenFromArray()

---

## ✅ Working Features Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Login | ✅ PASS | All features working |
| Get Current User | ✅ PASS | JWT auth working |
| Get Token Info | ✅ PASS | Shows token details |
| Get JWT Logs | ✅ PASS | Shows token history |
| Get Active Sessions | ✅ PASS | Shows login sessions |
| Refresh Token | ⚠️ PARTIAL | Cookie set, DB save failed |
| Logout | 🔄 NOT TESTED | Needs refresh token in DB |
| Logout All | 🔄 NOT TESTED | Needs refresh token in DB |
| Revoke Token | 🔄 NOT TESTED | Needs refresh token in DB |
| Check Refresh Status | 🔄 NOT TESTED | Needs refresh token in DB |

---

## 🔧 Next Steps

1. **Fix refresh token saving**
   - Check TokenService::generateRefreshTokenFromArray()
   - Check table man_akses.refresh_token exists
   - Check SQL syntax for INSERT

2. **Test refresh token flow**
   - Login → get tokens
   - Verify refresh token in DB
   - Test /auth/refresh endpoint
   - Test /auth/logout endpoint

3. **Update Postman collection**
   - Add refresh_token extraction from response
   - Add JTI extraction helper
   - Update debug endpoint to use `?refresh_token=<jwt>` parameter

---

**Testing Status:** 60% Complete (6/10 endpoints working)  
**Critical Issue:** Refresh token not saving to database  
**Priority:** Fix refresh token storage before continuing tests
