import { env } from 'node:process';

export const basePath = env.BASE_PATH ?? '/tippspiel';
export const port = Number(env.PORT ?? 5002);
export const databaseUrl = env.DATABASE_URL;
export const cookieSecret = env.COOKIE_SECRET ?? 'insecure-development-secret';
export const secureCookies = env.INSECURE_COOKIES !== 'true';
export const siteUrl = env.SITE_URL ?? 'https://nfl-tippspiel.de';
export const adminEmail = env.EMAIL;
export const season = Number(env.SEASON ?? 2026);
export const imageUrl = env.IMAGE_URL ?? 'https://nfl-tippspiel.de/logos/';
// Every browser test logs in from 127.0.0.1, so they would share one bucket.
export const rateLimitEnabled = env.RATE_LIMIT_DISABLED !== 'true';
// The scheduled imports call ESPN for real, which no test or dev server should.
export const jobsEnabled = env.JOBS_DISABLED !== 'true';
