import { test, expect } from '@playwright/test';

test.describe('SEO Meta Descriptions', () => {
  test.describe('Homepage Description', () => {
    test('should have meta description', async ({ page }) => {
      await page.goto('/');
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();
    });

    test('should be under 250 characters (SEO recommended max)', async ({ page }) => {
      await page.goto('/');
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description!.length).toBeLessThanOrEqual(250);
    });

    test('should be at least 50 characters for SEO', async ({ page }) => {
      await page.goto('/');
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description!.length).toBeGreaterThanOrEqual(50);
    });

    test('should mention key features', async ({ page }) => {
      await page.goto('/');
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toMatch(/referee|statistics|betting|analytics/i);
    });

    test('should mention leagues', async ({ page }) => {
      await page.goto('/');
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toMatch(/Premier League|La Liga|Serie A|Bundesliga|Ligue 1/i);
    });
  });

  test.describe('Referees Page Description', () => {
    test('should have unique description', async ({ page }) => {
      await page.goto('/referees');
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();
      expect(description!.length).toBeGreaterThan(50);
    });

    test('should mention referee', async ({ page }) => {
      await page.goto('/referees');
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description?.toLowerCase()).toContain('referee');
    });
  });

  test.describe('Tools Page Description', () => {
    test('should have unique description', async ({ page }) => {
      await page.goto('/tools');
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();
    });

    test('should describe betting tools', async ({ page }) => {
      await page.goto('/tools');
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toMatch(/betting|analysis|tool/i);
    });
  });

  test.describe('League Detail Page Descriptions', () => {
    test('Premier League should have league-specific description', async ({ page }) => {
      await page.goto('/leagues/39');
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();
      expect(description).toContain('Premier League');
    });

    test('La Liga should have league-specific description', async ({ page }) => {
      await page.goto('/leagues/140');
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();
      expect(description).toContain('La Liga');
    });
  });

  test.describe('All Pages Should Have Descriptions', () => {
    const pages = [
      { path: '/', name: 'Homepage' },
      { path: '/referees', name: 'Referees' },
      { path: '/leagues', name: 'Leagues' },
      { path: '/tools', name: 'Tools' },
      { path: '/faq', name: 'FAQ' },
      { path: '/about', name: 'About' },
    ];

    for (const { path, name } of pages) {
      test(`${name} page should have description`, async ({ page }) => {
        await page.goto(path);
        const description = await page.locator('meta[name="description"]').getAttribute('content');
        expect(description).toBeTruthy();
        expect(description!.length).toBeGreaterThan(20);
      });
    }
  });

  test.describe('Description Uniqueness', () => {
    test('homepage and referees page should have different descriptions', async ({ page }) => {
      await page.goto('/');
      const homeDescription = await page.locator('meta[name="description"]').getAttribute('content');

      await page.goto('/referees');
      const refereesDescription = await page.locator('meta[name="description"]').getAttribute('content');

      expect(homeDescription).not.toBe(refereesDescription);
    });

    test('homepage and tools page should have different descriptions', async ({ page }) => {
      await page.goto('/');
      const homeDescription = await page.locator('meta[name="description"]').getAttribute('content');

      await page.goto('/tools');
      const toolsDescription = await page.locator('meta[name="description"]').getAttribute('content');

      expect(homeDescription).not.toBe(toolsDescription);
    });
  });
});
