/**
 * Sync fixture stats for new leagues and update referee stats
 */

import prisma from '../lib/db';

const API_KEY = process.env.API_FOOTBALL_KEY || 'ea04c7309495164f85f3f5fdb5567896';
const BASE_URL = 'https://v3.football.api-sports.io';

// New league IDs that need stats
const NEW_LEAGUE_IDS = [94, 88, 144, 203, 119, 2, 3, 848];

interface FixtureStats {
  team: { id: number };
  statistics: Array<{ type: string; value: number | string | null }>;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchStats(fixtureId: number): Promise<FixtureStats[] | null> {
  try {
    const response = await fetch(`${BASE_URL}/fixtures/statistics?fixture=${fixtureId}`, {
      headers: { 'x-apisports-key': API_KEY },
    });

    if (!response.ok) {
      console.error(`Failed to fetch stats for ${fixtureId}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.response || null;
  } catch {
    console.error(`Error fetching stats for ${fixtureId}`);
    return null;
  }
}

async function syncLeagueStats(leagueApiId: number): Promise<void> {
  console.log(`\nSyncing stats for league ${leagueApiId}...`);

  const league = await prisma.league.findFirst({ where: { apiId: leagueApiId } });
  if (!league) {
    console.log(`  League ${leagueApiId} not found`);
    return;
  }

  // Get completed matches without stats
  const matches = await prisma.match.findMany({
    where: {
      leagueId: league.id,
      status: { in: ['FT', 'Match Finished', 'AET', 'PEN'] },
      stats: null,
    },
    include: { homeTeam: true, awayTeam: true },
    take: 100, // Limit to avoid rate limits
  });

  console.log(`  Found ${matches.length} matches without stats`);

  let synced = 0;
  for (const match of matches) {
    await sleep(1500); // Rate limit - be careful

    const stats = await fetchStats(match.apiId);
    if (!stats || stats.length < 2) continue;

    const homeStats = stats.find(s => s.team.id === match.homeTeam.apiId);
    const awayStats = stats.find(s => s.team.id === match.awayTeam.apiId);

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

    try {
      await prisma.matchStats.create({
        data: {
          matchId: match.id,
          yellowCards: homeYellow + awayYellow,
          redCards: homeRed + awayRed,
          fouls: homeFouls + awayFouls,
          penalties: 0,
          homeYellowCards: homeYellow,
          awayYellowCards: awayYellow,
          homeRedCards: homeRed,
          awayRedCards: awayRed,
          homeFouls,
          awayFouls,
        },
      });
      synced++;
      process.stdout.write(`\r  Synced ${synced}/${matches.length} matches`);
    } catch {
      // Stats might already exist
    }
  }
  console.log(`\n  Completed syncing ${synced} matches`);
}

async function updateRefereeStats(): Promise<void> {
  console.log('\nUpdating referee season stats for all leagues...');

  const referees = await prisma.referee.findMany({
    include: {
      matches: {
        where: { status: { in: ['FT', 'Match Finished', 'AET', 'PEN'] } },
        include: { stats: true, league: true },
      },
    },
  });

  let updated = 0;
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

      const strictnessIndex = avgYellow + (avgRed * 3);

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
      updated++;
    }
  }

  console.log(`  Updated ${updated} referee stats entries`);
}

async function main(): Promise<void> {
  console.log('=== Syncing Stats for New Leagues ===');

  for (const leagueId of NEW_LEAGUE_IDS) {
    await syncLeagueStats(leagueId);
  }

  await updateRefereeStats();

  // Verify
  const allRefTrends = await prisma.refereeSeasonStats.groupBy({
    by: ['leagueApiId'],
    _count: true,
  });
  console.log('\nReferee stats by league:');
  for (const stat of allRefTrends) {
    console.log(`  League ${stat.leagueApiId}: ${stat._count} referees`);
  }

  console.log('\n=== Sync Complete ===');
  await prisma.$disconnect();
}

main().catch(console.error);
