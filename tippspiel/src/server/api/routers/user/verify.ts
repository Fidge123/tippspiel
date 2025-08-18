import { randomBytes } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import z from "zod";
import { user, verifyToken } from "~/server/db/schema";
import { notifyUserEmailVerified, sendVerificationEmail } from "~/server/email";
import { publicProcedure } from "../../trpc";

export const verify = publicProcedure
  .input(z.object({ token: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const token = await ctx.db.query.verifyToken.findFirst({
      where: eq(verifyToken.token, input.token),
      with: {
        user: true,
      },
    });

    if (!token) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Invalid verification token",
      });
    }

    const tokenAge = Date.now() - new Date(token.createdAt).getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (tokenAge > maxAge) {
      await ctx.db
        .delete(verifyToken)
        .where(eq(verifyToken.token, input.token));
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Verification token has expired",
      });
    }

    if (!token.user) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Invalid verification record",
      });
    }

    await ctx.db
      .update(user)
      .set({ verified: true })
      .where(eq(user.id, token.user.id));

    await ctx.db.delete(verifyToken).where(eq(verifyToken.token, input.token));

    try {
      if (token.user) {
        await notifyUserEmailVerified(token.user.email, token.user.name);
      }
    } catch (error) {
      console.error(
        "Failed to send admin notification for email verification:",
        error,
      );
    }

    return { success: true };
  });

export const resendVerification = publicProcedure
  .input(z.object({ email: z.email() }))
  .mutation(async ({ ctx, input }) => {
    const existingUser = await ctx.db.query.user.findFirst({
      where: eq(user.email, input.email),
    });

    if (!existingUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    if (existingUser.verified) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User is already verified",
      });
    }

    const recentToken = await ctx.db.query.verifyToken.findFirst({
      where: eq(verifyToken.user, existingUser.id),
    });

    if (recentToken) {
      const tokenAge = Date.now() - new Date(recentToken.createdAt).getTime();
      const minAge = 5 * 60 * 1000;

      if (tokenAge < minAge) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message:
            "Please wait 5 minutes before requesting another verification email",
        });
      }

      await ctx.db
        .delete(verifyToken)
        .where(eq(verifyToken.user, existingUser.id));
    }

    const verificationToken = randomBytes(32).toString("hex");
    await ctx.db.insert(verifyToken).values({
      token: verificationToken,
      user: existingUser.id,
    });

    try {
      await sendVerificationEmail(
        existingUser.email,
        existingUser.name,
        verificationToken,
      );
    } catch (error) {
      console.error("Failed to send verification email:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to send verification email",
      });
    }

    return { success: true };
  });
