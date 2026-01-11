# Postman Collection - Auth Service

## 📦 Files

- `Auth-Service.postman_collection.json` - API collection (Original)
- `Auth-Service-Updated.postman_collection.json` - ✅ **NEW! With Token Management**
- `Auth-Service.postman_environment.json` - Environment variables

## 🆕 What's New (v2 - Token Management)

**✅ Token Logging:**
- Semua JWT token dicatat di `logger.log_jwt`
- Refresh token disimpan di `man_akses.refresh_token`
- Login logs di `logger.log_login`

**✅ Token Lifecycle:**
- Access Token: 15 minutes
- Refresh Token: 7 days (stored in database)
- Revoke support (logout individual/all devices)

**✅ New Endpoints:**
- `POST /api/v1/auth/logout` - Logout single device
- `POST /api/v1/auth/logout-all` - Logout all devices
- `GET /api/v1/auth/sessions` - Get active sessions
- `GET /api/v1/auth/token-info` - Get current token info
- `POST /api/v1/auth/revoke` - Revoke specific token

## 🚀 Quick Start

### 1. Import to Postman

1. Open Postman
2. Click **Import** button
3. Select files:
   - ✅ **`Auth-Service-Updated.postman_collection.json`** (RECOMMENDED)
   - `Auth-Service.postman_environment.json`
4. Click **Import**

**Note:** Use `Auth-Service-Updated` collection untuk fitur token management lengkap.

### 2. Configure Environment

1. Select **Auth Service - Local** environment (top right)
2. Click the **eye icon** → **Edit**
3. Update these variables:
   ```
   base_url: http://localhost:8081/auth-service (✅ Already set)
   api_url: http://localhost:8081/auth-service/api/v1 (✅ Already set)
   test_username: your_real_username (⚠️ CHANGE THIS)
   test_password: your_real_password (⚠️ CHANGE THIS)
   ```
4. Click **Save**

### 3. Test API

Run requests in this order:

#### ✅ 1. Health Check
```
GET {{base_url}}/api/health
```
Expected: `200 OK` with service status

#### ✅ 2. Login
```
POST {{base_url}}/api/v1/auth/login
Body: {
  "username": "DWI.RETNO21",
  "password": "test123",
  "device_name": "postman"
}
```
Expected: `200 OK` with access_token & refresh_token (in cookie)
⚡ Auto-saves tokens to collection variables

**What happens:**
- ✅ Password verified (SHA1 hash)
- ✅ Access token generated (15 min) → logged to `logger.log_jwt`
- ✅ Refresh token generated (7 days) → saved to `man_akses.refresh_token`
- ✅ Login session logged → `logger.log_login`

#### ✅ 3. Get User Info
```
GET {{base_url}}/api/v1/auth/me
Header: Authorization: Bearer {{access_token}} (auto)
```
Expected: `200 OK` with user data

#### ✅ 4. Refresh Token (when access token expired)
```
POST {{base_url}}/api/v1/auth/refresh
Cookie: refresh_token={{refresh_token}} (auto)
```
Expected: `200 OK` with new access_token
⚡ Auto-saves new access token

**What happens:**
- ✅ Validate refresh token from database
- ✅ Check if revoked
- ✅ Generate new access token
- ✅ Log new token to `logger.log_jwt`

#### ✅ 5. Get Active Sessions
```
GET {{base_url}}/api/v1/auth/sessions
Header: Authorization: Bearer {{access_token}} (auto)
```
Expected: List of all active login sessions

#### ✅ 6. Logout (Single Device)
```
POST {{base_url}}/api/v1/auth/logout
Header: Authorization: Bearer {{access_token}} (auto)
```
Expected: `200 OK` logout success

**What happens:**
- ✅ Revoke refresh token → `man_akses.refresh_token` (is_revoked = 1)
- ✅ Expire access token → `logger.log_jwt` (waktu_expired = now)
- ✅ Update login session → `logger.log_login` (waktu_logout = now)

#### ✅ 7. Logout All Devices (Optional)
```
POST {{base_url}}/api/v1/auth/logout-all
Header: Authorization: Bearer {{access_token}} (auto)
```
Expected: `200 OK` all sessions terminated

**What happens:**
- ✅ Revoke ALL refresh tokens for user
- ✅ Expire ALL access tokens
- ✅ Update ALL login sessions

---

## 📚 Available Endpoints

### 🔐 Authentication
- `POST /api/v1/auth/login` - Login with username/password
- `GET /api/v1/auth/me` - Get authenticated user info
- `POST /api/v1/auth/refresh` - Refresh access token (when expired)
- `POST /api/v1/auth/logout` - Logout single device
- `POST /api/v1/auth/logout-all` - Logout all devices

### 📊 Token Management
- `GET /api/v1/auth/sessions` - Get all active sessions
- `GET /api/v1/auth/token-info` - Get current token info
- `POST /api/v1/auth/revoke` - Revoke specific refresh token

### SSO (Single Sign-On)
- `GET /api/v1/auth/sso/url` - Get SSO login URL
- `GET /api/v1/auth/sso/redirect` - Redirect to SSO (web flow)
- `GET /api/v1/auth/sso/callback` - SSO callback (web)
- `POST /api/v1/auth/sso/callback` - SSO callback (API)
- `POST /api/v1/auth/sso/validate` - Validate SSO token

