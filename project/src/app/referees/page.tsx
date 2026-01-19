import { Metadata } from 'next';
import RefereeDataTable, { RefereeTableData, LeagueFilter } from '@/components/RefereeDataTable';
import prisma from '@/lib/db';

export const metadata: Metadata = {
  title: 'Referees',
  description: 'Browse and compare referee statistics across Premier League, La Liga, Serie A, Bundesliga, and Ligue 1. Filter by league, search by name, and analyze card averages.',
  openGraph: {
    title: 'Referees - RefTrends',
    description: 'Browse and compare referee statistics across Europe\'s top 5 football leagues.',
    url: 'https://reftrends.com/referees',
  },
  twitter: {
    title: 'Referees - RefTrends',
    description: 'Browse and compare referee statistics across Europe\'s top 5 football leagues.',
  },
  alternates: {
    canonical: 'https://reftrends.com/referees',
  },
};

async function getReferees(): Promise<RefereeTableData[]> {
  try {
    // Fetch referees with their season stats
    const referees = await prisma.referee.findMany({
      include: {
        seasonStats: {
          orderBy: { season: 'desc' },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    });

    // Fetch leagues to map leagueApiId to league names
    const leagues = await prisma.league.findMany();
    const leagueMap = new Map(leagues.map(l => [l.apiId, { id: l.id, name: l.name }]));

    return referees.map((referee) => {
      const stats = referee.seasonStats[0];
      const league = stats ? leagueMap.get(stats.leagueApiId) : undefined;
      return {
        id: referee.id,
        name: referee.name,
        slug: referee.slug,
        nationality: referee.nationality,
        photo: referee.photo,
        matchesOfficiated: stats?.matchesOfficiated ?? 0,
        avgYellowCards: stats?.avgYellowCards ?? 0,
        avgRedCards: stats?.avgRedCards ?? 0,
        avgPenalties: stats?.avgPenalties ?? 0,
        strictnessIndex: stats?.strictnessIndex ?? 0,
        leagueId: league?.id,
        leagueName: league?.name,
      };
    });
  } catch (error) {
    console.error('Error fetching referees:', error);
    return [];
  }
}

async function getLeagues(): Promise<LeagueFilter[]> {
  try {
    const leagues = await prisma.league.findMany({
      orderBy: { name: 'asc' },
    });

    return leagues.map((league) => ({
      id: league.id,
      name: league.name,
    }));
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return [];
  }
}

export default async function RefereesPage() {
  const [referees, leagues] = await Promise.all([
    getReferees(),
    getLeagues(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Referees</h1>
          <p className="text-muted-foreground mt-2">
            Browse and compare referee statistics across Europe&apos;s top leagues
          </p>
        </div>

        <RefereeDataTable referees={referees} leagues={leagues} />
      </div>
    </div>
  );
}
