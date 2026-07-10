import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Uses the adapter defaults: cloudflare-node wrapper, dummy incremental/tag
// caches, and node:crypto externalized for any edge-runtime routes (e.g. the
// OG image route). Wire R2/KV-backed caching here later if desired.
export default defineCloudflareConfig();
