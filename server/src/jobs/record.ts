import { mkdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { env } from 'node:process';
import { promisify } from 'node:util';
import { gzip as gzipCb } from 'node:zlib';
import {
  ListBucketsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

const gzip = promisify(gzipCb);
const BUCKET = 'nfl-tippspiel';

let client: S3Client | undefined;
let tried = false;

function s3(): S3Client | undefined {
  if (!tried) {
    tried = true;
    try {
      client = new S3Client({
        region: 'auto',
        endpoint: env.R2_API,
        credentials: {
          accessKeyId: env.R2_ACCESS_KEY_ID!,
          secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
        },
      });
    } catch {
      console.warn('Could not connect to S3-compatible storage');
    }
  }
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
      const { Buckets } = await bucket.send(new ListBucketsCommand({}));
      if (Buckets?.some((b) => b.Name === BUCKET)) {
        await bucket.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key: `${name}/${today.toISOString()}.json.gz`,
            Body: body,
          }),
        );
        return;
      }
    } catch (error) {
      console.error(error);
    }
  }

  // The Nest version wrote to the literal path "~/backup", which no shell ever
  // expanded, so it made a directory called ~ wherever it happened to run.
  const path = env.BACKUP_DIR ?? resolve(homedir(), 'backup');
  await mkdir(path, { recursive: true });
  await writeFile(
    resolve(path, `${name}-${today.toISOString()}.json.gz`),
    body,
  );
}
