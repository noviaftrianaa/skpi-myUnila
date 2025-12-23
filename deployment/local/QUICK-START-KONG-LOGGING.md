# Quick Start: Kong Centralized Logging

## 🚀 Deployment Steps

### 1️⃣ Rebuild Auth Service

```bash
cd C:\laragon\www\my-unila\deployment\local
bash deploy.sh
```

**Pilih option:** `24) Quick Dev Rebuild - Auth Only`

Ini akan:
- Rebuild auth-service dengan KongLogController baru
- Tidak rebuild service lain (lebih cepat)
- Menggunakan cache (lebih cepat)

---

### 2️⃣ Setup Kong Routes dengan Logging

```bash
# Masih di menu deploy.sh
# Atau jalankan lagi: bash deploy.sh
```

**Pilih option:** `20) Setup Kong Routes`

Ini akan:
- Setup semua Kong routes (auth, dashboard, sister, feeder, myunila)
- Enable HTTP Log plugin di setiap route
- Configure log receiver endpoint: `http://myunila-nginx:80/api/v1/internal/kong-logs`

---

### 3️⃣ Verify Setup

```bash
cd scripts

# Test 1: Check log receiver health
curl http://localhost:8081/api/v1/internal/kong-logs/health

# Expected response:
# {
#   "service": "Kong Log Receiver",
#   "status": "healthy",
#   "timestamp": "2025-12-23T12:30:00Z"
# }
```

---

### 4️⃣ Test Logging

```bash
# Test 2: Run full test suite
bash test-kong-logging.sh YOUR_JWT_TOKEN

# Or test individual endpoints:

# Public endpoint (no auth)
curl http://localhost:9800/dashboard-service/public/api/v1/unila/statistics

# Protected endpoint (with auth)
curl http://localhost:9800/auth-service/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 5️⃣ Check Database

```sql
-- Check if logs are being recorded
SELECT TOP 10
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

**Expected Result:**
- Logs from all services (auth-service, dashboard-service, etc.)
- Each request through Kong creates a log entry
- Contains service name, latency, status, etc.

---

### 6️⃣ Test Frontend Pagination

Open in browser:

1. **Log Akses (Role-based):**
   http://localhost:3001/dashboard/manajemen-akses/logger/log-akses

2. **Log Akses JWT:**
   http://localhost:3001/dashboard/manajemen-akses/logger/log-akses-jwt

**What to check:**
- ✅ Pagination controls appear at bottom
- ✅ "Menampilkan X - Y dari Z data" displays correctly
- ✅ Can change rows per page (5, 10, 25, 50, Semua)
- ✅ Can navigate between pages
- ✅ Sorting works on sortable columns
- ✅ Search/filter works

---

## 🔍 Troubleshooting

### Issue 1: Health endpoint returns 502

**Check:**
```bash
docker ps | grep auth-service
docker logs myunila-auth-service --tail 50
```

**Solution:**
- Wait a few seconds for container to be fully ready
- Check if auth-service is running: `docker restart myunila-auth-service`

---

### Issue 2: No logs in database

**Check Kong plugins:**
```bash
curl http://localhost:9801/routes | python -m json.tool | grep -A 5 "http-log"
```

**Solution:**
```bash
# Re-run Kong setup
cd scripts
bash setup-kong-routes.sh

# Or add logging to existing routes
bash kong-setup-logging.sh
```

---

### Issue 3: Logs have null id_log_jwt

**This is normal for:**
- Public endpoints (no authentication required)
- Failed authentication attempts
- Requests without valid JWT token

**Only authenticated requests will have id_log_jwt populated.**

---

### Issue 4: Pagination not showing

**Check:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors

**Common issue:**
- Data not loading: Check API endpoint in Network tab
- Props mismatch: Fixed in latest code (serverSide={true})

---

## 📊 What Gets Logged

### From ALL Services via Kong:

| Service | Endpoints | Example URLs |
|---------|-----------|--------------|
| Auth Service | All auth endpoints | `/api/v1/auth/login`, `/api/v1/manakses/pengguna` |
| Dashboard Service | Public & protected | `/public/api/v1/dosen/statistics`, `/api/v1/my-favorites` |
| Sister Service | API & public photo | `/api/v1/dosen`, `/public/api/v1/dosen/photo/{id}` |
| Feeder Service | All feeder endpoints | `/api/v1/feeder/*` |
| MyUnila Service | SIKEP endpoints | `/api/v1/myunila/*` |

### Log Data Stored:

```json
{
  "id_log_jwt": "uuid-or-null",
  "menu_akses": "/api/v1/manakses/pengguna?page=1",
  "method": "GET",
  "request_list": {
    "service": "auth-service",
    "route": "auth-service-route",
    "latency_ms": 45,
    "request_size": 0,
    "response_size": 1234,
    "user_agent": "Mozilla/5.0..."
  },
  "waktu_akses": "2025-12-23 12:00:00",
  "a_berhasil": 1,
  "ket": "Success via auth-service"
}
```

---

## ✅ Success Criteria

After deployment, you should see:

1. ✅ Health endpoint returns healthy status
2. ✅ Kong routes are set up with HTTP Log plugin
3. ✅ Requests through Kong return valid responses
4. ✅ Database shows new log entries after each request
5. ✅ Frontend logger pages show pagination controls
6. ✅ Logs contain service name, latency, status

---

## 📚 References

- Full documentation: `docs/KONG-CENTRALIZED-LOGGING.md`
- Kong setup script: `scripts/setup-kong-routes.sh`
- Logging setup script: `scripts/kong-setup-logging.sh`
- Test script: `scripts/test-kong-logging.sh`
- Controller: `backend/auth-service/app/Http/Controllers/Api/Logger/KongLogController.php`

---

## 🎯 Next Steps After Testing

If everything works:

1. **Monitor Performance:**
   ```sql
   -- Average latency by service
   SELECT
       JSON_VALUE(request_list, '$.service') as service,
       AVG(CAST(JSON_VALUE(request_list, '$.latency_ms') AS INT)) as avg_latency,
       COUNT(*) as requests
   FROM logger.log_akses_jwt
   WHERE waktu_akses >= DATEADD(hour, -1, GETDATE())
   GROUP BY JSON_VALUE(request_list, '$.service');
   ```

2. **Setup Log Retention:**
   - Create SQL job to delete logs older than 90 days
   - Archive old logs to separate table if needed

3. **Create Monitoring Dashboard:**
   - Add charts to frontend for real-time monitoring
   - Alert on high error rates or slow endpoints

4. **Optimize if Needed:**
   - Increase Kong `queue_size` if high traffic
   - Adjust `flush_timeout` for better batching
   - Consider async queue (Redis/RabbitMQ) for very high traffic

---

**Good luck with the deployment! 🚀**
