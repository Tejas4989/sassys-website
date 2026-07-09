import { auth } from "@/lib/auth";
import {
  getWholesaleCart,
  getWholesaleCatalog,
  getLastWholesaleOrder,
  getTopWholesaleItems,
  getWholesaleCustomerByUserId,
} from "@/lib/data/wholesale";
import { ReorderCard } from "@/components/wholesale/reorder-card";
import { QuickAddTiles } from "@/components/wholesale/quick-add-tiles";
import { WholesaleCartSummary } from "@/components/wholesale/cart-summary";
import { WholesaleCatalogSection } from "@/components/wholesale/catalog-section";
import { ShoppingBag } from "lucide-react";

export const revalidate = 0;

export default async function WholesaleLandingPage() {
  const session = await auth();
  const userId = session!.user.id!;

  const customerRow = await getWholesaleCustomerByUserId(userId);
  const customerId = customerRow?.customer.id!;
  const businessName = customerRow?.customer.businessName ?? session!.user.name!;

  const [cart, catalog, lastOrder, topItems] = await Promise.all([
    getWholesaleCart(customerId),
    getWholesaleCatalog(),
    getLastWholesaleOrder(customerId),
    getTopWholesaleItems(customerId, 8),
  ]);

  const cartTotalCents = cart.items.reduce(
    (sum, i) => sum + i.wholesalePriceCents * i.qty,
    0
  );

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="font-heading text-2xl font-bold">
          Welcome back, {businessName}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Build your order below. Submit before end of day for next-day delivery/pickup.
        </p>
      </div>

      {/* Reorder last + cart — side-by-side on desktop */}
      <div className="grid md:grid-cols-2 gap-6">
        {lastOrder ? (
          <ReorderCard order={lastOrder} />
        ) : (
          <div className="flex items-center gap-3 p-5 rounded-xl border border-dashed border-border text-muted-foreground">
            <ShoppingBag className="w-6 h-6 opacity-40" />
            <p className="text-sm">No past orders yet — browse the catalog below to get started.</p>
          </div>
        )}

        <WholesaleCartSummary
          items={cart.items}
          totalCents={cartTotalCents}
        />
      </div>

      {/* Quick-add tiles (top ordered items) */}
      {topItems.length > 0 && (
        <QuickAddTiles items={topItems} cartItems={cart.items} />
      )}

      {/* Full catalog */}
      <WholesaleCatalogSection categories={catalog} cartItems={cart.items} />
    </div>
  );
}
