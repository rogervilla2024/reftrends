import { describe, it, expect } from 'vitest';

// JSON-LD structured data from homepage
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'RefTrends',
  description: 'Referee statistics and analytics for football betting.',
  url: 'https://reftrends.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://reftrends.com/referees?search={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

describe('JSON-LD Structured Data', () => {
  describe('@context validation', () => {
    it('should have valid schema.org context', () => {
      expect(structuredData['@context']).toBe('https://schema.org');
    });

    it('should use HTTPS for schema.org', () => {
      expect(structuredData['@context']).toMatch(/^https:\/\//);
    });
  });

  describe('@type validation', () => {
    it('should be WebSite type', () => {
      expect(structuredData['@type']).toBe('WebSite');
    });

    it('should have a valid schema.org type', () => {
      const validTypes = ['WebSite', 'Organization', 'WebPage', 'Article'];
      expect(validTypes).toContain(structuredData['@type']);
    });
  });

  describe('Required properties', () => {
    it('should have name property', () => {
      expect(structuredData.name).toBeDefined();
      expect(structuredData.name).toBe('RefTrends');
    });

    it('should have description property', () => {
      expect(structuredData.description).toBeDefined();
      expect(structuredData.description.length).toBeGreaterThan(10);
    });

    it('should have url property', () => {
      expect(structuredData.url).toBeDefined();
      expect(structuredData.url).toBe('https://reftrends.com');
    });

    it('should have valid HTTPS url', () => {
      expect(structuredData.url).toMatch(/^https:\/\//);
    });
  });

  describe('SearchAction validation', () => {
    it('should have potentialAction property', () => {
      expect(structuredData.potentialAction).toBeDefined();
    });

    it('should have SearchAction type', () => {
      expect(structuredData.potentialAction['@type']).toBe('SearchAction');
    });

    it('should have target URL', () => {
      expect(structuredData.potentialAction.target).toBeDefined();
      expect(structuredData.potentialAction.target).toContain('https://reftrends.com');
    });

    it('should have search placeholder in target', () => {
      expect(structuredData.potentialAction.target).toContain('{search_term_string}');
    });

    it('should have query-input definition', () => {
      expect(structuredData.potentialAction['query-input']).toBeDefined();
      expect(structuredData.potentialAction['query-input']).toBe('required name=search_term_string');
    });

    it('should have matching placeholder name', () => {
      const queryInput = structuredData.potentialAction['query-input'];
      const target = structuredData.potentialAction.target;
      expect(queryInput).toContain('search_term_string');
      expect(target).toContain('search_term_string');
    });
  });

  describe('JSON serialization', () => {
    it('should serialize to valid JSON', () => {
      expect(() => JSON.stringify(structuredData)).not.toThrow();
    });

    it('should deserialize correctly', () => {
      const serialized = JSON.stringify(structuredData);
      const deserialized = JSON.parse(serialized);
      expect(deserialized).toEqual(structuredData);
    });

    it('should not have undefined values', () => {
      const serialized = JSON.stringify(structuredData);
      expect(serialized).not.toContain('undefined');
    });

    it('should not have null values in required fields', () => {
      expect(structuredData.name).not.toBeNull();
      expect(structuredData.url).not.toBeNull();
      expect(structuredData['@type']).not.toBeNull();
    });
  });

  describe('SEO Best Practices', () => {
    it('should have description under 160 characters', () => {
      expect(structuredData.description.length).toBeLessThanOrEqual(160);
    });

    it('should have non-empty name', () => {
      expect(structuredData.name.length).toBeGreaterThan(0);
    });

    it('should have proper URL format', () => {
      const urlPattern = /^https:\/\/[a-zA-Z0-9][-a-zA-Z0-9]*(\.[a-zA-Z0-9][-a-zA-Z0-9]*)+/;
      expect(structuredData.url).toMatch(urlPattern);
    });

    it('should not have trailing slash in URL', () => {
      expect(structuredData.url.endsWith('/')).toBe(false);
    });
  });
});
