import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { user } from "~/server/db/schema";
import { forgotPassword, resetPassword } from "./user/forgot";
import { deleteAccount, exportUserData } from "./user/gdpr";
import { register } from "./user/register";
import {
  updateEmail,
  updateName,
  updatePassword,
  updateSettings,
} from "./user/update";
import { resendVerification, verify } from "./user/verify";

export const userRouter = createTRPCRouter({
  register,
  verify,
  resendVerification,
  forgotPassword,
  resetPassword,
  exportUserData,
  deleteAccount,
  updateEmail,
  updateName,
  updatePassword,
  updateSettings,

  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const currentUser = await ctx.db.query.user.findFirst({
      where: eq(user.id, ctx.session.user.id),
      columns: {
        id: true,
        email: true,
        name: true,
        settings: true,
        verified: true,
        createdAt: true,
      },
    });

    if (!currentUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return currentUser as User;
  }),
});

interface User {
  id: string;
  email: string;
  name: string;
  settings: {
    hideScore?: boolean;
    reminders?: boolean;
  };
  verified: boolean;
  createdAt: string;
}
