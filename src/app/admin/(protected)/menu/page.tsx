import { db } from "@/db/client";
import { menuCategories, menuItems } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { revalidateTag } from "next/cache";

export default async function AdminMenuPage() {
  const cats = await db
    .select()
    .from(menuCategories)
    .orderBy(asc(menuCategories.sortOrder));

  const items = await db
    .select()
    .from(menuItems)
    .orderBy(asc(menuItems.sortOrder));

  const byCategory = cats.map((c) => ({
    ...c,
    items: items.filter((i) => i.categoryId === c.id),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">Menu</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage retail menu categories and items.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/menu/categories/new">
              <Plus className="w-4 h-4 mr-1" /> Category
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/menu/items/new">
              <Plus className="w-4 h-4 mr-1" /> Item
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {byCategory.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border rounded-xl text-muted-foreground">
            <p className="text-lg font-medium mb-2">No categories yet</p>
            <p className="text-sm mb-4">Add a category first, then add items.</p>
            <Button asChild variant="outline">
              <Link href="/admin/menu/categories/new">
                <Plus className="w-4 h-4 mr-1" /> Add Category
              </Link>
            </Button>
          </div>
        )}

        {byCategory.map((cat) => (
          <section key={cat.id}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-xl font-semibold">
                  {cat.name}
                </h2>
                <Badge variant={cat.isActive ? "default" : "secondary"}>
                  {cat.isActive ? "Active" : "Hidden"}
                </Badge>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/admin/menu/categories/${cat.id}`}>
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                </Link>
              </Button>
            </div>

            {cat.items.length === 0 ? (
              <p className="text-sm text-muted-foreground pl-1">
                No items in this category.{" "}
                <Link href={`/admin/menu/items/new?categoryId=${cat.id}`} className="text-primary hover:underline">
                  Add one →
                </Link>
              </p>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Price</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
                      <th className="p-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {cat.items.map((item, i) => (
                      <tr
                        key={item.id}
                        className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}
                      >
                        <td className="p-3 font-medium">{item.name}</td>
                        <td className="p-3 text-right text-muted-foreground">
                          ${(item.priceCents / 100).toFixed(2)}
                        </td>
                        <td className="p-3 text-center">
                          <Badge
                            variant={item.isActive ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {item.isActive ? "Active" : "Hidden"}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/admin/menu/items/${item.id}`}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
