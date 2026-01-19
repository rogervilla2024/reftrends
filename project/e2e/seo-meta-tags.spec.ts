import { test, expect } from '@playwright/test';

test.describe('SEO Meta Tags', () => {
  test.describe('Homepage Meta Tags', () => {
    test('should have correct title tag', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveTitle('RefTrends - Referee Statistics & Betting Analytics');
    });

    test('should have meta description', async ({ page }) => {
      await page.goto('/');
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();
      expect(description).toContain('referee');
    });

    test('should have meta keywords', async ({ page }) => {
      await page.goto('/');
      const keywords = await page.locator('meta[name="keywords"]').getAttribute('content');
      expect(keywords).toBeTruthy();
      expect(keywords).toContain('referee');
    });

    test('should have author meta tag', async ({ page }) => {
      await page.goto('/');
      const author = await page.locator('meta[name="author"]').getAttribute('content');
      expect(author).toBe('RefTrends');
    });

    test('should have viewport meta tag', async ({ page }) => {
      await page.goto('/');
      const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
      expect(viewport).toBeTruthy();
      expect(viewport).toContain('width=device-width');
    });

    test('should have theme-color meta tag', async ({ page }) => {
      await page.goto('/');
      const themeColor = page.locator('meta[name="theme-color"]');
      expect(await themeColor.count()).toBeGreaterThan(0);
    });

    test('should have robots meta tag allowing indexing', async ({ page }) => {
      await page.goto('/');
      const robots = await page.locator('meta[name="robots"]').getAttribute('content');
      expect(robots).toContain('index');
      expect(robots).toContain('follow');
    });
  });

  test.describe('Referees Page Meta Tags', () => {
    test('should have page-specific title', async ({ page }) => {
      await page.goto('/referees');
      await expect(page).toHaveTitle(/Referees.*RefTrends/);
    });

    test('should have meta description', async ({ page }) => {
      await page.goto('/referees');
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();
      expect(description!.length).toBeGreaterThan(50);
    });
  });

  test.describe('Tools Page Meta Tags', () => {
    test('should have page-specific title', async ({ page }) => {
      await page.goto('/tools');
      await expect(page).toHaveTitle(/Tool.*RefTrends/i);
    });

    test('should have meta description', async ({ page }) => {
      await page.goto('/tools');
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();
    });
  });

  test.describe('Leagues Page Meta Tags', () => {
    test('should have page-specific title', async ({ page }) => {
      await page.goto('/leagues');
      await expect(page).toHaveTitle(/League.*RefTrends/i);
    });

    test('should have meta description', async ({ page }) => {
      await page.goto('/leagues');
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();
    });
  });

  test.describe('League Detail Page Meta Tags', () => {
    test('should have league name in title', async ({ page }) => {
      await page.goto('/leagues/39');
      await expect(page).toHaveTitle(/Premier League.*RefTrends/);
    });

    test('should have league-specific description', async ({ page }) => {
      await page.goto('/leagues/39');
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();
      expect(description).toContain('Premier League');
    });
  });

  test.describe('HTML Lang Attribute', () => {
    test('should have lang attribute set to en', async ({ page }) => {
      await page.goto('/');
      const lang = await page.locator('html').getAttribute('lang');
      expect(lang).toBe('en');
    });
  });
});
