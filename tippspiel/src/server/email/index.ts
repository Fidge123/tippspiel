import { env } from "~/env";
import { sendEmail } from "./smtp2go";
import { renderEmailTemplate } from "./templates";

export async function sendVerificationEmail(
  to: string,
  userName: string,
  verificationToken: string,
): Promise<void> {
  const emailContent = await renderEmailTemplate(
    "verification",
    {
      userName,
      verificationUrl: `${env.APP_URL}/auth/verify?token=${verificationToken}`,
      appUrl: env.APP_URL,
    },
    "Tippspiel - E-Mail-Adresse bestätigen",
  );

  await sendEmail({ to, ...emailContent });
}

export async function sendPasswordResetEmail(
  to: string,
  userName: string,
  resetToken: string,
): Promise<void> {
  const emailContent = await renderEmailTemplate(
    "reset",
    {
      userName,
      resetUrl: `${env.APP_URL}/auth/reset?token=${resetToken}`,
      appUrl: env.APP_URL,
    },
    "Tippspiel - Passwort zurücksetzen",
  );

  await sendEmail({ to, ...emailContent });
}

export async function sendNotification(
  to: string,
  name: string,
  content: string,
): Promise<void> {
  const emailContent = await renderEmailTemplate(
    "notify",
    {
      name,
      content,
      timestamp: new Date().toISOString(),
      appUrl: env.APP_URL,
    },
    "Tippspiel - Wichtige Mitteilung",
  );

  await sendEmail({ to, ...emailContent });
}

export {
  notifyExcessiveFailedLogins,
  notifyNewUserRegistration,
  notifyPasswordResetRequested,
  notifyUserEmailVerified,
  sendAdminNotification,
} from "./admin";
export { sendEmail } from "./smtp2go";
export { renderEmailTemplate } from "./templates";
