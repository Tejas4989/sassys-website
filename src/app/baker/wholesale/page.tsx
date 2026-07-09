import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { orders, orderItems, wholesaleCustomers } from "@/db/schema";
import { eq, and, gte, inArray } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Package, Truck } from "lucide-react";

export const metadata = { title: "Wholesale Queue" };
export const revalidate = 0; // always fresh — baker views nightly

export default async function WholesaleBakerPage() {
  const session = await auth();
  if (!session || (session.user.role !== "baker_wholesale" && session.user.role !== "admin")) {
    redirect("/admin/login");
  }

  // Next-day orders: confirmed orders for tomorrow and beyond
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  type OrderRow = typeof orders.$inferSelect;
  const pendingOrders: OrderRow[] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.type, "wholesale"),
        inArray(orders.status, ["confirmed", "pending"] as const),
        gte(orders.deliveryDate, tomorrowStr)
      )
    )
    .orderBy(orders.deliveryDate)
    .catch(() => [] as OrderRow[]);

  const orderIds = pendingOrders.map((o) => o.id);
  const allItems =
    orderIds.length > 0
      ? await db
          .select()
          .from(orderItems)
          .where(inArray(orderItems.orderId, orderIds))
          .catch(() => [])
      : [];

  const itemsByOrder = allItems.reduce(
    (acc, i) => {
      if (!acc[i.orderId]) acc[i.orderId] = [];
      acc[i.orderId].push(i);
      return acc;
    },
    {} as Record<string, typeof allItems>
  );

  // Group by delivery date
  const byDate = pendingOrders.reduce(
    (acc, o) => {
      const date = o.deliveryDate ?? "TBD";
      if (!acc[date]) acc[date] = [];
      acc[date].push(o);
      return acc;
    },
    {} as Record<string, typeof pendingOrders>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Wholesale Queue</h1>
        <p className="text-sm text-muted-foreground">
          Tomorrow&apos;s and upcoming wholesale orders. Refreshed on page load — check in each evening.
        </p>
      </div>

      {pendingOrders.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <ClipboardCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No upcoming wholesale orders.</p>
          <p className="text-sm mt-1">Check back later or add orders in the portal.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(byDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, dateOrders]) => (
              <section key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="font-heading text-lg font-semibold">
                    {date === "TBD"
                      ? "Date TBD"
                      : new Date(date + "T00:00:00").toLocaleDateString("en-CA", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                  </h2>
                  <Badge variant="secondary">{dateOrders.length} order{dateOrders.length !== 1 ? "s" : ""}</Badge>
                </div>
                <div className="space-y-3">
                  {dateOrders.map((order) => {
                    const oi = itemsByOrder[order.id] ?? [];
                    return (
                      <Card key={order.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div>
                              <p className="font-semibold text-sm">{order.customerName}</p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                {order.fulfillment === "delivery" ? (
                                  <><Truck className="w-3 h-3" /> Delivery</>
                                ) : (
                                  <><Package className="w-3 h-3" /> Pickup</>
                                )}
                              </div>
                            </div>
                            <Badge variant={order.status === "confirmed" ? "default" : "secondary"} className="text-xs">
                              {order.status}
                            </Badge>
                          </div>
                          <ul className="space-y-0.5">
                            {oi.map((i) => (
                              <li key={i.id} className="text-sm text-muted-foreground">
                                {i.qty}× {i.name}
                              </li>
                            ))}
                          </ul>
                          {order.notes && (
                            <p className="text-xs italic text-muted-foreground mt-2 border-l-2 border-border pl-2">
                              {order.notes}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}
