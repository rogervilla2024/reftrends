import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Link from 'next/link';
import HomeAwayBiasClient from '@/components/HomeAwayBiasClient';

export const metadata: Metadata = {
  title: 'Home/Away Bias Analysis',
  description: 'Analyze referee tendencies for home vs away team cards. Discover which referees favor home or away teams with statistical evidence.',
  openGraph: {
    title: 'Home/Away Bias Analysis - RefTrends',
    description: 'Discover referee home/away card bias patterns.',
    url: 'https://reftrends.com/tools/home-away-bias',
  },
  alternates: {
    canonical: 'https://reftrends.com/tools/home-away-bias',
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

async function getRefereeBiasData() {
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

  return referees
    .filter(r => r.matches.length >= 5)
    .map(referee => {
      const matchesWithStats = referee.matches.filter(m => m.stats);

      const totals = matchesWithStats.reduce(
        (acc, m) => ({
          homeYellow: acc.homeYellow + (m.stats?.homeYellowCards || 0),
          awayYellow: acc.awayYellow + (m.stats?.awayYellowCards || 0),
          homeRed: acc.homeRed + (m.stats?.homeRedCards || 0),
          awayRed: acc.awayRed + (m.stats?.awayRedCards || 0),
        }),
        { homeYellow: 0, awayYellow: 0, homeRed: 0, awayRed: 0 }
      );

      const matchCount = matchesWithStats.length;
      const avgHomeCards = matchCount > 0 ? (totals.homeYellow + totals.homeRed) / matchCount : 0;
      const avgAwayCards = matchCount > 0 ? (totals.awayYellow + totals.awayRed) / matchCount : 0;

      // Bias score: positive = favors home (more away cards), negative = favors away
      const biasScore = avgAwayCards - avgHomeCards;
      const biasPercent = avgHomeCards + avgAwayCards > 0
        ? ((avgAwayCards - avgHomeCards) / (avgHomeCards + avgAwayCards)) * 100
        : 0;

      return {
        id: referee.id,
        name: referee.name,
        slug: referee.slug,
        photo: referee.photo,
        league: LEAGUE_NAMES[referee.seasonStats[0]?.leagueApiId] || 'Multiple Leagues',
        matchCount,
        homeYellow: totals.homeYellow,
        awayYellow: totals.awayYellow,
        homeRed: totals.homeRed,
        awayRed: totals.awayRed,
        avgHomeCards,
        avgAwayCards,
        biasScore,
        biasPercent,
      };
    })
    .sort((a, b) => Math.abs(b.biasScore) - Math.abs(a.biasScore));
}

export default async function HomeAwayBiasPage() {
  const referees = await getRefereeBiasData();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/tools" className="text-primary hover:underline text-sm mb-4 inline-block">
          &larr; Back to Tools
        </Link>
        <h1 className="text-3xl font-bold">Home/Away Bias Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Analyze referee tendencies for home vs away team cards
        </p>
      </div>

      <HomeAwayBiasClient referees={referees} />
    </div>
  );
}
