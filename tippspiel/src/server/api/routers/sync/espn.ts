import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import type { db as Database } from "~/server/db/";
import { team } from "~/server/db/schema";
import { espnTeamSchema, espnTeamsSchema } from "./schema";

export async function syncWithESPN(db: typeof Database, input: number) {
  try {
    const teamsRes = await fetch(
      `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/${input}/teams?limit=50`,
    );
    const teams = espnTeamsSchema.parse(await teamsRes.json()).items;

    const logoDir = join(process.cwd(), "public", "logos", input.toString());
    if (!existsSync(logoDir)) {
      mkdirSync(logoDir, { recursive: true });
    }

    for (const t of teams) {
      const teamRes = await fetch(t.$ref);
      const teamData = espnTeamSchema.parse(await teamRes.json());

      let logoPath = teamData.logos[0]?.href;

      if (teamData.logos[0]?.href) {
        const logoUrl = teamData.logos[0].href;
        const cleanUrl = logoUrl.split("?")[0] ?? logoUrl;
        const fileExtension = extname(cleanUrl) || ".png";
        const fileName = `${teamData.abbreviation.toLowerCase()}${fileExtension}`;
        const localPath = join(logoDir, fileName);
        const publicPath = `/logos/${input}/${fileName}`;

        if (!existsSync(localPath)) {
          try {
            const logoRes = await fetch(logoUrl);
            if (logoRes.ok) {
              const logoBuffer = await logoRes.arrayBuffer();
              writeFileSync(localPath, new Uint8Array(logoBuffer));
              console.log(
                `Downloaded logo for ${teamData.abbreviation}: ${publicPath}`,
              );
            }
          } catch (logoError) {
            console.warn(
              `Failed to download logo for ${teamData.abbreviation}:`,
              logoError,
            );
          }
        }

        if (existsSync(localPath)) {
          logoPath = publicPath;
        }
      }

      await db
        .update(team)
        .set({
          color1: `#${teamData.color}`,
          color2: `#${teamData.alternateColor}`,
          code: teamData.abbreviation,
          shortName: teamData.shortDisplayName,
          logo: logoPath ?? team.logo,
        })
        .where(and(eq(team.name, teamData.displayName), eq(team.season, input)))
        .execute();
    }
  } catch (error) {
    console.error("Error syncing teams:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to sync ESPN teams data",
    });
  }
}
