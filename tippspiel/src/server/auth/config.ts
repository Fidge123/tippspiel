import { CredentialsSignin, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import zod from "zod";
import { db } from "~/server/db";
import { recordFailedLogin } from "./failed-login-tracker";
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
    .max(64, "Password must be less than 64 characters"),
});

class UnverifiedError extends CredentialsSignin {
  code = "unverified";
}

class InvalidPasswordError extends CredentialsSignin {
  code = "invalid_password";
}

class UnknownUserError extends CredentialsSignin {
  code = "unknown_user";
}

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
            await recordFailedLogin({ email });
            throw new UnverifiedError("User is not verified!");
          }
          if (await verifyPassword(password, user.salt, user.password)) {
            return { id: user.id, email: user.email };
          } else {
            await recordFailedLogin({ email });
            throw new InvalidPasswordError("Invalid password!");
          }
        }
        await recordFailedLogin({ email });
        throw new UnknownUserError("User is not found!");
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
