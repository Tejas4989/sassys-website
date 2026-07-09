import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Only upload source maps in CI with a real auth token
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  // Disable Sentry telemetry
  telemetry: false,
  // Don't fail the build if Sentry upload fails
  errorHandler: (err: Error) => {
    console.warn("Sentry config error (non-fatal):", err.message);
  },
});
