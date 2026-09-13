import { env as processEnv, exit } from 'node:process';

export interface Finding {
  level: 'fatal' | 'warning';
  variable: string;
  message: string;
}

type Env = Record<string, string | undefined>;

/** Signing sessions with this would let anyone mint a cookie for any account. */
export const DEV_COOKIE_SECRET = 'insecure-development-secret';

function url(value: string): URL | undefined {
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}

export function inspect(env: Env): Finding[] {
  const findings: Finding[] = [];
  const fatal = (variable: string, message: string) =>
    findings.push({ level: 'fatal', variable, message });
  const warn = (variable: string, message: string) =>
    findings.push({ level: 'warning', variable, message });

  const database = env.DATABASE_URL;
  if (!database) {
    fatal('DATABASE_URL', 'not set, and every page reads the database');
  } else if (!/^postgres(ql)?:\/\//.test(database)) {
    fatal('DATABASE_URL', 'is not a postgres:// or postgresql:// url');
  }

  // An unset secret is not a missing feature but a forgeable session, so it is
  // fatal anywhere the deployment is not already declaring itself insecure.
  const secret = env.COOKIE_SECRET;
  if (
    (!secret || secret === DEV_COOKIE_SECRET) &&
    env.INSECURE_COOKIES !== 'true'
  ) {
    fatal(
      'COOKIE_SECRET',
      secret
        ? 'is the development default that ships in the repository, so anyone could forge a session'
        : 'not set, so sessions would be signed with the key that ships in the repository',
    );
  }

  if (env.PORT !== undefined && !/^\d+$/.test(env.PORT)) {
    fatal('PORT', `is not a number: ${env.PORT}`);
  }

  // Number('') and Number('abc') both reach the queries as NaN, which matches
  // no season at all rather than failing.
  if (env.SEASON !== undefined && !/^\d{4}$/.test(env.SEASON)) {
    fatal('SEASON', `is not a four-digit year: ${env.SEASON}`);
  }

  for (const variable of ['SITE_URL', 'IMAGE_URL'] as const) {
    const value = env[variable];
    if (value !== undefined && !url(value)) {
      fatal(variable, `is not a url: ${value}`);
    }
  }

  if (!env.SMTP2GO_API_KEY) {
    warn(
      'SMTP2GO_API_KEY',
      'not set, so no mail is sent: registration, verification and password reset cannot be completed',
    );
  }

  if (!env.EMAIL) {
    warn(
      'EMAIL',
      'not set, so admin alerts go nowhere and a failed ESPN import stays silent',
    );
  }

  const r2 = ['R2_API', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'] as const;
  const missingR2 = r2.filter((variable) => !env[variable]);
  if (missingR2.length && env.JOBS_DISABLED !== 'true' && !env.SKIP_BACKUP) {
    warn(
      missingR2.join(', '),
      `not set, so imports record to ${env.BACKUP_DIR ?? 'the home directory'} instead of the bucket and the golden-master corpus stops growing`,
    );
  }

  return findings;
}

/** Stops the process when a variable is missing in a way running cannot recover from. */
export function checkEnvironment(env: Env = processEnv): void {
  const findings = inspect(env);

  for (const { level, variable, message } of findings) {
    const line = `${variable} ${message}`;
    if (level === 'fatal') {
      console.error(`FATAL  ${line}`);
    } else {
      console.warn(`WARN   ${line}`);
    }
  }

  if (findings.some((finding) => finding.level === 'fatal')) {
    console.error(
      'Refusing to start. Set the variables above in /etc/tippspiel/server.env; deploy/README.md documents each one.',
    );
    exit(1);
  }
}
