import { MetadataRoute } from 'next';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

const BASE_URL = 'https://refstats.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/referees`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/leagues`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tools/match-analyzer`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/tools/referee-comparison`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // League pages
  const leagueIds = [39, 140, 135, 78, 61]; // Premier League, La Liga, Serie A, Bundesliga, Ligue 1
  const leaguePages: MetadataRoute.Sitemap = leagueIds.map((id) => ({
    url: `${BASE_URL}/leagues/${id}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Referee pages
  let refereePages: MetadataRoute.Sitemap = [];
  try {
    const referees = await prisma.referee.findMany({
      select: { slug: true, updatedAt: true },
    });

    refereePages = referees.map((referee) => ({
      url: `${BASE_URL}/referees/${referee.slug}`,
      lastModified: referee.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Error fetching referees for sitemap:', error);
  }

  return [...staticPages, ...leaguePages, ...refereePages];
}
