# Dashboard Architecture

## Best Practice: Config-Based Dynamic Dashboard

Struktur dashboard ini dirancang untuk **scalable** dan **maintainable** dengan minimal shared components tapi maksimal reusability.

## 📁 Struktur Direktori

```
src/
├── shared/components/dashboard/
│   ├── DashboardLayout.tsx    ← Generic layout (reusable untuk semua app)
│   ├── Sidebar.tsx            ← Dynamic sidebar dengan menu config
│   ├── DashboardNavbar.tsx    ← Navbar dengan user profile
│
├── lib/types/
│   └── dashboard.types.ts     ← Shared types (MenuItem, DashboardConfig)
│
├── app/dashboard/
│   ├── siakadu/
│   │   ├── config/
│   │   │   └── menuConfig.tsx      ← Menu config khusus Siakadu
│   │   ├── page.tsx                ← Dashboard Siakadu
│   │   ├── mahasiswa/page.tsx      ← Admin: Data Mahasiswa
│   │   ├── krs/page.tsx            ← Mahasiswa: KRS
│   │   └── ...                     ← Pages lainnya
│   │
│   ├── e-kkn/
│   │   ├── config/
│   │   │   └── menuConfig.tsx      ← Menu config khusus E-KKN
│   │   ├── page.tsx                ← Dashboard E-KKN
│   │   └── ...                     ← Pages lainnya
│   │
│   └── README.md                   ← This file
```

## 🎯 Konsep Utama

### 1. **Single Route per App**
```
/dashboard/siakadu        → Main dashboard
/dashboard/siakadu/krs    → Menu KRS (mahasiswa)
/dashboard/siakadu/mahasiswa  → Menu Data Mahasiswa (admin)
```

### 2. **Role-Based Menu Visibility**
Menu di-filter otomatis berdasarkan role user:

```typescript
const menuConfig: MenuItem[] = [
  {
    title: "Dashboard",
    roles: ["admin", "mahasiswa", "dosen"], // Semua bisa akses
  },
  {
    title: "Data Mahasiswa",
    roles: ["admin"], // Hanya admin
  },
  {
    title: "KRS",
    roles: ["mahasiswa"], // Hanya mahasiswa
  },
]
```

### 3. **Config-Based Approach**
Setiap aplikasi punya menu config sendiri:

**siakadu/config/menuConfig.tsx:**
```typescript
export const siakaduMenuConfig: MenuItem[] = [
  // Menu untuk Siakadu
];
```

**e-kkn/config/menuConfig.tsx:**
```typescript
export const ekknMenuConfig: MenuItem[] = [
  // Menu untuk E-KKN (berbeda dari Siakadu)
];
```

## 🚀 Cara Membuat Dashboard Baru

### Step 1: Buat Menu Config
```typescript
// src/app/dashboard/[app-name]/config/menuConfig.tsx
import type { MenuItem } from "@/lib/types/dashboard.types";

export const myAppMenuConfig: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <MdDashboard className="w-5 h-5" />,
    href: "/dashboard/my-app",
    roles: ["admin", "user"],
  },
  {
    title: "Menu Admin",
    icon: <FiUsers className="w-5 h-5" />,
    href: "/dashboard/my-app/admin-menu",
    roles: ["admin"], // Hanya admin yang lihat
  },
  {
    title: "Menu User",
    icon: <FiFileText className="w-5 h-5" />,
    href: "/dashboard/my-app/user-menu",
    roles: ["user"], // Hanya user yang lihat
  },
];
```

### Step 2: Buat Dashboard Page
```typescript
// src/app/dashboard/[app-name]/page.tsx
"use client";

import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import { myAppMenuConfig } from "./config/menuConfig";
import { MdApps } from "react-icons/md";

export default function MyAppDashboard() {
  return (
    <DashboardLayout
      appName="My App"
      appIcon={<MdApps className="w-6 h-6 text-white" />}
      menuConfig={myAppMenuConfig}
      pageTitle="Dashboard"
    >
      {/* Content here */}
    </DashboardLayout>
  );
}
```

