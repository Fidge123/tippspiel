import { randomBytes } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import z from "zod";
import { publicProcedure } from "~/server/api/trpc";
import { generateSalt, hashPassword } from "~/server/auth/password";
import { user, verifyToken } from "~/server/db/schema";
import {
  notifyNewUserRegistration,
  sendVerificationEmail,
} from "~/server/email";
import { nameSchema, passwordSchema } from "./schema";

export const register = publicProcedure
  .input(
    z.object({
      email: z.email(),
      name: nameSchema,
      password: passwordSchema,
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
  });
