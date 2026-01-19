import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Link from 'next/link';
import CardCalculatorClient from '@/components/CardCalculatorClient';

export const metadata: Metadata = {
  title: 'Card Calculator',
  description: 'Calculate expected cards for any football match based on referee and team historical data. Get Over/Under probabilities for card betting markets.',
  openGraph: {
    title: 'Card Calculator - RefTrends',
    description: 'Calculate expected cards for matches based on historical data.',
    url: 'https://reftrends.com/tools/card-calculator',
  },
  alternates: {
    canonical: 'https://reftrends.com/tools/card-calculator',
  },
};

const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

async function getReferees() {
  const referees = await prisma.referee.findMany({
    include: {
      seasonStats: {
        orderBy: { matchesOfficiated: 'desc' },
        take: 1,
      },
    },
    orderBy: { name: 'asc' },
  });

  return referees
    .filter(r => r.seasonStats.length > 0)
    .map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      photo: r.photo,
      avgYellow: r.seasonStats[0]?.avgYellowCards || 0,
      avgRed: r.seasonStats[0]?.avgRedCards || 0,
      matches: r.seasonStats[0]?.matchesOfficiated || 0,
      strictness: r.seasonStats[0]?.strictnessIndex || 0,
    }));
}

async function getTeams() {
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ status: 'FT' }, { status: 'Match Finished' }],
    },
    include: {
      stats: true,
      homeTeam: { include: { league: true } },
      awayTeam: { include: { league: true } },
    },
  });

  const teamStats: Record<number, {
    id: number;
    name: string;
    logo: string | null;
    league: string;
    homeYellow: number;
    homeRed: number;
    homeMatches: number;
    awayYellow: number;
    awayRed: number;
    awayMatches: number;
  }> = {};

  for (const match of matches) {
    if (!match.stats) continue;

    // Home team
    if (!teamStats[match.homeTeamId]) {
      teamStats[match.homeTeamId] = {
        id: match.homeTeam.id,
        name: match.homeTeam.name,
        logo: match.homeTeam.logo,
        league: match.homeTeam.league.name,
        homeYellow: 0, homeRed: 0, homeMatches: 0,
        awayYellow: 0, awayRed: 0, awayMatches: 0,
      };
    }
    teamStats[match.homeTeamId].homeYellow += match.stats.homeYellowCards;
    teamStats[match.homeTeamId].homeRed += match.stats.homeRedCards;
    teamStats[match.homeTeamId].homeMatches++;

    // Away team
    if (!teamStats[match.awayTeamId]) {
      teamStats[match.awayTeamId] = {
        id: match.awayTeam.id,
        name: match.awayTeam.name,
        logo: match.awayTeam.logo,
        league: match.awayTeam.league.name,
        homeYellow: 0, homeRed: 0, homeMatches: 0,
        awayYellow: 0, awayRed: 0, awayMatches: 0,
      };
    }
    teamStats[match.awayTeamId].awayYellow += match.stats.awayYellowCards;
    teamStats[match.awayTeamId].awayRed += match.stats.awayRedCards;
    teamStats[match.awayTeamId].awayMatches++;
  }

  return Object.values(teamStats).map(t => ({
    ...t,
    avgHomeYellow: t.homeMatches > 0 ? t.homeYellow / t.homeMatches : 0,
    avgHomeRed: t.homeMatches > 0 ? t.homeRed / t.homeMatches : 0,
    avgAwayYellow: t.awayMatches > 0 ? t.awayYellow / t.awayMatches : 0,
    avgAwayRed: t.awayMatches > 0 ? t.awayRed / t.awayMatches : 0,
  }));
}


export default async function CardCalculatorPage() {
  const [referees, teams] = await Promise.all([
    getReferees(),
    getTeams(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/tools" className="text-primary hover:underline text-sm mb-4 inline-block">
          ← Back to Tools
        </Link>
        <h1 className="text-3xl font-bold">Card Calculator</h1>
        <p className="text-muted-foreground mt-2">
          Calculate expected cards for any match based on referee tendencies and team discipline
        </p>
      </div>

      <CardCalculatorClient
        referees={referees}
        teams={teams}
        
      />
    </div>
  );
}
