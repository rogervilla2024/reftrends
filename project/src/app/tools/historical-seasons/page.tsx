import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Link from 'next/link';
import HistoricalSeasonsClient from '@/components/HistoricalSeasonsClient';

export const metadata: Metadata = {
  title: 'Historical Seasons',
  description: 'Compare referee performance across multiple seasons. Analyze how referees have changed their card behavior over time.',
  openGraph: {
    title: 'Historical Seasons - RefStats',
    description: 'Referee performance trends across seasons.',
    url: 'https://refstats.com/tools/historical-seasons',
  },
  alternates: {
    canonical: 'https://refstats.com/tools/historical-seasons',
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

interface SeasonData {
  season: number;
  matchCount: number;
  avgYellow: number;
  avgRed: number;
  totalCards: number;
}

interface RefereeSeasonComparison {
  id: number;
  name: string;
  slug: string;
  photo: string | null;
  seasons: {
    season: number;
    matches: number;
    avgYellow: number;
    avgRed: number;
    strictness: number;
  }[];
  trend: 'stricter' | 'lenient' | 'stable';
  changePercent: number;
}

async function getHistoricalData() {
  // Get all matches grouped by season
  const matches = await prisma.match.findMany({
    include: {
      stats: true,
      referee: true,
      league: true,
    },
    where: {
      stats: {
        isNot: null,
      },
    },
  });

  // Group by season
  const seasonGroups: Record<number, typeof matches> = {};
  matches.forEach(match => {
    if (!seasonGroups[match.season]) {
      seasonGroups[match.season] = [];
    }
    seasonGroups[match.season].push(match);
  });

  const seasons = Object.keys(seasonGroups).map(Number).sort((a, b) => b - a);

  if (seasons.length < 2) {
    return {
      hasMultipleSeasons: false,
      seasons: [],
      overallTrends: [],
      refereeComparisons: [],
      leagueSeasons: {},
    };
  }

  // Calculate season stats
  const seasonStats: SeasonData[] = seasons.map(season => {
    const seasonMatches = seasonGroups[season].filter(m => m.stats);
    const totalYellow = seasonMatches.reduce((sum, m) => sum + (m.stats?.yellowCards || 0), 0);
    const totalRed = seasonMatches.reduce((sum, m) => sum + (m.stats?.redCards || 0), 0);

    return {
      season,
      matchCount: seasonMatches.length,
      avgYellow: seasonMatches.length > 0 ? totalYellow / seasonMatches.length : 0,
      avgRed: seasonMatches.length > 0 ? totalRed / seasonMatches.length : 0,
      totalCards: totalYellow + totalRed,
    };
  });

  // Get referee season stats
  const refereeSeasonStats = await prisma.refereeSeasonStats.findMany({
    include: {
      referee: true,
    },
  });

  // Group by referee
  const refereeGroups: Record<number, typeof refereeSeasonStats> = {};
  refereeSeasonStats.forEach(stat => {
    if (!refereeGroups[stat.refereeId]) {
      refereeGroups[stat.refereeId] = [];
    }
    refereeGroups[stat.refereeId].push(stat);
  });

  // Calculate referee comparisons (only referees with multiple seasons)
  const refereeComparisons: RefereeSeasonComparison[] = Object.entries(refereeGroups)
    .filter(([, stats]) => {
      const uniqueSeasons = new Set(stats.map(s => s.season));
      return uniqueSeasons.size >= 2;
    })
    .map(([, stats]) => {
      const referee = stats[0].referee;
      const seasonData = stats.reduce((acc, stat) => {
        if (!acc[stat.season]) {
          acc[stat.season] = { matches: 0, yellow: 0, red: 0, strictness: 0, count: 0 };
        }
        acc[stat.season].matches += stat.matchesOfficiated;
        acc[stat.season].yellow += stat.totalYellowCards;
        acc[stat.season].red += stat.totalRedCards;
        acc[stat.season].strictness += stat.strictnessIndex;
        acc[stat.season].count++;
        return acc;
      }, {} as Record<number, { matches: number; yellow: number; red: number; strictness: number; count: number }>);

      const seasonsList = Object.entries(seasonData)
        .map(([season, data]) => ({
          season: parseInt(season),
          matches: data.matches,
          avgYellow: data.matches > 0 ? data.yellow / data.matches : 0,
          avgRed: data.matches > 0 ? data.red / data.matches : 0,
          strictness: data.count > 0 ? data.strictness / data.count : 0,
        }))
        .sort((a, b) => b.season - a.season);

      // Calculate trend
      let trend: 'stricter' | 'lenient' | 'stable' = 'stable';
      let changePercent = 0;

      if (seasonsList.length >= 2) {
        const latest = seasonsList[0].strictness;
        const previous = seasonsList[1].strictness;
        if (previous > 0) {
          changePercent = ((latest - previous) / previous) * 100;
          if (changePercent > 10) trend = 'stricter';
          else if (changePercent < -10) trend = 'lenient';
        }
      }

      return {
        id: referee.id,
        name: referee.name,
        slug: referee.slug,
        photo: referee.photo,
        seasons: seasonsList,
        trend,
        changePercent,
      };
    })
    .filter(r => r.seasons.reduce((sum, s) => sum + s.matches, 0) >= 10)
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));

  // League season breakdown
  const leagueSeasons: Record<string, SeasonData[]> = {};

  for (const leagueApiId of [39, 140, 135, 78, 61]) {
    const leagueName = LEAGUE_NAMES[leagueApiId];
    leagueSeasons[leagueName] = seasons.map(season => {
      const leagueMatches = seasonGroups[season]?.filter(
        m => m.league.apiId === leagueApiId && m.stats
      ) || [];

      const totalYellow = leagueMatches.reduce((sum, m) => sum + (m.stats?.yellowCards || 0), 0);
      const totalRed = leagueMatches.reduce((sum, m) => sum + (m.stats?.redCards || 0), 0);

      return {
        season,
        matchCount: leagueMatches.length,
        avgYellow: leagueMatches.length > 0 ? totalYellow / leagueMatches.length : 0,
        avgRed: leagueMatches.length > 0 ? totalRed / leagueMatches.length : 0,
        totalCards: totalYellow + totalRed,
      };
    }).filter(s => s.matchCount > 0);
  }

  return {
    hasMultipleSeasons: true,
    seasons: seasonStats,
    overallTrends: seasonStats,
    refereeComparisons: refereeComparisons.slice(0, 20),
    leagueSeasons,
  };
}

export default async function HistoricalSeasonsPage() {
  const data = await getHistoricalData();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/tools" className="text-primary hover:underline text-sm mb-4 inline-block">
          &larr; Back to Tools
        </Link>
        <h1 className="text-3xl font-bold">Historical Seasons</h1>
        <p className="text-muted-foreground mt-2">
          Compare referee performance across multiple seasons
        </p>
      </div>

      <HistoricalSeasonsClient data={data} />
    </div>
  );
}
