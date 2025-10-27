# 🚀 RENCANA MIGRASI DETAIL: my-unila-portal → frontend

## 📊 ANALISIS STRUKTUR

### Source (my-unila-portal)
```
my-unila-portal/
├── app/
│   ├── (main)/                   # Public pages
│   │   ├── layout.tsx            # Main Layout dengan Navbar/Footer
│   │   └── page.tsx              # Homepage
│   └── dashboard/                # Protected area
│
└── components/
    ├── layout/                   # Navbar, Footer, BottomNav
    ├── common/                   # Logo, ScrollToTop, Container
    ├── ui/                       # Hero, Section, DataTable, PageHero, Skeleton
    ├── ProfileUnila.tsx
    ├── ProgramStudiTable.tsx
    ├── AkreditasiProdi.tsx
    └── statistik/WorldClassRanking.tsx
```

### Target (frontend/src)
```
frontend/src/
├── app/
│   ├── (public)/                 # Public pages (EXISTING)
│   │   ├── layout.tsx            # ✅ Ada tapi perlu update
│   │   └── page.tsx              # ✅ Ada tapi basic
│   └── dashboard/                # ✅ Ada
│
└── shared/
    └── components/
        ├── layouts/              # ✅ Ada folder
        ├── common/               # ✅ Ada folder
        ├── ui/                   # ✅ Ada folder
        └── features/             # ❌ Perlu dibuat
```

---

## 🎯 STRATEGI MIGRASI

### Prinsip:
1. ✅ **Pertahankan struktur frontend** yang sudah ada
2. 📦 **Copy components** ke lokasi yang sesuai
3. 🔧 **Update imports** dari `@/components` → `@/shared/components`
4. 🧪 **Test setiap tahap** sebelum lanjut
5. ⚡ **Incremental migration** - satu komponen, test, commit

---

## 📋 TAHAPAN EKSEKUSI

### ⚠️ TAHAP 0: HAPUS CONFLICT (5 menit) - PRIORITAS TERTINGGI

**Action**:
```bash
# Hapus folder (portal) yang menyebabkan conflict
rmdir /s /q "C:\laragon\www\my-unila\frontend\src\app\(portal)"
```

**Verify**:
```bash
npm run dev
# Server harus jalan tanpa error routing
```

**Expected Result**: ✅ Server jalan, homepage basic tampil

---

### 📦 TAHAP 1: MIGRATE LAYOUT COMPONENTS (30 menit)

#### 1.1 Copy Navbar
```bash
# Source: my-unila-portal/components/layout/Navbar.tsx
# Target: frontend/src/shared/components/layouts/Navbar.tsx
```

**Files to migrate**:
- `Navbar.tsx` (main navigation)

**Tasks**:
- [ ] Copy file ke `src/shared/components/layouts/`
- [ ] Update imports:
  - `@/components` → `@/shared/components`
  - `@/components/common/Logo` → `@/shared/components/common/Logo`
- [ ] Fix TypeScript errors (jika ada)
- [ ] Test component standalone

---

#### 1.2 Copy Footer
```bash
# Source: my-unila-portal/components/layout/Footer.tsx
# Target: frontend/src/shared/components/layouts/Footer.tsx
```

**Tasks**:
- [ ] Copy file
- [ ] Update imports
- [ ] Verify responsiveness
- [ ] Check links

---

#### 1.3 Copy BottomNav
```bash
# Source: my-unila-portal/components/layout/BottomNav.tsx
# Target: frontend/src/shared/components/layouts/BottomNav.tsx
```

**Tasks**:
- [ ] Copy file
- [ ] Update imports
- [ ] Test mobile responsiveness
- [ ] Verify sticky positioning

---

#### 1.4 Create Layouts Index
```bash
# Target: frontend/src/shared/components/layouts/index.ts
```

**Content**:
```typescript
export { default as Navbar } from './Navbar';
export { default as Footer } from './Footer';
export { default as BottomNav } from './BottomNav';
```

---

### 🔧 TAHAP 2: MIGRATE COMMON COMPONENTS (20 menit)

#### 2.1 Copy Logo
```bash
# Source: my-unila-portal/components/common/Logo.tsx
# Target: frontend/src/shared/components/common/Logo.tsx
```

