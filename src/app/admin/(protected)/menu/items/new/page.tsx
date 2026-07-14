import { db } from "@/db/client";
import { menuCategories } from "@/db/schema";
import { asc } from "drizzle-orm";
import { createMenuItem } from "@/lib/actions/menu";
import { MenuItemForm } from "@/components/admin/menu-item-form";

export default async function NewMenuItemPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string }>;
}) {
  const { categoryId } = await searchParams;
  const categories = await db
    .select()
    .from(menuCategories)
    .orderBy(asc(menuCategories.sortOrder));

  return (
    <div className="max-w-xl">
      <h1 className="font-heading text-2xl font-bold mb-6">New Menu Item</h1>
      <MenuItemForm
        categories={categories}
        defaultCategoryId={categoryId ? parseInt(categoryId) : undefined}
        action={createMenuItem}
      />
    </div>
  );
}
