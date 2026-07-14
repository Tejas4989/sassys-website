import { db } from "@/db/client";
import { wholesaleCategories } from "@/db/schema";
import { asc } from "drizzle-orm";
import { createWholesaleItem } from "@/lib/actions/wholesale-catalog";
import { WholesaleItemForm } from "@/components/admin/wholesale-item-form";

export default async function NewWholesaleItemPage({ searchParams }: { searchParams: Promise<{ categoryId?: string }> }) {
  const { categoryId } = await searchParams;
  const categories = await db.select().from(wholesaleCategories).orderBy(asc(wholesaleCategories.sortOrder));
  return (
    <div className="max-w-xl">
      <h1 className="font-heading text-2xl font-bold mb-6">New Wholesale Item</h1>
      <WholesaleItemForm
        categories={categories}
        defaultCategoryId={categoryId ? parseInt(categoryId) : undefined}
        action={createWholesaleItem}
      />
    </div>
  );
}
