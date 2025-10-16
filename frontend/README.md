# myUnila Frontend Portal

Portal terpadu Universitas Lampung yang mengintegrasikan 70+ sistem dalam satu platform modern dan user-friendly.

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.18-38bdf8)

## 📋 Daftar Isi

- [Tech Stack](#-tech-stack)
- [Struktur Project](#-struktur-project)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Cara Menjalankan](#-cara-menjalankan)
  - [Development (Local)](#1-development-local)
  - [Development (Docker)](#2-development-docker)
  - [Production (Docker)](#3-production-docker)
- [Fitur Utama](#-fitur-utama)
- [API Integration](#-api-integration)
- [Docker Configuration](#-docker-configuration)
- [Brand Guidelines](#-brand-guidelines)
- [Contributing](#-contributing)

---

## 🚀 Tech Stack

### Core Framework
- **Next.js** `15.5.4` - React framework dengan App Router
- **React** `19.2.0` - UI library
- **TypeScript** `5.x` - Type-safe JavaScript

### UI & Styling
- **HeroUI (Hero UI)** `2.8.5` - Modern React component library
- **Tailwind CSS** `3.4.18` - Utility-first CSS framework
- **Framer Motion** `12.23.22` - Animation library
- **React Icons** `5.5.0` - Icon library

### State Management & Data Fetching
- **Zustand** `4.5.0` - Lightweight state management
- **TanStack React Query** `5.90.2` - Server state management & caching
- **Axios** `1.12.2` - HTTP client

### Visualization
- **ECharts** `5.6.0` - Charting library
- **echarts-for-react** `3.0.2` - React wrapper untuk ECharts

### Development Tools
- **ESLint** `9.x` - Code linting
- **PostCSS** `8.5.6` - CSS processing
- **Autoprefixer** `10.4.21` - CSS vendor prefixing

---

## 📁 Struktur Project

```
frontend/
├── docker/                      # Docker configuration
│   ├── Dockerfile              # Multi-stage Docker build
│   └── docker-compose.yml      # Docker compose untuk frontend
├── public/                     # Static assets
│   ├── assets/
│   │   ├── images/            # Logo, icons, illustrations
│   │   └── fonts/             # Custom fonts
│   └── favicon.ico
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth layout group
│   │   │   ├── login/         # Login page
│   │   │   └── layout.tsx     # Auth layout wrapper
│   │   ├── (public)/          # Public layout group
│   │   │   ├── brand/         # Brand guidelines
│   │   │   ├── tentang/       # About page
│   │   │   ├── layanan/       # Services catalog
│   │   │   ├── akademik/      # Academic info
│   │   │   ├── program-studi/ # Study programs
│   │   │   ├── statistik/     # Statistics dashboard
│   │   │   └── layout.tsx     # Public layout wrapper
│   │   ├── portal/            # Main portal (user dashboard)
│   │   │   ├── announcements/ # Announcements
│   │   │   ├── profile/       # User profile
│   │   │   └── page.tsx       # Portal home (applications & services)
│   │   ├── admin/             # Admin panel
│   │   │   ├── dashboard/     # Admin dashboard
│   │   │   └── [service]/     # Dynamic service routes
│   │   ├── api/               # API routes
│   │   │   └── health/        # Health check endpoint
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── contexts/              # React Context providers
│   │   └── AuthContext.tsx   # Authentication context
│   ├── lib/                   # Shared libraries
│   │   ├── api/              # API client configuration
│   │   ├── hoc/              # Higher-Order Components
│   │   ├── services/         # Service layer
│   │   ├── types/            # Shared types
│   │   └── utils/            # Utility functions
│   ├── modules/               # Feature modules
│   │   ├── auth/             # Authentication module
│   │   │   ├── api/          # Auth API calls
│   │   │   ├── components/   # Auth components
│   │   │   ├── hooks/        # Auth custom hooks
│   │   │   ├── stores/       # Auth Zustand stores
│   │   │   └── types/        # Auth types
│   │   └── akademik/         # Academic module
│   │       ├── api/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── stores/
│   │       └── types/
│   ├── shared/                # Shared components & utilities
│   │   ├── api/              # Shared API utilities
│   │   ├── components/       # Reusable components
│   │   │   ├── common/       # Common UI components
│   │   │   ├── forms/        # Form components
│   │   │   ├── feedback/     # Loading, error, success
│   │   │   ├── brand/        # Brand components
│   │   │   ├── akademik/     # Academic components
│   │   │   └── home/         # Homepage components
│   │   ├── config/           # Configuration files
│   │   │   └── site.ts       # Site metadata
│   │   ├── hooks/            # Shared custom hooks
│   │   ├── stores/           # Shared Zustand stores
│   │   └── utils/            # Shared utilities
│   └── types/                # Global TypeScript types
├── .env.example              # Environment variables template
├── .dockerignore             # Docker ignore file
├── middleware.ts             # Next.js middleware
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies & scripts
```

### Penjelasan Struktur

#### 1. **App Router (`src/app/`)**
Menggunakan Next.js 15 App Router dengan layout groups:
- `(auth)` - Halaman authentication dengan layout khusus
- `(public)` - Halaman publik tanpa auth
- `portal` - Portal utama setelah login dengan aplikasi & layanan terintegrasi
- `admin` - Admin panel untuk pengelolaan sistem

#### 2. **Modules (`src/modules/`)**
Feature-based architecture dengan struktur modular:
- Setiap module memiliki `api`, `components`, `hooks`, `stores`, `types`
- Self-contained dan reusable
- Contoh: `auth`, `akademik`, `layanan`

#### 3. **Shared (`src/shared/`)**
Komponen dan utilities yang digunakan di berbagai module:
- `components/common` - Button, Card, Modal, dll
- `components/forms` - Input, Select, Checkbox, dll
- `components/feedback` - Loading, Error, Toast
- `hooks` - Custom React hooks
- `stores` - Global Zustand stores

#### 4. **Lib (`src/lib/`)**
Infrastructure layer:
- `api` - Axios configuration, interceptors
- `hoc` - withAuth, withLayout
- `services` - External service integrations
- `utils` - Helper functions

---

## ⚙️ Konfigurasi Environment

Buat file `.env.local` di root project dengan mengcopy dari `.env.example`:

```bash
cp .env.example .env.local
```

### Environment Variables

```bash
# Application Configuration
NEXT_PUBLIC_APP_NAME=My Unila Portal
NEXT_PUBLIC_APP_URL=http://localhost:3000

# API Configuration
# Kong API Gateway - access backend services via Kong
NEXT_PUBLIC_API_URL=http://localhost:9800/auth-service/api/v1
NEXT_PUBLIC_API_TIMEOUT=30000

# Environment
NODE_ENV=development

# Optional: External Services
# NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=
# NEXT_PUBLIC_SENTRY_DSN=
```

### Penjelasan Environment Variables

| Variable | Deskripsi | Default | Required |
|----------|-----------|---------|----------|
| `NEXT_PUBLIC_APP_NAME` | Nama aplikasi | My Unila Portal | ✅ |
| `NEXT_PUBLIC_APP_URL` | Base URL aplikasi | http://localhost:3000 | ✅ |
| `NEXT_PUBLIC_API_URL` | Backend API endpoint (via Kong Gateway) | http://localhost:9800/auth-service/api/v1 | ✅ |
| `NEXT_PUBLIC_API_TIMEOUT` | API request timeout (ms) | 30000 | ❌ |
| `NODE_ENV` | Environment mode | development | ✅ |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | Google Analytics tracking ID | - | ❌ |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking DSN | - | ❌ |

**Note:** Variables dengan prefix `NEXT_PUBLIC_` akan ter-expose ke browser.

---

## 🎯 Cara Menjalankan

### Prerequisites

- **Node.js** `20.x` atau lebih tinggi
- **npm** `10.x` atau lebih tinggi
- **Docker** & **Docker Compose** (untuk deployment)

### 1. Development (Local)

#### a. Install Dependencies

```bash
npm install
```

#### b. Setup Environment

```bash
cp .env.example .env.local
# Edit .env.local sesuai kebutuhan
```

#### c. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di: **http://localhost:3000**

#### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### 2. Development (Docker)

Untuk development dengan hot-reload menggunakan Docker:

```bash
cd docker

# Start development container
docker-compose --profile dev up -d frontend-dev

# View logs
docker-compose logs -f frontend-dev

# Stop container
docker-compose --profile dev down
```

Aplikasi akan berjalan di: **http://localhost:3001**

**Fitur Development Docker:**
- ✅ Hot reload (watch mode)
- ✅ Volume mounting untuk live changes
- ✅ Auto npm install saat dependencies berubah
- ✅ Polling untuk Windows/Mac file system compatibility

### 3. Production (Docker)

#### a. Build & Run dengan Docker Compose

```bash
cd docker

# Build dan start container
docker-compose up -d frontend

# View logs
docker-compose logs -f frontend

# Stop container
docker-compose down
```

Aplikasi akan berjalan di: **http://localhost:3000**

#### b. Build Manual dengan Docker

```bash
# Build image
docker build -f docker/Dockerfile -t my-unila-frontend:latest .

# Run container
docker run -d \
  --name my-unila-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:9800/auth-service/api/v1 \
  -e NEXT_PUBLIC_APP_NAME="My Unila Portal" \
  -e NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  my-unila-frontend:latest

# View logs
docker logs -f my-unila-frontend

# Stop container
docker stop my-unila-frontend
docker rm my-unila-frontend
```

#### c. Healthcheck

Container memiliki healthcheck otomatis:

```bash
# Check container health
docker inspect --format='{{json .State.Health}}' my-unila-frontend

# Manual healthcheck
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-16T12:00:00.000Z"
}
```

---

## 🌟 Fitur Utama

### 1. **Authentication & Authorization**
- Login dengan JWT token
- Refresh token mechanism
- Role-based access control (RBAC)
- Protected routes dengan middleware

### 2. **Multi-Layout Support**
- Public layout (homepage, tentang, layanan)
- Auth layout (login, register)
- Portal layout (main portal with applications & services)
- Admin layout (admin panel)

### 3. **Service Integration**
- 70+ sistem terintegrasi
- Service catalog dengan kategori
- Dynamic service routing
- iFrame embedding untuk legacy systems

### 4. **Brand Guidelines**
- Interactive brand documentation
- Downloadable logo variants (SVG)
- Color palette showcase
- Typography guidelines
- Component showcase dengan code snippets

### 5. **Portal Dashboard**
- User profile management
- Announcements & notifications
- Favorite applications
- Quick access menu
- 70+ integrated applications catalog
- Service search & filtering
- Role switching capability

### 6. **Academic Features**
- Program studi catalog
- Academic statistics
- Student data visualization
- Faculty information

### 7. **Responsive Design**
- Mobile-first approach
- PWA-ready structure
- Bottom navigation untuk mobile
- Adaptive layouts untuk tablet & desktop

### 8. **Developer Experience**
- TypeScript untuk type safety
- ESLint untuk code quality
- Path aliases (`@/` imports)
- Hot reload development
- Docker support untuk consistency

---

## 🔌 API Integration

### API Client Configuration

API client dikonfigurasi di `src/lib/api/apiClient.ts` menggunakan Axios:

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor untuk attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor untuk handle refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401, refresh token, retry request
    return Promise.reject(error);
  }
);
```

### Backend Services (Kong Gateway)

Frontend berkomunikasi dengan backend melalui **Kong API Gateway**:

```
Frontend (Port 3000)
    ↓
Kong Gateway (Port 9800)
    ↓
┌─────────────────────────────┐
│  Backend Microservices      │
├─────────────────────────────┤
│  - auth-service   (Port 8001) │
│  - user-service   (Port 8002) │
│  - ... (70+ services)        │
└─────────────────────────────┘
```

**Base URL Structure:**
```
http://localhost:9800/{service-name}/api/v1/{endpoint}

Contoh:
- http://localhost:9800/auth-service/api/v1/login
- http://localhost:9800/user-service/api/v1/profile
```

### React Query Integration

Untuk data fetching & caching:

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/apiClient';

export function useUserProfile() {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const { data } = await apiClient.get('/profile');
      return data;
    },
  });
}
```

---

## 🐳 Docker Configuration

### Multi-Stage Dockerfile

Project menggunakan **multi-stage build** untuk optimasi ukuran image:

#### Stage 1: Dependencies
```dockerfile
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
```

#### Stage 2: Builder
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build
```

#### Stage 3: Runner
```dockerfile
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
# Copy built files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

### Docker Compose Services

#### Production Service

```yaml
services:
  frontend:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    container_name: my-unila-frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      - NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    networks:
      - my-unila-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1",
             "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

#### Development Service (Hot Reload)

```yaml
  frontend-dev:
    image: node:20-alpine
    container_name: my-unila-frontend-dev
    working_dir: /app
    ports:
      - "3001:3000"
    volumes:
      - ..:/app
      - /app/node_modules
      - /app/.next
    environment:
      - NODE_ENV=development
      - WATCHPACK_POLLING=true  # For Windows/Mac hot reload
    command: sh -c "npm install && npm run dev"
    profiles:
      - dev  # Only runs with --profile dev
```

### Docker Network

Frontend terhubung dengan backend services via Docker network:

```yaml
networks:
  my-unila-network:
    driver: bridge
```

### Docker Commands Cheat Sheet

```bash
# Build image
docker-compose build frontend

# Start production
docker-compose up -d frontend

# Start development (hot reload)
docker-compose --profile dev up -d frontend-dev

# View logs
docker-compose logs -f frontend

# Restart service
docker-compose restart frontend

# Stop & remove
docker-compose down

# Rebuild from scratch
docker-compose build --no-cache frontend

# Check health
docker inspect --format='{{.State.Health.Status}}' my-unila-frontend

# Enter container shell
docker exec -it my-unila-frontend sh
```

### Environment Variables di Docker

Buat file `.env` di folder `docker/`:

```bash
NEXT_PUBLIC_API_URL=http://host.docker.internal:9800/auth-service/api/v1
NEXT_PUBLIC_APP_NAME=My Unila Portal
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_TIMEOUT=30000
```

**Note:** Gunakan `host.docker.internal` untuk akses host machine dari container.

---

## 🎨 Brand Guidelines

### Warna Primer

```typescript
// tailwind.config.ts
colors: {
  myunila: {
    DEFAULT: '#0B5EA8',
    50: '#E6F2FA',
    100: '#CCE5F5',
    200: '#99CBEB',
    300: '#66B1E1',
    400: '#3397D7',
    500: '#0B5EA8',
    600: '#094B86',
    700: '#073864',
    800: '#052542',
    900: '#021220',
  },
}
```

### Typography

- **Primary Font:** Poppins (Bold untuk logo)
- **Fallback:** System sans-serif

### Logo

Download logo variants di halaman brand guidelines:
- Background putih + tulisan biru
- Background biru + tulisan putih
- Background transparent + tulisan biru
- Logo Unila

Akses: **http://localhost:3000/brand**

### Gradient Backgrounds

```css
.gradient-blue-modern {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1e40af 100%);
}

.gradient-ocean {
  background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%);
}

.gradient-sky {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%);
}
```

---

## 🤝 Contributing

### Development Workflow

1. **Clone repository**
   ```bash
   git clone https://bitbucket.org/mahendraunila/my-unila.git
   cd my-unila/frontend
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Make changes & test**
   - Follow TypeScript types
   - Use ESLint rules
   - Test di berbagai screen sizes

6. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

7. **Push & create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style Guidelines

- **TypeScript:** Gunakan strict mode, avoid `any`
- **Components:** Functional components dengan React hooks
- **Naming:**
  - Components: PascalCase (e.g., `UserProfile.tsx`)
  - Files: camelCase (e.g., `apiClient.ts`)
  - CSS Classes: kebab-case (e.g., `btn-primary`)
- **Imports:** Gunakan path aliases (`@/`)
- **Comments:** JSDoc untuk functions, inline untuk complex logic

### Commit Convention

```
feat: new feature
fix: bug fix
docs: documentation changes
style: code style changes (formatting)
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

---

## 📞 Support & Contact

**Tim UPA TIK Universitas Lampung**

- 📧 Email: dev@unila.ac.id
- 🌐 Website: https://www.unila.ac.id
- 📍 Alamat: Universitas Lampung, Bandar Lampung

---

## 📄 License

Copyright © 2025 UPA TIK Universitas Lampung. All rights reserved.

---

**Built with ❤️ by UPA TIK Universitas Lampung**
