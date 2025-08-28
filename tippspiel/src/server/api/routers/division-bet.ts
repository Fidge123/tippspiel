import { TRPCError } from "@trpc/server";
import { and, eq, lt } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { divisionBet, league, member, team } from "~/server/db/schema";

export const divisionBetRouter = createTRPCRouter({
  getDivisionBets: protectedProcedure
    .input(z.object({ leagueId: z.uuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const membership = await ctx.db.query.member.findFirst({
        where: and(eq(member.user, userId), eq(member.league, input.leagueId)),
        columns: { id: true },
      });
      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this league.",
        });
      }

      const bets = await ctx.db.query.divisionBet.findMany({
        where: and(
          eq(divisionBet.user, userId),
          eq(divisionBet.league, input.leagueId),
        ),
        with: {
          team_first: true,
          team_second: true,
          team_third: true,
          team_fourth: true,
        },
      });

      return bets.map((bet) => ({
        division: bet.division,
        first: bet.team_first
          ? {
              id: bet.team_first.id,
              code: bet.team_first.code,
              shortName: bet.team_first.shortName,
              name: bet.team_first.name,
              logo: bet.team_first.logo,
              color1: bet.team_first.color1,
              color2: bet.team_first.color2,
            }
          : null,
        second: bet.team_second
          ? {
              id: bet.team_second.id,
              code: bet.team_second.code,
              shortName: bet.team_second.shortName,
              name: bet.team_second.name,
              logo: bet.team_second.logo,
              color1: bet.team_second.color1,
              color2: bet.team_second.color2,
            }
          : null,
        third: bet.team_third
          ? {
              id: bet.team_third.id,
              code: bet.team_third.code,
              shortName: bet.team_third.shortName,
              name: bet.team_third.name,
              logo: bet.team_third.logo,
              color1: bet.team_third.color1,
              color2: bet.team_third.color2,
            }
          : null,
        fourth: bet.team_fourth
          ? {
              id: bet.team_fourth.id,
              code: bet.team_fourth.code,
              shortName: bet.team_fourth.shortName,
              name: bet.team_fourth.name,
              logo: bet.team_fourth.logo,
              color1: bet.team_fourth.color1,
              color2: bet.team_fourth.color2,
            }
          : null,
        createdAt: bet.createdAt,
        updatedAt: bet.updatedAt,
      }));
    }),

  getDeadline: protectedProcedure
    .input(z.object({ season: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const firstGame = await ctx.db.query.game.findFirst({
        where: (g, { eq }) => eq(g.week, `${input.season}-regular-1`),
        orderBy: (g, { asc }) => [asc(g.date)],
      });

      if (!firstGame) {
        // Fallback: find first regular season week and get first game
        const firstWeek = await ctx.db.query.week.findFirst({
          where: (w, { and, eq, ne }) =>
            and(
              eq(w.season, input.season),
              ne(w.stage, "Pre Season"),
              ne(w.week, "Pro Bowl"),
            ),
          orderBy: (w, { asc }) => [asc(w.start)],
        });

        if (!firstWeek) {
          return null;
        }

        const firstGameOfWeek = await ctx.db.query.game.findFirst({
          where: (g, { eq }) => eq(g.week, firstWeek.id),
          orderBy: (g, { asc }) => [asc(g.date)],
        });

        return firstGameOfWeek ? { deadline: firstGameOfWeek.date } : null;
      }

      return { deadline: firstGame.date };
    }),

  upsertDivisionBet: protectedProcedure
    .input(
      z.object({
        leagueId: z.uuid(),
        division: z.string(),
        first: z.number().int(),
        second: z.number().int(),
        third: z.number().int(),
        fourth: z.number().int(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Validate membership
      const membership = await ctx.db.query.member.findFirst({
        where: and(eq(member.user, userId), eq(member.league, input.leagueId)),
        columns: { id: true },
      });
      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this league.",
        });
      }

      // Get league season
      const lg = await ctx.db.query.league.findFirst({
        where: eq(league.id, input.leagueId),
        columns: { season: true },
      });
      if (!lg) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "League not found.",
        });
      }

      // Validate all teams are in the correct division and season
      const teamIds = [input.first, input.second, input.third, input.fourth];
      const teams = await ctx.db.query.team.findMany({
        where: and(eq(team.season, lg.season), lt(team.id, 3300)),
      });

      const divisionTeams = teams.filter((t) => t.division === input.division);
      const divisionTeamIds = divisionTeams.map((t) => t.id);

      // Check if all provided team IDs are valid for this division
      for (const teamId of teamIds) {
        if (!divisionTeamIds.includes(teamId)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Team ${teamId} is not in division ${input.division} for this season.`,
          });
        }
      }

      // Check if all team IDs are unique
      const uniqueTeamIds = new Set(teamIds);
      if (uniqueTeamIds.size !== teamIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Each team can only be selected once per division.",
        });
      }

      // Check if all teams in the division are included
      if (divisionTeamIds.length !== 4 || teamIds.length !== 4) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "All four teams in the division must be ranked.",
        });
      }

      // Check deadline
      const firstGame = await ctx.db.query.game.findFirst({
        where: (g, { eq }) => eq(g.week, `${lg.season}-regular-1`),
        orderBy: (g, { asc }) => [asc(g.date)],
      });

      if (!firstGame) {
        // Fallback: find first regular season week and get first game
        const firstWeek = await ctx.db.query.week.findFirst({
          where: (w, { and, eq, ne }) =>
            and(
              eq(w.season, lg.season),
              ne(w.stage, "Pre Season"),
              ne(w.week, "Pro Bowl"),
            ),
          orderBy: (w, { asc }) => [asc(w.start)],
        });

        if (firstWeek) {
          const firstGameOfWeek = await ctx.db.query.game.findFirst({
            where: (g, { eq }) => eq(g.week, firstWeek.id),
            orderBy: (g, { asc }) => [asc(g.date)],
          });

          if (firstGameOfWeek && new Date() >= new Date(firstGameOfWeek.date)) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message:
                "Division betting deadline has passed. You can only bet before the first game of the season.",
            });
          }
        }
      } else if (new Date() >= new Date(firstGame.date)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Division betting deadline has passed. You can only bet before the first game of the season.",
        });
      }

      await ctx.db
        .insert(divisionBet)
        .values({
          division: input.division,
          user: userId,
          league: input.leagueId,
          first: input.first,
          second: input.second,
          third: input.third,
          fourth: input.fourth,
        })
        .onConflictDoUpdate({
          target: [divisionBet.division, divisionBet.user, divisionBet.league],
          set: {
            first: input.first,
            second: input.second,
            third: input.third,
            fourth: input.fourth,
          },
        });

      return { success: true as const };
    }),
});

export type DivisionBetSelection = {
  division: string;
  first: {
    id: number;
    code: string;
    shortName: string;
    name: string;
    logo: string;
    color1: string | null;
    color2: string | null;
  } | null;
  second: {
    id: number;
    code: string;
    shortName: string;
    name: string;
    logo: string;
    color1: string | null;
    color2: string | null;
  } | null;
  third: {
    id: number;
    code: string;
    shortName: string;
    name: string;
    logo: string;
    color1: string | null;
    color2: string | null;
  } | null;
  fourth: {
    id: number;
    code: string;
    shortName: string;
    name: string;
    logo: string;
    color1: string | null;
    color2: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
};
