"use client";

import { useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addToCart } from "@/lib/actions/wholesale-cart";

interface Item {
  id: string;
  name: string;
  wholesalePriceCents: number;
  moq: number;
  imageUrl: string | null;
}

interface CartItem {
  itemId: string;
  qty: number;
}

interface Props {
  items: Item[];
  cartItems: CartItem[];
}

export function QuickAddTiles({ items, cartItems }: Props) {
  const [pending, startTransition] = useTransition();

  function handleAdd(item: Item) {
    startTransition(async () => {
      try {
        await addToCart(item.id, item.moq);
        toast.success(`${item.moq}× ${item.name} added to cart.`);
      } catch {
        toast.error("Failed to add item.");
      }
    });
  }

  return (
    <section>
      <h2 className="font-heading text-lg font-semibold mb-3">Your Usual Items</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item) => {
          const inCart = cartItems.find((c) => c.itemId === item.id);
          return (
            <div
              key={item.id}
              className={`relative flex flex-col p-3 rounded-xl border transition-colors ${inCart ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full aspect-square rounded-lg object-cover mb-2"
                  loading="lazy"
                />
              )}
              <p className="text-sm font-medium leading-tight">{item.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                ${(item.wholesalePriceCents / 100).toFixed(2)} · min {item.moq}
              </p>
              {inCart && (
                <p className="text-xs text-primary font-medium mt-0.5">{inCart.qty} in cart</p>
              )}
              <button
                onClick={() => handleAdd(item)}
                disabled={pending}
                className="mt-2 flex items-center justify-center gap-1 text-xs font-medium py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 disabled:opacity-50 transition-colors"
              >
                {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                Add {item.moq}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
