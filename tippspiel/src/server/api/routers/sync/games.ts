import { TRPCError } from "@trpc/server";
import { and, eq, notExists, or, sql } from "drizzle-orm";
import type { db as Database } from "~/server/db/";
import { bye, game, team, week } from "~/server/db/schema";
import { fetchFromRapidAPI } from "./rapid-api";
import { gameResponseSchema } from "./schema";
import { generateTeamId } from "./teams";

function generateWeekId(season: number, stage: string, week: string): string {
  return `${season}-${stage.toLowerCase().replace(/\s+/g, "-")}-${week.toLowerCase().replace(/\s+/g, "-")}`;
}

export async function syncGames(db: typeof Database, input: number) {
  try {
    const data = await fetchFromRapidAPI(`/games?league=1&season=${input}`);
    const parsed = gameResponseSchema.parse(data);

    for (const gameData of parsed.response) {
      const weekId = generateWeekId(
        input,
        gameData.game.stage,
        gameData.game.week ? gameData.game.week : "Unknown",
      );
      const startTime = gameData.game.date.timestamp * 1000;
      const fourHours = 4 * 60 * 60 * 1000;
      const gameDateTime = new Date(startTime);

      const d = {
        season: input,
        stage: gameData.game.stage,
        week: gameData.game.week ? gameData.game.week : "Unknown",
      };
      const start = gameDateTime.toISOString();
      const end = new Date(startTime + fourHours).toISOString();
      await db
        .insert(week)
        .values({ id: weekId, start, end, ...d })
        .onConflictDoUpdate({
          target: week.id,
          set: {
            start: sql`LEAST(${start}, ${week.start})`,
            end: sql`GREATEST(${end}, ${week.end})`,
          },
        })
        .execute();

      const data = {
        date: start,
        homeTeam: generateTeamId(gameData.teams.home.id, input) || null,
        awayTeam: generateTeamId(gameData.teams.away.id, input) || null,
        week: weekId,
        status: gameData.game.status.long,
        homeScore: gameData.scores.home.total,
        homeScoreQ1: gameData.scores.home.quarter_1,
        homeScoreQ2: gameData.scores.home.quarter_2,
        homeScoreQ3: gameData.scores.home.quarter_3,
        homeScoreQ4: gameData.scores.home.quarter_4,
        homeScoreOT: gameData.scores.home.overtime,
        awayScore: gameData.scores.away.total,
        awayScoreQ1: gameData.scores.away.quarter_1,
        awayScoreQ2: gameData.scores.away.quarter_2,
        awayScoreQ3: gameData.scores.away.quarter_3,
        awayScoreQ4: gameData.scores.away.quarter_4,
        awayScoreOT: gameData.scores.away.overtime,
      };
      await db
        .insert(game)
        .values({ id: gameData.game.id, ...data })
        .onConflictDoUpdate({ target: game.id, set: data })
        .execute();
    }

    await syncByes(db, input);
  } catch (error) {
    console.error("Error syncing games:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to sync games data",
    });
  }
}

async function syncByes(db: typeof Database, input: number) {
  try {
    const teamWeekWithoutGames = await db
      .select({ team: team.id, week: week.id })
      .from(team)
      .crossJoin(week)
      .where(
        and(
          eq(team.season, input),
          eq(week.season, input),
          eq(week.stage, "Regular Season"),
          notExists(
            db
              .select()
              .from(game)
              .where(
                and(
                  eq(game.week, week.id),
                  or(eq(game.homeTeam, team.id), eq(game.awayTeam, team.id)),
                ),
              ),
          ),
        ),
      )
      .execute();
    for (const b of teamWeekWithoutGames) {
      await db.insert(bye).values(b).onConflictDoNothing().execute();
    }
  } catch (error) {
    console.error("Error syncing byes:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to sync bye data",
    });
  }
}
