import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { admin, member } from "~/server/db/schema";

export const addAdmin = protectedProcedure
  .input(
    z.object({
      leagueId: z.uuid(),
      userId: z.uuid(),
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
          message: "Only league admins can promote members to admin.",
        });
      }

      const membership = await ctx.db.query.member.findFirst({
        where: and(
          eq(member.league, input.leagueId),
          eq(member.user, input.userId),
        ),
        columns: { id: true },
      });
      if (!membership) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User must be a member of the league to be promoted.",
        });
      }

      const alreadyAdmin = await ctx.db.$count(
        admin,
        and(eq(admin.league, input.leagueId), eq(admin.user, input.userId)),
      );
      if (alreadyAdmin > 0) {
        return { success: true, alreadyAdmin: true };
      }

      await ctx.db.insert(admin).values({
        league: input.leagueId,
        user: input.userId,
      });

      return { success: true };
    } catch (error: unknown) {
      console.error("Error promoting to admin:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to promote user to admin.",
      });
    }
  });

export const removeAdmin = protectedProcedure
  .input(
    z.object({
      leagueId: z.uuid(),
      userId: z.uuid(),
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
          message: "Only league admins can demote admins.",
        });
      }

      const targetIsAdmin = await ctx.db.$count(
        admin,
        and(eq(admin.league, input.leagueId), eq(admin.user, input.userId)),
      );
      if (targetIsAdmin === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is not an admin of this league.",
        });
      }

      const totalAdmins = await ctx.db.$count(
        admin,
        eq(admin.league, input.leagueId),
      );
      if (totalAdmins === 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot demote the only admin. Assign another admin first.",
        });
      }

      await ctx.db
        .delete(admin)
        .where(
          and(eq(admin.league, input.leagueId), eq(admin.user, input.userId)),
        );

      return { success: true };
    } catch (error: unknown) {
      console.error("Error demoting admin:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to demote admin.",
      });
    }
  });
