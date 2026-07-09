import { db } from "@/db/client";
import { orders, orderItems } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardCheck, Phone, Mail, Clock } from "lucide-react";
import Link from "next/link";

export default async function ReviewQueuePage() {
  const pending = await db
    .select()
    .from(orders)
    .where(eq(orders.status, "pending_review"));

  const orderIds = pending.map((o) => o.id);
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

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-heading text-3xl font-bold">Review Queue</h1>
        {pending.length > 0 && (
          <Badge variant="destructive">{pending.length} pending</Badge>
        )}
      </div>
      <p className="text-muted-foreground text-sm mb-8">
        Large or flagged orders that need employee review before going to Clover.
      </p>

      {pending.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl text-muted-foreground">
          <ClipboardCheck className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">All clear!</p>
          <p className="text-sm mt-1">No orders pending review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((order) => {
            const oi = itemsByOrder[order.id] ?? [];
            return (
              <Card key={order.id} className="border-destructive/30">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="font-semibold">{order.customerName}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <a href={`mailto:${order.customerEmail}`} className="flex items-center gap-1 hover:text-primary">
                          <Mail className="w-3.5 h-3.5" /> {order.customerEmail}
                        </a>
                        {order.customerPhone && (
                          <a href={`tel:${order.customerPhone}`} className="flex items-center gap-1 hover:text-primary">
                            <Phone className="w-3.5 h-3.5" /> {order.customerPhone}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        ${(order.totalCents / 100).toFixed(2)}
                      </p>
                      {order.pickupAt && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-0.5">
                          <Clock className="w-3 h-3" />
                          {order.pickupAt.toLocaleString("en-CA", { timeZone: "America/Toronto" })}
                        </p>
                      )}
                    </div>
                  </div>

                  <ul className="text-sm space-y-1 mb-4">
                    {oi.map((i) => (
                      <li key={i.id} className="flex justify-between text-muted-foreground">
                        <span>{i.qty}× {i.name}</span>
                        <span>${(i.priceCents * i.qty / 100).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>

                  {order.notes && (
                    <p className="text-sm italic text-muted-foreground mb-4 border-l-2 border-border pl-3">
                      {order.notes}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button asChild size="sm">
                      <Link href={`/admin/review-queue/${order.id}`}>
                        Review & Approve
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <a href={`tel:${order.customerPhone ?? ""}`}>
                        <Phone className="w-3.5 h-3.5 mr-1" /> Call Customer
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
