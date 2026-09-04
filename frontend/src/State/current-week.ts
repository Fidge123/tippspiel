export interface WeekPeriod {
  year: number;
  seasontype: number;
  week: number;
  start: string | Date;
  end: string | Date;
}

/**
 * The week we are inside of, else the last one that ended if all are past,
 * else the earliest one still to come.
 */
export function selectCurrentWeek<T extends WeekPeriod>(
  weeks: T[],
  now = new Date(),
): T {
  return weeks.reduce((prev, curr) => {
    const startA = new Date(prev.start);
    const endA = new Date(prev.end);
    const startB = new Date(curr.start);
    const endB = new Date(curr.end);
    if (now <= endA && now >= startA) {
      return prev; // if in period A, return prev
    }
    if (now <= endB && now >= startB) {
      return curr; // if in period B, return curr
    }
    if (endA <= now && endB <= now) {
      return endA > endB ? prev : curr; // if both before, return later period
    }
    if (endA >= now && endB >= now) {
      return endA < endB ? prev : curr; // if both after, return earlier period
    }
    return endA < now ? prev : curr; // if between periods, return later period
  });
}

export function weekId(week: WeekPeriod): string {
  return `${week.year}-${week.seasontype}-${week.week}`;
}
