import { test, expect } from '@playwright/test';

test.describe('Leagues Page', () => {
  test('should display leagues list', async ({ page }) => {
    await page.goto('/leagues');

    // Check for page heading
    await expect(page.locator('h1')).toContainText('League');
  });

  test('should display major league names', async ({ page }) => {
    await page.goto('/leagues');

    // Check for at least one major league
    const hasLeague = await page.locator('text=/Premier League|La Liga|Serie A|Bundesliga|Ligue 1/').first().isVisible();
    expect(hasLeague).toBeTruthy();
  });

  test('should be able to click on a league', async ({ page }) => {
    await page.goto('/leagues');

    // Find a league link and click it
    const leagueLink = page.locator('a[href^="/leagues/"]').first();
    if (await leagueLink.isVisible()) {
      await leagueLink.click();
      // Should navigate to league detail page
      await expect(page).toHaveURL(/\/leagues\/\d+/);
    }
  });
});
