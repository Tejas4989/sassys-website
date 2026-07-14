import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

const ALLOWED_ROLES = ["admin", "baker_retail", "baker_wholesale"];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  if (!ALLOWED_ROLES.includes(session.user.role)) {
    redirect("/");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar userRole={session.user.role} />
      <div className="flex-1 overflow-y-auto bg-muted/30">
        <main className="p-6 md:p-8 max-w-5xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
