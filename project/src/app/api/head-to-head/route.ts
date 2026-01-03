import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const teamId = searchParams.get('teamId');
  const refereeId = searchParams.get('refereeId');

  if (!teamId || !refereeId) {
    return NextResponse.json({ error: 'Missing teamId or refereeId' }, { status: 400 });
  }

  try {
    const team = await prisma.team.findUnique({
      where: { id: parseInt(teamId) },
      include: { league: true },
    });

    const referee = await prisma.referee.findUnique({
      where: { id: parseInt(refereeId) },
    });

    if (!team || !referee) {
      return NextResponse.json({ error: 'Team or referee not found' }, { status: 404 });
    }

    // Get all matches between this team and referee
    const matches = await prisma.match.findMany({
      where: {
        refereeId: parseInt(refereeId),
        OR: [
          { homeTeamId: parseInt(teamId) },
          { awayTeamId: parseInt(teamId) },
        ],
        status: { in: ['FT', 'Match Finished'] },
      },
      include: {
        stats: true,
        homeTeam: true,
        awayTeam: true,
        league: true,
      },
      orderBy: { date: 'desc' },
    });

    if (matches.length === 0) {
      return NextResponse.json({
        team: { id: team.id, name: team.name, logo: team.logo, league: team.league.name },
        referee: { id: referee.id, name: referee.name, slug: referee.slug, photo: referee.photo },
        matches: [],
        stats: null,
        comparison: null,
      });
    }

    // Calculate stats
    let totalYellow = 0;
    let totalRed = 0;
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    const matchDetails = matches.map(match => {
      const isHome = match.homeTeamId === team.id;
      const teamYellow = isHome ? match.stats?.homeYellowCards || 0 : match.stats?.awayYellowCards || 0;
      const teamRed = isHome ? match.stats?.homeRedCards || 0 : match.stats?.awayRedCards || 0;
      const teamGoals = isHome ? match.homeGoals || 0 : match.awayGoals || 0;
      const oppGoals = isHome ? match.awayGoals || 0 : match.homeGoals || 0;

      totalYellow += teamYellow;
      totalRed += teamRed;
      goalsFor += teamGoals;
      goalsAgainst += oppGoals;

      if (teamGoals > oppGoals) wins++;
      else if (teamGoals < oppGoals) losses++;
      else draws++;

      return {
        id: match.id,
        date: match.date.toISOString().split('T')[0],
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        homeGoals: match.homeGoals,
        awayGoals: match.awayGoals,
        isHome,
        teamYellow,
        teamRed,
        result: teamGoals > oppGoals ? 'W' : teamGoals < oppGoals ? 'L' : 'D',
        league: match.league.name,
      };
    });

    // Get team's overall stats with all referees for comparison
    const allTeamMatches = await prisma.match.findMany({
      where: {
        OR: [
          { homeTeamId: team.id },
          { awayTeamId: team.id },
        ],
        status: { in: ['FT', 'Match Finished'] },
      },
      include: { stats: true },
    });

    let overallYellow = 0;
    let overallMatches = 0;

    allTeamMatches.forEach(match => {
      if (!match.stats) return;
      const isHome = match.homeTeamId === team.id;
      overallYellow += isHome ? match.stats.homeYellowCards : match.stats.awayYellowCards;
      overallMatches++;
    });

    const avgYellowWithRef = matches.length > 0 ? totalYellow / matches.length : 0;
    const avgYellowOverall = overallMatches > 0 ? overallYellow / overallMatches : 0;

    return NextResponse.json({
      team: { id: team.id, name: team.name, logo: team.logo, league: team.league.name },
      referee: { id: referee.id, name: referee.name, slug: referee.slug, photo: referee.photo },
      matches: matchDetails,
      stats: {
        matchCount: matches.length,
        totalYellow,
        totalRed,
        avgYellow: avgYellowWithRef,
        avgRed: matches.length > 0 ? totalRed / matches.length : 0,
        wins,
        draws,
        losses,
        winRate: matches.length > 0 ? (wins / matches.length) * 100 : 0,
        goalsFor,
        goalsAgainst,
        goalDiff: goalsFor - goalsAgainst,
      },
      comparison: {
        avgYellowWithRef,
        avgYellowOverall,
        difference: avgYellowWithRef - avgYellowOverall,
        percentDiff: avgYellowOverall > 0
          ? ((avgYellowWithRef - avgYellowOverall) / avgYellowOverall) * 100
          : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching head-to-head data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
