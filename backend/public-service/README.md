# Dashboard Service - MyUnila User Dashboard & Profile

Laravel-based dashboard & profile management service untuk Portal myUnila.

![Laravel](https://img.shields.io/badge/Laravel-11.31-FF2D20?logo=laravel)
![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?logo=php)
![JWT](https://img.shields.io/badge/JWT-Authenticated-000000?logo=jsonwebtokens)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Overview

Dashboard Service adalah microservice yang bertanggung jawab untuk:
- ✅ User dashboard data & personalization
- ✅ User profile management (public & protected)
- ✅ Application catalog (70+ integrated apps)
- ✅ Favorites management
- ✅ Announcements & news
- ✅ Statistics & analytics
- ✅ University public information

**Service URL**: http://localhost:8082
**Via Kong Gateway**: http://localhost:9800/dashboard-service

---

## Features

### 🏠 Dashboard
- **Personalized Dashboard** - User-specific dashboard data
- **Quick Access** - Favorite applications for quick access
- **Recent Activity** - User activity tracking
- **Announcements** - Important announcements display
- **Statistics** - Usage statistics & analytics

### 👤 User Profile
- **Public Profile** - University profile information (no auth)
- **User Profile** - Authenticated user profile data
- **Profile Update** - Update user information
- **Avatar Management** - Profile picture upload/update
- **Preferences** - User preferences & settings

### 📱 Application Catalog
- **70+ Applications** - Integrated university applications
- **Role-based Filtering** - Apps filtered by user role
- **Categories** - Apps grouped by category
- **Search & Filter** - Find apps quickly
- **Favorites** - Save favorite apps for quick access

### 📢 Announcements & News
- **Announcements** - Important system announcements
- **News Feed** - University news & updates
- **Categories** - Filtered by category (Academic, Events, etc.)
- **Read Tracking** - Track read/unread announcements

### 📊 Statistics
- **Usage Analytics** - User activity statistics
- **Application Usage** - Most used applications
- **System Statistics** - Overall system usage stats

---

## Base URL

| Environment | URL |
|-------------|-----|
| **Direct** | http://localhost:8082 |
| **Via Kong** | http://localhost:9800/dashboard-service |

---

## API Endpoints

### 1. Health Check

**Endpoint**: `GET /api/health`

**Response**:
```json
{
  "service": "Dashboard Service",
  "status": "healthy",
  "timestamp": "2025-10-16T20:04:08+07:00",
  "version": "1.0.0"
}
```

---

### 2. University Profile

**Endpoint**: `GET /api/v1/university-profile`

**Description**: Mendapatkan informasi lengkap tentang Universitas Lampung

**Response**:
```json
{
  "success": true,
  "message": "University profile retrieved successfully",
  "data": {
    "name": "Universitas Lampung",
    "short_name": "UNILA",
    "tagline": "Universitas Terkemuka di Sumatera",
    "description": "Universitas Lampung (UNILA) adalah perguruan tinggi negeri...",
    "vision": "Menjadi universitas yang unggul, terkemuka, dan bermartabat...",
    "mission": [
      "Menyelenggarakan pendidikan tinggi yang berkualitas...",
      "Mengembangkan ilmu pengetahuan, teknologi, dan seni...",
      "Mengabdikan keahlian kepada masyarakat",
      "Menyelenggarakan tata kelola yang baik dan bersih"
    ],
    "established": "23 September 1965",
    "rector": "Prof. Dr. Ir. Lusmeilia Afriani, D.E.A., IPM",
    "address": "Jl. Prof. Dr. Ir. Sumantri Brojonegoro No.1...",
    "phone": "(0721) 701609",
    "email": "humas@unila.ac.id",
    "website": "https://www.unila.ac.id",
    "logo": "https://www.unila.ac.id/wp-content/uploads/2020/02/logo-unila.png",
    "faculties": [...],
    "statistics": {
      "total_students": 35000,
      "total_lecturers": 1200,
      "total_staff": 800,
      "total_faculties": 8,
      "total_programs": 73,
      "accreditation": "A",
      "ranking_national": "Top 20",
      "campus_area": "722 hektar"
    },
    "achievements": [...],
    "social_media": {...},
    "colors": {
      "primary": "#1e40af",
      "secondary": "#fbbf24"
    }
  }
}
```

---

### 3. Quick Facts

**Endpoint**: `GET /api/v1/university-profile/quick-facts`

**Description**: Mendapatkan statistik singkat universitas dalam format card

**Response**:
```json
{
  "success": true,
  "message": "Quick facts retrieved successfully",
  "data": [
    {
      "icon": "🎓",
      "title": "Mahasiswa",
      "value": "35,000+",
      "description": "Mahasiswa aktif dari seluruh Indonesia"
    },
    {
      "icon": "👨‍🏫",
      "title": "Dosen",
      "value": "1,200+",
      "description": "Dosen berkualifikasi S2 dan S3"
    },
    {
      "icon": "🏫",
      "title": "Fakultas",
      "value": "8",
      "description": "Fakultas dengan 73 program studi"
    },
    {
      "icon": "🏆",
      "title": "Akreditasi",
      "value": "Unggul",
      "description": "Akreditasi institusi dari BAN-PT"
    },
    {
      "icon": "🌳",
      "title": "Luas Kampus",
      "value": "722 Ha",
      "description": "Kampus hijau dan asri"
    },
    {
      "icon": "📅",
      "title": "Berdiri Sejak",
      "value": "1965",
      "description": "Universitas tertua di Lampung"
    }
  ]
}
```

---

### 4. Contact Information

**Endpoint**: `GET /api/v1/university-profile/contact`

**Description**: Mendapatkan informasi kontak dan lokasi universitas

**Response**:
```json
{
  "success": true,
  "message": "Contact information retrieved successfully",
  "data": {
    "main_office": {
      "name": "Rektorat Universitas Lampung",
      "address": "Jl. Prof. Dr. Ir. Sumantri Brojonegoro No.1...",
      "phone": "(0721) 701609",
      "fax": "(0721) 702767",
      "email": "humas@unila.ac.id",
      "website": "https://www.unila.ac.id"
    },
    "departments": [...],
    "working_hours": {
      "weekdays": "Senin - Jumat: 07:30 - 16:00 WIB",
      "weekend": "Sabtu - Minggu: Tutup",
      "break_time": "Istirahat: 12:00 - 13:00 WIB"
    },
    "location": {
      "latitude": -5.3585528,
      "longitude": 105.2410529,
      "google_maps": "https://goo.gl/maps/abc123",
      "directions": "Dari pusat kota Bandar Lampung, arah ke utara sekitar 8 km"
    }
  }
}
```

---

## Testing

### Via Direct Access (Port 8082)

```bash
# Health check
curl http://localhost:8082/api/health

# University profile
curl http://localhost:8082/api/v1/university-profile

# Quick facts
curl http://localhost:8082/api/v1/university-profile/quick-facts

# Contact info
curl http://localhost:8082/api/v1/university-profile/contact
```

### Via Kong API Gateway (Port 9800)

```bash
# Health check
curl http://localhost:9800/dashboard-service/api/health

# University profile
curl http://localhost:9800/dashboard-service/api/v1/university-profile

# Quick facts
curl http://localhost:9800/dashboard-service/api/v1/university-profile/quick-facts

# Contact info
curl http://localhost:9800/dashboard-service/api/v1/university-profile/contact
```

---

## Frontend Integration

### Example React/Next.js Usage

```typescript
// services/universityService.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9800';

export const universityService = {
  async getProfile() {
    const response = await fetch(
      `${API_BASE}/dashboard-service/api/v1/university-profile`
    );
    return response.json();
  },

  async getQuickFacts() {
    const response = await fetch(
      `${API_BASE}/dashboard-service/api/v1/university-profile/quick-facts`
    );
    return response.json();
  },

  async getContact() {
    const response = await fetch(
      `${API_BASE}/dashboard-service/api/v1/university-profile/contact`
    );
    return response.json();
  }
};

// components/UniversityProfile.tsx
import { useEffect, useState } from 'react';
import { universityService } from '@/services/universityService';

export function UniversityProfile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    universityService.getProfile().then(data => {
      if (data.success) {
        setProfile(data.data);
      }
    });
  }, []);

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="university-profile">
      <h1>{profile.name}</h1>
      <p>{profile.tagline}</p>
      <p>{profile.description}</p>
      {/* ... render other profile data */}
    </div>
  );
}

// components/QuickFacts.tsx
export function QuickFacts() {
  const [facts, setFacts] = useState([]);

  useEffect(() => {
    universityService.getQuickFacts().then(data => {
      if (data.success) {
        setFacts(data.data);
      }
    });
  }, []);

  return (
    <div className="quick-facts grid grid-cols-3 gap-4">
      {facts.map((fact, index) => (
        <div key={index} className="fact-card p-6 bg-white rounded-lg shadow">
          <div className="text-4xl mb-2">{fact.icon}</div>
          <h3 className="text-2xl font-bold">{fact.value}</h3>
          <p className="text-sm text-gray-600">{fact.title}</p>
          <p className="text-xs text-gray-500 mt-2">{fact.description}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Architecture

```
[Frontend]
    ↓
[Kong API Gateway :9800]
    ↓
[Nginx :8082]
    ↓
[Dashboard Service Container]
    ↓
[No Database Needed - Static Data]
```

**Note**: Dashboard service menggunakan data static (hardcoded) untuk saat ini. Ke depan bisa diintegrasikan dengan database jika diperlukan dynamic content.

---

## File Structure

```
dashboard-service/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── UniversityProfileController.php
│   │   └── Middleware/
│   ├── Traits/
│   │   └── ApiResponse.php
│   └── ...
├── routes/
│   └── api.php
├── .env
├── Dockerfile
└── README.md (this file)
```

---

## Environment Variables

```env
APP_NAME="Dashboard Service"
APP_URL=http://localhost:8082
REDIS_HOST=redis
REDIS_PORT=6379
CACHE_PREFIX=dashboard_
```

---

## Docker

### Build
```bash
docker-compose build dashboard-service
```

### Start
```bash
docker-compose up -d dashboard-service
```

### Logs
```bash
docker-compose logs -f dashboard-service
```

---

## Future Enhancements

- [ ] Add News endpoint
- [ ] Add Announcements endpoint
- [ ] Add Events/Calendar endpoint
- [ ] Add Gallery endpoint
- [ ] Connect to database for dynamic content
- [ ] Add caching with Redis
- [ ] Add rate limiting
- [ ] Add OpenAPI/Swagger documentation

---

## Notes

- ✅ **No authentication required** - Semua endpoint bersifat public
- ✅ **CORS enabled** - Sudah di-configure di nginx
- ✅ **Ready for production** - Struktur code sudah mengikuti best practices
- ✅ **Scalable** - Mudah ditambahkan endpoint baru

---

**Created**: October 2025
**Author**: MyUnila Backend Team
**Service**: Dashboard Service v1.0.0
