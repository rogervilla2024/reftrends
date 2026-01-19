import { test, expect } from '@playwright/test';

test.describe('Robots.txt Integration', () => {
  test.describe('Accessibility', () => {
    test('robots.txt should be accessible', async ({ page }) => {
      const response = await page.goto('/robots.txt');
      expect(response?.status()).toBe(200);
    });

    test('robots.txt should return text content', async ({ page }) => {
      const response = await page.goto('/robots.txt');
      const contentType = response?.headers()['content-type'];
      expect(contentType).toContain('text');
    });
  });

  test.describe('Content Validation', () => {
    test('should have User-agent directive', async ({ page }) => {
      await page.goto('/robots.txt');
      const content = await page.textContent('body');
      expect(content).toContain('User-agent');
    });

    test('should allow all bots by default', async ({ page }) => {
      await page.goto('/robots.txt');
      const content = await page.textContent('body');
      expect(content).toContain('User-agent: *');
    });

    test('should have Allow directive for root', async ({ page }) => {
      await page.goto('/robots.txt');
      const content = await page.textContent('body');
      expect(content).toContain('Allow: /');
    });
  });

  test.describe('Sitemap Reference', () => {
    test('should contain sitemap reference', async ({ page }) => {
      await page.goto('/robots.txt');
      const content = await page.textContent('body');
      expect(content).toContain('Sitemap:');
    });

    test('should have correct sitemap URL', async ({ page }) => {
      await page.goto('/robots.txt');
      const content = await page.textContent('body');
      expect(content).toContain('https://reftrends.com/sitemap.xml');
    });
  });

  test.describe('Disallow Directives', () => {
    test('should disallow API routes', async ({ page }) => {
      await page.goto('/robots.txt');
      const content = await page.textContent('body');
      expect(content).toContain('Disallow: /api/');
    });
  });

  test.describe('Allow Directives', () => {
    test('should allow referees section', async ({ page }) => {
      await page.goto('/robots.txt');
      const content = await page.textContent('body');
      expect(content).toContain('Allow: /referees/');
    });

    test('should allow leagues section', async ({ page }) => {
      await page.goto('/robots.txt');
      const content = await page.textContent('body');
      expect(content).toContain('Allow: /leagues/');
    });

    test('should allow tools section', async ({ page }) => {
      await page.goto('/robots.txt');
      const content = await page.textContent('body');
      expect(content).toContain('Allow: /tools/');
    });
  });

  test.describe('Robots Meta Tags on Pages', () => {
    test('homepage should be indexable', async ({ page }) => {
      await page.goto('/');
      const robots = await page.locator('meta[name="robots"]').getAttribute('content');
      expect(robots).toContain('index');
      expect(robots).toContain('follow');
    });

    test('referees page should be indexable', async ({ page }) => {
      await page.goto('/referees');
      const robots = await page.locator('meta[name="robots"]').getAttribute('content');
      expect(robots).not.toContain('noindex');
    });

    test('tools page should be indexable', async ({ page }) => {
      await page.goto('/tools');
      const robots = await page.locator('meta[name="robots"]').getAttribute('content');
      expect(robots).not.toContain('noindex');
    });

    test('leagues page should be indexable', async ({ page }) => {
      await page.goto('/leagues');
      const robots = await page.locator('meta[name="robots"]').getAttribute('content');
      expect(robots).not.toContain('noindex');
    });
  });
});
