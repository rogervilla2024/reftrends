import { test, expect } from '@playwright/test';

test.describe('SEO Structured Data (JSON-LD)', () => {
  test.describe('Homepage JSON-LD', () => {
    test('should have JSON-LD script tag', async ({ page }) => {
      await page.goto('/');
      const jsonLd = page.locator('script[type="application/ld+json"]');
      expect(await jsonLd.count()).toBeGreaterThan(0);
    });

    test('should have valid JSON content', async ({ page }) => {
      await page.goto('/');
      const jsonLdContent = await page.locator('script[type="application/ld+json"]').textContent();
      expect(() => JSON.parse(jsonLdContent!)).not.toThrow();
    });

    test('should have @context set to schema.org', async ({ page }) => {
      await page.goto('/');
      const jsonLdContent = await page.locator('script[type="application/ld+json"]').textContent();
      const data = JSON.parse(jsonLdContent!);
      expect(data['@context']).toBe('https://schema.org');
    });

    test('should have @type set to WebSite', async ({ page }) => {
      await page.goto('/');
      const jsonLdContent = await page.locator('script[type="application/ld+json"]').textContent();
      const data = JSON.parse(jsonLdContent!);
      expect(data['@type']).toBe('WebSite');
    });

    test('should have name property', async ({ page }) => {
      await page.goto('/');
      const jsonLdContent = await page.locator('script[type="application/ld+json"]').textContent();
      const data = JSON.parse(jsonLdContent!);
      expect(data.name).toBe('RefTrends');
    });

    test('should have description property', async ({ page }) => {
      await page.goto('/');
      const jsonLdContent = await page.locator('script[type="application/ld+json"]').textContent();
      const data = JSON.parse(jsonLdContent!);
      expect(data.description).toBeTruthy();
    });

    test('should have url property', async ({ page }) => {
      await page.goto('/');
      const jsonLdContent = await page.locator('script[type="application/ld+json"]').textContent();
      const data = JSON.parse(jsonLdContent!);
      expect(data.url).toBe('https://reftrends.com');
    });
  });

  test.describe('SearchAction Structured Data', () => {
    test('should have potentialAction', async ({ page }) => {
      await page.goto('/');
      const jsonLdContent = await page.locator('script[type="application/ld+json"]').textContent();
      const data = JSON.parse(jsonLdContent!);
      expect(data.potentialAction).toBeTruthy();
    });

    test('should have SearchAction type', async ({ page }) => {
      await page.goto('/');
      const jsonLdContent = await page.locator('script[type="application/ld+json"]').textContent();
      const data = JSON.parse(jsonLdContent!);
      expect(data.potentialAction['@type']).toBe('SearchAction');
    });

    test('should have target URL with search placeholder', async ({ page }) => {
      await page.goto('/');
      const jsonLdContent = await page.locator('script[type="application/ld+json"]').textContent();
      const data = JSON.parse(jsonLdContent!);
      expect(data.potentialAction.target).toContain('{search_term_string}');
    });

    test('should have query-input definition', async ({ page }) => {
      await page.goto('/');
      const jsonLdContent = await page.locator('script[type="application/ld+json"]').textContent();
      const data = JSON.parse(jsonLdContent!);
      expect(data.potentialAction['query-input']).toBe('required name=search_term_string');
    });
  });

  test.describe('JSON-LD Validation', () => {
    test('JSON should serialize and deserialize correctly', async ({ page }) => {
      await page.goto('/');
      const jsonLdContent = await page.locator('script[type="application/ld+json"]').textContent();
      const data = JSON.parse(jsonLdContent!);
      const reserialized = JSON.stringify(data);
      const reparsed = JSON.parse(reserialized);
      expect(reparsed).toEqual(data);
    });

    test('should not have empty required fields', async ({ page }) => {
      await page.goto('/');
      const jsonLdContent = await page.locator('script[type="application/ld+json"]').textContent();
      const data = JSON.parse(jsonLdContent!);
      expect(data.name).not.toBe('');
      expect(data.url).not.toBe('');
    });

    test('URL should be valid HTTPS URL', async ({ page }) => {
      await page.goto('/');
      const jsonLdContent = await page.locator('script[type="application/ld+json"]').textContent();
      const data = JSON.parse(jsonLdContent!);
      expect(data.url).toMatch(/^https:\/\//);
    });
  });

  test.describe('Required Schema.org Properties', () => {
    test('WebSite schema should have all required properties', async ({ page }) => {
      await page.goto('/');
      const jsonLdContent = await page.locator('script[type="application/ld+json"]').textContent();
      const data = JSON.parse(jsonLdContent!);

      // Required for WebSite
      expect(data['@context']).toBeTruthy();
      expect(data['@type']).toBeTruthy();
      expect(data.name).toBeTruthy();
      expect(data.url).toBeTruthy();
    });

    test('SearchAction should have all required properties', async ({ page }) => {
      await page.goto('/');
      const jsonLdContent = await page.locator('script[type="application/ld+json"]').textContent();
      const data = JSON.parse(jsonLdContent!);

      // Required for SearchAction
      expect(data.potentialAction['@type']).toBeTruthy();
      expect(data.potentialAction.target).toBeTruthy();
      expect(data.potentialAction['query-input']).toBeTruthy();
    });
  });
});
