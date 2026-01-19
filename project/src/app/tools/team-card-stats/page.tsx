import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Link from 'next/link';
import TeamCardStatsClient from '@/components/TeamCardStatsClient';

export const metadata: Metadata = {
  title: 'Team Card Statistics',
  description: 'Analyze which teams receive the most cards and their disciplinary records with specific referees.',
  openGraph: {
    title: 'Team Card Statistics - RefTrends',
    description: 'Discover team disciplinary patterns with different referees.',
    url: 'https://reftrends.com/tools/team-card-stats',
  },
  alternates: {
    canonical: 'https://reftrends.com/tools/team-card-stats',
  },
};

const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

async function getTeamCardData() {
  const teams = await prisma.team.findMany({
    include: {
      league: true,
      homeMatches: {
        where: {
          OR: [{ status: 'FT' }, { status: 'Match Finished' }],
        },
        include: {
          stats: true,
          referee: true,
        },
      },
      awayMatches: {
        where: {
          OR: [{ status: 'FT' }, { status: 'Match Finished' }],
        },
        include: {
          stats: true,
          referee: true,
        },
      },
    },
  });

  return teams.map(team => {
    const homeMatches = team.homeMatches.filter(m => m.stats);
    const awayMatches = team.awayMatches.filter(m => m.stats);
    const totalMatches = homeMatches.length + awayMatches.length;

    const homeYellow = homeMatches.reduce((sum, m) => sum + (m.stats?.homeYellowCards || 0), 0);
    const awayYellow = awayMatches.reduce((sum, m) => sum + (m.stats?.awayYellowCards || 0), 0);
    const homeRed = homeMatches.reduce((sum, m) => sum + (m.stats?.homeRedCards || 0), 0);
    const awayRed = awayMatches.reduce((sum, m) => sum + (m.stats?.awayRedCards || 0), 0);

    const totalYellow = homeYellow + awayYellow;
    const totalRed = homeRed + awayRed;

    // Group matches by referee
    const refereeStats: Record<number, {
      name: string;
      slug: string;
      matches: number;
      yellow: number;
      red: number;
    }> = {};

    [...homeMatches, ...awayMatches].forEach(match => {
      if (!match.referee || !match.stats) return;

      const isHome = homeMatches.includes(match);
      const yellow = isHome ? match.stats.homeYellowCards : match.stats.awayYellowCards;
      const red = isHome ? match.stats.homeRedCards : match.stats.awayRedCards;

      if (!refereeStats[match.referee.id]) {
        refereeStats[match.referee.id] = {
          name: match.referee.name,
          slug: match.referee.slug,
          matches: 0,
          yellow: 0,
          red: 0,
        };
      }

      refereeStats[match.referee.id].matches++;
      refereeStats[match.referee.id].yellow += yellow;
      refereeStats[match.referee.id].red += red;
    });

    // Find toughest referee (most cards per match)
    const refereeList = Object.entries(refereeStats)
      .map(([id, stats]) => ({
        id: parseInt(id),
        ...stats,
        avgCards: stats.matches > 0 ? (stats.yellow + stats.red) / stats.matches : 0,
      }))
      .filter(r => r.matches >= 2)
      .sort((a, b) => b.avgCards - a.avgCards);

    return {
      id: team.id,
      name: team.name,
      logo: team.logo,
      league: team.league.name,
      totalMatches,
      totalYellow,
      totalRed,
      avgYellowPerMatch: totalMatches > 0 ? totalYellow / totalMatches : 0,
      avgRedPerMatch: totalMatches > 0 ? totalRed / totalMatches : 0,
      homeYellow,
      awayYellow,
      homeRed,
      awayRed,
      toughestReferee: refereeList[0] || null,
      easiestReferee: refereeList.length > 1 ? refereeList[refereeList.length - 1] : null,
      refereeBreakdown: refereeList.slice(0, 5),
    };
  })
  .filter(t => t.totalMatches >= 3)
  .sort((a, b) => b.avgYellowPerMatch - a.avgYellowPerMatch);
}


export default async function TeamCardStatsPage() {
  const teams = await getTeamCardData();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/tools" className="text-primary hover:underline text-sm mb-4 inline-block">
          &larr; Back to Tools
        </Link>
        <h1 className="text-3xl font-bold">Team Card Statistics</h1>
        <p className="text-muted-foreground mt-2">
          Analyze team disciplinary records and referee relationships
        </p>
      </div>

      <TeamCardStatsClient teams={teams} />
    </div>
  );
}
