import { revalidatePath } from "next/cache";
import { api } from "~/trpc/server";

export async function addAdminAction(formData: FormData) {
  "use server";
  const leagueId = formData.get("leagueId");
  const userId = formData.get("userId");
  if (typeof leagueId !== "string" || typeof userId !== "string") return;
  await api.league.addAdmin({ leagueId, userId });
  revalidatePath("/leagues");
}

export async function removeAdminAction(formData: FormData) {
  "use server";
  const leagueId = formData.get("leagueId");
  const userId = formData.get("userId");
  if (typeof leagueId !== "string" || typeof userId !== "string") return;
  await api.league.removeAdmin({ leagueId, userId });
  revalidatePath("/leagues");
}
