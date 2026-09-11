import { expect, expectNoScript, test } from './nojs';

test.describe('Impressum, without JavaScript', () => {
  test('renders the page the Hono app serves', async ({ page }) => {
    await page.goto('./impressum');

    await expect(
      page.getByRole('heading', { name: 'Impressum', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Datenschutz' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Legal information' }),
    ).toBeVisible();
    await expect(page.getByText('Konrad-Zuse-Ring 10')).toBeVisible();
  });

  test('ships no script at all', async ({ page }) => {
    await page.goto('./impressum');
    await expectNoScript(page);
  });

  test('loads its stylesheet through the same split', async ({ page }) => {
    const response = await page.request.get('./app.css');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/css');
  });
});
