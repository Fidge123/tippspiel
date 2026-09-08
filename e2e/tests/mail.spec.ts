import { startBackend } from '../harness/backend';
import { createMailbox, waitForMessage } from '../harness/gettestmail';
import { mailApiPort } from '../harness/ports';
import { password } from '../harness/seed';
import { expect, test } from './app';

const MAILBOX_MINUTES = 15;
const DELIVERY_TIMEOUT = 120_000;

// The free tier allows 300 mails a month, so this is the only flow that sends one.
test('the verification mail is delivered through SMTP2GO', async ({
  page,
  request,
}) => {
  test.setTimeout(DELIVERY_TIMEOUT + 60_000);

  const apiKey = process.env.SMTP2GO_API_KEY;
  expect(
    apiKey,
    'SMTP2GO_API_KEY is not set, so no mail can be sent',
  ).toBeTruthy();

  const mailbox = await createMailbox(MAILBOX_MINUTES);
  // Without EMAIL the backend skips the admin alert, which would cost a second mail.
  const backend = await startBackend(
    process.env.E2E_DATABASE_URL ?? '',
    mailApiPort,
    { EMAIL: undefined, SMTP2GO_API_KEY: apiKey },
  );

  try {
    const registered = await request.post(
      `http://127.0.0.1:${mailApiPort}/user/register`,
      {
        data: {
          email: mailbox.emailAddress,
          name: 'Erika',
          consent: true,
          password,
        },
      },
    );
    expect(registered.ok()).toBe(true);

    const message = await waitForMessage(mailbox.id, DELIVERY_TIMEOUT);
    expect(message.from).toContain('tippspiel@nfl-tippspiel.de');
    expect(message.subject).toBe(
      'Bitte verifiziere deinen neuen Tippspiel Account',
    );
    expect(message.html).toContain('Erika');

    const link = /verify\?id=([^&]+)&token=(\w+)/.exec(message.text);
    expect(
      link,
      `No verification link in the mail:\n${message.text}`,
    ).not.toBeNull();

    await page.goto(`./verify?id=${link?.[1]}&token=${link?.[2]}`);
    await expect(
      page.getByText('Account erfolgreich bestätigt!'),
    ).toBeVisible();

    await page.goto('./login');
    await page.getByLabel('E-Mail').fill(mailbox.emailAddress);
    await page.getByLabel('Passwort').fill(password);
    await page.getByRole('button', { name: 'Einloggen' }).click();
    await expect(page.getByRole('link', { name: 'Tabelle' })).toBeVisible();
  } finally {
    await backend.stop();
  }
});
