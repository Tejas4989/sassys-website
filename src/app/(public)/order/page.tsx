import type { Metadata } from "next";
import { getMenuWithCategories } from "@/lib/data/menu";
import { CartProvider } from "@/components/order/cart-context";
import { ItemCard } from "@/components/order/item-card";
import { CartDrawer } from "@/components/order/cart-drawer";

export const metadata: Metadata = {
  title: "Order Online",
  description: "Place a pickup order from Sassy's Bakery in Thorndale, ON.",
};

export const revalidate = 60;

export default async function OrderPage() {
  const categories = await getMenuWithCategories();
  const activeCategories = categories.filter((c) => c.items.length > 0);

  return (
    <CartProvider>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold">Order Online</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Pick your items, choose a pickup time, and we&apos;ll have it ready.
            </p>
          </div>
          <CartDrawer />
        </div>

        {activeCategories.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p className="text-5xl mb-4">🥖</p>
            <p className="text-xl font-medium mb-2">Menu coming soon!</p>
            <p className="text-sm">
              Call us at{" "}
              <a href="tel:+15194611234" className="text-primary hover:underline">
                (519) 461-1234
              </a>{" "}
              to place your order.
            </p>
          </div>
        ) : (
          <>
            {/* Category anchors */}
            <nav className="flex gap-2 flex-wrap mb-8 pb-4 border-b border-border sticky top-16 bg-background/95 backdrop-blur z-10 pt-2 -mt-2">
              {activeCategories.map((cat) => (
                <a
                  key={cat.id}
                  href={`#cat-${cat.id}`}
                  className="text-xs font-medium px-3 py-1.5 rounded-full border border-border hover:bg-secondary hover:text-foreground transition-colors text-muted-foreground"
                >
                  {cat.name}
                </a>
              ))}
            </nav>

            {/* Menu items */}
            <div className="space-y-12">
              {activeCategories.map((cat) => (
                <section key={cat.id} id={`cat-${cat.id}`}>
                  <div className="flex items-center gap-4 mb-5">
                    <h2 className="font-heading text-2xl font-bold">{cat.name}</h2>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {cat.items.map((item) => (
                      <ItemCard
                        key={item.id}
                        itemId={item.id}
                        name={item.name}
                        description={item.description}
                        priceCents={item.priceCents}
                        imageKey={item.imageKey}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}

        {/* Sticky cart bar on mobile */}
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-background/95 backdrop-blur border-t border-border px-4 py-3 flex justify-center z-20">
          <CartDrawer />
        </div>
        <div className="h-20 md:hidden" />
      </div>
    </CartProvider>
  );
}
