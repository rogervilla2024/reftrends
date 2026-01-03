import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Link from 'next/link';
import LeagueComparisonClient from '@/components/LeagueComparisonClient';

export const metadata: Metadata = {
  title: 'League Comparison',
  description: 'Compare referee strictness and card statistics across the top 5 European leagues. Premier League, La Liga, Serie A, Bundesliga, and Ligue 1.',
  openGraph: {
    title: 'League Comparison - RefStats',
    description: 'Compare referee strictness across Europe\'s top 5 leagues.',
    url: 'https://refstats.com/tools/league-comparison',
  },
  alternates: {
    canonical: 'https://refstats.com/tools/league-comparison',
  },
};

const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

const LEAGUES = [
  { apiId: 39, name: 'Premier League', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { apiId: 140, name: 'La Liga', country: 'Spain', flag: '🇪🇸' },
  { apiId: 135, name: 'Serie A', country: 'Italy', flag: '🇮🇹' },
  { apiId: 78, name: 'Bundesliga', country: 'Germany', flag: '🇩🇪' },
  { apiId: 61, name: 'Ligue 1', country: 'France', flag: '🇫🇷' },
];

async function getLeagueStats() {
  const leagues = await prisma.league.findMany({
    where: {
      apiId: { in: LEAGUES.map(l => l.apiId) },
    },
    include: {
      matches: {
        where: {
          OR: [{ status: 'FT' }, { status: 'Match Finished' }],
        },
        include: {
          stats: true,
          referee: true,
        },
      },
    },
  });

  return LEAGUES.map(leagueInfo => {
    const league = leagues.find(l => l.apiId === leagueInfo.apiId);
    if (!league) {
      return {
        ...leagueInfo,
        matches: 0,
        totalYellow: 0,
        totalRed: 0,
        avgYellow: 0,
        avgRed: 0,
        avgCards: 0,
        strictnessRank: 0,
        topReferees: [],
      };
    }

    const matchesWithStats = league.matches.filter(m => m.stats);
    const matchCount = matchesWithStats.length;

    const totals = matchesWithStats.reduce(
      (acc, m) => ({
        yellow: acc.yellow + (m.stats?.yellowCards || 0),
        red: acc.red + (m.stats?.redCards || 0),
        fouls: acc.fouls + (m.stats?.fouls || 0),
      }),
      { yellow: 0, red: 0, fouls: 0 }
    );

    // Get referee stats for this league
    const refereeStats: Record<number, {
      name: string;
      slug: string;
      matches: number;
      yellow: number;
      red: number;
    }> = {};

    matchesWithStats.forEach(match => {
      if (!match.referee) return;

      if (!refereeStats[match.referee.id]) {
        refereeStats[match.referee.id] = {
          name: match.referee.name,
          slug: match.referee.slug,
          matches: 0,
          yellow: 0,
          red: 0,
        };
      }

      refereeStats[match.referee.id].matches++;
      refereeStats[match.referee.id].yellow += match.stats?.yellowCards || 0;
      refereeStats[match.referee.id].red += match.stats?.redCards || 0;
    });

    const topReferees = Object.values(refereeStats)
      .map(ref => ({
        ...ref,
        avgCards: ref.matches > 0 ? (ref.yellow + ref.red) / ref.matches : 0,
      }))
      .filter(r => r.matches >= 3)
      .sort((a, b) => b.avgCards - a.avgCards)
      .slice(0, 5);

    return {
      ...leagueInfo,
      matches: matchCount,
      totalYellow: totals.yellow,
      totalRed: totals.red,
      totalFouls: totals.fouls,
      avgYellow: matchCount > 0 ? totals.yellow / matchCount : 0,
      avgRed: matchCount > 0 ? totals.red / matchCount : 0,
      avgFouls: matchCount > 0 ? totals.fouls / matchCount : 0,
      avgCards: matchCount > 0 ? (totals.yellow + totals.red) / matchCount : 0,
      topReferees,
    };
  });
}

export default async function LeagueComparisonPage() {
  const leagueStats = await getLeagueStats();

  // Sort by avg cards and add rank
  const rankedStats = [...leagueStats]
    .sort((a, b) => b.avgCards - a.avgCards)
    .map((league, idx) => ({ ...league, strictnessRank: idx + 1 }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/tools" className="text-primary hover:underline text-sm mb-4 inline-block">
          &larr; Back to Tools
        </Link>
        <h1 className="text-3xl font-bold">League Comparison</h1>
        <p className="text-muted-foreground mt-2">
          Compare referee strictness across Europe&apos;s top 5 leagues
        </p>
      </div>

      <LeagueComparisonClient leagues={rankedStats} />
    </div>
  );
}
