import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { env } from 'node:process';
import { gunzip as gunzipCb } from 'node:zlib';
import { promisify } from 'node:util';
import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';

const gunzip = promisify(gunzipCb);

export const BUCKET = env.R2_BUCKET ?? 'nfl-tippspiel';

// Every key carries the timestamp it was written at, so nothing is ever
// rewritten and the cache never needs invalidating.
export const CACHE_DIR = resolve(
  env.REPLAY_CACHE_DIR ?? join(__dirname, '..', '.corpus-cache'),
);

let client: S3Client | undefined;

export function missingCredentials(): string[] {
  return ['R2_API', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'].filter(
    (name) => !env[name],
  );
}

function getClient(): S3Client {
  const missing = missingCredentials();
  if (missing.length) {
    throw new Error(
      `The season replay reads its fixtures from the ${BUCKET} bucket. Missing: ${missing.join(', ')}.`,
    );
  }
  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: env.R2_API,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return client;
}

export async function listKeys(prefix: string): Promise<string[]> {
  const cache = join(CACHE_DIR, '_index', `${encodeURIComponent(prefix)}.json`);
  const cached = await readFile(cache, 'utf8').catch(() => undefined);
  if (cached) {
    return JSON.parse(cached);
  }

  const s3 = getClient();
  const keys: string[] = [];
  let ContinuationToken: string | undefined;
  do {
    const page = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: prefix,
        ContinuationToken,
      }),
    );
    for (const object of page.Contents ?? []) {
      if (object.Key) {
        keys.push(object.Key);
      }
    }
    ContinuationToken = page.NextContinuationToken;
  } while (ContinuationToken);

  await mkdir(dirname(cache), { recursive: true });
  await writeFile(cache, JSON.stringify(keys));
  return keys;
}

export async function getObject(key: string): Promise<Buffer> {
  const cache = join(CACHE_DIR, key);
  const cached = await readFile(cache).catch(() => undefined);
  if (cached) {
    return cached;
  }

  const s3 = getClient();
  const response = await s3.send(
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
  );
  const body = Buffer.from(await response.Body.transformToByteArray());

  await mkdir(dirname(cache), { recursive: true });
  await writeFile(cache, body);
  return body;
}

export async function getJSON<T = any>(key: string): Promise<T> {
  return JSON.parse((await gunzip(await getObject(key))).toString('utf8'));
}

export async function getText(key: string): Promise<string> {
  return (await gunzip(await getObject(key))).toString('utf8');
}
