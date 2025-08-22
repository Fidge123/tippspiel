"use server";
import { revalidatePath } from "next/cache";
import { api } from "~/trpc/server";

export async function createLeagueAction(formData: FormData) {
  const name = formData.get("name");
  const season = formData.get("season");
  if (typeof name !== "string" || name.trim().length === 0) return;
  const payload: { name: string; season?: number } = { name: name.trim() };
  if (typeof season === "string" && season.length > 0) {
    const parsed = Number(season);
    if (!Number.isNaN(parsed)) payload.season = parsed;
  }
  await api.league.createLeague(payload);
  revalidatePath("/leagues");
}
