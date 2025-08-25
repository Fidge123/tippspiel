import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const weekRouter = createTRPCRouter({
  getWeeks: protectedProcedure
    .input(
      z.object({
        season: z.number().int().optional().default(2025),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.week.findMany({
        where: (w, { and, eq, ne }) =>
          and(
            ne(w.stage, "Pre Season"),
            ne(w.week, "Pro Bowl"),
            eq(w.season, input.season),
          ),
        orderBy: (w, { asc }) => [asc(w.start)],
      });
    }),
  getWeek: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.week.findFirst({
        where: (wk, { eq }) => eq(wk.id, input.id),
      });
    }),
  getGamesByWeek: protectedProcedure
    .input(z.object({ weekId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.game.findMany({
        where: (g, { eq }) => eq(g.week, input.weekId),
        orderBy: (g, { asc }) => [asc(g.date)],
      });
    }),
  getGameWithTeams: protectedProcedure
    .input(z.object({ gameId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const g = await ctx.db.query.game.findFirst({
        where: (gm, { eq }) => eq(gm.id, input.gameId),
        with: {
          homeTeam: true,
          awayTeam: true,
        },
      });

      if (!g) {
        return null;
      }

      return {
        id: g.id,
        date: g.date,
        status: g.status,
        week: g.week,
        scores: {
          home: {
            total: g.homeScore,
            q1: g.homeScoreQ1,
            q2: g.homeScoreQ2,
            q3: g.homeScoreQ3,
            q4: g.homeScoreQ4,
            ot: g.homeScoreOT,
          },
          away: {
            total: g.awayScore,
            q1: g.awayScoreQ1,
            q2: g.awayScoreQ2,
            q3: g.awayScoreQ3,
            q4: g.awayScoreQ4,
            ot: g.awayScoreOT,
          },
        },
        homeTeam: g.homeTeam
          ? {
              id: g.homeTeam.id,
              code: g.homeTeam.code,
              shortName: g.homeTeam.shortName,
              name: g.homeTeam.name,
              logo: g.homeTeam.logo,
              color1: g.homeTeam.color1,
              color2: g.homeTeam.color2,
              season: g.homeTeam.season,
            }
          : null,
        awayTeam: g.awayTeam
          ? {
              id: g.awayTeam.id,
              code: g.awayTeam.code,
              shortName: g.awayTeam.shortName,
              name: g.awayTeam.name,
              logo: g.awayTeam.logo,
              color1: g.awayTeam.color1,
              color2: g.awayTeam.color2,
              season: g.awayTeam.season,
            }
          : null,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
      };
    }),
});
