# SISTER Integrator Frontend

Implementasi frontend untuk SISTER Integrator - sistem integrasi dengan SISTER API Kemenristekdikti.

## 📋 Overview

SISTER Integrator adalah aplikasi dashboard untuk mengelola sinkronisasi data referensi dari SISTER API Kemenristekdikti ke database MyUnila. Frontend ini dibangun dengan:

- **Framework**: Next.js 14 (App Router)
- **UI Library**: HeroUI (NextUI fork)
- **State Management**: React Hooks
- **HTTP Client**: Axios with interceptors
- **Authentication**: JWT Token (via Auth Service)

## 🏗️ Struktur Direktori

```
frontend/src/
├── app/
│   ├── dashboard/
│   │   └── sister-integrator/
│   │       ├── config/
│   │       │   └── menuConfig.tsx         # Menu sidebar configuration
│   │       ├── referensi/
│   │       │   └── agama/
│   │       │       └── page.tsx           # Halaman sync agama
│   │       └── page.tsx                   # Dashboard utama
│   └── portal/
│       └── page.tsx                       # Portal apps (updated icon & href)
├── lib/
│   └── services/
│       └── sisterService.ts               # API service layer
└── shared/
    └── components/
        └── dashboard/
            └── DashboardLayout.tsx        # Reusable dashboard layout
```

## 🚀 Fitur

### 1. Dashboard Utama
- **Overview Statistics**: Total records, success rate, API status, pending tasks
- **Recent Sync Activities**: Aktivitas sinkronisasi terbaru
- **Referensi Modules**: Card navigasi ke masing-masing module (Agama, Negara, Wilayah)
- **System Health**: Status koneksi API dan database
- **Quick Actions**: Tombol quick sync dan monitoring

### 2. Halaman Sync Referensi (Agama)
- **Data Table**: Menampilkan data agama yang sudah tersinkronisasi
- **Sync Button**: Tombol untuk memulai sinkronisasi
- **Confirmation Modal**: Modal konfirmasi sebelum sync dengan informasi:
  - User yang melakukan sync
  - Source data (SISTER API)
  - Informasi proses sync
- **Progress Modal**: Modal progress dengan:
  - Progress bar real-time
  - Status sync (syncing, success, error)
  - Total records yang berhasil sync
  - Animasi dan feedback visual
- **Statistics Cards**: Total records, status sync, last sync time
- **Auto Refresh**: Data otomatis refresh setelah sync berhasil

### 3. Best Practices Implemented
✅ **Confirmation Dialog**: User harus konfirmasi sebelum melakukan sync
✅ **Progress Indicator**: Progress bar dan status real-time
✅ **Loading States**: Skeleton dan spinner untuk loading
✅ **Error Handling**: Toast notification dan error modal
✅ **Auto Refresh**: Data otomatis refresh setelah sync
✅ **User Attribution**: Mencatat user yang melakukan sync
✅ **JWT Authentication**: Semua request menggunakan JWT token
✅ **Role-Based Access**: Hanya role Developer yang bisa akses
✅ **Responsive Design**: Mobile-first responsive design

## 🔧 Konfigurasi

### Environment Variables

Tambahkan di `.env.local`:

```env
# Sister Service API URL
NEXT_PUBLIC_SISTER_API_URL=http://localhost:9800/sister-service/api/v1

# Or untuk direct access (development only)
# NEXT_PUBLIC_SISTER_API_URL=http://localhost:8083/api/v1
```

### Menu Configuration

File: `src/app/dashboard/sister-integrator/config/menuConfig.tsx`

Menu sidebar dapat dikonfigurasi dengan mudah:

```tsx
export const sisterIntegratorMenuConfig: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <MdDashboard className="w-5 h-5" />,
    href: "/dashboard/sister-integrator",
    roles: ["developer"],
  },
  {
    title: "Referensi",
    icon: <FiBookOpen className="w-5 h-5" />,
    roles: ["developer"],
    children: [
      {
        title: "Agama",
        icon: <FiDatabase className="w-4 h-4" />,
        href: "/dashboard/sister-integrator/referensi/agama",
      },
      // ... more submenu
    ],
  },
];
```

## 🔌 API Service

### Sister Service Client

File: `src/lib/services/sisterService.ts`

Service ini menggunakan Axios dengan interceptors untuk:
- Auto-inject JWT token dari localStorage
- Handle 401 unauthorized (redirect ke login)
- Consistent error handling

#### Available Methods:

**Agama Service:**
```typescript
// Get all agama
const data = await agamaService.getAll();

// Get agama by ID
const agama = await agamaService.getById(1);

// Sync from SISTER API
const result = await agamaService.sync(username);
```

**Health Check:**
```typescript
const health = await healthCheck();
```

