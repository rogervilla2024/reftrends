import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Link from 'next/link';
import RefereeFatigueClient from '@/components/RefereeFatigueClient';

export const metadata: Metadata = {
  title: 'Referee Fatigue Analysis',
  description: 'Analyze how referee fatigue affects card decisions. Compare performance based on rest days between matches.',
  openGraph: {
    title: 'Referee Fatigue Analysis - RefStats',
    description: 'How rest time affects referee decisions.',
    url: 'https://refstats.com/tools/referee-fatigue',
  },
  alternates: {
    canonical: 'https://refstats.com/tools/referee-fatigue',
  },
};

const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

const LEAGUE_NAMES: Record<number, string> = {
  39: 'Premier League',
  140: 'La Liga',
  135: 'Serie A',
  78: 'Bundesliga',
  61: 'Ligue 1',
};

async function getFatigueData() {
  const referees = await prisma.referee.findMany({
    include: {
      matches: {
        where: {
          OR: [{ status: 'FT' }, { status: 'Match Finished' }],
        },
        include: {
          stats: true,
          league: true,
        },
        orderBy: { date: 'asc' },
      },
      seasonStats: {
        orderBy: { matchesOfficiated: 'desc' },
        take: 1,
      },
    },
  });

  // Define rest categories
  const REST_CATEGORIES = [
    { min: 0, max: 3, label: '0-3 days (Short rest)' },
    { min: 4, max: 7, label: '4-7 days (Normal rest)' },
    { min: 8, max: 14, label: '8-14 days (Extended rest)' },
    { min: 15, max: Infinity, label: '15+ days (Long break)' },
  ];

  const globalStats: Record<string, { matches: number; yellow: number; red: number }> = {};
  REST_CATEGORIES.forEach(cat => {
    globalStats[cat.label] = { matches: 0, yellow: 0, red: 0 };
  });

  const refereeData = referees
    .filter(r => r.matches.length >= 5)
    .map(referee => {
      const matchesWithStats = referee.matches.filter(m => m.stats);

      // Calculate days since previous match for each match
      const matchesWithRest = matchesWithStats.map((match, idx) => {
        if (idx === 0) return null; // First match has no previous

        const prevMatch = matchesWithStats[idx - 1];
        const daysSincePrev = Math.floor(
          (new Date(match.date).getTime() - new Date(prevMatch.date).getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          date: match.date,
          daysSincePrev,
          yellowCards: match.stats?.yellowCards || 0,
          redCards: match.stats?.redCards || 0,
          totalCards: (match.stats?.yellowCards || 0) + (match.stats?.redCards || 0),
        };
      }).filter(Boolean) as {
        date: Date;
        daysSincePrev: number;
        yellowCards: number;
        redCards: number;
        totalCards: number;
      }[];

      // Group by rest category
      const restStats: Record<string, { matches: number; yellow: number; red: number; total: number }> = {};
      REST_CATEGORIES.forEach(cat => {
        restStats[cat.label] = { matches: 0, yellow: 0, red: 0, total: 0 };
      });

      matchesWithRest.forEach(match => {
        const category = REST_CATEGORIES.find(
          cat => match.daysSincePrev >= cat.min && match.daysSincePrev <= cat.max
        );
        if (category) {
          restStats[category.label].matches++;
          restStats[category.label].yellow += match.yellowCards;
          restStats[category.label].red += match.redCards;
          restStats[category.label].total += match.totalCards;

          // Add to global stats
          globalStats[category.label].matches++;
          globalStats[category.label].yellow += match.yellowCards;
          globalStats[category.label].red += match.redCards;
        }
      });

      // Calculate averages and fatigue impact
      const restData = REST_CATEGORIES.map(cat => ({
        category: cat.label,
        matches: restStats[cat.label].matches,
        avgYellow: restStats[cat.label].matches > 0
          ? restStats[cat.label].yellow / restStats[cat.label].matches
          : 0,
        avgRed: restStats[cat.label].matches > 0
          ? restStats[cat.label].red / restStats[cat.label].matches
          : 0,
        avgTotal: restStats[cat.label].matches > 0
          ? restStats[cat.label].total / restStats[cat.label].matches
          : 0,
      }));

      // Calculate fatigue impact (short rest vs normal rest)
      const shortRest = restData.find(r => r.category.includes('0-3'));
      const normalRest = restData.find(r => r.category.includes('4-7'));

      const fatigueImpact = shortRest && normalRest && shortRest.matches >= 2 && normalRest.matches >= 2
        ? shortRest.avgTotal - normalRest.avgTotal
        : null;

      return {
        id: referee.id,
        name: referee.name,
        slug: referee.slug,
        photo: referee.photo,
        league: LEAGUE_NAMES[referee.seasonStats[0]?.leagueApiId] || 'Multiple Leagues',
        totalMatches: matchesWithStats.length,
        restData,
        fatigueImpact,
        shortRestMatches: shortRest?.matches || 0,
        shortRestAvg: shortRest?.avgTotal || 0,
        normalRestAvg: normalRest?.avgTotal || 0,
      };
    })
    .filter(r => r.shortRestMatches >= 2)
    .sort((a, b) => {
      if (a.fatigueImpact === null) return 1;
      if (b.fatigueImpact === null) return -1;
      return Math.abs(b.fatigueImpact) - Math.abs(a.fatigueImpact);
    });

  // Global category stats
  const globalRestData = REST_CATEGORIES.map(cat => ({
    category: cat.label.split(' ')[0], // Short label for chart
    fullLabel: cat.label,
    matches: globalStats[cat.label].matches,
    avgYellow: globalStats[cat.label].matches > 0
      ? globalStats[cat.label].yellow / globalStats[cat.label].matches
      : 0,
    avgRed: globalStats[cat.label].matches > 0
      ? globalStats[cat.label].red / globalStats[cat.label].matches
      : 0,
    avgTotal: globalStats[cat.label].matches > 0
      ? (globalStats[cat.label].yellow + globalStats[cat.label].red) / globalStats[cat.label].matches
      : 0,
  }));

  // Find most affected referees
  const mostAffected = refereeData
    .filter(r => r.fatigueImpact !== null && r.fatigueImpact > 0)
    .sort((a, b) => (b.fatigueImpact || 0) - (a.fatigueImpact || 0))
    .slice(0, 5);

  const leastAffected = refereeData
    .filter(r => r.fatigueImpact !== null && r.fatigueImpact < 0)
    .sort((a, b) => (a.fatigueImpact || 0) - (b.fatigueImpact || 0))
    .slice(0, 5);

  return {
    referees: refereeData,
    globalRestData,
    mostAffected,
    leastAffected,
    summary: {
      totalAnalyzed: refereeData.length,
      shortRestTotal: globalStats[REST_CATEGORIES[0].label].matches,
      normalRestTotal: globalStats[REST_CATEGORIES[1].label].matches,
    },
  };
}

export default async function RefereeFatiguePage() {
  const data = await getFatigueData();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/tools" className="text-primary hover:underline text-sm mb-4 inline-block">
          &larr; Back to Tools
        </Link>
        <h1 className="text-3xl font-bold">Referee Fatigue Analysis</h1>
        <p className="text-muted-foreground mt-2">
          How rest time between matches affects referee decisions
        </p>
      </div>

      <RefereeFatigueClient data={data} />
    </div>
  );
}
