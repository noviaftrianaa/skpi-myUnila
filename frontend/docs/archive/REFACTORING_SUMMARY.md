# Frontend Service Refactoring Summary

**Date**: 2025-10-25
**Task**: Standardize naming conventions and centralize API endpoint configuration

---

## 🎯 Goals

1. **Consistent Naming**: Migrate all services dari kebab-case ke camelCase
2. **Centralized Config**: Pindahkan semua API endpoints ke `.env.local`
3. **Easy Maintenance**: Satu tempat untuk manage semua API URLs

---

## 📦 Changes Made

### 1. File Renaming (kebab-case → camelCase)

| Before | After | Status |
|--------|-------|--------|
| `auth.service.ts` | `authService.ts` | ✅ Renamed |
| `dashboard.service.ts` | `dashboardService.ts` | ✅ Renamed |
| `auth.types.ts` | `authTypes.ts` | ✅ Renamed |
| `dashboard.types.ts` | `dashboardTypes.ts` | ✅ Renamed |

### 2. Import Updates

**Total Files Updated**: 20 files

Updated imports across entire codebase:
- ✅ `src/app/(auth)/login/page.tsx`
- ✅ `src/contexts/AuthContext.tsx`
- ✅ `src/shared/components/**/*.tsx` (15 files)
- ✅ All service files

**Example**:
```typescript
// BEFORE
import { login } from '@/lib/services/auth.service';
import type { User } from '@/lib/types/auth.types';

// AFTER
import { login } from '@/lib/services/authService';
import type { User } from '@/lib/types/authTypes';
```

### 3. API URL Standardization

#### A. `.env.local` Configuration

```bash
# ==============================================
# API Service Endpoints (via Kong Gateway)
# ==============================================

# Auth Service
NEXT_PUBLIC_AUTH_API_URL=http://localhost:9800/auth-service/api/v1

# Dashboard Service (Public endpoints)
NEXT_PUBLIC_DASHBOARD_API_URL=http://localhost:9800/dashboard-service/public/api/v1

# Sister Service (Kemdikbud Integration)
NEXT_PUBLIC_SISTER_API_URL=http://localhost:9800/sister-service/api/v1

# API Configuration
NEXT_PUBLIC_API_TIMEOUT=30000
```

#### B. Service Files Updated

**Standardized Pattern**:
```typescript
const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || 'http://localhost:9800/dashboard-service/public/api/v1';
```

**Files Standardized**:
- ✅ `dashboardService.ts`
- ✅ `mahasiswaSebaranService.ts`
- ✅ `dosenService.ts`
- ✅ `publikasiService.ts`
- ✅ `penelitianService.ts`
- ✅ `kelulusanService.ts`
- ✅ `capaianLulusanService.ts`
- ✅ `surveyService.ts`
- ✅ `sisterService.ts` (already using `NEXT_PUBLIC_SISTER_API_URL`)

---

## 📂 Final Service Structure

```
src/lib/services/
├── authService.ts                    ✅ camelCase
├── dashboardService.ts               ✅ camelCase
├── mahasiswaSebaranService.ts        ✅ camelCase (already)
├── dosenService.ts                   ✅ camelCase (already)
├── sisterService.ts                  ✅ camelCase (already)
├── publikasiService.ts               ✅ camelCase (already)
├── penelitianService.ts              ✅ camelCase (already)
├── kelulusanService.ts               ✅ camelCase (already)
├── capaianLulusanService.ts          ✅ camelCase (already)
├── surveyService.ts                  ✅ camelCase (already)
├── referensiService.ts               ✅ camelCase (already)
├── negaraService.ts                  ✅ camelCase (already)
├── jenjangPendidikanService.ts       ✅ camelCase (already)
├── gelarAkademikService.ts           ✅ camelCase (already)
└── semesterService.ts                ✅ camelCase (already)

src/lib/types/
├── authTypes.ts                      ✅ camelCase
└── dashboardTypes.ts                 ✅ camelCase
```

---

## 🎨 Naming Convention Standards

### Services
- ✅ **Pattern**: `{feature}Service.ts`
- ✅ **Examples**: `authService.ts`, `dosenService.ts`, `mahasiswaSebaranService.ts`
- ❌ **Avoid**: `auth.service.ts`, `auth-service.ts`, `AuthService.ts`

### Types
- ✅ **Pattern**: `{feature}Types.ts`
- ✅ **Examples**: `authTypes.ts`, `dashboardTypes.ts`
- ❌ **Avoid**: `auth.types.ts`, `auth-types.ts`, `AuthTypes.ts`

### API URLs
- ✅ **Pattern**: `NEXT_PUBLIC_{SERVICE}_API_URL`
- ✅ **Examples**:
  - `NEXT_PUBLIC_AUTH_API_URL`
  - `NEXT_PUBLIC_DASHBOARD_API_URL`
  - `NEXT_PUBLIC_SISTER_API_URL`

---

## 🔧 Maintenance Guide

### Adding New Service

1. **Create service file**:
   ```typescript
   // src/lib/services/newFeatureService.ts
   const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || 'http://localhost:9800/dashboard-service/public/api/v1';

   export async function getNewFeature() {
     const response = await fetch(`${API_URL}/new-feature`);
     return response.json();
   }
   ```

2. **Add to `.env.local`** (if using different service):
   ```bash
   NEXT_PUBLIC_NEW_SERVICE_API_URL=http://localhost:9800/new-service/api/v1
   ```

3. **Import in components**:
   ```typescript
   import { getNewFeature } from '@/lib/services/newFeatureService';
   ```

### Changing API Endpoint

**No code changes needed!** Just update `.env.local`:

```bash
# Development
NEXT_PUBLIC_DASHBOARD_API_URL=http://localhost:9800/dashboard-service/public/api/v1

# Staging
# NEXT_PUBLIC_DASHBOARD_API_URL=https://staging-api.unila.ac.id/dashboard-service/public/api/v1

# Production
# NEXT_PUBLIC_DASHBOARD_API_URL=https://api.unila.ac.id/dashboard-service/public/api/v1
```

---

## ✅ Benefits

1. **Consistency**: Semua services menggunakan camelCase naming
2. **Maintainability**: API URLs terpusat di `.env.local`
3. **Flexibility**: Mudah switch environment (dev/staging/prod)
4. **Type Safety**: TypeScript imports tetap type-safe
5. **Developer Experience**: Lebih mudah di-autocomplete dan search

---

## 🧪 Testing

### Manual Testing Checklist

- [x] Authentication flow (login/logout)
- [ ] Dashboard data loading
- [ ] Program Studi page
- [ ] Survey submission
- [ ] Sister API integration
- [ ] All statistics endpoints

### Automated Testing

Run comprehensive test:
```bash
npm run build
```

If build succeeds, all imports are correct!

---

## 📝 Notes

- **No Breaking Changes**: Functionality tetap sama, hanya naming yang berubah
- **Backward Compatible**: Old imports sudah di-update otomatis
- **Git History**: File renames tracked dengan `git mv` (via Python script)

---

## 🚀 Next Steps

1. ✅ Review changes
2. ✅ Test authentication flow
3. ⏳ Test all service endpoints
4. ⏳ Update production `.env` when deploying
5. ⏳ Document API endpoints in API documentation

---

## 📞 Contact

Jika ada issues dengan refactoring:
1. Check `.env.local` configuration
2. Verify import paths
3. Run `npm run build` untuk check TypeScript errors

**Script Used**: `refactor-services.py`
