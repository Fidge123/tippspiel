import { games, users, weeks } from '../harness/seed';
import { doublerToggle, expect, login, test } from './nojs';

const DOUBLER = '🌟';

function week(page: import('@playwright/test').Page, id: string) {
  return page.locator(`[id="week-${id}"]`);
}

function game(page: import('@playwright/test').Page, id: string) {
  return page.locator(`[id="game-${id}"]`);
}

test.describe('The doubler, without JavaScript', () => {
  test('can be set, moved and removed', async ({ page }) => {
    await login(page, users.alice);
    const upcoming = week(page, weeks.upcoming.id);

    await doublerToggle(game(page, games.upcomingFirst.id)).click();
    await upcoming.getByRole('button', { name: 'Doppler setzen' }).click();

    await expect(
      game(page, games.upcomingFirst.id).getByText(DOUBLER),
    ).toBeVisible();

    await doublerToggle(game(page, games.upcomingSecond.id)).click();
    await week(page, weeks.upcoming.id)
      .getByRole('button', { name: 'Doppler setzen' })
      .click();

    await expect(
      game(page, games.upcomingSecond.id).getByText(DOUBLER),
    ).toBeVisible();
    await expect(
      game(page, games.upcomingFirst.id).getByText(DOUBLER),
    ).toHaveCount(0);

    await week(page, weeks.upcoming.id)
      .getByRole('button', { name: 'Doppler entfernen' })
      .click();

    await page.goto('./');
    await expect(week(page, weeks.upcoming.id).getByText(DOUBLER)).toHaveCount(
      0,
    );
  });

  test('survives a reload', async ({ page }) => {
    await login(page, users.alice);

    await doublerToggle(game(page, games.upcomingThird.id)).click();
    await week(page, weeks.upcoming.id)
      .getByRole('button', { name: 'Doppler setzen' })
      .click();

    await page.goto('./');

    await expect(
      game(page, games.upcomingThird.id).getByText(DOUBLER),
    ).toBeVisible();
  });

  test('offers no control on a week whose games have started', async ({
    page,
  }) => {
    await login(page, users.alice);

    await expect(doublerToggle(game(page, games.finishedFirst.id))).toHaveCount(
      0,
    );
  });
});
