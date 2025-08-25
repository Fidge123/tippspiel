"use server";

import { TRPCError } from "@trpc/server";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

interface FormState {
  email: [string, boolean];
  name: [string, boolean];
  password: [string, boolean];
  confirmPassword: [string, boolean];
  consent: [string, boolean];
  message?: string;
}

export async function registerUser(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const state = {
    email: [formData.get("email") as string, false],
    name: [formData.get("name") as string, false],
    password: [formData.get("password") as string, false],
    confirmPassword: [formData.get("confirmPassword") as string, false],
    consent: [formData.get("consent") as string, false],
  } as FormState;

  try {
    if (!state.consent[0]) {
      return {
        ...state,
        consent: [state.consent[0], true],
        message: "Die Nutzungsbedingungen müssen akzeptiert werden.",
      };
    }

    if (state.password[0] !== state.confirmPassword[0]) {
      return {
        ...state,
        confirmPassword: [state.confirmPassword[0], true],
        message: "Die Passwörter stimmen nicht überein.",
      };
    }

    await api.user.register({
      email: state.email[0],
      name: state.name[0].trim(),
      password: state.password[0],
      consent: new Date(),
    });
  } catch (error: unknown) {
    if (error instanceof TRPCError && error.code === "CONFLICT") {
      return {
        ...state,
        email: [state.email[0], true],
        message: "Diese E-Mail-Adresse wurde bereits registriert.",
      };
    }
    return { ...state, message: "Ein unbekannter Fehler ist aufgetreten." };
  }

  redirect("/auth/register/success");
  return state;
}
