import { test, expect } from '@playwright/test';

test.describe('SEO Twitter Card Tags', () => {
  test.describe('Homepage Twitter Cards', () => {
    test('should have twitter:card', async ({ page }) => {
      await page.goto('/');
      const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
      expect(twitterCard).toBe('summary_large_image');
    });

    test('should have twitter:title', async ({ page }) => {
      await page.goto('/');
      const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute('content');
      expect(twitterTitle).toBeTruthy();
      expect(twitterTitle).toContain('RefTrends');
    });

    test('should have twitter:description', async ({ page }) => {
      await page.goto('/');
      const twitterDesc = await page.locator('meta[name="twitter:description"]').getAttribute('content');
      expect(twitterDesc).toBeTruthy();
      expect(twitterDesc!.length).toBeGreaterThan(20);
    });

    test('should have twitter:image', async ({ page }) => {
      await page.goto('/');
      const twitterImage = await page.locator('meta[name="twitter:image"]').getAttribute('content');
      expect(twitterImage).toBeTruthy();
    });
  });

  test.describe('Referees Page Twitter Cards', () => {
    test('should have twitter:card', async ({ page }) => {
      await page.goto('/referees');
      const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
      expect(['summary', 'summary_large_image']).toContain(twitterCard);
    });

    test('should have twitter:title', async ({ page }) => {
      await page.goto('/referees');
      const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute('content');
      expect(twitterTitle).toBeTruthy();
    });

    test('should have twitter:description', async ({ page }) => {
      await page.goto('/referees');
      const twitterDesc = await page.locator('meta[name="twitter:description"]').getAttribute('content');
      expect(twitterDesc).toBeTruthy();
    });
  });

  test.describe('League Pages Twitter Cards', () => {
    test('Premier League should have twitter:title', async ({ page }) => {
      await page.goto('/leagues/39');
      const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute('content');
      expect(twitterTitle).toBeTruthy();
      expect(twitterTitle).toContain('Premier League');
    });

    test('League page should have twitter:card', async ({ page }) => {
      await page.goto('/leagues/39');
      const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
      expect(['summary', 'summary_large_image']).toContain(twitterCard);
    });
  });

  test.describe('Tools Page Twitter Cards', () => {
    test('should have twitter:card', async ({ page }) => {
      await page.goto('/tools');
      const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
      expect(['summary', 'summary_large_image']).toContain(twitterCard);
    });

    test('should have twitter:title', async ({ page }) => {
      await page.goto('/tools');
      const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute('content');
      expect(twitterTitle).toBeTruthy();
    });
  });

  test.describe('Twitter Card Best Practices', () => {
    test('twitter:title should be under 70 characters', async ({ page }) => {
      await page.goto('/');
      const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute('content');
      expect(twitterTitle!.length).toBeLessThanOrEqual(70);
    });

    test('twitter:description should be under 200 characters', async ({ page }) => {
      await page.goto('/');
      const twitterDesc = await page.locator('meta[name="twitter:description"]').getAttribute('content');
      expect(twitterDesc!.length).toBeLessThanOrEqual(200);
    });
  });

  test.describe('All Main Pages Should Have Twitter Cards', () => {
    const pages = ['/', '/referees', '/leagues', '/tools', '/faq', '/about'];

    for (const path of pages) {
      test(`${path || 'homepage'} should have twitter:card`, async ({ page }) => {
        await page.goto(path);
        const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
        expect(['summary', 'summary_large_image']).toContain(twitterCard);
      });
    }
  });
});