**Tasks**:
- [ ] Copy file
- [ ] Verify image path (`/assets/images/logo-unila.png`)
- [ ] Test link to homepage

---

#### 2.2 Copy ScrollToTop
```bash
# Source: my-unila-portal/components/common/ScrollToTop.tsx
# Target: frontend/src/shared/components/common/ScrollToTop.tsx
```

**Tasks**:
- [ ] Copy file
- [ ] Test scroll behavior
- [ ] Verify smooth scroll
- [ ] Check visibility toggle

---

#### 2.3 Copy Container
```bash
# Source: my-unila-portal/components/common/Container.tsx
# Target: frontend/src/shared/components/common/Container.tsx
```

**Tasks**:
- [ ] Copy file
- [ ] Verify max-width settings
- [ ] Test responsive padding

---

#### 2.4 Create Common Index
```bash
# Target: frontend/src/shared/components/common/index.ts
```

**Content**:
```typescript
export { default as Logo } from './Logo';
export { default as ScrollToTop } from './ScrollToTop';
export { default as Container } from './Container';
```

---

### 🎨 TAHAP 3: MIGRATE UI COMPONENTS (30 menit)

#### 3.1 Copy Hero Component
```bash
# Source: my-unila-portal/components/ui/Hero.tsx
# Target: frontend/src/shared/components/ui/Hero.tsx
```

**Tasks**:
- [ ] Copy file
- [ ] Update imports (Container, Logo, dll)
- [ ] Verify background images
- [ ] Test responsive design
- [ ] Check CTA buttons

---

#### 3.2 Copy Section Component
```bash
# Source: my-unila-portal/components/ui/Section.tsx
# Target: frontend/src/shared/components/ui/Section.tsx
```

**Tasks**:
- [ ] Copy file
- [ ] Verify padding/spacing
- [ ] Test with children content

---

#### 3.3 Copy DataTable Component
```bash
# Source: my-unila-portal/components/ui/DataTable.tsx
# Target: frontend/src/shared/components/ui/DataTable.tsx
```

**Tasks**:
- [ ] Copy file
- [ ] Update imports
- [ ] Test sorting functionality
- [ ] Test pagination
- [ ] Verify responsive table

---

#### 3.4 Copy PageHero Component
```bash
# Source: my-unila-portal/components/ui/PageHero.tsx
# Target: frontend/src/shared/components/ui/PageHero.tsx
```

**Tasks**:
- [ ] Copy file
- [ ] Test breadcrumb navigation
- [ ] Verify page title rendering

---

#### 3.5 Copy Skeleton Component
```bash
# Source: my-unila-portal/components/ui/Skeleton.tsx
# Target: frontend/src/shared/components/ui/Skeleton.tsx
```

**Tasks**:
- [ ] Copy file
- [ ] Test loading animation
- [ ] Verify different skeleton types

---

#### 3.6 Create UI Index
```bash
# Target: frontend/src/shared/components/ui/index.ts
```

**Content**:
```typescript
export { default as Hero } from './Hero';
export { default as Section } from './Section';
export { default as DataTable } from './DataTable';
export { default as PageHero } from './PageHero';
export { default as Skeleton } from './Skeleton';
```

---

### 🏠 TAHAP 4: MIGRATE HOMEPAGE FEATURE COMPONENTS (45 menit)

#### 4.1 Create Features Folder
```bash
mkdir "C:\laragon\www\my-unila\frontend\src\shared\components\features"
mkdir "C:\laragon\www\my-unila\frontend\src\shared\components\features\home"
```

---

#### 4.2 Copy ProfileUnila
```bash
# Source: my-unila-portal/components/ProfileUnila.tsx
# Target: frontend/src/shared/components/features/home/ProfileUnila.tsx
```

**Tasks**:
- [ ] Copy file
- [ ] Update imports (Section, Container)
- [ ] Verify content
- [ ] Test responsive layout
- [ ] Check images/icons

---

#### 4.3 Copy ProgramStudiTable
```bash
# Source: my-unila-portal/components/ProgramStudiTable.tsx
# Target: frontend/src/shared/components/features/home/ProgramStudiTable.tsx
```

**Tasks**:
- [ ] Copy file
- [ ] Update imports (DataTable, Section)
- [ ] Verify data structure
- [ ] Test filtering
- [ ] Test search functionality

---

