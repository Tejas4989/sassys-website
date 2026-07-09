import { db } from "@/db/client";
import { wholesaleCustomers, users } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";

export default async function AdminAccountsPage() {
  const accounts = await db
    .select({ customer: wholesaleCustomers, user: users })
    .from(wholesaleCustomers)
    .innerJoin(users, eq(wholesaleCustomers.userId, users.id))
    .orderBy(asc(wholesaleCustomers.businessName))
    .catch(() => []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">Wholesale Accounts</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage B2B customer accounts and access.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/accounts/new"><Plus className="w-4 h-4 mr-1" /> New Account</Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">Business</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Contact</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-8 text-muted-foreground">
                  No wholesale accounts yet.{" "}
                  <Link href="/admin/accounts/new" className="text-primary hover:underline">Create one →</Link>
                </td>
              </tr>
            )}
            {accounts.map(({ customer, user }, i) => (
              <tr key={customer.id} className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                <td className="p-3 font-medium">{customer.businessName}</td>
                <td className="p-3 text-muted-foreground">{user.name}</td>
                <td className="p-3 text-muted-foreground">{user.email}</td>
                <td className="p-3 text-center">
                  <Badge variant={user.isActive ? "default" : "secondary"} className="text-xs">
                    {user.isActive ? "Active" : "Disabled"}
                  </Badge>
                  {customer.passcodeMustChange && (
                    <Badge variant="outline" className="text-xs ml-1 border-amber-400 text-amber-700">
                      Must change passcode
                    </Badge>
                  )}
                </td>
                <td className="p-3 text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/accounts/${customer.id}`}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
