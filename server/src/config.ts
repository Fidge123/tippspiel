import { env } from 'node:process';

export const basePath = env.BASE_PATH ?? '/tippspiel';
export const port = Number(env.PORT ?? 5002);
export const databaseUrl = env.DATABASE_URL;
export const cookieSecret = env.COOKIE_SECRET ?? 'insecure-development-secret';
export const refreshSecret = env.REFRESH_SECRET;
export const secureCookies = env.INSECURE_COOKIES !== 'true';
export const siteUrl = env.SITE_URL ?? 'https://nfl-tippspiel.de';
export const adminEmail = env.EMAIL;
