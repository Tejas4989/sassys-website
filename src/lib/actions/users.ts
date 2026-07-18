"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { users, adminAuditLog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { hashPassword } from "@/lib/password";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") throw new Error("Unauthorized");
  return session;
}

// Staff roles only — wholesale customers are managed under Wholesale Accounts.
const STAFF_ROLES = ["admin", "baker_retail", "baker_wholesale"] as const;

const createSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  role: z.enum(STAFF_ROLES),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const updateSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  role: z.enum(STAFF_ROLES),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

export async function createUser(fd: FormData) {
  const session = await requireAdmin();

  const data = createSchema.parse({
    name: fd.get("name"),
    email: fd.get("email"),
    role: fd.get("role"),
    password: fd.get("password"),
  });

  const passwordHash = await hashPassword(data.password);

  const [user] = await db
    .insert(users)
    .values({
      email: data.email.toLowerCase(),
      role: data.role,
      name: data.name,
      passwordHash,
      isActive: true,
    })
    .returning();

  await db.insert(adminAuditLog).values({
    actorId: session.user.id as string,
    action: "user_created",
    targetId: user.id,
    metadata: { email: data.email, role: data.role },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function updateUser(userId: string, fd: FormData) {
  const session = await requireAdmin();

  const rawPassword = (fd.get("password") as string) || undefined;
  const data = updateSchema.parse({
    name: fd.get("name"),
    email: fd.get("email"),
    role: fd.get("role"),
    password: rawPassword,
  });

  const [existing] = await db.select().from(users).where(eq(users.id, userId));
  if (!existing) throw new Error("User not found");
  if (existing.role === "wholesale_customer") throw new Error("Not a staff user");

  await db
    .update(users)
    .set({
      name: data.name,
      email: data.email.toLowerCase(),
      role: data.role,
      ...(data.password ? { passwordHash: await hashPassword(data.password) } : {}),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  await db.insert(adminAuditLog).values({
    actorId: session.user.id as string,
    action: "user_updated",
    targetId: userId,
    metadata: { email: data.email, role: data.role },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function toggleUser(userId: string, isActive: boolean) {
  const session = await requireAdmin();

  const [existing] = await db.select().from(users).where(eq(users.id, userId));
  if (!existing) throw new Error("User not found");

  await db
    .update(users)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(users.id, userId));

  await db.insert(adminAuditLog).values({
    actorId: session.user.id as string,
    action: isActive ? "user_enabled" : "user_disabled",
    targetId: userId,
  });

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
}
