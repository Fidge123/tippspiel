"use server";
import { revalidatePath } from "next/cache";
import { api } from "~/trpc/server";

export async function renameLeagueAction(formData: FormData) {
  const leagueId = formData.get("leagueId");
  const name = formData.get("name");

  if (typeof leagueId !== "string" || leagueId.length === 0) return;
  if (typeof name !== "string" || name.trim().length === 0) return;

  await api.league.renameLeague({ leagueId, name: name.trim() });
  revalidatePath("/leagues");
  revalidatePath(`/leagues/${leagueId}`);
}
