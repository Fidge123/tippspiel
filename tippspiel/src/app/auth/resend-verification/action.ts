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
              message: "Ihr Konto ist bereits bestätigt.",
            };
          }
          break;
        case "TOO_MANY_REQUESTS":
          return {
            ...state,
            message:
              "Bitte warten Sie 5 Minuten, bevor Sie eine neue Bestätigungs-E-Mail anfordern.",
          };
        case "INTERNAL_SERVER_ERROR":
          return {
            ...state,
            message:
              "Fehler beim Senden der E-Mail. Bitte versuchen Sie es später erneut.",
          };
      }
    }

    return {
      ...state,
      message: "Ein unbekannter Fehler ist aufgetreten.",
    };
  }
}
