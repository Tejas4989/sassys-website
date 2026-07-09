"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "./image-upload";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
}

interface Item {
  id: string;
  categoryId: number;
  name: string;
  description?: string | null;
  priceCents: number;
  imageKey?: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface Props {
  categories: Category[];
  item?: Item;
  defaultCategoryId?: number;
  action: (fd: FormData) => Promise<void>;
}

export function MenuItemForm({ categories, item, defaultCategoryId, action }: Props) {
  const [imageKey, setImageKey] = useState(item?.imageKey ?? "");
  const [isActive, setIsActive] = useState(item?.isActive ?? true);

  async function handleSubmit(fd: FormData) {
    fd.set("imageKey", imageKey);
    fd.set("isActive", isActive ? "on" : "off");
    await action(fd);
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="categoryId">Category *</Label>
        <Select name="categoryId" defaultValue={String(item?.categoryId ?? defaultCategoryId ?? categories[0]?.id)}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Item Name *</Label>
        <Input id="name" name="name" required defaultValue={item?.name} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="price">Price ($) *</Label>
        <Input
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={item ? (item.priceCents / 100).toFixed(2) : ""}
          placeholder="12.99"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={item?.description ?? ""}
          rows={3}
          placeholder="Ingredients, allergens, etc."
        />
      </div>

      <div className="space-y-1.5">
        <Label>Photo</Label>
        <ImageUpload
          folder="menu"
          currentKey={imageKey}
          onUpload={setImageKey}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sortOrder">Sort Order</Label>
        <Input id="sortOrder" name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} className="w-24" />
      </div>

      <div className="flex items-center gap-3">
        <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
        <Label htmlFor="isActive" className="cursor-pointer">
          {isActive ? "Active (visible on menu)" : "Hidden from menu"}
        </Label>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit">Save Item</Button>
        <Button asChild variant="outline">
          <Link href="/admin/menu">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
