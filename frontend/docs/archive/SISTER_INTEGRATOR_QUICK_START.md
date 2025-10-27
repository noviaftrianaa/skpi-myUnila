# 🚀 SISTER Integrator - Quick Start Guide

Quick reference untuk menjalankan SISTER Integrator.

---

## ⚡ TL;DR - Langkah Cepat

```bash
# 1. Run database migration
sqlcmd -S localhost -U sa -P "YourPassword" -d pddikti \
  -i backend/sister-service/migrations/001_create_ref_schema_and_agama_table.sql

# 2. Check backend running
docker ps | grep sister

# 3. Start frontend
cd frontend && npm run dev

# 4. Access
# http://localhost:3000/portal
# Click "SISTER Integrator" card
```

---

## 📋 Pre-requisites

- [x] Backend sister-service running (port 8083)
- [x] Database SQL Server ready
- [x] Migration script executed
- [x] Valid SISTER API token di backend
- [x] User dengan role "Developer"

---

## 🗄️ Database Setup (WAJIB!)

### Option 1: SQL Server Management Studio (SSMS)

1. Open SSMS
2. Connect to SQL Server
3. Open file: `backend/sister-service/migrations/001_create_ref_schema_and_agama_table.sql`
4. Execute (F5)
5. Verify:
```sql
SELECT * FROM ref.lv_agama;
```

### Option 2: sqlcmd (Command Line)

```bash
sqlcmd -S localhost -U sa -P "YourPassword" -d pddikti \
  -i backend/sister-service/migrations/001_create_ref_schema_and_agama_table.sql
```

### Verification Query

```sql
-- Check if schema and table exist
SELECT
    SCHEMA_NAME(schema_id) AS SchemaName,
    name AS TableName
FROM sys.tables
WHERE schema_id = SCHEMA_ID('ref');

-- Should return:
-- SchemaName | TableName
-- ref        | lv_agama
-- ref        | sync_history
```

---

## 🔧 Frontend Configuration

**File**: `frontend/.env.local`

```env
# Via Kong Gateway (Recommended - Production)
NEXT_PUBLIC_SISTER_API_URL=http://localhost:9800/sister-service/api/v1

# Direct Access (Development Only)
# NEXT_PUBLIC_SISTER_API_URL=http://localhost:8083/api/v1
```

---

## 🎯 Access Points

| Page | URL | Description |
|------|-----|-------------|
| Portal | `http://localhost:3000/portal` | App launcher |
| Dashboard | `http://localhost:3000/dashboard/sister-integrator` | Main dashboard |
| Agama Sync | `http://localhost:3000/dashboard/sister-integrator/referensi/agama` | Sync page |

---

## 🧪 Testing Steps

### 1. Login
- URL: `http://localhost:3000/login`
- Email: (developer account)
- Password: (your password)

### 2. Open Portal
- Go to: `http://localhost:3000/portal`
- Find: "SISTER Integrator" card (purple, government icon)
- Click card

### 3. Test Dashboard
- Verify statistics cards load
- Check system health shows "All Healthy"
- Click "Referensi > Agama" in sidebar

### 4. Test Sync
1. Click **"Sinkronisasi Data"** button
2. Confirmation modal appears → Click **"Mulai Sinkronisasi"**
3. Progress modal shows → Wait for 100%
4. Success message appears
5. Table populates with data
6. Verify data in table

---

## 🔍 Verification Checklist

### Backend Health
```bash
# Check service running
docker ps | grep sister
# Expected: myunila-sister-service (Up, port 8083)

# Check health endpoint
curl http://localhost:8083/health
# Expected: {"service":"Sister Service","status":"ok"}

# Check logs
docker logs myunila-sister-service --tail 20
```

### Database
```sql
-- Check schema exists
SELECT * FROM sys.schemas WHERE name = 'ref';

-- Check table structure
EXEC sp_help 'ref.lv_agama';

-- Check data after sync
SELECT * FROM ref.lv_agama;
```

