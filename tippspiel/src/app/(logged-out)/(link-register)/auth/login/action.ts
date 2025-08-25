"use server";

import { redirect } from "next/navigation";
import { CredentialsSignin } from "next-auth";
import { signIn } from "~/server/auth";

interface FormState {
  email: [string, boolean];
  password: [string, boolean];
  callbackUrl: string;
  unverified: boolean;
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
  } catch (error: unknown) {
    if (error instanceof CredentialsSignin) {
      switch (error.code) {
        case "unverified":
          return {
            email: [formData.get("email") as string, false],
            password: [formData.get("password") as string, false],
            callbackUrl,
            unverified: true,
            message: "Noch nicht verifiziert. Bitte überprüfe deine E-Mails.",
          };
        // case "invalid_password":
        // case "unknown_user":
        default:
          return {
            email: [formData.get("email") as string, false],
            password: [formData.get("password") as string, true],
            callbackUrl,
            unverified: false,
            message: "Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.",
          };
      }
    }
  }
  redirect(callbackUrl || "/");
}
