"use server";
import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { api } from "~/trpc/server";

interface FormState {
  leagueId: string;
  message?: string;
  success?: boolean;
}

export async function setDefaultLeagueAction(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const state = {
    leagueId: formData.get("leagueId") as string,
  } as FormState;

  if (!state.leagueId) {
    return {
      ...state,
      message: "Fehler: Liga-ID ist erforderlich.",
      success: false,
    };
  }

  try {
    await api.user.updateSettings({
      defaultLeague: state.leagueId,
    });

    revalidatePath("/leagues");
    revalidatePath("/account");
    revalidatePath(`/leagues/${state.leagueId}`);

    return {
      ...state,
      message: "Liga erfolgreich als Standard-Liga festgelegt.",
      success: true,
    };
  } catch (error: unknown) {
    if (error instanceof TRPCError && error.code === "INTERNAL_SERVER_ERROR") {
      return {
        ...state,
        message:
          "Fehler: Die Standard-Liga konnte nicht geändert werden. Bitte versuche es später erneut.",
        success: false,
      };
    }

    return {
      ...state,
      message: "Fehler: Ein unbekannter Fehler ist aufgetreten.",
      success: false,
    };
  }
}
