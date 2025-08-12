"use server";

import { TRPCError } from "@trpc/server";
import { api } from "~/trpc/server";

interface FormState {
  email: [string, boolean];
  message?: string;
  success?: boolean;
}

export async function forgotPassword(
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
    await api.user.forgotPassword({
      email: state.email[0],
    });

    return {
      ...state,
      success: true,
      message: "Link zum Zurücksetzen deines Passworts wurde gesendet.",
    };
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      switch (error.code) {
        case "NOT_FOUND":
          // Don't reveal if user exists for security reasons
          return {
            ...state,
            success: true,
            message: "Link zum Zurücksetzen deines Passworts wurde gesendet.",
          };
        case "BAD_REQUEST":
          if (error.message === "User is not verified") {
            return {
              ...state,
              email: [state.email[0], true],
              message:
                "Bitte bestätige zuerst deine E-Mail-Adresse, bevor du dein Passwort zurücksetzt.",
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
              "Bitte warte 5 Minuten, bevor du eine neue Passwort-Zurücksetzung anforderst.",
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
