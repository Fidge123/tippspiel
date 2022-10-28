import { S3Client } from '@aws-sdk/client-s3';
import { env } from 'process';

function createClient(): S3Client | undefined {
  try {
    return new S3Client({
      region: 'auto',
      endpoint: env.R2_API,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  } catch {
    console.warn('Could not connect to S3-compatible storage');
  }
}

const s3Client = createClient();

export { s3Client };
