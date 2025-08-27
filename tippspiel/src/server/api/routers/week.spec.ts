import { expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { weekRouter } from "~/server/api/routers/week";
import { db } from "~/server/db";
import { bye, season, team, week } from "~/server/db/schema";

test("getByesByWeek returns teams with bye week", async () => {
  const headers = new Headers();
  headers.set("x-trpc-source", "test");
  const caller = weekRouter.createCaller({
    db,
    headers,
    session: { user: { id: "test-user" }, expires: "never" },
  });

  // Create test data
  await db
    .insert(season)
    .values({
      id: 9999,
      start: "2025-01-01T00:00:00.000Z",
      end: "2025-12-31T23:59:59.999Z",
      current: false,
    })
    .returning();

  await db
    .insert(week)
    .values({
      id: "test-week-bye",
      season: 9999,
      stage: "Regular Season",
      week: "Week 1",
      start: "2025-01-01T00:00:00.000Z",
      end: "2025-01-07T23:59:59.999Z",
    })
    .returning();

  await db
    .insert(team)
    .values({
      id: 9999,
      code: "TEST",
      shortName: "Test Team",
      name: "Test Football Team",
      season: 9999,
      logo: "test-logo.png",
    })
    .returning();

  const testBye = await db
    .insert(bye)
    .values({
      team: 9999,
      week: "test-week-bye",
    })
    .returning();

  // Test the endpoint
  const result = await caller.getByesByWeek("test-week-bye");

  expect(result).toHaveLength(1);
  expect(result[0]?.team.id).toBe(9999);
  expect(result[0]?.team.shortName).toBe("Test Team");
  expect(result[0]?.team.code).toBe("TEST");
  expect(result[0]?.week).toBe("test-week-bye");

  // Clean up test data
  if (testBye[0]) {
    await db.delete(bye).where(eq(bye.id, testBye[0].id));
  }
  await db.delete(team).where(eq(team.id, 9999));
  await db.delete(week).where(eq(week.id, "test-week-bye"));
  await db.delete(season).where(eq(season.id, 9999));

  // Verify cleanup
  if (testBye[0]) {
    expect(await db.$count(bye, eq(bye.id, testBye[0].id))).toBe(0);
  }
  expect(await db.$count(team, eq(team.id, 9999))).toBe(0);
  expect(await db.$count(week, eq(week.id, "test-week-bye"))).toBe(0);
  expect(await db.$count(season, eq(season.id, 9999))).toBe(0);
});

test("getByesByWeek returns empty array for week with no byes", async () => {
  const headers = new Headers();
  headers.set("x-trpc-source", "test");
  const caller = weekRouter.createCaller({
    db,
    headers,
    session: { user: { id: "test-user" }, expires: "never" },
  });

  // Create test week without any byes
  await db
    .insert(season)
    .values({
      id: 9998,
      start: "2025-01-01T00:00:00.000Z",
      end: "2025-12-31T23:59:59.999Z",
      current: false,
    })
    .returning();

  await db
    .insert(week)
    .values({
      id: "test-week-no-bye",
      season: 9998,
      stage: "Regular Season",
      week: "Week 2",
      start: "2025-01-08T00:00:00.000Z",
      end: "2025-01-14T23:59:59.999Z",
    })
    .returning();

  // Test the endpoint
  const result = await caller.getByesByWeek("test-week-no-bye");

  expect(result).toHaveLength(0);

  // Clean up test data
  await db.delete(week).where(eq(week.id, "test-week-no-bye"));
  await db.delete(season).where(eq(season.id, 9998));

  // Verify cleanup
  expect(await db.$count(week, eq(week.id, "test-week-no-bye"))).toBe(0);
  expect(await db.$count(season, eq(season.id, 9998))).toBe(0);
});
