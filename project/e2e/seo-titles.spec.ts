import { test, expect } from '@playwright/test';

test.describe('SEO Page Titles', () => {
  test.describe('Main Pages', () => {
    test('homepage should have correct default title', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveTitle('RefTrends - Referee Statistics & Betting Analytics');
    });

    test('referees page should use title template', async ({ page }) => {
      await page.goto('/referees');
      await expect(page).toHaveTitle('Referees | RefTrends');
    });

    test('tools page should use title template', async ({ page }) => {
      await page.goto('/tools');
      await expect(page).toHaveTitle('Betting Tools | RefTrends');
    });

    test('leagues page should use title template', async ({ page }) => {
      await page.goto('/leagues');
      await expect(page).toHaveTitle(/Leagues.*RefTrends/i);
    });
  });

  test.describe('League Detail Pages', () => {
    test('Premier League page should have league name in title', async ({ page }) => {
      await page.goto('/leagues/39');
      await expect(page).toHaveTitle(/Premier League.*RefTrends/);
    });

    test('La Liga page should have league name in title', async ({ page }) => {
      await page.goto('/leagues/140');
      await expect(page).toHaveTitle(/La Liga.*RefTrends/);
    });

    test('Serie A page should have league name in title', async ({ page }) => {
      await page.goto('/leagues/135');
      await expect(page).toHaveTitle(/Serie A.*RefTrends/);
    });

    test('Bundesliga page should have league name in title', async ({ page }) => {
      await page.goto('/leagues/78');
      await expect(page).toHaveTitle(/Bundesliga.*RefTrends/);
    });
  });

  test.describe('Tool Pages', () => {
    test('Match Analyzer should have specific title', async ({ page }) => {
      await page.goto('/tools/match-analyzer');
      await expect(page).toHaveTitle(/Match Analyzer.*RefTrends/i);
    });

    test('Referee Comparison should have specific title', async ({ page }) => {
      await page.goto('/tools/referee-comparison');
      await expect(page).toHaveTitle(/Referee Comparison.*RefTrends/i);
    });

    test('Card Calculator should have specific title', async ({ page }) => {
      await page.goto('/tools/card-calculator');
      await expect(page).toHaveTitle(/Card Calculator.*RefTrends/i);
    });

    test('Betting Tips should have specific title', async ({ page }) => {
      await page.goto('/tools/betting-tips');
      await expect(page).toHaveTitle(/Betting Tips.*RefTrends/i);
    });
  });

  test.describe('Legal/Info Pages', () => {
    test('FAQ page should have FAQ in title', async ({ page }) => {
      await page.goto('/faq');
      const title = await page.title();
      expect(title.toLowerCase()).toMatch(/faq|frequently asked/);
    });

    test('About page should have About in title', async ({ page }) => {
      await page.goto('/about');
      await expect(page).toHaveTitle(/About.*RefTrends/i);
    });

    test('Privacy Policy should have title', async ({ page }) => {
      await page.goto('/privacy-policy');
      await expect(page).toHaveTitle(/Privacy.*RefTrends/i);
    });

    test('Terms of Service should have title', async ({ page }) => {
      await page.goto('/terms-of-service');
      await expect(page).toHaveTitle(/Terms.*RefTrends/i);
    });

    test('Disclaimer should have title', async ({ page }) => {
      await page.goto('/disclaimer');
      await expect(page).toHaveTitle(/Disclaimer.*RefTrends/i);
    });
  });

  test.describe('Title Best Practices', () => {
    test('title should not be empty', async ({ page }) => {
      await page.goto('/');
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
    });

    test('title should be under 60 characters for SEO', async ({ page }) => {
      await page.goto('/');
      const title = await page.title();
      expect(title.length).toBeLessThanOrEqual(70);
    });

    test('title should contain brand name', async ({ page }) => {
      await page.goto('/referees');
      const title = await page.title();
      expect(title).toContain('RefTrends');
    });
  });
});
