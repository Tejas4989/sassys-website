import { unstable_cache } from "next/cache";
import { db } from "@/db/client";
import { galleryPhotos } from "@/db/schema";
import { and, eq, asc } from "drizzle-orm";
import { getPublicUrl } from "@/lib/r2";

export const getGalleryPhotos = unstable_cache(
  async (category?: string) => {
    const conditions = [eq(galleryPhotos.isActive, true)];
    if (category) {
      conditions.push(
        eq(
          galleryPhotos.category,
          category as
            | "cakes"
            | "breads"
            | "storefront"
            | "catering"
        )
      );
    }
    const photos = await db
      .select()
      .from(galleryPhotos)
      .where(and(...conditions))
      .orderBy(asc(galleryPhotos.sortOrder))
      .catch(() => []);

    return photos.map((p) => ({
      ...p,
      url: getPublicUrl(p.imageKey),
    }));
  },
  ["gallery"],
  { revalidate: 300, tags: ["gallery"] }
);
