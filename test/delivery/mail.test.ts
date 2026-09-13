import { randomUUID } from 'node:crypto';
import { env } from 'node:process';
import { beforeAll, describe, expect, it } from 'vitest';
import { sendEmail } from '../../src/email/send';
import { waitForDelivery } from './activity';

const DELIVERY_TIMEOUT = 300_000;

const subject = `Zustellungsprüfung ${randomUUID()}`;
const body =
  'Diese E-Mail stammt aus der automatischen Zustellungsprüfung des Tippspiels.';

describe('SMTP2GO', () => {
  beforeAll(() => {
    expect(env.SMTP2GO_API_KEY, 'SMTP2GO_API_KEY is not set').toBeTruthy();
    expect(env.EMAIL, 'EMAIL is not set').toBeTruthy();
  });

  it('accepts a mail and reports it as delivered', async () => {
    await sendEmail({
      to: env.EMAIL,
      subject,
      text: body,
      html: `<p>${body}</p>`,
    });

    const delivered = await waitForDelivery(subject, DELIVERY_TIMEOUT);

    expect(delivered.recipient).toBe(env.EMAIL);
  }, 360_000);
});
