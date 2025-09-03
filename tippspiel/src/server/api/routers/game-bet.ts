import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { bet, game, member } from "~/server/db/schema";

export const gameBetRouter = createTRPCRouter({
  getUserBet: protectedProcedure
    .input(z.object({ gameId: z.number(), leagueId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const membership = await ctx.db.query.member.findFirst({
        where: and(eq(member.user, userId), eq(member.league, input.leagueId)),
        columns: { id: true },
      });

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Du bist kein Mitglied dieser Liga.",
        });
      }

      const userBet = await ctx.db.query.bet.findFirst({
        where: and(
          eq(bet.user, userId),
          eq(bet.game, input.gameId),
          eq(bet.league, input.leagueId),
        ),
      });

      if (!userBet) {
        return null;
      }

      return {
        id: userBet.id,
        team: userBet.team,
        value: userBet.value,
        createdAt: userBet.createdAt,
        updatedAt: userBet.updatedAt,
      };
    }),

  placeBet: protectedProcedure
    .input(
      z.object({
        gameId: z.number(),
        teamId: z.number(),
        value: z.number().min(1),
        leagueId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if user is a member of the league
      const membership = await ctx.db.query.member.findFirst({
        where: and(eq(member.user, userId), eq(member.league, input.leagueId)),
        columns: { id: true },
      });

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Du bist kein Mitglied dieser Liga.",
        });
      }

      // Check if the game exists and hasn't started yet
      const gameInfo = await ctx.db.query.game.findFirst({
        where: eq(game.id, input.gameId),
        columns: { id: true, date: true, status: true },
      });

      if (!gameInfo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Spiel nicht gefunden.",
        });
      }

      // Check if betting is still allowed
      const now = new Date();

      if (now >= gameInfo.date || gameInfo.status !== "Not Started") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Das Spiel hat bereits begonnen. Du kannst nicht mehr tippen.",
        });
      }

      // Upsert the bet
      await ctx.db
        .insert(bet)
        .values({
          user: userId,
          game: input.gameId,
          team: input.teamId,
          value: input.value,
          league: input.leagueId,
        })
        .onConflictDoUpdate({
          target: [bet.game, bet.user, bet.league],
          set: {
            team: input.teamId,
            value: input.value,
          },
        });

      return { success: true };
    }),
});
