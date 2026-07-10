import { db } from "@/db/client";
import { weeklySpecials } from "@/db/schema";
import { and, eq, lte, gte } from "drizzle-orm";
import { FALLBACK_SPECIALS, type SpecialView } from "./fallback-content";

export async function getActiveSpecials(): Promise<SpecialView[]> {
  try {
    const now = new Date();
    const rows = await db
      .select()
      .from(weeklySpecials)
      .where(
        and(
          eq(weeklySpecials.isActive, true),
          lte(weeklySpecials.startsOn, now),
          gte(weeklySpecials.endsOn, now)
        )
      );
    return rows.length ? rows : FALLBACK_SPECIALS;
  } catch {
    return FALLBACK_SPECIALS;
  }
}
