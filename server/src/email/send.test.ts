import { env } from 'node:process';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sendEmail } from './send';

const email = {
  to: 'spieler@example.invalid',
  subject: 'Du hast ein Spiel noch nicht getippt',
  text: 'Hallo Spieler',
  html: '<p>Hallo Spieler</p>',
};

function respondWith(body: unknown, init: ResponseInit = {}) {
  const fetchMock = vi.fn(
    async (_url: string, _init: RequestInit) =>
      new Response(JSON.stringify(body), init),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  delete env.SMTP2GO_API_KEY;
});

describe('without an API key', () => {
  it('sends nothing', async () => {
    const fetchMock = respondWith({});

    await sendEmail(email);

    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('without a recipient', () => {
  it('sends nothing when EMAIL is not configured', async () => {
    env.SMTP2GO_API_KEY = 'api-2GO-key';
    const fetchMock = respondWith({});

    await sendEmail({ ...email, to: '' });

    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('with an API key', () => {
  beforeEach(() => {
    env.SMTP2GO_API_KEY = 'api-2GO-key';
  });

  it('posts the email to the SMTP2GO API', async () => {
    const fetchMock = respondWith({ data: { succeeded: 1, failed: 0 } });

    await sendEmail(email);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.smtp2go.com/v3/email/send');
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({
      'Content-Type': 'application/json',
      'X-Smtp2go-Api-Key': 'api-2GO-key',
    });
    expect(JSON.parse(String(init.body))).toEqual({
      sender: 'Tippspiel <tippspiel@nfl-tippspiel.de>',
      to: ['spieler@example.invalid'],
      subject: 'Du hast ein Spiel noch nicht getippt',
      text_body: 'Hallo Spieler',
      html_body: '<p>Hallo Spieler</p>',
    });
  });

  it('throws when the API rejects the request', async () => {
    respondWith({ error: 'nope' }, { status: 401 });

    await expect(sendEmail(email)).rejects.toThrow(
      'SMTP2GO responded with 401',
    );
  });

  it('throws when a recipient fails', async () => {
    respondWith({
      data: {
        succeeded: 0,
        failed: 1,
        failures: [
          {
            email: 'spieler@example.invalid',
            error_code: 'E_ParseError',
            error_message: 'Invalid recipient',
          },
        ],
      },
    });

    await expect(sendEmail(email)).rejects.toThrow(
      'SMTP2GO rejected 1 recipient(s): spieler@example.invalid: Invalid recipient (E_ParseError)',
    );
  });
});
