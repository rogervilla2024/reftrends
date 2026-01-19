import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Link from 'next/link';
import TimeAnalysisClient from '@/components/TimeAnalysisClient';

export const metadata: Metadata = {
  title: 'Time Analysis',
  description: 'Analyze when cards are shown during matches. First half, second half, injury time patterns by referee.',
  openGraph: {
    title: 'Time Analysis - RefTrends',
    description: 'Card timing analysis by referee.',
    url: 'https://reftrends.com/tools/time-analysis',
  },
  alternates: {
    canonical: 'https://reftrends.com/tools/time-analysis',
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

async function getTimeAnalysisData() {
  // Get all card events
  const cardEvents = await prisma.cardEvent.findMany({
    include: {
      matchStats: {
        include: {
          match: {
            include: {
              referee: true,
              league: true,
            },
          },
        },
      },
    },
  });

  if (cardEvents.length === 0) {
    return {
      hasData: false,
      overall: null,
      byPeriod: [],
      byMinute: [],
      referees: [],
    };
  }

  // Categorize by period
  const periods = {
    '0-15': { yellow: 0, red: 0, total: 0 },
    '16-30': { yellow: 0, red: 0, total: 0 },
    '31-45': { yellow: 0, red: 0, total: 0 },
    '45+': { yellow: 0, red: 0, total: 0 },
    '46-60': { yellow: 0, red: 0, total: 0 },
    '61-75': { yellow: 0, red: 0, total: 0 },
    '76-90': { yellow: 0, red: 0, total: 0 },
    '90+': { yellow: 0, red: 0, total: 0 },
  };

  const getPeriod = (minute: number, extra: number | null): string => {
    if (minute <= 15) return '0-15';
    if (minute <= 30) return '16-30';
    if (minute <= 45) return extra ? '45+' : '31-45';
    if (minute <= 60) return '46-60';
    if (minute <= 75) return '61-75';
    if (minute <= 90) return extra ? '90+' : '76-90';
    return '90+';
  };

  // Minute buckets (every 5 minutes)
  const minuteBuckets: Record<string, { yellow: number; red: number }> = {};
  for (let i = 0; i <= 90; i += 5) {
    minuteBuckets[`${i}-${i + 4}`] = { yellow: 0, red: 0 };
  }
  minuteBuckets['90+'] = { yellow: 0, red: 0 };

  // Referee stats
  const refereeStats: Record<number, {
    id: number;
    name: string;
    slug: string;
    photo: string | null;
    league: string;
    firstHalf: number;
    secondHalf: number;
    injuryTime: number;
    total: number;
    earlyCards: number; // 0-30 min
    lateCards: number;  // 75+ min
  }> = {};

  cardEvents.forEach(event => {
    const period = getPeriod(event.minute, event.extraMinute);
    const isYellow = event.type === 'yellow';

    if (periods[period as keyof typeof periods]) {
      periods[period as keyof typeof periods][isYellow ? 'yellow' : 'red']++;
      periods[period as keyof typeof periods].total++;
    }

    // Minute bucket
    if (event.minute >= 90 || event.extraMinute) {
      minuteBuckets['90+'][isYellow ? 'yellow' : 'red']++;
    } else {
      const bucketStart = Math.floor(event.minute / 5) * 5;
      const bucketKey = `${bucketStart}-${bucketStart + 4}`;
      if (minuteBuckets[bucketKey]) {
        minuteBuckets[bucketKey][isYellow ? 'yellow' : 'red']++;
      }
    }

    // Referee stats
    const referee = event.matchStats.match.referee;
    if (referee) {
      if (!refereeStats[referee.id]) {
        refereeStats[referee.id] = {
          id: referee.id,
          name: referee.name,
          slug: referee.slug,
          photo: referee.photo,
          league: LEAGUE_NAMES[event.matchStats.match.league.apiId] || 'Multiple Leagues',
          firstHalf: 0,
          secondHalf: 0,
          injuryTime: 0,
          total: 0,
          earlyCards: 0,
          lateCards: 0,
        };
      }

      refereeStats[referee.id].total++;

      if (event.minute <= 45) {
        refereeStats[referee.id].firstHalf++;
        if (event.extraMinute) refereeStats[referee.id].injuryTime++;
      } else {
        refereeStats[referee.id].secondHalf++;
        if (event.extraMinute || event.minute >= 90) refereeStats[referee.id].injuryTime++;
      }

      if (event.minute <= 30) refereeStats[referee.id].earlyCards++;
      if (event.minute >= 75) refereeStats[referee.id].lateCards++;
    }
  });

  const totalCards = cardEvents.length;
  const firstHalfCards = Object.entries(periods)
    .filter(([key]) => ['0-15', '16-30', '31-45', '45+'].includes(key))
    .reduce((sum, [, val]) => sum + val.total, 0);
  const secondHalfCards = totalCards - firstHalfCards;

  return {
    hasData: true,
    overall: {
      total: totalCards,
      firstHalf: firstHalfCards,
      secondHalf: secondHalfCards,
      firstHalfPercent: (firstHalfCards / totalCards) * 100,
      secondHalfPercent: (secondHalfCards / totalCards) * 100,
      avgMinute: cardEvents.reduce((sum, e) => sum + e.minute, 0) / totalCards,
    },
    byPeriod: Object.entries(periods).map(([period, stats]) => ({
      period,
      ...stats,
      percent: totalCards > 0 ? (stats.total / totalCards) * 100 : 0,
    })),
    byMinute: Object.entries(minuteBuckets).map(([range, stats]) => ({
      range,
      yellow: stats.yellow,
      red: stats.red,
      total: stats.yellow + stats.red,
    })),
    referees: Object.values(refereeStats)
      .filter(r => r.total >= 10)
      .map(r => ({
        ...r,
        firstHalfPercent: r.total > 0 ? (r.firstHalf / r.total) * 100 : 50,
        lateCardPercent: r.total > 0 ? (r.lateCards / r.total) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total),
  };
}

export default async function TimeAnalysisPage() {
  const data = await getTimeAnalysisData();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/tools" className="text-primary hover:underline text-sm mb-4 inline-block">
          &larr; Back to Tools
        </Link>
        <h1 className="text-3xl font-bold">Time Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Analyze when cards are shown during matches
        </p>
      </div>

      <TimeAnalysisClient data={data} />
    </div>
  );
}
