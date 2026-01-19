import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentSeason } from '@/lib/season';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const currentSeason = getCurrentSeason();

    // Get today's fixtures with referee data
    const matches = await prisma.match.findMany({
      where: {
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
        status: {
          in: ['NS', 'TBD', 'Not Started', 'Scheduled'],
        },
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true,
        referee: {
          include: {
            seasonStats: {
              where: {
                season: currentSeason,
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
      take: 20,
    });

    // Transform data for the component
    const fixtures = matches.map((match) => {
      const stats = match.referee?.seasonStats[0];
      return {
        id: match.id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        homeTeamLogo: match.homeTeam.logo,
        awayTeamLogo: match.awayTeam.logo,
        kickoff: match.date.toISOString(),
        league: match.league.name,
        leagueLogo: match.league.logo,
        referee: match.referee && stats
          ? {
              name: match.referee.name,
              slug: match.referee.slug,
              avgYellowCards: stats.avgYellowCards,
              avgRedCards: stats.avgRedCards,
              matchesOfficiated: stats.matchesOfficiated,
              strictnessIndex: stats.strictnessIndex,
            }
          : undefined,
      };
    });

    // If no today's fixtures, get upcoming fixtures
    if (fixtures.length === 0) {
      const upcomingMatches = await prisma.match.findMany({
        where: {
          date: {
            gte: today,
          },
          status: {
            in: ['NS', 'TBD', 'Not Started', 'Scheduled'],
          },
        },
        include: {
          homeTeam: true,
          awayTeam: true,
          league: true,
          referee: {
            include: {
              seasonStats: {
                where: {
                  season: currentSeason,
                },
                take: 1,
              },
            },
          },
        },
        orderBy: {
          date: 'asc',
        },
        take: 10,
      });

      const upcomingFixtures = upcomingMatches.map((match) => {
        const stats = match.referee?.seasonStats[0];
        return {
          id: match.id,
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          homeTeamLogo: match.homeTeam.logo,
          awayTeamLogo: match.awayTeam.logo,
          kickoff: match.date.toISOString(),
          league: match.league.name,
          leagueLogo: match.league.logo,
          referee: match.referee && stats
            ? {
                name: match.referee.name,
                slug: match.referee.slug,
                avgYellowCards: stats.avgYellowCards,
                avgRedCards: stats.avgRedCards,
                matchesOfficiated: stats.matchesOfficiated,
                strictnessIndex: stats.strictnessIndex,
              }
            : undefined,
        };
      });

      return NextResponse.json({
        fixtures: upcomingFixtures,
        isUpcoming: true,
      });
    }

    return NextResponse.json({
      fixtures,
      isUpcoming: false,
    });
  } catch (error) {
    console.error('Error fetching value bets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch value bets', fixtures: [] },
      { status: 500 }
    );
  }
}
