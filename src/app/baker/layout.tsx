import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { signOut } from "next-auth/react";

const ALLOWED = ["admin", "baker_retail", "baker_wholesale"];

export default async function BakerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || !ALLOWED.includes(session.user.role)) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-[oklch(0.32_0.06_45)] text-[oklch(0.93_0.02_80)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-heading font-bold text-lg">Sassy&apos;s</span>
          <nav className="flex gap-3 text-sm opacity-80">
            {(session.user.role === "baker_retail" ||
              session.user.role === "admin") && (
              <Link href="/baker/retail" className="hover:opacity-100">
                Retail Queue
              </Link>
            )}
            {(session.user.role === "baker_wholesale" ||
              session.user.role === "admin") && (
              <Link href="/baker/wholesale" className="hover:opacity-100">
                Wholesale Queue
              </Link>
            )}
            <Link href="/admin" className="hover:opacity-100">
              Admin
            </Link>
          </nav>
        </div>
        <span className="text-xs opacity-60">{session.user.name}</span>
      </header>
      <main className="p-4 md:p-6 max-w-4xl mx-auto">{children}</main>
    </div>
  );
}
