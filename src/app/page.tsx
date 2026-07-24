// Home page lives here — NOT in (public)/page.tsx (that would duplicate the "/" route).
// The (public) route group provides the shared nav/footer layout only for
// /menu, /gallery, /about, /contact, /order.
import type { Metadata } from "next";
import Link from "next/link";
import { Clock, MapPin, Gift, Newspaper, Star, Heart } from "lucide-react";
import { PublicNav } from "@/components/public/nav";
import { PublicFooter } from "@/components/public/footer";
import { PhotoSlot } from "@/components/public/photo-slot";
import { HeroShowcase } from "@/components/public/hero-showcase";
import { ProudlyCanadian } from "@/components/public/canadian-badges";
import { SocialLinks } from "@/components/public/social-links";
import { JsonLd, localBusinessSchema } from "@/components/seo/json-ld";
import { getActiveSpecials } from "@/lib/data/specials";
import {
  HOME_CATEGORIES,
  HOME_PROGRAMS,
  HOME_REVIEWS,
  SPECIAL_ACCENTS,
} from "@/lib/data/fallback-content";
import { getHours, DAY_NAMES, formatTime } from "@/lib/data/hours";
import { SITE } from "@/lib/site";

const PROGRAM_ICONS = { gift: Gift, newspaper: Newspaper, star: Star, heart: Heart } as const;

export const metadata: Metadata = {
  title: "Sassy's Bakery — Bakery, Deli & Pizzeria in Thorndale, ON",
  description:
    "Family-owned bakery, deli & pizzeria in Thorndale, Ontario. Hand-built pizzas, stacked subs, fried chicken and fresh-baked goods — made to order, ready when you are.",
  alternates: { canonical: process.env.NEXT_PUBLIC_APP_URL ?? "https://mysassys.com" },
};

export const revalidate = 60;

