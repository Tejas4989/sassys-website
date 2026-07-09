import { CheckCircle2, History, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { db } from "@/db/client";
import { orders, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";

interface Props {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function WholesaleConfirmationPage({ searchParams }: Props) {
  const { orderId } = await searchParams;

  let order: typeof orders.$inferSelect | undefined;
  let lineItems: typeof orderItems.$inferSelect[] = [];

  if (orderId) {
    try {
      const [found] = await db.select().from(orders).where(eq(orders.id, orderId));
      order = found;
      if (found) {
        lineItems = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
      }
    } catch {}
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
        <CheckCircle2 className="w-8 h-8 text-green-600" />
      </div>

      <h1 className="font-heading text-3xl font-bold mb-3">Order Submitted!</h1>
      <p className="text-muted-foreground leading-relaxed mb-6">
        Your wholesale order has been received. You&apos;ll get a confirmation email shortly.
        Your account will be invoiced net-30.
      </p>

      {order && (
        <div className="text-left border border-border rounded-xl p-5 mb-8 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </p>
          {lineItems.map((li) => (
            <div key={li.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{li.qty}× {li.name}</span>
              <span>${((li.priceCents * li.qty) / 100).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-border pt-2 flex justify-between font-semibold text-sm">
            <span>Total</span>
            <span>${(order.totalCents / 100).toFixed(2)}</span>
          </div>
          {order.deliveryDate && (
            <p className="text-xs text-muted-foreground">
              {order.fulfillment === "delivery" ? "Delivery" : "Pickup"}: {order.deliveryDate}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Button asChild className="w-full">
          <Link href="/wholesale"><ShoppingBag className="mr-2 w-4 h-4" /> Place Another Order</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/wholesale/history"><History className="mr-2 w-4 h-4" /> View Order History</Link>
        </Button>
      </div>
    </div>
  );
}
