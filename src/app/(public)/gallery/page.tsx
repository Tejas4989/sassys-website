import type { Metadata } from "next";
import { getGalleryPhotos } from "@/lib/data/gallery";
import { GalleryGrid } from "@/components/public/gallery-grid";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://mysassys.com";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Fresh baking, hand-built orders and a peek inside Sassy's kitchen in Thorndale, ON.",
  alternates: { canonical: `${BASE}/gallery` },
  openGraph: {
    title: "Gallery | Sassy's Bakery",
    description: "Photos from Sassy's Bakery in Thorndale, ON.",
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
          Fresh baking, hand-built orders &amp; a peek inside the kitchen.
        </p>
        {photos.length > 0 ? (
          <GalleryGrid photos={photos} />
        ) : (
          <div className="text-center py-20 text-label">
            <p className="font-display font-bold text-lg text-ink">Photos coming soon</p>
            <p className="text-sm mt-2">
              We&apos;re plating up something worth showing — check back soon!
            </p>
          </div>
        )}
      </div>
    </>
  );
}
