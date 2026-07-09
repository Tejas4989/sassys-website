import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { orders, orderItems } from "@/db/schema";
import { eq, and, gte, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (
    !session ||
    (session.user.role !== "baker_retail" && session.user.role !== "admin")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Return orders from the last 24 hours that are pending or confirmed
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const pendingOrders = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.type, "retail"),
        inArray(orders.status, ["pending", "confirmed"]),
        gte(orders.createdAt, since)
      )
    )
    .orderBy(orders.pickupAt);

  const orderIds = pendingOrders.map((o) => o.id);
  const items =
    orderIds.length > 0
      ? await db
          .select()
          .from(orderItems)
          .where(inArray(orderItems.orderId, orderIds))
      : [];

  const itemsByOrder = items.reduce(
    (acc, item) => {
      if (!acc[item.orderId]) acc[item.orderId] = [];
      acc[item.orderId].push(item);
      return acc;
    },
    {} as Record<string, typeof items>
  );

  return NextResponse.json({
    orders: pendingOrders.map((o) => ({
      ...o,
      items: itemsByOrder[o.id] ?? [],
    })),
    fetchedAt: new Date().toISOString(),
  });
}
