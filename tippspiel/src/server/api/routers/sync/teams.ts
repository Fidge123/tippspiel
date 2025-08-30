import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import type { db as Database } from "~/server/db/";
import { division, team } from "~/server/db/schema";
import { fetchFromRapidAPI } from "./rapid-api";
import { standingsResponseSchema, teamResponseSchema } from "./schema";

export function getDivision(division?: string, conference?: string) {
  if (!division || !conference) {
    return null;
  }

  if (division.includes(" ")) {
    return division;
  }

  const prefix = conference
    .split(" ")
    .reduce((initials, word) => initials + word[0]?.toUpperCase(), "");
  return `${prefix} ${division}`;
}

export function generateTeamId(id: number, season: number) {
  return id ? id * 100 + (season % 100) : 0;
}

export async function syncTeams(db: typeof Database, input: number) {
  try {
    const teamsData = await fetchFromRapidAPI(
      `/teams?league=1&season=${input}`,
    );
    const parsedTeams = teamResponseSchema.parse(teamsData).response;

    const standingsData = await fetchFromRapidAPI(
      `/standings?league=1&season=${input}`,
    );
    const parsedStandings =
      standingsResponseSchema.parse(standingsData).response;

    for (const teamData of parsedTeams) {
      const standing = parsedStandings.find((s) => s.team.id === teamData.id);
      const div = getDivision(standing?.division?.trim(), standing?.conference);

      if (div !== null) {
        await db
          .insert(division)
          .values({
            id: div,
            conference: standing?.conference ?? "TBD",
          })
          .onConflictDoNothing()
          .execute();
      }

      const data = {
        name: teamData.name,
        code: teamData.code ?? teamData.name.slice(0, 3),
        shortName: teamData.name.split(" ").slice(-1)[0] ?? "",
        logo: teamData.logo,
        season: input,
        division: div,
        position: standing?.position,
        wins: standing?.won,
        losses: standing?.lost,
        ties: standing?.ties,
        pointsFor: standing?.points.for,
        pointsAgainst: standing?.points.against,
        streak: standing?.streak,
      };

      await db
        .insert(team)
        .values({ id: generateTeamId(teamData.id, input), ...data })
        .onConflictDoUpdate({
          target: team.id,
          set: data,
        })
        .execute();
    }

    await db.delete(division).where(eq(division.id, "TBD")).execute();
  } catch (error) {
    console.error("Error syncing teams:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to sync teams data",
    });
  }
}
