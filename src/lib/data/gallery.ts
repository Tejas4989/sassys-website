import { getPublicUrl, listObjects } from "@/lib/r2";
import { FALLBACK_GALLERY } from "./fallback-content";

export type GalleryImage = {
  id: string;
  url: string;
  imageKey: string;
  caption: string | null;
  category: string;
};

// Folder in the R2 bucket the public gallery reads from. Override with the
// GALLERY_R2_PREFIX env var if you ever want to point it elsewhere.
const GALLERY_PREFIX = process.env.GALLERY_R2_PREFIX ?? "gallery/";
const IMAGE_RE = /\.(jpe?g|png|webp|avif|gif)$/i;

/** Turn "gallery/chocolate-cake-9f2ab1.jpg" into "Chocolate Cake". */
function prettifyCaption(key: string): string {
  const base = key.split("/").pop()?.replace(/\.[a-z0-9]+$/i, "") ?? "";
  return base
    .replace(/-[a-f0-9]{6,}$/i, "") // drop a trailing content hash, if any
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Public gallery images, listed live from the R2 `gallery/` folder. Drop new
 * images into that folder and they appear automatically (within the gallery
 * page's revalidate window) — no code or database changes needed. Newest first.
 */
export async function getGalleryPhotos(): Promise<GalleryImage[]> {
  try {
    const objects = (await listObjects(GALLERY_PREFIX))
      .filter((o) => IMAGE_RE.test(o.key))
      .sort((a, b) => b.lastModified.localeCompare(a.lastModified)); // newest first

    return objects.map((o) => ({
      id: o.key,
      imageKey: o.key,
      url: getPublicUrl(o.key),
      caption: prettifyCaption(o.key),
      category: "gallery",
    }));
  } catch {
    // R2 unreachable — degrade to the static placeholder tiles so the page
    // still renders rather than erroring.
    return FALLBACK_GALLERY.map((p) => ({
      id: p.id,
      url: p.url,
      imageKey: p.imageKey,
      caption: p.caption,
      category: p.category,
    }));
  }
}
