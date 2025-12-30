import { test, expect } from '@playwright/test';

test.describe('Tools Page', () => {
  test('should display tools list', async ({ page }) => {
    await page.goto('/tools');

    // Check for page heading
    await expect(page.locator('h1')).toContainText('Tool');

    // Check for tool cards
    await expect(page.locator('text=Match Analyzer')).toBeVisible();
    await expect(page.locator('text=Referee Comparison')).toBeVisible();
  });

  test('should navigate to match analyzer', async ({ page }) => {
    await page.goto('/tools');

    await page.click('a[href="/tools/match-analyzer"]');
    await expect(page).toHaveURL('/tools/match-analyzer');
    await expect(page.locator('h1')).toContainText('Match Analyzer');
  });

  test('should navigate to referee comparison', async ({ page }) => {
    await page.goto('/tools');

    await page.click('a[href="/tools/referee-comparison"]');
    await expect(page).toHaveURL('/tools/referee-comparison');
    await expect(page.locator('h1')).toContainText('Referee Comparison');
  });

  test('should have back link from tool pages', async ({ page }) => {
    await page.goto('/tools/match-analyzer');

    await expect(page.locator('text=Back to Tools')).toBeVisible();

    await page.click('text=Back to Tools');
    await expect(page).toHaveURL('/tools');
  });
});
