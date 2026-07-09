"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { createCloverOrder } from "@/lib/clover";
import { sendOrderConfirmation } from "@/lib/email";

async function requireStaff() {
  const session = await auth();
  if (!session || session.user.role === "wholesale_customer") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function approveCateringOrder(orderId: string) {
  const session = await requireStaff();

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order || order.status !== "pending_review") {
    throw new Error("Order not found or not pending review");
  }

  // Push to Clover
  const lineItems = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId));

  const { cloverOrderId } = await createCloverOrder({
    lineItems: [], // order items fetched separately in actual impl
    note: `CATERING — Order ${orderId.slice(0, 8)} — ${order.customerName}`,
    hostedCheckout: order.paymentMethod === "clover_hosted",
    returnUrl: order.paymentMethod === "clover_hosted"
      ? `${process.env.NEXT_PUBLIC_APP_URL}/order/confirmation?orderId=${orderId}`
      : undefined,
  });

  await db
    .update(orders)
    .set({
      status: "confirmed",
      cloverOrderId,
      reviewedBy: session.user.id as string,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));

  // Send confirmation email
  sendOrderConfirmation({
    to: order.customerEmail,
    name: order.customerName,
    orderId,
    items: [],
    totalCents: order.totalCents,
    fulfillment: order.fulfillment,
    pickupAt: order.pickupAt,
  }).catch(console.error);

  revalidatePath("/admin/review-queue");
  redirect("/admin/review-queue");
}

export async function rejectOrder(orderId: string) {
  await requireStaff();
  await db
    .update(orders)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(orders.id, orderId));
  revalidatePath("/admin/review-queue");
  redirect("/admin/review-queue");
}
