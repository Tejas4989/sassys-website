// Single place to read and validate env vars at startup.
// Throw at module load time so misconfigured deploys fail fast.

function required(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

export const env = {
  DATABASE_URL: required("DATABASE_URL"),
  AUTH_SECRET: required("AUTH_SECRET"),
  RESEND_API_KEY: required("RESEND_API_KEY"),
  CLOVER_MERCHANT_ID: required("CLOVER_MERCHANT_ID"),
  CLOVER_API_KEY: required("CLOVER_API_KEY"),
  CLOVER_WEBHOOK_SECRET: required("CLOVER_WEBHOOK_SECRET"),
  VAPID_PUBLIC_KEY: required("VAPID_PUBLIC_KEY"),
  VAPID_PRIVATE_KEY: required("VAPID_PRIVATE_KEY"),
  R2_ACCOUNT_ID: required("R2_ACCOUNT_ID"),
  R2_ACCESS_KEY_ID: required("R2_ACCESS_KEY_ID"),
  R2_SECRET_ACCESS_KEY: required("R2_SECRET_ACCESS_KEY"),
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME ?? "sassys-media",
  APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "https://mysassys.com",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "inquiry@mysassys.com",
} as const;
