import { unstable_cache } from "next/cache";
import { db } from "@/db/client";
import { hours, holidayOverrides } from "@/db/schema";
import { asc, eq, gte } from "drizzle-orm";

const DEFAULT_HOURS = [
  { id: 1, dayOfWeek: 0, opensAt: "7:00", closesAt: "21:00", isClosed: false },
  { id: 2, dayOfWeek: 1, opensAt: "5:30", closesAt: "20:00", isClosed: false },
  { id: 3, dayOfWeek: 2, opensAt: "5:30", closesAt: "20:00", isClosed: false },
  { id: 4, dayOfWeek: 3, opensAt: "5:30", closesAt: "20:00", isClosed: false },
  { id: 5, dayOfWeek: 4, opensAt: "5:30", closesAt: "21:00", isClosed: false },
  { id: 6, dayOfWeek: 5, opensAt: "5:30", closesAt: "23:00", isClosed: false },
  { id: 7, dayOfWeek: 6, opensAt: "7:00", closesAt: "23:00", isClosed: false },
];

export const getHours = unstable_cache(
  async () => {
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
  },
  ["hours"],
  { revalidate: 3600, tags: ["hours"] }
);

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
