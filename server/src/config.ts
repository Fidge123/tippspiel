import { env } from 'node:process';

export const basePath = env.BASE_PATH ?? '/tippspiel';
export const port = Number(env.PORT ?? 5002);
export const databaseUrl = env.DATABASE_URL;
