import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMenuWithCategories } from "@/lib/data/menu";
import { getPublicUrl } from "@/lib/r2";
import { ArrowRight } from "lucide-react";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://mysassys.com";

export const metadata: Metadata = {
  title: "Our Menu",
  description:
    "Browse Sassy's full menu — pizza, subs, fried chicken, fresh baked breads, appetizers, and more. Order online for pickup in Thorndale, ON.",
  alternates: { canonical: `${BASE}/menu` },
  openGraph: {
    title: "Our Menu | Sassy's Bakery",
    description: "Pizza, subs, fried chicken, fresh breads, deli, ice cream and more in Thorndale, ON.",
    url: `${BASE}/menu`,
  },
};

export const revalidate = 60;

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function MenuPage() {
  const categories = await getMenuWithCategories();

  return (
    <>
    <JsonLd data={breadcrumbSchema([{ name: "Home", url: "/" }, { name: "Menu", url: "/menu" }])} />
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">
          Our Menu
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Made fresh daily. Everything from morning pastries to late-night pizza.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`#${cat.slug}`}
              className="text-sm px-3 py-1 rounded-full border border-border hover:bg-secondary transition-colors"
            >
              {cat.name}
            </a>
          ))}
        </div>
      </div>

      {categories.length === 0 && (
        <div className="text-center py-24 text-muted-foreground">
          <p className="text-6xl mb-4">🥖</p>
          <p className="text-lg font-medium">Menu coming soon!</p>
          <p className="text-sm mt-2">
            Call us at (519) 461-1234 to hear today&apos;s offerings.
          </p>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-16">
        {categories.map((cat) => (
          <section key={cat.id} id={cat.slug}>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="font-heading text-2xl md:text-3xl font-bold">
                {cat.name}
              </h2>
              <div className="flex-1 h-px bg-border" />
            </div>

            {cat.items.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Check back soon for items in this category.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-4 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow"
                  >
                    {item.imageKey && (
                      <img
                        src={getPublicUrl(item.imageKey)}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm leading-snug">
                          {item.name}
                        </h3>
                        <span className="text-sm font-semibold text-primary shrink-0">
                          {formatPrice(item.priceCents)}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Order CTA */}
      <div className="mt-16 text-center p-10 rounded-2xl bg-secondary/60 border border-border">
        <h3 className="font-heading text-2xl font-bold mb-2">
          Ready to Order?
        </h3>
        <p className="text-muted-foreground mb-6">
          Place your pickup order online or give us a call.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild size="lg">
            <Link href="/order">
              Order Online <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="tel:+15194611234">Call (519) 461-1234</a>
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}
