import { mkdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { env } from 'node:process';
import { promisify } from 'node:util';
import { gzip as gzipCb } from 'node:zlib';

const gzip = promisify(gzipCb);
const BUCKET = env.R2_BUCKET ?? 'nfl-tippspiel';

let client: Bun.S3Client | undefined;
let tried = false;

function s3(): Bun.S3Client | undefined {
  if (tried) {
    return client;
  }
  tried = true;

  // The replay harness drives the importer under Vitest on Node, where there
  // is no Bun global; recording falls back to disk there.
  if (typeof Bun === 'undefined') {
    return undefined;
  }

  const { R2_API, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = env;
  if (!R2_API || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    return undefined;
  }

  client = new Bun.S3Client({
    bucket: BUCKET,
    endpoint: R2_API,
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  });
  return client;
}

/**
 * The recorded responses are the source corpus for the golden master, so this
 * failing is worth a log line but never worth failing an import over.
 */
export async function recordToFile(name: string, data: unknown): Promise<void> {
  if (env.SKIP_BACKUP) {
    return;
  }

  const today = new Date();
  const body = await gzip(JSON.stringify(data));
  const bucket = s3();

  if (bucket) {
    try {
      await bucket.write(`${name}/${today.toISOString()}.json.gz`, body);
      return;
    } catch (error) {
      console.error(error);
    }
  }

  const path = env.BACKUP_DIR ?? resolve(homedir(), 'backup');
  await mkdir(path, { recursive: true });
  await writeFile(
    resolve(path, `${name}-${today.toISOString()}.json.gz`),
    body,
  );
}
