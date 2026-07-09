import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Only send errors in production — not dev/preview
  enabled: process.env.NODE_ENV === "production",
  tracesSampleRate: 0.1, // 10% of transactions sampled
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
});
