import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/db/client";
import { orders, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PushSubscribe } from "@/components/push/push-subscribe";

export const metadata: Metadata = { title: "Order Confirmed" };

interface Props {
  searchParams: Promise<{ orderId?: string; catering?: string }>;
}

export default async function ConfirmationPage({ searchParams }: Props) {
  const { orderId, catering } = await searchParams;
  const isCatering = catering === "1";

  let order: typeof orders.$inferSelect | undefined;
  let lineItems: typeof orderItems.$inferSelect[] = [];

  if (orderId) {
    try {
      const [found] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);
      order = found;
      if (found) {
        lineItems = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, orderId));
      }
    } catch {}
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
        <CheckCircle2 className="w-8 h-8 text-green-600" />
      </div>

      {isCatering ? (
        <>
          <h1 className="font-heading text-3xl font-bold mb-3">
            Catering Request Received!
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Your catering order is under review. One of our staff will reach
            out to confirm details. If we have no questions, your order will
            be confirmed automatically.
          </p>
        </>
      ) : (
        <>
          <h1 className="font-heading text-3xl font-bold mb-3">
            Order Confirmed!
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We&apos;ve received your order. You&apos;ll get a confirmation
            email shortly.
          </p>
          {order && (
            <div className="mb-6">
              <PushSubscribe email={order.customerEmail} />
            </div>
          )}
        </>
      )}

      {order && (
        <div className="text-left border border-border rounded-xl p-5 mb-8 space-y-3">
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
          {order.pickupAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
              <Clock className="w-4 h-4" />
              Pickup:{" "}
              {order.pickupAt.toLocaleString("en-CA", {
                timeZone: "America/Toronto",
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        <Button asChild className="w-full">
          <Link href="/order">Order Again</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <a href="tel:+15194611234">
            <Phone className="mr-2 w-4 h-4" /> Call (519) 461-1234
          </a>
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-6">
        225 King St, Thorndale, ON · inquiry@mysassys.com
      </p>
    </div>
  );
}
