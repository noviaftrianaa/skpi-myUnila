# 🔧 ROUTING FIX - Resolving Parallel Pages Conflict

## ❌ Masalah Error

```
You cannot have two parallel pages that resolve to the same path. 
Please check /(portal)/page and /(public)/page.
```

**Root Cause**: Ada 2 `page.tsx` yang sama-sama handle root path `/`
- `src/app/(portal)/page.tsx` ❌
- `src/app/(public)/page.tsx` ✅

## ✅ Solusi

### 1. Hapus File yang Conflict
**HAPUS** file ini karena salah tempat:
```
src/app/(portal)/page.tsx  ❌ DELETE
src/app/(portal)/layout.tsx  ❌ DELETE (tidak diperlukan)
```

### 2. Struktur Routing yang Benar

```
src/app/
├── (public)/              # Public pages (tidak perlu login)
│   ├── layout.tsx         ✅ Public layout
│   ├── page.tsx           ✅ Homepage (/)
│   ├── tentang/
│   │   └── page.tsx       ✅ (/tentang)
│   ├── akademik/
│   │   └── page.tsx       ✅ (/akademik)
│   ├── layanan/
│   │   └── page.tsx       ✅ (/layanan)
│   └── program-studi/
│       └── [slug]/
│           └── page.tsx   ✅ (/program-studi/[slug])
│
├── (auth)/                # Auth pages
│   └── login/
│       └── page.tsx       ✅ (/login)
│
├── dashboard/             # Protected area (perlu login)
│   ├── page.tsx           ✅ (/dashboard)
│   ├── profile/
│   │   └── page.tsx       ✅ (/dashboard/profile)
│   └── announcements/
│       └── page.tsx       ✅ (/dashboard/announcements)
│
└── layout.tsx             ✅ Root layout
```

### 3. Penjelasan Route Groups

| Route Group | Purpose | Login Required? | Base Path |
|-------------|---------|-----------------|-----------|
| `(public)` | Public pages | ❌ No | `/` |
| `(auth)` | Auth pages | ❌ No | `/` |
| `dashboard` | User portal/dashboard | ✅ Yes | `/dashboard` |
| `admin` | Admin panel | ✅ Yes (Admin) | `/admin` |

## 🎯 Migration Plan dari my-unila-portal

### Mapping Old → New Structure

| Old (my-unila-portal) | New Location | Status |
|----------------------|--------------|--------|
| `app/(main)/page.tsx` | `src/app/(public)/page.tsx` | ✅ Done |
| `app/(main)/tentang/page.tsx` | `src/app/(public)/tentang/page.tsx` | ✅ Done |
| `app/(main)/akademik/page.tsx` | `src/app/(public)/akademik/page.tsx` | ✅ Done |
| `app/(main)/layanan/page.tsx` | `src/app/(public)/layanan/page.tsx` | ✅ Done |
| `app/(main)/program-studi/` | `src/app/(public)/program-studi/` | ✅ Done |
| `app/login/page.tsx` | `src/app/(auth)/login/page.tsx` | ✅ Done |
| `app/dashboard/page.tsx` | `src/app/dashboard/page.tsx` | ⏳ TODO |

## 📝 Action Items

### Immediate (Fix Error)

1. **Hapus folder `(portal)`**:
   ```bash
   rm -rf src/app/(portal)
   ```

2. **Migrate konten `(portal)/page.tsx` ke `dashboard/page.tsx`**:
   - File yang perlu dipindahkan: Portal dashboard yang isinya aplikasi-aplikasi
   - Lokasi baru: `src/app/dashboard/page.tsx`
   - **JANGAN** langsung copy! Lihat content lama di `my-unila-portal/app/dashboard/page.tsx`

### Next Steps (Migrate Homepage)

3. **Update `(public)/page.tsx` dengan konten asli**:
   - Ambil dari: `my-unila-portal/app/(main)/page.tsx`
   - Components yang dibutuhkan:
     - `Hero`
     - `ProfileUnila`
     - `ProgramStudiTable`
     - `AkreditasiProdi`
     - `WorldClassRanking`

4. **Migrate Components**:
   ```bash
   # Copy components dari my-unila-portal
   cp -r my-unila-portal/components/Hero src/shared/components/
   cp -r my-unila-portal/components/ProfileUnila src/shared/components/
   cp -r my-unila-portal/components/ProgramStudiTable src/shared/components/
   cp -r my-unila-portal/components/AkreditasiProdi src/shared/components/
   cp -r my-unila-portal/components/statistik src/shared/components/
   ```

## 🔍 Components yang Diperlukan Homepage

Berdasarkan `my-unila-portal/app/(main)/page.tsx`:

```tsx
import { Hero, ProfileUnila, ProgramStudiTable } from "@/components";
import AkreditasiProdi from "@/components/AkreditasiProdi";
import WorldClassRanking from "@/components/statistik/WorldClassRanking";
```

### Priority Components to Migrate:

1. **Hero** - Hero section dengan gambar dan CTA
2. **ProfileUnila** - Profil Universitas Lampung
3. **ProgramStudiTable** - Tabel program studi
4. **AkreditasiProdi** - Akreditasi program studi
5. **WorldClassRanking** - Ranking dunia

## ⚠️ Important Notes

1. **JANGAN** gunakan route group `(portal)` untuk dashboard
2. **GUNAKAN** route biasa `dashboard/` untuk area yang membutuhkan autentikasi
3. **Route groups** `()` hanya untuk grouping yang tidak mempengaruhi URL
4. **Middleware** akan handle authentication redirect ke `/login`

## 🚀 Quick Fix Commands

```bash
# 1. Hapus folder yang conflict
rm -rf src/app/(portal)

# 2. Restart dev server
npm run dev

# 3. Test routes
# Homepage: http://localhost:3000/
# Dashboard: http://localhost:3000/dashboard
```

## ✅ Expected Result

After fix:
- ✅ `http://localhost:3000/` → Public homepage
- ✅ `http://localhost:3000/tentang` → Tentang page
- ✅ `http://localhost:3000/login` → Login page
- ✅ `http://localhost:3000/dashboard` → Dashboard (protected)
- ❌ No more routing conflicts!

---

**Status**: 🔴 Critical - Must fix before continuing
**Priority**: 🚨 P0 - Blocking development
**ETA**: 5 minutes
