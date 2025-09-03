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
      const games = await ctx.db.query.game.findMany({
        where: (g, { eq }) => eq(g.week, input),
        orderBy: (g, { asc }) => [asc(g.date)],
      });
      type Games = typeof games;
      return games.reduce((groups, game) => {
        const last = groups.at(-1);
        if (last?.[0]?.date.getTime() === game.date.getTime()) {
          last.push(game);
          return groups;
        } else {
          groups.push([game]);
          return groups;
        }
      }, [] as Games[]);
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
        ...g,
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
      };
    }),
  getCurrentWeek: protectedProcedure
    .input(z.number().int().optional().default(2025))
    .query(async ({ ctx, input }) => {
      const now = new Date();
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
        previous: allWeeks[currentIndex - 1],
        next: allWeeks[currentIndex + 1],
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
