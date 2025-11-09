# Fix Auth-Service Error 500 - Instruksi Lengkap

## Masalah
- Auth service sempat bisa login tetapi server return error 500
- Konfigurasi auth-service perlu disamakan dengan dashboard-service yang sudah jalan

## Yang Sudah Diperbaiki

### 1. Docker Compose Configuration
File `services/3-backend/docker-compose.auth.yml` sekarang:
- ✅ Menggunakan `env_file: - ../../.env` (seperti dashboard-service)
- ✅ Semua environment variables di-quote dengan `"${VAR}"`
- ✅ Menambahkan `APLIKASI_ID` untuk login logging
- ✅ Healthcheck menggunakan process check (bukan curl)

### 2. Environment Variable Script
File `scripts/update-auth-env.sh` sekarang:
- ✅ Meng-update `AUTH_APLIKASI_ID=1` (untuk login logging)
- ✅ Generate `AUTH_APP_KEY` baru
- ✅ Generate `JWT_SECRET` baru
- ✅ Populate semua AUTH_* variables dari DB_MSSQL_* values

### 3. Automated Fix Script
File `scripts/fix-auth-service.sh` dibuat untuk:
- ✅ Copy semua file yang sudah di-update
- ✅ Run update-auth-env.sh
- ✅ Restart auth-service
- ✅ Verify semua konfigurasi
- ✅ Test database dan Redis connectivity

## Cara Menjalankan Fix

### SSH ke Server sebagai Root atau sudo user

```bash
# Login ke server
ssh root@192.168.123.172

# Atau jika login sebagai ubuntu23, gunakan sudo
ssh ubuntu23@192.168.123.172
```

### Jalankan Fix Script

```bash
# Copy script dari home directory dan jalankan
chmod +x ~/fix-auth-service.sh
sudo ~/fix-auth-service.sh
```

Script ini akan:
1. Copy semua file yang sudah di-update ke lokasi yang benar
2. Populate environment variables dari .env
3. Stop auth-service container
4. Start dengan konfigurasi baru
5. Verify semua environment variables
6. Test database connectivity
7. Test Redis connectivity
8. Show container logs

## Jika Ada Error

### Error: Permission Denied
```bash
# Gunakan sudo
sudo ~/fix-auth-service.sh
```

### Error: File not found
```bash
# Manual copy files dari home directory
sudo cp ~/docker-compose.auth.yml /var/www/my-unila/deployment/testing-vm1/services/3-backend/
sudo cp ~/update-auth-env.sh /var/www/my-unila/deployment/testing-vm1/scripts/
sudo cp ~/diagnose-auth-login.sh /var/www/my-unila/deployment/testing-vm1/scripts/
sudo chmod +x /var/www/my-unila/deployment/testing-vm1/scripts/*.sh

# Then run update and restart
cd /var/www/my-unila/deployment/testing-vm1/scripts
sudo ./update-auth-env.sh
sudo ./restart-auth-with-env.sh
```

## Verifikasi Setelah Fix

### 1. Check Container Status
```bash
docker ps --filter "name=myunila-auth-service"
```
Expected: Status = "Up" (healthy)

### 2. Check Environment Variables
```bash
docker exec myunila-auth-service env | grep -E "^APP_|^DB_|^REDIS_|^JWT_|^APLIKASI_"
```
Expected output:
```
APLIKASI_ID=1
APP_DEBUG=false
APP_ENV=production
APP_KEY=base64:...
APP_NAME=MyUnila Auth Service
APP_URL=http://192.168.123.172:9800/auth-service
DB_CONNECTION=sqlsrv
DB_DATABASE=db_myunila
DB_HOST=10.10.110.111
DB_PASSWORD=***
DB_PORT=1433
DB_USERNAME=sa_myunila
JWT_ACCESS_TOKEN_TTL=900
JWT_ALGORITHM=HS256
JWT_REFRESH_TOKEN_TTL=604800
JWT_SECRET=base64:...
REDIS_HOST=redis
REDIS_PORT=6379
```

### 3. Check Container Logs
```bash
docker logs myunila-auth-service --tail 50
```
Tidak boleh ada error seperti:
- ❌ "could not find driver"
- ❌ "Connection refused"
- ❌ "SQLSTATE[IMSSP]"
- ❌ Fatal errors

### 4. Test Health Endpoint
```bash
curl http://192.168.123.172:9800/auth-service/api/health
```
Expected:
```json
{
  "status": "ok",
  "timestamp": "2025-11-09T...",
  "service": "MyUnila Auth Service",
  "database": "connected"
}
```

