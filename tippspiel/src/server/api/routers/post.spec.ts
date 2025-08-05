import { expect, test } from "bun:test";
import type { inferProcedureInput } from "@trpc/server";
import { postRouter } from "~/server/api/routers/post";
import { db } from "~/server/db";

test("postRouter hello", async () => {
  const headers = new Headers();
  headers.set("x-trpc-source", "test");
  const caller = postRouter.createCaller({
    db,
    headers,
    session: null,
  });
  const input: inferProcedureInput<(typeof postRouter)["hello"]> = {
    text: "test",
  };
  const hi = await caller.hello(input);
  expect(hi).toEqual({ greeting: "Hello test" });
});
