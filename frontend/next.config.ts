import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output untuk Docker
  output: 'standalone',

  // Disable Next.js development indicator
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**',
      },
    ],
  },
};

export default nextConfig;
