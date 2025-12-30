import { test, expect } from '@playwright/test';

test.describe('Referees Page', () => {
  test('should display referees list page', async ({ page }) => {
    await page.goto('/referees');

    // Check for page heading
    await expect(page.locator('h1')).toBeVisible();

    // Check for search input
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
  });

  test('should have a data table for referees', async ({ page }) => {
    await page.goto('/referees');

    // Check for table
    await expect(page.locator('table')).toBeVisible();

    // Check for table headers
    await expect(page.locator('th').first()).toBeVisible();
  });

  test('should be able to search for referees', async ({ page }) => {
    await page.goto('/referees');

    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('Taylor');

    // Wait for filtering to apply
    await page.waitForTimeout(500);

    // The table should still be visible
    await expect(page.locator('table')).toBeVisible();
  });

  test('should show correct column headers', async ({ page }) => {
    await page.goto('/referees');

    // Check for key column headers
    await expect(page.locator('button:has-text("Name")')).toBeVisible();
    await expect(page.locator('button:has-text("Matches")')).toBeVisible();
  });
});
