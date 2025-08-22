import { TRPCError } from "@trpc/server";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { admin, league, member, season } from "~/server/db/schema";

export const getLeagues = protectedProcedure.query(async ({ ctx }) => {
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
});
export const createLeague = protectedProcedure
  .input(
    z.object({
      name: z.string().trim().min(1).max(64),
      season: z.number().int().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const userId = ctx.session.user.id;

      let seasonId = input.season;
      if (seasonId === undefined) {
        const currentSeason = await ctx.db.query.season.findFirst({
          where: eq(season.current, true),
          columns: { id: true },
        });
        if (!currentSeason) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No current season found.",
          });
        }
        seasonId = currentSeason.id;
      } else {
        const exists = await ctx.db.query.season.findFirst({
          where: eq(season.id, seasonId),
          columns: { id: true },
        });
        if (!exists) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Season not found.",
          });
        }
      }

      const inserted = await ctx.db
        .insert(league)
        .values({ name: input.name, season: seasonId })
        .returning({ id: league.id });
      const newLeagueId = inserted[0]?.id;
      if (!newLeagueId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create league.",
        });
      }

      await ctx.db.insert(member).values({
        league: newLeagueId,
        user: userId,
      });

      await ctx.db.insert(admin).values({
        league: newLeagueId,
        user: userId,
      });

      return { success: true, leagueId: newLeagueId };
    } catch (error: unknown) {
      console.error("Error creating league:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create league.",
      });
    }
  });
export const leaveLeague = protectedProcedure
  .input(z.object({ leagueId: z.uuid() }))
  .mutation(async ({ ctx, input }) => {
    try {
      const userId = ctx.session.user.id;

      const membership = await ctx.db.query.member.findFirst({
        where: and(eq(member.user, userId), eq(member.league, input.leagueId)),
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
        and(eq(admin.league, input.leagueId), eq(admin.user, userId)),
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
        .where(and(eq(member.league, input.leagueId), eq(member.user, userId)));

      return { success: true };
    } catch (error: unknown) {
      console.error("Error leaving league:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to leave league.",
      });
    }
  });

export const renameLeague = protectedProcedure
  .input(
    z.object({
      leagueId: z.uuid(),
      name: z.string().trim().min(1).max(64),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const requesterId = ctx.session.user.id;

      const isAdmin = await ctx.db.$count(
        admin,
        and(eq(admin.league, input.leagueId), eq(admin.user, requesterId)),
      );
      if (isAdmin === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only league admins can rename the league.",
        });
      }

      const updated = await ctx.db
        .update(league)
        .set({ name: input.name })
        .where(eq(league.id, input.leagueId))
        .returning({ id: league.id });

      if (updated.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "League not found.",
        });
      }

      return { success: true };
    } catch (error: unknown) {
      console.error("Error renaming league:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to rename league.",
      });
    }
  });
