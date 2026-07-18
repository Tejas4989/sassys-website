import { db } from "@/db/client";
import { galleryPhotos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updatePhoto, deletePhoto } from "@/lib/actions/gallery";
import { GalleryPhotoForm } from "@/components/admin/gallery-photo-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditPhotoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [photo] = await db.select().from(galleryPhotos).where(eq(galleryPhotos.id, id));
  if (!photo) notFound();

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/gallery"><ArrowLeft className="w-4 h-4 mr-1" /> Gallery</Link>
        </Button>
        <h1 className="font-heading text-2xl font-bold">Edit Photo</h1>
      </div>
      <GalleryPhotoForm
        photo={photo}
        action={updatePhoto.bind(null, id)}
        deleteAction={deletePhoto.bind(null, id)}
      />
    </div>
  );
}
