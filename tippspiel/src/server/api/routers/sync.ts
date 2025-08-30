import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { syncWithESPN } from "./sync/espn";
import { syncGames } from "./sync/games";
import { syncLeagues } from "./sync/leagues";
import { syncStandings } from "./sync/standings";
import { syncTeams } from "./sync/teams";

export const syncRouter = createTRPCRouter({
  syncWithESPN: protectedProcedure
    .input(z.object({ season: z.number().optional().default(2025) }))
    .mutation(async ({ ctx, input }) => syncWithESPN(ctx.db, input.season)),

  syncLeagues: protectedProcedure
    .input(z.object({ season: z.number().optional().default(2025) }))
    .mutation(({ ctx, input }) => syncLeagues(ctx.db, input.season)),

  syncTeams: protectedProcedure
    .input(z.object({ season: z.number().optional().default(2025) }))
    .mutation(({ ctx, input }) => syncTeams(ctx.db, input.season)),

  syncStandings: protectedProcedure
    .input(z.object({ season: z.number().optional().default(2025) }))
    .mutation(({ ctx, input }) => syncStandings(ctx.db, input.season)),

  syncGames: protectedProcedure
    .input(z.object({ season: z.number().optional().default(2025) }))
    .mutation(({ ctx, input }) => syncGames(ctx.db, input.season)),

  syncAll: protectedProcedure
    .input(z.object({ season: z.number().optional().default(2025) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await syncLeagues(ctx.db, input.season);
        await syncTeams(ctx.db, input.season);
        await syncGames(ctx.db, input.season);
        await syncWithESPN(ctx.db, input.season);
      } catch (error) {
        console.error("Error syncing all data:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to sync all data",
        });
      }
    }),
});
