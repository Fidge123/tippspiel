"use server";
import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { api } from "~/trpc/server";

interface FormState {
  name: string;
  message?: string;
}

export async function updateName(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const state = {
    name: formData.get("name") as string,
  } as FormState;

  if (!state.name) {
    return {
      ...state,
      name: state.name,
      message: "Fehler: Du musst einen Namen auswählen.",
    };
  }

  try {
    await api.user.updateName({
      name: state.name,
    });
    revalidatePath("/account");
    return {
      ...state,
      message: "Nutzername erfolgreich geändert.",
    };
  } catch (error: unknown) {
    if (error instanceof TRPCError && error.code === "INTERNAL_SERVER_ERROR") {
      return {
        ...state,
        message:
          "Fehler: Der Nutzername konnte nicht geändert werden. Bitte versuche es später erneut.",
      };
    }

    return {
      ...state,
      message: "Fehler: Ein unbekannter Fehler ist aufgetreten.",
    };
  }
}
