"use server";
import { revalidatePath } from "next/cache";
import { api } from "~/trpc/server";

export async function getAction(leagueId: string, division: string) {
  return async function moveTeam(formData: FormData) {
    "use server";
    const teamId = parseInt(formData.get("teamId") as string);
    const direction = formData.get("direction") as string;
    const currentOrder = (formData.get("currentOrder") as string)
      .split(",")
      .map((id) => parseInt(id));

    const currentIndex = currentOrder.findIndex((id) => id === teamId);
    if (currentIndex === -1) return;

    const newOrder = [...currentOrder];

    if (direction === "up" && currentIndex > 0) {
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [
        newOrder[currentIndex - 1] as number,
        newOrder[currentIndex] as number,
      ];
    } else if (direction === "down" && currentIndex < newOrder.length - 1) {
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [
        newOrder[currentIndex + 1] as number,
        newOrder[currentIndex] as number,
      ];
    } else {
      return;
    }

    if (newOrder.length === 4) {
      await api.divisionBet.upsertDivisionBet({
        leagueId,
        division,
        first: newOrder[0] as number,
        second: newOrder[1] as number,
        third: newOrder[2] as number,
        fourth: newOrder[3] as number,
      });

      revalidatePath(`/${leagueId}/divisions`);
    }
  };
}
