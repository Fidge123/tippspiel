"use server";

import { redirect } from "next/navigation";
import { signIn } from "~/server/auth";

interface FormState {
  email: [string, boolean];
  password: [string, boolean];
  callbackUrl: string;
  message?: string;
}

export async function login(
  { callbackUrl }: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });
  } catch (e: unknown) {
    return {
      email: [formData.get("email") as string, false],
      password: [formData.get("password") as string, true],
      callbackUrl,
      message: `Ungültige Anmeldedaten. Bitte versuchen Sie es erneut. ${e instanceof Error ? e.message : ""}`,
    };
  }
  redirect(callbackUrl || "/");
}
