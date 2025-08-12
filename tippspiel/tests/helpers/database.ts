import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { env } from "../../src/env";
import * as schema from "../../src/server/db/schema";

const databaseUrl = env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required for tests");
}

export async function cleanupUser(email: string): Promise<void> {
  try {
    const user = await db.query.user.findFirst({
      where: eq(schema.user.email, email),
    });

    if (user) {
      // Delete related records first due to foreign key constraints
      await db.delete(schema.verify).where(eq(schema.verify.userId, user.id));
      await db.delete(schema.reset).where(eq(schema.reset.userId, user.id));
      await db.delete(schema.bet).where(eq(schema.bet.userId, user.id));
      await db
        .delete(schema.superbowlBet)
        .where(eq(schema.superbowlBet.userId, user.id));
      await db
        .delete(schema.divisionBet)
        .where(eq(schema.divisionBet.userId, user.id));
      await db
        .delete(schema.betDoubler)
        .where(eq(schema.betDoubler.userId, user.id));
      await db.delete(schema.member).where(eq(schema.member.userId, user.id));
      await db.delete(schema.admin).where(eq(schema.admin.userId, user.id));

      // Finally delete the user
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
