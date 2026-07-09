"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "./image-upload";
import Link from "next/link";

const ALL_DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

interface Category { id: number; name: string; }
interface Item {
  id: string; categoryId: number; name: string; description?: string | null;
  wholesalePriceCents: number; moq: number; caseSize: number;
  availabilityDays?: string[] | null; imageKey?: string | null;
  isActive: boolean; sortOrder: number;
}

interface Props {
  categories: Category[];
  item?: Item;
  defaultCategoryId?: number;
  action: (fd: FormData) => Promise<void>;
}

export function WholesaleItemForm({ categories, item, defaultCategoryId, action }: Props) {
  const [imageKey, setImageKey] = useState(item?.imageKey ?? "");
  const [isActive, setIsActive] = useState(item?.isActive ?? true);
  const [availDays, setAvailDays] = useState<string[]>(
    item?.availabilityDays ?? ALL_DAYS
  );

  function toggleDay(day: string) {
    setAvailDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleSubmit(fd: FormData) {
    fd.set("imageKey", imageKey);
    fd.set("isActive", isActive ? "on" : "off");
    // availabilityDays are appended below
    availDays.forEach((d) => fd.append("availabilityDays", d));
    await action(fd);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Category *</Label>
        <Select name="categoryId" defaultValue={String(item?.categoryId ?? defaultCategoryId ?? categories[0]?.id)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Item Name *</Label>
        <Input id="name" name="name" required defaultValue={item?.name} placeholder="Sourdough Loaf" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="wholesalePrice">Price ($) *</Label>
          <Input id="wholesalePrice" name="wholesalePrice" type="number" step="0.01" min="0" required
            defaultValue={item ? (item.wholesalePriceCents / 100).toFixed(2) : ""} placeholder="3.50" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="moq">Min Order Qty</Label>
          <Input id="moq" name="moq" type="number" min="1" defaultValue={item?.moq ?? 1} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="caseSize">Case Size</Label>
          <Input id="caseSize" name="caseSize" type="number" min="1" defaultValue={item?.caseSize ?? 1} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={2} defaultValue={item?.description ?? ""} />
      </div>

      <div className="space-y-2">
        <Label>Available Days</Label>
        <div className="flex flex-wrap gap-2">
          {ALL_DAYS.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${availDays.includes(day) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}
            >
              {day.slice(0, 3).toUpperCase()}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Days this item is available for ordering.</p>
      </div>

      <div className="space-y-1.5">
        <Label>Photo</Label>
        <ImageUpload folder="catalog" currentKey={imageKey} onUpload={setImageKey} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input id="sortOrder" name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
        <Label htmlFor="isActive" className="cursor-pointer">
          {isActive ? "Active (visible to wholesale customers)" : "Hidden"}
        </Label>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit">Save</Button>
        <Button asChild variant="outline"><Link href="/admin/catalog">Cancel</Link></Button>
      </div>
    </form>
  );
}
