import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generatePresignedUploadUrl, makeImageKey } from "@/lib/r2";
import { z } from "zod";

// Only edge-compatible if using native fetch in r2.ts.
// r2.ts uses @aws-sdk which needs Node runtime for signing.
export const runtime = "nodejs";

const schema = z.object({
  folder: z.enum(["menu", "gallery", "catalog", "specials"]),
  filename: z.string().min(1).max(255),
  contentType: z.string().regex(/^image\//),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role === "wholesale_customer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { folder, filename, contentType } = parsed.data;
  const key = makeImageKey(folder, filename);
  const url = await generatePresignedUploadUrl(key, contentType);

  return NextResponse.json({ url, key });
}
