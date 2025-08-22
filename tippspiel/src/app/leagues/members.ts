"use server";
import { revalidatePath } from "next/cache";
import { api } from "~/trpc/server";

export async function addMemberAction(formData: FormData) {
  const leagueId = formData.get("leagueId");
  const email = formData.get("email");

  if (typeof leagueId !== "string" || leagueId.length === 0) return;
  if (typeof email !== "string" || email.trim().length === 0) return;

  await api.league.addMember({ leagueId, email: email.trim() });
  revalidatePath("/leagues");
}

export async function removeMemberAction(formData: FormData) {
  const leagueId = formData.get("leagueId");
  const userId = formData.get("userId");

  if (typeof leagueId !== "string" || leagueId.length === 0) {
    return;
  }
  if (typeof userId !== "string" || userId.length === 0) {
    return;
  }

  await api.league.removeMember({ leagueId, userId });
  revalidatePath("/leagues");
}
