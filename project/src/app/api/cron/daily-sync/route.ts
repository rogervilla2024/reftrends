/**
 * Vercel Cron Job: Daily Sync
 *
 * Zamanlama: Her gun 06:00 UTC
 * vercel.json'da tanimli: "0 6 * * *"
 *
 * Guvenlik: CRON_SECRET environment variable ile korunur
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

const API_KEY = process.env.API_FOOTBALL_KEY || '';
const CRON_SECRET = process.env.CRON_SECRET || '';
const BASE_URL = 'https://v3.football.api-sports.io';

const LEAGUES = [
  { apiId: 39, name: 'Premier League', country: 'England' },
  { apiId: 140, name: 'La Liga', country: 'Spain' },
  { apiId: 135, name: 'Serie A', country: 'Italy' },
  { apiId: 78, name: 'Bundesliga', country: 'Germany' },
  { apiId: 61, name: 'Ligue 1', country: 'France' },
];

interface FixtureResponse {
  response: {
    fixture: {
      id: number;
      referee: string | null;
      date: string;
      venue: { name: string | null; city: string | null };
      status: { long: string; short: string };
    };
    league: { id: number; name: string; season: number };
    teams: {
      home: { id: number; name: string; logo: string };
      away: { id: number; name: string; logo: string };
    };
    goals: { home: number | null; away: number | null };
  }[];
}

interface FixtureEventsResponse {
  response: {
    time: { elapsed: number };
    team: { id: number; name: string };
    player: { id: number; name: string };
    type: string;
    detail: string;
  }[];
}

interface SyncResult {
  success: boolean;
  leaguesProcessed: number;
  fixturesUpdated: number;
  errors: string[];
  duration: number;
}

async function apiRequest<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    headers: { 'x-apisports-key': API_KEY },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();
  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(`API errors: ${JSON.stringify(data.errors)}`);
  }

  return data;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function syncLeague(
  leagueInfo: (typeof LEAGUES)[0],
  season: number
): Promise<number> {
  const league = await prisma.league.upsert({
    where: { apiId: leagueInfo.apiId },
    update: { name: leagueInfo.name, country: leagueInfo.country, season },
    create: {
      apiId: leagueInfo.apiId,
      name: leagueInfo.name,
      country: leagueInfo.country,
      season,
    },
  });

  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const fixturesData = await apiRequest<FixtureResponse>('/fixtures', {
    league: leagueInfo.apiId.toString(),
    season: season.toString(),
    from: sevenDaysAgo.toISOString().split('T')[0],
    to: today.toISOString().split('T')[0],
  });

  let fixturesUpdated = 0;

  for (const fixture of fixturesData.response) {
    // Upsert teams
    const homeTeam = await prisma.team.upsert({
      where: { apiId: fixture.teams.home.id },
      update: { name: fixture.teams.home.name, logo: fixture.teams.home.logo },
      create: {
        apiId: fixture.teams.home.id,
        name: fixture.teams.home.name,
        logo: fixture.teams.home.logo,
        leagueId: league.id,
      },
    });

    const awayTeam = await prisma.team.upsert({
      where: { apiId: fixture.teams.away.id },
      update: { name: fixture.teams.away.name, logo: fixture.teams.away.logo },
      create: {
        apiId: fixture.teams.away.id,
        name: fixture.teams.away.name,
        logo: fixture.teams.away.logo,
        leagueId: league.id,
      },
    });

    // Handle referee
    let refereeId: number | null = null;
    if (fixture.fixture.referee) {
      const refName = fixture.fixture.referee.split(',')[0].trim();
      const slug = generateSlug(refName);
      const referee = await prisma.referee.upsert({
        where: { slug },
        update: { name: refName },
        create: {
          apiId: Math.abs(
            refName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) *
              1000
          ),
          name: refName,
          slug,
        },
      });
      refereeId = referee.id;
    }

    // Upsert match
    const match = await prisma.match.upsert({
      where: { apiId: fixture.fixture.id },
      update: {
        date: new Date(fixture.fixture.date),
        venue: fixture.fixture.venue.name,
        status: fixture.fixture.status.short,
        homeGoals: fixture.goals.home,
        awayGoals: fixture.goals.away,
        refereeId,
      },
      create: {
        apiId: fixture.fixture.id,
        date: new Date(fixture.fixture.date),
        venue: fixture.fixture.venue.name,
        status: fixture.fixture.status.short,
        homeGoals: fixture.goals.home,
        awayGoals: fixture.goals.away,
        leagueId: league.id,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        refereeId,
        season,
      },
    });

    // Fetch events for completed matches
    if (
      fixture.fixture.status.short === 'FT' ||
      fixture.fixture.status.long === 'Match Finished'
    ) {
      const existingStats = await prisma.matchStats.findUnique({
        where: { matchId: match.id },
      });

      if (!existingStats) {
        try {
          const eventsData = await apiRequest<FixtureEventsResponse>(
            '/fixtures/events',
            { fixture: fixture.fixture.id.toString() }
          );

          let homeYellow = 0,
            awayYellow = 0,
            homeRed = 0,
            awayRed = 0,
            penalties = 0,
            homePenalties = 0,
            awayPenalties = 0;

          for (const event of eventsData.response) {
            if (event.type === 'Card') {
              if (event.detail === 'Yellow Card') {
                if (event.team.id === fixture.teams.home.id) homeYellow++;
                else awayYellow++;
              } else if (
                event.detail === 'Red Card' ||
                event.detail === 'Second Yellow card'
              ) {
                if (event.team.id === fixture.teams.home.id) homeRed++;
                else awayRed++;
              }
            }
            // Count penalties
            if (event.detail === 'Penalty' || event.detail === 'Missed Penalty') {
              penalties++;
              if (event.team.id === fixture.teams.home.id) homePenalties++;
              else awayPenalties++;
            }
          }

          await prisma.matchStats.create({
            data: {
              matchId: match.id,
              yellowCards: homeYellow + awayYellow,
              redCards: homeRed + awayRed,
              homeYellowCards: homeYellow,
              awayYellowCards: awayYellow,
              homeRedCards: homeRed,
              awayRedCards: awayRed,
              penalties,
              homePenalties,
              awayPenalties,
            },
          });
        } catch {
          // Event fetch failed, continue
        }
      }
    }

    fixturesUpdated++;
  }

  return fixturesUpdated;
}

async function updateRefereeStats(season: number): Promise<void> {
  const referees = await prisma.referee.findMany();

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
      const totalPenalties = withStats.reduce(
        (sum, m) => sum + (m.stats?.penalties || 0),
        0
      );
      const matchCount = leagueMatches.length;

      const avgYellow = matchCount > 0 ? totalYellow / matchCount : 0;
      const avgRed = matchCount > 0 ? totalRed / matchCount : 0;
      const avgPenalties = matchCount > 0 ? totalPenalties / matchCount : 0;
      const strictnessIndex = avgYellow + avgRed * 3 + avgPenalties * 0.5;

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
          totalPenalties,
          avgPenalties,
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
          totalPenalties,
          avgPenalties,
          strictnessIndex,
          homeBiasScore,
        },
      });
    }
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const result: SyncResult = {
    success: false,
    leaguesProcessed: 0,
    fixturesUpdated: 0,
    errors: [],
    duration: 0,
  };

  // Verify cron secret (Vercel passes this automatically)
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!API_KEY) {
    return NextResponse.json(
      { error: 'API_FOOTBALL_KEY not configured' },
      { status: 500 }
    );
  }

  try {
    const currentSeason = 2025;

    for (const league of LEAGUES) {
      try {
        const fixtures = await syncLeague(league, currentSeason);
        result.fixturesUpdated += fixtures;
        result.leaguesProcessed++;
        // Small delay between leagues
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        result.errors.push(
          `${league.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    await updateRefereeStats(currentSeason);

    result.success = result.errors.length === 0;
    result.duration = Date.now() - startTime;

    return NextResponse.json(result);
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    result.duration = Date.now() - startTime;
    return NextResponse.json(result, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
