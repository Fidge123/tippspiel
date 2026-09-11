import { env } from 'node:process';

const SEARCH_URL = 'https://api.smtp2go.com/v3/activity/search';

export interface ActivityEvent {
  event: string;
  recipient: string;
  subject: string;
  smtp_response: string;
  date: string;
}

// Anything else means the mail will never arrive, so waiting longer is pointless.
const FAILED = ['hard-bounced', 'rejected', 'spam'];

async function search(subject: string): Promise<ActivityEvent[]> {
  const response = await fetch(SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Smtp2go-Api-Key': String(env.SMTP2GO_API_KEY),
    },
    body: JSON.stringify({
      search_subject: subject,
      start_date: new Date(Date.now() - 60 * 60_000).toISOString(),
      only_latest: true,
      limit: 10,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Activity search responded with ${response.status}: ${await response.text()}`,
    );
  }

  const { data } = (await response.json()) as {
    data?: { events?: ActivityEvent[] };
  };
  return data?.events ?? [];
}

export async function waitForDelivery(
  subject: string,
  timeout: number,
): Promise<ActivityEvent> {
  const deadline = Date.now() + timeout;
  let last = 'nothing at all';

  while (Date.now() < deadline) {
    for (const event of await search(subject)) {
      if (event.event === 'delivered') {
        return event;
      }
      last = `${event.event} (${event.smtp_response})`;
      if (FAILED.includes(event.event)) {
        throw new Error(`SMTP2GO reports ${last}`);
      }
    }
    await new Promise((done) => setTimeout(done, 5000));
  }

  throw new Error(
    `SMTP2GO did not report a delivery within ${timeout}ms, last saw ${last}`,
  );
}