#### 4.4 Copy AkreditasiProdi
```bash
# Source: my-unila-portal/components/AkreditasiProdi.tsx
# Target: frontend/src/shared/components/features/home/AkreditasiProdi.tsx
```

**Tasks**:
- [ ] Copy file
- [ ] Update imports
- [ ] Verify chart rendering
- [ ] Test data visualization
- [ ] Check color scheme

---

#### 4.5 Copy WorldClassRanking
```bash
# Source: my-unila-portal/components/statistik/WorldClassRanking.tsx
# Target: frontend/src/shared/components/features/home/WorldClassRanking.tsx
```

**Tasks**:
- [ ] Copy file
- [ ] Update imports
- [ ] Verify ranking data
- [ ] Test card layout
- [ ] Check responsive grid

---

#### 4.6 Create Features Index
```bash
# Target: frontend/src/shared/components/features/home/index.ts
```

**Content**:
```typescript
export { default as ProfileUnila } from './ProfileUnila';
export { default as ProgramStudiTable } from './ProgramStudiTable';
export { default as AkreditasiProdi } from './AkreditasiProdi';
export { default as WorldClassRanking } from './WorldClassRanking';
```

---

### 🔄 TAHAP 5: UPDATE PUBLIC LAYOUT (15 menit)

#### 5.1 Update Layout File
**File**: `frontend/src/app/(public)/layout.tsx`

**New Content**:
```typescript
import { Navbar, Footer, BottomNav } from "@/shared/components/layouts";
import { ScrollToTop } from "@/shared/components/common";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
      <BottomNav />
      <ScrollToTop />
    </>
  );
}
```

**Tasks**:
- [ ] Update imports
- [ ] Add min-h-screen to main
- [ ] Test layout rendering
- [ ] Verify all components load

---

### 🏠 TAHAP 6: UPDATE HOMEPAGE (20 menit)

#### 6.1 Update Homepage
**File**: `frontend/src/app/(public)/page.tsx`

**New Content**:
```typescript
import { Hero } from "@/shared/components/ui";
import {
  ProfileUnila,
  ProgramStudiTable,
  AkreditasiProdi,
  WorldClassRanking,
} from "@/shared/components/features/home";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Profile Unila Section */}
      <ProfileUnila />

      {/* Program Studi Table Section */}
      <ProgramStudiTable />

      {/* Akreditasi Program Studi Section */}
      <AkreditasiProdi />

      {/* World Class University Ranking Section */}
      <WorldClassRanking />
    </>
  );
}
```

**Tasks**:
- [ ] Update imports
- [ ] Test each section loads
- [ ] Verify order of sections
- [ ] Check spacing between sections

---

### 📁 TAHAP 7: COPY ASSETS (10 menit)

#### 7.1 Copy Images
```bash
# Source: my-unila-portal/public/assets/images/
# Target: frontend/public/assets/images/
```

**Files to copy**:
- [ ] `logo-unila.png`
- [ ] `hero-bg.jpg` (jika ada)
- [ ] Other images used in components

---

#### 7.2 Verify Asset Paths
**Check these paths in components**:
- Navbar: `/assets/images/logo-unila.png`
- Hero: Background images
- ProfileUnila: Section images
- Icons folder

---

### 🧪 TAHAP 8: TESTING & VERIFICATION (30 menit)

#### 8.1 Component Testing
```bash
# Start dev server
npm run dev
```

**Test Checklist**:
- [ ] Homepage loads without errors
- [ ] Navbar appears and functions
- [ ] Logo links to homepage
- [ ] Mobile menu works
- [ ] Footer displays correctly
- [ ] BottomNav visible on mobile
- [ ] ScrollToTop button works
- [ ] Hero section displays
- [ ] All sections render correctly
- [ ] No console errors
- [ ] No TypeScript errors

---

#### 8.2 Responsive Testing
**Test on different breakpoints**:
- [ ] Mobile (< 640px)
- [ ] Tablet (768px)
- [ ] Desktop (1024px)
- [ ] Large Desktop (1440px)

---

#### 8.3 Navigation Testing
**Test all links work**:
- [ ] Homepage (/)
- [ ] Akademik (/akademik) - jika sudah ada
- [ ] Program Studi (/program-studi)
- [ ] Layanan (/layanan)
- [ ] Statistik (/statistik)
- [ ] Tentang (/tentang)
- [ ] Dashboard (/dashboard)

