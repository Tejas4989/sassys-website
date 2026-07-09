import { db } from "@/db/client";
import { orders, orderItems } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { approveCateringOrder, rejectOrder } from "@/lib/actions/orders";
import { Clock, Mail, Phone, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ReviewOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) notFound();

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/review-queue">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Link>
        </Button>
        <h1 className="font-heading text-2xl font-bold">Review Order</h1>
        <Badge variant="destructive">Pending Review</Badge>
      </div>

      <Card className="mb-6">
        <CardContent className="p-5 space-y-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Customer</p>
            <p className="font-semibold">{order.customerName}</p>
            <div className="flex flex-wrap gap-3 mt-1">
              <a href={`mailto:${order.customerEmail}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
                <Mail className="w-4 h-4" /> {order.customerEmail}
              </a>
              {order.customerPhone && (
                <a href={`tel:${order.customerPhone}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
                  <Phone className="w-4 h-4" /> {order.customerPhone}
                </a>
              )}
            </div>
          </div>

          {order.pickupAt && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Pickup</p>
              <p className="flex items-center gap-1.5 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                {order.pickupAt.toLocaleString("en-CA", {
                  timeZone: "America/Toronto",
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Items</p>
            <ul className="space-y-1">
              {items.map((i) => (
                <li key={i.id} className="flex justify-between text-sm">
                  <span>{i.qty}× {i.name}</span>
                  <span className="text-muted-foreground">${((i.priceCents * i.qty) / 100).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-border mt-2 pt-2 flex justify-between font-semibold text-sm">
              <span>Total (incl. HST)</span>
              <span>${(order.totalCents / 100).toFixed(2)}</span>
            </div>
          </div>

          {order.notes && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm italic text-muted-foreground border-l-2 border-amber-300 pl-3">{order.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <form action={approveCateringOrder.bind(null, orderId)} className="flex-1">
          <Button type="submit" className="w-full">Approve & Send to Clover</Button>
        </form>
        <form action={rejectOrder.bind(null, orderId)}>
          <Button type="submit" variant="destructive">Cancel Order</Button>
        </form>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Approving will push the order to the Clover POS and send a confirmation email to the customer.
      </p>
    </div>
  );
}
