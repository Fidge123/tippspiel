import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { member } from "~/server/db/schema";

export const leagueRouter = createTRPCRouter({
  getLeagues: protectedProcedure.query(async ({ ctx }) => {
    try {
      const leagues = await ctx.db.query.league.findMany({
        with: {
          admins: {
            with: { user: true },
          },
          members: {
            where: eq(member.user, ctx.session.user.id),
            with: {
              user: true,
            },
          },
          season: true,
        },
      });

      return leagues.map((league) => {
        return {
          id: league.id,
          name: league.name,
          admins: league.admins.map(({ user }) => user.name),
          members: league.members.map(({ user }) => user.name),
          season: league.season.id,
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
