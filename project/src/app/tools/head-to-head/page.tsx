import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Link from 'next/link';
import HeadToHeadClient from '@/components/HeadToHeadClient';

export const metadata: Metadata = {
  title: 'Head-to-Head Analysis',
  description: 'Detailed referee vs team analysis. Compare how specific teams perform with different referees.',
  openGraph: {
    title: 'Head-to-Head Analysis - RefStats',
    description: 'Referee vs Team detailed comparison.',
    url: 'https://refstats.com/tools/head-to-head',
  },
  alternates: {
    canonical: 'https://refstats.com/tools/head-to-head',
  },
};

const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

async function getTeamsAndReferees() {
  const [teams, referees] = await Promise.all([
    prisma.team.findMany({
      include: { league: true },
      orderBy: { name: 'asc' },
    }),
    prisma.referee.findMany({
      include: {
        seasonStats: {
          orderBy: { matchesOfficiated: 'desc' },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  return {
    teams: teams.map(t => ({
      id: t.id,
      apiId: t.apiId,
      name: t.name,
      logo: t.logo,
      league: t.league.name,
    })),
    referees: referees
      .filter(r => (r.seasonStats[0]?.matchesOfficiated || 0) >= 5)
      .map(r => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        photo: r.photo,
      })),
  };
}

export default async function HeadToHeadPage() {
  const data = await getTeamsAndReferees();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/tools" className="text-primary hover:underline text-sm mb-4 inline-block">
          &larr; Back to Tools
        </Link>
        <h1 className="text-3xl font-bold">Head-to-Head Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Detailed referee vs team comparison
        </p>
      </div>

      <HeadToHeadClient teams={data.teams} referees={data.referees} />
    </div>
  );
}
