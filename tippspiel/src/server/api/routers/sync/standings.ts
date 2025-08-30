import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import type { db as Database } from "~/server/db/";
import { division, team } from "~/server/db/schema";
import { fetchFromRapidAPI } from "./rapid-api";
import { standingsResponseSchema } from "./schema";
import { generateTeamId, getDivision } from "./teams";

export async function syncStandings(db: typeof Database, input: number) {
  try {
    const data = await fetchFromRapidAPI(`/standings?league=1&season=${input}`);
    const parsed = standingsResponseSchema.parse(data);

    for (const standingData of parsed.response) {
      const div = getDivision(
        standingData.division.trim(),
        standingData.conference,
      );

      if (div !== null) {
        await db
          .insert(division)
          .values({
            id: div,
            conference: standingData.conference,
          })
          .onConflictDoNothing()
          .execute();
      }

      await db
        .update(team)
        .set({
          division: div,
          position: standingData.position,
          wins: standingData.won,
          losses: standingData.lost,
          ties: standingData.ties,
          pointsFor: standingData.points.for,
          pointsAgainst: standingData.points.against,
          streak: standingData.streak ?? "-",
        })
        .where(
          and(
            eq(team.id, generateTeamId(standingData.team.id, input)),
            eq(team.season, input),
          ),
        )
        .execute();
    }

    await db.delete(division).where(eq(division.id, "TBD")).execute();
  } catch (error) {
    console.error("Error syncing standings:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to sync standings data",
    });
  }
}