### MFA (Multi-Factor Authentication)
- `POST /api/v1/auth/mfa/setup` - Generate QR code
- `POST /api/v1/auth/mfa/verify` - Verify OTP code
- `POST /api/v1/auth/mfa/disable` - Disable 2FA
- `GET /api/v1/auth/mfa/backup-codes` - Get backup codes

### Health
- `GET /api/health` - Service health check

---

## 🔧 Troubleshooting

### ❌ Connection Refused
**Error**: `Could not get any response`

**Solution**:
1. Check Docker is running:
   ```bash
   docker ps
   ```
2. Check services are up:
   ```bash
   docker-compose ps
   ```
3. Verify port 8081 is accessible:
   ```bash
   curl http://localhost:8081/auth-service/api/health
   ```

### ❌ 401 Unauthorized
**Error**: `{"message":"Unauthenticated"}`

**Solution**:
- Access token expired (15 min lifetime)
- Run **Refresh Token** request to get new token
- Or run **Login** again

### ❌ 500 Internal Server Error
**Error**: `{"success":false,"message":"An error occurred..."}`

**Solution**:
1. Check Laravel logs:
   ```bash
   docker exec myunila-auth-service tail -50 storage/logs/laravel.log
   ```
2. Check database connection:
   ```bash
   docker exec myunila-auth-service php artisan tinker --execute="DB::connection()->getPdo();"
   ```

### ❌ Wrong Credentials
**Error**: `{"success":false,"message":"Invalid credentials"}`

**Solution**:
- Update `test_username` and `test_password` in environment
- Use credentials from your SQL Server database
- Check `man_akses.pengguna` table for valid users

---

## 📊 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `base_url` | Base service URL | `http://localhost:8081/auth-service` |
| `api_url` | API base URL | `http://localhost:8081/auth-service/api/v1` |
| `access_token` | JWT access token (auto-saved) | Auto-generated |
| `refresh_token` | JWT refresh token (auto-saved) | Auto-generated |
| `temp_token` | MFA temp token (auto-saved) | Auto-generated |
| `sso_token` | SSO token (manual) | From SSO provider |
| `test_username` | Your test username | `your_npm_or_nip` |
| `test_password` | Your test password | `your_password` |

---

## 🧪 Testing Scenarios

### Scenario 1: Basic Login Flow
1. Run **Login** → Get tokens
2. Run **Get User Info** → Verify authenticated
3. Run **Logout** → Clear session

### Scenario 2: Token Refresh
1. Run **Login** → Get tokens
2. Wait 15+ minutes (or manually delete access_token)
3. Run **Refresh Token** → Get new access_token
4. Run **Get User Info** → Verify still authenticated

### Scenario 3: SSO Flow (Optional)
1. Run **Get SSO URL** → Copy URL
2. Open URL in browser → Login at SSO provider
3. Copy token from callback
4. Run **Validate SSO Token** → Verify and get user

### Scenario 4: MFA Setup (Optional)
1. Run **Login** → Authenticate
2. Run **Setup MFA** → Get QR code
3. Scan QR with Google Authenticator
4. Run **Verify MFA** → Enable 2FA
5. Run **Logout** → Clear session
6. Run **Login** → Now requires OTP code

---

## 📝 Notes

- **Auto-Save**: Access & refresh tokens are automatically saved to collection variables after successful login
- **Token Lifecycle**: Access token (15 min), Refresh token (7 days)
- **Token Logging**: All tokens logged to `logger.log_jwt` and `man_akses.refresh_token`
- **Revoke Support**: Can revoke tokens anytime (logout feature)
- **Port**: Changed from 8080 to **8081** (avoid conflicts)
- **Security**: Never commit real passwords to git
- **SSL**: SQL Server SSL certificate validation is disabled (`trust_server_certificate=true`)

## 🔄 Token Flow

```
Login → Access Token (15 min) + Refresh Token (7 days)
  ↓
Use Access Token → Protected endpoints
  ↓
Token Expired? → Use Refresh Token → Get new Access Token
  ↓
Logout → Revoke Refresh Token + Expire Access Token
```

## 💾 Database Tables

**Token logging & management:**

1. **`logger.log_jwt`** - Log semua JWT tokens (access & refresh)
   ```sql
   SELECT * FROM logger.log_jwt
   WHERE id_pengguna = 'user-id'
   ORDER BY waktu_create DESC
   ```

2. **`man_akses.refresh_token`** - Refresh tokens dengan revoke support
   ```sql
   SELECT * FROM man_akses.refresh_token
   WHERE is_revoked = 0
   AND waktu_expired > GETDATE()
   ```

3. **`logger.log_login`** - Login sessions
   ```sql
   SELECT * FROM logger.log_login
   WHERE id_pengguna = 'user-id'
   AND a_sesi_aktif = 1
   ```

---

## 🔗 Related Documentation

- [API Documentation](../API_LOGIN_DOCUMENTATION.md)
- [SSO Implementation Guide](../SSO_IMPLEMENTATION_GUIDE.md)
- [Testing Guide](../TESTING_GUIDE.md)
- [Main README](../../README.md)

---

**Last Updated**: 2025-10-11
**Port**: 8081
**Base URL**: http://localhost:8081/auth-service
