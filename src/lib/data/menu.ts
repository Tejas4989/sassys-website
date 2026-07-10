import { db } from "@/db/client";
import { menuCategories, menuItems } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { FALLBACK_MENU, type MenuCategoryWithItems } from "./fallback-content";

export async function getMenuWithCategories(): Promise<MenuCategoryWithItems[]> {
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

    if (cats.length === 0) return FALLBACK_MENU;

    return cats.map((cat) => ({
      ...cat,
      items: items.filter((i) => i.categoryId === cat.id),
    }));
  } catch {
    return FALLBACK_MENU;
  }
}
