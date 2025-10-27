# 🏛️ UNILA PORTAL - Frontend Architecture

> Modular, scalable, and maintainable Next.js 15 application

## 📁 Folder Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (public)/            # Public routes (no auth required)
│   │   ├── page.tsx         # Landing page
│   │   ├── tentang/         # About pages
│   │   ├── akademik/        # Academic info pages
│   │   ├── layanan/         # Services pages
│   │   └── statistik/       # Statistics pages
│   │
│   ├── (auth)/              # Auth routes
│   │   └── login/           # Login page
│   │
│   ├── (portal)/            # Protected portal routes
│   │   ├── dashboard/       # User dashboard
│   │   ├── profile/         # User profile
│   │   └── akademik/        # Academic features (KRS, KHS, etc)
│   │
│   ├── admin/               # Admin routes
│   │   └── dashboard/       # Admin dashboard
│   │
│   ├── layout.tsx           # Root layout
│   ├── providers.tsx        # Global providers
│   └── globals.css          # Global styles
│
├── modules/                  # Feature modules (domain-driven)
│   ├── auth/                # Authentication module
│   │   ├── api/             # Auth API client
│   │   ├── components/      # Auth components
│   │   ├── hooks/           # Auth hooks
│   │   ├── stores/          # Auth state (Zustand)
│   │   └── types/           # Auth types
│   │
│   ├── akademik/            # Academic module
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── stores/
│   │
│   └── public/              # Public content module
│       └── components/      # Public page components
│
├── shared/                   # Shared utilities & components
│   ├── api/                 # Base API client (Axios)
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # Basic UI components
│   │   ├── layouts/         # Layout components
│   │   ├── forms/           # Form components
│   │   └── feedback/        # Feedback components
│   ├── hooks/               # Shared hooks
│   ├── utils/               # Utility functions
│   ├── constants/           # Constants
│   └── types/               # Shared types
│
└── types/                    # Global TypeScript types
```

---

## 🏗️ Architecture Principles

### **1. Modular Architecture**
- Code organized by **feature/domain**, not by technical concern
- Each module is self-contained with its own API, components, hooks, and state
- Easy to add/remove features without affecting others

### **2. Clear Separation of Concerns**
```
app/        → Routes & pages (thin layer)
modules/    → Business logic & features
shared/     → Reusable utilities & components
```

### **3. Scalability**
- Easy to add new modules
- Easy to split modules if they grow too large
- Easy to find and maintain code

### **4. State Management**
- **Zustand** for global state (auth, user preferences)
- **React Query** for server state (API data)
- Local state for component-specific state

---

## 📦 Module Structure

Each module follows this structure:

```
modules/[module-name]/
├── api/              # API client & endpoints
│   ├── client.ts     # Module-specific API client
│   └── endpoints.ts  # API endpoint definitions
├── components/       # Module components
├── hooks/            # Module hooks
├── stores/           # State management (Zustand)
├── types/            # Module types
└── utils/            # Module utilities
```

### **Example: Auth Module**

```typescript
// API Client
import { authApi } from '@/modules/auth/api/client';
authApi.login({ username, password });

// Hooks
import { useAuth } from '@/modules/auth/hooks/useAuth';
const { user, login, logout } = useAuth();

// Store
import { useAuthStore } from '@/modules/auth/stores/authStore';
const user = useAuthStore((state) => state.user);

// Components
import { LoginForm } from '@/modules/auth/components/LoginForm';
```

---

## 🔧 Import Conventions

### **Absolute Imports (Always use `@/`)**

```typescript
// ✅ GOOD
import { Button } from '@/shared/components/ui/Button';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { apiClient } from '@/shared/api/client';

