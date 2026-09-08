import { env } from 'node:process';

const api = 'https://gettestmail.com/api/gettestmail';

export interface Mailbox {
  id: string;
  emailAddress: string;
}

export interface Message {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}

function headers(): Record<string, string> {
  if (!env.GETTESTMAIL_KEY) {
    throw new Error('GETTESTMAIL_KEY is not set, so no mail can be received');
  }
  return {
    'Content-Type': 'application/json',
    'X-API-Key': env.GETTESTMAIL_KEY,
  };
}

async function read(
  response: Response,
): Promise<Mailbox & { message?: Message }> {
  if (!response.ok) {
    throw new Error(
      `GetTestMail responded with ${response.status}: ${await response.text()}`,
    );
  }
  return response.json();
}

export async function createMailbox(minutes: number): Promise<Mailbox> {
  const expiresAt = new Date(Date.now() + minutes * 60_000).toISOString();
  return read(
    await fetch(api, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ expiresAt }),
    }),
  );
}

// The endpoint holds the request open until a message arrives, but gives up before we do.
export async function waitForMessage(
  id: string,
  timeout: number,
): Promise<Message> {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const { message } = await read(
      await fetch(`${api}/${id}`, { headers: headers() }),
    );
    if (message) {
      return message;
    }
    await new Promise((done) => setTimeout(done, 1000));
  }
  throw new Error(`No mail reached the test mailbox within ${timeout}ms`);
}
