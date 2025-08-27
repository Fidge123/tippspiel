import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const weekRouter = createTRPCRouter({
  getWeeks: protectedProcedure
    .input(z.number().int().optional().default(2025))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.week.findMany({
        where: (w, { and, eq, ne }) =>
          and(
            ne(w.stage, "Pre Season"),
            ne(w.week, "Pro Bowl"),
            eq(w.season, input),
          ),
        orderBy: (w, { asc }) => [asc(w.start)],
      });
    }),
  getWeek: protectedProcedure
    .input(z.string().min(1))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.week.findFirst({
        where: (wk, { eq }) => eq(wk.id, input),
      });
    }),
  getGamesByWeek: protectedProcedure
    .input(z.string().min(1))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.game.findMany({
        where: (g, { eq }) => eq(g.week, input),
        orderBy: (g, { asc }) => [asc(g.date)],
      });
    }),
  getGameWithTeams: protectedProcedure
    .input(z.number().int())
    .query(async ({ ctx, input }) => {
      const g = await ctx.db.query.game.findFirst({
        where: (gm, { eq }) => eq(gm.id, input),
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
  getCurrentWeek: protectedProcedure
    .input(z.number().int().optional().default(2025))
    .query(async ({ ctx, input }) => {
      const now = new Date().toISOString();
      return await ctx.db.query.week.findFirst({
        where: (w, { and, eq, ne, gte }) =>
          and(
            ne(w.stage, "Pre Season"),
            ne(w.week, "Pro Bowl"),
            eq(w.season, input),
            gte(w.start, now),
          ),
        orderBy: (w, { asc }) => [asc(w.start)],
      });
    }),
  getWeekNavigation: protectedProcedure
    .input(z.string().min(1))
    .query(async ({ ctx, input }) => {
      const currentWeek = await ctx.db.query.week.findFirst({
        where: (w, { eq }) => eq(w.id, input),
      });

      if (!currentWeek) {
        return { previous: null, next: null, allWeeks: [] };
      }

      const allWeeks = await ctx.db.query.week.findMany({
        where: (w, { and, eq, ne }) =>
          and(
            ne(w.stage, "Pre Season"),
            ne(w.week, "Pro Bowl"),
            eq(w.season, currentWeek.season),
          ),
        orderBy: (w, { asc }) => [asc(w.start)],
      });

      const currentIndex = allWeeks.findIndex((w) => w.id === input);

      return {
        previous: currentIndex > 0 ? allWeeks[currentIndex - 1] : null,
        next:
          currentIndex < allWeeks.length - 1
            ? allWeeks[currentIndex + 1]
            : null,
        allWeeks,
      };
    }),
  getByesByWeek: protectedProcedure
    .input(z.string().min(1))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.bye.findMany({
        where: (b, { eq, lt, and }) => and(eq(b.week, input), lt(b.team, 3300)), // Ignore NFC AFC
        with: {
          team: true,
        },
      });
    }),
});
