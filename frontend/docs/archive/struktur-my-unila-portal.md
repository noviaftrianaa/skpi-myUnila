# 📊 ANALISIS LENGKAP: Struktur my-unila-portal

## 🎯 OVERVIEW SISTEM

**my-unila-portal** adalah aplikasi Next.js 14+ dengan App Router yang menggunakan:
- **Routing**: Route Groups untuk pemisahan layout
- **Styling**: Tailwind CSS
- **Font**: Poppins (Google Fonts)
- **State Management**: React Context (Providers)

---

## 📁 STRUKTUR FOLDER UTAMA

```
my-unila-portal/
├── app/                          # Next.js App Router
│   ├── (main)/                   # Route Group: Public Pages
│   ├── dashboard/                # Route Group: Dashboard (Protected)
│   ├── login/                    # Auth Pages
│   ├── layout.tsx                # Root Layout
│   ├── globals.css               # Global Styles
│   └── providers.tsx             # Context Providers
│
├── components/                   # Semua React Components
│   ├── layout/                   # Layout Components (Navbar, Footer)
│   ├── layouts/                  # Layout Wrappers
│   ├── common/                   # Common Components (Logo, ScrollToTop)
│   ├── ui/                       # UI Components (Hero, Section, DataTable)
│   ├── akademik/                 # Akademik Feature Components
│   ├── layanan/                  # Layanan Feature Components
│   ├── program-studi/            # Program Studi Components
│   ├── statistik/                # Statistik Components
│   ├── tentang/                  # Tentang Components
│   └── index.ts                  # Barrel Export
│
├── config/                       # Configuration Files
├── contexts/                     # React Context
├── features/                     # Feature Modules
├── lib/                          # Library & Utils
├── public/                       # Static Assets
├── styles/                       # Additional Styles
└── types/                        # TypeScript Types
```

---

## 🌐 ALUR AKSES WEB (Flow Diagram)

### 1️⃣ **Root Entry Point**

```
User Access → http://localhost:3000/
    ↓
app/layout.tsx (Root Layout)
    ↓
- Load Poppins Font
- Set Metadata (Title, Description, Icons)
- Wrap with <Providers>
- Render {children}
```

**File**: `app/layout.tsx`
```tsx
// Root layout untuk semua halaman
- Font: Poppins (400, 500, 600, 700, 800)
- Lang: "id" (Bahasa Indonesia)
- Providers: Context wrappers
- Icon: /assets/images/logo-unila.png
```

---

### 2️⃣ **Public Pages Flow (Homepage & Public Routes)**

```
http://localhost:3000/ → app/(main)/page.tsx
    ↓
app/(main)/layout.tsx (Main Layout)
    ↓
Render Structure:
    <Navbar />                    # Top Navigation
    <main>
        {children}                # Page Content
    </main>
    <Footer />                    # Footer
    <BottomNav />                 # Mobile Bottom Nav
    <ScrollToTop />               # Scroll to Top Button
```

**File**: `app/(main)/layout.tsx`
```tsx
import { Navbar, Footer, BottomNav, ScrollToTop } from "@/components";

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <BottomNav />
      <ScrollToTop />
    </>
  );
}
```

---

### 3️⃣ **Homepage Content (app/(main)/page.tsx)**

```
Homepage Components (in order):
1. <Hero />                       # Hero Section (Banner)
2. <ProfileUnila />               # Profil Universitas
3. <ProgramStudiTable />          # Tabel Program Studi
4. <AkreditasiProdi />            # Akreditasi Program Studi
5. <WorldClassRanking />          # Ranking Universitas
```

**File**: `app/(main)/page.tsx`
```tsx
import { Hero, ProfileUnila, ProgramStudiTable } from "@/components";
import AkreditasiProdi from "@/components/AkreditasiProdi";
import WorldClassRanking from "@/components/statistik/WorldClassRanking";

export default function Home() {
  return (
    <>
      <Hero />
      <ProfileUnila />
      <ProgramStudiTable />
      <AkreditasiProdi />
      <WorldClassRanking />
    </>
  );
}
```

---

