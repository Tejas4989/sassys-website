"use client";

import { useState } from "react";
import { ShoppingCart, X, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "./cart-context";
import { CheckoutForm } from "./checkout-form";
import { Badge } from "@/components/ui/badge";

export function CartDrawer() {
  const { items, removeItem, setQty, totalCents, totalItems } = useCart();
  const [view, setView] = useState<"cart" | "checkout">("cart");
  const [open, setOpen] = useState(false);

  function handleOpenChange(o: boolean) {
    setOpen(o);
    if (!o) setView("cart"); // reset to cart view on close
  }

  return (
    <>
      {/* Trigger button — external to Sheet since SheetTrigger doesn't support asChild in base-ui */}
      <Button
        variant="outline"
        className="relative gap-2"
        onClick={() => setOpen(true)}
      >
        <ShoppingCart className="w-4 h-4" />
        <span className="hidden sm:inline">Cart</span>
        {totalItems > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 min-w-5 text-xs px-1 flex items-center justify-center">
            {totalItems}
          </Badge>
        )}
      </Button>
    <Sheet open={open} onOpenChange={handleOpenChange}>

      <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 p-0">
        <SheetHeader className="px-5 py-4 border-b border-border">
          <SheetTitle className="font-heading flex items-center gap-2">
            {view === "cart" ? (
              <>
                <ShoppingCart className="w-5 h-5" /> Your Cart
                {totalItems > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({totalItems} {totalItems === 1 ? "item" : "items"})
                  </span>
                )}
              </>
            ) : (
              "Checkout"
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {view === "cart" ? (
            items.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Your cart is empty</p>
                <p className="text-sm mt-1">Add items from the menu.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.itemId} className="flex gap-3 items-start p-3 rounded-xl border border-border">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ${(item.priceCents / 100).toFixed(2)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => setQty(item.itemId, item.qty - 1)}
                        aria-label="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-semibold w-5 text-center">{item.qty}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => setQty(item.itemId, item.qty + 1)}
                        aria-label="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.itemId)}
                        aria-label="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-sm font-semibold shrink-0 w-14 text-right">
                      ${((item.priceCents * item.qty) / 100).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )
          ) : (
            <CheckoutForm onCancel={() => setView("cart")} />
          )}
        </div>

        {view === "cart" && items.length > 0 && (
          <div className="px-5 py-4 border-t border-border space-y-3">
            <div className="flex justify-between font-semibold">
              <span>Subtotal</span>
              <span>${(totalCents / 100).toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">+13% HST added at checkout</p>
            <Button className="w-full" onClick={() => setView("checkout")}>
              Proceed to Checkout
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
    </>
  );
}
