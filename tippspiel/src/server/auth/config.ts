import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "~/server/db";

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

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.query.user.findFirst({
          where: (users, { eq, and }) =>
            and(
              eq(users.email, credentials.email as string),
              eq(users.password, credentials.password as string),
            ),
        });

        if (!user) {
          return null;
        }

        return { id: user.id, email: user.email };
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
