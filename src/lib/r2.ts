// Presigned URLs and direct uploads for Cloudflare R2 via its S3-compatible API.
// Uses aws4fetch (a few KiB) instead of the AWS SDK to keep the Worker bundle
// under Cloudflare's size limit.

import { AwsClient } from "aws4fetch";

const R2_ENDPOINT = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const BUCKET = process.env.R2_BUCKET_NAME ?? "sassys-media";
// getPublicUrl runs in client components too (item cards, cart), so the public
// base must be readable in the browser — use the NEXT_PUBLIC_ var there, and
// fall back to the server-only var for server-side callers.
const PUBLIC_BASE =
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE ??
  process.env.R2_PUBLIC_BASE ??
  `https://media.mysassys.com`;

function r2Client(): AwsClient {
  return new AwsClient({
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    service: "s3",
    region: "auto",
  });
}

export function getPublicUrl(key: string): string {
  // Encode each path segment so keys with spaces or parens (e.g. user-uploaded
  // gallery filenames) resolve correctly. Slug-safe keys are unaffected.
  const encoded = key.split("/").map(encodeURIComponent).join("/");
  return `${PUBLIC_BASE}/${encoded}`;
}

export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 300
): Promise<string> {
  // Sign a query-based (presigned) PUT. Only `host` is signed, so the client's
  // Content-Type is sent as an unsigned header — R2 accepts and stores it.
  const url = new URL(`${R2_ENDPOINT}/${BUCKET}/${key}`);
  url.searchParams.set("X-Amz-Expires", String(expiresInSeconds));
  const signed = await r2Client().sign(url.toString(), {
    method: "PUT",
    aws: { signQuery: true },
  });
  return signed.url;
}

export async function uploadToR2(
  key: string,
  body: BodyInit,
  contentType: string,
  metadata?: Record<string, string>
): Promise<void> {
  const headers: Record<string, string> = { "content-type": contentType };
  for (const [k, v] of Object.entries(metadata ?? {})) {
    headers[`x-amz-meta-${k}`] = v;
  }
  const res = await r2Client().fetch(`${R2_ENDPOINT}/${BUCKET}/${key}`, {
    method: "PUT",
    body,
    headers,
  });
  if (!res.ok) {
    throw new Error(`R2 upload failed: ${res.status} ${await res.text()}`);
  }
}

export function makeImageKey(folder: string, filename: string): string {
  const ext = filename.split(".").pop() ?? "jpg";
  const id = crypto.randomUUID();
  return `${folder}/${id}.${ext}`;
}

export type R2Object = { key: string; lastModified: string; size: number };

/**
 * List objects under a prefix via the S3-compatible ListObjectsV2 API.
 * Returns up to 1000 objects (plenty for a photo gallery). Powers the public
 * gallery so images dropped into a folder appear without any code/DB changes.
 */
export async function listObjects(prefix: string): Promise<R2Object[]> {
  const url = new URL(`${R2_ENDPOINT}/${BUCKET}`);
  url.searchParams.set("list-type", "2");
  url.searchParams.set("prefix", prefix);
  url.searchParams.set("max-keys", "1000");

  const res = await r2Client().fetch(url.toString(), { method: "GET" });
  if (!res.ok) {
    throw new Error(`R2 list failed: ${res.status} ${await res.text()}`);
  }

  const xml = await res.text();
  const objects: R2Object[] = [];
  const re = /<Contents>([\s\S]*?)<\/Contents>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const block = m[1];
    const key = block.match(/<Key>([^<]+)<\/Key>/)?.[1];
    if (!key || key.endsWith("/")) continue; // skip folder placeholder objects
    objects.push({
      key,
      lastModified: block.match(/<LastModified>([^<]+)<\/LastModified>/)?.[1] ?? "",
      size: Number(block.match(/<Size>(\d+)<\/Size>/)?.[1] ?? "0"),
    });
  }
  return objects;
}
