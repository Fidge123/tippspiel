import { and, eq, lt } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { team } from "~/server/db/schema";

export const teamsRouter = createTRPCRouter({
  getTeamsBySeason: protectedProcedure
    .input(z.number().int().positive())
    .query(async ({ ctx, input }) => {
      const teams = await ctx.db.query.team.findMany({
        where: and(eq(team.season, input), lt(team.id, 3300)),
        orderBy: (t, { asc }) => [asc(t.shortName)],
      });

      return teams.map((t) => ({
        id: t.id,
        code: t.code,
        shortName: t.shortName,
        name: t.name,
        logo: t.logo,
        color1: t.color1,
        color2: t.color2,
        season: t.season,
      })) as Array<TeamListItem>;
    }),
});

export type TeamListItem = {
  id: number;
  code: string;
  shortName: string;
  name: string;
  logo: string;
  color1: string | null;
  color2: string | null;
  season: number;
};
