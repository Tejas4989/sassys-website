import { db } from "@/db/client";
import { weeklySpecials } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";

export default async function AdminSpecialsPage() {
  const specials = await db
    .select()
    .from(weeklySpecials)
    .orderBy(desc(weeklySpecials.startsOn));

  const now = new Date();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">Weekly Specials</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Add date-scoped specials that appear on the homepage.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/specials/new">
            <Plus className="w-4 h-4 mr-1" /> New Special
          </Link>
        </Button>
      </div>

      {specials.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl text-muted-foreground">
          <p className="text-lg font-medium mb-2">No specials yet</p>
          <p className="text-sm mb-4">Create your first weekly special to show on the homepage.</p>
          <Button asChild variant="outline">
            <Link href="/admin/specials/new">
              <Plus className="w-4 h-4 mr-1" /> Create Special
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {specials.map((s) => {
            const active = s.isActive && s.startsOn <= now && s.endsOn >= now;
            return (
              <div
                key={s.id}
                className="flex items-center gap-4 p-4 border border-border rounded-xl bg-card"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm">{s.title}</h3>
                    <Badge
                      variant={active ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {active ? "Live" : s.endsOn < now ? "Ended" : "Upcoming"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {s.startsOn.toLocaleDateString("en-CA")} –{" "}
                    {s.endsOn.toLocaleDateString("en-CA")}
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/specials/${s.id}`}>
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
