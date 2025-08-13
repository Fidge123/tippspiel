import { and, eq, gte, lt } from "drizzle-orm";
import { db } from "~/server/db";
import { failedLoginAttempt } from "~/server/db/schema";
import { notifyExcessiveFailedLogins } from "~/server/email/admin";

const FAILED_LOGIN_THRESHOLD = 10;
const TIME_WINDOW_MINUTES = 60;

export async function recordFailedLogin(email: string) {
  try {
    await cleanupOldFailedLogins();
    await db.insert(failedLoginAttempt).values({ email });

    await checkForExcessiveFailedLogins(email);
  } catch (error) {
    console.error("Failed to record failed login attempt:", error);
  }
}

async function checkForExcessiveFailedLogins(email: string): Promise<void> {
  try {
    const oneHourAgo = new Date(Date.now() - TIME_WINDOW_MINUTES * 60 * 1000);

    const recentAttempts = await db
      .select()
      .from(failedLoginAttempt)
      .where(
        and(
          eq(failedLoginAttempt.email, email),
          gte(failedLoginAttempt.createdAt, oneHourAgo.toISOString()),
        ),
      );

    if (recentAttempts.length === FAILED_LOGIN_THRESHOLD) {
      await notifyExcessiveFailedLogins(email);
    }
  } catch (error) {
    console.error("Failed to check for excessive failed logins:", error);
  }
}

export async function cleanupOldFailedLogins(): Promise<void> {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await db
      .delete(failedLoginAttempt)
      .where(
        lt(failedLoginAttempt.createdAt, twentyFourHoursAgo.toISOString()),
      );

    console.log("Cleaned up old failed login attempts");
  } catch (error) {
    console.error("Failed to cleanup old failed login attempts:", error);
  }
}
