import type { Metadata } from "next";
import { PhotoSlot } from "@/components/public/photo-slot";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://mysassys.com";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Sassy's is a family-owned bakery, deli and pizzeria on King Street in Thorndale, Ontario — everything made to order, by hand, the way it's always been.",
  alternates: { canonical: `${BASE}/about` },
  openGraph: {
    title: "Our Story | Sassy's Bakery",
    description: "A family-owned bakery, deli and pizzeria in Thorndale, Ontario.",
    url: `${BASE}/about`,
  },
};

const VALUES = [
  {
    title: "Family owned",
    body: "Run day to day by the same family that started it.",
  },
  {
    title: "Made to order",
    body: "Pizza, subs and chicken built fresh when you order — not before.",
  },
  {
    title: "Local wholesale",
    body: "Supplying breads & baking to stores and restaurants nearby.",
  },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "About", url: "/about" },
        ])}
      />
      <div className="mx-auto max-w-[1280px] px-5 nav:px-7 pt-7 nav:pt-11 pb-16 nav:pb-20 font-body text-ink">
        <h1 className="font-editorial font-semibold text-[28px] nav:text-[38px] mb-[30px]">
          Our Story
        </h1>

        <div className="grid grid-cols-1 nav:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-8 nav:gap-14 items-center mb-[50px]">
          <PhotoSlot
            label="Family / storefront photo"
            className="w-full h-[240px] nav:h-[360px] rounded-[20px]"
          />
          <div>
            <p className="text-[17px] leading-[1.75] text-[#3B2F24] mb-4">
              Sassy&apos;s is a family-owned bakery, deli and pizzeria on King
              Street in Thorndale, Ontario. What started as a small counter has
              grown into the neighbourhood&apos;s go-to for pizza night,
              hand-built subs, fried chicken dinners and fresh-baked goods.
            </p>
            <p className="text-[17px] leading-[1.75] text-[#3B2F24]">
              Everything is still made to order, by hand, the way it&apos;s
              always been — and now the same recipes are available to local
              stores and restaurants through our wholesale program.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 nav:grid-cols-3 gap-5">
          {VALUES.map((v) => (
            <div key={v.title} className="bg-cream-alt rounded-2xl p-[26px]">
              <div className="font-display font-bold text-[15px] text-forest mb-2">
                {v.title}
              </div>
              <div className="text-sm text-ink-soft leading-[1.6]">{v.body}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
