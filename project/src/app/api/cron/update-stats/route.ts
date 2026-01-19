/**
 * Vercel Cron Job: Update Stats
 *
 * Zamanlama: Her gun 23:00 UTC
 * vercel.json'da tanimli: "0 23 * * *"
 *
 * Bu endpoint sadece hakem istatistiklerini yeniden hesaplar.
 * API Football cagirmaz, mevcut veritabani verisini kullanir.
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
const CRON_SECRET = process.env.CRON_SECRET || '';

interface StatsResult {
  success: boolean;
  refereesUpdated: number;
  duration: number;
  error?: string;
}

async function updateRefereeStats(season: number): Promise<number> {
  const referees = await prisma.referee.findMany();
  let updated = 0;

  for (const referee of referees) {
    const matches = await prisma.match.findMany({
      where: {
        refereeId: referee.id,
        season,
        OR: [{ status: 'FT' }, { status: 'Match Finished' }],
      },
      include: { stats: true, league: true },
    });

    if (matches.length === 0) continue;

    const leagueGroups = new Map<number, typeof matches>();
    for (const match of matches) {
      const existing = leagueGroups.get(match.league.apiId) || [];
      existing.push(match);
      leagueGroups.set(match.league.apiId, existing);
    }

    for (const [leagueApiId, leagueMatches] of leagueGroups) {
      const withStats = leagueMatches.filter((m) => m.stats);
      const totalYellow = withStats.reduce(
        (sum, m) => sum + (m.stats?.yellowCards || 0),
        0
      );
      const totalRed = withStats.reduce(
        (sum, m) => sum + (m.stats?.redCards || 0),
        0
      );
      const matchCount = leagueMatches.length;

      const avgYellow = matchCount > 0 ? totalYellow / matchCount : 0;
      const avgRed = matchCount > 0 ? totalRed / matchCount : 0;
      const strictnessIndex = avgYellow + avgRed * 3;

      const homeYellow = withStats.reduce(
        (sum, m) => sum + (m.stats?.homeYellowCards || 0),
        0
      );
      const awayYellow = withStats.reduce(
        (sum, m) => sum + (m.stats?.awayYellowCards || 0),
        0
      );
      const homeBiasScore =
        matchCount > 0 ? (awayYellow - homeYellow) / matchCount : 0;

      await prisma.refereeSeasonStats.upsert({
        where: {
          refereeId_season_leagueApiId: {
            refereeId: referee.id,
            season,
            leagueApiId,
          },
        },
        update: {
          matchesOfficiated: matchCount,
          totalYellowCards: totalYellow,
          totalRedCards: totalRed,
          avgYellowCards: avgYellow,
          avgRedCards: avgRed,
          strictnessIndex,
          homeBiasScore,
        },
        create: {
          refereeId: referee.id,
          season,
          leagueApiId,
          matchesOfficiated: matchCount,
          totalYellowCards: totalYellow,
          totalRedCards: totalRed,
          avgYellowCards: avgYellow,
          avgRedCards: avgRed,
          strictnessIndex,
          homeBiasScore,
        },
      });
    }

    updated++;
  }

  return updated;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const result: StatsResult = {
    success: false,
    refereesUpdated: 0,
    duration: 0,
  };

  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const currentSeason = 2025;
    result.refereesUpdated = await updateRefereeStats(currentSeason);
    result.success = true;
    result.duration = Date.now() - startTime;

    return NextResponse.json(result);
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error';
    result.duration = Date.now() - startTime;
    return NextResponse.json(result, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const maxDuration = 30;
