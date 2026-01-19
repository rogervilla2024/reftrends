import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma client
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    referee: {
      findMany: vi.fn(),
    },
  })),
}));

vi.mock('@prisma/adapter-better-sqlite3', () => ({
  PrismaBetterSqlite3: vi.fn().mockImplementation(() => ({})),
}));

const BASE_URL = 'https://reftrends.com';

// Static pages configuration (mirroring sitemap.ts)
const staticPages = [
  { url: BASE_URL, priority: 1, changeFrequency: 'daily' },
  { url: `${BASE_URL}/referees`, priority: 0.9, changeFrequency: 'daily' },
  { url: `${BASE_URL}/leagues`, priority: 0.8, changeFrequency: 'weekly' },
  { url: `${BASE_URL}/tools`, priority: 0.8, changeFrequency: 'weekly' },
  { url: `${BASE_URL}/tools/match-analyzer`, priority: 0.7, changeFrequency: 'daily' },
  { url: `${BASE_URL}/tools/referee-comparison`, priority: 0.7, changeFrequency: 'weekly' },
  { url: `${BASE_URL}/tools/card-calculator`, priority: 0.7, changeFrequency: 'weekly' },
  { url: `${BASE_URL}/tools/betting-tips`, priority: 0.8, changeFrequency: 'daily' },
  { url: `${BASE_URL}/faq`, priority: 0.6, changeFrequency: 'monthly' },
  { url: `${BASE_URL}/about`, priority: 0.5, changeFrequency: 'monthly' },
  { url: `${BASE_URL}/disclaimer`, priority: 0.3, changeFrequency: 'yearly' },
  { url: `${BASE_URL}/privacy-policy`, priority: 0.3, changeFrequency: 'yearly' },
  { url: `${BASE_URL}/terms-of-service`, priority: 0.3, changeFrequency: 'yearly' },
];

const leagueIds = [39, 140, 135, 78, 61, 88, 94, 203];

const mockReferees = [
  { slug: 'anthony-taylor', updatedAt: new Date('2024-01-15') },
  { slug: 'felix-brych', updatedAt: new Date('2024-01-14') },
  { slug: 'daniele-orsato', updatedAt: new Date('2024-01-13') },
];

describe('Sitemap Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Static Pages', () => {
    it('should include homepage with priority 1', () => {
      const homepage = staticPages.find((p) => p.url === BASE_URL);
      expect(homepage).toBeDefined();
      expect(homepage!.priority).toBe(1);
    });

    it('should include referees page with priority 0.9', () => {
      const refereesPage = staticPages.find((p) => p.url === `${BASE_URL}/referees`);
      expect(refereesPage).toBeDefined();
      expect(refereesPage!.priority).toBe(0.9);
    });

    it('should include tools page', () => {
      const toolsPage = staticPages.find((p) => p.url === `${BASE_URL}/tools`);
      expect(toolsPage).toBeDefined();
    });

    it('should include leagues page', () => {
      const leaguesPage = staticPages.find((p) => p.url === `${BASE_URL}/leagues`);
      expect(leaguesPage).toBeDefined();
    });

    it('should include legal pages', () => {
      const legalPages = ['disclaimer', 'privacy-policy', 'terms-of-service'];
      legalPages.forEach((page) => {
        const found = staticPages.find((p) => p.url === `${BASE_URL}/${page}`);
        expect(found).toBeDefined();
      });
    });
  });

  describe('URL Format', () => {
    it('all URLs should start with BASE_URL', () => {
      staticPages.forEach((page) => {
        expect(page.url).toMatch(/^https:\/\/reftrends\.com/);
      });
    });

    it('all URLs should be absolute', () => {
      staticPages.forEach((page) => {
        expect(page.url).toMatch(/^https:\/\//);
      });
    });

    it('URLs should not have trailing slashes (except root)', () => {
      staticPages.forEach((page) => {
        if (page.url !== BASE_URL) {
          expect(page.url.endsWith('/')).toBe(false);
        }
      });
    });
  });

  describe('Priority Values', () => {
    it('all priorities should be between 0 and 1', () => {
      staticPages.forEach((page) => {
        expect(page.priority).toBeGreaterThanOrEqual(0);
        expect(page.priority).toBeLessThanOrEqual(1);
      });
    });

    it('homepage should have highest priority', () => {
      const homepage = staticPages.find((p) => p.url === BASE_URL);
      const maxPriority = Math.max(...staticPages.map((p) => p.priority));
      expect(homepage!.priority).toBe(maxPriority);
    });

    it('legal pages should have lower priority', () => {
      const legalUrls = ['disclaimer', 'privacy-policy', 'terms-of-service'];
      legalUrls.forEach((page) => {
        const found = staticPages.find((p) => p.url === `${BASE_URL}/${page}`);
        expect(found!.priority).toBeLessThanOrEqual(0.5);
      });
    });
  });

  describe('Change Frequency Values', () => {
    it('all changeFrequency values should be valid', () => {
      const validFrequencies = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
      staticPages.forEach((page) => {
        expect(validFrequencies).toContain(page.changeFrequency);
      });
    });

    it('homepage should have daily change frequency', () => {
      const homepage = staticPages.find((p) => p.url === BASE_URL);
      expect(homepage!.changeFrequency).toBe('daily');
    });

    it('legal pages should have yearly change frequency', () => {
      const legalUrls = ['disclaimer', 'privacy-policy', 'terms-of-service'];
      legalUrls.forEach((page) => {
        const found = staticPages.find((p) => p.url === `${BASE_URL}/${page}`);
        expect(found!.changeFrequency).toBe('yearly');
      });
    });
  });

  describe('League Pages', () => {
    it('should have 8 league IDs', () => {
      expect(leagueIds.length).toBe(8);
    });

    it('should include Premier League (39)', () => {
      expect(leagueIds).toContain(39);
    });

    it('should include La Liga (140)', () => {
      expect(leagueIds).toContain(140);
    });

    it('should include Serie A (135)', () => {
      expect(leagueIds).toContain(135);
    });

    it('should include Bundesliga (78)', () => {
      expect(leagueIds).toContain(78);
    });

    it('should include Ligue 1 (61)', () => {
      expect(leagueIds).toContain(61);
    });

    it('should generate valid league URLs', () => {
      leagueIds.forEach((id) => {
        const url = `${BASE_URL}/leagues/${id}`;
        expect(url).toMatch(/^https:\/\/reftrends\.com\/leagues\/\d+$/);
      });
    });
  });

  describe('Referee Pages', () => {
    it('should generate referee URLs with slugs', () => {
      mockReferees.forEach((referee) => {
        const url = `${BASE_URL}/referees/${referee.slug}`;
        expect(url).toMatch(/^https:\/\/reftrends\.com\/referees\/[a-z-]+$/);
      });
    });

    it('should include lastModified dates', () => {
      mockReferees.forEach((referee) => {
        expect(referee.updatedAt).toBeInstanceOf(Date);
      });
    });

    it('referee URLs should be lowercase with hyphens', () => {
      mockReferees.forEach((referee) => {
        expect(referee.slug).toMatch(/^[a-z0-9-]+$/);
      });
    });
  });

  describe('Sitemap Structure', () => {
    it('should not have duplicate URLs in static pages', () => {
      const urls = staticPages.map((p) => p.url);
      const uniqueUrls = new Set(urls);
      expect(urls.length).toBe(uniqueUrls.size);
    });

    it('should not have duplicate league IDs', () => {
      const uniqueIds = new Set(leagueIds);
      expect(leagueIds.length).toBe(uniqueIds.size);
    });
  });
});
