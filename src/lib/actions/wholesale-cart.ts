"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { wholesaleCarts, wholesaleCartItems, wholesaleItems } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

async function getCustomerIdFromSession() {
  const session = await auth();
  if (!session || session.user.role !== "wholesale_customer") {
    throw new Error("Unauthorized");
  }
  const customerId = (session as any).wholesaleCustomerId as string;
  if (!customerId) throw new Error("No wholesale customer ID in session");
  return customerId;
}

async function getOrCreateCart(customerId: string) {
  const existing = await db
    .select()
    .from(wholesaleCarts)
    .where(eq(wholesaleCarts.customerId, customerId))
    .limit(1);

  if (existing[0]) return existing[0].id;

  const [created] = await db
    .insert(wholesaleCarts)
    .values({ customerId })
    .returning();
  return created.id;
}

export async function addToCart(itemId: string, qty: number) {
  const customerId = await getCustomerIdFromSession();

  // Validate item exists and is active
  const [item] = await db
    .select()
    .from(wholesaleItems)
    .where(and(eq(wholesaleItems.id, itemId), eq(wholesaleItems.isActive, true)));
  if (!item) throw new Error("Item not found");

  // Enforce MOQ
  const effectiveQty = Math.max(qty, item.moq);

  const cartId = await getOrCreateCart(customerId);

  const [existing] = await db
    .select()
    .from(wholesaleCartItems)
    .where(and(eq(wholesaleCartItems.cartId, cartId), eq(wholesaleCartItems.itemId, itemId)));

  if (existing) {
    await db
      .update(wholesaleCartItems)
      .set({ qty: existing.qty + effectiveQty })
      .where(eq(wholesaleCartItems.id, existing.id));
  } else {
    await db.insert(wholesaleCartItems).values({ cartId, itemId, qty: effectiveQty });
  }

  // Update cart updatedAt
  await db.update(wholesaleCarts).set({ updatedAt: new Date() }).where(eq(wholesaleCarts.id, cartId));
  revalidatePath("/wholesale");
}

export async function setCartItemQty(cartItemId: string, qty: number) {
  const customerId = await getCustomerIdFromSession();

  if (qty <= 0) {
    await db.delete(wholesaleCartItems).where(eq(wholesaleCartItems.id, cartItemId));
  } else {
    await db.update(wholesaleCartItems).set({ qty }).where(eq(wholesaleCartItems.id, cartItemId));
  }
  revalidatePath("/wholesale");
}

export async function removeFromCart(cartItemId: string) {
  const customerId = await getCustomerIdFromSession();
  await db.delete(wholesaleCartItems).where(eq(wholesaleCartItems.id, cartItemId));
  revalidatePath("/wholesale");
}

export async function clearCart() {
  const customerId = await getCustomerIdFromSession();

  const [cart] = await db
    .select()
    .from(wholesaleCarts)
    .where(eq(wholesaleCarts.customerId, customerId));

  if (cart) {
    await db.delete(wholesaleCartItems).where(eq(wholesaleCartItems.cartId, cart.id));
    await db.update(wholesaleCarts).set({ updatedAt: new Date() }).where(eq(wholesaleCarts.id, cart.id));
  }
  revalidatePath("/wholesale");
}

export async function loadOrderIntoCart(orderId: string) {
  const customerId = await getCustomerIdFromSession();

  // Get order items from past order
  const { orderItems: oi, orders: o } = await import("@/db/schema");
  const { eq: deq, and: dand, inArray } = await import("drizzle-orm");

  const [order] = await db
    .select()
    .from(o)
    .where(dand(deq(o.id, orderId), deq(o.wholesaleCustomerId, customerId)));

  if (!order) throw new Error("Order not found");

  const items = await db.select().from(oi).where(deq(oi.orderId, orderId));

  // Clear existing cart first
  const cartId = await getOrCreateCart(customerId);
  await db.delete(wholesaleCartItems).where(deq(wholesaleCartItems.cartId, cartId));

  // Load items into cart (match by itemId)
  for (const item of items) {
    const [catalogItem] = await db
      .select()
      .from(wholesaleItems)
      .where(dand(deq(wholesaleItems.id, item.itemId), deq(wholesaleItems.isActive, true)));

    if (catalogItem) {
      await db.insert(wholesaleCartItems).values({
        cartId,
        itemId: catalogItem.id,
        qty: item.qty,
      });
    }
  }

  await db.update(wholesaleCarts).set({ updatedAt: new Date() }).where(deq(wholesaleCarts.id, cartId));
  revalidatePath("/wholesale");
}
