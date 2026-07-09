"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { weeklySpecials } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session || !["admin", "baker_retail"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }
}

const specialSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1), // HTML from TipTap
  imageKey: z.string().optional(),
  startsOn: z.coerce.date(),
  endsOn: z.coerce.date(),
  isActive: z.boolean().default(true),
});

export async function createSpecial(fd: FormData) {
  await requireAdmin();
  const data = specialSchema.parse({
    title: fd.get("title"),
    body: fd.get("body"),
    imageKey: (fd.get("imageKey") as string) || undefined,
    startsOn: fd.get("startsOn"),
    endsOn: fd.get("endsOn"),
    isActive: fd.get("isActive") === "on",
  });
  await db.insert(weeklySpecials).values(data);
  revalidateTag("specials", { expire: 0 });
  redirect("/admin/specials");
}

export async function updateSpecial(id: string, fd: FormData) {
  await requireAdmin();
  const data = specialSchema.parse({
    title: fd.get("title"),
    body: fd.get("body"),
    imageKey: (fd.get("imageKey") as string) || undefined,
    startsOn: fd.get("startsOn"),
    endsOn: fd.get("endsOn"),
    isActive: fd.get("isActive") === "on",
  });
  await db
    .update(weeklySpecials)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(weeklySpecials.id, id));
  revalidateTag("specials", { expire: 0 });
  redirect("/admin/specials");
}

export async function deleteSpecial(id: string) {
  await requireAdmin();
  await db.update(weeklySpecials).set({ isActive: false }).where(eq(weeklySpecials.id, id));
  revalidateTag("specials", { expire: 0 });
  redirect("/admin/specials");
}
