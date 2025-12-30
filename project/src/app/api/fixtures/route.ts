import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const refereeId = searchParams.get('refereeId');

    const where: Record<string, unknown> = {};

    if (leagueId) {
      where.leagueId = parseInt(leagueId);
    }

    if (refereeId) {
      where.refereeId = parseInt(refereeId);
    }

    const fixtures = await prisma.match.findMany({
      where,
      include: {
        league: true,
        homeTeam: true,
        awayTeam: true,
        referee: true,
        stats: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: 50,
    });

    return NextResponse.json(fixtures);
  } catch (error) {
    console.error('Error fetching fixtures:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fixtures' },
      { status: 500 }
    );
  }
}
