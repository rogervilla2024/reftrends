import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const API_KEY = process.env.API_FOOTBALL_KEY || 'ea04c7309495164f85f3f5fdb5567896';
const BASE_URL = 'https://v3.football.api-sports.io';

const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

interface CardEventFromAPI {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: {
    id: number;
    name: string;
  };
  player: {
    id: number;
    name: string;
  };
  type: string;
  detail: string;
}

interface FixtureEventsResponse {
  response: CardEventFromAPI[];
}

async function fetchFixtureEvents(fixtureApiId: number): Promise<CardEventFromAPI[]> {
  const url = `${BASE_URL}/fixtures/events?fixture=${fixtureApiId}`;

  const response = await fetch(url, {
    headers: {
      'x-apisports-key': API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data: FixtureEventsResponse = await response.json();
  return data.response || [];
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Fetching card events from API Football...\n');

  // Get matches with stats
  const allMatchesWithStats = await prisma.match.findMany({
    where: {
      OR: [{ status: 'FT' }, { status: 'Match Finished' }],
      stats: { isNot: null },
    },
    include: {
      stats: {
        include: { cardEvents: true },
      },
      homeTeam: true,
      awayTeam: true,
    },
    orderBy: { date: 'desc' },
  });

  // Filter matches that don't have card events yet
  const matchesWithStats = allMatchesWithStats
    .filter(m => m.stats && m.stats.cardEvents.length === 0)
    .slice(0, 200);

  console.log(`Found ${matchesWithStats.length} matches without card events\n`);

  let processed = 0;
  let eventsAdded = 0;
  const errors: string[] = [];

  for (const match of matchesWithStats) {
    if (!match.stats) continue;

    try {
      // Rate limiting: 30 requests per minute
      if (processed > 0 && processed % 25 === 0) {
        console.log('Rate limit pause (60s)...');
        await delay(60000);
      }

      const events = await fetchFixtureEvents(match.apiId);

      // Filter only card events
      const cardEvents = events.filter(
        e => e.type === 'Card' && (e.detail === 'Yellow Card' || e.detail === 'Red Card')
      );

      if (cardEvents.length > 0) {
        // Insert card events
        for (const event of cardEvents) {
          const isYellow = event.detail === 'Yellow Card';
          const isHome = event.team.id === match.homeTeam.apiId;

          await prisma.cardEvent.create({
            data: {
              matchStatsId: match.stats.id,
              minute: event.time.elapsed,
              extraMinute: event.time.extra,
              type: isYellow ? 'yellow' : 'red',
              teamId: event.team.id,
              playerName: event.player?.name || null,
              isHome,
            },
          });

          eventsAdded++;
        }
      }

      processed++;
      console.log(
        `[${processed}/${matchesWithStats.length}] ${match.homeTeam.name} vs ${match.awayTeam.name}: ${cardEvents.length} card events`
      );

      // Small delay between requests
      await delay(2100);
    } catch (error) {
      const errorMsg = `Error processing match ${match.id}: ${error}`;
      errors.push(errorMsg);
      console.error(errorMsg);
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Matches processed: ${processed}`);
  console.log(`Card events added: ${eventsAdded}`);
  console.log(`Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(`  - ${e}`));
  }

  await prisma.$disconnect();
}

main().catch(console.error);
