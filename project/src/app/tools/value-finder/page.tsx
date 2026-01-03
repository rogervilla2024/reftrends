import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Link from 'next/link';
import ValueFinderClient from '@/components/ValueFinderClient';

export const metadata: Metadata = {
  title: 'Value Finder',
  description: 'Find value bets by comparing our card predictions with bookmaker odds. Calculate expected value and identify profitable betting opportunities.',
  openGraph: {
    title: 'Value Finder - RefStats',
    description: 'Find value bets by comparing predictions with bookmaker odds.',
    url: 'https://refstats.com/tools/value-finder',
  },
  alternates: {
    canonical: 'https://refstats.com/tools/value-finder',
  },
};

const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

async function getUpcomingMatches() {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const matches = await prisma.match.findMany({
    where: {
      date: { gte: now, lte: nextWeek },
      refereeId: { not: null },
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
      referee: {
        include: {
          seasonStats: {
            orderBy: { matchesOfficiated: 'desc' },
            take: 1,
          },
        },
      },
    },
    orderBy: { date: 'asc' },
    take: 20,
  });

  return matches.map(m => ({
    id: m.id,
    date: m.date.toISOString(),
    homeTeam: { id: m.homeTeam.id, name: m.homeTeam.name, logo: m.homeTeam.logo },
    awayTeam: { id: m.awayTeam.id, name: m.awayTeam.name, logo: m.awayTeam.logo },
    league: m.league.name,
    referee: m.referee ? {
      id: m.referee.id,
      name: m.referee.name,
      slug: m.referee.slug,
      avgYellow: m.referee.seasonStats[0]?.avgYellowCards || 0,
      avgRed: m.referee.seasonStats[0]?.avgRedCards || 0,
      matches: m.referee.seasonStats[0]?.matchesOfficiated || 0,
    } : null,
  }));
}

async function getTeamStats() {
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ status: 'FT' }, { status: 'Match Finished' }],
    },
    include: { stats: true },
  });

  const teamStats: Record<number, { yellow: number; matches: number }> = {};

  for (const match of matches) {
    if (!match.stats) continue;

    if (!teamStats[match.homeTeamId]) teamStats[match.homeTeamId] = { yellow: 0, matches: 0 };
    teamStats[match.homeTeamId].yellow += match.stats.homeYellowCards;
    teamStats[match.homeTeamId].matches++;

    if (!teamStats[match.awayTeamId]) teamStats[match.awayTeamId] = { yellow: 0, matches: 0 };
    teamStats[match.awayTeamId].yellow += match.stats.awayYellowCards;
    teamStats[match.awayTeamId].matches++;
  }

  return Object.fromEntries(
    Object.entries(teamStats).map(([id, s]) => [
      id,
      { avgYellow: s.matches > 0 ? s.yellow / s.matches : 1.5 },
    ])
  );
}

export default async function ValueFinderPage() {
  const [matches, teamStats] = await Promise.all([
    getUpcomingMatches(),
    getTeamStats(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/tools" className="text-primary hover:underline text-sm mb-4 inline-block">
          ← Back to Tools
        </Link>
        <h1 className="text-3xl font-bold">Value Finder</h1>
        <p className="text-muted-foreground mt-2">
          Compare our predictions with bookmaker odds to find value bets
        </p>
      </div>

      <ValueFinderClient matches={matches} teamStats={teamStats} />
    </div>
  );
}
