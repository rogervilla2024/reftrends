import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Link from 'next/link';
import FoulAnalysisClient from '@/components/FoulAnalysisClient';

export const metadata: Metadata = {
  title: 'Foul Analysis',
  description: 'Detailed foul statistics by referee. Analyze fouls per match, foul-to-card ratios, and referee leniency patterns.',
  openGraph: {
    title: 'Foul Analysis - RefStats',
    description: 'Comprehensive foul statistics and analysis.',
    url: 'https://refstats.com/tools/foul-analysis',
  },
  alternates: {
    canonical: 'https://refstats.com/tools/foul-analysis',
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

async function getFoulData() {
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
      const matchesWithStats = referee.matches.filter(m => m.stats && m.stats.fouls > 0);
      const matchCount = matchesWithStats.length;

      if (matchCount === 0) {
        return null;
      }

      const totalFouls = matchesWithStats.reduce((sum, m) => sum + (m.stats?.fouls || 0), 0);
      const homeFouls = matchesWithStats.reduce((sum, m) => sum + (m.stats?.homeFouls || 0), 0);
      const awayFouls = matchesWithStats.reduce((sum, m) => sum + (m.stats?.awayFouls || 0), 0);
      const totalYellow = matchesWithStats.reduce((sum, m) => sum + (m.stats?.yellowCards || 0), 0);
      const totalRed = matchesWithStats.reduce((sum, m) => sum + (m.stats?.redCards || 0), 0);

      const avgFouls = totalFouls / matchCount;
      const avgYellow = totalYellow / matchCount;

      // Foul to card ratio (how many fouls per card)
      const totalCards = totalYellow + totalRed;
      const foulToCardRatio = totalCards > 0 ? totalFouls / totalCards : avgFouls;

      // Leniency score: higher = more lenient (more fouls before card)
      const leniencyScore = foulToCardRatio;

      return {
        id: referee.id,
        name: referee.name,
        slug: referee.slug,
        photo: referee.photo,
        league: LEAGUE_NAMES[referee.seasonStats[0]?.leagueApiId] || 'Multiple Leagues',
        matchCount,
        totalFouls,
        homeFouls,
        awayFouls,
        avgFouls,
        avgYellow,
        foulToCardRatio,
        leniencyScore,
        homeFoulPercent: totalFouls > 0 ? (homeFouls / totalFouls) * 100 : 50,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.avgFouls - a!.avgFouls);

  // League foul stats
  const leagueStats: Record<number, { fouls: number; cards: number; matches: number }> = {};

  referees.forEach(ref => {
    ref.matches.forEach(match => {
      if (!match.stats || match.stats.fouls === 0) return;

      const leagueApiId = match.league.apiId;
      if (!leagueStats[leagueApiId]) {
        leagueStats[leagueApiId] = { fouls: 0, cards: 0, matches: 0 };
      }
      leagueStats[leagueApiId].fouls += match.stats.fouls;
      leagueStats[leagueApiId].cards += match.stats.yellowCards + match.stats.redCards;
      leagueStats[leagueApiId].matches++;
    });
  });

  const leagueData = Object.entries(leagueStats).map(([apiId, stats]) => ({
    name: LEAGUE_NAMES[parseInt(apiId)] || `League ${apiId}`,
    avgFouls: stats.matches > 0 ? stats.fouls / stats.matches : 0,
    avgCards: stats.matches > 0 ? stats.cards / stats.matches : 0,
    foulToCardRatio: stats.cards > 0 ? stats.fouls / stats.cards : 0,
    matches: stats.matches,
  })).sort((a, b) => b.avgFouls - a.avgFouls);

  // Overall stats
  const allMatches = referees.flatMap(r => r.matches.filter(m => m.stats && m.stats.fouls > 0));
  const totalFouls = allMatches.reduce((sum, m) => sum + (m.stats?.fouls || 0), 0);
  const totalCards = allMatches.reduce((sum, m) => sum + (m.stats?.yellowCards || 0) + (m.stats?.redCards || 0), 0);

  return {
    referees: refereeStats as NonNullable<typeof refereeStats[0]>[],
    leagueData,
    overall: {
      totalMatches: allMatches.length,
      totalFouls,
      avgFouls: allMatches.length > 0 ? totalFouls / allMatches.length : 0,
      avgFoulToCard: totalCards > 0 ? totalFouls / totalCards : 0,
    },
  };
}

export default async function FoulAnalysisPage() {
  const data = await getFoulData();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/tools" className="text-primary hover:underline text-sm mb-4 inline-block">
          &larr; Back to Tools
        </Link>
        <h1 className="text-3xl font-bold">Foul Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Detailed foul statistics and leniency patterns by referee
        </p>
      </div>

      <FoulAnalysisClient data={data} />
    </div>
  );
}
