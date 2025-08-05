import { expect, test } from "bun:test";
import type { inferProcedureInput, TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { userRouter } from "~/server/api/routers/user";
import { db } from "~/server/db";
import { user, verify } from "~/server/db/schema";

test("register user and clean up", async () => {
  const headers = new Headers();
  headers.set("x-trpc-source", "test");
  const caller = userRouter.createCaller({
    db,
    headers,
    session: null,
  });
  const now = new Date();
  const input: inferProcedureInput<(typeof userRouter)["register"]> = {
    email: `test-${now.getTime()}@example.com`,
    name: "Test User",
    password: "testpassword",
    consent: now,
  };
  const newUser = await caller.register(input);
  expect(newUser.name).toEqual("Test User");
  await db.delete(verify).where(eq(verify.userId, newUser.id));
  await db.delete(user).where(eq(user.id, newUser.id));
  expect(await db.$count(user, eq(user.id, newUser.id))).toBe(0);
  expect(await db.$count(verify, eq(verify.userId, newUser.id))).toBe(0);
});

test("fail if user exists and clean up", async () => {
  const headers = new Headers();
  headers.set("x-trpc-source", "test");
  const caller = userRouter.createCaller({
    db,
    headers,
    session: null,
  });
  const now = new Date();
  const input: inferProcedureInput<(typeof userRouter)["register"]> = {
    email: `test-${now.getTime()}@example.com`,
    name: "Test User",
    password: "testpassword",
    consent: now,
  };

  const users = [] as { id: string }[];

  try {
    users.push(await caller.register(input));
    users.push(await caller.register(input));
  } catch (error: unknown) {
    expect((error as TRPCError).code).toBe("CONFLICT");
    expect(users.length).toBe(1);
    const id = users[0]?.id ?? "";
    expect(await db.$count(user, eq(user.id, id))).toBe(1);
    expect(await db.$count(verify, eq(verify.userId, id))).toBe(1);
  }

  for (const u of users) {
    await db.delete(verify).where(eq(verify.userId, u.id));
    await db.delete(user).where(eq(user.id, u.id));
  }
  for (const u of users) {
    expect(await db.$count(user, eq(user.id, u.id))).toBe(0);
    expect(await db.$count(verify, eq(verify.userId, u.id))).toBe(0);
  }
});
