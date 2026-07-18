import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserForm } from "@/components/admin/user-form";
import { UserStatusActions } from "@/components/admin/user-status-actions";
import { updateUser } from "@/lib/actions/users";
import { auth } from "@/lib/auth";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "admin") redirect("/admin");

  const { id } = await params;
  const [user] = await db.select().from(users).where(eq(users.id, id));
  if (!user || user.role === "wholesale_customer") notFound();

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/users"><ArrowLeft className="w-4 h-4 mr-1" /> Staff Users</Link>
        </Button>
        <h1 className="font-heading text-2xl font-bold">Edit Staff User</h1>
        <Badge variant={user.isActive ? "default" : "secondary"} className="text-xs">
          {user.isActive ? "Active" : "Disabled"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Account Status</CardTitle>
        </CardHeader>
        <CardContent>
          <UserStatusActions userId={user.id} isActive={user.isActive} />
        </CardContent>
      </Card>

      <UserForm
        user={{ name: user.name, email: user.email, role: user.role }}
        action={updateUser.bind(null, id)}
      />
    </div>
  );
}
