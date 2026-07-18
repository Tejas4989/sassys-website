import { db } from "@/db/client";
import { menuCategories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateCategory } from "@/lib/actions/menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

export default async function EditMenuCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categoryId = Number(id);
  if (!Number.isInteger(categoryId)) notFound();

  const [cat] = await db.select().from(menuCategories).where(eq(menuCategories.id, categoryId));
  if (!cat) notFound();

  return (
    <div className="max-w-md">
      <h1 className="font-heading text-2xl font-bold mb-6">Edit Menu Category</h1>
      <form action={updateCategory.bind(null, categoryId)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" required defaultValue={cat.name} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" name="slug" required defaultValue={cat.slug} pattern="[a-z0-9-]+" />
          <p className="text-xs text-muted-foreground">Lowercase letters, numbers, hyphens only.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input id="sortOrder" name="sortOrder" type="number" defaultValue={cat.sortOrder} className="w-24" />
        </div>
        <div className="flex items-center gap-3">
          <Switch id="isActive" name="isActive" defaultChecked={cat.isActive} />
          <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="submit">Save Changes</Button>
          <Button asChild variant="outline"><Link href="/admin/menu">Cancel</Link></Button>
        </div>
      </form>
    </div>
  );
}
