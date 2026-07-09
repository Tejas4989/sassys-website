// Home page lives here — NOT in (public)/page.tsx
// Having both would create a duplicate route for "/" in Next.js.
// The (public) route group provides shared layout only for /menu, /gallery, /contact, /order.
import { PublicNav } from "@/components/public/nav";
import { PublicFooter } from "@/components/public/footer";
import { JsonLd, localBusinessSchema } from "@/components/seo/json-ld";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sassy's Bakery — Fresh Bread, Pizza & Deli in Thorndale, ON",
  description:
    "Family-owned bakery, deli & pizzeria in Thorndale, Ontario since 1990. Fresh baked breads, pizza, subs, fried chicken, Shaw's Ice Cream, and wholesale bakery services. Order online for pickup.",
  alternates: { canonical: process.env.NEXT_PUBLIC_APP_URL ?? "https://mysassys.com" },
  openGraph: {
    title: "Sassy's Bakery — Thorndale, ON",
    description: "Fresh baked breads, pizza, deli, ice cream. Family-owned since 1990.",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://mysassys.com",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Sassy's Bakery in Thorndale, ON" }],
  },
};
import Link from "next/link";
import { ArrowRight, Clock, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getActiveSpecials } from "@/lib/data/specials";
import { getHours, DAY_NAMES } from "@/lib/data/hours";
import { getGalleryPhotos } from "@/lib/data/gallery";

export const revalidate = 60;
// metadata is defined above — this export is still needed for the page

const HIGHLIGHTS = [
  { emoji: "🍞", label: "Fresh Baked Bread & Sweets" },
  { emoji: "🍕", label: "Pizza & Subs" },
  { emoji: "🍗", label: "Southern Fried Chicken" },
  { emoji: "🧀", label: "Deli Meats & Cheeses" },
  { emoji: "🍦", label: "Shaw's Ice Cream" },
  { emoji: "📦", label: "Wholesale Bakery" },
];

