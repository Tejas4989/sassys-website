import { db } from "@/db/client";
import {
  wholesaleCategories,
  wholesaleItems,
  wholesaleCarts,
  wholesaleCartItems,
  orders,
  orderItems,
  wholesaleCustomers,
  users,
} from "@/db/schema";
import { and, desc, eq, asc, sql, inArray } from "drizzle-orm";
import { getPublicUrl } from "@/lib/r2";

// ─── Catalog ──────────────────────────────────────────────────────────────────

export async function getWholesaleCatalog() {
  const cats = await db
    .select()
    .from(wholesaleCategories)
    .where(eq(wholesaleCategories.isActive, true))
    .orderBy(asc(wholesaleCategories.sortOrder))
    .catch(() => []);

  const items = await db
    .select()
    .from(wholesaleItems)
    .where(eq(wholesaleItems.isActive, true))
    .orderBy(asc(wholesaleItems.sortOrder))
    .catch(() => []);

  return cats.map((cat) => ({
    ...cat,
    items: items
      .filter((i) => i.categoryId === cat.id)
      .map((i) => ({ ...i, imageUrl: i.imageKey ? getPublicUrl(i.imageKey) : null })),
  }));
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export async function getWholesaleCart(customerId: string) {
  const cart = await db
    .select()
    .from(wholesaleCarts)
    .where(eq(wholesaleCarts.customerId, customerId))
    .limit(1)
    .then((r) => r[0])
    .catch(() => null);

  if (!cart) return { cartId: null, items: [] };

  const cartItems = await db
    .select({ ci: wholesaleCartItems, item: wholesaleItems })
    .from(wholesaleCartItems)
    .innerJoin(wholesaleItems, eq(wholesaleCartItems.itemId, wholesaleItems.id))
    .where(eq(wholesaleCartItems.cartId, cart.id))
    .catch(() => []);

  return {
    cartId: cart.id,
    items: cartItems.map(({ ci, item }) => ({
      cartItemId: ci.id,
      itemId: item.id,
      qty: ci.qty,
      name: item.name,
      wholesalePriceCents: item.wholesalePriceCents,
      moq: item.moq,
      caseSize: item.caseSize,
      imageUrl: item.imageKey ? getPublicUrl(item.imageKey) : null,
    })),
  };
}

// ─── Order history ────────────────────────────────────────────────────────────

export async function getWholesaleOrderHistory(customerId: string, limit = 20) {
  const customerOrders = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.wholesaleCustomerId, customerId),
        eq(orders.type, "wholesale")
      )
    )
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .catch(() => []);

  if (customerOrders.length === 0) return [];

  const orderIds = customerOrders.map((o) => o.id);
  type ItemRow = typeof orderItems.$inferSelect;
  const allItems: ItemRow[] = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds))
    .catch(() => [] as ItemRow[]);

  const itemsByOrder = allItems.reduce(
    (acc, i) => {
      if (!acc[i.orderId]) acc[i.orderId] = [];
      acc[i.orderId].push(i);
      return acc;
    },
    {} as Record<string, typeof allItems>
  );

  return customerOrders.map((o) => ({
    ...o,
    items: itemsByOrder[o.id] ?? [],
  }));
}

// ─── Top previously ordered items (for quick-add tiles) ──────────────────────

export async function getTopWholesaleItems(customerId: string, limit = 8) {
  // Aggregate item frequency across past orders for this customer
  const history = await getWholesaleOrderHistory(customerId, 20);
  const freq: Record<string, { name: string; qty: number; itemId: string }> = {};

  for (const order of history) {
    for (const item of order.items) {
      if (!freq[item.itemId]) {
        freq[item.itemId] = { name: item.name, qty: 0, itemId: item.itemId };
      }
      freq[item.itemId].qty += item.qty;
    }
  }

  const topItemIds = Object.values(freq)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, limit)
    .map((i) => i.itemId);

  if (topItemIds.length === 0) return [];

  const dbItems = await db
    .select()
    .from(wholesaleItems)
    .where(and(inArray(wholesaleItems.id, topItemIds), eq(wholesaleItems.isActive, true)))
    .catch(() => []);

  // Preserve frequency order
  return topItemIds
    .map((id) => dbItems.find((i) => i.id === id))
    .filter(Boolean)
    .map((i) => ({ ...i!, imageUrl: i!.imageKey ? getPublicUrl(i!.imageKey) : null }));
}

// ─── Last order (for reorder card) ────────────────────────────────────────────

export async function getLastWholesaleOrder(customerId: string) {
  const history = await getWholesaleOrderHistory(customerId, 1);
  return history[0] ?? null;
}

// ─── Customer lookup ──────────────────────────────────────────────────────────

export async function getWholesaleCustomerByUserId(userId: string) {
  const [row] = await db
    .select({ customer: wholesaleCustomers, user: users })
    .from(wholesaleCustomers)
    .innerJoin(users, eq(wholesaleCustomers.userId, users.id))
    .where(eq(wholesaleCustomers.userId, userId))
    .catch(() => []);
  return row ?? null;
}
