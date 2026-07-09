"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { menuCategories, menuItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session || !["admin", "baker_retail"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }
}

// ─── Categories ──────────────────────────────────────────────────────────────

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function createCategory(fd: FormData) {
  await requireAdmin();
  const data = categorySchema.parse({
    name: fd.get("name"),
    slug: fd.get("slug"),
    sortOrder: fd.get("sortOrder"),
    isActive: fd.get("isActive") === "on",
  });
  await db.insert(menuCategories).values(data);
  revalidateTag("menu", { expire: 0 });
  redirect("/admin/menu");
}

export async function updateCategory(id: number, fd: FormData) {
  await requireAdmin();
  const data = categorySchema.parse({
    name: fd.get("name"),
    slug: fd.get("slug"),
    sortOrder: fd.get("sortOrder"),
    isActive: fd.get("isActive") === "on",
  });
  await db.update(menuCategories).set(data).where(eq(menuCategories.id, id));
  revalidateTag("menu", { expire: 0 });
  redirect("/admin/menu");
}

// ─── Menu items ───────────────────────────────────────────────────────────────

const itemSchema = z.object({
  categoryId: z.coerce.number().int(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  priceCents: z.coerce.number().int().min(1),
  imageKey: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export async function createMenuItem(fd: FormData) {
  await requireAdmin();
  const data = itemSchema.parse({
    categoryId: fd.get("categoryId"),
    name: fd.get("name"),
    description: fd.get("description") || undefined,
    priceCents: Math.round(Number(fd.get("price")) * 100),
    imageKey: (fd.get("imageKey") as string) || undefined,
    isActive: fd.get("isActive") === "on",
    sortOrder: fd.get("sortOrder"),
  });
  await db.insert(menuItems).values(data);
  revalidateTag("menu", { expire: 0 });
  redirect("/admin/menu");
}

export async function updateMenuItem(id: string, fd: FormData) {
  await requireAdmin();
  const data = itemSchema.parse({
    categoryId: fd.get("categoryId"),
    name: fd.get("name"),
    description: fd.get("description") || undefined,
    priceCents: Math.round(Number(fd.get("price")) * 100),
    imageKey: (fd.get("imageKey") as string) || undefined,
    isActive: fd.get("isActive") === "on",
    sortOrder: fd.get("sortOrder"),
  });
  await db.update(menuItems).set({ ...data, updatedAt: new Date() }).where(eq(menuItems.id, id));
  revalidateTag("menu", { expire: 0 });
  redirect("/admin/menu");
}

export async function deleteMenuItem(id: string) {
  await requireAdmin();
  await db.update(menuItems).set({ isActive: false }).where(eq(menuItems.id, id));
  revalidateTag("menu", { expire: 0 });
  redirect("/admin/menu");
}
