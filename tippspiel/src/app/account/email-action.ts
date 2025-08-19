"use server";
import { TRPCError } from "@trpc/server";
import { api } from "~/trpc/server";

interface FormState {
  email: string;
  message?: string;
}

export async function updateEmail(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const state = {
    email: formData.get("email") as string,
  } as FormState;

  if (!state.email) {
    return {
      ...state,
      email: state.email,
      message: "Fehler: E-Mail-Adresse ist erforderlich.",
    };
  }

  try {
    await api.user.updateEmail({
      email: state.email,
    });

    return {
      ...state,
      message:
        "E-Mail-Adresse erfolgreich geändert. Bitte verifiziere deine neue E-Mail-Adresse.",
    };
  } catch (error: unknown) {
    if (error instanceof TRPCError && error.code === "INTERNAL_SERVER_ERROR") {
      return {
        ...state,
        message:
          "Fehler: E-Mail-Adresse konnte nicht geändert werden. Versuche es später nochmal.",
      };
    }

    return {
      ...state,
      message: "Fehler: Ein unbekannter Fehler ist aufgetreten.",
    };
  }
}
