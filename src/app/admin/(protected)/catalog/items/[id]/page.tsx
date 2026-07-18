import { db } from "@/db/client";
import { wholesaleCategories, wholesaleItems } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateWholesaleItem } from "@/lib/actions/wholesale-catalog";
import { WholesaleItemForm } from "@/components/admin/wholesale-item-form";

export default async function EditWholesaleItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item] = await db.select().from(wholesaleItems).where(eq(wholesaleItems.id, id));
  if (!item) notFound();
  const categories = await db.select().from(wholesaleCategories).orderBy(asc(wholesaleCategories.sortOrder));
  return (
    <div className="max-w-xl">
      <h1 className="font-heading text-2xl font-bold mb-6">Edit Wholesale Item</h1>
      <WholesaleItemForm categories={categories} item={item} action={updateWholesaleItem.bind(null, id)} />
    </div>
  );
}
