import { TRPCError } from "@trpc/server";
import type { db as Database } from "~/server/db/";
import { season } from "~/server/db/schema";
import { fetchFromRapidAPI } from "./rapid-api";
import { leagueResponseSchema } from "./schema";

export async function syncLeagues(db: typeof Database, input: number) {
  try {
    const data = await fetchFromRapidAPI(`/leagues?id=1`);
    const parsed = leagueResponseSchema.parse(data);

    for (const leagueData of parsed.response) {
      for (const seasonData of leagueData.seasons) {
        if (seasonData.year === input) {
          const data = {
            start: new Date(seasonData.start),
            end: new Date(seasonData.end),
            current: seasonData.current,
          };
          await db
            .insert(season)
            .values({ id: seasonData.year, ...data })
            .onConflictDoUpdate({ target: season.id, set: data })
            .execute();
        }
      }
    }
  } catch (error) {
    console.error("Error syncing leagues:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to sync leagues data",
    });
  }
}
