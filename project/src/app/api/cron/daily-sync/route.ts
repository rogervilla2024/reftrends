import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSeasonForApi } from '@/lib/season';

const API_KEY = process.env.API_FOOTBALL_KEY || '';
const BASE_URL = 'https://v3.football.api-sports.io';

// All league IDs we want to sync
const LEAGUE_IDS = [
  // Top 5 European Leagues
  39,   // Premier League
  140,  // La Liga
  135,  // Serie A
  78,   // Bundesliga
  61,   // Ligue 1
  // Additional European Leagues
  94,   // Primeira Liga (Portugal)
  88,   // Eredivisie (Netherlands)
  144,  // Belgian Pro League
  203,  // Super Lig (Turkey)
  119,  // Superliga (Denmark)
  // UEFA Competitions
  2,    // UEFA Champions League
  3,    // UEFA Europa League
  848,  // UEFA Conference League
  4,    // Euro Championship
  // FIFA Competitions
  1,    // World Cup
  15,   // FIFA Club World Cup
];

interface Fixture {
  fixture: {
    id: number;
    referee: string | null;
    date: string;
    venue: { name: string; city: string };
    status: { long: string; short: string };
  };
  league: { id: number; name: string; season: number };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
  };
}

async function fetchFixtures(leagueId: number, season: number): Promise<Fixture[]> {
  const url = `${BASE_URL}/fixtures?league=${leagueId}&season=${season}`;

  const response = await fetch(url, {
    headers: { 'x-apisports-key': API_KEY },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.response || [];
}

async function syncLeagueFixtures(leagueId: number, season: number): Promise<{ synced: number; errors: number }> {
  let synced = 0;
  let errors = 0;

  try {
    const fixtures = await fetchFixtures(leagueId, season);

    for (const fixture of fixtures) {
      try {
        // Ensure league exists
        await prisma.league.upsert({
          where: { apiId: leagueId },
          update: {},
          create: {
            apiId: leagueId,
            name: fixture.league.name,
            country: '',
            logo: null,
            season: fixture.league.season + 1, // Convert to our season format
          },
        });

        const league = await prisma.league.findUnique({
          where: { apiId: leagueId },
        });

        if (!league) continue;

        // Get or create teams with league reference
        const [homeTeam, awayTeam] = await Promise.all([
          prisma.team.upsert({
            where: { apiId: fixture.teams.home.id },
            update: { logo: fixture.teams.home.logo },
            create: {
              apiId: fixture.teams.home.id,
              name: fixture.teams.home.name,
              logo: fixture.teams.home.logo,
              leagueId: league.id,
            },
          }),
          prisma.team.upsert({
            where: { apiId: fixture.teams.away.id },
            update: { logo: fixture.teams.away.logo },
            create: {
              apiId: fixture.teams.away.id,
              name: fixture.teams.away.name,
              logo: fixture.teams.away.logo,
              leagueId: league.id,
            },
          }),
        ]);

        // Handle referee
        let refereeId: number | null = null;
        if (fixture.fixture.referee) {
          const refereeName = fixture.fixture.referee.split(',')[0].trim();
          const slug = refereeName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          // Generate a unique apiId from the name for referees from API
          const apiId = Math.abs(refereeName.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0));

          const referee = await prisma.referee.upsert({
            where: { slug },
            update: {},
            create: {
              apiId,
              name: refereeName,
              slug,
              nationality: null,
              photo: null,
            },
          });
          refereeId = referee.id;
        }

        // Upsert match
        await prisma.match.upsert({
          where: { apiId: fixture.fixture.id },
          update: {
            status: fixture.fixture.status.short,
            homeGoals: fixture.goals.home,
            awayGoals: fixture.goals.away,
            refereeId,
          },
          create: {
            apiId: fixture.fixture.id,
            date: new Date(fixture.fixture.date),
            venue: fixture.fixture.venue?.name || null,
            status: fixture.fixture.status.short,
            homeGoals: fixture.goals.home,
            awayGoals: fixture.goals.away,
            season: fixture.league.season + 1,
            leagueId: league.id,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            refereeId,
          },
        });

        synced++;
      } catch (err) {
        errors++;
        console.error(`Error syncing fixture ${fixture.fixture.id}:`, err);
      }
    }
  } catch (err) {
    console.error(`Error fetching fixtures for league ${leagueId}:`, err);
    errors++;
  }

  return { synced, errors };
}

export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const season = getSeasonForApi();
  const results: Record<number, { synced: number; errors: number }> = {};

  console.log(`Starting daily sync for season ${season}...`);

  for (const leagueId of LEAGUE_IDS) {
    // Add delay between API calls to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = await syncLeagueFixtures(leagueId, season);
    results[leagueId] = result;
    console.log(`League ${leagueId}: synced ${result.synced}, errors ${result.errors}`);
  }

  const totalSynced = Object.values(results).reduce((sum, r) => sum + r.synced, 0);
  const totalErrors = Object.values(results).reduce((sum, r) => sum + r.errors, 0);

  return NextResponse.json({
    success: true,
    season,
    totalSynced,
    totalErrors,
    results,
    timestamp: new Date().toISOString(),
  });
}
