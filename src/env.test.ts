import { describe, expect, it } from 'bun:test';
import { DEV_COOKIE_SECRET, type Finding, inspect } from './env';

const complete = {
  DATABASE_URL: 'postgresql://user:pw@127.0.0.1:5432/tippspiel',
  COOKIE_SECRET: 'a-real-secret',
  SMTP2GO_API_KEY: 'api-2GO-key',
  EMAIL: 'admin@example.invalid',
  R2_API: 'https://account.r2.cloudflarestorage.com',
  R2_ACCESS_KEY_ID: 'key',
  R2_SECRET_ACCESS_KEY: 'secret',
};

const fatal = (findings: Finding[]) =>
  findings.filter((f) => f.level === 'fatal').map((f) => f.variable);
const warnings = (findings: Finding[]) =>
  findings.filter((f) => f.level === 'warning').map((f) => f.variable);

describe('a complete environment', () => {
  it('reports nothing', () => {
    expect(inspect(complete)).toEqual([]);
  });
});

describe('what stops the server', () => {
  it('refuses to start without a database', () => {
    expect(fatal(inspect({ ...complete, DATABASE_URL: undefined }))).toEqual([
      'DATABASE_URL',
    ]);
  });

  it('refuses a database url of another scheme', () => {
    expect(
      fatal(inspect({ ...complete, DATABASE_URL: 'mysql://127.0.0.1/x' })),
    ).toEqual(['DATABASE_URL']);
  });

  it('refuses to sign sessions with the key from the repository', () => {
    expect(fatal(inspect({ ...complete, COOKIE_SECRET: undefined }))).toEqual([
      'COOKIE_SECRET',
    ]);
    expect(
      fatal(inspect({ ...complete, COOKIE_SECRET: DEV_COOKIE_SECRET })),
    ).toEqual(['COOKIE_SECRET']);
  });

  it('allows the development secret only where the deployment says it is insecure', () => {
    expect(
      inspect({
        ...complete,
        COOKIE_SECRET: undefined,
        INSECURE_COOKIES: 'true',
      }),
    ).toEqual([]);
  });

  // Number('abc') reaches the queries as NaN, which matches nothing rather
  // than failing.
  it('refuses a season or port that is not a number', () => {
    expect(fatal(inspect({ ...complete, SEASON: 'abc' }))).toEqual(['SEASON']);
    expect(fatal(inspect({ ...complete, SEASON: '26' }))).toEqual(['SEASON']);
    expect(fatal(inspect({ ...complete, PORT: 'http' }))).toEqual(['PORT']);
  });

  it('refuses a url that does not parse', () => {
    expect(
      fatal(inspect({ ...complete, SITE_URL: 'nfl-tippspiel.de' })),
    ).toEqual(['SITE_URL']);
    expect(fatal(inspect({ ...complete, IMAGE_URL: '///' }))).toEqual([
      'IMAGE_URL',
    ]);
  });

  it('accepts the values a real deployment sets', () => {
    expect(
      inspect({
        ...complete,
        SEASON: '2026',
        PORT: '5002',
        SITE_URL: 'https://nfl-tippspiel.de',
        IMAGE_URL: 'https://nfl-tippspiel.de/logos/',
      }),
    ).toEqual([]);
  });
});

describe('what only costs functionality', () => {
  it('runs without a mail key, and says what stops working', () => {
    const findings = inspect({ ...complete, SMTP2GO_API_KEY: undefined });
    expect(fatal(findings)).toEqual([]);
    expect(warnings(findings)).toEqual(['SMTP2GO_API_KEY']);
    expect(findings[0]!.message).toContain('password reset');
  });

  it('runs without an alert address', () => {
    const findings = inspect({ ...complete, EMAIL: undefined });
    expect(fatal(findings)).toEqual([]);
    expect(warnings(findings)).toEqual(['EMAIL']);
  });

  it('runs without R2, and names the corpus that stops growing', () => {
    const findings = inspect({ ...complete, R2_ACCESS_KEY_ID: undefined });
    expect(fatal(findings)).toEqual([]);
    expect(findings[0]!.message).toContain('golden-master');
  });

  it('stays quiet about R2 where nothing would record anyway', () => {
    expect(
      inspect({ ...complete, R2_API: undefined, JOBS_DISABLED: 'true' }),
    ).toEqual([]);
    expect(
      inspect({ ...complete, R2_API: undefined, SKIP_BACKUP: 'true' }),
    ).toEqual([]);
  });
});
