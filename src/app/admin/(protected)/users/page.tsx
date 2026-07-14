import { db } from "@/db/client";
import { users } from "@/db/schema";
import { asc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  baker_retail: "Retail Baker",
  baker_wholesale: "Wholesale Baker",
  wholesale_customer: "Wholesale Customer",
};

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user.role !== "admin") redirect("/admin");

  const allUsers = await db
    .select()
    .from(users)
    .orderBy(asc(users.createdAt));

  const staffUsers = allUsers.filter((u) => u.role !== "wholesale_customer");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">Staff Users</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage admin and baker accounts. Wholesale customer accounts live under Wholesale Accounts.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/users/new">
            <Plus className="w-4 h-4 mr-1" /> Add User
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Role</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {staffUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-8 text-muted-foreground">
                  No staff users yet.
                </td>
              </tr>
            )}
            {staffUsers.map((u, i) => (
              <tr key={u.id} className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3 text-muted-foreground">{u.email}</td>
                <td className="p-3">
                  <Badge variant="outline" className="text-xs">
                    {ROLE_LABELS[u.role] ?? u.role}
                  </Badge>
                </td>
                <td className="p-3 text-center">
                  <Badge variant={u.isActive ? "default" : "secondary"} className="text-xs">
                    {u.isActive ? "Active" : "Disabled"}
                  </Badge>
                </td>
                <td className="p-3 text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/users/${u.id}`}>
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
