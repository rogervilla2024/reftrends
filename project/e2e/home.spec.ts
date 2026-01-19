import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the hero section', async ({ page }) => {
    await page.goto('/');

    // Check for hero heading
    await expect(page.locator('h1')).toContainText('Referee');

    // Check for navigation
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('text=RefTrends')).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');

    // Check navigation links are present
    await expect(page.locator('nav a[href="/"]')).toBeVisible();
    await expect(page.locator('nav a[href="/referees"]')).toBeVisible();
    await expect(page.locator('nav a[href="/leagues"]')).toBeVisible();
    await expect(page.locator('nav a[href="/tools"]')).toBeVisible();
  });

  test('should navigate to referees page', async ({ page }) => {
    await page.goto('/');

    await page.click('nav a[href="/referees"]');
    await expect(page).toHaveURL('/referees');
    await expect(page.locator('h1')).toContainText('Referee');
  });

  test('should navigate to leagues page', async ({ page }) => {
    await page.goto('/');

    await page.click('nav a[href="/leagues"]');
    await expect(page).toHaveURL('/leagues');
    await expect(page.locator('h1')).toContainText('League');
  });

  test('should navigate to tools page', async ({ page }) => {
    await page.goto('/');

    await page.click('nav a[href="/tools"]');
    await expect(page).toHaveURL('/tools');
    await expect(page.locator('h1')).toContainText('Tool');
  });

  test('should display footer with links', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('footer').locator('text=RefTrends')).toBeVisible();
    await expect(page.locator('footer').locator('text=Premier League')).toBeVisible();
  });
});
