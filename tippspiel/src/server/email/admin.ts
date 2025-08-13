import { env } from "~/env";
import { sendEmail } from "./smtp2go";
import { renderEmailTemplate } from "./templates";

export interface AdminNotificationOptions {
  subject: string;
  content: string;
  email: string;
  name?: string;
}

export async function sendAdminNotification({
  subject,
  content,
  email,
  name,
}: AdminNotificationOptions): Promise<void> {
  const timestamp = new Date().toLocaleString("de-DE", {
    timeZone: "Europe/Berlin",
  });

  await sendEmail({
    to: env.SMTP2GO_SENDER_EMAIL,
    ...(await renderEmailTemplate(
      "admin",
      {
        timestamp,
        content,
        email,
        name,
        appUrl: env.APP_URL,
      },
      `[Tippspiel Admin] ${subject}`,
    )),
  });
}

export async function notifyNewUserRegistration(email: string, name: string) {
  await sendAdminNotification({
    subject: "Neue Benutzerregistrierung",
    content: "Ein neuer Benutzer hat sich registriert.",
    email,
    name,
  });
}

export async function notifyUserEmailVerified(email: string, name: string) {
  await sendAdminNotification({
    subject: "Benutzer E-Mail verifiziert",
    content: "Ein Benutzer hat seine E-Mail-Adresse erfolgreich verifiziert.",
    email,
    name,
  });
}

export async function notifyPasswordResetRequested(
  email: string,
  name: string,
) {
  await sendAdminNotification({
    subject: "Passwort-Reset angefordert",
    content: "Ein Benutzer hat einen Passwort-Reset angefordert.",
    email,
    name,
  });
}

export async function notifyExcessiveFailedLogins(email: string) {
  await sendAdminNotification({
    subject: "Verdächtige Anmeldeaktivität",
    content: `Übermäßig viele fehlgeschlagene Anmeldeversuche erkannt.`,
    email,
  });
}
