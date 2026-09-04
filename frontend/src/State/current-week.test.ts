import { describe, expect, it } from "vitest";

import { selectCurrentWeek, weekId, WeekPeriod } from "./current-week";

const week = (n: number, start: string, end: string): WeekPeriod => ({
  year: 2025,
  seasontype: 2,
  week: n,
  start,
  end,
});

const w1 = week(1, "2025-09-01T00:00:00Z", "2025-09-08T00:00:00Z");
const w2 = week(2, "2025-09-08T00:00:00Z", "2025-09-15T00:00:00Z");
const w3 = week(3, "2025-09-15T00:00:00Z", "2025-09-22T00:00:00Z");

const at = (iso: string) => new Date(iso);

describe("selectCurrentWeek", () => {
  it("picks the week we are inside of", () => {
    expect(selectCurrentWeek([w1, w2, w3], at("2025-09-10T12:00:00Z"))).toBe(
      w2,
    );
  });

  it("picks the first week while the season has not started", () => {
    expect(selectCurrentWeek([w1, w2, w3], at("2025-08-01T00:00:00Z"))).toBe(
      w1,
    );
  });

  it("picks the last week once the season is over", () => {
    expect(selectCurrentWeek([w1, w2, w3], at("2025-12-01T00:00:00Z"))).toBe(
      w3,
    );
  });

  // Note: in a gap the reducer returns the week that has already ended, even
  // though the comment in the original code claimed "return later period".
  // Pinned as it behaves today.
  it("picks the week that just ended when we are in a gap", () => {
    const early = week(1, "2025-09-01T00:00:00Z", "2025-09-05T00:00:00Z");
    const late = week(2, "2025-09-10T00:00:00Z", "2025-09-15T00:00:00Z");
    expect(selectCurrentWeek([early, late], at("2025-09-07T00:00:00Z"))).toBe(
      early,
    );
  });

  it("is inclusive at both ends of a week", () => {
    expect(selectCurrentWeek([w1, w2, w3], at("2025-09-01T00:00:00Z"))).toBe(
      w1,
    );
    // w1 ends exactly when w2 starts; the earlier week wins the boundary.
    expect(selectCurrentWeek([w1, w2, w3], at("2025-09-08T00:00:00Z"))).toBe(
      w1,
    );
  });

  it("does not depend on the input order", () => {
    expect(selectCurrentWeek([w3, w1, w2], at("2025-09-10T12:00:00Z"))).toBe(
      w2,
    );
    expect(selectCurrentWeek([w3, w2, w1], at("2025-12-01T00:00:00Z"))).toBe(
      w3,
    );
    expect(selectCurrentWeek([w3, w2, w1], at("2025-08-01T00:00:00Z"))).toBe(
      w1,
    );
  });

  it("returns the only week there is", () => {
    expect(selectCurrentWeek([w2], at("2030-01-01T00:00:00Z"))).toBe(w2);
  });
});

describe("weekId", () => {
  it("joins year, seasontype and week", () => {
    expect(weekId(w2)).toBe("2025-2-2");
  });
});
