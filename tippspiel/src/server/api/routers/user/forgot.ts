import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import z from "zod";
import { generateSalt, hashPassword } from "~/server/auth/password";
import { resetToken, user } from "~/server/db/schema";
import {
  notifyPasswordResetRequested,
  sendPasswordResetEmail,
} from "~/server/email";
import { publicProcedure } from "../../trpc";
import { passwordSchema } from "./schema";

export const forgotPassword = publicProcedure
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

    if (!existingUser.verified) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User is not verified",
      });
    }

    const recentToken = await ctx.db.query.resetToken.findFirst({
      where: eq(resetToken.user, existingUser.id),
    });

    if (recentToken) {
      const tokenAge = Date.now() - new Date(recentToken.createdAt).getTime();
      const minAge = 5 * 60 * 1000; // 5 minutes

      if (tokenAge < minAge) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message:
            "Please wait 5 minutes before requesting another password reset",
        });
      }

      await ctx.db
        .delete(resetToken)
        .where(eq(resetToken.user, existingUser.id));
    }

    const token = randomBytes(32).toString("hex");
    await ctx.db.insert(resetToken).values({
      token,
      user: existingUser.id,
    });

    try {
      await sendPasswordResetEmail(
        existingUser.email,
        existingUser.name,
        token,
      );
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to send password reset email",
      });
    }

    try {
      await notifyPasswordResetRequested(existingUser.email, existingUser.name);
    } catch (error) {
      console.error(
        "Failed to send admin notification for password reset:",
        error,
      );
    }

    return { success: true };
  });

export const resetPassword = publicProcedure
  .input(
    z.object({
      token: z.string(),
      password: passwordSchema,
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const token = await ctx.db.query.resetToken.findFirst({
      where: eq(resetToken.token, input.token),
      with: {
        user: true,
      },
    });

    if (!token) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Invalid reset token",
      });
    }

    const tokenAge = Date.now() - new Date(token.createdAt).getTime();
    const maxAge = 60 * 60 * 1000; // 1 hour in milliseconds

    if (tokenAge > maxAge) {
      await ctx.db.delete(resetToken).where(eq(resetToken.token, input.token));
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Reset token has expired",
      });
    }

    if (!token.user) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Invalid reset record",
      });
    }

    const salt = generateSalt();
    const hashedPassword = await hashPassword(input.password, salt);

    await ctx.db
      .update(user)
      .set({
        password: hashedPassword,
        salt: salt,
      })
      .where(eq(user.id, token.user.id));

    await ctx.db.delete(resetToken).where(eq(resetToken.token, input.token));

    return { success: true };
  });
