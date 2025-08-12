"use server";

import { TRPCError } from "@trpc/server";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

interface FormState {
  password: [string, boolean];
  confirmPassword: [string, boolean];
  token: string;
  message?: string;
  success?: boolean;
}

export async function resetPassword(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const token = formData.get("token") as string;

  const state = {
    password: [password, false],
    confirmPassword: [confirmPassword, false],
    token,
  } as FormState;

  if (password !== confirmPassword) {
    return {
      ...state,
      confirmPassword: [confirmPassword, true],
      message: "Die Passwörter stimmen nicht überein.",
    };
  }

  try {
    await api.user.resetPassword({
      token: state.token,
      password: password,
    });
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      switch (error.code) {
        case "NOT_FOUND":
          return {
            ...state,
            message: "Ungültiger oder abgelaufener Reset-Link.",
          };
        case "BAD_REQUEST":
          if (error.message === "Reset token has expired") {
            return {
              ...state,
              message:
                "Der Reset-Link ist abgelaufen. Bitte fordere einen neuen an.",
            };
          }
          return {
            ...state,
            message: "Ungültiger Reset-Link.",
          };
        case "INTERNAL_SERVER_ERROR":
          return {
            ...state,
            message:
              "Ein Fehler ist aufgetreten. Bitte versuche es später erneut.",
          };
      }
    }

    return {
      ...state,
      message: "Ein unbekannter Fehler ist aufgetreten.",
    };
  }

  redirect("/auth/login?message=password-reset-success");
}
