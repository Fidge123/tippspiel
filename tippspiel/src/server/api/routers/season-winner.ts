import { TRPCError } from "@trpc/server";
import { and, eq, lt } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { league, member, seasonWinnerBet, team } from "~/server/db/schema";

export const seasonWinnerRouter = createTRPCRouter({
  getSelection: protectedProcedure
    .input(z.object({ leagueId: z.uuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const membership = await ctx.db.query.member.findFirst({
        where: and(eq(member.user, userId), eq(member.league, input.leagueId)),
        columns: { id: true },
      });
      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this league.",
        });
      }

      const bet = await ctx.db.query.seasonWinnerBet.findFirst({
        where: and(
          eq(seasonWinnerBet.user, userId),
          eq(seasonWinnerBet.league, input.leagueId),
        ),
        with: { team: true },
      });

      if (!bet) {
        return null;
      }

      return {
        team: bet.team
          ? {
              id: bet.team.id,
              code: bet.team.code,
              shortName: bet.team.shortName,
              name: bet.team.name,
              logo: bet.team.logo,
              color1: bet.team.color1,
              color2: bet.team.color2,
              season: bet.team.season,
            }
          : null,
        createdAt: bet.createdAt,
        updatedAt: bet.updatedAt,
      } as SesaonWinnerSelection | null;
    }),

  upsertSelection: protectedProcedure
    .input(
      z.object({
        leagueId: z.uuid(),
        teamId: z.number().int(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Ensure the requester is a member of the league
      const membership = await ctx.db.query.member.findFirst({
        where: and(eq(member.user, userId), eq(member.league, input.leagueId)),
        columns: { id: true },
      });
      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this league.",
        });
      }

      // Resolve league to obtain season
      const lg = await ctx.db.query.league.findFirst({
        where: eq(league.id, input.leagueId),
        columns: { season: true },
      });
      if (!lg) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "League not found.",
        });
      }

      // Validate team belongs to the same season and is a real NFL team (exclude AFC/NFC summary rows)
      const t = await ctx.db.query.team.findFirst({
        where: and(
          eq(team.id, input.teamId),
          eq(team.season, lg.season),
          lt(team.id, 3300),
        ),
        columns: { id: true },
      });
      if (!t) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid team for this league season.",
        });
      }

      await ctx.db
        .insert(seasonWinnerBet)
        .values({
          team: input.teamId,
          user: userId,
          league: input.leagueId,
        })
        .onConflictDoUpdate({
          target: [seasonWinnerBet.user, seasonWinnerBet.league],
          set: { team: input.teamId },
        });

      return { success: true as const };
    }),
});

export type SesaonWinnerSelection = {
  team: {
    id: number;
    code: string;
    shortName: string;
    name: string;
    logo: string;
    color1: string | null;
    color2: string | null;
    season: number;
  } | null;
  createdAt: string;
  updatedAt: string;
};
