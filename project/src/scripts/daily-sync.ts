#!/usr/bin/env npx tsx

/**
 * Daily Referee Data Sync Script
 *
 * Optimized for daily cron job execution:
 * - Only syncs recent fixtures (last 7 days + upcoming)
 * - Efficient rate limiting for API Football quota (75k/day)
 * - Updates referee statistics incrementally
 * - Attempts to fetch referee photos from Wikipedia
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

// Rate limiting - more aggressive for 75k daily quota
let requestCount = 0;
const MAX_REQUESTS_PER_MINUTE = 30;
const requestTimestamps: number[] = [];

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
  { apiId: 39, name: 'Premier League', country: 'England' },
  { apiId: 140, name: 'La Liga', country: 'Spain' },
  { apiId: 135, name: 'Serie A', country: 'Italy' },
  { apiId: 78, name: 'Bundesliga', country: 'Germany' },
  { apiId: 61, name: 'Ligue 1', country: 'France' },
];

// Fetch referee photo from Wikipedia
async function fetchRefereePhotoFromWikipedia(refereeName: string): Promise<string | null> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(refereeName + ' referee')}&format=json&origin=*`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.query?.search?.length > 0) {
      const pageTitle = searchData.query.search[0].title;
      const imageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&format=json&pithumbsize=300&origin=*`;
      const imageResponse = await fetch(imageUrl);
      const imageData = await imageResponse.json();

      const pages = imageData.query?.pages;
      if (pages) {
        const page = Object.values(pages)[0] as { thumbnail?: { source: string } };
        if (page.thumbnail?.source) {
          return page.thumbnail.source;
        }
      }
    }
    return null;
  } catch (error) {
    console.error(`Wikipedia photo fetch failed for ${refereeName}:`, error);
    return null;
  }
}

// Update referee photos for referees without photos
async function updateRefereephotos(): Promise<void> {
  console.log('\n📸 Updating referee photos...');

  const refereesWithoutPhotos = await prisma.referee.findMany({
    where: { photo: null },
    take: 10, // Limit to 10 per run to avoid rate limiting Wikipedia
  });

  for (const referee of refereesWithoutPhotos) {
    const photoUrl = await fetchRefereePhotoFromWikipedia(referee.name);
    if (photoUrl) {
      await prisma.referee.update({
        where: { id: referee.id },
        data: { photo: photoUrl },
      });
      console.log(`   ✅ Updated photo for ${referee.name}`);
    } else {
      console.log(`   ⚠️ No photo found for ${referee.name}`);
    }
    // Small delay to be nice to Wikipedia
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

async function syncRecentFixtures(leagueApiId: number, season: number): Promise<void> {
  const leagueInfo = LEAGUES.find(l => l.apiId === leagueApiId);
  if (!leagueInfo) return;

  console.log(`\n🏆 Syncing ${leagueInfo.name} recent fixtures...`);

  // Ensure league exists
  const league = await prisma.league.upsert({
    where: { apiId: leagueApiId },
    update: { name: leagueInfo.name, country: leagueInfo.country, season },
    create: {
      apiId: leagueApiId,
      name: leagueInfo.name,
      country: leagueInfo.country,
      season,
    },
  });

  // Get today's date and 7 days ago
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const fromDate = sevenDaysAgo.toISOString().split('T')[0];
  const toDate = today.toISOString().split('T')[0];

  // Fetch recent fixtures
  const fixturesData = await apiRequest<FixtureResponse>('/fixtures', {
    league: leagueApiId.toString(),
    season: season.toString(),
    from: fromDate,
    to: toDate,
  });

  console.log(`📅 Found ${fixturesData.response.length} fixtures in last 7 days`);

  const teams = new Map<number, { name: string; logo: string }>();
  const referees = new Map<string, { name: string }>();

  // Collect teams and referees
  for (const fixture of fixturesData.response) {
    teams.set(fixture.teams.home.id, { name: fixture.teams.home.name, logo: fixture.teams.home.logo });
    teams.set(fixture.teams.away.id, { name: fixture.teams.away.name, logo: fixture.teams.away.logo });

    if (fixture.fixture.referee) {
      const refName = fixture.fixture.referee.split(',')[0].trim();
      referees.set(refName, { name: refName });
    }
  }

  // Upsert teams
  for (const [apiId, team] of teams) {
    await prisma.team.upsert({
      where: { apiId },
      update: { name: team.name, logo: team.logo, leagueId: league.id },
      create: { apiId, name: team.name, logo: team.logo, leagueId: league.id },
    });
  }

  // Upsert referees
  for (const [name] of referees) {
    const slug = generateSlug(name);
    await prisma.referee.upsert({
      where: { slug },
      update: { name },
      create: {
        apiId: Math.abs(name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 1000 + Math.random() * 1000),
        name,
        slug,
      },
    });
  }

  // Get maps for relations
  const allReferees = await prisma.referee.findMany();
  const refereeMap = new Map(allReferees.map(r => [r.name, r]));
  const allTeams = await prisma.team.findMany();
  const teamMap = new Map(allTeams.map(t => [t.apiId, t]));

  // Process completed fixtures for stats
  const completedFixtures = fixturesData.response.filter(
    f => f.fixture.status.short === 'FT' || f.fixture.status.long === 'Match Finished'
  );

  console.log(`📊 Processing ${completedFixtures.length} completed fixtures...`);

  for (const fixture of completedFixtures) {
    const homeTeam = teamMap.get(fixture.teams.home.id);
    const awayTeam = teamMap.get(fixture.teams.away.id);
    if (!homeTeam || !awayTeam) continue;

    const refName = fixture.fixture.referee?.split(',')[0].trim();
    const referee = refName ? refereeMap.get(refName) : null;

    // Check if we already have stats for this match
    const existingMatch = await prisma.match.findUnique({
      where: { apiId: fixture.fixture.id },
      include: { stats: true },
    });

    // Only fetch events if we don't have stats yet
    let stats = null;
    if (!existingMatch?.stats) {
      try {
        const eventsData = await apiRequest<FixtureEventsResponse>('/fixtures/events', {
          fixture: fixture.fixture.id.toString(),
        });

        let yellowCards = 0, redCards = 0;
        let homeYellow = 0, awayYellow = 0;
        let homeRed = 0, awayRed = 0;

        for (const event of eventsData.response) {
          if (event.type === 'Card') {
            if (event.detail === 'Yellow Card') {
              yellowCards++;
              if (event.team.id === fixture.teams.home.id) homeYellow++;
              else awayYellow++;
            } else if (event.detail === 'Red Card' || event.detail === 'Second Yellow card') {
              redCards++;
              if (event.team.id === fixture.teams.home.id) homeRed++;
              else awayRed++;
            }
          }
        }

        stats = { yellowCards, redCards, homeYellow, awayYellow, homeRed, awayRed };
      } catch (error) {
        console.error(`Error fetching events for fixture ${fixture.fixture.id}:`, error);
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
        season,
      },
    });

    // Create match stats if we have new data
    if (stats) {
      await prisma.matchStats.upsert({
        where: { matchId: match.id },
        update: {
          yellowCards: stats.yellowCards,
          redCards: stats.redCards,
          homeYellowCards: stats.homeYellow,
          awayYellowCards: stats.awayYellow,
          homeRedCards: stats.homeRed,
          awayRedCards: stats.awayRed,
        },
        create: {
          matchId: match.id,
          yellowCards: stats.yellowCards,
          redCards: stats.redCards,
          homeYellowCards: stats.homeYellow,
          awayYellowCards: stats.awayYellow,
          homeRedCards: stats.homeRed,
          awayRedCards: stats.awayRed,
        },
      });
    }
  }

  console.log(`✅ ${leagueInfo.name} sync complete!`);
}

async function calculateRefereeStats(): Promise<void> {
  console.log('\n📈 Calculating referee statistics...');

  const referees = await prisma.referee.findMany();

  for (const referee of referees) {
    const matches = await prisma.match.findMany({
      where: {
        refereeId: referee.id,
        OR: [{ status: 'FT' }, { status: 'Match Finished' }],
      },
      include: { stats: true, league: true },
    });

    if (matches.length === 0) continue;

    // Group by season and league
    const seasonLeagueGroups = new Map<string, typeof matches>();
    for (const match of matches) {
      const key = `${match.season}-${match.league.apiId}`;
      const existing = seasonLeagueGroups.get(key) || [];
      existing.push(match);
      seasonLeagueGroups.set(key, existing);
    }

    for (const [key, seasonMatches] of seasonLeagueGroups) {
      const [seasonStr, leagueApiIdStr] = key.split('-');
      const season = parseInt(seasonStr);
      const leagueApiId = parseInt(leagueApiIdStr);

      const matchesWithStats = seasonMatches.filter(m => m.stats);
      const totalYellow = matchesWithStats.reduce((sum, m) => sum + (m.stats?.yellowCards || 0), 0);
      const totalRed = matchesWithStats.reduce((sum, m) => sum + (m.stats?.redCards || 0), 0);

      const matchCount = seasonMatches.length;
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
  }

  console.log('✅ Statistics calculated!');
}

async function main(): Promise<void> {
  const startTime = Date.now();
  console.log('🚀 Starting daily sync...');
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log(`📡 API Key: ${API_KEY.slice(0, 8)}...`);

  try {
    const currentSeason = 2025;

    // Sync recent fixtures for all leagues
    for (const league of LEAGUES) {
      await syncRecentFixtures(league.apiId, currentSeason);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Calculate updated statistics
    await calculateRefereeStats();

    // Update referee photos
    await updateRefereephotos();

    // Summary
    const counts = {
      referees: await prisma.referee.count(),
      matches: await prisma.match.count(),
      refereesWithPhotos: await prisma.referee.count({ where: { photo: { not: null } } }),
    };

    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log('\n📊 Sync Summary:');
    console.log(`   Referees: ${counts.referees} (${counts.refereesWithPhotos} with photos)`);
    console.log(`   Matches: ${counts.matches}`);
    console.log(`   API Requests: ${requestCount}`);
    console.log(`   Duration: ${duration}s`);

    console.log('\n🎉 Daily sync completed!');
  } catch (error) {
    console.error('❌ Error during sync:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
