import { db } from "@/db/client";
import { hours, holidayOverrides } from "@/db/schema";
import { asc, gte } from "drizzle-orm";

export const DAY_NAMES = [
  "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday",
];

// Hardcoded fallback shown when DB is unreachable. Stored as 24-hour "HH:MM"
// to match the DB; use formatTime() for display.
export const DEFAULT_HOURS = [
  { id: 1, dayOfWeek: 0, opensAt: "07:00", closesAt: "21:00", isClosed: false },
  { id: 2, dayOfWeek: 1, opensAt: "05:30", closesAt: "20:00", isClosed: false },
  { id: 3, dayOfWeek: 2, opensAt: "05:30", closesAt: "20:00", isClosed: false },
  { id: 4, dayOfWeek: 3, opensAt: "05:30", closesAt: "20:00", isClosed: false },
  { id: 5, dayOfWeek: 4, opensAt: "05:30", closesAt: "21:00", isClosed: false },
  { id: 6, dayOfWeek: 5, opensAt: "05:30", closesAt: "23:00", isClosed: false },
  { id: 7, dayOfWeek: 6, opensAt: "07:00", closesAt: "23:00", isClosed: false },
];

// Convert a 24-hour "HH:MM" string to a 12-hour "h:MM AM/PM" display string.
// Passes values through unchanged if they aren't in "HH:MM" form.
export function formatTime(t: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
  if (!match) return t;
  let hour = parseInt(match[1], 10);
  const minute = match[2];
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${period}`;
}

export async function getHours() {
  try {
    const regular = await db
      .select()
      .from(hours)
      .orderBy(asc(hours.dayOfWeek));

    const today = new Date().toISOString().split("T")[0];
    const upcoming = await db
      .select()
      .from(holidayOverrides)
      .where(gte(holidayOverrides.date, today))
      .limit(10);

    return { regular: regular.length ? regular : DEFAULT_HOURS, upcoming };
  } catch {
    return { regular: DEFAULT_HOURS, upcoming: [] };
  }
}
