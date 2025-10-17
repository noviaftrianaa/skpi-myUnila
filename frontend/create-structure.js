const fs = require('fs');
const path = require('path');

// Base path
const basePath = './src';

// Struktur folder yang akan dibuat
const structure = {
  'app/(public)': ['about', 'contact'],
  'app/(auth)': ['login', 'register', 'forgot-password'],
  'app/(portal)': [
    'dashboard',
    'akademik/krs',
    'akademik/khs',
    'akademik/jadwal',
    'kepegawaian/absensi',
    'kepegawaian/cuti',
    'profile'
  ],
  'app/admin': ['dashboard', '[service]'],
  'app/api': ['health'],
  'modules/auth/api': [],
  'modules/auth/components': [],
  'modules/auth/hooks': [],
  'modules/auth/stores': [],
  'modules/akademik/api': [],
  'modules/akademik/components': [],
  'modules/akademik/hooks': [],
  'modules/akademik/stores': [],
  'modules/kepegawaian/api': [],
  'modules/kepegawaian/components': [],
  'modules/kepegawaian/hooks': [],
  'modules/kepegawaian/stores': [],
  'modules/_template/api': [],
  'modules/_template/components': [],
  'modules/_template/hooks': [],
  'modules/_template/stores': [],
  'shared/api': [],
  'shared/components/ui': [],
  'shared/components/layouts': [],
  'shared/components/forms': [],
  'shared/components/feedback': [],
  'shared/hooks': [],
  'shared/utils': [],
  'shared/constants': [],
  'shared/types': [],
  'types': [],
};

// Fungsi untuk membuat folder
function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created: ${dirPath}`);
  }
}

// Fungsi untuk membuat file placeholder
function createFile(filePath, content = '') {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`📄 Created: ${filePath}`);
  }
}

// Buat struktur folder
console.log('🚀 Creating frontend structure...\n');

Object.keys(structure).forEach(folder => {
  const fullPath = path.join(basePath, folder);
  createDirectory(fullPath);
  
  // Buat subfolder jika ada
  structure[folder].forEach(subFolder => {
    const subPath = path.join(fullPath, subFolder);
    createDirectory(subPath);
  });
});

// Buat file-file penting
console.log('\n📝 Creating important files...\n');

// App layouts
createFile(path.join(basePath, 'app/(public)/layout.tsx'), `export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
`);

createFile(path.join(basePath, 'app/(public)/page.tsx'), `export default function HomePage() {
  return (
    <div>
      <h1>Welcome to UNILA Portal</h1>
    </div>
  );
}
`);

createFile(path.join(basePath, 'app/(auth)/layout.tsx'), `export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
`);

createFile(path.join(basePath, 'app/(portal)/layout.tsx'), `export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
`);

createFile(path.join(basePath, 'app/admin/layout.tsx'), `export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
`);

createFile(path.join(basePath, 'app/layout.tsx'), `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'UNILA Portal',
  description: 'Portal Universitas Lampung',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
`);

createFile(path.join(basePath, 'app/providers.tsx'), `'use client';

import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
`);

// Module files
createFile(path.join(basePath, 'modules/auth/api/client.ts'), `import { createClient } from '@/shared/api/base-client';

export const authApi = createClient('/api/auth');
`);

createFile(path.join(basePath, 'modules/auth/api/endpoints.ts'), `import { authApi } from './client';

export const authEndpoints = {
  login: (data: any) => authApi.post('/login', data),
  logout: () => authApi.post('/logout'),
  me: () => authApi.get('/me'),
};
`);

createFile(path.join(basePath, 'modules/auth/types.ts'), `export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}
`);

// Shared files
createFile(path.join(basePath, 'shared/api/base-client.ts'), `import axios, { AxiosInstance } from 'axios';

export function createClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL + baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return client;
}
`);

createFile(path.join(basePath, 'shared/api/config.ts'), `export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 30000,
};
`);

createFile(path.join(basePath, 'shared/types/common.ts'), `export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
`);

createFile(path.join(basePath, 'types/global.d.ts'), `declare global {
  interface Window {
    // Add global types here
  }
}

export {};
`);

createFile(path.join(basePath, 'types/env.d.ts'), `declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_APP_NAME: string;
  }
}
`);

// README per module
createFile(path.join(basePath, 'modules/auth/README.md'), `# Auth Module

Module untuk authentication dan authorization.

## Struktur:
- \`api/\`: API client dan endpoints
- \`components/\`: React components
- \`hooks/\`: Custom hooks
- \`stores/\`: State management
- \`types.ts\`: TypeScript types
- \`utils.ts\`: Utility functions
`);

createFile(path.join(basePath, 'modules/akademik/README.md'), `# Akademik Module

Module untuk fitur-fitur akademik.
`);

createFile(path.join(basePath, 'modules/_template/README.md'), `# Module Template

Copy folder ini untuk membuat module baru.

## Steps:
1. Copy folder \`_template\`
2. Rename sesuai nama module
3. Edit \`api/client.ts\` - ganti base URL
4. Edit \`api/endpoints.ts\` - tambah endpoints
5. Buat components, hooks, stores sesuai kebutuhan
`);

console.log('\n✨ Frontend structure created successfully!\n');
console.log('📁 Next steps:');
console.log('1. Run: npm install');
console.log('2. Create .env.local file');
console.log('3. Start development: npm run dev');
