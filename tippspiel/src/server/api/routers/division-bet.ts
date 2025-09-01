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
        first: bet.team_first ?? null,
        second: bet.team_second ?? null,
        third: bet.team_third ?? null,
        fourth: bet.team_fourth ?? null,
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

      const teamIds = [input.first, input.second, input.third, input.fourth];
      const teams = await ctx.db.query.team.findMany({
        where: and(eq(team.season, lg.season), lt(team.id, 3300)),
      });

      const divisionTeams = teams.filter((t) => t.division === input.division);
      const divisionTeamIds = divisionTeams.map((t) => t.id);

      for (const teamId of teamIds) {
        if (!divisionTeamIds.includes(teamId)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Team ${teamId} is not in division ${input.division} for this season.`,
          });
        }
      }

      const uniqueTeamIds = new Set(teamIds);
      if (uniqueTeamIds.size !== teamIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Each team can only be selected once per division.",
        });
      }

      if (divisionTeamIds.length !== 4 || teamIds.length !== 4) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "All four teams in the division must be ranked.",
        });
      }

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

type Team = {
  id: number;
  code: string;
  shortName: string;
  name: string;
  logo: string;
  color1: string | null;
  color2: string | null;
};

export type DivisionBetSelection = {
  division: string;
  first: Team | null;
  second: Team | null;
  third: Team | null;
  fourth: Team | null;
  createdAt: Date;
  updatedAt: Date;
};
