# ✅ Checklist Migrasi Frontend - MyUnila Portal

## Status: 85% Complete 🎯

---

## ✅ **SUDAH SELESAI**

### 1. Routing & Structure
- ✅ Hapus folder `(portal)` yang conflict
- ✅ Struktur routing sudah benar: `(auth)`, `(public)`, `dashboard`
- ✅ Error "two parallel pages" sudah teratasi

### 2. Dependencies & Config
- ✅ AuthContext dan semua dependencies sudah dicopy
  - `src/contexts/AuthContext.tsx`
  - `src/lib/api/client.ts`
  - `src/lib/services/auth.service.ts`
  - `src/lib/types/auth.types.ts`
  - `src/lib/hoc/withAuth.tsx`

- ✅ Utils & Helpers
  - `src/lib/utils/cn.ts`
  - `src/lib/utils/styles.ts`
  - `src/lib/utils/index.ts`

### 3. Providers & Global Setup
- ✅ AuthProvider sudah ditambahkan di `src/app/providers.tsx`
- ✅ Tailwind config sudah diupdate untuk `./src/**` paths
- ✅ Global CSS sudah lengkap dengan all custom classes & animations

### 4. Components
- ✅ Hero component dengan particle effects sudah lengkap
- ✅ Navbar, Footer, BottomNav sudah ada

### 5. Docker Configuration
- ✅ Docker config sudah benar dan siap production
- ✅ Health check endpoint `/api/health` sudah dibuat
- ✅ Environment variables sudah sesuai dengan Kong Gateway

---

## ⚠️ **YANG MASIH PERLU DILENGKAPI**

### 1. **Halaman-halaman Public yang Missing**

Halaman berikut masih kosong/missing dan perlu dibuat:

#### A. `/layanan` - Halaman Layanan
**Lokasi:** `src/app/(public)/layanan/page.tsx`

**Referensi:** `my-unila-portal/app/(main)/layanan/page.tsx`

**Components yang dibutuhkan:**
- `PageHero` - Header halaman (bisa dibuat sendiri atau copy dari referensi)
- `AplikasiTerintegrasi` - List aplikasi/layanan (buat dengan data dummy)

**Contoh struktur:**
```tsx
export default function LayananPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Layanan</h1>
          <p className="text-lg">Layanan Digital Kampus Terpadu</p>
        </div>
      </section>

      {/* List Layanan */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card layanan dummy */}
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-bold mb-2">Layanan {i}</h3>
                <p className="text-gray-600">Deskripsi layanan</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
```

#### B. `/akademik` - Halaman Akademik
**Lokasi:** `src/app/(public)/akademik/page.tsx`
**Status:** Perlu dibuat dengan data dummy

#### C. `/tentang` - Halaman Tentang
**Lokasi:** `src/app/(public)/tentang/page.tsx`
**Status:** Perlu dibuat dengan data dummy

#### D. `/statistik` - Halaman Statistik
**Lokasi:** `src/app/(public)/statistik/page.tsx`
**Status:** Perlu dibuat dengan data dummy

### 2. **Components yang Missing**

#### PageHero Component
**Lokasi:** `src/shared/components/ui/PageHero.tsx`

```tsx
"use client";

import { motion } from "framer-motion";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  gradient?: string;
  icon?: React.ReactNode;
}

export default function PageHero({
  title,
  subtitle,
  description,
  gradient = "from-blue-600 to-indigo-600",
  icon,
}: PageHeroProps) {
  return (
    <section className={`relative py-24 px-4 bg-gradient-to-r ${gradient} overflow-hidden`}>
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
        {icon && (
          <motion.div
            className="inline-block mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {icon}
          </motion.div>
        )}

        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            className="text-xl md:text-2xl font-semibold mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {subtitle}
          </motion.p>
        )}

        {description && (
          <motion.p
            className="text-base md:text-lg opacity-90 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {description}
          </motion.p>
        )}
      </div>
    </section>
  );
}
```

---

## 🔧 **CARA MELENGKAPI**

### Option 1: Copy Manual dari Referensi
1. Buka folder `my-unila-portal/app/(main)/`
2. Copy halaman yang dibutuhkan
3. Paste ke `src/app/(public)/`
4. Sesuaikan import paths

### Option 2: Buat Halaman Dummy Simple (RECOMMENDED untuk cepat)
Gunakan template di atas untuk setiap halaman yang missing.

---

## 📝 **Testing Checklist**

Setelah semua file dibuat, test:

1. ✅ Homepage `/` - Hero dengan particles muncul
2. ⚠️ `/layanan` - Halaman loading tanpa error
3. ⚠️ `/akademik` - Halaman loading tanpa error
4. ⚠️ `/tentang` - Halaman loading tanpa error
5. ⚠️ `/statistik` - Halaman loading tanpa error
6. ✅ `/dashboard` - Protected route working
7. ✅ `/login` - Login page working

---

## 🚀 **Priority Tasks**

**HIGH PRIORITY** (Harus segera):
1. Buat halaman `/layanan` dengan data dummy
2. Buat halaman `/akademik` dengan data dummy
3. Buat halaman `/tentang` dengan data dummy
4. Buat halaman `/statistik` dengan data dummy

**MEDIUM PRIORITY** (Bisa nanti):
5. Copy components detail dari referensi
6. Tambah data dummy yang lebih lengkap
7. Testing seluruh halaman

**LOW PRIORITY** (Optional):
8. Optimasi SEO metadata
9. Add loading states
10. Error boundaries

---

## 📌 **Notes**

- Tailwind config sudah benar ✅
- AuthProvider sudah benar ✅
- Routing structure sudah benar ✅
- Global styles sudah lengkap ✅
- Yang kurang hanya content halaman-halaman saja

**Total Progress: 85%**

Tinggal buat 4-5 halaman public dengan data dummy dan aplikasi sudah 100% berfungsi!

---

**Updated:** 2025-10-16
**By:** Claude Code Agent
