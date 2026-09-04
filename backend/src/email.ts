import { ServerClient } from 'postmark';
import { env } from 'node:process';

export interface RecordedEmail {
  From?: string;
  To?: string;
  Subject?: string;
  TextBody?: string;
  HtmlBody?: string;
  [key: string]: unknown;
}

/** What the stub transporter "sent"; only filled when POSTMARK is unset. */
export const sentEmails: RecordedEmail[] = [];

const transporter = createTransport();

export async function getTransporter() {
  return transporter;
}

async function createTransport() {
  try {
    if (env.POSTMARK) {
      return new ServerClient(env.POSTMARK);
    } else {
      return {
        sendEmail(message: RecordedEmail) {
          sentEmails.push(message);
          return Promise.resolve(message);
        },
      };
    }
  } catch (error) {
    console.log(error);
  }
}
