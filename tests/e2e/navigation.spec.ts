import { expect, test } from '@playwright/test';

test.describe('MusicScan navigation', () => {
  test('home page links navigate to generate and scan pages', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'MusicScan' })).toBeVisible();

    await page.getByRole('link', { name: /Generate Cards/i }).click();
    await expect(page).toHaveURL(/\/generate$/);
    await expect(page.getByRole('heading', { name: 'Generate Cards' })).toBeVisible();

    await page.getByRole('link', { name: /Go back/i }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.getByRole('link', { name: /Scan Card/i }).click();
    await expect(page).toHaveURL(/\/scan$/);
    await expect(page.getByRole('heading', { name: 'Scan Card' })).toBeVisible();
  });

  test('scan page countdown toggle is enabled by default and can be disabled', async ({ page }) => {
    await page.goto('/scan');

    const countdownToggle = page.getByRole('checkbox', {
      name: /Show countdown on scan/i,
    });

    await expect(countdownToggle).toBeChecked();
    await countdownToggle.uncheck();
    await expect(countdownToggle).not.toBeChecked();
  });
});
