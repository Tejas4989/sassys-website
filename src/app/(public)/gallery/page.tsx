import type { Metadata } from "next";
import { getGalleryPhotos } from "@/lib/data/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photos from Sassy's Bakery — our baked goods, storefront, and catering.",
};

export const revalidate = 300;

const CATEGORIES = [
  { slug: "all", label: "All" },
  { slug: "breads", label: "Breads & Pastries" },
  { slug: "cakes", label: "Cakes" },
  { slug: "catering", label: "Catering" },
  { slug: "storefront", label: "Storefront" },
] as const;

export default async function GalleryPage() {
  const photos = await getGalleryPhotos();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">
          Gallery
        </h1>
        <p className="text-muted-foreground text-lg">
          A look at what we bake, serve, and love.
        </p>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <p className="text-6xl mb-4">📷</p>
          <p className="text-lg font-medium">Photos coming soon!</p>
        </div>
      ) : (
        <>
          {CATEGORIES.filter((c) => c.slug !== "all").map((cat) => {
            const catPhotos = photos.filter((p) => p.category === cat.slug);
            if (catPhotos.length === 0) return null;
            return (
              <section key={cat.slug} className="mb-14">
                <h2 className="font-heading text-2xl font-semibold mb-6">
                  {cat.label}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {catPhotos.map((p) => (
                    <div
                      key={p.id}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-secondary"
                    >
                      <img
                        src={p.url}
                        alt={p.caption ?? cat.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {p.caption && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                          <p className="text-white text-xs font-medium line-clamp-2">
                            {p.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
