import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { admin, member, user } from "~/server/db/schema";

export const addMember = protectedProcedure
  .input(
    z.object({
      leagueId: z.uuid(),
      email: z.email(),
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
          message: "Only league admins can add members.",
        });
      }

      const targetUser = await ctx.db.query.user.findFirst({
        where: eq(user.email, input.email),
        columns: { id: true },
      });
      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found.",
        });
      }

      const existing = await ctx.db.query.member.findFirst({
        where: and(
          eq(member.league, input.leagueId),
          eq(member.user, targetUser.id),
        ),
        columns: { id: true },
      });
      if (existing) {
        return { success: true, alreadyMember: true };
      }

      await ctx.db.insert(member).values({
        league: input.leagueId,
        user: targetUser.id,
      });

      return { success: true };
    } catch (error: unknown) {
      console.error("Error adding member to league:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to add member.",
      });
    }
  });
export const removeMember = protectedProcedure
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
          message: "Only league admins can remove members.",
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
          code: "NOT_FOUND",
          message: "Member not found in this league.",
        });
      }

      const targetIsAdmin = await ctx.db.$count(
        admin,
        and(eq(admin.league, input.leagueId), eq(admin.user, input.userId)),
      );
      if (targetIsAdmin === 1) {
        const adminCount = await ctx.db.$count(
          admin,
          eq(admin.league, input.leagueId),
        );
        if (adminCount === 1) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Cannot remove the only admin. Assign another admin first.",
          });
        }
      }

      await ctx.db.delete(member).where(eq(member.id, membership.id));
      await ctx.db
        .delete(admin)
        .where(
          and(eq(admin.league, input.leagueId), eq(admin.user, input.userId)),
        );

      return { success: true };
    } catch (error: unknown) {
      console.error("Error removing member from league:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to remove member.",
      });
    }
  });
