import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import z from "zod";
import {
  bet,
  betDoubler,
  divisionBet,
  member,
  superbowlBet,
  user,
} from "~/server/db/schema";
import { protectedProcedure } from "../../trpc";

export const exportUserData = protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.session.user.id;

  const userData = await ctx.db.query.user.findFirst({
    where: eq(user.id, userId),
    columns: {
      id: true,
      email: true,
      name: true,
      settings: true,
      verified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!userData) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  const bets = await ctx.db.query.bet.findMany({
    where: eq(bet.user, userId),
    with: {
      game: {
        with: {
          awayTeam: true,
          homeTeam: true,
          week: true,
        },
      },
      league: true,
    },
  });

  const divisionBets = await ctx.db.query.divisionBet.findMany({
    where: eq(divisionBet.user, userId),
    with: {
      division: true,
      league: true,
      team_first: true,
      team_second: true,
      team_third: true,
      team_fourth: true,
    },
  });

  const superbowlBets = await ctx.db.query.superbowlBet.findMany({
    where: eq(superbowlBet.user, userId),
    with: {
      team: true,
      league: true,
    },
  });

  const betDoublers = await ctx.db.query.betDoubler.findMany({
    where: eq(betDoubler.user, userId),
    with: {
      bet: {
        with: {
          game: {
            with: {
              awayTeam: true,
              homeTeam: true,
            },
          },
        },
      },
      league: true,
      week: true,
    },
  });

  const memberships = await ctx.db.query.member.findMany({
    where: eq(member.user, userId),
    with: {
      league: {
        with: {
          season: true,
        },
      },
    },
  });

  return {
    user: userData,
    bets,
    divisionBets,
    superbowlBets,
    betDoublers,
    memberships,
    exportedAt: Date.now(),
  };
});

export const deleteAccount = protectedProcedure
  .input(z.object({ confirmEmail: z.email() }))
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    const currentUser = await ctx.db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: {
        email: true,
      },
    });

    if (!currentUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    if (currentUser.email !== input.confirmEmail) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Email does not match your account email",
      });
    }

    try {
      await ctx.db.delete(user).where(eq(user.id, userId));
    } catch (_: unknown) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Your account is linked to another entity that prevents deletion. Please check your settings and try again.",
      });
    }

    return { success: true };
  });
