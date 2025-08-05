import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { env } from "~/env";

const scryptAsync = promisify(scrypt);

export function generateSalt(): string {
  return randomBytes(32).toString("hex");
}

export async function hashPassword(
  password: string,
  salt: string,
): Promise<string> {
  const passwordWithPepper = password + env.PASSWORD_PEPPER;
  const saltBuffer = Buffer.from(salt, "hex");
  const hash = (await scryptAsync(
    passwordWithPepper,
    saltBuffer,
    128,
  )) as Buffer;

  return hash.toString("hex");
}

export async function verifyPassword(
  password: string,
  salt: string,
  storedHash: string,
): Promise<boolean> {
  const hash = await hashPassword(password, salt);
  return hash === storedHash;
}
