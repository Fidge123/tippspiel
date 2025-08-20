import { eq } from "drizzle-orm";
import { hashPassword } from "~/server/auth/password";
import { db } from "~/server/db";
import { env } from "../../src/env";
import * as schema from "../../src/server/db/schema";
import type { TestUser } from "./auth";

const databaseUrl = env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required for tests");
}

export async function createUser({
  email,
  name,
  password,
}: TestUser): Promise<void> {
  try {
    await db
      .insert(schema.user)
      .values({
        email,
        name,
        password: await hashPassword(password, "randomSalt123"),
        salt: "randomSalt123",
        settings: {},
        consentedAt: new Date().toISOString(),
      })
      .onConflictDoNothing()
      .execute();
  } catch (error) {
    console.warn("Failed to create test user:", error);
  }
}

export async function cleanupUser(email: string): Promise<void> {
  try {
    const user = await db.query.user.findFirst({
      where: eq(schema.user.email, email),
    });

    if (user) {
      // await db.delete(schema.admin).where(eq(schema.admin.user, user.id));
      await db.delete(schema.user).where(eq(schema.user.email, email));
    }
  } catch (error) {
    console.warn("Failed to clean up test user:", error);
  }
}

export async function findUserByEmail(email: string) {
  const user = await db.query.user.findFirst({
    where: eq(schema.user.email, email),
  });
  if (!user) {
    throw new Error(`User with email ${email} not found`);
  }
  return user;
}

export async function verifyUser(email: string): Promise<void> {
  const user = await db
    .update(schema.user)
    .set({ verified: true })
    .where(eq(schema.user.email, email))
    .returning();

  if (!user[0]) {
    throw new Error(`User with email ${email} not found`);
  }
}
