import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Match Analyzer',
  description: 'Analyze upcoming football matches with referee impact predictions, card probabilities, over/under estimates, and team head-to-head statistics.',
  openGraph: {
    title: 'Match Analyzer - RefStats',
    description: 'Analyze matches with referee impact predictions and card probabilities.',
    url: 'https://refstats.com/tools/match-analyzer',
  },
  twitter: {
    title: 'Match Analyzer - RefStats',
    description: 'Analyze matches with referee impact predictions and card probabilities.',
  },
  alternates: {
    canonical: 'https://refstats.com/tools/match-analyzer',
  },
};

// Dynamic import for heavy client component
const MatchAnalyzerClient = dynamic(() => import('@/components/MatchAnalyzerClient'), {
  loading: () => <div className="h-96 flex items-center justify-center text-muted-foreground">Loading analyzer...</div>,
  ssr: false,
});

const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

interface UpcomingFixture {
  id: number;
  date: Date;
  homeTeam: { id: number; name: string; logo: string | null };
  awayTeam: { id: number; name: string; logo: string | null };
  league: { id: number; name: string; apiId: number };
  referee: {
    id: number;
    name: string;
    slug: string;
    photo: string | null;
  } | null;
}

async function getUpcomingFixtures(): Promise<UpcomingFixture[]> {
  try {
    const now = new Date();
    const fixtures = await prisma.match.findMany({
      where: {
        date: { gte: now },
        status: { not: 'FT' },
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true,
        referee: true,
      },
      orderBy: { date: 'asc' },
      take: 50,
    });

    return fixtures.map((f) => ({
      id: f.id,
      date: f.date,
      homeTeam: { id: f.homeTeam.id, name: f.homeTeam.name, logo: f.homeTeam.logo },
      awayTeam: { id: f.awayTeam.id, name: f.awayTeam.name, logo: f.awayTeam.logo },
      league: { id: f.league.id, name: f.league.name, apiId: f.league.apiId },
      referee: f.referee
        ? {
            id: f.referee.id,
            name: f.referee.name,
            slug: f.referee.slug,
            photo: f.referee.photo,
          }
        : null,
    }));
  } catch (error) {
    console.error('Error fetching upcoming fixtures:', error);
    return [];
  }
}

interface RefereeStats {
  avgYellowCards: number;
  avgRedCards: number;
  avgPenalties: number;
  strictnessIndex: number;
  matchesOfficiated: number;
}

async function getRefereeStats(): Promise<Map<number, RefereeStats>> {
  try {
    const stats = await prisma.refereeSeasonStats.findMany({
      orderBy: { season: 'desc' },
    });

    const refereeStatsMap = new Map<number, RefereeStats>();
    stats.forEach((stat) => {
      if (!refereeStatsMap.has(stat.refereeId)) {
        refereeStatsMap.set(stat.refereeId, {
          avgYellowCards: stat.avgYellowCards,
          avgRedCards: stat.avgRedCards,
          avgPenalties: stat.avgPenalties,
          strictnessIndex: stat.strictnessIndex,
          matchesOfficiated: stat.matchesOfficiated,
        });
      }
    });

    return refereeStatsMap;
  } catch (error) {
    console.error('Error fetching referee stats:', error);
    return new Map();
  }
}

interface TeamStats {
  teamId: number;
  avgYellowReceived: number;
  avgRedReceived: number;
  matchesPlayed: number;
}

async function getTeamStats(): Promise<Map<number, TeamStats>> {
  try {
    const matches = await prisma.match.findMany({
      where: {
        OR: [{ status: 'FT' }, { status: 'Match Finished' }],
      },
      include: {
        stats: true,
      },
    });

    const teamStatsMap = new Map<
      number,
      { yellowCards: number; redCards: number; matches: number }
    >();

    matches.forEach((match) => {
      if (!match.stats) return;

      // Home team
      const homeStats = teamStatsMap.get(match.homeTeamId) || {
        yellowCards: 0,
        redCards: 0,
        matches: 0,
      };
      homeStats.yellowCards += match.stats.homeYellowCards;
      homeStats.redCards += match.stats.homeRedCards;
      homeStats.matches++;
      teamStatsMap.set(match.homeTeamId, homeStats);

      // Away team
      const awayStats = teamStatsMap.get(match.awayTeamId) || {
        yellowCards: 0,
        redCards: 0,
        matches: 0,
      };
      awayStats.yellowCards += match.stats.awayYellowCards;
      awayStats.redCards += match.stats.awayRedCards;
      awayStats.matches++;
      teamStatsMap.set(match.awayTeamId, awayStats);
    });

    const result = new Map<number, TeamStats>();
    teamStatsMap.forEach((stats, teamId) => {
      result.set(teamId, {
        teamId,
        avgYellowReceived: stats.matches > 0 ? stats.yellowCards / stats.matches : 0,
        avgRedReceived: stats.matches > 0 ? stats.redCards / stats.matches : 0,
        matchesPlayed: stats.matches,
      });
    });

    return result;
  } catch (error) {
    console.error('Error fetching team stats:', error);
    return new Map();
  }
}