### Step 3: Buat Sub Pages
```typescript
// src/app/dashboard/[app-name]/admin-menu/page.tsx
"use client";

import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import { myAppMenuConfig } from "../config/menuConfig";
import { MdApps } from "react-icons/md";

export default function AdminMenuPage() {
  return (
    <DashboardLayout
      appName="My App"
      appIcon={<MdApps className="w-6 h-6 text-white" />}
      menuConfig={myAppMenuConfig}
      pageTitle="Admin Menu"
    >
      {/* Content here */}
    </DashboardLayout>
  );
}
```

## 🎨 Keuntungan Pendekatan Ini

### ✅ Minimal Shared Components
- Hanya 3 shared components: `DashboardLayout`, `Sidebar`, `DashboardNavbar`
- Tidak perlu buat sidebar berbeda untuk setiap app

### ✅ Maksimal Reusability
- Setiap app cukup buat 1 file config
- Layout dan sidebar otomatis di-reuse
- Role filtering otomatis

### ✅ Easy to Scale
- Tambah app baru: copy paste struktur + edit config
- Tambah role baru: tinggal tambah di `roles` array
- Tambah menu: tinggal tambah di config

### ✅ Maintainable
- Menu logic terpusat di config
- Mudah debugging (cek config file)
- Type-safe dengan TypeScript

## 🔧 Role Mapping

Role dari database otomatis di-map ke role types:

```typescript
// Di Sidebar.tsx
const getUserRole = (): string => {
  if (!user?.role) return "";

  const roleLower = user.role.toLowerCase();
  if (roleLower.includes("admin")) return "admin";
  if (roleLower.includes("mahasiswa")) return "mahasiswa";
  if (roleLower.includes("dosen")) return "dosen";

  return "";
};
```

## 📝 Menu Item Types

```typescript
interface MenuItem {
  title: string;               // Nama menu
  icon: React.ReactNode;       // Icon dari react-icons
  href?: string;               // Link URL
  children?: MenuItem[];       // Sub-menu (max 2 level)
  roles?: string[];            // Roles yang boleh akses
}
```

## 🎯 Multi-Level Menu

Support nested menu sampai 2 level:

```typescript
{
  title: "KRS/KHS/Transkrip",
  icon: <FiFileText className="w-5 h-5" />,
  roles: ["mahasiswa"],
  children: [
    {
      title: "KRS",
      href: "/dashboard/siakadu/krs",
    },
    {
      title: "KHS",
      href: "/dashboard/siakadu/khs",
    },
  ],
}
```

## 🔐 Route Protection

Tambah middleware untuk proteksi route (optional):

```typescript
// src/lib/middleware/roleMiddleware.ts
export function checkRoleAccess(pathname: string, userRole: string) {
  // Logic untuk cek apakah user boleh akses route
}
```

## 📦 Export Pattern

Setiap app export config-nya:

```typescript
// siakadu/config/menuConfig.tsx
export const siakaduMenuConfig: MenuItem[] = [...];

// e-kkn/config/menuConfig.tsx
export const ekknMenuConfig: MenuItem[] = [...];
```

Import di page:

```typescript
import { siakaduMenuConfig } from "./config/menuConfig";
import { ekknMenuConfig } from "./config/menuConfig";
```

## 🎉 Summary

**Best Practice ini memberikan:**
- ✅ Satu sidebar untuk semua apps
- ✅ Role-based menu visibility
- ✅ Config-based, mudah di-maintain
- ✅ Scalable untuk banyak apps
- ✅ Type-safe dengan TypeScript
- ✅ Minimal code duplication

**Untuk tambah app baru, cukup:**
1. Copy struktur folder
2. Buat `config/menuConfig.tsx`
3. Import & pass ke `DashboardLayout`
4. Done! 🚀
