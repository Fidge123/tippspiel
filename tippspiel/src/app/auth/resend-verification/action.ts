"use server";

import { TRPCError } from "@trpc/server";
import { api } from "~/trpc/server";

interface FormState {
  email: [string, boolean];
  message?: string;
  success?: boolean;
}

export async function resendVerificationEmail(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const state = {
    email: [formData.get("email") as string, false],
  } as FormState;

  if (!state.email[0]) {
    return {
      ...state,
      email: [state.email[0], true],
      message: "E-Mail-Adresse ist erforderlich.",
    };
  }

  try {
    await api.user.resendVerification({
      email: state.email[0],
    });

    return {
      ...state,
      success: true,
      message: "Bestätigungs-E-Mail wurde erfolgreich gesendet!",
    };
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      switch (error.code) {
        case "NOT_FOUND":
          return {
            ...state,
            email: [state.email[0], true],
            message: "Kein Benutzer mit dieser E-Mail-Adresse gefunden.",
          };
        case "BAD_REQUEST":
          if (error.message === "User is already verified") {
            return {
              ...state,
              email: [state.email[0], true],
              message: "Dein Konto ist bereits bestätigt.",
            };
          }
          return {
            ...state,
            email: [state.email[0], true],
            message: "Eingabe ist ungültig.",
          };
        case "TOO_MANY_REQUESTS":
          return {
            ...state,
            message:
              "Bitte warte 5 Minuten, bevor du eine neue Bestätigungs-E-Mail anforderst.",
          };
        case "INTERNAL_SERVER_ERROR":
          return {
            ...state,
            message:
              "Fehler beim Senden der E-Mail. Bitte versuche es später erneut.",
          };
      }
    }

    return {
      ...state,
      message: "Ein unbekannter Fehler ist aufgetreten.",
    };
  }
}