### 4️⃣ **Public Routes Structure**

```
app/(main)/
├── page.tsx                      # Homepage (/)
├── layout.tsx                    # Main Layout (with Navbar/Footer)
│
├── akademik/                     # /akademik/*
│   └── page.tsx                  # Akademik page
│
├── layanan/                      # /layanan/*
│   └── page.tsx                  # Layanan page
│
├── program-studi/                # /program-studi/*
│   └── page.tsx                  # Program Studi page
│
├── statistik/                    # /statistik/*
│   └── page.tsx                  # Statistik page
│
└── tentang/                      # /tentang/*
    └── page.tsx                  # Tentang page
```

---

### 5️⃣ **Dashboard Flow (Protected Routes)**

```
http://localhost:3000/dashboard → app/dashboard/page.tsx
    ↓
app/dashboard/layout.tsx (Dashboard Layout)
    ↓
- No Navbar/Footer (separate layout)
- Only render {children}
- Metadata: "Dashboard - myUnila Portal"
```

**File**: `app/dashboard/layout.tsx`
```tsx
export default function DashboardLayout({ children }) {
  return <>{children}</>;  // Simple wrapper
}
```

---

## 🧩 KOMPONEN SISTEM

### 📦 **Layout Components** (`components/layout/`)

```
layout/
├── Navbar.tsx                    # Top Navigation Bar
│   - Logo Unila
│   - Menu Links (Beranda, Akademik, Program Studi, dll)
│   - Mobile Menu Toggle
│   - User Auth Status
│
├── Footer.tsx                    # Footer Section
│   - Info Kontak Universitas
│   - Quick Links
│   - Social Media
│   - Copyright
│
└── BottomNav.tsx                 # Mobile Bottom Navigation
    - Sticky bottom menu (mobile only)
    - Quick access icons
```

### 🎨 **UI Components** (`components/ui/`)

```
ui/
├── Hero.tsx                      # Hero Section Component
│   - Banner utama homepage
│   - CTA buttons
│   - Background image/gradient
│
├── PageHero.tsx                  # Page Hero (sub-pages)
│   - Breadcrumb
│   - Page title
│
├── Section.tsx                   # Section Wrapper
│   - Reusable section container
│   - Padding & spacing
│
├── DataTable.tsx                 # Data Table Component
│   - Tabel data dengan sorting
│   - Pagination
│   - Search/filter
│
└── Skeleton.tsx                  # Loading Skeleton
    - Loading state UI
```

### 🔧 **Common Components** (`components/common/`)

```
common/
├── Container.tsx                 # Container Wrapper
│   - Max-width container
│   - Responsive padding
│
├── Logo.tsx                      # Logo Unila Component
│   - Reusable logo
│   - Link ke homepage
│
└── ScrollToTop.tsx               # Scroll to Top Button
    - Sticky button (bottom-right)
    - Smooth scroll ke atas
```

### 🏠 **Homepage Components**

```
Homepage Specific Components:
├── ProfileUnila.tsx              # Section Profil Unila
│   - Sejarah singkat
│   - Visi & Misi
│   - Stats (Mahasiswa, Dosen, dll)
│
├── ProgramStudiTable.tsx         # Tabel Program Studi
│   - List semua prodi
│   - Filter by fakultas
│   - Akreditasi status
│
├── AkreditasiProdi.tsx           # Chart Akreditasi
│   - Visualisasi akreditasi
│   - Statistik per level (A, B, C)
│
└── statistik/WorldClassRanking.tsx  # Ranking Section
    - QS Ranking
    - THE Ranking
    - Webometrics
```

---

## 🔀 ROUTING SYSTEM

### Route Groups di my-unila-portal:

```
app/
├── (main)/                       # Public pages dengan Navbar/Footer
│   ├── page.tsx                  # / (Homepage)
│   ├── akademik/page.tsx         # /akademik
│   ├── layanan/page.tsx          # /layanan
│   ├── program-studi/page.tsx    # /program-studi
│   ├── statistik/page.tsx        # /statistik
│   └── tentang/page.tsx          # /tentang
│
├── dashboard/                    # Protected pages (no navbar/footer)
│   ├── page.tsx                  # /dashboard
│   └── layout.tsx                # Dashboard layout
│
└── login/                        # Auth pages
    └── page.tsx                  # /login
```

