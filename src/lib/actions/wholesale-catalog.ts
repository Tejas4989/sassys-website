"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { wholesaleCategories, wholesaleItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session || !["admin", "baker_wholesale"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }
}

// ─── Categories ──────────────────────────────────────────────────────────────

const catSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function createWholesaleCategory(fd: FormData) {
  await requireAdmin();
  const data = catSchema.parse({
    name: fd.get("name"),
    slug: fd.get("slug"),
    sortOrder: fd.get("sortOrder"),
    isActive: fd.get("isActive") === "on",
  });
  await db.insert(wholesaleCategories).values(data);
  revalidatePath("/admin/catalog");
  redirect("/admin/catalog");
}

export async function updateWholesaleCategory(id: number, fd: FormData) {
  await requireAdmin();
  const data = catSchema.parse({
    name: fd.get("name"),
    slug: fd.get("slug"),
    sortOrder: fd.get("sortOrder"),
    isActive: fd.get("isActive") === "on",
  });
  await db.update(wholesaleCategories).set(data).where(eq(wholesaleCategories.id, id));
  revalidatePath("/admin/catalog");
  redirect("/admin/catalog");
}

// ─── Items ────────────────────────────────────────────────────────────────────

const itemSchema = z.object({
  categoryId: z.coerce.number().int(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  wholesalePriceCents: z.coerce.number().int().min(1),
  moq: z.coerce.number().int().min(1).default(1),
  caseSize: z.coerce.number().int().min(1).default(1),
  availabilityDays: z.array(z.string()).default([
    "monday","tuesday","wednesday","thursday","friday","saturday","sunday",
  ]),
  imageKey: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export async function createWholesaleItem(fd: FormData) {
  await requireAdmin();
  const availDays = (fd.getAll("availabilityDays") as string[]).length > 0
    ? fd.getAll("availabilityDays") as string[]
    : ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

  const data = itemSchema.parse({
    categoryId: fd.get("categoryId"),
    name: fd.get("name"),
    description: (fd.get("description") as string) || undefined,
    wholesalePriceCents: Math.round(Number(fd.get("wholesalePrice")) * 100),
    moq: fd.get("moq"),
    caseSize: fd.get("caseSize"),
    availabilityDays: availDays,
    imageKey: (fd.get("imageKey") as string) || undefined,
    isActive: fd.get("isActive") === "on",
    sortOrder: fd.get("sortOrder"),
  });
  await db.insert(wholesaleItems).values(data);
  revalidatePath("/admin/catalog");
  redirect("/admin/catalog");
}

export async function updateWholesaleItem(id: string, fd: FormData) {
  await requireAdmin();
  const availDays = (fd.getAll("availabilityDays") as string[]).length > 0
    ? fd.getAll("availabilityDays") as string[]
    : ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

  const data = itemSchema.parse({
    categoryId: fd.get("categoryId"),
    name: fd.get("name"),
    description: (fd.get("description") as string) || undefined,
    wholesalePriceCents: Math.round(Number(fd.get("wholesalePrice")) * 100),
    moq: fd.get("moq"),
    caseSize: fd.get("caseSize"),
    availabilityDays: availDays,
    imageKey: (fd.get("imageKey") as string) || undefined,
    isActive: fd.get("isActive") === "on",
    sortOrder: fd.get("sortOrder"),
  });
  await db.update(wholesaleItems).set({ ...data, updatedAt: new Date() }).where(eq(wholesaleItems.id, id));
  revalidatePath("/admin/catalog");
  redirect("/admin/catalog");
}
