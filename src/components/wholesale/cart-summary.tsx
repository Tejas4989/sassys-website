"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, ShoppingBag, Trash2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { setCartItemQty, removeFromCart, clearCart } from "@/lib/actions/wholesale-cart";

interface CartItem {
  cartItemId: string;
  itemId: string;
  name: string;
  qty: number;
  wholesalePriceCents: number;
  moq: number;
}

interface Props {
  items: CartItem[];
  totalCents: number;
}

export function WholesaleCartSummary({ items, totalCents }: Props) {
  const [pending, startTransition] = useTransition();

  function adjustQty(cartItemId: string, moq: number, delta: number, currentQty: number) {
    const newQty = Math.max(0, currentQty + delta);
    // Never go below MOQ if non-zero
    const effectiveQty = newQty > 0 ? Math.max(newQty, moq) : 0;
    startTransition(async () => {
      await setCartItemQty(cartItemId, effectiveQty);
    });
  }

  function handleRemove(cartItemId: string) {
    startTransition(async () => {
      await removeFromCart(cartItemId);
    });
  }

  function handleClear() {
    startTransition(async () => {
      await clearCart();
      toast.success("Cart cleared.");
    });
  }

  if (items.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
          <ShoppingBag className="w-8 h-8 opacity-30" />
          <p className="text-sm font-medium">Your cart is empty</p>
          <p className="text-xs">Add items from the catalog below.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <ShoppingBag className="w-4 h-4" />
          Current Cart ({items.length} line{items.length !== 1 ? "s" : ""})
        </CardTitle>
        <button
          onClick={handleClear}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          disabled={pending}
        >
          Clear all
        </button>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <div key={item.cartItemId} className="flex items-center gap-2 text-sm">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                ${(item.wholesalePriceCents / 100).toFixed(2)} ea · MOQ {item.moq}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => adjustQty(item.cartItemId, item.moq, -item.moq, item.qty)}
                disabled={pending}
                aria-label="Decrease"
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-8 text-center font-semibold">{item.qty}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => adjustQty(item.cartItemId, item.moq, item.moq, item.qty)}
                disabled={pending}
                aria-label="Increase"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-sm font-semibold w-16 text-right shrink-0">
              ${((item.wholesalePriceCents * item.qty) / 100).toFixed(2)}
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0"
              onClick={() => handleRemove(item.cartItemId)}
              disabled={pending}
              aria-label="Remove"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}

        <div className="border-t border-border pt-3 flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">Total</p>
            <p className="text-xs text-muted-foreground">Invoiced net-30</p>
          </div>
          <p className="text-lg font-bold">${(totalCents / 100).toFixed(2)}</p>
        </div>

        <Button asChild className="w-full mt-1">
          <Link href="/wholesale/checkout">Proceed to Submit Order</Link>
        </Button>

        {pending && (
          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" /> Updating cart…
          </p>
        )}
      </CardContent>
    </Card>
  );
}
