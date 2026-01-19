import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LEAGUE_INFO } from '@/lib/api-football';
import { formatSeason, getCurrentSeason } from '@/lib/season';
import prisma from '@/lib/db';

const LeagueComparisonDashboard = dynamic(
  () => import('@/components/LeagueComparisonDashboard'),
  {
    loading: () => <div className="h-96 flex items-center justify-center text-muted-foreground">Loading dashboard...</div>,
    ssr: false,
  }
);

export const metadata: Metadata = {
  title: 'Leagues & Tournaments',
  description: 'Explore referee statistics across top football leagues and tournaments: Premier League, La Liga, Serie A, Bundesliga, Ligue 1, UEFA Champions League, World Cup, and more.',
  openGraph: {
    title: 'Leagues & Tournaments - RefTrends',
    description: 'Explore referee statistics across top football leagues and international tournaments.',
    url: 'https://reftrends.com/leagues',
  },
  twitter: {
    title: 'Leagues & Tournaments - RefTrends',
    description: 'Explore referee statistics across top football leagues and international tournaments.',
  },
  alternates: {
    canonical: 'https://reftrends.com/leagues',
  },
};

interface LeagueWithStats {
  id: number;
  apiId: number;
  name: string;
  country: string;
  logo: string | null;
  season: number;
  matchCount: number;
  refereeCount: number;
  avgYellowCards: number;
  avgRedCards: number;
  avgPenalties: number;
  avgFouls: number;
  strictnessIndex: number;
}

async function getLeagues(): Promise<LeagueWithStats[]> {
  try {
    const leagues = await prisma.league.findMany({
      include: {
        matches: {
          include: {
            stats: true,
            referee: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return leagues.map((league) => {
      const completedMatches = league.matches.filter(
        (m) => m.status === 'FT' || m.status === 'Match Finished'
      );
      const matchesWithStats = completedMatches.filter((m) => m.stats);

      const totalYellow = matchesWithStats.reduce(
        (sum, m) => sum + (m.stats?.yellowCards || 0),
        0
      );
      const totalRed = matchesWithStats.reduce(
        (sum, m) => sum + (m.stats?.redCards || 0),
        0
      );
      const totalPenalties = matchesWithStats.reduce(
        (sum, m) => sum + (m.stats?.penalties || 0),
        0
      );
      const totalFouls = matchesWithStats.reduce(
        (sum, m) => sum + (m.stats?.fouls || 0),
        0
      );

      const uniqueReferees = new Set(
        league.matches.filter((m) => m.refereeId).map((m) => m.refereeId)
      );

      const avgYellowCards = matchesWithStats.length > 0 ? totalYellow / matchesWithStats.length : 0;
      const avgRedCards = matchesWithStats.length > 0 ? totalRed / matchesWithStats.length : 0;
      const avgPenalties = matchesWithStats.length > 0 ? totalPenalties / matchesWithStats.length : 0;
      const avgFouls = matchesWithStats.length > 0 ? totalFouls / matchesWithStats.length : 0;

      // Calculate strictness index: weighted combination of cards
      const strictnessIndex = avgYellowCards * 1 + avgRedCards * 3;

      return {
        id: league.id,
        apiId: league.apiId,
        name: league.name,
        country: league.country,
        logo: league.logo,
        season: league.season,
        matchCount: completedMatches.length,
        refereeCount: uniqueReferees.size,
        avgYellowCards,
        avgRedCards,
        avgPenalties,
        avgFouls,
        strictnessIndex,
      };
    });
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return [];
  }
}

// Convert LEAGUE_INFO to array for display
const allLeagues = Object.entries(LEAGUE_INFO).map(([apiId, info]) => ({
  apiId: parseInt(apiId),
  ...info,
}));

const domesticLeagues = allLeagues.filter(l => l.type === 'league');
const tournaments = allLeagues.filter(l => l.type === 'cup');

export default async function LeaguesPage() {
  const dbLeagues = await getLeagues();
  const currentSeason = getCurrentSeason();

  // Helper to merge db data with league info
  const getLeagueData = (apiId: number) => {
    const info = LEAGUE_INFO[apiId];
    const dbLeague = dbLeagues.find((l) => l.apiId === apiId);
    return {
      apiId,
      name: info?.name || 'Unknown',
      country: info?.country || '',
      type: info?.type || 'league',
      logo: dbLeague?.logo || null,
      season: dbLeague?.season || currentSeason,
      matchCount: dbLeague?.matchCount || 0,
      refereeCount: dbLeague?.refereeCount || 0,
      avgYellowCards: dbLeague?.avgYellowCards || 0,
      avgRedCards: dbLeague?.avgRedCards || 0,
      avgPenalties: dbLeague?.avgPenalties || 0,
      avgFouls: dbLeague?.avgFouls || 0,
      strictnessIndex: dbLeague?.strictnessIndex || 0,
    };
  };

  const displayDomesticLeagues = domesticLeagues.map(l => getLeagueData(l.apiId));
  const displayTournaments = tournaments.map(l => getLeagueData(l.apiId));
  const allDisplayLeagues = [...displayDomesticLeagues, ...displayTournaments];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Leagues & Tournaments</h1>
        <p className="text-muted-foreground mt-2">
          Explore referee statistics across domestic leagues and international tournaments
        </p>
      </div>

      {/* Domestic Leagues */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Domestic Leagues</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayDomesticLeagues.map((league) => (
            <Link key={league.apiId} href={`/leagues/${league.apiId}`}>
              <Card className="hover:border-primary transition-all cursor-pointer h-full hover:shadow-lg">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {league.logo ? (
                      <Image
                        src={league.logo}
                        alt={league.name}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-primary">
                        {league.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{league.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {league.country}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {league.matchCount}
                      </div>
                      <div className="text-xs text-muted-foreground">Matches</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {league.refereeCount}
                      </div>
                      <div className="text-xs text-muted-foreground">Referees</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-yellow-500">
                        {league.avgYellowCards.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">Avg Yellow</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-red-500">
                        {league.avgRedCards.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">Avg Red</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <span className="text-sm text-muted-foreground">
                      Season {formatSeason(currentSeason)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* UEFA/FIFA Tournaments */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">International Tournaments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTournaments.map((tournament) => (
            <Link key={tournament.apiId} href={`/leagues/${tournament.apiId}`}>
              <Card className="hover:border-primary transition-all cursor-pointer h-full hover:shadow-lg border-primary/20">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
                    {tournament.logo ? (
                      <Image
                        src={tournament.logo}
                        alt={tournament.name}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    ) : (
                      <span className="text-2xl">🏆</span>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{tournament.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {tournament.country}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {tournament.matchCount}
                      </div>
                      <div className="text-xs text-muted-foreground">Matches</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {tournament.refereeCount}
                      </div>
                      <div className="text-xs text-muted-foreground">Referees</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-yellow-500">
                        {tournament.avgYellowCards.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">Avg Yellow</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-red-500">
                        {tournament.avgRedCards.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">Avg Red</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* League Comparison Dashboard */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6">League Comparison Dashboard</h2>
        <LeagueComparisonDashboard
          leagues={allDisplayLeagues.map(l => ({
            apiId: l.apiId,
            name: l.name,
            country: l.country,
            logo: l.logo,
            matchCount: l.matchCount,
            refereeCount: l.refereeCount,
            avgYellowCards: l.avgYellowCards,
            avgRedCards: l.avgRedCards,
            avgPenalties: l.avgPenalties,
            avgFouls: l.avgFouls,
            strictnessIndex: l.strictnessIndex,
          }))}
        />
      </section>
    </div>
  );
}
