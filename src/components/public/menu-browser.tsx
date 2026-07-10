"use client";

import { useState } from "react";

type Item = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
};
type Category = { id: number; name: string; slug: string; items: Item[] };

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function MenuBrowser({
  categories,
  initialSlug,
}: {
  categories: Category[];
  initialSlug?: string;
}) {
  const [active, setActive] = useState<string>(
    () =>
      categories.find((c) => c.slug === initialSlug)?.slug ??
      categories[0]?.slug ??
      ""
  );

  const current =
    categories.find((c) => c.slug === active) ?? categories[0];

  if (!current) {
    return (
      <div className="text-center py-24 text-label">
        <p className="text-lg font-display font-bold">Menu coming soon.</p>
        <p className="text-sm mt-2">Call us at (519) 000-0000 to hear today&apos;s offerings.</p>
      </div>
    );
  }

  return (
    <>
      {/* Category pills */}
      <div className="flex gap-2.5 flex-wrap mb-9">
        {categories.map((c) => {
          const isActive = c.slug === active;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActive(c.slug)}
              className={`rounded-full px-[18px] py-[9px] font-display font-bold text-sm border transition-colors ${
                isActive
                  ? "bg-forest text-cream border-forest"
                  : "bg-white text-ink border-line hover:border-forest"
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {/* Item grid */}
      <div className="grid grid-cols-1 nav:grid-cols-2 gap-5">
        {current.items.map((it) => (
          <div
            key={it.id}
            className="bg-white border border-line rounded-[14px] px-[22px] py-5 flex justify-between gap-4"
          >
            <div>
              <div className="font-display font-bold text-[17px] mb-1.5">{it.name}</div>
              {it.description && (
                <div className="text-sm text-ink-soft leading-normal">{it.description}</div>
              )}
            </div>
            <div className="font-display font-bold text-base text-sassy-red whitespace-nowrap">
              {formatPrice(it.priceCents)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
