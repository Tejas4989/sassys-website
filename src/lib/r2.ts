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
  return `${PUBLIC_BASE}/${key}`;
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
