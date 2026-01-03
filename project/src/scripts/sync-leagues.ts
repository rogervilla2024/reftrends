/**
 * Sync all leagues - fixtures and referee data
 * Run with: npx tsx src/scripts/sync-leagues.ts
 */

import prisma from '../lib/db';
import { getSeasonForApi } from '../lib/season';

const API_KEY = process.env.API_FOOTBALL_KEY || 'ea04c7309495164f85f3f5fdb5567896';
const BASE_URL = 'https://v3.football.api-sports.io';

// All league IDs to sync
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
];

interface Fixture {
  fixture: {
    id: number;
    referee: string | null;
    date: string;
    venue: { name: string; city: string };
    status: { long: string; short: string };
  };
  league: { id: number; name: string; season: number; country: string; logo: string };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
}

interface FixtureStats {
  team: { id: number };
  statistics: Array<{ type: string; value: number | string | null }>;
}


async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function apiRequest<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'x-apisports-key': API_KEY },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.response;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function syncLeague(leagueId: number, season: number): Promise<{ synced: number; errors: number }> {
  let synced = 0;
  let errors = 0;

  console.log(`\nSyncing league ${leagueId} for season ${season}...`);

  try {
    const fixtures = await apiRequest<Fixture[]>(`/fixtures?league=${leagueId}&season=${season}`);
    console.log(`  Found ${fixtures.length} fixtures`);

    for (const fixture of fixtures) {
      try {
        // Upsert league
        await prisma.league.upsert({
          where: { apiId: leagueId },
          update: { logo: fixture.league.logo },
          create: {
            apiId: leagueId,
            name: fixture.league.name,
            country: fixture.league.country,
            logo: fixture.league.logo,
            season: fixture.league.season + 1,
          },
        });

        const league = await prisma.league.findUnique({
          where: { apiId: leagueId },
        });

        if (!league) continue;

        // Upsert teams with league reference
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
          const slug = generateSlug(refereeName);

          // Generate a unique apiId from the name
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
        console.error(`  Error syncing fixture ${fixture.fixture.id}:`, err);
      }
    }

    console.log(`  Synced ${synced} fixtures, ${errors} errors`);
  } catch (err) {
    console.error(`  Error fetching fixtures:`, err);
    errors++;
  }

  return { synced, errors };
}

async function syncFixtureStats(leagueId: number, season: number): Promise<void> {
  console.log(`\nSyncing fixture stats for league ${leagueId}...`);

  // Get completed matches without stats
  const matches = await prisma.match.findMany({
    where: {
      league: { apiId: leagueId },
      season: season + 1,
      status: { in: ['FT', 'Match Finished'] },
      stats: null,
    },
    take: 50, // Limit to avoid API rate limits
  });

  console.log(`  Found ${matches.length} matches without stats`);

  for (const match of matches) {
    try {
      await sleep(1200); // Rate limit

      const stats = await apiRequest<FixtureStats[]>(`/fixtures/statistics?fixture=${match.apiId}`);

      if (stats && stats.length >= 2) {
        const homeStats = stats.find(s => s.team.id === match.homeTeamId);
        const awayStats = stats.find(s => s.team.id === match.awayTeamId);

        const getValue = (statsArray: FixtureStats | undefined, type: string): number => {
          if (!statsArray) return 0;
          const stat = statsArray.statistics.find(s => s.type === type);
          if (!stat || stat.value === null) return 0;
          return typeof stat.value === 'number' ? stat.value : parseInt(stat.value) || 0;
        };

        const homeYellow = getValue(homeStats, 'Yellow Cards');
        const awayYellow = getValue(awayStats, 'Yellow Cards');
        const homeRed = getValue(homeStats, 'Red Cards');
        const awayRed = getValue(awayStats, 'Red Cards');
        const homeFouls = getValue(homeStats, 'Fouls');
        const awayFouls = getValue(awayStats, 'Fouls');

        await prisma.matchStats.create({
          data: {
            matchId: match.id,
            yellowCards: homeYellow + awayYellow,
            redCards: homeRed + awayRed,
            fouls: homeFouls + awayFouls,
            penalties: 0, // Would need events API for accurate count
            homeYellowCards: homeYellow,
            awayYellowCards: awayYellow,
            homeRedCards: homeRed,
            awayRedCards: awayRed,
          },
        });

        console.log(`  Stats synced for match ${match.apiId}`);
      }
    } catch (err) {
      console.error(`  Error syncing stats for match ${match.apiId}:`, err);
    }
  }
}

