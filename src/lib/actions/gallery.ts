"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { galleryPhotos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session || !["admin", "baker_retail", "baker_wholesale"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }
}

const photoSchema = z.object({
  imageKey: z.string().min(1, "An image is required"),
  caption: z.string().max(500).optional(),
  category: z.enum(["cakes", "breads", "storefront", "catering"]),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

function parsePhoto(fd: FormData) {
  return photoSchema.parse({
    imageKey: fd.get("imageKey"),
    caption: (fd.get("caption") as string) || undefined,
    category: fd.get("category"),
    sortOrder: fd.get("sortOrder"),
    isActive: fd.get("isActive") === "on",
  });
}

export async function createPhoto(fd: FormData) {
  await requireAdmin();
  const data = parsePhoto(fd);
  await db.insert(galleryPhotos).values(data);
  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}

export async function updatePhoto(id: string, fd: FormData) {
  await requireAdmin();
  const data = parsePhoto(fd);
  await db.update(galleryPhotos).set(data).where(eq(galleryPhotos.id, id));
  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}

export async function deletePhoto(id: string) {
  await requireAdmin();
  await db.delete(galleryPhotos).where(eq(galleryPhotos.id, id));
  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}
