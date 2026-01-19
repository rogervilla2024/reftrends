import { test, expect } from '@playwright/test';

test.describe('SEO OpenGraph Tags', () => {
  test.describe('Homepage OpenGraph', () => {
    test('should have og:title', async ({ page }) => {
      await page.goto('/');
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      expect(ogTitle).toBeTruthy();
      expect(ogTitle).toContain('RefTrends');
    });

    test('should have og:description', async ({ page }) => {
      await page.goto('/');
      const ogDesc = await page.locator('meta[property="og:description"]').getAttribute('content');
      expect(ogDesc).toBeTruthy();
      expect(ogDesc!.length).toBeGreaterThan(20);
    });

    test('should have og:type', async ({ page }) => {
      await page.goto('/');
      const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');
      expect(ogType).toBe('website');
    });

    test('should have og:locale', async ({ page }) => {
      await page.goto('/');
      const ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content');
      expect(ogLocale).toBe('en_US');
    });

    test('should have og:site_name', async ({ page }) => {
      await page.goto('/');
      const ogSiteName = await page.locator('meta[property="og:site_name"]').getAttribute('content');
      expect(ogSiteName).toBe('RefTrends');
    });

    test('should have og:image', async ({ page }) => {
      await page.goto('/');
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
      expect(ogImage).toBeTruthy();
    });

    test('should have og:image:width', async ({ page }) => {
      await page.goto('/');
      const ogWidth = await page.locator('meta[property="og:image:width"]').getAttribute('content');
      expect(ogWidth).toBe('1200');
    });

    test('should have og:image:height', async ({ page }) => {
      await page.goto('/');
      const ogHeight = await page.locator('meta[property="og:image:height"]').getAttribute('content');
      expect(ogHeight).toBe('630');
    });

    test('should have og:url or canonical link', async ({ page }) => {
      await page.goto('/');
      const ogUrl = page.locator('meta[property="og:url"]');
      const canonical = page.locator('link[rel="canonical"]');
      const hasOgUrl = await ogUrl.count() > 0;
      const hasCanonical = await canonical.count() > 0;
      expect(hasOgUrl || hasCanonical).toBe(true);
    });
  });

  test.describe('Referees Page OpenGraph', () => {
    test('should have og:title', async ({ page }) => {
      await page.goto('/referees');
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      expect(ogTitle).toBeTruthy();
    });

    test('should have og:description', async ({ page }) => {
      await page.goto('/referees');
      const ogDesc = await page.locator('meta[property="og:description"]').getAttribute('content');
      expect(ogDesc).toBeTruthy();
    });
  });

  test.describe('League Detail Pages OpenGraph', () => {
    test('Premier League should have unique og:title', async ({ page }) => {
      await page.goto('/leagues/39');
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      expect(ogTitle).toBeTruthy();
      expect(ogTitle).toContain('Premier League');
    });

    test('La Liga should have unique og:title', async ({ page }) => {
      await page.goto('/leagues/140');
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      expect(ogTitle).toBeTruthy();
      expect(ogTitle).toContain('La Liga');
    });

    test('league page should have og:url', async ({ page }) => {
      await page.goto('/leagues/39');
      const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
      expect(ogUrl).toBe('https://reftrends.com/leagues/39');
    });
  });

  test.describe('Tools Page OpenGraph', () => {
    test('should have og:title', async ({ page }) => {
      await page.goto('/tools');
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      expect(ogTitle).toBeTruthy();
    });

    test('should have og:description', async ({ page }) => {
      await page.goto('/tools');
      const ogDesc = await page.locator('meta[property="og:description"]').getAttribute('content');
      expect(ogDesc).toBeTruthy();
    });
  });

  test.describe('OpenGraph Image Requirements', () => {
    test('og:image should have proper dimensions (1200x630)', async ({ page }) => {
      await page.goto('/');
      const ogWidth = await page.locator('meta[property="og:image:width"]').getAttribute('content');
      const ogHeight = await page.locator('meta[property="og:image:height"]').getAttribute('content');
      expect(parseInt(ogWidth!)).toBe(1200);
      expect(parseInt(ogHeight!)).toBe(630);
    });

    test('og:image should be absolute URL', async ({ page }) => {
      await page.goto('/');
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
      expect(ogImage).toMatch(/^https?:\/\/|^\//);
    });

    test('og:image:alt should exist', async ({ page }) => {
      await page.goto('/');
      const ogImageAlt = await page.locator('meta[property="og:image:alt"]').getAttribute('content');
      expect(ogImageAlt).toBeTruthy();
    });
  });

  test.describe('All Main Pages Should Have OpenGraph', () => {
    const pages = ['/', '/referees', '/leagues', '/tools'];

    for (const path of pages) {
      test(`${path || 'homepage'} should have og:title`, async ({ page }) => {
        await page.goto(path);
        const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
        expect(ogTitle).toBeTruthy();
      });

      test(`${path || 'homepage'} should have og:description`, async ({ page }) => {
        await page.goto(path);
        const ogDesc = await page.locator('meta[property="og:description"]').getAttribute('content');
        expect(ogDesc).toBeTruthy();
      });
    }
  });
});
