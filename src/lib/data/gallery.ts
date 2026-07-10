import { db } from "@/db/client";
import { galleryPhotos } from "@/db/schema";
import { and, eq, asc } from "drizzle-orm";
import { getPublicUrl } from "@/lib/r2";
import { FALLBACK_GALLERY, type GalleryPhotoWithUrl } from "./fallback-content";

export async function getGalleryPhotos(category?: string): Promise<GalleryPhotoWithUrl[]> {
  try {
    const conditions: Parameters<typeof and>[] = [
      [eq(galleryPhotos.isActive, true)],
    ];
    if (category) {
      conditions[0].push(
        eq(galleryPhotos.category, category as "cakes" | "breads" | "storefront" | "catering")
      );
    }

    const photos = await db
      .select()
      .from(galleryPhotos)
      .where(and(...conditions[0]))
      .orderBy(asc(galleryPhotos.sortOrder));

    if (photos.length === 0) {
      return category
        ? FALLBACK_GALLERY.filter((p) => p.category === category)
        : FALLBACK_GALLERY;
    }

    return photos.map((p) => ({ ...p, url: getPublicUrl(p.imageKey) }));
  } catch {
    return category
      ? FALLBACK_GALLERY.filter((p) => p.category === category)
      : FALLBACK_GALLERY;
  }
}