// ❌ BAD
import { Button } from '../../../shared/components/ui/Button';
import { useAuth } from '../../modules/auth/hooks/useAuth';
```

### **Import Mapping**

| Import Pattern | Location |
|----------------|----------|
| `@/shared/*` | Shared utilities & components |
| `@/modules/*` | Feature modules |
| `@/types/*` | Global types |
| `@/app/*` | App routes (rarely needed) |

---

## 🎨 Component Guidelines

### **Shared Components**

Located in `src/shared/components/`

```typescript
// UI Components - Basic building blocks
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { Input } from '@/shared/components/ui/Input';

// Layout Components
import { Navbar } from '@/shared/components/layouts/Navbar';
import { Footer } from '@/shared/components/layouts/Footer';

// Form Components
import { FormField } from '@/shared/components/forms/FormField';

// Feedback Components
import { Toast } from '@/shared/components/feedback/Toast';
```

### **Module Components**

Located in `src/modules/[module]/components/`

```typescript
// Auth components
import { LoginForm } from '@/modules/auth/components/LoginForm';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';

// Public content components
import { ProfileUnila } from '@/modules/public/components/tentang/ProfileUnila';
```

---

## 🔐 Authentication Flow

Using **Zustand** for auth state management:

```typescript
// 1. Import hook
import { useAuth } from '@/modules/auth/hooks/useAuth';

// 2. Use in component
function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleLogin = async () => {
    const result = await login({ username, password });
    if (result.success) {
      // Redirect to dashboard
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.nama_lengkap}</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

---

## 🌐 API Client Usage

Base API client using **Axios** with auto token refresh:

```typescript
// Import client
import { apiClient } from '@/shared/api/client';

// Make requests
const response = await apiClient.get('/mahasiswa/profile');
const data = await apiClient.post('/krs/submit', { matakuliah_ids });

// Error handling
try {
  const response = await apiClient.get('/data');
} catch (error) {
  const apiError = handleApiError(error);
  console.error(apiError.message);
}
```

### **Module-specific API**

```typescript
// Auth API
import { authApi } from '@/modules/auth/api/client';
await authApi.login({ username, password });

// Akademik API (example)
import { akademikApi } from '@/modules/akademik/api/client';
await akademikApi.getKRS();
```

---

## 📱 Route Groups

### **Public Routes** `(public)`
- No authentication required
- Available to everyone
- Examples: home, about, services, statistics

### **Auth Routes** `(auth)`
- Login, register, forgot password
- Redirect to dashboard if already logged in

### **Portal Routes** `(portal)`
- Requires authentication
- User-specific features
- Examples: dashboard, profile, KRS, KHS

### **Admin Routes** `admin`
- Requires admin role
- Admin-specific features
- Examples: user management, system settings

---

## 🚀 Development Workflow

### **Adding a New Feature Module**

1. Create module folder:
```bash
src/modules/[module-name]/
├── api/
├── components/
├── hooks/
├── stores/
└── types/
```

2. Create API client:
```typescript
// src/modules/[module-name]/api/client.ts
export class ModuleApiClient {
  // API methods
}
```

3. Create Zustand store (if needed):
```typescript
// src/modules/[module-name]/stores/moduleStore.ts
export const useModuleStore = create((set) => ({
  // State & actions
}));
```

4. Create components:
```typescript
// src/modules/[module-name]/components/FeatureComponent.tsx
export function FeatureComponent() {
  // Component code
}
```

5. Add routes:
```typescript
// src/app/(portal)/[module-name]/page.tsx
export default function ModulePage() {
  return <FeatureComponent />;
}
```

---

## 🧪 Testing

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Run production
npm start
```

---

## 📚 Best Practices

### **1. Keep modules independent**
- Modules should not import from other modules
- Use `shared/` for cross-module code

### **2. Use TypeScript strictly**
- No `any` types
- Define proper interfaces
- Use type inference when possible

### **3. Keep components small**
- Single responsibility
- Max 200 lines per component
- Extract reusable logic to hooks

### **4. Error handling**
```typescript
// Always handle API errors
try {
  const data = await apiClient.get('/data');
} catch (error) {
  const apiError = handleApiError(error);
  toast.error(apiError.message);
}
```

### **5. Loading states**
```typescript
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setIsLoading(true);
  try {
    await apiClient.post('/submit', data);
  } finally {
    setIsLoading(false);
  }
};
```

---

## 🔑 Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8081/api/v1
NEXT_PUBLIC_API_TIMEOUT=30000
```

---

## 📖 Related Documentation

- [Migration Guide](./MIGRATION-GUIDE.md) - How to migrate from old structure
- [Import Update Guide](./IMPORT-UPDATE-GUIDE.md) - Import path mappings
- [API Documentation](./docs/API.md) - API endpoints reference

---

## 🎯 Key Benefits

✅ **Modular** - Easy to add/remove features
✅ **Scalable** - Grows with your application
✅ **Maintainable** - Easy to find and update code
✅ **Type-safe** - Full TypeScript support
✅ **Performance** - Optimized with Next.js 15
✅ **Developer Experience** - Clear structure, easy to navigate

---

**Version:** 2.0 (Modular Architecture)
**Last Updated:** October 2025
