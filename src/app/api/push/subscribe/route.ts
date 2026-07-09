import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const runtime = "edge";

const subscribeSchema = z.object({
  email: z.string().email(),
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { email, endpoint, p256dh, auth } = parsed.data;

  await db
    .insert(pushSubscriptions)
    .values({ customerEmail: email, endpoint, p256dh, auth })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { p256dh, auth, customerEmail: email },
    });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get("endpoint");
  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  }
  await db
    .delete(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, endpoint));
  return NextResponse.json({ ok: true });
}
