import { TRPCError } from "@trpc/server";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { admin, league, member } from "~/server/db/schema";

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
          members: league.members.map(({ user }) => ({
            id: user.id,
            name: user.name,
            isYou: user.id === ctx.session.user.id,
            isAdmin: league.admins.some((a) => a.user.id === user.id),
          })),
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
  leaveLeague: protectedProcedure
    .input(z.object({ leagueId: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id;

        const membership = await ctx.db.query.member.findFirst({
          where: and(
            eq(member.user, userId),
            eq(member.league, input.leagueId),
          ),
          columns: { id: true },
        });

        if (!membership) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "You are not a member of this league.",
          });
        }

        const admins = await ctx.db.$count(
          admin,
          and(eq(admin.league, input.leagueId), eq(admin.id, userId)),
        );

        if (admins === 1) {
          const leagueMembers = await ctx.db.query.member.findMany({
            where: eq(member.league, input.leagueId),
            columns: { id: true },
          });

          if (leagueMembers.length > 1) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message:
                "You are the only admin of this league. Please assign another admin before leaving.",
            });
          } else {
            await ctx.db.delete(league).where(eq(league.id, input.leagueId));
          }
        }

        await ctx.db
          .delete(member)
          .where(
            and(eq(member.league, input.leagueId), eq(member.user, userId)),
          );

        return { success: true };
      } catch (error: unknown) {
        console.error("Error leaving league:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to leave league.",
        });
      }
    }),
});
