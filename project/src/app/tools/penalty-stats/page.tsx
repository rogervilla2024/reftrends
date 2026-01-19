import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Link from 'next/link';
import PenaltyStatsClient from '@/components/PenaltyStatsClient';

export const metadata: Metadata = {
  title: 'Penalty Statistics',
  description: 'Deep dive into penalty statistics by referee. Analyze which referees award the most penalties and their penalty patterns.',
  openGraph: {
    title: 'Penalty Statistics - RefTrends',
    description: 'Detailed penalty analysis by referee.',
    url: 'https://reftrends.com/tools/penalty-stats',
  },
  alternates: {
    canonical: 'https://reftrends.com/tools/penalty-stats',
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

async function getPenaltyData() {
  const referees = await prisma.referee.findMany({
    include: {
      matches: {
        where: {
          OR: [{ status: 'FT' }, { status: 'Match Finished' }],
        },
        include: {
          stats: true,
          league: true,
          homeTeam: true,
          awayTeam: true,
        },
      },
      seasonStats: {
        orderBy: { matchesOfficiated: 'desc' },
        take: 1,
      },
    },
  });

  const refereeStats = referees
    .filter(r => r.matches.length >= 5)
    .map(referee => {
      const matchesWithStats = referee.matches.filter(m => m.stats);
      const matchCount = matchesWithStats.length;

      const totalPenalties = matchesWithStats.reduce((sum, m) => sum + (m.stats?.penalties || 0), 0);
      const homePenalties = matchesWithStats.reduce((sum, m) => sum + (m.stats?.homePenalties || 0), 0);
      const awayPenalties = matchesWithStats.reduce((sum, m) => sum + (m.stats?.awayPenalties || 0), 0);

      const matchesWithPenalty = matchesWithStats.filter(m => (m.stats?.penalties || 0) > 0).length;
      const matchesWithMultiple = matchesWithStats.filter(m => (m.stats?.penalties || 0) > 1).length;

      // Recent penalty matches
      const recentPenaltyMatches = matchesWithStats
        .filter(m => (m.stats?.penalties || 0) > 0)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map(m => ({
          date: m.date.toISOString().split('T')[0],
          homeTeam: m.homeTeam.name,
          awayTeam: m.awayTeam.name,
          homePenalties: m.stats?.homePenalties || 0,
          awayPenalties: m.stats?.awayPenalties || 0,
          total: m.stats?.penalties || 0,
        }));

      return {
        id: referee.id,
        name: referee.name,
        slug: referee.slug,
        photo: referee.photo,
        league: LEAGUE_NAMES[referee.seasonStats[0]?.leagueApiId] || 'Multiple Leagues',
        matchCount,
        totalPenalties,
        homePenalties,
        awayPenalties,
        avgPenalties: matchCount > 0 ? totalPenalties / matchCount : 0,
        penaltyRate: matchCount > 0 ? (matchesWithPenalty / matchCount) * 100 : 0,
        multiPenaltyRate: matchCount > 0 ? (matchesWithMultiple / matchCount) * 100 : 0,
        matchesWithPenalty,
        matchesWithMultiple,
        homeBias: totalPenalties > 0 ? ((homePenalties / totalPenalties) * 100) - 50 : 0,
        recentPenaltyMatches,
      };
    })
    .sort((a, b) => b.avgPenalties - a.avgPenalties);

  // League penalty stats
  const leagueStats = Object.entries(LEAGUE_NAMES).map(([apiId, name]) => {
    const leagueMatches = referees.flatMap(r =>
      r.matches.filter(m => m.league.apiId === parseInt(apiId) && m.stats)
    );
    const uniqueMatches = [...new Map(leagueMatches.map(m => [m.id, m])).values()];

    const totalPenalties = uniqueMatches.reduce((sum, m) => sum + (m.stats?.penalties || 0), 0);
    const matchCount = uniqueMatches.length;

    return {
      name,
      matchCount,
      totalPenalties,
      avgPenalties: matchCount > 0 ? totalPenalties / matchCount : 0,
    };
  }).sort((a, b) => b.avgPenalties - a.avgPenalties);

  // Overall stats
  const allMatches = referees.flatMap(r => r.matches.filter(m => m.stats));
  const uniqueAllMatches = [...new Map(allMatches.map(m => [m.id, m])).values()];
  const totalPenaltiesAll = uniqueAllMatches.reduce((sum, m) => sum + (m.stats?.penalties || 0), 0);

  return {
    referees: refereeStats,
    leagueStats,
    overall: {
      totalMatches: uniqueAllMatches.length,
      totalPenalties: totalPenaltiesAll,
      avgPenalties: uniqueAllMatches.length > 0 ? totalPenaltiesAll / uniqueAllMatches.length : 0,
      matchesWithPenalty: uniqueAllMatches.filter(m => (m.stats?.penalties || 0) > 0).length,
    },
  };
}

export default async function PenaltyStatsPage() {
  const data = await getPenaltyData();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/tools" className="text-primary hover:underline text-sm mb-4 inline-block">
          &larr; Back to Tools
        </Link>
        <h1 className="text-3xl font-bold">Penalty Statistics</h1>
        <p className="text-muted-foreground mt-2">
          Deep dive into penalty patterns by referee
        </p>
      </div>

      <PenaltyStatsClient data={data} />
    </div>
  );
}
