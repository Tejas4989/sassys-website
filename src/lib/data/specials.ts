import { unstable_cache } from "next/cache";
import { db } from "@/db/client";
import { weeklySpecials } from "@/db/schema";
import { and, eq, lte, gte } from "drizzle-orm";

export const getActiveSpecials = unstable_cache(
  async () => {
    try {
      const now = new Date();
      return db
        .select()
        .from(weeklySpecials)
        .where(
          and(
            eq(weeklySpecials.isActive, true),
            lte(weeklySpecials.startsOn, now),
            gte(weeklySpecials.endsOn, now)
          )
        );
    } catch {
      return [];
    }
  },
  ["specials"],
  { revalidate: 60, tags: ["specials"] }
);