## 📱 Components

### 1. Dashboard Layout
Reusable layout component dengan:
- Sidebar navigation dengan menu collapse
- Top navbar dengan user info
- Responsive mobile menu
- Page title breadcrumb

### 2. Sync Page Components
- **Statistics Cards**: Overview data sync
- **Data Table**: HeroUI Table dengan sorting dan filtering
- **Confirmation Modal**: HeroUI Modal untuk konfirmasi
- **Progress Modal**: Modal dengan progress bar dan status
- **Toast Notifications**: React Hot Toast untuk feedback

## 🎨 Styling

### Design System
- **Primary Color**: Purple gradient (from-purple-600 to-indigo-600)
- **Icons**:
  - Dashboard: RiGovernmentFill (Government building icon)
  - Sync: FiRefreshCw
  - Data: FiDatabase
  - Success: FiCheckCircle
  - Error: FiAlertCircle

### Responsive Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🔐 Authentication & Authorization

### JWT Token Flow
1. User login via Auth Service
2. Token disimpan di localStorage
3. Axios interceptor inject token ke setiap request
4. Backend validate token dan role
5. Jika token invalid/expired, redirect ke login

### Role-Based Access
- Hanya role **Developer** yang bisa akses SISTER Integrator
- Portal page otomatis filter berdasarkan role
- Backend juga validate role di middleware

## 🧪 Testing

### Manual Testing

1. **Start Backend Services:**
```bash
cd backend
docker-compose up -d
```

2. **Start Frontend:**
```bash
cd frontend
npm run dev
```

3. **Login sebagai Developer:**
- Email: `mizar.zulmi1073@students.unila.ac.id`
- Password: (your password)

4. **Akses SISTER Integrator:**
- Portal: `http://localhost:3000/portal`
- Klik card "SISTER Integrator"
- Dashboard: `http://localhost:3000/dashboard/sister-integrator`

5. **Test Sync:**
- Navigasi ke "Referensi > Agama"
- Klik "Sinkronisasi Data"
- Konfirmasi pada modal
- Tunggu progress selesai
- Verify data muncul di table

### API Testing (Optional)

Test backend API directly:

```bash
# Get token first
TOKEN="your_jwt_token"

# Health check
curl http://localhost:8083/health

# Get all agama (requires auth)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:9800/sister-service/api/v1/referensi/agama

# Sync agama (requires auth + developer role)
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  http://localhost:9800/sister-service/api/v1/referensi/agama/sync
```

## 📊 Flow Diagram

### Sync Flow
```
User Click "Sinkronisasi Data"
        ↓
Confirmation Modal Opens
        ↓
User Click "Mulai Sinkronisasi"
        ↓
Progress Modal Opens (0%)
        ↓
API Call to /referensi/agama/sync
        ↓
Progress Updates (10% → 90%)
        ↓
API Response Received
        ↓
Progress 100% + Success Status
        ↓
Toast Notification
        ↓
Auto Refresh Data (2s delay)
        ↓
Modal Closes + Table Updated
```

## 🐛 Troubleshooting

### Issue: "Failed to fetch agama"
**Solusi:**
1. Check backend service running: `docker ps | grep sister`
2. Check API URL di .env.local
3. Check JWT token valid (F12 > Application > localStorage)

### Issue: "401 Unauthorized"
**Solusi:**
1. Token expired - login ulang
2. Role bukan Developer - contact admin untuk role assignment

### Issue: Progress stuck at 90%
**Solusi:**
1. Check backend logs: `docker logs myunila-sister-service`
2. Check SISTER API token valid di backend
3. Check network connectivity

### Issue: Data tidak muncul setelah sync
**Solusi:**
1. Refresh manual dengan tombol "Refresh"
2. Check browser console untuk error
3. Check backend database connection

## 🔄 Future Enhancements

- [ ] Tambah module Negara dan Wilayah
- [ ] Implementasi scheduled sync
- [ ] Add sync history/logs page
- [ ] Export data to Excel/CSV
- [ ] Real-time sync status dengan WebSocket
- [ ] Bulk sync all referensi
- [ ] Sync rollback feature
- [ ] Advanced filtering dan search

## 📝 Notes

- **Production**: Ganti BASE_URL ke Kong Gateway yang benar
- **SISTER Token**: Pastikan backend punya valid SISTER API token
- **Rate Limiting**: SISTER API mungkin punya rate limit, handle dengan graceful degradation
- **Logging**: Semua sync activity logged dengan username untuk audit trail

## 👥 Team

**Frontend Development**: MyUnila Dev Team
**Backend Integration**: Sister Service Team
**API Provider**: SISTER Kemenristekdikti

---

Untuk pertanyaan atau issue, silakan buat ticket di repository issue tracker.
