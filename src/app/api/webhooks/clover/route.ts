import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyCloverWebhookSignatureAsync } from "@/lib/clover";
import { sendOrderReady } from "@/lib/email";


export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-clover-signature") ?? "";

  const valid = await verifyCloverWebhookSignatureAsync(rawBody, signature);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const eventType = payload?.type as string | undefined;
  const cloverOrderId = payload?.data?.object?.id as string | undefined;

  if (!cloverOrderId) {
    return NextResponse.json({ received: true });
  }

  if (eventType === "payment.created" || eventType === "payment.updated") {
    const paymentState = payload?.data?.object?.paymentState as
      | string
      | undefined;

    if (paymentState === "CLOSED") {
      // Idempotent update — only move forward, never backward
      const [updated] = await db
        .update(orders)
        .set({ status: "confirmed", cloverPaymentId: payload.data.object.id })
        .where(eq(orders.cloverOrderId, cloverOrderId))
        .returning({
          id: orders.id,
          customerEmail: orders.customerEmail,
          customerName: orders.customerName,
        });

      if (updated) {
        // Fire-and-forget — don't let email failure break the webhook response
        sendOrderReady({
          to: updated.customerEmail,
          name: updated.customerName,
          orderId: updated.id,
        }).catch(console.error);
      }
    }
  }

  return NextResponse.json({ received: true });
}
