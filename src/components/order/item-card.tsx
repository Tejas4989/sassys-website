"use client";

import { Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "./cart-context";
import { getPublicUrl } from "@/lib/r2";

interface ItemCardProps {
  itemId: string;
  name: string;
  description?: string | null;
  priceCents: number;
  imageKey?: string | null;
}

export function ItemCard({ itemId, name, description, priceCents, imageKey }: ItemCardProps) {
  const { items, addItem, setQty } = useCart();
  const cartItem = items.find((i) => i.itemId === itemId);
  const qty = cartItem?.qty ?? 0;

  function handleAdd() {
    addItem({ itemId, name, priceCents, imageKey });
  }

  return (
    <div className="flex gap-3 p-4 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow">
      {imageKey && (
        <img
          src={getPublicUrl(imageKey)}
          alt={name}
          className="w-16 h-16 rounded-lg object-cover shrink-0"
          loading="lazy"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm leading-snug">{name}</h3>
          <span className="text-sm font-semibold text-primary shrink-0">
            ${(priceCents / 100).toFixed(2)}
          </span>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
        <div className="mt-2">
          {qty === 0 ? (
            <Button size="sm" variant="outline" onClick={handleAdd} className="h-7 text-xs gap-1">
              <ShoppingCart className="w-3 h-3" /> Add
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0"
                onClick={() => setQty(itemId, qty - 1)}
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="text-sm font-semibold w-5 text-center">{qty}</span>
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0"
                onClick={() => setQty(itemId, qty + 1)}
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
