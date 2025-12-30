import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import dynamic from 'next/dynamic';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Referee Comparison',
  description: 'Compare football referees side-by-side with statistical charts, career stats, and export functionality. Analyze strictness, card averages, and home bias.',
  openGraph: {
    title: 'Referee Comparison - RefStats',
    description: 'Compare referees side-by-side with statistical charts and career analysis.',
    url: 'https://refstats.com/tools/referee-comparison',
  },
  twitter: {
    title: 'Referee Comparison - RefStats',
    description: 'Compare referees side-by-side with statistical charts and career analysis.',
  },
  alternates: {
    canonical: 'https://refstats.com/tools/referee-comparison',
  },
};

// Dynamic import for heavy client component with charts
const RefereeComparisonClient = dynamic(() => import('@/components/RefereeComparisonClient'), {
  loading: () => <div className="h-96 flex items-center justify-center text-muted-foreground">Loading comparison tool...</div>,
  ssr: false,
});

const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

interface RefereeOption {
  id: number;
  name: string;
  slug: string;
  photo: string | null;
  nationality: string | null;
}

interface RefereeFullStats {
  id: number;
  name: string;
  slug: string;
  photo: string | null;
  nationality: string | null;
  seasonStats: {
    season: number;
    leagueApiId: number;
    matchesOfficiated: number;
    totalYellowCards: number;
    totalRedCards: number;
    avgYellowCards: number;
    avgRedCards: number;
    totalPenalties: number;
    avgPenalties: number;
    strictnessIndex: number;
    homeBiasScore: number;
  }[];
  careerStats: {
    totalMatches: number;
    totalYellowCards: number;
    totalRedCards: number;
    totalPenalties: number;
    avgYellowCards: number;
    avgRedCards: number;
    avgPenalties: number;
    avgStrictness: number;
  };
}

async function getRefereeOptions(): Promise<RefereeOption[]> {
  try {
    const referees = await prisma.referee.findMany({
      orderBy: { name: 'asc' },
    });

    return referees.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      photo: r.photo,
      nationality: r.nationality,
    }));
  } catch (error) {
    console.error('Error fetching referees:', error);
    return [];
  }
}

async function getRefereeFullStats(): Promise<Map<number, RefereeFullStats>> {
  try {
    const referees = await prisma.referee.findMany({
      include: {
        seasonStats: {
          orderBy: { season: 'desc' },
        },
      },
    });

    const statsMap = new Map<number, RefereeFullStats>();

    referees.forEach((referee) => {
      const careerStats = referee.seasonStats.reduce(
        (acc, stat) => ({
          totalMatches: acc.totalMatches + stat.matchesOfficiated,
          totalYellowCards: acc.totalYellowCards + stat.totalYellowCards,
          totalRedCards: acc.totalRedCards + stat.totalRedCards,
          totalPenalties: acc.totalPenalties + stat.totalPenalties,
          sumStrictness: acc.sumStrictness + stat.strictnessIndex * stat.matchesOfficiated,
        }),
        {
          totalMatches: 0,
          totalYellowCards: 0,
          totalRedCards: 0,
          totalPenalties: 0,
          sumStrictness: 0,
        }
      );

      statsMap.set(referee.id, {
        id: referee.id,
        name: referee.name,
        slug: referee.slug,
        photo: referee.photo,
        nationality: referee.nationality,
        seasonStats: referee.seasonStats.map((s) => ({
          season: s.season,
          leagueApiId: s.leagueApiId,
          matchesOfficiated: s.matchesOfficiated,
          totalYellowCards: s.totalYellowCards,
          totalRedCards: s.totalRedCards,
          avgYellowCards: s.avgYellowCards,
          avgRedCards: s.avgRedCards,
          totalPenalties: s.totalPenalties,
          avgPenalties: s.avgPenalties,
          strictnessIndex: s.strictnessIndex,
          homeBiasScore: s.homeBiasScore,
        })),
        careerStats: {
          totalMatches: careerStats.totalMatches,
          totalYellowCards: careerStats.totalYellowCards,
          totalRedCards: careerStats.totalRedCards,
          totalPenalties: careerStats.totalPenalties,
          avgYellowCards:
            careerStats.totalMatches > 0
              ? careerStats.totalYellowCards / careerStats.totalMatches
              : 0,
          avgRedCards:
            careerStats.totalMatches > 0
              ? careerStats.totalRedCards / careerStats.totalMatches
              : 0,
          avgPenalties:
            careerStats.totalMatches > 0
              ? careerStats.totalPenalties / careerStats.totalMatches
              : 0,
          avgStrictness:
            careerStats.totalMatches > 0
              ? careerStats.sumStrictness / careerStats.totalMatches
              : 0,
        },
      });
    });

    return statsMap;
  } catch (error) {
    console.error('Error fetching referee stats:', error);
    return new Map();
  }
}

async function getLeagueMap(): Promise<Record<number, string>> {
  try {
    const leagues = await prisma.league.findMany();
    return leagues.reduce((acc, league) => {
      acc[league.apiId] = league.name;
      return acc;
    }, {} as Record<number, string>);
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return {};
  }
}

export default async function RefereeComparisonPage() {
  const [refereeOptions, refereeStats, leagueMap] = await Promise.all([
    getRefereeOptions(),
    getRefereeFullStats(),
    getLeagueMap(),
  ]);

  const refereeStatsObj = Object.fromEntries(refereeStats);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/tools"
          className="text-primary hover:underline text-sm mb-4 inline-block"
        >
          ← Back to Tools
        </Link>
        <h1 className="text-3xl font-bold">Referee Comparison</h1>
        <p className="text-muted-foreground mt-2">
          Compare referees side-by-side with statistical charts and export functionality
        </p>
      </div>

      <RefereeComparisonClient
        refereeOptions={refereeOptions}
        refereeStats={refereeStatsObj}
        leagueMap={leagueMap}
      />
    </div>
  );
}
