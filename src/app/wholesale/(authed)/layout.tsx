import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { ShoppingBag, History, BookOpen, LogOut } from "lucide-react";
import { SignOutButton } from "@/components/wholesale/sign-out-button";

export default async function WholesaleAuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "wholesale_customer") {
    redirect("/wholesale/login");
  }

  // If first login, force passcode change
  if ((session as any).passcodeMustChange) {
    redirect("/wholesale/change-passcode");
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "oklch(0.97 0.012 85)" }}>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
          <Link href="/wholesale" className="font-heading text-lg font-bold text-primary">
            Sassy&apos;s Wholesale
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/wholesale"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Order</span>
            </Link>
            <Link
              href="/wholesale/history"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </Link>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
