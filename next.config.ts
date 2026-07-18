import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
    ],
  },

  // Permanent 308 redirects for legacy WordPress URLs
  // CF Page Rules also handle these, but belt-and-suspenders in the app too.
  async redirects() {
    return [
      // WordPress-style page slugs → new routes
      { source: "/our-menu", destination: "/menu", permanent: true },
      { source: "/our-menu/", destination: "/menu", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/contact-us/", destination: "/contact", permanent: true },
      // WordPress category/tag archive patterns
      { source: "/category/:slug*", destination: "/menu", permanent: true },
      { source: "/tag/:slug*", destination: "/", permanent: true },
      // Common WordPress admin URL attempts → 404 gracefully
      { source: "/wp-admin/:path*", destination: "/", permanent: false },
      { source: "/wp-login.php", destination: "/", permanent: false },
      { source: "/wp-content/:path*", destination: "/", permanent: false },
    ];
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: "/(_next/static|public)/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Service worker must not be cached aggressively
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

// Sentry was wrapped here but never initialized (no DSN, no Sentry.init, no
// instrumentation files), so it captured nothing at runtime while adding weight
// to the Cloudflare Worker bundle. Removed to stay under the 3 MiB Worker limit.
export default nextConfig;
