my-unila-portal/
│
├── src/
│   ├── app/                                    # 📄 NEXT.JS APP ROUTER
│   │   ├── (public)/                          # Public routes
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── about/page.tsx
│   │   │   └── contact/page.tsx
│   │   │
│   │   ├── (auth)/                            # Auth routes
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   │
│   │   ├── (portal)/                          # Portal routes
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── akademik/
│   │   │   │   ├── krs/page.tsx
│   │   │   │   ├── khs/page.tsx
│   │   │   │   └── jadwal/page.tsx
│   │   │   ├── kepegawaian/
│   │   │   │   ├── absensi/page.tsx
│   │   │   │   └── cuti/page.tsx
│   │   │   └── profile/page.tsx
│   │   │
│   │   ├── admin/                             # Admin routes
│   │   │   ├── layout.tsx
│   │   │   ├── [service]/                     # Dynamic service routing
│   │   │   │   ├── layout.tsx
│   │   │   │   └── [...slug]/page.tsx
│   │   │   └── dashboard/page.tsx
│   │   │
│   │   ├── api/                               # API routes
│   │   │   └── health/route.ts
│   │   │
│   │   ├── layout.tsx
│   │   └── providers.tsx
│   │
│   ├── modules/                               # 🎯 FEATURE MODULES (by Service)
│   │   ├── auth/
│   │   │   ├── api/                           # API client untuk auth service
│   │   │   │   ├── client.ts
│   │   │   │   └── endpoints.ts
│   │   │   ├── components/                    # Auth components
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── AuthGuard.tsx
│   │   │   ├── hooks/                         # Auth hooks
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useLogin.ts
│   │   │   ├── stores/                        # State management
│   │   │   │   └── authStore.ts
│   │   │   ├── types.ts                       # Auth types
│   │   │   └── utils.ts                       # Auth utilities
│   │   │
│   │   ├── akademik/
│   │   │   ├── api/
│   │   │   │   ├── client.ts                  # Akademik service client
│   │   │   │   └── endpoints.ts
│   │   │   ├── components/
│   │   │   │   ├── KRSTable.tsx
│   │   │   │   ├── KHSCard.tsx
│   │   │   │   └── JadwalCalendar.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useKRS.ts
│   │   │   │   ├── useKHS.ts
│   │   │   │   └── useJadwal.ts
│   │   │   ├── stores/
│   │   │   │   └── akademikStore.ts
│   │   │   ├── types.ts
│   │   │   └── utils.ts
│   │   │
│   │   ├── kepegawaian/
│   │   │   ├── api/
│   │   │   │   ├── client.ts
│   │   │   │   └── endpoints.ts
│   │   │   ├── components/
│   │   │   │   ├── AbsensiTable.tsx
│   │   │   │   └── CutiForm.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAbsensi.ts
│   │   │   │   └── useCuti.ts
│   │   │   ├── stores/
│   │   │   │   └── kepegawaianStore.ts
│   │   │   ├── types.ts
│   │   │   └── utils.ts
│   │   │
│   │   └── _template/                         # Template untuk service baru
│   │       ├── api/
│   │       │   ├── client.ts
│   │       │   └── endpoints.ts
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── stores/
│   │       ├── types.ts
│   │       └── utils.ts
│   │
│   ├── shared/                                # 🔧 SHARED UTILITIES
│   │   ├── api/                               # Shared API utilities
│   │   │   ├── base-client.ts                 # Base API client
│   │   │   ├── interceptors.ts                # Request/Response interceptors
│   │   │   ├── error-handler.ts               # Global error handling
│   │   │   └── config.ts                      # API configuration
│   │   │
│   │   ├── components/                        # Shared UI components
│   │   │   ├── ui/                           # Base UI (Hero UI wrappers)
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   └── Modal.tsx
│   │   │   ├── layouts/
│   │   │   │   ├── LandingLayout.tsx
│   │   │   │   ├── PortalLayout.tsx
│   │   │   │   └── AdminLayout.tsx
│   │   │   ├── forms/
│   │   │   │   ├── FormField.tsx
│   │   │   │   └── FormSelect.tsx
│   │   │   └── feedback/
│   │   │       ├── Loading.tsx
│   │   │       ├── ErrorBoundary.tsx
│   │   │       └── Toast.tsx
│   │   │
│   │   ├── hooks/                             # Shared hooks
│   │   │   ├── useDebounce.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   └── useQueryParams.ts
│   │   │
│   │   ├── utils/                             # Utility functions
│   │   │   ├── formatters.ts                  # Date, number, currency
│   │   │   ├── validators.ts                  # Validation functions
│   │   │   └── helpers.ts                     # General helpers
│   │   │
│   │   ├── constants/                         # Constants
│   │   │   ├── routes.ts
│   │   │   ├── roles.ts
│   │   │   └── config.ts
│   │   │
│   │   └── types/                             # Shared types
│   │       ├── common.ts
│   │       └── api.ts
│   │
│   └── types/                                 # 🔷 GLOBAL TYPES
│       ├── global.d.ts
│       └── env.d.ts
│
├── public/
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   └── locales/
│       ├── id/
│       └── en/
│
├── tests/                                     # 🧪 TESTING
│   ├── modules/                               # Module tests
│   │   ├── auth/
│   │   ├── akademik/
│   │   └── kepegawaian/
│   └── shared/                                # Shared utilities tests
│
├── scripts/
│   └── create-module.ts                       # Script untuk generate module baru
│
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json


