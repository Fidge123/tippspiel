import { randomBytes } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { generateSalt, hashPassword } from "~/server/auth/password";
import { resetToken, user, verifyToken } from "~/server/db/schema";
import { sendPasswordResetEmail, sendVerificationEmail } from "~/server/email";
import {
  notifyNewUserRegistration,
  notifyPasswordResetRequested,
  notifyUserEmailVerified,
} from "~/server/email/admin";

export const userRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        email: z.email(),
        name: z
          .string()
          .min(1, "Name is required")
          .max(64, "Name must be less than 64 characters"),
        password: z
          .string()
          .min(8, "Password must be at least 8 characters")
          .max(64, "Password must be less than 64 characters"),
        consent: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if ((await ctx.db.$count(user, eq(user.email, input.email))) > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      const salt = generateSalt();
      const [newUser] = await ctx.db
        .insert(user)
        .values({
          email: input.email,
          password: await hashPassword(input.password, salt),
          salt: salt,
          name: input.name,
          settings: {},
          verified: false,
          consentedAt: input.consent.toISOString(),
        })
        .returning({
          id: user.id,
          email: user.email,
          name: user.name,
        });

      if (!newUser) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }

      const verificationToken = randomBytes(32).toString("hex");
      await ctx.db.insert(verifyToken).values({
        token: verificationToken,
        user: newUser.id,
      });

      // Send verification email
      try {
        await sendVerificationEmail(
          newUser.email,
          newUser.name,
          verificationToken,
        );
      } catch (error) {
        console.error("Failed to send verification email:", error);
      }

      try {
        await notifyNewUserRegistration(newUser.email, newUser.name);
      } catch (error) {
        console.error(
          "Failed to send admin notification for new registration:",
          error,
        );
      }

      return newUser;
    }),

  verify: publicProcedure
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

      await ctx.db
        .delete(verifyToken)
        .where(eq(verifyToken.token, input.token));

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
    }),

  resendVerification: publicProcedure
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
    }),

  forgotPassword: publicProcedure
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
        await notifyPasswordResetRequested(
          existingUser.email,
          existingUser.name,
        );
      } catch (error) {
        console.error(
          "Failed to send admin notification for password reset:",
          error,
        );
      }

      return { success: true };
    }),

  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z
          .string()
          .min(8, "Password must be at least 8 characters")
          .max(64, "Password must be less than 64 characters"),
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
        await ctx.db
          .delete(resetToken)
          .where(eq(resetToken.token, input.token));
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
    }),
});
