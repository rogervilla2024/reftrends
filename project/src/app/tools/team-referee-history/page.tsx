import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Link from 'next/link';
import TeamRefereeHistoryClient from '@/components/TeamRefereeHistoryClient';

export const metadata: Metadata = {
  title: 'Team vs Referee History',
  description: 'Analyze how teams perform with specific referees. View card statistics, win rates, and historical trends.',
  openGraph: {
    title: 'Team vs Referee History - RefStats',
    description: 'Analyze team performance with specific referees.',
    url: 'https://refstats.com/tools/team-referee-history',
  },
  alternates: {
    canonical: 'https://refstats.com/tools/team-referee-history',
  },
};

const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

async function getTeams() {
  const teams = await prisma.team.findMany({
    include: { league: true },
    orderBy: { name: 'asc' },
  });
  return teams.map(t => ({
    id: t.id,
    name: t.name,
    logo: t.logo,
    league: t.league.name,
  }));
}

async function getReferees() {
  const referees = await prisma.referee.findMany({
    orderBy: { name: 'asc' },
  });
  return referees.map(r => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    photo: r.photo,
  }));
}

async function getTeamRefereeHistory() {
  const matches = await prisma.match.findMany({
    where: {
      refereeId: { not: null },
      OR: [{ status: 'FT' }, { status: 'Match Finished' }],
    },
    include: {
      stats: true,
      homeTeam: true,
      awayTeam: true,
      referee: true,
      league: true,
    },
    orderBy: { date: 'desc' },
  });

  // Build team-referee history map
  const historyMap: Record<string, {
    teamId: number;
    teamName: string;
    refereeId: number;
    refereeName: string;
    refereeSlug: string;
    matches: number;
    wins: number;
    draws: number;
    losses: number;
    yellowCards: number;
    redCards: number;
    goalsFor: number;
    goalsAgainst: number;
    recentMatches: Array<{
      date: string;
      opponent: string;
      result: string;
      yellowCards: number;
      redCards: number;
      league: string;
    }>;
  }> = {};

  for (const match of matches) {
    if (!match.referee || !match.stats || match.homeGoals === null || match.awayGoals === null) continue;

    // Process home team
    const homeKey = `${match.homeTeamId}-${match.refereeId}`;
    if (!historyMap[homeKey]) {
      historyMap[homeKey] = {
        teamId: match.homeTeamId,
        teamName: match.homeTeam.name,
        refereeId: match.refereeId!,
        refereeName: match.referee.name,
        refereeSlug: match.referee.slug,
        matches: 0, wins: 0, draws: 0, losses: 0,
        yellowCards: 0, redCards: 0,
        goalsFor: 0, goalsAgainst: 0,
        recentMatches: [],
      };
    }
    const homeHistory = historyMap[homeKey];
    homeHistory.matches++;
    homeHistory.yellowCards += match.stats.homeYellowCards;
    homeHistory.redCards += match.stats.homeRedCards;
    homeHistory.goalsFor += match.homeGoals;
    homeHistory.goalsAgainst += match.awayGoals;
    if (match.homeGoals > match.awayGoals) homeHistory.wins++;
    else if (match.homeGoals < match.awayGoals) homeHistory.losses++;
    else homeHistory.draws++;
    if (homeHistory.recentMatches.length < 5) {
      homeHistory.recentMatches.push({
        date: match.date.toISOString().split('T')[0],
        opponent: match.awayTeam.name,
        result: `${match.homeGoals}-${match.awayGoals}`,
        yellowCards: match.stats.homeYellowCards,
        redCards: match.stats.homeRedCards,
        league: match.league.name,
      });
    }

    // Process away team
    const awayKey = `${match.awayTeamId}-${match.refereeId}`;
    if (!historyMap[awayKey]) {
      historyMap[awayKey] = {
        teamId: match.awayTeamId,
        teamName: match.awayTeam.name,
        refereeId: match.refereeId!,
        refereeName: match.referee.name,
        refereeSlug: match.referee.slug,
        matches: 0, wins: 0, draws: 0, losses: 0,
        yellowCards: 0, redCards: 0,
        goalsFor: 0, goalsAgainst: 0,
        recentMatches: [],
      };
    }
    const awayHistory = historyMap[awayKey];
    awayHistory.matches++;
    awayHistory.yellowCards += match.stats.awayYellowCards;
    awayHistory.redCards += match.stats.awayRedCards;
    awayHistory.goalsFor += match.awayGoals;
    awayHistory.goalsAgainst += match.homeGoals;
    if (match.awayGoals > match.homeGoals) awayHistory.wins++;
    else if (match.awayGoals < match.homeGoals) awayHistory.losses++;
    else awayHistory.draws++;
    if (awayHistory.recentMatches.length < 5) {
      awayHistory.recentMatches.push({
        date: match.date.toISOString().split('T')[0],
        opponent: match.homeTeam.name,
        result: `${match.awayGoals}-${match.homeGoals}`,
        yellowCards: match.stats.awayYellowCards,
        redCards: match.stats.awayRedCards,
        league: match.league.name,
      });
    }
  }

  return Object.values(historyMap);
}

export default async function TeamRefereeHistoryPage() {
  const [teams, referees, history] = await Promise.all([
    getTeams(),
    getReferees(),
    getTeamRefereeHistory(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/tools" className="text-primary hover:underline text-sm mb-4 inline-block">
          ← Back to Tools
        </Link>
        <h1 className="text-3xl font-bold">Team vs Referee History</h1>
        <p className="text-muted-foreground mt-2">
          Analyze how teams perform with specific referees - cards received, win rates, and recent matches
        </p>
      </div>

      <TeamRefereeHistoryClient teams={teams} referees={referees} history={history} />
    </div>
  );
}
