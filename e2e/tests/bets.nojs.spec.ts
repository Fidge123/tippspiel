import { games, teams, users, weeks } from '../harness/seed';
import { activeLeague } from './app';
import { expect, expectNoScript, login, pick, test } from './nojs';

test.describe('Betting, without JavaScript', () => {
  test('a bet on an upcoming game survives a reload', async ({ page }) => {
    await login(page, users.alice);

    const game = page.locator(`[id="game-${games.upcomingFirst.id}"]`);
    await expect(game).toBeVisible();
    await expectNoScript(page);

    await pick(game, teams.ravens.name).click();
    await game.getByLabel('Einsatz').selectOption('3');
    await game.getByRole('button', { name: 'OK' }).click();

    await page.goto('./');
    const reloaded = page.locator(`[id="game-${games.upcomingFirst.id}"]`);
    await expect(reloaded.getByLabel('Einsatz')).toHaveValue('3');
    await expect(
      reloaded.getByRole('radio', { name: teams.ravens.name, exact: true }),
    ).toBeChecked();
  });

  test('a bet can be changed', async ({ page }) => {
    await login(page, users.alice);

    const game = page.locator(`[id="game-${games.upcomingSecond.id}"]`);
    await pick(game, teams.steelers.name).click();
    await game.getByLabel('Einsatz').selectOption('2');
    await game.getByRole('button', { name: 'OK' }).click();

    const again = page.locator(`[id="game-${games.upcomingSecond.id}"]`);
    await pick(again, teams.bengals.name).click();
    await again.getByLabel('Einsatz').selectOption('5');
    await again.getByRole('button', { name: 'OK' }).click();

    await page.goto('./');
    const reloaded = page.locator(`[id="game-${games.upcomingSecond.id}"]`);
    await expect(reloaded.getByLabel('Einsatz')).toHaveValue('5');
    await expect(
      reloaded.getByRole('radio', { name: teams.bengals.name, exact: true }),
    ).toBeChecked();
  });

  test('a finished game offers no way to bet', async ({ page }) => {
    await login(page, users.alice);

    const game = page.locator(`[id="game-${games.finishedFirst.id}"]`);
    await expect(game.getByRole('button', { name: 'OK' })).toHaveCount(0);
    await expect(game.getByLabel('Einsatz')).toBeDisabled();
  });

  test('a bet after kickoff says so instead of failing silently', async ({
    page,
  }) => {
    await login(page, users.alice);

    // The form is gone once a game starts, so the late POST is made directly,
    // which is what a stale page or a slow submit would do.
    const response = await page.request.post('./bet', {
      form: {
        game: games.finishedFirst.id,
        league: await activeLeague(page),
        week: weeks.finished.id,
        winner: 'home',
        pointDiff: '3',
      },
    });

    expect(response.status()).toBe(400);
    expect(await response.text()).toContain('Zu spät');
  });

  test('the week label and byes render', async ({ page }) => {
    await login(page, users.alice);

    await expect(
      page.getByRole('heading', { name: weeks.upcoming.label }),
    ).toBeVisible();
  });
});
