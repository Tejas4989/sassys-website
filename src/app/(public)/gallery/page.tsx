import type { Metadata } from "next";
import { getGalleryPhotos } from "@/lib/data/gallery";
import { GalleryGrid } from "@/components/public/gallery-grid";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://mysassys.com";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Cakes, breads, storefront & catering — a peek inside Sassy's kitchen in Thorndale, ON.",
  alternates: { canonical: `${BASE}/gallery` },
  openGraph: {
    title: "Gallery | Sassy's Bakery",
    description: "Cakes, breads, storefront & catering photos from Sassy's Bakery.",
    url: `${BASE}/gallery`,
  },
};

export const revalidate = 60;

export default async function GalleryPage() {
  const photos = await getGalleryPhotos();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Gallery", url: "/gallery" },
        ])}
      />
      <div className="mx-auto max-w-[1280px] px-5 nav:px-7 pt-7 nav:pt-11 pb-16 nav:pb-20 font-body text-ink">
        <h1 className="font-editorial font-semibold text-[28px] nav:text-[38px] mb-2">
          Gallery
        </h1>
        <p className="text-base text-label mb-[34px]">
          Cakes, breads, storefront &amp; catering — a peek inside the kitchen.
        </p>
        <GalleryGrid photos={photos} />
      </div>
    </>
  );
}
