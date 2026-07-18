import { createUser } from "@/lib/actions/users";
import { UserForm } from "@/components/admin/user-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewUserPage() {
  const session = await auth();
  if (session?.user.role !== "admin") redirect("/admin");

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/users"><ArrowLeft className="w-4 h-4 mr-1" /> Staff Users</Link>
        </Button>
        <h1 className="font-heading text-2xl font-bold">New Staff User</h1>
      </div>
      <UserForm action={createUser} />
    </div>
  );
}
