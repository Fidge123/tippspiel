"use server";

import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { api } from "~/trpc/server";

export async function placeBetAction(formData: FormData) {
  try {
    const gameId = parseInt(formData.get("gameId") as string);
    const teamId = parseInt(formData.get("teamId") as string);
    const value = parseInt(formData.get("value") as string);
    const leagueId = formData.get("leagueId") as string;
    const week = formData.get("week") as string;

    if (!gameId || !teamId || !value || !leagueId) {
      throw new Error("Fehlende Parameter");
    }

    await api.gameBet.placeBet({
      gameId,
      teamId,
      value,
      leagueId,
    });

    // Revalidate the current page to show updated bet state
    revalidatePath(`/${leagueId}/${week}`);
  } catch (error) {
    if (error instanceof TRPCError) {
      throw new Error(error.message);
    }
    throw new Error("Fehler beim Speichern des Tipps");
  }
}
