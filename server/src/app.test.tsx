import { describe, expect, it, vi } from 'vitest';

let reachable = true;

vi.mock('./db/kysely', () => ({
  isDatabaseReachable: vi.fn(() => Promise.resolve(reachable)),
  db: vi.fn(),
  closeDatabase: vi.fn(),
}));

const { app } = await import('./app');

describe('/impressum', () => {
  it('renders the page as a full HTML document', async () => {
    const response = await app.request('/tippspiel/impressum');

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');

    const html = await response.text();
    expect(html).toMatch(/^<!DOCTYPE html>/);
    expect(html).toContain('<title>Impressum</title>');
  });

  it('ships no JavaScript', async () => {
    const html = await (await app.request('/tippspiel/impressum')).text();

    expect(html).not.toContain('<script');
  });

  it('carries the Impressum, Datenschutz and Legal sections', async () => {
    const html = await (await app.request('/tippspiel/impressum')).text();

    expect(html).toContain('Impressum');
    expect(html).toContain('Datenschutz');
    expect(html).toContain('Legal information');
    expect(html).toContain('Konrad-Zuse-Ring 10');
    expect(html).toContain('admin@nfl-tippspiel.de');
  });

  it('keeps German umlauts intact', async () => {
    const html = await (await app.request('/tippspiel/impressum')).text();

    expect(html).toContain('fällt unter die berechtigten Interessen');
    expect(html).toContain('Außerdem');
  });
});

describe('/health', () => {
  it('reports ok while the database answers', async () => {
    reachable = true;
    const response = await app.request('/tippspiel/health');

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok', database: true });
  });

  it('reports degraded with 503 when the database does not', async () => {
    reachable = false;
    const response = await app.request('/tippspiel/health');

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      status: 'degraded',
      database: false,
    });
  });
});

describe('the auth forms', () => {
  it.each([
    ['/tippspiel/login', 'Mit bestehendem Konto einloggen'],
    ['/tippspiel/register', 'Ein neues Konto registrieren'],
    ['/tippspiel/reset', 'Passwort zurücksetzen'],
    ['/tippspiel/verify', 'Account bestätigen'],
  ])('renders %s without JavaScript', async (path, heading) => {
    const response = await app.request(path);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain(heading);
    expect(html).not.toContain('<script');
    expect(html).toContain('method="post"');
  });

  it('carries the link id and token into the verify form', async () => {
    const html = await (
      await app.request('/tippspiel/verify?id=abc&token=def')
    ).text();

    expect(html).toContain('name="id" value="abc"');
    expect(html).toContain('name="token" value="def"');
  });

  it('sends the forgotten-password button to the reset request', async () => {
    const html = await (await app.request('/tippspiel/login')).text();

    expect(html).toContain('formaction="/tippspiel/reset/request"');
    expect(html).toContain('Passwort vergessen?');
  });
});

describe('routing', () => {
  it('does not answer outside the base path', async () => {
    expect((await app.request('/impressum')).status).toBe(404);
  });
});
