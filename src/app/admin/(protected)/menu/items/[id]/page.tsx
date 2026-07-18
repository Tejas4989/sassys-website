import { db } from "@/db/client";
import { menuCategories, menuItems } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateMenuItem } from "@/lib/actions/menu";
import { MenuItemForm } from "@/components/admin/menu-item-form";

export default async function EditMenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
  if (!item) notFound();

  const categories = await db
    .select()
    .from(menuCategories)
    .orderBy(asc(menuCategories.sortOrder));

  return (
    <div className="max-w-xl">
      <h1 className="font-heading text-2xl font-bold mb-6">Edit Menu Item</h1>
      <MenuItemForm
        categories={categories}
        item={item}
        action={updateMenuItem.bind(null, id)}
      />
    </div>
  );
}
