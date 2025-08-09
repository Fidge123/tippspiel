import { randomBytes } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { generateSalt, hashPassword } from "~/server/auth/password";
import { user, verify } from "~/server/db/schema";

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

      await ctx.db.insert(verify).values({
        token: randomBytes(32).toString("hex"),
        userId: newUser.id,
      });

      return newUser;
    }),
});
