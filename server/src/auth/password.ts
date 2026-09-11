import { randomBytes, scrypt as s, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(s);

export const KEY_LENGTH = 128;
const DUMMY_SALT = randomBytes(KEY_LENGTH);

export async function hash(password: string, salt: Buffer): Promise<Buffer> {
  return scrypt(password.normalize(), salt, KEY_LENGTH) as Promise<Buffer>;
}

export function newSalt(): Buffer {
  return randomBytes(KEY_LENGTH);
}

export function newToken(): string {
  return randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Hashes even when there is no stored credential, so a missing user and a wrong
 * password take the same time.
 */
export async function verifyPassword(
  password: string,
  stored: { password: string; salt: string } | undefined,
): Promise<boolean> {
  const expected = stored
    ? Buffer.from(stored.password, 'hex')
    : Buffer.alloc(KEY_LENGTH);
  const actual = await hash(
    password,
    stored ? Buffer.from(stored.salt, 'hex') : DUMMY_SALT,
  );

  return (
    stored !== undefined &&
    expected.length === actual.length &&
    timingSafeEqual(expected, actual)
  );
}
