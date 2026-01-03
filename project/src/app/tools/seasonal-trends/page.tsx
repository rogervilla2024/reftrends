import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Link from 'next/link';
import SeasonalTrendsClient from '@/components/SeasonalTrendsClient';

export const metadata: Metadata = {
  title: 'Seasonal Trends',
  description: 'Analyze how referee behavior changes throughout the football season. Monthly card trends, strictness patterns, and seasonal insights.',
  openGraph: {
    title: 'Seasonal Trends - RefStats',
    description: 'Discover how referee strictness changes throughout the season.',
    url: 'https://refstats.com/tools/seasonal-trends',
  },
  alternates: {
    canonical: 'https://refstats.com/tools/seasonal-trends',
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

async function getSeasonalData() {
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ status: 'FT' }, { status: 'Match Finished' }],
    },
    include: {
      stats: true,
      referee: true,
      league: true,
    },
    orderBy: { date: 'asc' },
  });

  // Group by month
  const monthlyData: Record<string, {
    month: string;
    matches: number;
    totalYellow: number;
    totalRed: number;
    avgYellow: number;
    avgRed: number;
  }> = {};

  matches.forEach(match => {
    if (!match.stats) return;

    const monthKey = match.date.toISOString().slice(0, 7); // YYYY-MM
    const monthName = new Date(match.date).toLocaleString('en', { month: 'short', year: 'numeric' });

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthName,
        matches: 0,
        totalYellow: 0,
        totalRed: 0,
        avgYellow: 0,
        avgRed: 0,
      };
    }

    monthlyData[monthKey].matches++;
    monthlyData[monthKey].totalYellow += match.stats.yellowCards;
    monthlyData[monthKey].totalRed += match.stats.redCards;
  });

  // Calculate averages
  Object.values(monthlyData).forEach(data => {
    data.avgYellow = data.matches > 0 ? data.totalYellow / data.matches : 0;
    data.avgRed = data.matches > 0 ? data.totalRed / data.matches : 0;
  });

  const monthlyTrends = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, data]) => data);

  // League monthly trends
  const leagueMonthlyData: Record<number, Record<string, {
    month: string;
    matches: number;
    totalYellow: number;
    totalRed: number;
    avgCards: number;
  }>> = {};

  matches.forEach(match => {
    if (!match.stats || !match.league) return;

    const leagueId = match.league.apiId;
    const monthKey = match.date.toISOString().slice(0, 7);
    const monthName = new Date(match.date).toLocaleString('en', { month: 'short' });

    if (!leagueMonthlyData[leagueId]) {
      leagueMonthlyData[leagueId] = {};
    }

    if (!leagueMonthlyData[leagueId][monthKey]) {
      leagueMonthlyData[leagueId][monthKey] = {
        month: monthName,
        matches: 0,
        totalYellow: 0,
        totalRed: 0,
        avgCards: 0,
      };
    }

    leagueMonthlyData[leagueId][monthKey].matches++;
    leagueMonthlyData[leagueId][monthKey].totalYellow += match.stats.yellowCards;
    leagueMonthlyData[leagueId][monthKey].totalRed += match.stats.redCards;
  });

  // Calculate league averages
  Object.values(leagueMonthlyData).forEach(leagueData => {
    Object.values(leagueData).forEach(data => {
      data.avgCards = data.matches > 0 ? (data.totalYellow + data.totalRed) / data.matches : 0;
    });
  });

  // Referee trends (top 10 most active)
  const refereeMatches: Record<number, {
    id: number;
    name: string;
    slug: string;
    matches: { date: Date; yellow: number; red: number }[];
  }> = {};

  matches.forEach(match => {
    if (!match.stats || !match.referee) return;

    if (!refereeMatches[match.referee.id]) {
      refereeMatches[match.referee.id] = {
        id: match.referee.id,
        name: match.referee.name,
        slug: match.referee.slug,
        matches: [],
      };
    }

    refereeMatches[match.referee.id].matches.push({
      date: match.date,
      yellow: match.stats.yellowCards,
      red: match.stats.redCards,
    });
  });

  const topReferees = Object.values(refereeMatches)
    .filter(r => r.matches.length >= 10)
    .sort((a, b) => b.matches.length - a.matches.length)
    .slice(0, 10)
    .map(ref => {
      // Calculate trend (comparing first half vs second half)
      const sorted = [...ref.matches].sort((a, b) => a.date.getTime() - b.date.getTime());
      const midpoint = Math.floor(sorted.length / 2);
      const firstHalf = sorted.slice(0, midpoint);
      const secondHalf = sorted.slice(midpoint);

      const firstAvg = firstHalf.reduce((sum, m) => sum + m.yellow + m.red, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, m) => sum + m.yellow + m.red, 0) / secondHalf.length;
      const trendChange = secondAvg - firstAvg;

      // Monthly breakdown
      const monthlyBreakdown: Record<string, { yellow: number; red: number; count: number }> = {};
      ref.matches.forEach(m => {
        const monthKey = m.date.toISOString().slice(0, 7);
        if (!monthlyBreakdown[monthKey]) {
          monthlyBreakdown[monthKey] = { yellow: 0, red: 0, count: 0 };
        }
        monthlyBreakdown[monthKey].yellow += m.yellow;
        monthlyBreakdown[monthKey].red += m.red;
        monthlyBreakdown[monthKey].count++;
      });

      return {
        id: ref.id,
        name: ref.name,
        slug: ref.slug,
        totalMatches: ref.matches.length,
        avgCards: ref.matches.reduce((sum, m) => sum + m.yellow + m.red, 0) / ref.matches.length,
        firstHalfAvg: firstAvg,
        secondHalfAvg: secondAvg,
        trendChange,
        trend: (trendChange > 0.3 ? 'increasing' : trendChange < -0.3 ? 'decreasing' : 'stable') as 'increasing' | 'decreasing' | 'stable',
        monthlyData: Object.entries(monthlyBreakdown)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, data]) => ({
            month: new Date(month + '-01').toLocaleString('en', { month: 'short' }),
            avgCards: data.count > 0 ? (data.yellow + data.red) / data.count : 0,
            matches: data.count,
          })),
      };
    });

  return {
    monthlyTrends,
    leagueMonthlyData: Object.entries(leagueMonthlyData).map(([apiId, data]) => ({
      league: LEAGUE_NAMES[parseInt(apiId)] || `League ${apiId}`,
      data: Object.values(data).sort((a, b) => a.month.localeCompare(b.month)),
    })),
    topReferees,
    seasonSummary: {
      totalMatches: matches.length,
      totalYellow: matches.reduce((sum, m) => sum + (m.stats?.yellowCards || 0), 0),
      totalRed: matches.reduce((sum, m) => sum + (m.stats?.redCards || 0), 0),
    },
  };
}

export default async function SeasonalTrendsPage() {
  const data = await getSeasonalData();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/tools" className="text-primary hover:underline text-sm mb-4 inline-block">
          &larr; Back to Tools
        </Link>
        <h1 className="text-3xl font-bold">Seasonal Trends</h1>
        <p className="text-muted-foreground mt-2">
          Analyze how referee behavior changes throughout the season
        </p>
      </div>

      <SeasonalTrendsClient data={data} />
    </div>
  );
}
