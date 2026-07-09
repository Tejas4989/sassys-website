"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { RefreshCw, Loader2, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadOrderIntoCart } from "@/lib/actions/wholesale-cart";

interface OrderItem {
  id: string;
  name: string;
  qty: number;
  priceCents: number;
}

interface Order {
  id: string;
  fulfillment: string;
  deliveryDate?: string | null;
  createdAt: Date;
  totalCents: number;
  items: OrderItem[];
}

export function ReorderCard({ order }: { order: Order }) {
  const [pending, startTransition] = useTransition();

  function handleReorder() {
    startTransition(async () => {
      try {
        await loadOrderIntoCart(order.id);
        toast.success("Last order loaded into your cart!");
      } catch {
        toast.error("Couldn't load that order. Please try again.");
      }
    });
  }

  const preview = order.items.slice(0, 3);
  const more = order.items.length - 3;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
          <RefreshCw className="w-4 h-4" />
          Repeat Last Order
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {order.createdAt instanceof Date
            ? order.createdAt.toLocaleDateString("en-CA", { dateStyle: "medium" })
            : new Date(order.createdAt).toLocaleDateString("en-CA", { dateStyle: "medium" })}
          {" · "}
          {order.fulfillment === "delivery" ? (
            <span className="inline-flex items-center gap-1"><Truck className="w-3 h-3" /> Delivery</span>
          ) : (
            <span className="inline-flex items-center gap-1"><Package className="w-3 h-3" /> Pickup</span>
          )}
        </p>
      </CardHeader>
      <CardContent>
        <ul className="text-sm text-muted-foreground space-y-0.5 mb-4">
          {preview.map((i) => (
            <li key={i.id}>{i.qty}× {i.name}</li>
          ))}
          {more > 0 && <li className="text-xs">+{more} more item{more !== 1 ? "s" : ""}</li>}
        </ul>
        <Button
          onClick={handleReorder}
          disabled={pending}
          className="w-full"
          size="sm"
        >
          {pending ? (
            <Loader2 className="mr-2 w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 w-4 h-4" />
          )}
          Load This Order into Cart
        </Button>
      </CardContent>
    </Card>
  );
}
