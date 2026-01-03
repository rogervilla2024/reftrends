import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

const LEAGUE_NAMES: Record<number, string> = {
  39: 'Premier League',
  140: 'La Liga',
  135: 'Serie A',
  78: 'Bundesliga',
  61: 'Ligue 1',
};

// Get recent form for a referee (last 5 matches)
async function getRefereeRecentForm(refereeId: number) {
  const matches = await prisma.match.findMany({
    where: {
      refereeId,
      OR: [{ status: 'FT' }, { status: 'Match Finished' }],
    },
    include: {
      stats: true,
      homeTeam: true,
      awayTeam: true,
    },
    orderBy: { date: 'desc' },
    take: 5,
  });

  return matches.map(m => ({
    yellowCards: m.stats?.yellowCards || 0,
    redCards: m.stats?.redCards || 0,
    date: m.date.toISOString().split('T')[0],
    teams: `${m.homeTeam.name} vs ${m.awayTeam.name}`,
  }));
}

export async function GET() {
  try {
    // Get all referee stats with at least 3 matches
    const allStats = await prisma.refereeSeasonStats.findMany({
      where: {
        matchesOfficiated: {
          gte: 3,
        },
      },
      include: {
        referee: true,
      },
    });

    // Helper to map stats to response format
    const mapToResponse = async (stat: typeof allStats[0]) => {
      const recentForm = await getRefereeRecentForm(stat.referee.id);
      return {
        id: stat.referee.id,
        name: stat.referee.name,
        slug: stat.referee.slug,
        photo: stat.referee.photo,
        league: LEAGUE_NAMES[stat.leagueApiId] || `League ${stat.leagueApiId}`,
        matchesOfficiated: stat.matchesOfficiated,
        totalYellowCards: stat.totalYellowCards,
        totalRedCards: stat.totalRedCards,
        avgYellowCards: stat.avgYellowCards,
        avgRedCards: stat.avgRedCards,
        strictnessIndex: stat.strictnessIndex,
        recentForm,
      };
    };

    // Group by referee (take the one with most matches per referee)
    const refereeMap = new Map<number, typeof allStats[0]>();
    for (const stat of allStats) {
      const existing = refereeMap.get(stat.referee.id);
      if (!existing || stat.matchesOfficiated > existing.matchesOfficiated) {
        refereeMap.set(stat.referee.id, stat);
      }
    }

    const uniqueStats = Array.from(refereeMap.values());

    // Sort by total cards (yellow + red)
    const mostCards = await Promise.all(
      [...uniqueStats]
        .sort((a, b) => (b.totalYellowCards + b.totalRedCards) - (a.totalYellowCards + a.totalRedCards))
        .slice(0, 5)
        .map(mapToResponse)
    );

    // Sort by strictness index
    const strictest = await Promise.all(
      [...uniqueStats]
        .sort((a, b) => b.strictnessIndex - a.strictnessIndex)
        .slice(0, 5)
        .map(mapToResponse)
    );

    // Sort by matches officiated
    const mostMatches = await Promise.all(
      [...uniqueStats]
        .sort((a, b) => b.matchesOfficiated - a.matchesOfficiated)
        .slice(0, 5)
        .map(mapToResponse)
    );

    return NextResponse.json({
      mostCards,
      strictest,
      mostMatches,
    });
  } catch (error) {
    console.error('Error fetching top referee stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top referee stats' },
      { status: 500 }
    );
  }
}
