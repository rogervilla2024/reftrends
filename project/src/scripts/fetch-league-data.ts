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
let requestCount = 0;
const MAX_REQUESTS_PER_MINUTE = 25;
const requestTimestamps: number[] = [];

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  // Remove timestamps older than 1 minute
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
    score: {
      fulltime: { home: number | null; away: number | null };
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

// Interface reserved for future detailed statistics fetching
// interface FixtureStatisticsResponse {
//   response: {
//     team: { id: number; name: string };
//     statistics: {
//       type: string;
//       value: number | string | null;
//     }[];
//   }[];
// }

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

async function fetchLeagueData(leagueApiId: number, season: number): Promise<void> {
  const leagueInfo = LEAGUES.find(l => l.apiId === leagueApiId);
  if (!leagueInfo) {
    console.error(`Unknown league ID: ${leagueApiId}`);
    return;
  }

  console.log(`\n🏆 Fetching ${leagueInfo.name} ${season}/${season+1} data...`);

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

  // Fetch fixtures
  const fixturesData = await apiRequest<FixtureResponse>('/fixtures', {
    league: leagueApiId.toString(),
    season: season.toString(),
  });

  console.log(`📅 Found ${fixturesData.response.length} fixtures`);

  const teams = new Map<number, { name: string; logo: string }>();
  const referees = new Map<string, { name: string }>();
  const fixtureStats = new Map<number, { yellowCards: number; redCards: number; fouls: number; penalties: number; homePenalties: number; awayPenalties: number; homeYellow: number; awayYellow: number; homeRed: number; awayRed: number }>();

  // Process fixtures
  for (const fixture of fixturesData.response) {
    // Collect teams
    teams.set(fixture.teams.home.id, { name: fixture.teams.home.name, logo: fixture.teams.home.logo });
    teams.set(fixture.teams.away.id, { name: fixture.teams.away.name, logo: fixture.teams.away.logo });

    // Collect referees
    if (fixture.fixture.referee) {
      const refName = fixture.fixture.referee.split(',')[0].trim(); // Remove country suffix
      referees.set(refName, { name: refName });
    }
  }

  // Create teams
  console.log(`👥 Creating ${teams.size} teams...`);
  for (const entry of Array.from(teams.entries())) {
    const [apiId, team] = entry;
    await prisma.team.upsert({
      where: { apiId },
      update: { name: team.name, logo: team.logo, leagueId: league.id },
      create: { apiId, name: team.name, logo: team.logo, leagueId: league.id },
    });
  }

  // Create referees
  console.log(`🧑‍⚖️ Creating ${referees.size} referees...`);
  for (const entry of Array.from(referees.entries())) {
    const [name] = entry;
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

  // Get all referees for this operation
  const allReferees = await prisma.referee.findMany();
  const refereeMap = new Map(allReferees.map(r => [r.name, r]));

  // Get all teams
  const allTeams = await prisma.team.findMany();
  const teamMap = new Map(allTeams.map(t => [t.apiId, t]));

  // Fetch events for completed fixtures to get card data
  const completedFixtures = fixturesData.response.filter(
    f => f.fixture.status.short === 'FT' || f.fixture.status.long === 'Match Finished'
  );

  console.log(`📊 Processing ${completedFixtures.length} completed fixtures for stats...`);

  let processedCount = 0;
  for (const fixture of completedFixtures) {
    try {
      // Fetch fixture events (cards, goals, etc.)
      const eventsData = await apiRequest<FixtureEventsResponse>('/fixtures/events', {
        fixture: fixture.fixture.id.toString(),
      });

      let yellowCards = 0;
      let redCards = 0;
      let homeYellow = 0;
      let awayYellow = 0;
      let homeRed = 0;
      let awayRed = 0;
      let penalties = 0;
      let homePenalties = 0;
      let awayPenalties = 0;

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
        // Count penalties (both scored and missed)
        if (event.detail === 'Penalty' || event.detail === 'Missed Penalty') {
          penalties++;
          if (event.team.id === fixture.teams.home.id) homePenalties++;
          else awayPenalties++;
        }
      }

      fixtureStats.set(fixture.fixture.id, {
        yellowCards,
        redCards,
        fouls: 0, // Would need separate stats API call
        penalties,
        homePenalties,
        awayPenalties,
        homeYellow,
        awayYellow,
        homeRed,
        awayRed,
      });

      processedCount++;
      if (processedCount % 20 === 0) {
        console.log(`   Processed ${processedCount}/${completedFixtures.length} fixtures...`);
      }

      // Small delay to be nice to the API
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error fetching events for fixture ${fixture.fixture.id}:`, error);
    }
  }

  // Create matches and stats
  console.log(`💾 Saving matches to database...`);
  for (const fixture of fixturesData.response) {
    const homeTeam = teamMap.get(fixture.teams.home.id);
    const awayTeam = teamMap.get(fixture.teams.away.id);

    if (!homeTeam || !awayTeam) continue;

    const refName = fixture.fixture.referee?.split(',')[0].trim();
    const referee = refName ? refereeMap.get(refName) : null;

    const stats = fixtureStats.get(fixture.fixture.id);

    try {
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

      // Create match stats if available
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
            penalties: stats.penalties,
            homePenalties: stats.homePenalties,
            awayPenalties: stats.awayPenalties,
          },
          create: {
            matchId: match.id,
            yellowCards: stats.yellowCards,
            redCards: stats.redCards,
            homeYellowCards: stats.homeYellow,
            awayYellowCards: stats.awayYellow,
            homeRedCards: stats.homeRed,
            awayRedCards: stats.awayRed,
            penalties: stats.penalties,
            homePenalties: stats.homePenalties,
            awayPenalties: stats.awayPenalties,
          },
        });
      }
    } catch (error) {
      console.error(`Error saving match ${fixture.fixture.id}:`, error);
    }
  }

  console.log(`✅ ${leagueInfo.name} data fetch complete!`);
}

async function calculateRefereeStats(): Promise<void> {
  console.log('\n📈 Calculating referee season statistics...');

  const referees = await prisma.referee.findMany();

  for (const referee of referees) {
    const matches = await prisma.match.findMany({
      where: {
        refereeId: referee.id,
        OR: [{ status: 'FT' }, { status: 'Match Finished' }],
      },
      include: {
        stats: true,
        league: true,
      },
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

    for (const entry of Array.from(seasonLeagueGroups.entries())) {
      const [key, seasonMatches] = entry;
      const [seasonStr, leagueApiIdStr] = key.split('-');
      const season = parseInt(seasonStr);
      const leagueApiId = parseInt(leagueApiIdStr);

      const matchesWithStats = seasonMatches.filter(m => m.stats);
      const totalYellow = matchesWithStats.reduce((sum, m) => sum + (m.stats?.yellowCards || 0), 0);
      const totalRed = matchesWithStats.reduce((sum, m) => sum + (m.stats?.redCards || 0), 0);
      const totalPenalties = matchesWithStats.reduce((sum, m) => sum + (m.stats?.penalties || 0), 0);
      const totalFouls = matchesWithStats.reduce((sum, m) => sum + (m.stats?.fouls || 0), 0);

      const matchCount = seasonMatches.length;
      const avgYellow = matchCount > 0 ? totalYellow / matchCount : 0;
      const avgRed = matchCount > 0 ? totalRed / matchCount : 0;
      const avgPenalties = matchCount > 0 ? totalPenalties / matchCount : 0;
      const avgFouls = matchCount > 0 ? totalFouls / matchCount : 0;

      // Calculate strictness index (weighted combination of cards and penalties)
      const strictnessIndex = avgYellow * 1.0 + avgRed * 3.0 + avgPenalties * 0.5;

      // Calculate home bias (difference in cards given to home vs away teams)
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
          totalPenalties: totalPenalties,
          avgPenalties: avgPenalties,
          totalFouls: totalFouls,
          avgFouls: avgFouls,
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
          totalPenalties: totalPenalties,
          avgPenalties: avgPenalties,
          totalFouls: totalFouls,
          avgFouls: avgFouls,
          strictnessIndex,
          homeBiasScore,
        },
      });
    }
  }

  console.log('✅ Referee statistics calculated!');
}

async function main(): Promise<void> {
  console.log('🚀 Starting data fetch...');
  console.log(`📡 API Key: ${API_KEY.slice(0, 8)}...`);

  try {
    // Fetch current season data for all leagues
    const currentSeason = 2025; // 2025-26 season

    // Process one league at a time to manage rate limits
    for (const league of LEAGUES) {
      await fetchLeagueData(league.apiId, currentSeason);
      // Wait between leagues
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Calculate referee statistics after all data is fetched
    await calculateRefereeStats();

    // Print summary
    const counts = {
      leagues: await prisma.league.count(),
      referees: await prisma.referee.count(),
      teams: await prisma.team.count(),
      matches: await prisma.match.count(),
      matchStats: await prisma.matchStats.count(),
      refereeStats: await prisma.refereeSeasonStats.count(),
    };

    console.log('\n📊 Final Summary:');
    console.log(`   Leagues: ${counts.leagues}`);
    console.log(`   Referees: ${counts.referees}`);
    console.log(`   Teams: ${counts.teams}`);
    console.log(`   Matches: ${counts.matches}`);
    console.log(`   Match Stats: ${counts.matchStats}`);
    console.log(`   Referee Season Stats: ${counts.refereeStats}`);
    console.log(`   Total API Requests: ${requestCount}`);

    console.log('\n🎉 Data fetch completed successfully!');
  } catch (error) {
    console.error('❌ Error during data fetch:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
