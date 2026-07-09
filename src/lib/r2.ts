// Generates presigned URLs for direct browser-to-R2 uploads.
// Uses the S3-compatible API endpoint for Cloudflare R2.

const R2_ENDPOINT = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const BUCKET = process.env.R2_BUCKET_NAME ?? "sassys-media";
const PUBLIC_BASE =
  process.env.R2_PUBLIC_BASE ?? `https://media.mysassys.com`;

export function getPublicUrl(key: string): string {
  return `${PUBLIC_BASE}/${key}`;
}

export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 300
): Promise<string> {
  // Use @aws-sdk/s3-request-presigner with S3Client pointed at R2
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

  const client = new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

export function makeImageKey(folder: string, filename: string): string {
  const ext = filename.split(".").pop() ?? "jpg";
  const id = crypto.randomUUID();
  return `${folder}/${id}.${ext}`;
}