async function updateRefereeStats(): Promise<void> {
  console.log('\nUpdating referee season stats...');

  const referees = await prisma.referee.findMany({
    include: {
      matches: {
        where: { status: { in: ['FT', 'Match Finished'] } },
        include: { stats: true, league: true },
      },
    },
  });

  for (const referee of referees) {
    // Group matches by season and league
    const seasonLeagueStats = new Map<string, {
      season: number;
      leagueApiId: number;
      matches: typeof referee.matches;
    }>();

    for (const match of referee.matches) {
      const key = `${match.season}-${match.league.apiId}`;
      const existing = seasonLeagueStats.get(key) || {
        season: match.season,
        leagueApiId: match.league.apiId,
        matches: [],
      };
      existing.matches.push(match);
      seasonLeagueStats.set(key, existing);
    }

    // Calculate and upsert stats for each season/league combo
    for (const [, data] of seasonLeagueStats) {
      const matchesWithStats = data.matches.filter(m => m.stats);
      if (matchesWithStats.length === 0) continue;

      const totalYellow = matchesWithStats.reduce((sum, m) => sum + (m.stats?.yellowCards || 0), 0);
      const totalRed = matchesWithStats.reduce((sum, m) => sum + (m.stats?.redCards || 0), 0);
      const totalFouls = matchesWithStats.reduce((sum, m) => sum + (m.stats?.fouls || 0), 0);
      const totalPenalties = matchesWithStats.reduce((sum, m) => sum + (m.stats?.penalties || 0), 0);

      const avgYellow = totalYellow / matchesWithStats.length;
      const avgRed = totalRed / matchesWithStats.length;
      const avgFouls = totalFouls / matchesWithStats.length;
      const avgPenalties = totalPenalties / matchesWithStats.length;

      // Strictness index: weighted combination of cards per match
      const strictnessIndex = avgYellow + (avgRed * 3);

      // Home bias: difference between home and away cards given
      const homeYellow = matchesWithStats.reduce((sum, m) => sum + (m.stats?.homeYellowCards || 0), 0);
      const awayYellow = matchesWithStats.reduce((sum, m) => sum + (m.stats?.awayYellowCards || 0), 0);
      const homeBias = homeYellow > 0 && awayYellow > 0
        ? (homeYellow - awayYellow) / (homeYellow + awayYellow)
        : 0;

      await prisma.refereeSeasonStats.upsert({
        where: {
          refereeId_season_leagueApiId: {
            refereeId: referee.id,
            season: data.season,
            leagueApiId: data.leagueApiId,
          },
        },
        update: {
          matchesOfficiated: matchesWithStats.length,
          totalYellowCards: totalYellow,
          totalRedCards: totalRed,
          avgYellowCards: avgYellow,
          avgRedCards: avgRed,
          totalFouls,
          avgFouls,
          totalPenalties,
          avgPenalties,
          strictnessIndex,
          homeBiasScore: homeBias,
        },
        create: {
          refereeId: referee.id,
          season: data.season,
          leagueApiId: data.leagueApiId,
          matchesOfficiated: matchesWithStats.length,
          totalYellowCards: totalYellow,
          totalRedCards: totalRed,
          avgYellowCards: avgYellow,
          avgRedCards: avgRed,
          totalFouls,
          avgFouls,
          totalPenalties,
          avgPenalties,
          strictnessIndex,
          homeBiasScore: homeBias,
        },
      });
    }
  }

  console.log(`  Updated stats for ${referees.length} referees`);
}

async function main(): Promise<void> {
  const season = getSeasonForApi();
  console.log(`Starting sync for season ${season} (${season}/${(season + 1).toString().slice(2)})`);

  let totalSynced = 0;
  let totalErrors = 0;

  for (const leagueId of LEAGUE_IDS) {
    await sleep(2000); // Rate limit between leagues
    const result = await syncLeague(leagueId, season);
    totalSynced += result.synced;
    totalErrors += result.errors;
  }

  console.log(`\n=== Fixture Sync Complete ===`);
  console.log(`Total synced: ${totalSynced}`);
  console.log(`Total errors: ${totalErrors}`);

  // Sync fixture stats
  console.log('\n=== Syncing Fixture Stats ===');
  for (const leagueId of LEAGUE_IDS.slice(0, 5)) { // Only top 5 to avoid rate limits
    await syncFixtureStats(leagueId, season);
  }

  // Update referee stats
  await updateRefereeStats();

  console.log('\n=== Sync Complete ===');
  await prisma.$disconnect();
}

main().catch(console.error);
