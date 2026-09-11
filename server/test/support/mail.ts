import type { Email } from '../../src/email/send';

// Stands in for src/email, so a test can read what the application tried to send.
export let sentEmails: Email[] = [];

export function clearSentEmails(): void {
  sentEmails = [];
}

export async function sendEmail(email: Email): Promise<void> {
  sentEmails.push(email);
}