### Frontend
1. Portal card visible? ✅
2. Dashboard loads? ✅
3. Sync button works? ✅
4. Progress modal shows? ✅
5. Data appears in table? ✅
6. Toast notification shows? ✅

---

## 🐛 Common Issues

### ❌ "Invalid object name 'ref.lv_agama'"

**Fix**: Run database migration script (see Database Setup above)

### ❌ "401 Unauthorized"

**Fix**:
- Token expired → Login again
- Not Developer role → Contact admin

### ❌ "Failed to fetch agama"

**Fix**:
```bash
# Check backend logs
docker logs myunila-sister-service --tail 50

# Check database connection
# Verify DB_HOST, DB_USER, DB_PASSWORD in docker-compose.yml
```

### ❌ Card not showing in portal

**Fix**:
- Login sebagai role "Developer"
- Clear browser cache
- Check `requireRole: "Developer"` in portal page

---

## 🎨 Key UI Elements

### Icons
- 🏛️ Main: `RiGovernmentFill` (Government building)
- 🔄 Sync: `FiRefreshCw` (Refresh with spin)
- ✅ Success: `FiCheckCircle`
- ❌ Error: `FiAlertCircle`

### Colors
- **Primary**: Purple gradient (`bg-purple-600`)
- **Success**: Green
- **Error**: Red
- **Info**: Blue

### Animations
- Spin on sync button during loading
- Progress bar pulse
- Card hover lift effect
- Smooth transitions (300ms)

---

## 📊 API Endpoints

### Get All Agama
```bash
GET /api/v1/referensi/agama
Authorization: Bearer {token}
```

### Sync Agama
```bash
POST /api/v1/referensi/agama/sync
Authorization: Bearer {token}
Content-Type: application/json

# No body needed - username extracted from JWT
```

---

## 📱 Mobile Testing

1. Resize browser window to mobile size (< 640px)
2. Verify responsive layout
3. Test sidebar menu collapse
4. Test modals on mobile
5. Test table horizontal scroll

---

## 🚀 Deployment Checklist

### Before Deploy
- [ ] Database migration executed
- [ ] Environment variables configured
- [ ] Backend service healthy
- [ ] SISTER API token valid
- [ ] SSL certificates (production)
- [ ] CORS configured on Kong Gateway

### After Deploy
- [ ] Test login
- [ ] Test portal access
- [ ] Test dashboard load
- [ ] Test sync operation
- [ ] Test role-based access
- [ ] Monitor logs for errors

---

## 📚 Documentation Links

- **Implementation Summary**: `/IMPLEMENTATION_SUMMARY_SISTER_INTEGRATOR.md`
- **Frontend Docs**: `/frontend/SISTER_INTEGRATOR_README.md`
- **Migration Docs**: `/backend/sister-service/migrations/README.md`
- **Sister Service Docs**: `/backend/sister-service/README.md`

---

## 💡 Pro Tips

1. **Always run migration first** sebelum test sync
2. **Use Kong Gateway URL** untuk production
3. **Check logs** jika ada error
4. **Clear browser cache** jika ada masalah styling
5. **Use Developer role** untuk testing
6. **Monitor sync_history table** untuk audit trail

---

## 📞 Need Help?

1. Check documentation files listed above
2. Check backend logs: `docker logs myunila-sister-service`
3. Check browser console (F12)
4. Check database tables dan data
5. Contact dev team

---

**Last Updated**: 23 Oktober 2025
**Status**: Ready for Testing ✅

---

## 🎯 Quick Commands Reference

```bash
# Backend
docker ps | grep sister                           # Check status
docker logs myunila-sister-service --tail 50      # View logs
docker restart myunila-sister-service             # Restart service
curl http://localhost:8083/health                 # Test health

# Frontend
cd frontend
npm run dev                                       # Start dev server
npm run build                                     # Build for production
npm run start                                     # Start production server

# Database
sqlcmd -S localhost -U sa -d pddikti -Q "SELECT * FROM ref.lv_agama"
```

---

**Happy Coding! 🚀**