---

### 🎨 TAHAP 9: STYLING ADJUSTMENTS (20 menit)

#### 9.1 Check Tailwind Config
**File**: `frontend/tailwind.config.ts`

**Verify**:
- [ ] Custom colors defined
- [ ] Font family configured
- [ ] Breakpoints correct
- [ ] Theme extensions

---

#### 9.2 Update Global Styles (if needed)
**File**: `frontend/src/app/globals.css`

**Check**:
- [ ] Tailwind directives present
- [ ] Custom CSS variables
- [ ] Font imports
- [ ] Reset styles

---

### 📦 TAHAP 10: CREATE MASTER INDEX (Optional - 10 menit)

#### 10.1 Create Central Export
**File**: `frontend/src/shared/components/index.ts`

**Content**:
```typescript
// Layout Components
export * from './layouts';

// Common Components
export * from './common';

// UI Components
export * from './ui';

// Feature Components
export * from './features/home';
```

**Benefit**: Cleaner imports
```typescript
// Before
import { Hero } from "@/shared/components/ui";
import { ProfileUnila } from "@/shared/components/features/home";

// After
import { Hero, ProfileUnila } from "@/shared/components";
```

---

## 📊 FILE MAPPING SUMMARY

| Source | Target | Priority |
|--------|--------|----------|
| `components/layout/Navbar.tsx` | `shared/components/layouts/Navbar.tsx` | 🔴 P0 |
| `components/layout/Footer.tsx` | `shared/components/layouts/Footer.tsx` | 🔴 P0 |
| `components/layout/BottomNav.tsx` | `shared/components/layouts/BottomNav.tsx` | 🔴 P0 |
| `components/common/Logo.tsx` | `shared/components/common/Logo.tsx` | 🔴 P0 |
| `components/common/ScrollToTop.tsx` | `shared/components/common/ScrollToTop.tsx` | 🔴 P0 |
| `components/common/Container.tsx` | `shared/components/common/Container.tsx` | 🔴 P0 |
| `components/ui/Hero.tsx` | `shared/components/ui/Hero.tsx` | 🟡 P1 |
| `components/ui/Section.tsx` | `shared/components/ui/Section.tsx` | 🟡 P1 |
| `components/ui/DataTable.tsx` | `shared/components/ui/DataTable.tsx` | 🟡 P1 |
| `components/ui/PageHero.tsx` | `shared/components/ui/PageHero.tsx` | 🟡 P1 |
| `components/ui/Skeleton.tsx` | `shared/components/ui/Skeleton.tsx` | 🟡 P1 |
| `components/ProfileUnila.tsx` | `shared/components/features/home/ProfileUnila.tsx` | 🟢 P2 |
| `components/ProgramStudiTable.tsx` | `shared/components/features/home/ProgramStudiTable.tsx` | 🟢 P2 |
| `components/AkreditasiProdi.tsx` | `shared/components/features/home/AkreditasiProdi.tsx` | 🟢 P2 |
| `components/statistik/WorldClassRanking.tsx` | `shared/components/features/home/WorldClassRanking.tsx` | 🟢 P2 |

---

## ⚡ QUICK START COMMANDS

### Persiapan
```bash
cd C:\laragon\www\my-unila\frontend

# Backup current state
git add .
git commit -m "Before migration from my-unila-portal"

# Hapus conflict
rmdir /s /q "src\app\(portal)"

# Test server
npm run dev
```

---

