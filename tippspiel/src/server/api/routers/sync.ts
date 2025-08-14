import { TRPCError } from "@trpc/server";
import { and, eq, notExists, or, sql } from "drizzle-orm";
import { z } from "zod";
import { env } from "~/env";
import {
  gameResponseSchema,
  leagueResponseSchema,
  standingsResponseSchema,
  teamResponseSchema,
} from "~/server/api/routers/sync.schema";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { db as Database } from "~/server/db/";
import { bye, division, game, season, team, week } from "~/server/db/schema";

const RAPIDAPI_HOST = "api-american-football.p.rapidapi.com";
const RAPIDAPI_BASE_URL = `https://${RAPIDAPI_HOST}`;

async function fetchFromRapidAPI(endpoint: string) {
  const response = await fetch(`${RAPIDAPI_BASE_URL}${endpoint}`, {
    headers: {
      "x-rapidapi-key": env.RAPIDAPI_KEY,
      "x-rapidapi-host": RAPIDAPI_HOST,
    },
  });

  if (!response.ok) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `RapidAPI request failed: ${response.status} ${response.statusText}`,
    });
  }

  return response.json();
}

function generateWeekId(season: number, stage: string, week: string): string {
  return `${season}-${stage.toLowerCase().replace(/\s+/g, "-")}-${week.toLowerCase().replace(/\s+/g, "-")}`;
}

function generateTeamId(id: number, season: number) {
  return id ? id * 100 + (season % 100) : 0;
}

async function syncLeagues(db: typeof Database, input: number) {
  try {
    const data = await fetchFromRapidAPI(`/leagues?id=1`);
    const parsed = leagueResponseSchema.parse(data);

    for (const leagueData of parsed.response) {
      for (const seasonData of leagueData.seasons) {
        if (seasonData.year === input) {
          await db
            .insert(season)
            .values({
              id: seasonData.year,
              start: seasonData.start,
              end: seasonData.end,
              current: seasonData.current,
            })
            .onConflictDoUpdate({
              target: season.id,
              set: {
                start: seasonData.start,
                end: seasonData.end,
                current: seasonData.current,
              },
            })
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

async function syncTeams(db: typeof Database, input: number) {
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
      await db
        .insert(division)
        .values({
          id: standing?.division ?? "TBD",
          conference: standing?.conference ?? "TBD",
        })
        .onConflictDoNothing()
        .execute();

      const data = {
        name: teamData.name,
        code: teamData.code,
        shortName: teamData.name.split(" ").slice(-1)[0] ?? "",
        logo: teamData.logo,
        season: input,
        division: standing?.division ?? "TBD",
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

async function syncStandings(db: typeof Database, input: number) {
  try {
    const data = await fetchFromRapidAPI(`/standings?league=1&season=${input}`);
    const parsed = standingsResponseSchema.parse(data);

    for (const standingData of parsed.response) {
      await db
        .insert(division)
        .values({
          id: standingData.division,
          conference: standingData.conference,
        })
        .onConflictDoNothing()
        .execute();

      await db
        .update(team)
        .set({
          division: standingData.division,
          position: standingData.position,
          wins: standingData.won,
          losses: standingData.lost,
          ties: standingData.ties,
          pointsFor: standingData.points.for,
          pointsAgainst: standingData.points.against,
          streak: standingData.streak,
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

async function syncGames(db: typeof Database, input: number) {
  try {
    const data = await fetchFromRapidAPI(`/games?league=1&season=${input}`);
    const parsed = gameResponseSchema.parse(data);

    for (const gameData of parsed.response) {
      const weekId = generateWeekId(
        input,
        gameData.game.stage,
        gameData.game.week,
      );
      const startTime = gameData.game.date.timestamp * 1000;
      const fourHours = 4 * 60 * 60 * 1000;
      const gameDateTime = new Date(startTime);

      const d = {
        season: input,
        stage: gameData.game.stage,
        week: gameData.game.week,
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
        status: gameData.game.status.short,
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

export const syncRouter = createTRPCRouter({
  syncLeagues: protectedProcedure
    .input(z.object({ season: z.number().optional().default(2025) }))
    .mutation(({ ctx, input }) => syncLeagues(ctx.db, input.season)),

  syncTeams: protectedProcedure
    .input(z.object({ season: z.number().optional().default(2025) }))
    .mutation(({ ctx, input }) => syncTeams(ctx.db, input.season)),

  syncStandings: protectedProcedure
    .input(z.object({ season: z.number().optional().default(2025) }))
    .mutation(({ ctx, input }) => syncStandings(ctx.db, input.season)),

  syncGames: protectedProcedure
    .input(z.object({ season: z.number().optional().default(2025) }))
    .mutation(({ ctx, input }) => syncGames(ctx.db, input.season)),

  syncAll: protectedProcedure
    .input(z.object({ season: z.number().optional().default(2025) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await syncLeagues(ctx.db, input.season);
        await syncTeams(ctx.db, input.season);
        await syncGames(ctx.db, input.season);
      } catch (error) {
        console.error("Error syncing all data:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to sync all data",
        });
      }
    }),
});
