import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { orders, pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { sendOrderReady } from "@/lib/email";
import { sendPushNotification } from "@/lib/push";

export const runtime = "edge";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth();
  if (
    !session ||
    (session.user.role !== "baker_retail" && session.user.role !== "admin")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await params;

  const [updated] = await db
    .update(orders)
    .set({ status: "ready" })
    .where(eq(orders.id, orderId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Email notification (fire-and-forget)
  sendOrderReady({
    to: updated.customerEmail,
    name: updated.customerName,
    orderId: updated.id,
  }).catch(console.error);

  // Web push (fire-and-forget, delete expired subscriptions)
  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.customerEmail, updated.customerEmail));

  for (const sub of subs) {
    const ok = await sendPushNotification(sub, {
      title: "Your order is ready! 🎉",
      body: `${updated.customerName}, your Sassy's order is ready for pickup.`,
      url: `/order/confirmation?orderId=${updated.id}`,
    });
    if (!ok) {
      // Subscription expired — remove it
      db.delete(pushSubscriptions)
        .where(eq(pushSubscriptions.id, sub.id))
        .catch(console.error);
    }
  }

  return NextResponse.json({ ok: true, status: "ready" });
}
