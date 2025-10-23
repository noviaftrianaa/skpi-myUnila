# Auth Service - MyUnila Authentication & Authorization

Laravel-based authentication & authorization service untuk Portal myUnila.

![Laravel](https://img.shields.io/badge/Laravel-11.31-FF2D20?logo=laravel)
![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?logo=php)
![JWT](https://img.shields.io/badge/JWT-Firebase-000000?logo=jsonwebtokens)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Authentication Flow](#authentication-flow)
- [MFA/2FA Implementation](#mfa2fa-implementation)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Overview

Auth Service adalah microservice yang bertanggung jawab untuk:
- ✅ User authentication (login/logout)
- ✅ JWT token generation & validation
- ✅ SSO Unila integration
- ✅ Multi-Factor Authentication (MFA/2FA)
- ✅ Session management
- ✅ Password management
- ✅ User verification

**Service URL**: http://localhost:8081
**Via Kong Gateway**: http://localhost:9800/auth-service

---

## Features

### 🔐 Authentication
- **JWT-based authentication** - Stateless token-based auth
- **Login/Logout** - Standard username/password authentication
- **Token refresh** - Refresh expired tokens without re-login
- **Session management** - Redis-backed session storage
- **Remember me** - Extended session support

### 🎓 SSO Unila Integration
- **Single Sign-On** - Integration dengan SSO Unila
- **Auto-provisioning** - Automatic user creation dari SSO
- **Role mapping** - Map SSO roles ke internal roles
- **Seamless login** - Transparent SSO authentication

### 🔒 Multi-Factor Authentication (MFA/2FA)
- **TOTP-based** - Time-based One-Time Password
- **Google Authenticator** - Support untuk authenticator apps
- **QR Code generation** - Easy setup via QR code
- **Backup codes** - Recovery codes untuk emergency access
- **Per-user toggle** - Users can enable/disable MFA

### 👤 User Management
- **Profile management** - Get/update user profile
- **Password change** - Secure password update
- **Email verification** - Verify user email addresses
- **Account status** - Active/inactive user management

### 🛡️ Security Features
- **Rate limiting** - Prevent brute force attacks
- **Password hashing** - Bcrypt password hashing
- **Token blacklisting** - Revoke compromised tokens
- **Audit logging** - Track authentication events
- **CORS support** - Configured for frontend access

---

## Tech Stack

### Framework & Core
- **Laravel** `11.31` - PHP framework
- **PHP** `8.2+` - Programming language

### Authentication
- **Firebase JWT** `^6.10` - JSON Web Token library
- **Laravel Sanctum** `^4.0` - API authentication
- **Google2FA** `^2.3` - Two-factor authentication

### Database & Cache
- **SQL Server PDO** - Primary database (`auth_db`)
- **Redis** - Session & cache storage

### Development Tools
- **L5-Swagger** - API documentation
- **Laravel Pint** - Code style
- **PHPUnit** - Testing

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Auth Service                       │
│                  Port: 8081                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐      ┌──────────────┐            │
│  │  Controllers │      │  Middleware  │            │
│  │              │      │              │            │
│  │ • Auth       │──────│ • JWT Verify │            │
│  │ • MFA        │      │ • CORS       │            │
│  │ • SSO        │      │ • Rate Limit │            │
│  └──────┬───────┘      └──────────────┘            │
│         │                                           │
│         ↓                                           │
│  ┌──────────────┐      ┌──────────────┐            │
│  │   Services   │      │   Models     │            │
│  │              │      │              │            │
│  │ • AuthService│──────│ • User       │            │
│  │ • JWTService │      │ • Session    │            │
│  │ • MfaService │      │ • MfaToken   │            │
│  └──────┬───────┘      └──────┬───────┘            │
│         │                     │                    │
│         └──────────┬──────────┘                    │
│                    ↓                               │
│         ┌─────────────────────┐                    │
│         │     Database        │                    │
│         │   SQL Server        │                    │
│         │   (auth_db)         │                    │
│         └─────────────────────┘                    │
│                    ↓                               │
│         ┌─────────────────────┐                    │
│         │      Redis          │                    │
│         │  Cache & Session    │                    │
│         └─────────────────────┘                    │
└─────────────────────────────────────────────────────┘
```

### Database Schema

**Main Tables**:
- `users` - User accounts & profiles
- `sessions` - Active user sessions
- `mfa_tokens` - MFA secrets & backup codes
- `password_resets` - Password reset tokens
- `audit_logs` - Authentication event logs

---

## Installation

### Prerequisites
- PHP 8.2+
- Composer
- SQL Server
- Redis

### Steps

```bash
# 1. Navigate to auth-service directory
cd auth-service

# 2. Install dependencies
composer install

# 3. Copy environment file
cp .env.example .env

# 4. Generate application key
php artisan key:generate

# 5. Configure database & JWT secret in .env
# See Configuration section below

# 6. Run migrations
php artisan migrate

# 7. (Optional) Seed sample data
php artisan db:seed

# 8. Generate API documentation
php artisan l5-swagger:generate

# 9. Start development server
php artisan serve --host=0.0.0.0 --port=8081
```

---

## Configuration

### Environment Variables

```bash
# Application
APP_NAME="MyUnila Auth Service"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8081

# Database (SQL Server)
DB_CONNECTION=sqlsrv
DB_HOST=host.docker.internal
DB_PORT=1433
DB_DATABASE=auth_db
DB_USERNAME=sa
DB_PASSWORD=YourStrong@Passw0rd

# Redis Cache
CACHE_STORE=redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=null

# JWT Configuration
JWT_SECRET=your_generated_jwt_secret_here
JWT_TTL=60                    # Token TTL in minutes
JWT_REFRESH_TTL=10080         # 7 days in minutes
JWT_ALGO=HS256

# SSO Unila (Optional)
SSO_UNILA_BASE_URL=https://akses.unila.ac.id
SSO_UNILA_APP_KEY=
SSO_UNILA_JWT_SECRET=
SSO_UNILA_CALLBACK_URL=http://localhost:9800/auth-service/api/v1/auth/sso/callback

# MFA/2FA Settings
MFA_ISSUER=MyUnila
MFA_QR_SIZE=200
MFA_WINDOW=1                  # Time window for TOTP validation

# Security
SESSION_LIFETIME=120
SESSION_DRIVER=redis
SANCTUM_STATEFUL_DOMAINS=localhost:3001

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3001
```

### Generate JWT Secret

```bash
# Generate secure random secret
openssl rand -base64 32

# Or use PHP
php -r "echo base64_encode(random_bytes(32)) . PHP_EOL;"
```

**⚠️ IMPORTANT**: JWT_SECRET must be the same across ALL services (auth, dashboard, sister).

---

## API Endpoints

### Public Endpoints (No authentication required)

#### Health Check
```http
GET /api/v1/health
```

**Response**:
```json
{
  "status": "ok",
  "service": "auth-service",
  "timestamp": "2025-10-21T12:00:00.000000Z"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "user123",
  "password": "password",
  "remember": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": "8A9B55FC-E142-4DCE-A736-0000356DE151",
      "username": "user123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "Mahasiswa"
    },
    "requires_mfa": false
  }
}
```

#### SSO Login
```http
POST /api/v1/auth/sso/login
Content-Type: application/json

{
  "sso_token": "token_from_sso_unila"
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Protected Endpoints (Require JWT token)

**Header**:
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

#### Get Current User
```http
GET /api/v1/auth/me
```

#### Logout
```http
POST /api/v1/auth/logout
```

#### Verify Token
```http
POST /api/v1/auth/verify
```

#### Enable MFA
```http
POST /api/v1/auth/mfa/enable
```

**Response**:
```json
{
  "success": true,
  "data": {
    "qr_code": "data:image/png;base64,...",
    "secret": "JBSWY3DPEHPK3PXP",
    "backup_codes": [
      "12345678",
      "87654321",
      ...
    ]
  }
}
```

#### Verify MFA
```http
POST /api/v1/auth/mfa/verify
Content-Type: application/json

{
  "code": "123456"
}
```

#### Disable MFA
```http
POST /api/v1/auth/mfa/disable
Content-Type: application/json

{
  "password": "current_password"
}
```

### API Documentation

**Swagger UI**: http://localhost:8081/api/documentation

---

## Authentication Flow

### Standard Login Flow

```
┌────────┐                  ┌──────────────┐                 ┌──────────┐
│ Client │                  │ Auth Service │                 │ Database │
└───┬────┘                  └──────┬───────┘                 └────┬─────┘
    │                              │                              │
    │  POST /api/v1/auth/login     │                              │
    │  {username, password}        │                              │
    ├─────────────────────────────>│                              │
    │                              │                              │
    │                              │  Validate credentials        │
    │                              ├─────────────────────────────>│
    │                              │                              │
    │                              │  User data                   │
    │                              │<─────────────────────────────┤
    │                              │                              │
    │                              │  Generate JWT token          │
    │                              │  (access + refresh)          │
    │                              │                              │
    │  {access_token, user}        │                              │
    │<─────────────────────────────┤                              │
    │                              │                              │
    │  Subsequent requests         │                              │
    │  Header: Bearer <token>      │                              │
    ├─────────────────────────────>│                              │
    │                              │                              │
    │                              │  Validate JWT signature      │
    │                              │  & expiration                │
    │                              │                              │
    │  Protected resource          │                              │
    │<─────────────────────────────┤                              │
    │                              │                              │
```

### MFA-Enabled Login Flow

```
┌────────┐                  ┌──────────────┐                 ┌──────────┐
│ Client │                  │ Auth Service │                 │ Database │
└───┬────┘                  └──────┬───────┘                 └────┬─────┘
    │                              │                              │
    │  POST /api/v1/auth/login     │                              │
    ├─────────────────────────────>│                              │
    │                              │                              │
    │                              │  Check MFA enabled           │
    │                              ├─────────────────────────────>│
    │                              │                              │
    │  {requires_mfa: true,        │                              │
    │   temp_token}                │                              │
    │<─────────────────────────────┤                              │
    │                              │                              │
    │  POST /api/v1/auth/mfa/verify│                              │
    │  {temp_token, code: "123456"}│                              │
    ├─────────────────────────────>│                              │
    │                              │                              │
    │                              │  Verify TOTP code            │
    │                              │                              │
    │  {access_token, user}        │                              │
    │<─────────────────────────────┤                              │
    │                              │                              │
```

---

## MFA/2FA Implementation

### How It Works

1. **Enable MFA**: User enables MFA, receives QR code & backup codes
2. **Scan QR Code**: User scans QR with authenticator app (Google Authenticator, Authy, etc.)
3. **Verify Setup**: User submits first TOTP code to verify setup
4. **Login with MFA**: On login, user provides username/password + TOTP code
5. **Backup Codes**: If app unavailable, user can use backup codes

### Technologies Used

- **Google2FA Library** - TOTP generation & validation
- **QR Code Generation** - Via BaconQRCode
- **Time-based OTP** - 30-second windows
- **Backup Codes** - 10 single-use recovery codes

### Sample Code

```php
// Enable MFA
public function enableMfa(Request $request)
{
    $user = $request->user();

    // Generate secret
    $secret = Google2FA::generateSecretKey();

    // Generate QR code
    $qrCode = Google2FA::getQRCodeInline(
        config('app.name'),
        $user->email,
        $secret
    );

    // Generate backup codes
    $backupCodes = $this->generateBackupCodes();

    // Store in database
    MfaToken::create([
        'user_id' => $user->id,
        'secret' => encrypt($secret),
        'backup_codes' => encrypt(json_encode($backupCodes)),
    ]);

    return response()->json([
        'qr_code' => $qrCode,
        'secret' => $secret,
        'backup_codes' => $backupCodes,
    ]);
}

// Verify TOTP code
public function verifyMfa(Request $request)
{
    $user = $request->user();
    $code = $request->input('code');

    $mfaToken = MfaToken::where('user_id', $user->id)->first();
    $secret = decrypt($mfaToken->secret);

    $valid = Google2FA::verifyKey($secret, $code);

    if ($valid) {
        // Generate full access token
        return $this->generateTokens($user);
    }

    return response()->json(['error' => 'Invalid code'], 401);
}
```

---

## Testing

### Run Tests

```bash
# Run all tests
php artisan test

# Run specific test
php artisan test --filter AuthTest

# Run with coverage
php artisan test --coverage

# Run feature tests only
php artisan test tests/Feature
```

### Manual Testing

```bash
# 1. Health check
curl http://localhost:8081/api/v1/health

# 2. Login
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# 3. Get current user
TOKEN="your_access_token"
curl http://localhost:8081/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 4. Logout
curl -X POST http://localhost:8081/api/v1/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

## Troubleshooting

### JWT Token Invalid

**Problem**: Token validation fails dengan error "Invalid signature"

**Solution**:
```bash
# Check JWT_SECRET is the same in all .env files
grep JWT_SECRET .env
grep JWT_SECRET ../dashboard-service/.env
grep JWT_SECRET ../sister-service/.env

# Generate new secret if needed
openssl rand -base64 32

# Update all .env files with the same secret
# Restart services
```

### MFA QR Code Not Displaying

**Problem**: QR code returns base64 but not rendering

**Solution**:
- Ensure `bacon/bacon-qr-code` package is installed
- Check image data format: `data:image/png;base64,...`
- Verify frontend properly renders base64 images

### Database Connection Failed

**Problem**: SQLSTATE[08001] Connection refused

**Solution**:
```bash
# Check SQL Server running
docker ps | grep sqlserver

# Test connection from container
docker exec -it myunila-auth-service php artisan tinker
>>> DB::connection()->getPdo();

# Check .env database credentials
cat .env | grep DB_
```

### Redis Connection Failed

**Problem**: Connection to redis:6379 failed

**Solution**:
```bash
# Check Redis running
docker ps | grep redis

# Test Redis connection
docker exec -it myunila-redis redis-cli ping
# Should return: PONG

# Restart Redis
docker-compose restart redis
```

---

## Development

### Code Style

```bash
# Run Pint (Laravel code formatter)
./vendor/bin/pint

# Check for issues without fixing
./vendor/bin/pint --test
```

### Generate API Documentation

```bash
# Generate Swagger documentation
php artisan l5-swagger:generate

# Access at: http://localhost:8081/api/documentation
```

### Debugging

```bash
# Real-time log viewer
php artisan pail

# Or tail log file
tail -f storage/logs/laravel.log
```

---

## Related Documentation

- [Main Backend README](../README.md)
- [Dashboard Service README](../dashboard-service/README.md)
- [Sister Service README](../sister-service/README.md)
- [Kong JWT Testing Guide](../KONG-JWT-TESTING.md)

---

## License

Copyright © 2025 UPA TIK Universitas Lampung. All rights reserved.

---

**Built with ❤️ by UPA TIK Universitas Lampung**
