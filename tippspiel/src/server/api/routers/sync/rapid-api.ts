import { TRPCError } from "@trpc/server";
import { env } from "~/env";

const RAPIDAPI_HOST = "api-american-football.p.rapidapi.com";
const RAPIDAPI_BASE_URL = `https://${RAPIDAPI_HOST}`;

export async function fetchFromRapidAPI(endpoint: string) {
  const response = await fetch(`${RAPIDAPI_BASE_URL}${endpoint}`, {
    headers: {
      "x-rapidapi-key": env.RAPIDAPI_KEY,
      "x-rapidapi-host": RAPIDAPI_HOST,
    },
  });

  if (!response.ok) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `RapidAPI request failed: ${response.status} ${response.statusText}`,
    });
  }

  return response.json();
}
