#!/usr/bin/env node
/**
 * Run once to generate VAPID keys for Web Push notifications.
 *   node scripts/generate-vapid-keys.mjs
 *
 * Then set these in .env.local and as CF Worker secrets:
 *   wrangler secret put VAPID_PUBLIC_KEY
 *   wrangler secret put VAPID_PRIVATE_KEY
 *   wrangler secret put NEXT_PUBLIC_VAPID_PUBLIC_KEY  (same as VAPID_PUBLIC_KEY)
 */
import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();
console.log("# Add these to .env.local and set as CF secrets\n");
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
