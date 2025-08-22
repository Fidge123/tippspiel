import { TRPCError } from "@trpc/server";
import { eq, inArray } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { league, member } from "~/server/db/schema";

export const leagueRouter = createTRPCRouter({
  getLeagues: protectedProcedure.query(async ({ ctx }) => {
    try {
      const memberIn = await ctx.db.query.member.findMany({
        where: eq(member.user, ctx.session.user.id),
      });

      const leagues = await ctx.db.query.league.findMany({
        where: inArray(
          league.id,
          memberIn.map((m) => m.league),
        ),
        with: {
          admins: { with: { user: true } },
          members: { with: { user: true } },
        },
      });

      return leagues.map((league) => {
        return {
          id: league.id,
          name: league.name,
          admins: league.admins.map(({ user }) => user.name),
          members: league.members.map(({ user }) => user.name),
          season: league.season,
        };
      });
    } catch (error: unknown) {
      console.error("Error fetching leagues:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch leagues.",
      });
    }
  }),
});
