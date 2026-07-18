// One-off: fetch curated stock photos for the site's fixed photo slots (hero,
// category tiles, story/about/contact) from Pexels and upload them to R2 under
// the site/ prefix. Referenced in pages via getPublicUrl("site/<name>.jpg").
//
// Usage: node --env-file=.env.local scripts/seed-site-images.mjs

import { AwsClient } from "aws4fetch";

const ENDPOINT = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const BUCKET = process.env.R2_BUCKET_NAME;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const r2 = new AwsClient({
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  service: "s3",
  region: "auto",
});

// key -> Pexels search query
const IMAGES = {
  "site/hero.jpg": "wood fired pizza restaurant",
  "site/cat-pizza.jpg": "pizza",
  "site/cat-subs.jpg": "submarine sandwich",
  "site/cat-chicken.jpg": "fried chicken",
  "site/cat-salads.jpg": "fresh salad bowl",
  "site/cat-breakfast.jpg": "breakfast plate eggs",
  "site/cat-baking.jpg": "fresh bread bakery",
  "site/story.jpg": "bakery shop interior",
  "site/about.jpg": "bakery counter pastry display",
  "site/contact.jpg": "cafe storefront exterior",
};

async function fetchImage(query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape`;
  const res = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
  if (!res.ok) throw new Error(`Pexels ${res.status}: ${await res.text()}`);
  const photos = (await res.json()).photos || [];
  if (!photos.length) throw new Error(`No results for "${query}"`);
  const pick = photos[Math.floor(Math.random() * photos.length)];
  const img = await fetch(pick.src.large2x || pick.src.large || pick.src.original);
  if (!img.ok) throw new Error(`img ${img.status}`);
  return { buf: Buffer.from(await img.arrayBuffer()), credit: pick.photographer };
}

async function uploadR2(key, buf) {
  const res = await r2.fetch(`${ENDPOINT}/${BUCKET}/${key}`, {
    method: "PUT",
    body: buf,
    headers: { "content-type": "image/jpeg" },
  });
  if (!res.ok) throw new Error(`R2 PUT ${res.status}: ${await res.text()}`);
}

if (!PEXELS_API_KEY) throw new Error("PEXELS_API_KEY is not set");
for (const [key, query] of Object.entries(IMAGES)) {
  try {
    const { buf, credit } = await fetchImage(query);
    await uploadR2(key, buf);
    console.log(`✓ ${key.padEnd(22)} [${query}] (${(buf.length / 1024).toFixed(0)} KiB, ${credit})`);
  } catch (e) {
    console.log(`✗ ${key.padEnd(22)} [${query}] FAILED: ${e.message}`);
  }
}
console.log("Done.");
