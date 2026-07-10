import type { Metadata } from "next";
import { getMenuWithCategories } from "@/lib/data/menu";
import { MenuBrowser } from "@/components/public/menu-browser";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://mysassys.com";

export const metadata: Metadata = {
  title: "Our Menu",
  description:
    "Pizza, subs, chicken, salads & breakfast — every item made to order. Order online for pickup in Thorndale, ON.",
  alternates: { canonical: `${BASE}/menu` },
  openGraph: {
    title: "Our Menu | Sassy's Bakery",
    description: "Pizza, subs, fried chicken, salads and breakfast in Thorndale, ON.",
    url: `${BASE}/menu`,
  },
};

export const revalidate = 60;

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const [{ cat }, categories] = await Promise.all([
    searchParams,
    getMenuWithCategories(),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Menu", url: "/menu" },
        ])}
      />
      <div className="mx-auto max-w-[1280px] px-5 nav:px-7 pt-7 nav:pt-11 pb-16 nav:pb-20 font-body text-ink">
        <h1 className="font-editorial font-semibold text-[28px] nav:text-[38px] mb-2">
          Our Menu
        </h1>
        <p className="text-base text-label mb-[30px]">
          Pizza, subs, chicken, salads &amp; breakfast — every item made to order.
        </p>
        <MenuBrowser categories={categories} initialSlug={cat} />
      </div>
    </>
  );
}
