import { createCategory } from "@/lib/actions/menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

export default function NewMenuCategoryPage() {
  return (
    <div className="max-w-md">
      <h1 className="font-heading text-2xl font-bold mb-6">New Menu Category</h1>
      <form action={createCategory} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" required placeholder="Pastries" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" name="slug" required placeholder="pastries" pattern="[a-z0-9-]+" />
          <p className="text-xs text-muted-foreground">Lowercase letters, numbers, hyphens only.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input id="sortOrder" name="sortOrder" type="number" defaultValue="0" className="w-24" />
        </div>
        <div className="flex items-center gap-3">
          <Switch id="isActive" name="isActive" defaultChecked />
          <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="submit">Create Category</Button>
          <Button asChild variant="outline"><Link href="/admin/menu">Cancel</Link></Button>
        </div>
      </form>
    </div>
  );
}