### Batch Copy Commands (Manual)
```bash
# === LAYOUT COMPONENTS ===
copy "my-unila-portal\components\layout\Navbar.tsx" "src\shared\components\layouts\"
copy "my-unila-portal\components\layout\Footer.tsx" "src\shared\components\layouts\"
copy "my-unila-portal\components\layout\BottomNav.tsx" "src\shared\components\layouts\"

# === COMMON COMPONENTS ===
copy "my-unila-portal\components\common\Logo.tsx" "src\shared\components\common\"
copy "my-unila-portal\components\common\ScrollToTop.tsx" "src\shared\components\common\"
copy "my-unila-portal\components\common\Container.tsx" "src\shared\components\common\"

# === UI COMPONENTS ===
copy "my-unila-portal\components\ui\Hero.tsx" "src\shared\components\ui\"
copy "my-unila-portal\components\ui\Section.tsx" "src\shared\components\ui\"
copy "my-unila-portal\components\ui\DataTable.tsx" "src\shared\components\ui\"
copy "my-unila-portal\components\ui\PageHero.tsx" "src\shared\components\ui\"
copy "my-unila-portal\components\ui\Skeleton.tsx" "src\shared\components\ui\"

# === CREATE FEATURES FOLDER ===
mkdir "src\shared\components\features\home"

# === HOMEPAGE FEATURES ===
copy "my-unila-portal\components\ProfileUnila.tsx" "src\shared\components\features\home\"
copy "my-unila-portal\components\ProgramStudiTable.tsx" "src\shared\components\features\home\"
copy "my-unila-portal\components\AkreditasiProdi.tsx" "src\shared\components\features\home\"
copy "my-unila-portal\components\statistik\WorldClassRanking.tsx" "src\shared\components\features\home\"

# === ASSETS ===
xcopy "my-unila-portal\public\assets" "public\assets" /E /I /Y
```

---

## 🎯 SUCCESS CRITERIA

### Minimum Viable (P0 Complete)
- ✅ No routing errors
- ✅ Server runs successfully
- ✅ Homepage loads
- ✅ Navbar visible and functional
- ✅ Footer visible
- ✅ Mobile navigation works

### Full Homepage (P1 Complete)
- ✅ Hero section displays
- ✅ All UI components work
- ✅ Responsive design functional

### Complete Migration (P2 Complete)
- ✅ All homepage sections present
- ✅ ProfileUnila displays
- ✅ ProgramStudiTable works
- ✅ AkreditasiProdi renders
- ✅ WorldClassRanking shows
- ✅ No console errors
- ✅ All tests passing

---

## ⏱️ TIME ESTIMATION

| Phase | Tasks | Time | Priority |
|-------|-------|------|----------|
| 0. Delete Conflict | 1 task | 5 min | 🔴 P0 |
| 1. Layout Components | 4 tasks | 30 min | 🔴 P0 |
| 2. Common Components | 4 tasks | 20 min | 🔴 P0 |
| 3. UI Components | 6 tasks | 30 min | 🟡 P1 |
| 4. Homepage Features | 6 tasks | 45 min | 🟢 P2 |
| 5. Update Layout | 1 task | 15 min | 🔴 P0 |
| 6. Update Homepage | 1 task | 20 min | 🟢 P2 |
| 7. Copy Assets | 2 tasks | 10 min | 🟡 P1 |
| 8. Testing | 3 tasks | 30 min | 🔴 P0 |
| 9. Styling | 2 tasks | 20 min | 🟡 P1 |
| 10. Master Index | 1 task | 10 min | ⚪ P3 |

**Total P0 (Must Have)**: ~1.5 hours
**Total P0+P1 (Recommended)**: ~2.5 hours  
**Total All**: ~3.5 hours

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue 1: Import Errors
**Error**: `Cannot find module '@/components'`
**Solution**: Update to `@/shared/components`

### Issue 2: Missing Types
**Error**: TypeScript type errors
**Solution**: Check `types/` folder, add missing types

### Issue 3: Style Not Applied
**Error**: Tailwind classes not working
**Solution**: Check `tailwind.config.ts` content paths

### Issue 4: Assets Not Loading
**Error**: Images return 404
**Solution**: Verify paths start with `/assets/`

### Issue 5: 'use client' Missing
**Error**: Hooks error in Server Component
**Solution**: Add `'use client'` directive at top

---

## 📝 NEXT STEPS AFTER MIGRATION

### 1. Other Public Pages
- [ ] Migrate `/akademik` page
- [ ] Migrate `/program-studi` page
- [ ] Migrate `/layanan` page
- [ ] Migrate `/statistik` page
- [ ] Migrate `/tentang` page

### 2. Dashboard Area
- [ ] Setup dashboard layout
- [ ] Migrate dashboard components
- [ ] Setup authentication

### 3. Optimization
- [ ] Image optimization (next/image)
- [ ] Code splitting
- [ ] Performance audit
- [ ] SEO optimization

---

## ✅ READY TO EXECUTE!

**Mulai dari TAHAP 0**, ikuti step-by-step, test setiap tahap sebelum lanjut.

**Let's start the migration! 🚀**