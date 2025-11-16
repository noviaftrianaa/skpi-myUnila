# Feeder Integrator & Feeder Service - Implementation Plan

> **Project**: MyUnila Feeder Integration System
> **Type**: Full-stack application (Frontend + Backend)
> **Pattern**: Based on sister-integrator (frontend) and sister-service (backend)
> **Purpose**: Integration with Neo Feeder PDDIKTI API for student data synchronization

---

## 📚 Documentation Index

1. **[implementation-plan.md](.claude/feeder/implementation-plan.md)** (This file) - Complete implementation guide
2. **[api-configuration.md](.claude/feeder/api-configuration.md)** - API configuration via database (IMPORTANT!)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Environment Variables](#3-environment-variables)
4. [Phase 1: Frontend Development](#4-phase-1-frontend-development)
5. [Phase 2: Backend Development](#5-phase-2-backend-development)
6. [Implementation Checklist](#6-implementation-checklist)

---

## 1. Project Overview

### 1.1 Features

#### Dashboard
- Statistics overview (total mahasiswa, sync status, etc.)
- Quick sync actions
- Recent sync logs

#### Referensi (Reference Data)
- Jalur Masuk, Jenis Evaluasi, Jenis Pendaftaran, Jenis Keluar
- Status Mahasiswa, Tahun Ajaran, Semester
- Jenis Prestasi, Tingkat Prestasi, Kebutuhan Khusus, Wilayah

#### Data PDRD (Student Academic Records)
- Mahasiswa, Aktivitas Mahasiswa, Anggota Aktivitas
- Nilai Kuliah, Konversi, Nilai Transfer, Transkrip
- Matkul, Kurikulum, Rencana Ajar, Rencana Evaluasi, Prestasi Mahasiswa

#### Monitoring, Sync Logs, API Configuration

---

## 2. Technology Stack

**Frontend**: Next.js 14, TypeScript, HeroUI, Tailwind CSS
**Backend**: Go 1.21+, Fiber v2, SQL Server, Redis

---

## 3. Environment Variables

**⚠️ IMPORTANT**: Lihat detail lengkap di **[api-configuration.md](.claude/feeder/api-configuration.md)**

### Quick Reference

**Backend** (`backend/feeder-service/.env`):
```env
# Neo Feeder API (Fallback - Priority: Database > Environment)
URL_WS_FEEDER=https://dapelmikpdpt.unila.ac.id/New/ws/Api.php
WS_USERNAME=your-username
WS_PASSWORD=your-password

# Database
DB_HOST=192.168.123.119
DB_PORT=1433
DB_NAME=pdut

# Encryption for credentials in database
ENCRYPTION_KEY=your-32-char-encryption-key-here
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_FEEDER_API_URL=http://localhost:9800/feeder-service
```

**Database Config** (`setting.api_configs` table):
- API Code: `feeder_api`
- Credentials stored encrypted in database
- Fallback to environment variables if DB config not available

---

## 4. Phase 1: Frontend Development

### 4.1 Step 1: Create Menu Configuration

**File**: `frontend/src/app/dashboard/feeder-integrator/config/menuConfig.tsx`

```typescript
import { MenuItem } from "@/shared/components/dashboard/DashboardLayout";
import { MdDashboard } from "react-icons/md";
import { FiBookOpen, FiUsers, FiActivity, FiFileText, FiSettings } from "react-icons/fi";

export const feederIntegratorMenuConfig: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <MdDashboard />,
    href: "/dashboard/feeder-integrator",
    roles: ["developer"],
  },
  {
    title: "Referensi",
    icon: <FiBookOpen />,
    roles: ["developer"],
    children: [
      { title: "Jalur Masuk", href: "/dashboard/feeder-integrator/referensi/jalur-masuk", roles: ["developer"] },
      { title: "Jenis Evaluasi", href: "/dashboard/feeder-integrator/referensi/jenis-evaluasi", roles: ["developer"] },
      { title: "Jenis Pendaftaran", href: "/dashboard/feeder-integrator/referensi/jenis-pendaftaran", roles: ["developer"] },
      { title: "Jenis Keluar", href: "/dashboard/feeder-integrator/referensi/jenis-keluar", roles: ["developer"] },
      { title: "Status Mahasiswa", href: "/dashboard/feeder-integrator/referensi/status-mahasiswa", roles: ["developer"] },
      { title: "Tahun Ajaran", href: "/dashboard/feeder-integrator/referensi/tahun-ajaran", roles: ["developer"] },
      { title: "Semester", href: "/dashboard/feeder-integrator/referensi/semester", roles: ["developer"] },
      { title: "Jenis Prestasi", href: "/dashboard/feeder-integrator/referensi/jenis-prestasi", roles: ["developer"] },
      { title: "Tingkat Prestasi", href: "/dashboard/feeder-integrator/referensi/tingkat-prestasi", roles: ["developer"] },
      { title: "Kebutuhan Khusus", href: "/dashboard/feeder-integrator/referensi/kebutuhan-khusus", roles: ["developer"] },
      { title: "Wilayah", href: "/dashboard/feeder-integrator/referensi/wilayah", roles: ["developer"] },
    ],
  },
  {
    title: "Data PDRD",
    icon: <FiUsers />,
    roles: ["developer"],
    children: [
      { title: "Mahasiswa", href: "/dashboard/feeder-integrator/pdrd/mahasiswa", roles: ["developer"] },
      { title: "Aktivitas Mahasiswa", href: "/dashboard/feeder-integrator/pdrd/aktivitas-mahasiswa", roles: ["developer"] },
      { title: "Anggota Aktivitas", href: "/dashboard/feeder-integrator/pdrd/anggota-aktivitas", roles: ["developer"] },
      { title: "Nilai Kuliah", href: "/dashboard/feeder-integrator/pdrd/nilai-kuliah", roles: ["developer"] },
      { title: "Konversi", href: "/dashboard/feeder-integrator/pdrd/konversi", roles: ["developer"] },
      { title: "Nilai Transfer", href: "/dashboard/feeder-integrator/pdrd/nilai-transfer", roles: ["developer"] },
      { title: "Transkrip", href: "/dashboard/feeder-integrator/pdrd/transkrip", roles: ["developer"] },
      { title: "Matkul", href: "/dashboard/feeder-integrator/pdrd/matkul", roles: ["developer"] },
      { title: "Kurikulum", href: "/dashboard/feeder-integrator/pdrd/kurikulum", roles: ["developer"] },
      { title: "Rencana Ajar", href: "/dashboard/feeder-integrator/pdrd/rencana-ajar", roles: ["developer"] },
      { title: "Rencana Evaluasi", href: "/dashboard/feeder-integrator/pdrd/rencana-evaluasi", roles: ["developer"] },
      { title: "Prestasi Mahasiswa", href: "/dashboard/feeder-integrator/pdrd/prestasi-mahasiswa", roles: ["developer"] },
    ],
  },
  {
    title: "Monitoring",
    icon: <FiActivity />,
    href: "/dashboard/feeder-integrator/monitoring",
    roles: ["developer"],
  },
  {
    title: "Sync Logs",
    icon: <FiFileText />,
    href: "/dashboard/feeder-integrator/logs",
    roles: ["developer"],
  },
  {
    title: "API Configuration",
    icon: <FiSettings />,
    href: "/dashboard/feeder-integrator/settings",
    roles: ["developer"],
  },
];
```

### 4.2 Step 2: Create Feeder API Client

**File**: `frontend/src/lib/api/feederClient.ts`

Sama seperti `sisterClient.ts`, ganti URL dan token management.

### 4.3 Step 3: Create Dashboard Page

**File**: `frontend/src/app/dashboard/feeder-integrator/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import { feederIntegratorMenuConfig } from "./config/menuConfig";
import { Card, CardBody, Spinner } from "@heroui/react";
import { FiDatabase, FiUsers, FiCheckCircle, FiClock } from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import { RiGraduationCapFill } from "react-icons/ri";

export default function FeederIntegratorDashboard() {
  useRequireAuth();
  const [stats, setStats] = useState({ total_mahasiswa: 0, total_referensi: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Load stats from API
    setIsLoading(false);
  }, []);

  return (
    <DashboardLayout
      appName="Feeder Integrator"
      appIcon={<RiGraduationCapFill className="w-6 h-6 text-white" />}
      menuConfig={feederIntegratorMenuConfig}
      pageTitle="Dashboard"
    >
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-xl">
          <h1 className="text-3xl font-bold mb-2">Feeder Integrator</h1>
          <p className="text-blue-100">Sistem integrasi data mahasiswa dengan Neo Feeder PDDIKTI</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-500 to-indigo-600">
            <CardBody className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                  <FiUsers className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-purple-100">Total Mahasiswa</p>
                  <h3 className="text-3xl font-bold text-white">{stats.total_mahasiswa}</h3>
                </div>
              </div>
            </CardBody>
          </Card>
          {/* Add more stat cards */}
        </div>

        {/* Coming Soon */}
        <Card>
          <CardBody className="p-8 text-center">
            <MdSchool className="w-24 h-24 text-blue-500 mx-auto opacity-50 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
            <p className="text-gray-600">Feeder Integrator sedang dalam tahap pengembangan.</p>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
```

### 4.4 Step 4: Create "Coming Soon" Pages

Buat template page untuk semua menu. Contoh:

**File**: `frontend/src/app/dashboard/feeder-integrator/referensi/jalur-masuk/page.tsx`

```typescript
"use client";

import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import { feederIntegratorMenuConfig } from "../../config/menuConfig";
import { Card, CardBody } from "@heroui/react";
import { RiGraduationCapFill } from "react-icons/ri";
import { FiBookOpen } from "react-icons/fi";

export default function JalurMasukPage() {
  useRequireAuth();

  return (
    <DashboardLayout
      appName="Feeder Integrator"
      appIcon={<RiGraduationCapFill className="w-6 h-6 text-white" />}
      menuConfig={feederIntegratorMenuConfig}
      pageTitle="Jalur Masuk"
    >
      <Card>
        <CardBody className="p-8 text-center">
          <FiBookOpen className="w-24 h-24 text-blue-500 mx-auto opacity-50 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
          <p className="text-gray-600">Halaman Jalur Masuk sedang dalam pengembangan.</p>
        </CardBody>
      </Card>
    </DashboardLayout>
  );
}
```

**Ulangi untuk semua menu**: referensi/*, pdrd/*, monitoring, logs, settings

---

## 5. Phase 2: Backend Development

### 5.1 Initialize Project

```bash
cd backend
mkdir feeder-service
cd feeder-service
go mod init github.com/myunila/feeder-service
```

### 5.2 Copy API Config Module

```bash
# Copy dari sister-service
cp -r ../sister-service/apps/apiconfig apps/
cp -r ../sister-service/pkg/crypto pkg/
cp -r ../sister-service/pkg/response pkg/
cp -r ../sister-service/internal/middleware internal/
cp -r ../sister-service/external/database external/
```

### 5.3 Create Feeder API Client

**File**: `backend/feeder-service/external/feeder_api/client.go`

Lihat detail lengkap di **[api-configuration.md](.claude/feeder/api-configuration.md)** section 3.2

### 5.4 Create Main Entry Point

**File**: `backend/feeder-service/cmd/api/main.go`

Lihat detail lengkap di **[api-configuration.md](.claude/feeder/api-configuration.md)** section 3.4

### 5.5 Database Setup

**Insert Feeder Config**:
```sql
INSERT INTO setting.api_configs (
    api_code, api_name, base_url, auth_type,
    timeout_seconds, max_retries, is_active,
    use_env_fallback, created_by, tags
) VALUES (
    'feeder_api',
    'Neo Feeder PDDIKTI API',
    'https://dapelmikpdpt.unila.ac.id/New/ws/Api.php',
    'token_based',
    120, 3, 1, 1,
    'system',
    'feeder,pddikti,mahasiswa'
);
```

---

## 6. Implementation Checklist

### Phase 1: Frontend Template ✓
- [ ] Create menu configuration
- [ ] Create API client
- [ ] Create main dashboard
- [ ] Create all "Coming Soon" pages (24 pages total)
- [ ] Test navigation
- [ ] Test responsive design

### Phase 2: Backend Structure ✓
- [ ] Initialize Go module
- [ ] Copy apiconfig module from sister-service
- [ ] Copy crypto module from sister-service
- [ ] Create Feeder API client with database config support
- [ ] Create main.go with apiconfig initialization
- [ ] Insert feeder_api config to database
- [ ] Test Feeder API connection

### Phase 3: Settings Page ✓
- [ ] Create settings page frontend
- [ ] Create apiconfig service frontend
- [ ] Test API configuration CRUD
- [ ] Test connection testing
- [ ] Test credential encryption

### Phase 4-7: Domain Implementation
- Follow same pattern as Phase 3-7 in sister-service

---

## 7. Reference Files

### Patterns to Follow

**Frontend**:
- Menu Config: `frontend/src/app/dashboard/sister-integrator/config/menuConfig.tsx`
- Dashboard: `frontend/src/app/dashboard/sister-integrator/page.tsx`
- Settings: `frontend/src/app/dashboard/sister-integrator/settings/page.tsx`

**Backend**:
- Main: `backend/sister-service/cmd/api/main.go`
- API Config: `backend/sister-service/apps/apiconfig/`
- API Client: `backend/sister-service/external/sister_api/client.go`

**Feeder Reference**:
- PHP Client: `apps_pdpt/packages/libs/PDDIKTI.php`
- Sync Pattern: `apps_pdpt/database/seeders/MahasiswaSeeder.php`

---

## 8. Key Differences from SISTER

**Feeder API Authentication**:
- Uses `act: "GetToken"` with username/password
- Token expires after 2 hours
- All requests use POST with JSON payload
- Filter format: `"id_prodi='xxxx'"`

**SISTER API Authentication**:
- Uses OAuth-style with id_pengguna
- Token management different
- RESTful endpoints

---

## 9. Next Steps

1. ✅ **Create frontend template** (Phase 1) - All pages with "Coming Soon"
2. ✅ **Setup backend structure** (Phase 2) - With API config via database
3. ⏳ **Implement Settings Page** (Phase 3) - Full CRUD for API configuration
4. ⏳ **Implement Referensi domain** - Start with simple reference data
5. ⏳ **Implement Mahasiswa domain** - Complex sync with worker pool
6. ⏳ **Implement remaining domains** - Follow mahasiswa pattern

---

**Document Version**: 1.1
**Last Updated**: 2025-11-16
**Related Docs**: [api-configuration.md](.claude/feeder/api-configuration.md)
