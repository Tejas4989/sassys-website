#!/usr/bin/env node
/**
 * Snapshots the current WordPress site as static HTML for archival.
 * Run this BEFORE the DNS cutover so you have a reference copy.
 *
 *   node scripts/snapshot-wordpress.mjs
 *
 * Output: ./wordpress-snapshot/YYYY-MM-DD/
 *
 * It crawls known WordPress page URLs and saves them as HTML files.
 * After cutover, optionally upload the snapshot to R2:
 *   aws s3 cp --recursive ./wordpress-snapshot s3://sassys-media/wordpress-archive/ \
 *     --endpoint-url https://<ACCOUNT_ID>.r2.cloudflarestorage.com
 */

import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const SITE = "https://mysassys.com";
const DATE = new Date().toISOString().split("T")[0];
const OUTPUT_DIR = join(process.cwd(), "wordpress-snapshot", DATE);

const PAGES_TO_SNAPSHOT = [
  "/",
  "/our-menu/",
  "/contact/",
  "/?page_id=2",
  "/?page_id=14",
];

async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "SassysArchiveBot/1.0" },
      // Accept expired SSL cert on the old site
    });
    if (!res.ok) {
      console.warn(`  ⚠ ${url} → HTTP ${res.status}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.warn(`  ⚠ ${url} → ${err.message}`);
    return null;
  }
}

function urlToFilename(path) {
  if (path === "/" || path === "") return "index.html";
  return path.replace(/^\//, "").replace(/\/$/, "").replace(/[/?=&]/g, "_") + ".html";
}

async function run() {
  console.log(`\nSassy's WordPress Snapshot — ${DATE}`);
  console.log(`Site: ${SITE}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  await mkdir(OUTPUT_DIR, { recursive: true });

  for (const path of PAGES_TO_SNAPSHOT) {
    const url = `${SITE}${path}`;
    console.log(`Fetching ${url}...`);
    const html = await fetchPage(url);
    if (html) {
      const filename = urlToFilename(path);
      await writeFile(join(OUTPUT_DIR, filename), html, "utf8");
      console.log(`  ✓ Saved as ${filename} (${(html.length / 1024).toFixed(1)} KB)`);
    }
  }

  // Save a manifest
  const manifest = {
    snapshotDate: DATE,
    site: SITE,
    pages: PAGES_TO_SNAPSHOT.map((p) => ({
      path: p,
      file: urlToFilename(p),
      url: `${SITE}${p}`,
    })),
  };
  await writeFile(
    join(OUTPUT_DIR, "_manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8"
  );

  console.log(`\n✅ Snapshot complete → ${OUTPUT_DIR}`);
  console.log("Upload to R2 after cutover:");
  console.log(
    `  pnpm wrangler r2 object put sassys-media/wordpress-archive/${DATE}/ --file ${OUTPUT_DIR}/index.html`
  );
}

run().catch((err) => {
  console.error("Snapshot failed:", err);
  process.exit(1);
});
