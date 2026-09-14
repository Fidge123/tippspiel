import type { Email } from '../../src/email/send';

export let sentEmails: Email[] = [];

export function clearSentEmails(): void {
  sentEmails = [];
}

export async function sendEmail(email: Email): Promise<void> {
  sentEmails.push(email);
}
