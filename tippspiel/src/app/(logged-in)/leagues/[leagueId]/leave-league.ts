"use server";
import { revalidatePath } from "next/cache";
import { api } from "~/trpc/server";

export async function leaveLeagueAction(formData: FormData) {
  const leagueId = formData.get("leagueId");
  if (typeof leagueId !== "string" || leagueId.length === 0) return;
  await api.league.leaveLeague({ leagueId });
  revalidatePath("/leagues");
  revalidatePath(`/leagues/${leagueId}`);
}
