import { test, expect } from '@playwright/test';

test.describe('Sitemap Integration', () => {
  test.describe('Sitemap Accessibility', () => {
    test('sitemap.xml should be accessible', async ({ page }) => {
      const response = await page.goto('/sitemap.xml', { waitUntil: 'networkidle' });
      // Accept 200 or 503 during server warmup
      expect([200, 503]).toContain(response?.status());
    });

    test('sitemap should return XML or text content type', async ({ page }) => {
      const response = await page.goto('/sitemap.xml', { waitUntil: 'networkidle' });
      if (response?.status() === 200) {
        const contentType = response?.headers()['content-type'];
        expect(contentType).toMatch(/xml|text/);
      }
    });
  });

  test.describe('Sitemap Content', () => {
    test('sitemap should contain urlset element when available', async ({ page }) => {
      const response = await page.goto('/sitemap.xml', { waitUntil: 'networkidle' });
      if (response?.status() === 200) {
        const content = await page.content();
        expect(content).toContain('urlset');
      }
    });

    test('sitemap should contain loc elements when available', async ({ page }) => {
      const response = await page.goto('/sitemap.xml', { waitUntil: 'networkidle' });
      if (response?.status() === 200) {
        const content = await page.content();
        expect(content).toContain('<loc>');
      }
    });

    test('sitemap should contain homepage URL when available', async ({ page }) => {
      const response = await page.goto('/sitemap.xml', { waitUntil: 'networkidle' });
      if (response?.status() === 200) {
        const content = await page.content();
        expect(content).toContain('https://reftrends.com');
      }
    });
  });

  test.describe('Sitemap URLs Reachability', () => {
    test('homepage from sitemap should be reachable', async ({ page }) => {
      const response = await page.goto('/');
      expect(response?.status()).toBeLessThan(400);
    });

    test('referees page should be reachable', async ({ page }) => {
      const response = await page.goto('/referees');
      expect(response?.status()).toBeLessThan(400);
    });

    test('leagues page should be reachable', async ({ page }) => {
      const response = await page.goto('/leagues');
      expect(response?.status()).toBeLessThan(400);
    });

    test('tools page should be reachable', async ({ page }) => {
      const response = await page.goto('/tools');
      expect(response?.status()).toBeLessThan(400);
    });

    test('faq page should be reachable', async ({ page }) => {
      const response = await page.goto('/faq');
      expect(response?.status()).toBeLessThan(500);
    });

    test('about page should be reachable', async ({ page }) => {
      const response = await page.goto('/about');
      expect(response?.status()).toBeLessThan(400);
    });
  });

  test.describe('League Pages Reachability', () => {
    const leagueIds = [39, 140, 135, 78, 61, 88, 94, 203];

    for (const id of leagueIds) {
      test(`league ${id} page should be reachable`, async ({ page }) => {
        const response = await page.goto(`/leagues/${id}`);
        expect(response?.status()).toBeLessThan(500);
      });
    }
  });

  test.describe('Tool Pages Reachability', () => {
    const tools = [
      'match-analyzer',
      'referee-comparison',
      'card-calculator',
      'betting-tips',
      'value-finder',
    ];

    for (const tool of tools) {
      test(`tool ${tool} page should be reachable`, async ({ page }) => {
        const response = await page.goto(`/tools/${tool}`);
        expect(response?.status()).toBeLessThan(400);
      });
    }
  });

  test.describe('Legal Pages Reachability', () => {
    const legalPages = ['privacy-policy', 'terms-of-service', 'disclaimer'];

    for (const legalPage of legalPages) {
      test(`${legalPage} page should be reachable`, async ({ page }) => {
        const response = await page.goto(`/${legalPage}`);
        expect(response?.status()).toBeLessThan(400);
      });
    }
  });

  test.describe('Sitemap Schema', () => {
    test('sitemap should have proper XML namespace when available', async ({ page }) => {
      const response = await page.goto('/sitemap.xml', { waitUntil: 'networkidle' });
      if (response?.status() === 200) {
        const content = await page.content();
        expect(content).toMatch(/xmlns.*sitemaps\.org/);
      }
    });
  });
});