### Route Behavior:

| Route | Layout | Components | Access |
|-------|--------|-----------|--------|
| `/` | Main Layout | Navbar + Footer + Content | Public |
| `/akademik` | Main Layout | Navbar + Footer + Content | Public |
| `/dashboard` | Dashboard Layout | Content only | Protected |
| `/login` | Root Layout | Auth Form | Public |

---

## 📦 IMPORT SYSTEM (Barrel Exports)

### Central Export: `components/index.ts`

```typescript
// Layout Components
export { default as Navbar } from './layout/Navbar';
export { default as Footer } from './layout/Footer';
export { default as BottomNav } from './layout/BottomNav';

// UI Components
export { default as Hero } from './ui/Hero';
export { default as PageHero } from './ui/PageHero';
export { default as Section } from './ui/Section';
export { default as DataTable } from './ui/DataTable';

// Common Components
export { default as Logo } from './common/Logo';
export { default as Container } from './common/Container';
export { default as ScrollToTop } from './common/ScrollToTop';

// Feature Components
export { default as ProfileUnila } from './ProfileUnila';
export { default as ProgramStudiTable } from './ProgramStudiTable';
```

### Import Pattern di Pages:

```typescript
// ✅ Recommended: Import from barrel
import { Navbar, Footer, Hero } from "@/components";

// ❌ Not used: Direct import
import Navbar from "@/components/layout/Navbar";
```

---

## 🎨 STYLING SYSTEM

### Tailwind Configuration:
- **Breakpoints**: Default Tailwind (sm, md, lg, xl, 2xl)
- **Colors**: Custom Unila colors (biasanya di tailwind.config)
- **Fonts**: Poppins via Google Fonts
- **Icons**: React Icons (assumed)

### Global Styles: `app/globals.css`
- Tailwind directives (@tailwind base, components, utilities)
- Custom CSS variables
- Utility classes

---

## 🔐 AUTHENTICATION FLOW

```
Login Flow:
User → /login → Login Component
    ↓
Authenticate (API call)
    ↓
Success → Redirect to /dashboard
Fail → Show error message
```

```
Protected Routes:
User access /dashboard
    ↓
middleware.ts check auth
    ↓
Authenticated? → Allow access
Not authenticated? → Redirect to /login
```

---

## 📂 ASSET STRUCTURE

```
public/
├── assets/
│   ├── images/
│   │   ├── logo-unila.png        # Logo Unila (used in favicon)
│   │   ├── hero-bg.jpg           # Hero background
│   │   └── ...
│   └── icons/
│       └── ...
└── ...
```

---

## 🎯 DEPENDENCIES (Assumed from structure)

```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-icons": "^5.x",          // Icons
    "@types/node": "^20.x",
    "@types/react": "^18.x",
    "typescript": "^5.x",
    "tailwindcss": "^3.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x"
  }
}
```

---

## 🔄 COMPONENT LIFECYCLE

### Homepage Load Sequence:

```
1. Browser request: http://localhost:3000/
    ↓
2. Next.js Router → app/layout.tsx
    ↓
3. Load Poppins font, set metadata
    ↓
4. Wrap with <Providers> (contexts)
    ↓
5. Route to app/(main)/page.tsx
    ↓
6. app/(main)/layout.tsx renders:
    ↓
7. <Navbar /> → mount, fetch user data
    ↓
8. <main> → render page.tsx content:
   - <Hero /> → load hero assets
   - <ProfileUnila /> → mount, maybe fetch data
   - <ProgramStudiTable /> → fetch prodi data
   - <AkreditasiProdi /> → fetch akreditasi data
   - <WorldClassRanking /> → fetch ranking data
    ↓
9. <Footer /> → mount
    ↓
10. <BottomNav /> → mount (mobile only)
     ↓
11. <ScrollToTop /> → mount, attach scroll listener
     ↓
12. Page fully rendered → hydration complete
```