### 5. Test Login Endpoint
```bash
curl -v -X POST http://192.168.123.172:9800/auth-service/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2024"}'
```

**Expected (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "username": "admin",
      "email": "admin@example.com",
      "role": "Super Admin",
      "roles": ["Super Admin"]
    },
    "tokens": {
      "access_token": "eyJ0eXAi...",
      "refresh_token": "eyJ0eXAi...",
      "token_type": "bearer",
      "expires_in": 900
    }
  }
}
```

**If Still Getting 500 Error:**
```bash
# Run diagnostic script
cd /var/www/my-unila/deployment/testing-vm1/scripts
sudo ./diagnose-auth-login.sh
```

## Troubleshooting Login Slow (>10 detik)

Jika login berhasil tapi lambat (>10 detik), ini karena query `getUserDetail()` terlalu kompleks.

### Quick Fix (Recommended):
Edit file `backend/auth-service/app/Services/Auth/AuthService.php` line 84:

```php
// Get user detail (make it optional to avoid timeout)
try {
    $userDetail = $this->userRepo->getUserDetail($user->id_pengguna);
} catch (\Exception $e) {
    Log::warning('getUserDetail failed, using basic user info', ['user_id' => $user->id_pengguna]);
    $userDetail = null;
}
```

Kemudian rebuild auth-service:
```bash
cd /var/www/my-unila/deployment/testing-vm1/services/3-backend
docker compose -f docker-compose.auth.yml down
docker compose -f docker-compose.auth.yml build --no-cache auth-service
docker compose -f docker-compose.auth.yml up -d
```

### Long-term Fix:
Baca file `AUTH-LOGIN-ISSUE-ANALYSIS.md` untuk solusi jangka panjang (database indexes, caching, dll)

## Konfigurasi Kong Timeout

Jika masih ada 504 Gateway Timeout, restart Kong:

```bash
cd /var/www/my-unila/deployment/testing-vm1/services/2-gateway
sudo docker compose -f docker-compose.kong.yml restart
sleep 15

# Verify Kong timeout config
docker exec myunila-kong-gateway env | grep TIMEOUT
```

Expected:
```
KONG_UPSTREAM_CONNECT_TIMEOUT=180000
KONG_UPSTREAM_SEND_TIMEOUT=180000
KONG_UPSTREAM_READ_TIMEOUT=180000
```

## Fix Frontend (Jika Perlu)

Frontend mengirim field `"email"` tetapi endpoint auth expect `"username"`.

Update login form component:
```javascript
// Change from:
const loginData = {
  email: formData.email,  // ❌ WRONG
  password: formData.password
};

// To:
const loginData = {
  username: formData.username,  // ✅ CORRECT
  password: formData.password
};
```

## Summary Checklist

Setelah menjalankan fix, pastikan:

- ✅ Container auth-service running (status: Up)
- ✅ Environment variables terisi semua (APP_KEY, DB_HOST, JWT_SECRET, etc.)
- ✅ Database connection berhasil
- ✅ Redis connection berhasil
- ✅ Health endpoint return 200 OK
- ✅ Login endpoint return 200 OK (bukan 500, bukan 504)
- ✅ Login response contains `access_token` dan `refresh_token`
- ✅ Login selesai dalam < 10 detik

## File-file Penting

1. **Docker Compose**: [services/3-backend/docker-compose.auth.yml](services/3-backend/docker-compose.auth.yml)
2. **Environment Script**: [scripts/update-auth-env.sh](scripts/update-auth-env.sh)
3. **Restart Script**: [scripts/restart-auth-with-env.sh](scripts/restart-auth-with-env.sh)
4. **Fix Script**: [scripts/fix-auth-service.sh](scripts/fix-auth-service.sh)
5. **Diagnostic Script**: [scripts/diagnose-auth-login.sh](scripts/diagnose-auth-login.sh)
6. **Analysis Document**: [AUTH-LOGIN-ISSUE-ANALYSIS.md](AUTH-LOGIN-ISSUE-ANALYSIS.md)

## Kontak / Help

Jika masih ada masalah setelah menjalankan fix:
1. Run diagnostic: `sudo ./diagnose-auth-login.sh`
2. Check Laravel logs: `docker exec myunila-auth-service cat /var/www/storage/logs/laravel.log | tail -100`
3. Check Kong logs: `docker logs myunila-kong-gateway --tail 50`
4. Share output ke team untuk analisa lebih lanjut
