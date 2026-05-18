import type { NextConfig } from "next";

// =============================================================================
// Security headers (Sprint 13 hardening — dashboard)
//
// Catatan: CSP strict TIDAK di-set di dashboard karena banyak integrasi
// (CKEditor, TipTap, ECharts, MinIO storage proxy, push service worker)
// butuh audit menyeluruh agar tidak break. CSP rollout di dashboard =
// PR terpisah dengan smoke test per-route.
//
// Headers berikut aman untuk semua route + meningkatkan baseline security.
// =============================================================================
const dashboardSecurityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  // Enable standalone output untuk Docker
  output: 'standalone',

  // Enable browser source maps in production for debugging
  productionBrowserSourceMaps: true,

  // Redirect /auth/* to /* because (auth) is a route group (not in URL path)
  async redirects() {
    return [
      {
        source: '/auth/:path*',
        destination: '/:path*',
        permanent: false,
      },
      // Refactor 2026-05-13: manajemen-konten moved under manajemen-apps shell.
      {
        source: '/dashboard/manajemen-konten',
        destination: '/dashboard/manajemen-apps/manajemen-konten',
        permanent: false,
      },
      {
        source: '/dashboard/manajemen-konten/:path*',
        destination: '/dashboard/manajemen-apps/manajemen-konten/:path*',
        permanent: false,
      },
    ];
  },

  // Disable Next.js development indicator
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },

  // Disable ESLint during build for production deployment
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Proxy `/myunila-storage/*` ke MinIO upstream supaya foto/file served via same-origin
  // (no CORS issue, accessible dari browser internet). MINIO_STORAGE_URL di-set di
  // build/runtime env (Dockerfile + docker-compose). Default fallback ke LAN IP supaya
  // di-dev/local kerja, di prod/staging override via env.
  async rewrites() {
    const minioUpstream = process.env.MINIO_STORAGE_URL || 'http://192.168.120.47:9000';
    return [
      {
        source: '/myunila-storage/:path*',
        destination: `${minioUpstream}/myunila-storage/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: dashboardSecurityHeaders,
      },
    ];
  },
};

export default nextConfig;
