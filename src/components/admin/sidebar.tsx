"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Star,
  Clock,
  Image,
  Users,
  Package,
  ClipboardCheck,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/admin/specials", label: "Weekly Specials", icon: Star },
  { href: "/admin/hours", label: "Hours", icon: Clock },
  { href: "/admin/gallery", label: "Gallery", icon: Image },
  { href: "/admin/catalog", label: "Wholesale Catalog", icon: Package },
  { href: "/admin/accounts", label: "Wholesale Accounts", icon: Users },
  { href: "/admin/review-queue", label: "Review Queue", icon: ClipboardCheck },
  { href: "/admin/users", label: "Staff Users", icon: Users },
];

export function AdminSidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();

  // Role-based nav filtering
  const visibleNav = NAV.filter((item) => {
    if (userRole === "baker_retail") {
      return ["/admin", "/admin/review-queue"].includes(item.href);
    }
    if (userRole === "baker_wholesale") {
      return ["/admin", "/admin/catalog", "/admin/accounts"].includes(item.href);
    }
    return true; // admin sees all
  });

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col h-full min-h-screen">
      <div className="p-5 border-b border-sidebar-border">
        <Link href="/" className="block">
          <p className="font-heading text-xl font-bold text-sidebar-primary-foreground">
            Sassy&apos;s
          </p>
          <p className="text-xs opacity-60 mt-0.5">Admin Panel</p>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {visibleNav.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
