import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https://cdn.sanity.io https://summitintelligentsystems.com https://*.tile.openstreetmap.org https://tile.openstreetmap.org",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com${isProduction ? "" : " 'unsafe-eval'"}`,
  "connect-src 'self'",
  "media-src 'self'",
  "worker-src 'self' blob:",
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
].join("; ");

const baseSecurityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  ...(isProduction
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const privateAdminHeaders = [
  { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
  { key: "Referrer-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: baseSecurityHeaders,
      },
      {
        source: "/admin/:path*",
        headers: privateAdminHeaders,
      },
      {
        source: "/api/admin/:path*",
        headers: privateAdminHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "summitintelligentsystems.com",
      },
    ],
  },
};

export default nextConfig;
