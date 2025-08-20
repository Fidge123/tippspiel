"use server";
import { TRPCError } from "@trpc/server";
import { api } from "~/trpc/server";

export async function updatePassword(
  _: string,
  formData: FormData,
): Promise<string> {
  const old = formData.get("old") as string;
  const password = formData.get("new") as string;
  const check = formData.get("check") as string;

  if (check !== password) {
    return "Fehler: Deine Passwörter müssen übereinstimmen.";
  }

  try {
    await api.user.updatePassword({
      old,
      new: password,
    });

    return "Dein Passwort wurde erfolgreich geändert. Du wirst in 3 Sekunden ausgeloggt.";
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      switch (error.code) {
        case "INTERNAL_SERVER_ERROR":
          return "Fehler: Dein Passwort konnte nicht geändert werden. Bitte versuche es später erneut.";
        case "BAD_REQUEST":
          return "Fehler: Dein altes Passwort ist falsch.";
      }
    }

    return "Fehler: Ein unbekannter Fehler ist aufgetreten.";
  }
}