export default async function HomePage() {
  const [specials, hoursData, photos] = await Promise.all([
    getActiveSpecials(),
    getHours(),
    getGalleryPhotos(),
  ]);

  const todayIdx = new Date().getDay();
  const todayHours = hoursData.regular.find((h) => h.dayOfWeek === todayIdx);

  return (
    <>
      <JsonLd data={localBusinessSchema()} />
      <PublicNav />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden" style={{ backgroundColor: "oklch(0.32 0.06 45)", color: "oklch(0.97 0.012 85)" }}>
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 md:py-32">
            <p className="text-sm font-medium tracking-widest uppercase opacity-70 mb-4">
              Thorndale, Ontario
            </p>
            <h1 className="font-heading text-5xl md:text-7xl font-bold leading-tight mb-6">
              Baked with Love,
              <br />
              Served with Heart.
            </h1>
            <p className="text-lg md:text-xl opacity-80 max-w-xl mb-8 leading-relaxed">
              Family-owned bakery, deli & pizzeria in the heart of Thorndale
              since 1990. Fresh bread every morning, pizza all day, and a whole
              lot more.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="border-0 font-semibold" style={{ backgroundColor: "oklch(0.72 0.13 65)", color: "oklch(0.22 0.05 45)" }}>
                <Link href="/order">
                  Order Online <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 hover:bg-white/10" style={{ color: "oklch(0.97 0.012 85)" }}>
                <Link href="/menu">See Our Menu</Link>
              </Button>
            </div>
            {todayHours && (
              <div className="mt-8 inline-flex items-center gap-2 text-sm opacity-70">
                <Clock className="w-4 h-4" />
                {todayHours.isClosed ? (
                  <span>Closed today</span>
                ) : (
                  <span>Open today: {todayHours.opensAt} – {todayHours.closesAt}</span>
                )}
              </div>
            )}
          </div>
        </section>

        {/* What we offer */}
        <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-2">
            Something for Everyone
          </h2>
          <p className="text-center text-muted-foreground mb-10">
            From sunrise breads to late-night pizza — we&apos;ve got you covered.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {HIGHLIGHTS.map((h) => (
              <div key={h.label} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
                <span className="text-2xl">{h.emoji}</span>
                <span className="text-sm font-medium">{h.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Weekly specials */}
        {specials.length > 0 && (
          <section className="py-16 bg-secondary/50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-2">Weekly Specials</h2>
              <p className="text-muted-foreground mb-8">Updated every week — check back often.</p>
              <div className="grid md:grid-cols-2 gap-6">
                {specials.map((s) => (
                  <Card key={s.id} className="border-border">
                    <CardContent className="p-6">
                      <h3 className="font-heading text-xl font-semibold mb-3">{s.title}</h3>
                      <div className="text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: s.body }} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* About */}
        <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">A Family Tradition</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                What started as a simple pizza shop has grown into a full bakery, deli, and pizzeria loved by Thorndale and the surrounding communities for decades.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our commercial bakery serves about a 40-mile radius, supplying fresh baked goods to grocery stores, restaurants, golf courses, and caterers across the region.
              </p>
              <Button asChild variant="outline"><Link href="/contact">Get in Touch</Link></Button>
            </div>
            <div className="bg-secondary rounded-2xl aspect-square flex items-center justify-center overflow-hidden">
              {photos[0] ? (
                <img src={photos[0].url} alt={photos[0].caption ?? "Sassy's Bakery"} className="rounded-2xl w-full h-full object-cover" />
              ) : (
                <span className="text-6xl">🏠</span>
              )}
            </div>
          </div>
        </section>

        {/* Hours + location */}
        <section className="py-16" style={{ backgroundColor: "oklch(0.32 0.06 45)", color: "oklch(0.97 0.012 85)" }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
                  <Clock className="w-6 h-6 opacity-70" /> Hours
                </h2>
                <ul className="space-y-2">
                  {hoursData.regular.map((h) => (
                    <li key={h.dayOfWeek} className={`flex justify-between text-sm py-1 border-b last:border-0 ${h.dayOfWeek === todayIdx ? "font-semibold" : "opacity-80"}`} style={{ borderColor: "oklch(0.42 0.07 45)" }}>
                      <span>{DAY_NAMES[h.dayOfWeek]}</span>
                      <span>{h.isClosed ? "Closed" : `${h.opensAt} – ${h.closesAt}`}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
                  <MapPin className="w-6 h-6 opacity-70" /> Find Us
                </h2>
                <p className="opacity-80 mb-4">225 King St, Thorndale, Ontario N0M 2P0</p>
                <a href="tel:+15194611234" className="flex items-center gap-2 text-sm opacity-80 hover:opacity-100 mb-6">
                  <Phone className="w-4 h-4" /> (519) 461-1234
                </a>
                <Button asChild className="border-0" style={{ backgroundColor: "oklch(0.72 0.13 65)", color: "oklch(0.22 0.05 45)" }}>
                  <a href="https://maps.google.com/?q=225+King+St+Thorndale+ON" target="_blank" rel="noopener noreferrer">
                    Get Directions
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery preview */}
        {photos.length > 0 && (
          <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading text-3xl font-bold">From Our Kitchen</h2>
              <Button asChild variant="outline" size="sm">
                <Link href="/gallery">View All <ArrowRight className="ml-1 w-3 h-3" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {photos.slice(0, 8).map((p) => (
                <div key={p.id} className="aspect-square rounded-xl overflow-hidden bg-secondary">
                  <img src={p.url} alt={p.caption ?? "Sassy's Bakery"} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 bg-accent/10 border-y border-border">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="font-heading text-3xl font-bold mb-4">Ready to Order?</h2>
            <p className="text-muted-foreground mb-6">Place your pickup order online and we&apos;ll have it ready for you.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg"><Link href="/order">Order Now</Link></Button>
              <Button asChild size="lg" variant="outline"><Link href="/menu">Browse Menu</Link></Button>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
