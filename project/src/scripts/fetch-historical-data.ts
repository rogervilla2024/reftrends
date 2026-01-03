import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const API_KEY = process.env.API_FOOTBALL_KEY || 'ea04c7309495164f85f3f5fdb5567896';
const BASE_URL = 'https://v3.football.api-sports.io';

const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

const LEAGUE_IDS = [39, 140, 135, 78, 61]; // PL, La Liga, Serie A, Bundesliga, Ligue 1
const SEASONS_TO_FETCH = [2024, 2023]; // Past seasons

interface Fixture {
  fixture: {
    id: number;
    referee: string | null;
    date: string;
    venue: { name: string };
    status: { short: string; long: string };
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
}

interface FixtureStatistic {
  team: { id: number };
  statistics: Array<{ type: string; value: number | string | null }>;
}

async function fetchFixtures(leagueId: number, season: number): Promise<Fixture[]> {
  const url = `${BASE_URL}/fixtures?league=${leagueId}&season=${season}`;

  const response = await fetch(url, {
    headers: { 'x-apisports-key': API_KEY },
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);

  const data = await response.json();
  return data.response || [];
}

async function fetchStatistics(fixtureId: number): Promise<FixtureStatistic[]> {
  const url = `${BASE_URL}/fixtures/statistics?fixture=${fixtureId}`;

  const response = await fetch(url, {
    headers: { 'x-apisports-key': API_KEY },
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);

  const data = await response.json();
  return data.response || [];
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('Fetching historical season data...\n');

  let totalFixtures = 0;
  let totalProcessed = 0;
  let requestCount = 0;

  for (const season of SEASONS_TO_FETCH) {
    console.log(`\n=== Season ${season} ===\n`);

    for (const leagueId of LEAGUE_IDS) {
      // Check rate limit
      if (requestCount > 0 && requestCount % 25 === 0) {
        console.log('Rate limit pause (60s)...');
        await delay(60000);
      }

      console.log(`Fetching league ${leagueId} for season ${season}...`);
      requestCount++;

      try {
        const fixtures = await fetchFixtures(leagueId, season);
        const finishedFixtures = fixtures.filter(
          f => f.fixture.status.short === 'FT' || f.fixture.status.long === 'Match Finished'
        );

        console.log(`Found ${finishedFixtures.length} finished matches`);
        totalFixtures += finishedFixtures.length;

        // Get or create league
        let league = await prisma.league.findUnique({ where: { apiId: leagueId } });
        if (!league) {
          league = await prisma.league.create({
            data: {
              apiId: leagueId,
              name: fixtures[0]?.league.name || `League ${leagueId}`,
              country: 'Unknown',
              season: season,
            },
          });
        }

        // Process fixtures (limit to 50 per league to save API calls)
        const fixturesToProcess = finishedFixtures.slice(0, 50);

        for (const fixture of fixturesToProcess) {
          // Rate limit check
          if (requestCount > 0 && requestCount % 25 === 0) {
            console.log('Rate limit pause (60s)...');
            await delay(60000);
          }

          try {
            // Check if match exists
            const existingMatch = await prisma.match.findUnique({
              where: { apiId: fixture.fixture.id },
            });

            if (existingMatch) continue;

            // Get or create teams
            let homeTeam = await prisma.team.findUnique({ where: { apiId: fixture.teams.home.id } });
            if (!homeTeam) {
              homeTeam = await prisma.team.create({
                data: {
                  apiId: fixture.teams.home.id,
                  name: fixture.teams.home.name,
                  logo: fixture.teams.home.logo,
                  leagueId: league.id,
                },
              });
            }

            let awayTeam = await prisma.team.findUnique({ where: { apiId: fixture.teams.away.id } });
            if (!awayTeam) {
              awayTeam = await prisma.team.create({
                data: {
                  apiId: fixture.teams.away.id,
                  name: fixture.teams.away.name,
                  logo: fixture.teams.away.logo,
                  leagueId: league.id,
                },
              });
            }

            // Get or create referee
            let refereeId: number | null = null;
            if (fixture.fixture.referee) {
              const refName = fixture.fixture.referee.split(',')[0].trim();
              let referee = await prisma.referee.findFirst({ where: { name: refName } });

              if (!referee) {
                referee = await prisma.referee.create({
                  data: {
                    apiId: Math.floor(Math.random() * 100000) + 10000,
                    name: refName,
                    slug: generateSlug(refName),
                  },
                });
              }
              refereeId = referee.id;
            }

            // Fetch statistics
            requestCount++;
            const stats = await fetchStatistics(fixture.fixture.id);
            await delay(2100);

            // Create match
            const match = await prisma.match.create({
              data: {
                apiId: fixture.fixture.id,
                date: new Date(fixture.fixture.date),
                venue: fixture.fixture.venue?.name,
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

            // Process statistics
            if (stats.length >= 2) {
              const homeStats = stats.find(s => s.team.id === fixture.teams.home.id);
              const awayStats = stats.find(s => s.team.id === fixture.teams.away.id);

              const getStat = (team: FixtureStatistic | undefined, type: string): number => {
                if (!team) return 0;
                const stat = team.statistics.find(s => s.type === type);
                return typeof stat?.value === 'number' ? stat.value : 0;
              };

              const homeYellow = getStat(homeStats, 'Yellow Cards');
              const awayYellow = getStat(awayStats, 'Yellow Cards');
              const homeRed = getStat(homeStats, 'Red Cards');
              const awayRed = getStat(awayStats, 'Red Cards');
              const homeFouls = getStat(homeStats, 'Fouls');
              const awayFouls = getStat(awayStats, 'Fouls');

              await prisma.matchStats.create({
                data: {
                  matchId: match.id,
                  yellowCards: homeYellow + awayYellow,
                  redCards: homeRed + awayRed,
                  homeYellowCards: homeYellow,
                  awayYellowCards: awayYellow,
                  homeRedCards: homeRed,
                  awayRedCards: awayRed,
                  fouls: homeFouls + awayFouls,
                  homeFouls,
                  awayFouls,
                },
              });
            }

            totalProcessed++;
            process.stdout.write(`\r  Processed: ${totalProcessed}/${totalFixtures}`);
          } catch (error) {
            console.error(`\nError processing fixture ${fixture.fixture.id}:`, error);
          }
        }

        console.log();
        await delay(2100);
      } catch (error) {
        console.error(`Error fetching league ${leagueId}:`, error);
      }
    }
  }

  // Update referee season stats
  console.log('\n\nUpdating referee season stats...');

  const referees = await prisma.referee.findMany({
    include: {
      matches: {
        include: { stats: true, league: true },
      },
    },
  });

  for (const referee of referees) {
    // Group by season and league
    const seasonLeagueGroups: Record<string, typeof referee.matches> = {};

    referee.matches.forEach(match => {
      const key = `${match.season}-${match.league.apiId}`;
      if (!seasonLeagueGroups[key]) {
        seasonLeagueGroups[key] = [];
      }
      seasonLeagueGroups[key].push(match);
    });

    for (const [key, matches] of Object.entries(seasonLeagueGroups)) {
      const [season, leagueApiId] = key.split('-').map(Number);
      const matchesWithStats = matches.filter(m => m.stats);

      if (matchesWithStats.length === 0) continue;

      const totalYellow = matchesWithStats.reduce((sum, m) => sum + (m.stats?.yellowCards || 0), 0);
      const totalRed = matchesWithStats.reduce((sum, m) => sum + (m.stats?.redCards || 0), 0);
      const totalFouls = matchesWithStats.reduce((sum, m) => sum + (m.stats?.fouls || 0), 0);

      await prisma.refereeSeasonStats.upsert({
        where: {
          refereeId_season_leagueApiId: {
            refereeId: referee.id,
            season,
            leagueApiId,
          },
        },
        create: {
          refereeId: referee.id,
          season,
          leagueApiId,
          matchesOfficiated: matchesWithStats.length,
          totalYellowCards: totalYellow,
          totalRedCards: totalRed,
          avgYellowCards: totalYellow / matchesWithStats.length,
          avgRedCards: totalRed / matchesWithStats.length,
          totalFouls,
          avgFouls: totalFouls / matchesWithStats.length,
          strictnessIndex: (totalYellow + totalRed * 2) / matchesWithStats.length,
        },
        update: {
          matchesOfficiated: matchesWithStats.length,
          totalYellowCards: totalYellow,
          totalRedCards: totalRed,
          avgYellowCards: totalYellow / matchesWithStats.length,
          avgRedCards: totalRed / matchesWithStats.length,
          totalFouls,
          avgFouls: totalFouls / matchesWithStats.length,
          strictnessIndex: (totalYellow + totalRed * 2) / matchesWithStats.length,
        },
      });
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Total fixtures found: ${totalFixtures}`);
  console.log(`Total processed: ${totalProcessed}`);
  console.log(`API requests made: ${requestCount}`);

  await prisma.$disconnect();
}

main().catch(console.error);
