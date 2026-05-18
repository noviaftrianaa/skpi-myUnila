import type { NextConfig } from "next";

// =============================================================================
// Security headers (Sprint 13 hardening)
//
// CSP defensive: same allowlist seperti Nginx vm9-blog (deployment/production/
// vm9-blog/configs/nginx/conf.d/blog.conf), supaya kalau Next.js standalone
// di-deploy tanpa Nginx (atau bypass via curl), header tetap aktif.
//
// Dev mode menggunakan CSP yang lebih relaxed karena Next.js HMR butuh:
//   - 'unsafe-eval' untuk hot reload
//   - ws://localhost:3002 untuk websocket dev server
//   - eval() di webpack runtime
// Production stripping 'unsafe-eval' opsional kalau Next.js prod build clean
// dari eval — tapi runtime kadang masih butuh untuk dynamic import, jadi
// kita tetap allow untuk safety.
// =============================================================================
const isDev = process.env.NODE_ENV !== "production";

const cspPolicy = [
  "default-src 'self'",
  "img-src 'self' data: blob: https://minio.unila.ac.id https://ui-avatars.com https://picsum.photos https://images.unsplash.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  // ws:/wss: untuk dev HMR + production push notification (browser ke push service)
  `connect-src 'self' https://api.blog.unila.ac.id ${isDev ? "ws://localhost:* http://localhost:*" : ""} wss:`,
  "media-src 'self' https://minio.unila.ac.id",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://platform.twitter.com",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  // HSTS hanya effective di HTTPS — di dev (http://localhost) browser ignore.
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: cspPolicy,
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
  output: "standalone",
  productionBrowserSourceMaps: true,

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "**.unila.ac.id" },
      { protocol: "http", hostname: "localhost" },
    ],
  },

  async headers() {
    return [
      {
        // Apply ke semua route. Nginx prod tetap akan override sebagian
        // (last-write wins di header chain), tapi di dev / standalone deploy,
        // ini jadi sumber security headers tunggal.
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
