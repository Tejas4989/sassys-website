import { createPhoto } from "@/lib/actions/gallery";
import { GalleryPhotoForm } from "@/components/admin/gallery-photo-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function UploadPhotoPage() {
  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/gallery"><ArrowLeft className="w-4 h-4 mr-1" /> Gallery</Link>
        </Button>
        <h1 className="font-heading text-2xl font-bold">Upload Photo</h1>
      </div>
      <GalleryPhotoForm action={createPhoto} />
    </div>
  );
}
