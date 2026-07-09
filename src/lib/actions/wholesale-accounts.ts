"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { users, wholesaleCustomers, adminAuditLog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { hash, verify } from "argon2";
import { auth } from "@/lib/auth";
import { sendWholesaleWelcome } from "@/lib/email";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") throw new Error("Unauthorized");
  return session;
}

function generatePasscode(): string {
  const digits = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(digits).map((d) => d % 10).join("");
}

const accountSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  businessName: z.string().min(1).max(200),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  defaultFulfillment: z.enum(["pickup", "delivery"]).default("pickup"),
  defaultDeliveryDay: z.string().optional(),
  notes: z.string().optional(),
});

export async function createWholesaleAccount(fd: FormData) {
  const session = await requireAdmin();

  const data = accountSchema.parse({
    name: fd.get("name"),
    email: fd.get("email"),
    businessName: fd.get("businessName"),
    contactPhone: (fd.get("contactPhone") as string) || undefined,
    address: (fd.get("address") as string) || undefined,
    defaultFulfillment: fd.get("defaultFulfillment") ?? "pickup",
    defaultDeliveryDay: (fd.get("defaultDeliveryDay") as string) || undefined,
    notes: (fd.get("notes") as string) || undefined,
  });

  const passcode = generatePasscode();
  const passcodeHash = await hash(passcode);

  // Create user record
  const [user] = await db
    .insert(users)
    .values({
      email: data.email.toLowerCase(),
      role: "wholesale_customer",
      name: data.name,
      isActive: true,
    })
    .returning();

  // Create wholesale customer record
  const [customer] = await db
    .insert(wholesaleCustomers)
    .values({
      userId: user.id,
      businessName: data.businessName,
      contactPhone: data.contactPhone,
      address: data.address,
      defaultFulfillment: data.defaultFulfillment,
      defaultDeliveryDay: data.defaultDeliveryDay,
      passcodeHash,
      passcodeMustChange: true,
      notes: data.notes,
    })
    .returning();

  // Log
  await db.insert(adminAuditLog).values({
    actorId: session.user.id as string,
    action: "account_created",
    targetId: customer.id,
    metadata: { email: data.email, businessName: data.businessName },
  });

  // Send welcome email with initial passcode
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://mysassys.com";
  sendWholesaleWelcome({
    to: data.email,
    name: data.name,
    businessName: data.businessName,
    passcode,
    loginUrl: `${appUrl}/wholesale/login`,
  }).catch(console.error);

  // Redirect to the account page showing the initial passcode
  redirect(`/admin/accounts/${customer.id}?created=1&passcode=${passcode}`);
}

export async function updateWholesaleAccount(customerId: string, fd: FormData) {
  await requireAdmin();

  const data = accountSchema.parse({
    name: fd.get("name"),
    email: fd.get("email"),
    businessName: fd.get("businessName"),
    contactPhone: (fd.get("contactPhone") as string) || undefined,
    address: (fd.get("address") as string) || undefined,
    defaultFulfillment: fd.get("defaultFulfillment") ?? "pickup",
    defaultDeliveryDay: (fd.get("defaultDeliveryDay") as string) || undefined,
    notes: (fd.get("notes") as string) || undefined,
  });

  const [customer] = await db
    .select()
    .from(wholesaleCustomers)
    .where(eq(wholesaleCustomers.id, customerId));
  if (!customer) throw new Error("Account not found");

  await db
    .update(users)
    .set({ name: data.name, email: data.email.toLowerCase(), updatedAt: new Date() })
    .where(eq(users.id, customer.userId));

  await db
    .update(wholesaleCustomers)
    .set({
      businessName: data.businessName,
      contactPhone: data.contactPhone,
      address: data.address,
      defaultFulfillment: data.defaultFulfillment,
      defaultDeliveryDay: data.defaultDeliveryDay,
      notes: data.notes,
      updatedAt: new Date(),
    })
    .where(eq(wholesaleCustomers.id, customerId));

  revalidatePath("/admin/accounts");
  redirect("/admin/accounts");
}

export async function toggleWholesaleAccount(customerId: string, isActive: boolean) {
  const session = await requireAdmin();

  const [customer] = await db
    .select()
    .from(wholesaleCustomers)
    .where(eq(wholesaleCustomers.id, customerId));
  if (!customer) throw new Error("Not found");

  await db.update(users).set({ isActive, updatedAt: new Date() }).where(eq(users.id, customer.userId));

  await db.insert(adminAuditLog).values({
    actorId: session.user.id as string,
    action: isActive ? "account_enabled" : "account_disabled",
    targetId: customerId,
  });

  revalidatePath(`/admin/accounts/${customerId}`);
  revalidatePath("/admin/accounts");
}

export async function rotatePasscode(customerId: string) {
  const session = await requireAdmin();

  const [customer] = await db
    .select()
    .from(wholesaleCustomers)
    .where(eq(wholesaleCustomers.id, customerId));
  if (!customer) throw new Error("Not found");

  const newPasscode = generatePasscode();
  const passcodeHash = await hash(newPasscode);

  await db
    .update(wholesaleCustomers)
    .set({ passcodeHash, passcodeMustChange: true, updatedAt: new Date() })
    .where(eq(wholesaleCustomers.id, customerId));

  await db.insert(adminAuditLog).values({
    actorId: session.user.id as string,
    action: "passcode_rotated",
    targetId: customerId,
  });

  // Return the new passcode so admin can see it once
  return newPasscode;
}

// Called by the wholesale customer to change their own passcode on first login
export async function changeOwnPasscode(newPasscode: string) {
  const session = await auth();
  if (!session || session.user.role !== "wholesale_customer") throw new Error("Unauthorized");

  const customerId = (session as any).wholesaleCustomerId as string;
  if (!customerId) throw new Error("No customer ID");

  if (!/^\d{6}$/.test(newPasscode)) throw new Error("Passcode must be exactly 6 digits");

  const passcodeHash = await hash(newPasscode);
  await db
    .update(wholesaleCustomers)
    .set({ passcodeHash, passcodeMustChange: false, updatedAt: new Date() })
    .where(eq(wholesaleCustomers.id, customerId));
}
