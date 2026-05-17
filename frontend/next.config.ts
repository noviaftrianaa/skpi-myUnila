import type { NextConfig } from "next";

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
};

export default nextConfig;
