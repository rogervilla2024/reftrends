/**
 * Quick data verification script
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

async function check() {
  console.log('\n📊 Database Statistics:');
  console.log('========================');

  const leagues = await prisma.league.findMany({
    include: {
      _count: {
        select: { matches: true }
      }
    }
  });
  console.log('\nLeagues:', leagues.length);
  leagues.forEach(l => {
    console.log(`  - ${l.name}: ${l._count.matches} matches`);
  });

  const teams = await prisma.team.count();
  console.log('\nTotal Teams:', teams);

  const referees = await prisma.referee.count();
  console.log('Total Referees:', referees);

  const matches = await prisma.match.count();
  console.log('Total Matches:', matches);

  const matchStats = await prisma.matchStats.count();
  console.log('Match Stats:', matchStats);

  const refereeStats = await prisma.refereeSeasonStats.count();
  console.log('Referee Season Stats:', refereeStats);

  // Top referees by matches
  console.log('\n🏆 Top 5 Referees by Matches:');
  const topRefs = await prisma.referee.findMany({
    include: {
      seasonStats: true,
      _count: {
        select: { matches: true }
      }
    },
    orderBy: {
      matches: {
        _count: 'desc'
      }
    },
    take: 5
  });

  topRefs.forEach((ref, i) => {
    const stats = ref.seasonStats[0];
    console.log(`  ${i+1}. ${ref.name}: ${ref._count.matches} matches (Avg Yellow: ${stats?.avgYellowCards?.toFixed(2) || 'N/A'})`);
  });

  console.log('\n✅ Data verification complete!\n');

  await prisma.$disconnect();
}

check();
