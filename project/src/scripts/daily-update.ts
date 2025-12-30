/**
 * Daily Update Script for RefStats
 *
 * This script fetches only today's and recent fixtures (last 3 days)
 * to update the database with new match results and statistics.
 *
 * Run this script daily via cron job or Windows Task Scheduler:
 * - Linux/Mac: 0 6 * * * cd /path/to/project && npx tsx src/scripts/daily-update.ts
 * - Windows: Use Task Scheduler to run at 6:00 AM daily
 */

import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');
const dbPath = path.join(projectRoot, 'dev.db');

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

const API_KEY = process.env.API_FOOTBALL_KEY || 'ea04c7309495164f85f3f5fdb5567896';
const BASE_URL = 'https://v3.football.api-sports.io';

// Rate limiting
const requestTimestamps: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 25;
let requestCount = 0;

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - 60000) {
    requestTimestamps.shift();
  }

  if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    const waitTime = requestTimestamps[0] + 60000 - now;
    console.log(`⏳ Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s...`);
    await new Promise(resolve => setTimeout(resolve, waitTime + 1000));
  }

  requestTimestamps.push(Date.now());
  requestCount++;
}

async function apiRequest<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  await waitForRateLimit();

  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  console.log(`📡 API Request #${requestCount}: ${endpoint}`, params || '');

  const response = await fetch(url.toString(), {
    headers: {
      'x-apisports-key': API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (data.errors && Object.keys(data.errors).length > 0) {
    console.error('API Errors:', data.errors);
    throw new Error(`API returned errors: ${JSON.stringify(data.errors)}`);
  }

  return data;
}

interface FixtureResponse {
  response: {
    fixture: {
      id: number;
      referee: string | null;
      date: string;
      venue: { name: string | null; city: string | null };
      status: { long: string; short: string };
    };
    league: {
      id: number;
      name: string;
      season: number;
    };
    teams: {
      home: { id: number; name: string; logo: string };
      away: { id: number; name: string; logo: string };
    };
    goals: {
      home: number | null;
      away: number | null;
    };
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

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const LEAGUES = [
  { apiId: 39, name: 'Premier League' },
  { apiId: 140, name: 'La Liga' },
  { apiId: 135, name: 'Serie A' },
  { apiId: 78, name: 'Bundesliga' },
  { apiId: 61, name: 'Ligue 1' },
];

async function fetchRecentFixtures(leagueApiId: number, fromDate: string, toDate: string): Promise<void> {
  const leagueInfo = LEAGUES.find(l => l.apiId === leagueApiId);
  if (!leagueInfo) return;

  console.log(`\n🏆 Updating ${leagueInfo.name} fixtures from ${fromDate} to ${toDate}...`);

  const league = await prisma.league.findUnique({ where: { apiId: leagueApiId } });
  if (!league) {
    console.log(`   League not found in database, skipping...`);
    return;
  }

  const fixturesData = await apiRequest<FixtureResponse>('/fixtures', {
    league: leagueApiId.toString(),
    from: fromDate,
    to: toDate,
  });

  console.log(`📅 Found ${fixturesData.response.length} fixtures in date range`);

  const allTeams = await prisma.team.findMany();
  const teamMap = new Map(allTeams.map(t => [t.apiId, t]));

  const allReferees = await prisma.referee.findMany();
  const refereeMap = new Map(allReferees.map(r => [r.name, r]));

  for (const fixture of fixturesData.response) {
    const homeTeam = teamMap.get(fixture.teams.home.id);
    const awayTeam = teamMap.get(fixture.teams.away.id);

    if (!homeTeam || !awayTeam) {
      console.log(`   Skipping fixture ${fixture.fixture.id}: team not found`);
      continue;
    }

    // Handle referee
    let referee = null;
    if (fixture.fixture.referee) {
      const refName = fixture.fixture.referee.split(',')[0].trim();
      referee = refereeMap.get(refName);

      if (!referee) {
        // Create new referee
        const slug = generateSlug(refName);
        referee = await prisma.referee.create({
          data: {
            apiId: Math.abs(refName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 1000 + Math.random() * 1000),
            name: refName,
            slug,
          },
        });
        refereeMap.set(refName, referee);
        console.log(`   Created new referee: ${refName}`);
      }
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
        refereeId: referee?.id,
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
        refereeId: referee?.id,
        season: fixture.league.season,
      },
    });

    // Fetch events for completed matches
    if (fixture.fixture.status.short === 'FT' || fixture.fixture.status.long === 'Match Finished') {
      try {
        const eventsData = await apiRequest<FixtureEventsResponse>('/fixtures/events', {
          fixture: fixture.fixture.id.toString(),
        });

        let homeYellow = 0, awayYellow = 0, homeRed = 0, awayRed = 0;

        for (const event of eventsData.response) {
          if (event.type === 'Card') {
            if (event.detail === 'Yellow Card') {
              if (event.team.id === fixture.teams.home.id) homeYellow++;
              else awayYellow++;
            } else if (event.detail === 'Red Card' || event.detail === 'Second Yellow card') {
              if (event.team.id === fixture.teams.home.id) homeRed++;
              else awayRed++;
            }
          }
        }

        await prisma.matchStats.upsert({
          where: { matchId: match.id },
          update: {
            yellowCards: homeYellow + awayYellow,
            redCards: homeRed + awayRed,
            homeYellowCards: homeYellow,
            awayYellowCards: awayYellow,
            homeRedCards: homeRed,
            awayRedCards: awayRed,
          },
          create: {
            matchId: match.id,
            yellowCards: homeYellow + awayYellow,
            redCards: homeRed + awayRed,
            homeYellowCards: homeYellow,
            awayYellowCards: awayYellow,
            homeRedCards: homeRed,
            awayRedCards: awayRed,
          },
        });

        console.log(`   ✅ Updated: ${homeTeam.name} vs ${awayTeam.name} (${homeYellow + awayYellow} yellow, ${homeRed + awayRed} red)`);
      } catch (error) {
        console.error(`   Error fetching events for fixture ${fixture.fixture.id}:`, error);
      }
    } else {
      console.log(`   📅 Scheduled: ${homeTeam.name} vs ${awayTeam.name} (${fixture.fixture.status.short})`);
    }
  }
}

async function updateRefereeStats(): Promise<void> {
  console.log('\n📈 Updating referee statistics...');

  const referees = await prisma.referee.findMany();
  const currentSeason = 2025;

  for (const referee of referees) {
    const matches = await prisma.match.findMany({
      where: {
        refereeId: referee.id,
        season: currentSeason,
        OR: [{ status: 'FT' }, { status: 'Match Finished' }],
      },
      include: {
        stats: true,
        league: true,
      },
    });

    if (matches.length === 0) continue;

    // Group by league
    const leagueGroups = new Map<number, typeof matches>();
    for (const match of matches) {
      const existing = leagueGroups.get(match.league.apiId) || [];
      existing.push(match);
      leagueGroups.set(match.league.apiId, existing);
    }

    for (const [leagueApiId, leagueMatches] of leagueGroups) {
      const matchesWithStats = leagueMatches.filter(m => m.stats);
      const totalYellow = matchesWithStats.reduce((sum, m) => sum + (m.stats?.yellowCards || 0), 0);
      const totalRed = matchesWithStats.reduce((sum, m) => sum + (m.stats?.redCards || 0), 0);
      const matchCount = leagueMatches.length;

      const avgYellow = matchCount > 0 ? totalYellow / matchCount : 0;
      const avgRed = matchCount > 0 ? totalRed / matchCount : 0;
      const strictnessIndex = avgYellow * 1.0 + avgRed * 3.0;

      const homeYellow = matchesWithStats.reduce((sum, m) => sum + (m.stats?.homeYellowCards || 0), 0);
      const awayYellow = matchesWithStats.reduce((sum, m) => sum + (m.stats?.awayYellowCards || 0), 0);
      const homeBiasScore = matchCount > 0 ? (awayYellow - homeYellow) / matchCount : 0;

      await prisma.refereeSeasonStats.upsert({
        where: {
          refereeId_season_leagueApiId: {
            refereeId: referee.id,
            season: currentSeason,
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
          season: currentSeason,
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
  }

  console.log('✅ Referee statistics updated!');
}

async function main(): Promise<void> {
  console.log('🚀 Starting daily update...');
  console.log(`📅 Date: ${new Date().toISOString().split('T')[0]}`);

  try {
    // Get date range: yesterday to tomorrow (to catch timezone differences)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 3); // Last 3 days
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const fromDate = yesterday.toISOString().split('T')[0];
    const toDate = tomorrow.toISOString().split('T')[0];

    // Update fixtures for all leagues
    for (const league of LEAGUES) {
      await fetchRecentFixtures(league.apiId, fromDate, toDate);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Brief pause between leagues
    }

    // Update referee statistics
    await updateRefereeStats();

    // Print summary
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));

    const todaysMatches = await prisma.match.count({
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    const completedToday = await prisma.match.count({
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: 'FT',
      },
    });

    console.log('\n📊 Daily Update Summary:');
    console.log(`   Today's matches: ${todaysMatches}`);
    console.log(`   Completed today: ${completedToday}`);
    console.log(`   Total API requests: ${requestCount}`);

    console.log('\n🎉 Daily update completed successfully!');
  } catch (error) {
    console.error('❌ Error during daily update:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
