import { TRPCError } from "@trpc/server";
import { and, eq, notExists, or, sql } from "drizzle-orm";
import { z } from "zod";
import { env } from "~/env";
import {
  espnTeamSchema,
  espnTeamsSchema,
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

function getDivision(division?: string, conference?: string) {
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

async function syncStandings(db: typeof Database, input: number) {
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

async function syncGames(db: typeof Database, input: number) {
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

async function syncWithESPN(db: typeof Database, input: number) {
  try {
    const teamsRes = await fetch(
      `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/${input}/teams?limit=50`,
    );
    const teams = espnTeamsSchema.parse(await teamsRes.json()).items;

    for (const t of teams) {
      const teamRes = await fetch(t.$ref);
      const teamData = espnTeamSchema.parse(await teamRes.json());

      await db
        .update(team)
        .set({
          color1: `#${teamData.color}`,
          color2: `#${teamData.alternateColor}`,
          code: teamData.abbreviation,
          shortName: teamData.shortDisplayName,
          logo: teamData.logos[0]?.href ?? team.logo,
        })
        .where(and(eq(team.name, teamData.displayName), eq(team.season, input)))
        .execute();
    }
  } catch (error) {
    console.error("Error syncing teams:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to sync ESPN teams data",
    });
  }
}

export const syncRouter = createTRPCRouter({
  syncWithESPN: protectedProcedure
    .input(z.object({ season: z.number().optional().default(2025) }))
    .mutation(async ({ ctx, input }) => syncWithESPN(ctx.db, input.season)),

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
        await syncWithESPN(ctx.db, input.season);
      } catch (error) {
        console.error("Error syncing all data:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to sync all data",
        });
      }
    }),
});
