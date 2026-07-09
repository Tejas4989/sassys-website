import { db } from "@/db/client";
import { galleryPhotos } from "@/db/schema";
import { asc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getPublicUrl } from "@/lib/r2";

export default async function AdminGalleryPage() {
  const photos = await db
    .select()
    .from(galleryPhotos)
    .orderBy(asc(galleryPhotos.sortOrder));

  const byCategory = photos.reduce(
    (acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    },
    {} as Record<string, typeof photos>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">Gallery</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Upload and organize photos shown on the public gallery page.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/gallery/upload">
            <Plus className="w-4 h-4 mr-1" /> Upload Photo
          </Link>
        </Button>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl text-muted-foreground">
          <p className="text-lg font-medium mb-2">No photos yet</p>
          <p className="text-sm mb-4">Upload your first photo to populate the gallery.</p>
          <Button asChild variant="outline">
            <Link href="/admin/gallery/upload">
              <Plus className="w-4 h-4 mr-1" /> Upload Photo
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(byCategory).map(([cat, catPhotos]) => (
            <section key={cat}>
              <h2 className="font-heading text-xl font-semibold capitalize mb-4">
                {cat.replace("_", " ")}
              </h2>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {catPhotos.map((p) => (
                  <div key={p.id} className="group relative">
                    <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
                      <img
                        src={getPublicUrl(p.imageKey)}
                        alt={p.caption ?? cat}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-1">
                      <Badge
                        variant={p.isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {p.isActive ? "On" : "Off"}
                      </Badge>
                      <Button asChild variant="ghost" size="sm" className="h-6 px-1.5">
                        <Link href={`/admin/gallery/${p.id}`}>
                          <Pencil className="w-3 h-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
