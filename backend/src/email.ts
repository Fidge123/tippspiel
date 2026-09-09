import { env } from 'node:process';

export interface Email {
  to: string;
  subject: string;
  text: string;
  html: string;
}

interface SMTP2GoResponse {
  data?: {
    failed?: number;
    failures?: { email: string; error_code: string; error_message: string }[];
  };
}

const SENDER = 'Tippspiel <tippspiel@nfl-tippspiel.de>';
const API_URL = 'https://api.smtp2go.com/v3/email/send';

export const sentEmails: Email[] = [];

export function clearSentEmails(): void {
  sentEmails.length = 0;
}

export async function sendEmail(email: Email): Promise<void> {
  // The admin alerts go to EMAIL, which a deployment may leave unset.
  if (!email.to) {
    return;
  }

  if (!env.SMTP2GO_API_KEY) {
    sentEmails.push(email);
    return;
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Smtp2go-Api-Key': env.SMTP2GO_API_KEY,
    },
    body: JSON.stringify({
      sender: SENDER,
      to: [email.to],
      subject: email.subject,
      text_body: email.text,
      html_body: email.html,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `SMTP2GO responded with ${response.status}: ${await response.text()}`,
    );
  }

  const { data } = (await response.json()) as SMTP2GoResponse;

  if (data?.failed) {
    const failures = (data.failures ?? [])
      .map((f) => `${f.email}: ${f.error_message} (${f.error_code})`)
      .join(', ');
    throw new Error(
      `SMTP2GO rejected ${data.failed} recipient(s): ${failures}`,
    );
  }
}
