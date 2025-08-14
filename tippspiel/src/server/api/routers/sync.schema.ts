import { z } from "zod";

export const leagueResponseSchema = z.object({
  response: z.array(
    z.object({
      league: z.object({
        id: z.number(),
        name: z.string(),
        logo: z.string(),
      }),
      country: z.object({
        name: z.string(),
        code: z.string(),
        flag: z.string(),
      }),
      seasons: z.array(
        z.object({
          year: z.number(),
          start: z.string(),
          end: z.string(),
          current: z.boolean(),
        }),
      ),
    }),
  ),
});

export const teamResponseSchema = z.object({
  response: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      code: z.string(),
      city: z.string(),
      logo: z.string(),
      established: z.number(),
    }),
  ),
});

export const standingsResponseSchema = z.object({
  response: z.array(
    z.object({
      league: z.object({
        id: z.number(),
        name: z.string(),
        season: z.number(),
      }),
      conference: z.string(),
      division: z.string(),
      position: z.number(),
      team: z.object({
        id: z.number(),
        name: z.string(),
        logo: z.string(),
      }),
      won: z.number(),
      lost: z.number(),
      ties: z.number(),
      points: z.object({
        for: z.number(),
        against: z.number(),
        difference: z.number(),
      }),
      streak: z.string(),
    }),
  ),
});

export const gameResponseSchema = z.object({
  response: z.array(
    z.object({
      game: z.object({
        id: z.number(),
        stage: z.string(),
        week: z.string(),
        date: z.object({
          date: z.string(),
          time: z.string(),
          timestamp: z.number(),
        }),
        status: z.object({
          short: z.string(),
          long: z.string(),
        }),
      }),
      teams: z.object({
        home: z.object({
          id: z.number(),
          name: z.string().nullable(),
          logo: z.string(),
        }),
        away: z.object({
          id: z.number(),
          name: z.string().nullable(),
          logo: z.string(),
        }),
      }),
      scores: z.object({
        home: z.object({
          quarter_1: z.number().nullable(),
          quarter_2: z.number().nullable(),
          quarter_3: z.number().nullable(),
          quarter_4: z.number().nullable(),
          overtime: z.number().nullable(),
          total: z.number().nullable(),
        }),
        away: z.object({
          quarter_1: z.number().nullable(),
          quarter_2: z.number().nullable(),
          quarter_3: z.number().nullable(),
          quarter_4: z.number().nullable(),
          overtime: z.number().nullable(),
          total: z.number().nullable(),
        }),
      }),
    }),
  ),
});
