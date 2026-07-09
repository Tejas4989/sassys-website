"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { addToCart } from "@/lib/actions/wholesale-cart";

interface Item {
  id: string;
  name: string;
  description?: string | null;
  wholesalePriceCents: number;
  moq: number;
  caseSize: number;
  availabilityDays?: string[] | null;
  imageUrl: string | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  items: Item[];
}

interface CartItem {
  itemId: string;
  qty: number;
}

interface Props {
  categories: Category[];
  cartItems: CartItem[];
}

export function WholesaleCatalogSection({ categories, cartItems }: Props) {
  const [pending, startTransition] = useTransition();

  function handleAdd(item: Item) {
    startTransition(async () => {
      try {
        await addToCart(item.id, item.moq);
        toast.success(`${item.moq}× ${item.name} added.`);
      } catch {
        toast.error("Failed to add item.");
      }
    });
  }

  const activeCategories = categories.filter((c) => c.items.length > 0);

  return (
    <section>
      {/* Anchor nav */}
      {activeCategories.length > 1 && (
        <nav className="flex flex-wrap gap-2 mb-6">
          {activeCategories.map((cat) => (
            <a
              key={cat.id}
              href={`#wcat-${cat.slug}`}
              className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-secondary text-muted-foreground transition-colors"
            >
              {cat.name}
            </a>
          ))}
        </nav>
      )}

      <div className="space-y-10">
        {activeCategories.map((cat) => (
          <div key={cat.id} id={`wcat-${cat.slug}`}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-heading text-xl font-bold">{cat.name}</h2>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cat.items.map((item) => {
                const inCart = cartItems.find((c) => c.itemId === item.id);
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-colors ${inCart ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}
                  >
                    <div className="flex gap-3 mb-3">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-14 h-14 rounded-lg object-cover shrink-0"
                          loading="lazy"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-snug">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm">
                          ${(item.wholesalePriceCents / 100).toFixed(2)}
                          <span className="text-xs text-muted-foreground font-normal"> / unit</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Min {item.moq} · Case {item.caseSize}
                        </p>
                        {inCart && (
                          <p className="text-xs text-primary font-semibold mt-0.5">
                            {inCart.qty} in cart
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleAdd(item)}
                        disabled={pending}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 disabled:opacity-50 transition-colors shrink-0"
                      >
                        {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                        Add {item.moq}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {activeCategories.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">Catalog coming soon</p>
            <p className="text-sm mt-1">
              Call (519) 461-1234 to place your order while we set things up.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
