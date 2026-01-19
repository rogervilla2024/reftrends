import { Metadata } from 'next';
import Link from 'next/link';
import BettingTipsClient from '@/components/BettingTipsClient';
import prisma from '@/lib/db';

export const metadata: Metadata = {
  title: 'Betting Tips | RefTrends',
  description: 'Get data-driven betting tips based on referee tendencies, team discipline, and historical patterns. Find value bets for card markets.',
  openGraph: {
    title: 'Betting Tips - RefTrends',
    description: 'Data-driven betting tips based on referee and team statistics.',
    url: 'https://reftrends.com/tools/betting-tips',
  },
  alternates: {
    canonical: 'https://reftrends.com/tools/betting-tips',
  },
};

interface RefereeWithStats {
  id: number;
  name: string;
  slug: string;
  photo: string | null;
  nationality: string | null;
  avgYellow: number;
  avgRed: number;
  avgPenalties: number;
  matches: number;
  strictness: number;
  homeBias: number;
  leagueName: string;
}

interface TeamStats {
  id: number;
  name: string;
  logo: string | null;
  leagueId: number;
  leagueName: string;
  totalMatches: number;
  avgYellowReceived: number;
  avgRedReceived: number;
  avgFoulsCommitted: number;
}

async function getRefereesWithStats(): Promise<RefereeWithStats[]> {
  const [referees, leagues] = await Promise.all([
    prisma.referee.findMany({
      include: {
        seasonStats: {
          orderBy: { season: 'desc' },
          take: 1,
        },
      },
    }),
    prisma.league.findMany(),
  ]);

  const leagueMap = new Map(leagues.map(l => [l.apiId, l.name]));

  return referees
    .filter(r => r.seasonStats.length > 0 && r.seasonStats[0].matchesOfficiated >= 5)
    .map(r => {
      const stats = r.seasonStats[0];
      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        photo: r.photo,
        nationality: r.nationality,
        avgYellow: stats.avgYellowCards,
        avgRed: stats.avgRedCards,
        avgPenalties: stats.avgPenalties,
        matches: stats.matchesOfficiated,
        strictness: stats.strictnessIndex,
        homeBias: stats.homeBiasScore,
        leagueName: leagueMap.get(stats.leagueApiId) || 'Unknown',
      };
    })
    .sort((a, b) => b.strictness - a.strictness);
}

async function getTeamStats(): Promise<TeamStats[]> {
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

  const teamData: Record<number, {
    id: number;
    name: string;
    logo: string | null;
    leagueId: number;
    leagueName: string;
    matches: number;
    yellowReceived: number;
    redReceived: number;
    foulsCommitted: number;
  }> = {};

  for (const match of matches) {
    if (!match.stats) continue;

    // Home team
    if (!teamData[match.homeTeamId]) {
      teamData[match.homeTeamId] = {
        id: match.homeTeam.id,
        name: match.homeTeam.name,
        logo: match.homeTeam.logo,
        leagueId: match.homeTeam.leagueId,
        leagueName: match.homeTeam.league.name,
        matches: 0,
        yellowReceived: 0,
        redReceived: 0,
        foulsCommitted: 0,
      };
    }
    teamData[match.homeTeamId].matches++;
    teamData[match.homeTeamId].yellowReceived += match.stats.homeYellowCards;
    teamData[match.homeTeamId].redReceived += match.stats.homeRedCards;
    teamData[match.homeTeamId].foulsCommitted += Math.floor(match.stats.fouls / 2);

    // Away team
    if (!teamData[match.awayTeamId]) {
      teamData[match.awayTeamId] = {
        id: match.awayTeam.id,
        name: match.awayTeam.name,
        logo: match.awayTeam.logo,
        leagueId: match.awayTeam.leagueId,
        leagueName: match.awayTeam.league.name,
        matches: 0,
        yellowReceived: 0,
        redReceived: 0,
        foulsCommitted: 0,
      };
    }
    teamData[match.awayTeamId].matches++;
    teamData[match.awayTeamId].yellowReceived += match.stats.awayYellowCards;
    teamData[match.awayTeamId].redReceived += match.stats.awayRedCards;
    teamData[match.awayTeamId].foulsCommitted += Math.floor(match.stats.fouls / 2);
  }

  return Object.values(teamData)
    .filter(t => t.matches >= 3)
    .map(t => ({
      id: t.id,
      name: t.name,
      logo: t.logo,
      leagueId: t.leagueId,
      leagueName: t.leagueName,
      totalMatches: t.matches,
      avgYellowReceived: t.yellowReceived / t.matches,
      avgRedReceived: t.redReceived / t.matches,
      avgFoulsCommitted: t.foulsCommitted / t.matches,
    }))
    .sort((a, b) => b.avgYellowReceived - a.avgYellowReceived);
}

async function getLeagues() {
  return prisma.league.findMany({
    orderBy: { name: 'asc' },
  });
}

export default async function BettingTipsPage() {
  const [referees, teams, leagues] = await Promise.all([
    getRefereesWithStats(),
    getTeamStats(),
    getLeagues(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/tools" className="text-primary hover:underline text-sm mb-4 inline-block">
          ← Back to Tools
        </Link>
        <h1 className="text-3xl font-bold">Betting Tips</h1>
        <p className="text-muted-foreground mt-2">
          Data-driven betting insights based on referee tendencies and team discipline patterns
        </p>
      </div>

      <BettingTipsClient
        referees={referees}
        teams={teams}
        leagues={leagues}
      />
    </div>
  );
}
