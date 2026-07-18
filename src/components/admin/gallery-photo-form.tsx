"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { ImageUpload } from "./image-upload";
import Link from "next/link";

interface Photo {
  id: string;
  imageKey: string;
  caption?: string | null;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

interface Props {
  photo?: Photo;
  action: (fd: FormData) => Promise<void>;
  deleteAction?: () => Promise<void>;
}

const CATEGORIES = [
  { value: "cakes", label: "Cakes" },
  { value: "breads", label: "Breads" },
  { value: "storefront", label: "Storefront" },
  { value: "catering", label: "Catering" },
];

export function GalleryPhotoForm({ photo, action, deleteAction }: Props) {
  const [imageKey, setImageKey] = useState(photo?.imageKey ?? "");
  const [isActive, setIsActive] = useState(photo?.isActive ?? true);

  async function handleSubmit(fd: FormData) {
    fd.set("imageKey", imageKey);
    fd.set("isActive", isActive ? "on" : "off");
    await action(fd);
  }

  return (
    <div className="space-y-6">
      <form action={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label>Photo *</Label>
          <ImageUpload folder="gallery" currentKey={imageKey} onUpload={setImageKey} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="category">Category *</Label>
          <Select name="category" defaultValue={photo?.category ?? "storefront"}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="caption">Caption</Label>
          <Input id="caption" name="caption" defaultValue={photo?.caption ?? ""} placeholder="Optional description" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input id="sortOrder" name="sortOrder" type="number" defaultValue={photo?.sortOrder ?? 0} className="w-24" />
        </div>

        <div className="flex items-center gap-3">
          <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
          <Label htmlFor="isActive" className="cursor-pointer">
            {isActive ? "Visible on public gallery" : "Hidden"}
          </Label>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={!imageKey}>{photo ? "Save Photo" : "Add Photo"}</Button>
          <Button asChild variant="outline"><Link href="/admin/gallery">Cancel</Link></Button>
        </div>
      </form>

      {deleteAction && (
        <form action={deleteAction} className="border-t border-border pt-4">
          <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4 mr-1" /> Delete Photo
          </Button>
        </form>
      )}
    </div>
  );
}
