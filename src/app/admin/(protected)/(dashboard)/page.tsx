import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { eq, count, and, gte } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ClipboardCheck, Package, ShoppingCart, Users } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await auth();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [retailToday, pendingReview, confirmedToday] = await Promise.all([
    db
      .select({ cnt: count() })
      .from(orders)
      .where(and(eq(orders.type, "retail"), gte(orders.createdAt, since))),
    db
      .select({ cnt: count() })
      .from(orders)
      .where(eq(orders.status, "pending_review")),
    db
      .select({ cnt: count() })
      .from(orders)
      .where(and(eq(orders.status, "confirmed"), gte(orders.createdAt, since))),
  ]);

  const stats = [
    {
      label: "Retail Orders Today",
      value: retailToday[0]?.cnt ?? 0,
      icon: ShoppingCart,
      href: "/baker/retail",
    },
    {
      label: "Confirmed Today",
      value: confirmedToday[0]?.cnt ?? 0,
      icon: Package,
      href: "/baker/retail",
    },
    {
      label: "Pending Review",
      value: pendingReview[0]?.cnt ?? 0,
      icon: ClipboardCheck,
      href: "/admin/review-queue",
      highlight: (pendingReview[0]?.cnt ?? 0) > 0,
    },
  ];

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-1">Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Welcome back, {session?.user.name}.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className={`hover:shadow-md transition-shadow ${s.highlight ? "border-destructive/50 bg-destructive/5" : ""}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <s.icon className="w-4 h-4" />
                  {s.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${s.highlight ? "text-destructive" : ""}`}>
                  {s.value}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="font-heading text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { href: "/admin/menu", label: "Edit Menu", desc: "Add or update menu items" },
          { href: "/admin/specials", label: "Update Specials", desc: "Set this week's specials" },
          { href: "/admin/hours", label: "Edit Hours", desc: "Update hours or holiday closures" },
          { href: "/admin/gallery", label: "Manage Gallery", desc: "Upload or organize photos" },
          { href: "/admin/catalog", label: "Wholesale Catalog", desc: "Manage wholesale items" },
          { href: "/admin/accounts", label: "Wholesale Accounts", desc: "Add or manage B2B customers" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="p-4 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow"
          >
            <p className="font-medium text-sm">{a.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
