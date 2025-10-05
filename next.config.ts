import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable X-Powered-By to reduce information leakage
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nblewwpohqpojhewinhh.supabase.co',
      },
    ],
  },
  // Global security and caching headers
  async headers() {
    const appOrigin = process.env.APP_ORIGIN || '';
    return [
      // Security headers for all routes
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          // Moderate CSP suitable for typical Next.js apps; tighten as needed
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
              "style-src 'self' 'unsafe-inline' https:",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https:",
              "connect-src 'self' https://*.supabase.co https://*.supabase.in https:",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          // HSTS (enabled in production only by platforms that terminate TLS). Safe to send; browsers will apply only over https.
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          // Cross-Origin protections
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        ],
      },
      // CORS headers specifically for API routes (restrict to APP_ORIGIN when defined)
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Accept, X-CSRF-Token' },
          { key: 'Access-Control-Allow-Origin', value: appOrigin || '' },
        ],
      },
      // Strong caching for Next.js build assets
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
