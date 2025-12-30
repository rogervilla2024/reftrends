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

export async function GET() {
  try {
    // Get referees with the most matches and highest strictness for "featured" status
    const refereeStats = await prisma.refereeSeasonStats.findMany({
      where: {
        matchesOfficiated: {
          gte: 5, // Only referees with at least 5 matches
        },
      },
      include: {
        referee: true,
      },
      orderBy: [
        { matchesOfficiated: 'desc' },
        { strictnessIndex: 'desc' },
      ],
      take: 20, // Get top 20 to have variety
    });

    // Group by referee and take unique referees
    const seenRefereeIds = new Set<number>();
    const featuredReferees = [];

    for (const stat of refereeStats) {
      if (seenRefereeIds.has(stat.referee.id)) continue;
      seenRefereeIds.add(stat.referee.id);

      featuredReferees.push({
        id: stat.referee.id,
        name: stat.referee.name,
        slug: stat.referee.slug,
        nationality: stat.referee.nationality,
        photo: stat.referee.photo,
        stats: {
          matchesOfficiated: stat.matchesOfficiated,
          avgYellowCards: stat.avgYellowCards,
          avgRedCards: stat.avgRedCards,
          strictnessIndex: stat.strictnessIndex,
          league: LEAGUE_NAMES[stat.leagueApiId] || `League ${stat.leagueApiId}`,
        },
      });

      if (featuredReferees.length >= 8) break; // Max 8 featured referees
    }

    // If no referees with stats, get some referees without stats
    if (featuredReferees.length === 0) {
      const referees = await prisma.referee.findMany({
        take: 8,
        orderBy: { name: 'asc' },
      });

      for (const referee of referees) {
        featuredReferees.push({
          id: referee.id,
          name: referee.name,
          slug: referee.slug,
          nationality: referee.nationality,
          photo: referee.photo,
          stats: null,
        });
      }
    }

    return NextResponse.json({ referees: featuredReferees });
  } catch (error) {
    console.error('Error fetching featured referees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured referees' },
      { status: 500 }
    );
  }
}
