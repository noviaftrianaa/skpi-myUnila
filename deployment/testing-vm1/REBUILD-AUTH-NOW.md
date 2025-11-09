# 🚀 Rebuild Auth Service - Jalankan Sekarang!

## Masalah
Login timeout 504 setelah 60 detik karena query `getUserDetail()` terlalu lambat.

## Solusi
Query `getUserDetail()` sudah dibuat optional dengan try-catch. Login akan berhasil meskipun query lambat.

## ✅ Yang Sudah Di-push ke Repository

1. **AuthService.php** - getUserDetail wrapped in try-catch
2. **rebuild-auth-service.sh** - Script otomatis untuk rebuild

## 📋 Langkah-langkah di Server

### 1. SSH ke Server
```bash
ssh root@192.168.123.172
```

### 2. Pull Latest Code
```bash
cd /var/www/my-unila
git pull
```

Expected output:
```
Updating 30018a21..f87000b7
Fast-forward
 backend/auth-service/app/Services/Auth/AuthService.php           | 24 ++++++++++---
 deployment/testing-vm1/scripts/rebuild-auth-service.sh           | 106 ++++++++++++++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 126 insertions(+), 4 deletions(-)
```

### 3. Make Script Executable
```bash
chmod +x deployment/testing-vm1/scripts/rebuild-auth-service.sh
```

### 4. Run Rebuild Script
```bash
cd deployment/testing-vm1/scripts
./rebuild-auth-service.sh
```

Script akan:
- ✅ Stop auth-service
- ✅ Rebuild Docker image dengan kode terbaru
- ✅ Start auth-service
- ✅ Show logs dan status

**PENTING**: Rebuild akan memakan waktu 2-3 menit (downloading packages, installing dependencies).

### 5. Test Login
```bash
curl -v -X POST http://192.168.123.172:9800/auth-service/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2024"}'
```

## ✅ Expected Result

**Sebelum fix**: 504 Gateway Timeout setelah 60 detik
**Setelah fix**: 200 OK dalam < 5 detik dengan response:

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
      "roles": ["Super Admin"],
      "satuan_pendidikan": null,
      "fakultas": null,
      "jurusan": null,
      "prodi": null
    },
    "tokens": {
      "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
      "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
      "token_type": "bearer",
      "expires_in": 900
    }
  }
}
```

**Note**: Field `satuan_pendidikan`, `fakultas`, `jurusan`, `prodi` akan null karena query kompleks di-skip untuk menghindari timeout. User tetap bisa login dan dapat token.

## 🔍 Jika Masih Error

### Check Logs
```bash
docker logs myunila-auth-service --tail 100
```

### Check Laravel Logs
```bash
docker exec myunila-auth-service cat /var/www/storage/logs/laravel.log | tail -100
```

Cari pesan:
```
getUserDetail query timeout, using basic user info
```

Ini menandakan query di-skip dan login tetap berhasil.

## 📊 Monitoring

Setelah rebuild, test beberapa kali untuk memastikan konsisten:

```bash
# Test 1
time curl -X POST http://192.168.123.172:9800/auth-service/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2024"}'

# Test 2
time curl -X POST http://192.168.123.172:9800/auth-service/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2024"}'

# Test 3
time curl -X POST http://192.168.123.172:9800/auth-service/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2024"}'
```

Expected time: **real 0m2-5s** (bukan 1m0s seperti sebelumnya)

## 🔧 Troubleshooting

### Rebuild Gagal - Composer Error
```bash
# Clear Docker build cache
docker builder prune -f

# Rebuild lagi
cd /var/www/my-unila/deployment/testing-vm1/services/3-backend
docker compose -f docker-compose.auth.yml build --no-cache auth-service
docker compose -f docker-compose.auth.yml up -d
```

### Container Tidak Start
```bash
# Check logs
docker logs myunila-auth-service

# Check environment variables
docker exec myunila-auth-service env | grep -E "^APP_|^DB_|^JWT_"
```

### Masih 504 Timeout
```bash
# Kemungkinan Kong timeout masih 60s
cd /var/www/my-unila/deployment/testing-vm1/services/2-gateway
docker compose -f docker-compose.kong.yml restart

# Wait 15 seconds
sleep 15

# Test lagi
curl -v -X POST http://192.168.123.172:9800/auth-service/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2024"}'
```

## 📚 Long-term Optimization (Optional)

Untuk mendapatkan kembali organizational info (fakultas, jurusan, prodi), perlu optimasi query:

1. **Add Database Indexes** - Lihat `AUTH-LOGIN-ISSUE-ANALYSIS.md`
2. **Redis Caching** - Cache hasil getUserDetail
3. **Simplify Query** - Pindahkan string formatting ke PHP
4. **Separate Endpoint** - Load org details asynchronously

Tapi untuk saat ini, login sudah bisa jalan dengan fix ini! 🎉