---

## 📊 DATA FLOW

### Typical Data Fetching Pattern:

```typescript
// Component level (React Server Component)
export default async function ProgramStudiTable() {
  // Fetch data from API
  const prodiData = await fetch('/api/program-studi');
  
  return (
    <Section>
      <DataTable data={prodiData} />
    </Section>
  );
}

// Or Client Component with hooks
'use client';
export default function ProgramStudiTable() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetch('/api/program-studi')
      .then(res => res.json())
      .then(setData);
  }, []);
  
  return <DataTable data={data} />;
}
```

---

## 🎯 KEY FEATURES

### 1. **Route Groups**
- `(main)` untuk public pages dengan layout lengkap
- `dashboard` untuk protected pages dengan layout berbeda
- Tidak muncul di URL (parentheses dihapus)

### 2. **Server Components by Default**
- Semua components di app/ adalah Server Components
- Perlu `'use client'` directive untuk Client Components
- Optimal untuk SEO dan performance

### 3. **Barrel Exports**
- Centralized imports via `components/index.ts`
- Cleaner import statements
- Easier refactoring

### 4. **Responsive Design**
- Desktop: Navbar + Footer
- Mobile: Navbar + BottomNav + Footer
- Tailwind breakpoints untuk responsive

### 5. **TypeScript Strict Mode**
- Type safety di semua components
- Better IDE support
- Catch errors early

---

## 🚀 MIGRATION STRATEGY ke Frontend Baru

### Target Structure:
```
frontend/src/
├── app/
│   ├── (public)/                 # Route group untuk public pages
│   │   ├── page.tsx              # Homepage
│   │   ├── layout.tsx            # Layout dengan Navbar/Footer
│   │   └── ... (sub-pages)
│   │
│   ├── (auth)/                   # Route group untuk auth pages
│   │   └── login/page.tsx
│   │
│   └── dashboard/                # Protected area
│       └── ...
│
└── shared/
    └── components/
        ├── layouts/              # Navbar, Footer, BottomNav
        ├── common/               # Logo, ScrollToTop, Container
        ├── ui/                   # Hero, Section, DataTable
        └── features/             # Homepage components
```

### Mapping Strategy:

| Source (my-unila-portal) | Target (frontend/src) |
|--------------------------|----------------------|
| `app/(main)/page.tsx` | `app/(public)/page.tsx` |
| `app/(main)/layout.tsx` | `app/(public)/layout.tsx` |
| `components/layout/*` | `shared/components/layouts/*` |
| `components/common/*` | `shared/components/common/*` |
| `components/ui/*` | `shared/components/ui/*` |
| Homepage components | `shared/components/features/*` |

---

## ✅ CHECKLIST MIGRASI

### Phase 1: Core Layout ✅
- [ ] Copy layout components (Navbar, Footer, BottomNav)
- [ ] Copy common components (Logo, ScrollToTop, Container)
- [ ] Update imports dan paths
- [ ] Test layout di (public)

### Phase 2: UI Components 🔄
- [ ] Copy UI components (Hero, Section, DataTable)
- [ ] Update styling jika perlu
- [ ] Test responsiveness

### Phase 3: Homepage Features 📝
- [ ] Copy ProfileUnila
- [ ] Copy ProgramStudiTable
- [ ] Copy AkreditasiProdi
- [ ] Copy WorldClassRanking
- [ ] Wire up data fetching

### Phase 4: Other Pages 🎯
- [ ] Copy akademik page
- [ ] Copy layanan page
- [ ] Copy program-studi page
- [ ] Copy statistik page
- [ ] Copy tentang page

---

## 🎉 KESIMPULAN

**my-unila-portal** adalah sistem yang well-structured dengan:
- ✅ Clear separation of concerns (layout, ui, common, features)
- ✅ Route Groups untuk flexible routing
- ✅ Barrel exports untuk clean imports
- ✅ Responsive design (desktop + mobile)
- ✅ TypeScript untuk type safety
- ✅ Server Components untuk optimal performance

**Siap untuk migrasi ke struktur baru!** 🚀