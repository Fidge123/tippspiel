import { env } from "~/env";
import { sendEmail } from "./smtp2go";
import { createVerificationEmail } from "./templates";

export async function sendVerificationEmail(
  userEmail: string,
  userName: string,
  verificationToken: string,
): Promise<void> {
  const emailContent = await createVerificationEmail(
    userName,
    verificationToken,
    env.APP_URL,
  );

  await sendEmail({
    to: userEmail,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });
}

export { sendEmail } from "./smtp2go";
export { renderEmailTemplate } from "./templates";
