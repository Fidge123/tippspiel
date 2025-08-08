import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import zod from "zod";
import { db } from "~/server/db";
import { verifyPassword } from "./password";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
// declare module "next-auth" {
//   interface Session extends DefaultSession {
//     user: {
//       id: string;
//     } & DefaultSession["user"];
//   }
// }

const schema = zod.object({
  email: zod.email(),
  password: zod
    .string()
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 64 characters"),
});

export const authConfig = {
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const { email, password } = await schema.parseAsync(credentials);

        const user = await db.query.user.findFirst({
          where: (users, { eq, and }) => and(eq(users.email, email)),
        });

        if (user) {
          if (!user.verified) {
            throw Error("User is not verified!");
          }
          if (await verifyPassword(password, user.salt, user.password)) {
            return { id: user.id, email: user.email };
          } else {
            throw Error("Invalid password!");
          }
        }

        throw Error("User is not found!");
      },
    }),
  ],
  // callbacks: {
  //   session: ({ session }) => ({
  //     ...session,
  //     user: {
  //       ...session.user,
  //     },
  //   }),
  // },
} satisfies NextAuthConfig;
