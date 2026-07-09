"use server";

import { redirect } from "next/navigation";
import { db } from "@/db/client";
import {
  orders,
  orderItems,
  wholesaleCarts,
  wholesaleCartItems,
  wholesaleItems,
  wholesaleCustomers,
  users,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { sendWholesaleOrderConfirmation, sendAdminCateringAlert } from "@/lib/email";

const orderSchema = z.object({
  fulfillment: z.enum(["pickup", "delivery"]),
  deliveryDate: z.string().optional(),
  pickupAt: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});

async function getCustomerFromSession() {
  const session = await auth();
  if (!session || session.user.role !== "wholesale_customer") {
    throw new Error("Unauthorized");
  }
  const customerId = (session as any).wholesaleCustomerId as string;
  const [row] = await db
    .select({ customer: wholesaleCustomers, user: users })
    .from(wholesaleCustomers)
    .innerJoin(users, eq(wholesaleCustomers.userId, users.id))
    .where(eq(wholesaleCustomers.id, customerId));
  if (!row) throw new Error("Customer not found");
  return { ...row, customerId };
}

export async function submitWholesaleOrder(fd: FormData) {
  const { customer, user, customerId } = await getCustomerFromSession();

  const parsed = orderSchema.parse({
    fulfillment: fd.get("fulfillment"),
    deliveryDate: (fd.get("deliveryDate") as string) || undefined,
    pickupAt: (fd.get("pickupAt") as string) || undefined,
    notes: (fd.get("notes") as string) || undefined,
  });

  // Fetch current cart
  const [cart] = await db
    .select()
    .from(wholesaleCarts)
    .where(eq(wholesaleCarts.customerId, customerId));

  if (!cart) throw new Error("Cart is empty");

  const cartItems = await db
    .select({ ci: wholesaleCartItems, item: wholesaleItems })
    .from(wholesaleCartItems)
    .innerJoin(wholesaleItems, eq(wholesaleCartItems.itemId, wholesaleItems.id))
    .where(eq(wholesaleCartItems.cartId, cart.id));

  if (cartItems.length === 0) throw new Error("Cart is empty");

  const subtotalCents = cartItems.reduce(
    (sum, { ci, item }) => sum + item.wholesalePriceCents * ci.qty,
    0
  );

  // Create order (net-30, no payment step)
  const [order] = await db
    .insert(orders)
    .values({
      type: "wholesale",
      status: "confirmed",
      fulfillment: parsed.fulfillment,
      paymentMethod: "net30",
      customerEmail: user.email,
      customerName: user.name,
      wholesaleCustomerId: customerId,
      deliveryDate: parsed.deliveryDate,
      pickupAt: parsed.pickupAt ? new Date(parsed.pickupAt) : null,
      subtotalCents,
      taxCents: 0, // wholesale is pre-tax
      totalCents: subtotalCents,
      notes: parsed.notes,
    })
    .returning();

  // Insert order items (denormalized)
  await db.insert(orderItems).values(
    cartItems.map(({ ci, item }) => ({
      orderId: order.id,
      itemId: item.id,
      name: item.name,
      priceCents: item.wholesalePriceCents,
      qty: ci.qty,
    }))
  );

  // Update customer's default fulfillment for next reorder
  await db
    .update(wholesaleCustomers)
    .set({ defaultFulfillment: parsed.fulfillment, updatedAt: new Date() })
    .where(eq(wholesaleCustomers.id, customerId));

  // Clear cart
  await db.delete(wholesaleCartItems).where(eq(wholesaleCartItems.cartId, cart.id));
  await db.update(wholesaleCarts).set({ updatedAt: new Date() }).where(eq(wholesaleCarts.id, cart.id));

  // Email confirmations (fire-and-forget)
  sendWholesaleOrderConfirmation({
    to: user.email,
    name: user.name,
    businessName: customer.businessName,
    orderId: order.id,
    items: cartItems.map(({ ci, item }) => ({ name: item.name, qty: ci.qty })),
    fulfillment: parsed.fulfillment,
    deliveryDate: parsed.deliveryDate,
    pickupAt: parsed.pickupAt ? new Date(parsed.pickupAt) : undefined,
    notes: parsed.notes,
  }).catch(console.error);

  redirect(`/wholesale/confirmation?orderId=${order.id}`);
}