interface HeadToHead {
  refereeId: number;
  teamId: number;
  matches: number;
  yellowCards: number;
  redCards: number;
  wins: number;
  draws: number;
  losses: number;
}

async function getHeadToHeadStats(): Promise<Map<string, HeadToHead>> {
  try {
    const matches = await prisma.match.findMany({
      where: {
        refereeId: { not: null },
        OR: [{ status: 'FT' }, { status: 'Match Finished' }],
      },
      include: {
        stats: true,
      },
    });

    const h2hMap = new Map<string, HeadToHead>();

    matches.forEach((match) => {
      if (!match.refereeId || !match.stats || match.homeGoals === null || match.awayGoals === null) return;

      // Home team H2H
      const homeKey = `${match.refereeId}-${match.homeTeamId}`;
      const homeH2H = h2hMap.get(homeKey) || {
        refereeId: match.refereeId,
        teamId: match.homeTeamId,
        matches: 0,
        yellowCards: 0,
        redCards: 0,
        wins: 0,
        draws: 0,
        losses: 0,
      };
      homeH2H.matches++;
      homeH2H.yellowCards += match.stats.homeYellowCards;
      homeH2H.redCards += match.stats.homeRedCards;
      if (match.homeGoals > match.awayGoals) homeH2H.wins++;
      else if (match.homeGoals < match.awayGoals) homeH2H.losses++;
      else homeH2H.draws++;
      h2hMap.set(homeKey, homeH2H);

      // Away team H2H
      const awayKey = `${match.refereeId}-${match.awayTeamId}`;
      const awayH2H = h2hMap.get(awayKey) || {
        refereeId: match.refereeId,
        teamId: match.awayTeamId,
        matches: 0,
        yellowCards: 0,
        redCards: 0,
        wins: 0,
        draws: 0,
        losses: 0,
      };
      awayH2H.matches++;
      awayH2H.yellowCards += match.stats.awayYellowCards;
      awayH2H.redCards += match.stats.awayRedCards;
      if (match.awayGoals > match.homeGoals) awayH2H.wins++;
      else if (match.awayGoals < match.homeGoals) awayH2H.losses++;
      else awayH2H.draws++;
      h2hMap.set(awayKey, awayH2H);
    });

    return h2hMap;
  } catch (error) {
    console.error('Error fetching head-to-head stats:', error);
    return new Map();
  }
}

export default async function MatchAnalyzerPage() {
  const [fixtures, refereeStats, teamStats, h2hStats] = await Promise.all([
    getUpcomingFixtures(),
    getRefereeStats(),
    getTeamStats(),
    getHeadToHeadStats(),
  ]);

  // Convert Maps to serializable objects for client component
  const refereeStatsObj = Object.fromEntries(refereeStats);
  const teamStatsObj = Object.fromEntries(teamStats);
  const h2hStatsObj = Object.fromEntries(h2hStats);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/tools"
          className="text-primary hover:underline text-sm mb-4 inline-block"
        >
          ← Back to Tools
        </Link>
        <h1 className="text-3xl font-bold">Match Analyzer</h1>
        <p className="text-muted-foreground mt-2">
          Analyze upcoming matches with referee impact predictions, card probabilities,
          and team head-to-head statistics
        </p>
      </div>

      {fixtures.length > 0 ? (
        <MatchAnalyzerClient
          fixtures={fixtures.map((f) => ({
            ...f,
            date: f.date.toISOString(),
          }))}
          refereeStats={refereeStatsObj}
          teamStats={teamStatsObj}
          h2hStats={h2hStatsObj}
        />
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold mb-2">No Upcoming Fixtures</h3>
            <p className="text-muted-foreground">
              There are no upcoming fixtures with assigned referees at the moment.
              Check back later when fixtures are scheduled.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
