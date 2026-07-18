import { db } from "@/db/client";
import { wholesaleCustomers, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EditAccountClient } from "@/components/admin/edit-account-client";

export default async function EditWholesaleAccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const [row] = await db
    .select({ customer: wholesaleCustomers, user: users })
    .from(wholesaleCustomers)
    .innerJoin(users, eq(wholesaleCustomers.userId, users.id))
    .where(eq(wholesaleCustomers.id, id));
  if (!row) notFound();

  const account = {
    businessName: row.customer.businessName,
    name: row.user.name,
    email: row.user.email,
    contactPhone: row.customer.contactPhone,
    address: row.customer.address,
    defaultFulfillment: row.customer.defaultFulfillment,
    defaultDeliveryDay: row.customer.defaultDeliveryDay,
    notes: row.customer.notes,
  };

  return (
    <EditAccountClient
      id={id}
      account={account}
      created={sp.created === "1"}
      initialPasscode={sp.passcode ?? ""}
    />
  );
}
