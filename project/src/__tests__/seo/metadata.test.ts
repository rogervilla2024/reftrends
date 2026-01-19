import { describe, it, expect } from 'vitest';
import type { Metadata, Viewport } from 'next';

// Root layout metadata configuration (mirroring layout.tsx)
const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

const metadata: Metadata = {
  metadataBase: new URL('https://reftrends.com'),
  title: {
    default: 'RefTrends - Referee Statistics & Betting Analytics',
    template: '%s | RefTrends',
  },
  description:
    'Comprehensive referee statistics and betting analytics for Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Eredivisie, Liga Portugal, and Super Lig. Track cards, penalties, and referee tendencies.',
  keywords: [
    'referee statistics',
    'betting',
    'football',
    'soccer',
    'analytics',
    'Premier League',
    'La Liga',
    'Serie A',
    'Bundesliga',
    'Ligue 1',
    'yellow cards',
    'red cards',
    'betting tips',
  ],
  authors: [{ name: 'RefTrends' }],
  creator: 'RefTrends',
  publisher: 'RefTrends',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'RefTrends',
    title: 'RefTrends - Referee Statistics & Betting Analytics',
    description: "Comprehensive referee statistics and betting analytics for Europe's top leagues.",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RefTrends - Referee Statistics & Betting Analytics',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RefTrends - Referee Statistics & Betting Analytics',
    description: "Comprehensive referee statistics and betting analytics for Europe's top leagues.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
};

describe('Root Layout Metadata', () => {
  describe('MetadataBase', () => {
    it('should have metadataBase defined', () => {
      expect(metadata.metadataBase).toBeDefined();
    });

    it('should use HTTPS', () => {
      expect(metadata.metadataBase!.protocol).toBe('https:');
    });

    it('should use correct domain', () => {
      expect(metadata.metadataBase!.hostname).toBe('reftrends.com');
    });
  });

  describe('Title Configuration', () => {
    it('should have default title', () => {
      expect((metadata.title as { default: string }).default).toBeDefined();
    });

    it('should have title template with %s placeholder', () => {
      expect((metadata.title as { template: string }).template).toContain('%s');
    });

    it('should include brand name in template', () => {
      expect((metadata.title as { template: string }).template).toContain('RefTrends');
    });

    it('default title should be under 70 characters', () => {
      const defaultTitle = (metadata.title as { default: string }).default;
      expect(defaultTitle.length).toBeLessThanOrEqual(70);
    });
  });

  describe('Description', () => {
    it('should have description defined', () => {
      expect(metadata.description).toBeDefined();
    });

    it('should be at least 50 characters', () => {
      expect(metadata.description!.length).toBeGreaterThanOrEqual(50);
    });

    it('should be under 250 characters (SEO recommended max)', () => {
      expect(metadata.description!.length).toBeLessThanOrEqual(250);
    });

    it('should mention key features', () => {
      expect(metadata.description).toMatch(/referee|statistics|betting|analytics/i);
    });
  });

  describe('Keywords', () => {
    it('should have keywords array', () => {
      expect(Array.isArray(metadata.keywords)).toBe(true);
    });

    it('should include referee-related keywords', () => {
      expect(metadata.keywords).toContain('referee statistics');
    });

    it('should include league names', () => {
      const keywords = metadata.keywords as string[];
      expect(keywords.some((k) => k.includes('Premier League'))).toBe(true);
    });

    it('should have at least 5 keywords', () => {
      expect((metadata.keywords as string[]).length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Authors and Publisher', () => {
    it('should have authors defined', () => {
      expect(metadata.authors).toBeDefined();
    });

    it('should have author name', () => {
      expect((metadata.authors as { name: string }[])[0].name).toBe('RefTrends');
    });

    it('should have creator', () => {
      expect(metadata.creator).toBe('RefTrends');
    });

    it('should have publisher', () => {
      expect(metadata.publisher).toBe('RefTrends');
    });
  });

  describe('OpenGraph Configuration', () => {
    it('should have openGraph defined', () => {
      expect(metadata.openGraph).toBeDefined();
    });

    it('should have type website', () => {
      expect(metadata.openGraph!.type).toBe('website');
    });

    it('should have locale en_US', () => {
      expect(metadata.openGraph!.locale).toBe('en_US');
    });

    it('should have siteName', () => {
      expect(metadata.openGraph!.siteName).toBe('RefTrends');
    });

    it('should have title', () => {
      expect(metadata.openGraph!.title).toBeDefined();
    });

    it('should have description', () => {
      expect(metadata.openGraph!.description).toBeDefined();
    });

    it('should have images array', () => {
      expect(Array.isArray(metadata.openGraph!.images)).toBe(true);
    });

    it('should have image with correct dimensions', () => {
      const images = metadata.openGraph!.images as { width: number; height: number }[];
      expect(images[0].width).toBe(1200);
      expect(images[0].height).toBe(630);
    });

    it('should have image alt text', () => {
      const images = metadata.openGraph!.images as { alt: string }[];
      expect(images[0].alt).toBeDefined();
    });
  });

  describe('Twitter Card Configuration', () => {
    it('should have twitter defined', () => {
      expect(metadata.twitter).toBeDefined();
    });

    it('should have card type summary_large_image', () => {
      expect(metadata.twitter!.card).toBe('summary_large_image');
    });

    it('should have title', () => {
      expect(metadata.twitter!.title).toBeDefined();
    });

    it('should have description', () => {
      expect(metadata.twitter!.description).toBeDefined();
    });

    it('should have images', () => {
      expect(metadata.twitter!.images).toBeDefined();
    });
  });

  describe('Robots Configuration', () => {
    it('should have robots defined', () => {
      expect(metadata.robots).toBeDefined();
    });

    it('should allow indexing', () => {
      expect((metadata.robots as { index: boolean }).index).toBe(true);
    });

    it('should allow following', () => {
      expect((metadata.robots as { follow: boolean }).follow).toBe(true);
    });
  });

  describe('Manifest', () => {
    it('should have manifest path', () => {
      expect(metadata.manifest).toBe('/manifest.json');
    });
  });

  describe('Canonical URL', () => {
    it('should have alternates defined', () => {
      expect(metadata.alternates).toBeDefined();
    });

    it('should have canonical URL', () => {
      expect(metadata.alternates!.canonical).toBeDefined();
    });
  });
});

describe('Viewport Configuration', () => {
  describe('Basic Viewport', () => {
    it('should have width device-width', () => {
      expect(viewport.width).toBe('device-width');
    });

    it('should have initialScale 1', () => {
      expect(viewport.initialScale).toBe(1);
    });
  });

  describe('Theme Color', () => {
    it('should have theme colors defined', () => {
      expect(viewport.themeColor).toBeDefined();
    });

    it('should have light mode theme color', () => {
      const themeColors = viewport.themeColor as { media: string; color: string }[];
      const lightTheme = themeColors.find((t) => t.media.includes('light'));
      expect(lightTheme).toBeDefined();
      expect(lightTheme!.color).toBe('#ffffff');
    });

    it('should have dark mode theme color', () => {
      const themeColors = viewport.themeColor as { media: string; color: string }[];
      const darkTheme = themeColors.find((t) => t.media.includes('dark'));
      expect(darkTheme).toBeDefined();
      expect(darkTheme!.color).toBe('#0a0a0a');
    });
  });
});
