import { db } from "@/db/client";
import { hours, holidayOverrides } from "@/db/schema";
import { asc, gte } from "drizzle-orm";
import { HoursEditor } from "@/components/admin/hours-editor";

export default async function AdminHoursPage() {
  const [regularHours, upcoming] = await Promise.all([
    db.select().from(hours).orderBy(asc(hours.dayOfWeek)).catch(() => []),
    db
      .select()
      .from(holidayOverrides)
      .where(gte(holidayOverrides.date, new Date().toISOString().split("T")[0]))
      .catch(() => []),
  ]);

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-1">Hours</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Update regular hours and add holiday closures.
      </p>
      <HoursEditor initialHours={regularHours} initialOverrides={upcoming} />
    </div>
  );
}
