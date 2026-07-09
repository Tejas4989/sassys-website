import { unstable_cache } from "next/cache";
import { db } from "@/db/client";
import { menuCategories, menuItems } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

export const getMenuWithCategories = unstable_cache(
  async () => {
    try {
      const cats = await db
        .select()
        .from(menuCategories)
        .where(eq(menuCategories.isActive, true))
        .orderBy(asc(menuCategories.sortOrder));

      const items = await db
        .select()
        .from(menuItems)
        .where(and(eq(menuItems.isActive, true)))
        .orderBy(asc(menuItems.sortOrder));

      return cats.map((cat) => ({
        ...cat,
        items: items.filter((i) => i.categoryId === cat.id),
      }));
    } catch {
      return [];
    }
  },
  ["menu"],
  { revalidate: 60, tags: ["menu"] }
);