export default async function HomePage() {
  const [specials, { regular: hours }] = await Promise.all([
    getActiveSpecials(),
    getHours(),
  ]);
  const today = hours.find((h) => h.dayOfWeek === new Date().getDay());

  return (
    <>
      <JsonLd data={localBusinessSchema()} />
      <PublicNav />
      <main className="flex-1 font-body text-ink">
        {/* ── Hero ── */}
        <section className="mx-auto max-w-[1280px] px-5 nav:px-7 pt-5 nav:pt-9 pb-10 nav:pb-16 grid grid-cols-1 nav:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-8 nav:gap-14 items-center">
          {/* Text */}
          <div className="order-2 nav:order-1 relative animate-fade-up">
            <div className="flex flex-wrap items-center gap-2 mb-[22px]">
              <span className="inline-flex items-center gap-2 bg-forest text-cream font-display font-bold text-[13px] px-4 py-[7px] rounded-full">
                Family Owned&nbsp; · &nbsp;Serving Thorndale since {SITE.foundingYear}
              </span>
              <ProudlyCanadian className="bg-cream text-ink border border-line text-[13px] px-3.5 py-[6px] rounded-full" />
            </div>
            <h1 className="font-display font-extrabold text-[38px] nav:text-[58px] leading-[1.05] text-ink mb-5">
              Bakery. Deli.
              <br />
              Pizzeria.
              <br />
              <span className="text-sassy-red">All Sassy&apos;s.</span>
            </h1>
            <p className="text-base nav:text-[18px] leading-relaxed text-ink-muted max-w-[460px] mb-[30px]">
              Hand-built pizzas, stacked subs, fried chicken and fresh-baked
              goods — made to order, baked fresh daily, and ready when you are.
              Come hungry; leave happy.
            </p>
            <div className="flex gap-3.5 flex-wrap">
              <Link
                href="/order"
                className="bg-sassy-red text-cream-hi rounded-full px-[30px] py-4 font-display font-bold text-[17px] shadow-[0_4px_0_var(--color-red-dark)] hover:brightness-105 transition"
              >
                Order Pickup
              </Link>
              <Link
                href="/menu"
                className="bg-cream text-ink border-2 border-ink rounded-full px-7 py-3.5 font-display font-bold text-[17px] hover:bg-cream-alt transition-colors"
              >
                View Full Menu
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 nav:order-2 relative">
            <div className="absolute -top-[22px] -left-[22px] w-[92%] h-[92%] rounded-[28px] bg-cream-alt z-0" />
            <div
              className="absolute top-3.5 right-3.5 w-[88px] h-[88px] rounded-full bg-gold flex items-center justify-center text-center font-display font-bold text-[12px] text-ink z-[2] leading-tight p-2 animate-float shadow-[0_6px_16px_rgba(43,33,24,0.2)]"
              style={{ ["--sassy-tilt" as string]: "8deg" }}
            >
              Fresh Since Day One
            </div>
            <HeroShowcase className="w-full h-[260px] nav:h-[440px] rounded-[28px] relative z-[1]" />
          </div>
        </section>

        {/* ── Weekly specials ── */}
        <section className="bg-white border-y border-line mx-auto w-full">
          <div className="mx-auto max-w-[1280px] px-5 nav:px-7 py-11 nav:py-16">
          <div className="flex items-end justify-between mb-[26px] flex-wrap gap-2.5">
            <div>
              <div className="font-display font-bold text-[13px] text-sassy-red uppercase tracking-wide mb-2">
                Fresh this week
              </div>
              <h2 className="font-editorial font-semibold text-2xl nav:text-[32px]">
                This week at Sassy&apos;s
              </h2>
            </div>
            <span className="text-sm text-label">Specials rotate weekly — ask in store</span>
          </div>
          <div className="grid grid-cols-1 nav:grid-cols-3 gap-[22px]">
            {specials.map((sp, i) => {
              const accent = sp.accent ?? SPECIAL_ACCENTS[i % SPECIAL_ACCENTS.length];
              return (
                <div
                  key={sp.id}
                  className="bg-white border border-line rounded-2xl p-[22px] border-t-4"
                  style={{ borderTopColor: accent }}
                >
                  <div className="font-display font-bold text-[12px] text-sassy-red uppercase tracking-wide mb-2">
                    {sp.tag ?? "This Week"}
                  </div>
                  <div className="font-editorial font-semibold text-[21px] mb-2">{sp.title}</div>
                  <div
                    className="text-[15px] text-ink-soft leading-normal"
                    dangerouslySetInnerHTML={{ __html: sp.body }}
                  />
                </div>
              );
            })}
          </div>
          </div>
        </section>

        {/* ── What we make ── */}
        <section className="bg-cream-alt py-11 nav:py-16">
          <div className="mx-auto max-w-[1280px] px-5 nav:px-7">
            <h2 className="font-editorial font-semibold text-2xl nav:text-[32px] mb-[30px]">
              What we make
            </h2>
            <div className="grid grid-cols-2 nav:grid-cols-6 gap-[18px]">
              {HOME_CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.slug ? `/menu?cat=${cat.slug}` : "/menu"}
                  className="group bg-white rounded-2xl overflow-hidden border border-line transition hover:-translate-y-1 hover:shadow-[0_10px_22px_rgba(43,33,24,0.14)]"
                >
                  <PhotoSlot
                    label={cat.label}
                    src={`/site/cat-${cat.slug || "baking"}.jpg`}
                    className="w-full h-[120px]"
                  />
                  <div className="p-3.5 font-display font-bold text-[15px] text-center">
                    {cat.label}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── About snippet ── */}
        <section className="mx-auto max-w-[1280px] px-5 nav:px-7 py-11 nav:py-16 grid grid-cols-1 nav:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-8 nav:gap-14 items-center">
          <PhotoSlot
            label="Storefront / family photo"
            src="/site/story.jpg"
            className="w-full h-[240px] nav:h-[360px] rounded-[20px]"
          />
          <div>
            <div className="font-display font-bold text-[13px] text-forest uppercase tracking-wide mb-3">
              Our story
            </div>
            <h2 className="font-editorial font-semibold text-[22px] nav:text-[30px] mb-[18px]">
              A family kitchen on King Street
            </h2>
            <p className="text-base leading-[1.7] text-ink-muted mb-4">
              For years Sassy&apos;s has been Thorndale&apos;s stop for pizza
              night, deli sandwiches, fried chicken dinners and fresh baking —
              everything built to order, the way you want it, by the same family
              that started it.
            </p>
            <Link
              href="/about"
              className="font-display font-bold text-base text-sassy-red hover:brightness-110"
            >
              Read our story →
            </Link>
          </div>
        </section>

        {/* ── Reviews / trust ── */}
        <section className="bg-cream-alt py-11 nav:py-16">
          <div className="mx-auto max-w-[1280px] px-5 nav:px-7">
            <div className="flex items-end justify-between mb-[30px] flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-1 text-gold mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-[18px] h-[18px] fill-current" />
                  ))}
                </div>
                <h2 className="font-editorial font-semibold text-2xl nav:text-[32px]">
                  What our neighbours say
                </h2>
              </div>
              <SocialLinks className="w-10 h-10 rounded-full bg-white border border-line flex items-center justify-center text-ink hover:border-forest transition-colors" />
            </div>
            <div className="grid grid-cols-1 nav:grid-cols-3 gap-[22px]">
              {HOME_REVIEWS.map((r) => (
                <figure
                  key={r.quote}
                  className="bg-white border border-line rounded-2xl p-[22px] flex flex-col"
                >
                  <div className="flex items-center gap-1 text-gold mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-[15px] text-ink-soft leading-relaxed flex-1">
                    “{r.quote}”
                  </blockquote>
                  <figcaption className="font-display font-bold text-[13px] text-ink mt-4">
                    — {r.author}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ── Visit us (hours + directions) ── */}
        <section className="mx-auto max-w-[1280px] px-5 nav:px-7 py-11 nav:py-14">
          <div className="bg-forest text-cream rounded-[24px] px-6 nav:px-10 py-8 nav:py-10 flex flex-col nav:flex-row items-start nav:items-center justify-between gap-6">
            <div>
              <div className="font-display font-bold text-[13px] text-gold uppercase tracking-wide mb-2">
                Come see us
              </div>
              <h2 className="font-editorial font-semibold text-[22px] nav:text-[30px] mb-3">
                {SITE.address}
              </h2>
              <div className="flex items-center gap-2 text-cream/90 text-[15px]">
                <Clock className="w-[18px] h-[18px] shrink-0" />
                {today && !today.isClosed ? (
                  <span>
                    Open today · {formatTime(today.opensAt)} – {formatTime(today.closesAt)}
                  </span>
                ) : (
                  <span>{today ? "Closed today" : "See hours on our contact page"}</span>
                )}
                <span className="text-cream/50">·</span>
                <span className="text-cream/70">{today ? DAY_NAMES[today.dayOfWeek] : ""}</span>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <a
                href={SITE.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gold text-forest-dark rounded-full px-6 py-[13px] font-display font-bold text-base hover:brightness-105 transition"
              >
                <MapPin className="w-[18px] h-[18px]" /> Get Directions
              </a>
              <a
                href={SITE.phoneHref}
                className="inline-flex items-center gap-2 bg-cream text-ink rounded-full px-6 py-[13px] font-display font-bold text-base hover:bg-cream-alt transition-colors"
              >
                Call {SITE.phone}
              </a>
            </div>
          </div>
        </section>

        {/* ── Coming soon programs ── */}
        <section className="bg-cream-alt py-11 nav:py-16">
          <div className="mx-auto max-w-[1280px] px-5 nav:px-7">
            <div className="mb-[30px]">
              <div className="font-display font-bold text-[13px] text-sassy-red uppercase tracking-wide mb-2">
                Coming soon
              </div>
              <h2 className="font-editorial font-semibold text-2xl nav:text-[32px]">
                More ways to enjoy Sassy&apos;s
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 nav:grid-cols-4 gap-[18px]">
              {HOME_PROGRAMS.map((p) => {
                const Icon = PROGRAM_ICONS[p.icon as keyof typeof PROGRAM_ICONS];
                return (
                  <div
                    key={p.label}
                    className="bg-white border border-line rounded-2xl overflow-hidden"
                  >
                    <div className="relative h-[130px]">
                      <PhotoSlot label={p.label} src={p.image} className="w-full h-full" />
                      <span className="absolute top-3 right-3 bg-cream text-label font-display font-bold text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full shadow-sm">
                        Soon
                      </span>
                      <div className="absolute -bottom-5 left-4 w-10 h-10 rounded-xl bg-white border border-line text-forest flex items-center justify-center shadow-sm">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="p-[22px] pt-7">
                      <div className="font-display font-bold text-[17px] mb-1.5">{p.label}</div>
                      <div className="text-sm text-ink-soft leading-normal">{p.blurb}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Wholesale teaser ── */}
        <section className="bg-forest px-5 nav:px-7 py-9 nav:py-[50px]">
          <div className="mx-auto max-w-[1280px] flex flex-col nav:flex-row items-start nav:items-center justify-between gap-6">
            <div>
              <div className="font-display font-bold text-[13px] text-gold uppercase tracking-wide mb-2">
                For stores &amp; restaurants
              </div>
              <h2 className="font-editorial font-semibold text-[22px] nav:text-[30px] text-cream m-0">
                Wholesale breads &amp; baking, delivered on your schedule.
              </h2>
            </div>
            <Link
              href="/wholesale/login"
              className="bg-gold text-forest-dark rounded-full px-7 py-[15px] font-display font-bold text-base whitespace-nowrap hover:brightness-105 transition"
            >
              Wholesale Login →
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
