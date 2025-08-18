import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import z from "zod";
import { generateSalt, hashPassword } from "~/server/auth/password";
import { user, verifyToken } from "~/server/db/schema";
import { sendVerificationEmail } from "~/server/email";
import { protectedProcedure } from "../../trpc";
import { nameSchema, passwordSchema } from "./schema";

export const updateName = protectedProcedure
  .input(z.object({ name: nameSchema }))
  .mutation(async ({ ctx, input }) => {
    const [updatedUser] = await ctx.db
      .update(user)
      .set({ name: input.name })
      .where(eq(user.id, ctx.session.user.id))
      .returning({
        id: user.id,
        name: user.name,
      });

    if (!updatedUser) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update username",
      });
    }

    return updatedUser;
  });

export const updateEmail = protectedProcedure
  .input(z.object({ email: z.email() }))
  .mutation(async ({ ctx, input }) => {
    const [updatedUser] = await ctx.db
      .update(user)
      .set({ email: input.email, verified: false })
      .where(eq(user.id, ctx.session.user.id))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
      });

    if (!updatedUser) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update email",
      });
    }

    const verificationToken = randomBytes(32).toString("hex");
    await ctx.db.insert(verifyToken).values({
      token: verificationToken,
      user: ctx.session.user.id,
    });

    // Send verification email
    try {
      // TODO: Send notification message to old email
      await sendVerificationEmail(
        updatedUser.email,
        updatedUser.name,
        verificationToken,
      );
    } catch (error) {
      console.error("Failed to send verification email:", error);
    }

    return updatedUser;
  });

export const updatePassword = protectedProcedure
  .input(z.object({ old: passwordSchema, new: passwordSchema }))
  .mutation(async ({ ctx, input }) => {
    const userRecord = await ctx.db.query.user.findFirst({
      where: eq(user.id, ctx.session.user.id),
    });

    if (!userRecord) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "User not found",
      });
    }

    if (
      (await hashPassword(input.old, userRecord.salt)) !== userRecord?.password
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Old password is incorrect",
      });
    }

    if (input.old === input.new) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "New password must be different from the old one",
      });
    }

    const salt = generateSalt();
    const [updatedUser] = await ctx.db
      .update(user)
      .set({ password: await hashPassword(input.new, salt), salt })
      .where(eq(user.id, ctx.session.user.id))
      .returning({
        id: user.id,
        name: user.name,
      });

    if (!updatedUser) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update password",
      });
    }

    // try {
    //   // TODO: Send notification message to old email

    // } catch (error) {
    //   console.error("Failed to send verification email:", error);
    // }

    return updatedUser;
  });

export const updateSettings = protectedProcedure
  .input(
    z.object({
      reminders: z.boolean().optional(),
      hideScore: z.boolean().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const currentUser = await ctx.db.query.user.findFirst({
      where: eq(user.id, ctx.session.user.id),
      columns: { settings: true },
    });

    if (!currentUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const currentSettings =
      (currentUser.settings as Record<string, unknown>) || {};
    const newSettings = {
      ...currentSettings,
      ...input,
    };

    const [updatedUser] = await ctx.db
      .update(user)
      .set({ settings: newSettings })
      .where(eq(user.id, ctx.session.user.id))
      .returning({
        id: user.id,
        settings: user.settings,
      });

    if (!updatedUser) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update settings",
      });
    }

    return updatedUser;
  });
