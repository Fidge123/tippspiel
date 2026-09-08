import { users, weeks } from '../harness/seed';
import { expect, login, test, week } from './app';

test('the schedule fits an iPhone in portrait mode', async ({ page }) => {
  await login(page, users.alice);
  await expect(week(page, weeks.upcoming.label)).toBeVisible();

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );

  expect(overflow).toBeLessThanOrEqual(0);
});