# 📚 PENJELASAN STRUKTUR

## 1. MODULES (by Service)
Setiap service memiliki folder sendiri dengan struktur standar:
- api/         → Client & endpoints untuk service
- components/  → UI components khusus service
- hooks/       → Custom hooks khusus service
- stores/      → State management (Zustand/Redux)
- types.ts     → TypeScript types
- utils.ts     → Utility functions

## 2. SHARED
Semua yang reusable di-share:
- api/         → Base client, interceptors, error handling
- components/  → UI components yang digunakan banyak service
- hooks/       → Hooks yang digunakan banyak service
- utils/       → Utility functions global
- constants/   → Konstanta global
- types/       → Types global

## 3. APP (Next.js App Router)
Hanya routing dan layout, business logic di modules


# 🎯 KEUNTUNGAN STRUKTUR INI

## ✅ Skalabilitas Tinggi
- Tambah service baru = copy _template folder
- Service terpisah, tidak saling ganggu
- Dynamic routing di admin ([service]/[...slug])

## ✅ Maintainability
- 1 service = 1 folder, mudah dicari
- Struktur konsisten antar service
- Clear separation of concerns

## ✅ Testability
- Test per module terpisah
- Shared utilities di-test sendiri
- Easy to mock dependencies

## ✅ Reusability
- Shared folder untuk semua yang reusable
- UI components di-share
- API utilities di-share

## ✅ Clear Boundaries
- Modules = domain boundaries
- Shared = cross-cutting concerns
- App = presentation layer


# 🚀 CONTOH IMPLEMENTASI

## Struktur Module Auth:
```
auth/
├── api/
│   ├── client.ts          → const authApi = createClient('/auth')
│   └── endpoints.ts       → export const login = (data) => authApi.post(...)
├── components/
│   ├── LoginForm.tsx      → Form component
│   └── AuthGuard.tsx      → Protection component
├── hooks/
│   ├── useAuth.ts         → useQuery(authApi.getUser)
│   └── useLogin.ts        → useMutation(authApi.login)
├── stores/
│   └── authStore.ts       → Zustand store
├── types.ts               → User, Session, LoginDTO, etc.
└── utils.ts               → validateEmail, hashPassword, etc.
```

## Cara Tambah Service Baru:
1. Copy folder _template ke nama_service/
2. Edit api/client.ts → ganti base URL
3. Edit api/endpoints.ts → tambah endpoints
4. Buat components sesuai kebutuhan
5. Buat hooks untuk data fetching
6. Export dari index (opsional)


# 📋 FILE PENTING

## shared/api/base-client.ts
```typescript
// Base client untuk semua service
export const createClient = (baseURL: string) => {
  // Setup axios dengan interceptors
  // Return reusable methods: get, post, put, delete
}
```

## modules/[service]/api/client.ts
```typescript
import { createClient } from '@/shared/api/base-client'

export const akademikApi = createClient('/api/akademik')
```

## modules/[service]/hooks/use[Feature].ts
```typescript
import { useQuery } from '@tanstack/react-query'
import { akademikApi } from '../api/endpoints'

export const useKRS = (mahasiswaId: string) => {
  return useQuery({
    queryKey: ['krs', mahasiswaId],
    queryFn: () => akademikApi.getKRS(mahasiswaId)
  })
}
```