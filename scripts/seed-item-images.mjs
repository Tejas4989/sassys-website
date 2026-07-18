// One-off: populate menu_items.image_key and wholesale_items.image_key with
// curated stock food photos uploaded to Cloudflare R2.
//
// Source: Pexels API when PEXELS_API_KEY is set (clean commercial license),
// otherwise LoremFlickr (no key, Flickr Creative Commons — lower quality and
// technically attribution-required; use only as a fallback).
//
// Usage:
//   node --env-file=.env.local scripts/seed-item-images.mjs [--table menu|wholesale|all] [--limit N] [--dry]
//
// Env: DATABASE_URL, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
//      R2_BUCKET_NAME, R2_PUBLIC_BASE, [PEXELS_API_KEY]

import { neon } from "@neondatabase/serverless";
import { AwsClient } from "aws4fetch";

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? (args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true) : def;
};
const TABLE = opt("table", "all");
const LIMIT = opt("limit") ? parseInt(opt("limit"), 10) : Infinity;
const DRY = !!opt("dry", false);
const ONLY_FIXED = !!opt("only-fixed", false); // reseed only items with an override

const sql = neon(process.env.DATABASE_URL);
const ENDPOINT = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const BUCKET = process.env.R2_BUCKET_NAME;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const r2 = new AwsClient({
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  service: "s3",
  region: "auto",
});

// Category -> search keyword. Keeps stock results relevant even when an item
// name alone is ambiguous (e.g. "Delux", "Mega Meat").
const CATEGORY_KEYWORDS = {
  "Pizza": "pizza",
  "Southern Fried Chicken": "fried chicken",
  "Hamburgers": "cheeseburger",
  "Submarine Sandwiches & Wraps": "submarine sandwich",
  "Panzerottis & Garlic Strips": "calzone",
  "Appetizers, Sides & Salads": "french fries",
  "Beverages": "soft drink",
  "Breakfast": "breakfast sandwich",
  "Breads & Rolls": "artisan bread",
  "Pizza Products": "pizza",
  "Sweet Baked Goods": "cinnamon roll",
};

// Explicit per-item query overrides where the category/keyword heuristic picks
// a poor match. Matched by (lowercased) name substring, checked first.
const ITEM_OVERRIDES = [
  { match: "ice cream", query: "ice cream cone" },
  { match: "extra scoop", query: "ice cream scoop bowl" },
  { match: "loaded nachos", query: "loaded nachos" },
  { match: "butter chicken with rice", query: "butter chicken curry rice" },
  { match: "garlic chicken", query: "pizza" }, // a specialty pizza, not garlic bread
  { match: "pizza dough balls", query: "pizza dough" },
  { match: "taco salad", query: "taco salad" },
];

function overrideFor(itemName) {
  const n = itemName.toLowerCase();
  const o = ITEM_OVERRIDES.find((o) => n.includes(o.match));
  return o ? o.query : null;
}

// A few item names map to a better, more specific query than their category.
function queryFor(itemName, category) {
  const override = overrideFor(itemName);
  if (override) return override;
  const n = itemName.toLowerCase();
  if (n.includes("fries")) return "french fries";
  if (n.includes("salad")) return "garden salad";
  if (n.includes("wrap")) return "chicken wrap";
  if (n.includes("wing")) return "chicken wings";
  if (n.includes("garlic")) return "garlic bread";
  if (n.includes("coffee")) return "coffee cup";
  if (n.includes("water")) return "bottled water";
  if (n.includes("pop") || n.includes("cola") || n.includes("soda")) return "soft drink can";
  if (n.includes("muffin")) return "muffins";
  if (n.includes("cinnamon")) return "cinnamon roll";
  if (n.includes("dinner roll") || n.includes("bun")) return "dinner rolls";
  return CATEGORY_KEYWORDS[category] || "food";
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

async function fetchImage(query) {
  if (PEXELS_API_KEY) {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`;
    const res = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
    if (!res.ok) throw new Error(`Pexels ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const photos = data.photos || [];
    if (!photos.length) throw new Error(`No Pexels results for "${query}"`);
    const pick = photos[Math.floor(Math.random() * photos.length)];
    const imgRes = await fetch(pick.src.large || pick.src.original);
    if (!imgRes.ok) throw new Error(`Pexels img ${imgRes.status}`);
    return { buf: Buffer.from(await imgRes.arrayBuffer()), contentType: "image/jpeg", credit: pick.photographer };
  }
  // Fallback: LoremFlickr (no key). Random Flickr CC image for the keyword.
  const kw = query.replace(/\s+/g, ",");
  const res = await fetch(`https://loremflickr.com/800/600/${encodeURIComponent(kw)}?lock=${Math.floor(Math.random() * 1e6)}`);
  if (!res.ok) throw new Error(`LoremFlickr ${res.status}`);
  return { buf: Buffer.from(await res.arrayBuffer()), contentType: "image/jpeg", credit: "flickr-cc" };
}

async function uploadR2(key, buf, contentType) {
  const res = await r2.fetch(`${ENDPOINT}/${BUCKET}/${key}`, {
    method: "PUT",
    body: buf,
    headers: { "content-type": contentType },
  });
  if (!res.ok) throw new Error(`R2 PUT ${res.status}: ${await res.text()}`);
}

async function processTable(table) {
  const folder = table === "menu" ? "menu" : "catalog";
  const rows = table === "menu"
    ? await sql`SELECT i.id, i.name, c.name AS category FROM menu_items i JOIN menu_categories c ON c.id=i.category_id ORDER BY i.sort_order`
    : await sql`SELECT i.id, i.name, c.name AS category FROM wholesale_items i JOIN wholesale_categories c ON c.id=i.category_id ORDER BY i.sort_order`;

  let done = 0;
  for (const row of rows) {
    if (done >= LIMIT) break;
    if (ONLY_FIXED && !overrideFor(row.name)) continue;
    const query = queryFor(row.name, row.category);
    const key = `${folder}/${slug(row.name)}-${row.id.slice(0, 8)}.jpg`;
    try {
      const { buf, credit } = await fetchImage(query);
      if (!DRY) {
        await uploadR2(key, buf, "image/jpeg");
        if (table === "menu") {
          await sql`UPDATE menu_items SET image_key=${key}, updated_at=now() WHERE id=${row.id}`;
        } else {
          await sql`UPDATE wholesale_items SET image_key=${key}, updated_at=now() WHERE id=${row.id}`;
        }
      }
      console.log(`✓ ${row.name.padEnd(32)} [${query}] -> ${key} (${(buf.length / 1024).toFixed(0)} KiB, ${credit})`);
      done++;
    } catch (e) {
      console.log(`✗ ${row.name.padEnd(32)} [${query}] FAILED: ${e.message}`);
    }
  }
  return done;
}

const src = PEXELS_API_KEY ? "Pexels" : "LoremFlickr (fallback, CC)";
console.log(`Source: ${src} | table=${TABLE} | limit=${LIMIT === Infinity ? "all" : LIMIT} | dry=${DRY}\n`);
let total = 0;
if (TABLE === "menu" || TABLE === "all") total += await processTable("menu");
if (TABLE === "wholesale" || TABLE === "all") total += await processTable("wholesale");
console.log(`\nDone. ${total} item(s) processed.`);
