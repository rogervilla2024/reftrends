import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module - db is in project root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');
const dbPath = path.join(projectRoot, 'dev.db');

console.log('Database path:', dbPath);

const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`,
});

const prisma = new PrismaClient({ adapter });

// Sample data for seeding
const leagues = [
  { apiId: 39, name: 'Premier League', country: 'England', season: 2024 },
  { apiId: 140, name: 'La Liga', country: 'Spain', season: 2024 },
  { apiId: 135, name: 'Serie A', country: 'Italy', season: 2024 },
  { apiId: 78, name: 'Bundesliga', country: 'Germany', season: 2024 },
  { apiId: 61, name: 'Ligue 1', country: 'France', season: 2024 },
];

const sampleReferees = [
  { apiId: 1, name: 'Michael Oliver', nationality: 'England', slug: 'michael-oliver' },
  { apiId: 2, name: 'Anthony Taylor', nationality: 'England', slug: 'anthony-taylor' },
  { apiId: 3, name: 'Stuart Attwell', nationality: 'England', slug: 'stuart-attwell' },
  { apiId: 4, name: 'Paul Tierney', nationality: 'England', slug: 'paul-tierney' },
  { apiId: 5, name: 'Simon Hooper', nationality: 'England', slug: 'simon-hooper' },
  { apiId: 6, name: 'Mateu Lahoz', nationality: 'Spain', slug: 'mateu-lahoz' },
  { apiId: 7, name: 'Jesus Gil Manzano', nationality: 'Spain', slug: 'jesus-gil-manzano' },
  { apiId: 8, name: 'Daniele Orsato', nationality: 'Italy', slug: 'daniele-orsato' },
  { apiId: 9, name: 'Marco Guida', nationality: 'Italy', slug: 'marco-guida' },
  { apiId: 10, name: 'Felix Zwayer', nationality: 'Germany', slug: 'felix-zwayer' },
  { apiId: 11, name: 'Clement Turpin', nationality: 'France', slug: 'clement-turpin' },
  { apiId: 12, name: 'Francois Letexier', nationality: 'France', slug: 'francois-letexier' },
];

const sampleTeams = [
  { apiId: 33, name: 'Manchester United', leagueApiId: 39 },
  { apiId: 34, name: 'Newcastle', leagueApiId: 39 },
  { apiId: 40, name: 'Liverpool', leagueApiId: 39 },
  { apiId: 42, name: 'Arsenal', leagueApiId: 39 },
  { apiId: 49, name: 'Chelsea', leagueApiId: 39 },
  { apiId: 50, name: 'Manchester City', leagueApiId: 39 },
  { apiId: 529, name: 'Barcelona', leagueApiId: 140 },
  { apiId: 541, name: 'Real Madrid', leagueApiId: 140 },
  { apiId: 530, name: 'Atletico Madrid', leagueApiId: 140 },
  { apiId: 489, name: 'AC Milan', leagueApiId: 135 },
  { apiId: 496, name: 'Juventus', leagueApiId: 135 },
  { apiId: 505, name: 'Inter', leagueApiId: 135 },
  { apiId: 157, name: 'Bayern Munich', leagueApiId: 78 },
  { apiId: 165, name: 'Borussia Dortmund', leagueApiId: 78 },
  { apiId: 85, name: 'Paris Saint Germain', leagueApiId: 61 },
  { apiId: 91, name: 'Monaco', leagueApiId: 61 },
];

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Seed leagues
    console.log('Seeding leagues...');
    for (const league of leagues) {
      await prisma.league.upsert({
        where: { apiId: league.apiId },
        update: league,
        create: league,
      });
    }
    console.log(`✅ Created ${leagues.length} leagues`);

    // Seed referees
    console.log('Seeding referees...');
    for (const referee of sampleReferees) {
      await prisma.referee.upsert({
        where: { apiId: referee.apiId },
        update: referee,
        create: referee,
      });
    }
    console.log(`✅ Created ${sampleReferees.length} referees`);

    // Get league IDs for team creation
    const leagueRecords = await prisma.league.findMany();
    const leagueIdMap = new Map(leagueRecords.map(l => [l.apiId, l.id]));

    // Seed teams
    console.log('Seeding teams...');
    for (const team of sampleTeams) {
      const leagueId = leagueIdMap.get(team.leagueApiId);
      if (leagueId) {
        await prisma.team.upsert({
          where: { apiId: team.apiId },
          update: { name: team.name, leagueId },
          create: { apiId: team.apiId, name: team.name, leagueId },
        });
      }
    }
    console.log(`✅ Created ${sampleTeams.length} teams`);

    // Seed sample referee season stats
    console.log('Seeding referee season stats...');
    const refereeRecords = await prisma.referee.findMany();

    for (const referee of refereeRecords) {
      await prisma.refereeSeasonStats.upsert({
        where: {
          refereeId_season_leagueApiId: {
            refereeId: referee.id,
            season: 2024,
            leagueApiId: 39,
          },
        },
        update: {},
        create: {
          refereeId: referee.id,
          season: 2024,
          leagueApiId: 39,
          matchesOfficiated: Math.floor(Math.random() * 20) + 5,
          totalYellowCards: Math.floor(Math.random() * 80) + 20,
          totalRedCards: Math.floor(Math.random() * 8),
          avgYellowCards: Math.random() * 2 + 2.5,
          avgRedCards: Math.random() * 0.3,
          totalPenalties: Math.floor(Math.random() * 10),
          avgPenalties: Math.random() * 0.5,
          totalFouls: Math.floor(Math.random() * 400) + 200,
          avgFouls: Math.random() * 5 + 20,
          strictnessIndex: Math.random() * 3 + 5,
          homeBiasScore: Math.random() * 0.4 - 0.2,
        },
      });
    }
    console.log(`✅ Created referee season stats`);

    console.log('\n🎉 Database seeding completed successfully!');

    // Print summary
    const counts = {
      leagues: await prisma.league.count(),
      referees: await prisma.referee.count(),
      teams: await prisma.team.count(),
      refereeStats: await prisma.refereeSeasonStats.count(),
    };

    console.log('\n📊 Summary:');
    console.log(`   Leagues: ${counts.leagues}`);
    console.log(`   Referees: ${counts.referees}`);
    console.log(`   Teams: ${counts.teams}`);
    console.log(`   Referee Season Stats: ${counts.refereeStats}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
