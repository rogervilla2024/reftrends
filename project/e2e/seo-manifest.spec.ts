import { test, expect } from '@playwright/test';

test.describe('PWA Manifest Integration', () => {
  test.describe('Manifest Accessibility', () => {
    test('manifest.json should be accessible', async ({ page }) => {
      const response = await page.goto('/manifest.json');
      expect(response?.status()).toBe(200);
    });

    test('manifest should return JSON content type', async ({ page }) => {
      const response = await page.goto('/manifest.json');
      const contentType = response?.headers()['content-type'];
      expect(contentType).toContain('json');
    });

    test('manifest should be valid JSON', async ({ page }) => {
      const response = await page.goto('/manifest.json');
      const content = await response?.json();
      expect(content).toBeTruthy();
    });
  });

  test.describe('Manifest Required Fields', () => {
    test('should have name field', async ({ page }) => {
      const response = await page.goto('/manifest.json');
      const manifest = await response?.json();
      expect(manifest.name).toBeTruthy();
      expect(manifest.name).toContain('RefTrends');
    });

    test('should have short_name field', async ({ page }) => {
      const response = await page.goto('/manifest.json');
      const manifest = await response?.json();
      expect(manifest.short_name).toBeTruthy();
      expect(manifest.short_name).toBe('RefTrends');
    });

    test('should have start_url field', async ({ page }) => {
      const response = await page.goto('/manifest.json');
      const manifest = await response?.json();
      expect(manifest.start_url).toBe('/');
    });

    test('should have display field', async ({ page }) => {
      const response = await page.goto('/manifest.json');
      const manifest = await response?.json();
      expect(manifest.display).toBeTruthy();
      expect(['standalone', 'fullscreen', 'minimal-ui', 'browser']).toContain(manifest.display);
    });

    test('should have description field', async ({ page }) => {
      const response = await page.goto('/manifest.json');
      const manifest = await response?.json();
      expect(manifest.description).toBeTruthy();
      expect(manifest.description.length).toBeGreaterThan(20);
    });
  });

  test.describe('Manifest Colors', () => {
    test('should have theme_color', async ({ page }) => {
      const response = await page.goto('/manifest.json');
      const manifest = await response?.json();
      expect(manifest.theme_color).toBeTruthy();
      expect(manifest.theme_color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    test('should have background_color', async ({ page }) => {
      const response = await page.goto('/manifest.json');
      const manifest = await response?.json();
      expect(manifest.background_color).toBeTruthy();
      expect(manifest.background_color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  test.describe('Manifest Icons', () => {
    test('should have icons array', async ({ page }) => {
      const response = await page.goto('/manifest.json');
      const manifest = await response?.json();
      expect(Array.isArray(manifest.icons)).toBe(true);
      expect(manifest.icons.length).toBeGreaterThan(0);
    });

    test('should have 192x192 icon', async ({ page }) => {
      const response = await page.goto('/manifest.json');
      const manifest = await response?.json();
      const icon192 = manifest.icons.find(
        (icon: { sizes: string }) => icon.sizes === '192x192'
      );
      expect(icon192).toBeTruthy();
    });

    test('should have 512x512 icon', async ({ page }) => {
      const response = await page.goto('/manifest.json');
      const manifest = await response?.json();
      const icon512 = manifest.icons.find(
        (icon: { sizes: string }) => icon.sizes === '512x512'
      );
      expect(icon512).toBeTruthy();
    });

    test('icons should have type field', async ({ page }) => {
      const response = await page.goto('/manifest.json');
      const manifest = await response?.json();
      manifest.icons.forEach((icon: { type?: string }) => {
        expect(icon.type).toBeTruthy();
      });
    });

    test('icons should have src field', async ({ page }) => {
      const response = await page.goto('/manifest.json');
      const manifest = await response?.json();
      manifest.icons.forEach((icon: { src: string }) => {
        expect(icon.src).toBeTruthy();
      });
    });
  });

  test.describe('Manifest Link in HTML', () => {
    test('HTML should have manifest link', async ({ page }) => {
      await page.goto('/');
      const manifestLink = await page.locator('link[rel="manifest"]').getAttribute('href');
      expect(manifestLink).toBe('/manifest.json');
    });
  });

  test.describe('Manifest Optional Fields', () => {
    test('should have categories', async ({ page }) => {
      const response = await page.goto('/manifest.json');
      const manifest = await response?.json();
      expect(manifest.categories).toBeTruthy();
      expect(Array.isArray(manifest.categories)).toBe(true);
    });

    test('should have lang field', async ({ page }) => {
      const response = await page.goto('/manifest.json');
      const manifest = await response?.json();
      expect(manifest.lang).toBe('en');
    });

    test('should have dir field', async ({ page }) => {
      const response = await page.goto('/manifest.json');
      const manifest = await response?.json();
      expect(manifest.dir).toBe('ltr');
    });

    test('should have orientation field', async ({ page }) => {
      const response = await page.goto('/manifest.json');
      const manifest = await response?.json();
      expect(manifest.orientation).toBeTruthy();
    });
  });
});
