import { test, expect } from '@playwright/test';

test.describe('SEO Canonical URLs', () => {
  test.describe('Homepage Canonical', () => {
    test('should have canonical link', async ({ page }) => {
      await page.goto('/');
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBeTruthy();
    });

    test('should have correct canonical URL', async ({ page }) => {
      await page.goto('/');
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toMatch(/https:\/\/reftrends\.com\/?$/);
    });
  });

  test.describe('Main Pages Canonical URLs', () => {
    test('referees page should have canonical link', async ({ page }) => {
      await page.goto('/referees');
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBe('https://reftrends.com/referees');
    });

    test('tools page should have canonical link', async ({ page }) => {
      await page.goto('/tools');
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBe('https://reftrends.com/tools');
    });

    test('leagues page should have canonical link', async ({ page }) => {
      await page.goto('/leagues');
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBe('https://reftrends.com/leagues');
    });
  });

  test.describe('League Detail Pages Canonical URLs', () => {
    test('Premier League page should have canonical link', async ({ page }) => {
      await page.goto('/leagues/39');
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBe('https://reftrends.com/leagues/39');
    });

    test('La Liga page should have canonical link', async ({ page }) => {
      await page.goto('/leagues/140');
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBe('https://reftrends.com/leagues/140');
    });

    test('Serie A page should have canonical link', async ({ page }) => {
      await page.goto('/leagues/135');
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBe('https://reftrends.com/leagues/135');
    });
  });

  test.describe('Canonical URL Format', () => {
    test('canonical should be absolute URL', async ({ page }) => {
      await page.goto('/referees');
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toMatch(/^https?:\/\//);
    });

    test('canonical should use https', async ({ page }) => {
      await page.goto('/');
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toMatch(/^https:\/\//);
    });

    test('canonical should use correct domain', async ({ page }) => {
      await page.goto('/tools');
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toContain('reftrends.com');
    });
  });

  test.describe('Legal Pages Canonical URLs', () => {
    test('FAQ page should have canonical link', async ({ page }) => {
      await page.goto('/faq');
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBe('https://reftrends.com/faq');
    });

    test('About page should have canonical link', async ({ page }) => {
      await page.goto('/about');
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBe('https://reftrends.com/about');
    });

    test('Privacy Policy should have canonical link', async ({ page }) => {
      await page.goto('/privacy-policy');
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBe('https://reftrends.com/privacy-policy');
    });
  });

  test.describe('Tool Pages Canonical URLs', () => {
    test('Match Analyzer should have canonical link', async ({ page }) => {
      await page.goto('/tools/match-analyzer');
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBe('https://reftrends.com/tools/match-analyzer');
    });

    test('Referee Comparison should have canonical link', async ({ page }) => {
      await page.goto('/tools/referee-comparison');
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBe('https://reftrends.com/tools/referee-comparison');
    });
  });
});
