"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/db/client";
import { hours as hoursTable, holidayOverrides } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") throw new Error("Unauthorized");
}

const hourSchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  opensAt: z.string().regex(/^\d{1,2}:\d{2}$/),
  closesAt: z.string().regex(/^\d{1,2}:\d{2}$/),
  isClosed: z.boolean(),
});

export async function saveHours(rows: Array<z.infer<typeof hourSchema>>) {
  await requireAdmin();
  for (const row of rows) {
    const validated = hourSchema.parse(row);
    // Upsert by dayOfWeek
    const existing = await db
      .select()
      .from(hoursTable)
      .where(eq(hoursTable.dayOfWeek, validated.dayOfWeek))
      .limit(1);
    if (existing.length > 0) {
      await db
        .update(hoursTable)
        .set(validated)
        .where(eq(hoursTable.dayOfWeek, validated.dayOfWeek));
    } else {
      await db.insert(hoursTable).values(validated);
    }
  }
  revalidateTag("hours", { expire: 0 });
}

const overrideSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  label: z.string().min(1).max(100),
  isClosed: z.boolean(),
  opensAt: z.string().optional(),
  closesAt: z.string().optional(),
});

export async function createHolidayOverride(fd: FormData) {
  await requireAdmin();
  const data = overrideSchema.parse({
    date: fd.get("date"),
    label: fd.get("label"),
    isClosed: fd.get("isClosed") === "on",
    opensAt: (fd.get("opensAt") as string) || undefined,
    closesAt: (fd.get("closesAt") as string) || undefined,
  });
  await db
    .insert(holidayOverrides)
    .values(data)
    .onConflictDoUpdate({ target: holidayOverrides.date, set: data });
  revalidateTag("hours", { expire: 0 });
}

export async function deleteHolidayOverride(id: string) {
  await requireAdmin();
  await db.delete(holidayOverrides).where(eq(holidayOverrides.id, id));
  revalidateTag("hours", { expire: 0 });
}
