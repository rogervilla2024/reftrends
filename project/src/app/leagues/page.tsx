import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LEAGUE_INFO } from '@/lib/api-football';
import { formatSeason, getCurrentSeason } from '@/lib/season';
import prisma from '@/lib/db';

export const metadata: Metadata = {
  title: 'Leagues & Tournaments',
  description: 'Explore referee statistics across top football leagues and tournaments: Premier League, La Liga, Serie A, Bundesliga, Ligue 1, UEFA Champions League, World Cup, and more.',
  openGraph: {
    title: 'Leagues & Tournaments - RefStats',
    description: 'Explore referee statistics across top football leagues and international tournaments.',
    url: 'https://refstats.com/leagues',
  },
  twitter: {
    title: 'Leagues & Tournaments - RefStats',
    description: 'Explore referee statistics across top football leagues and international tournaments.',
  },
  alternates: {
    canonical: 'https://refstats.com/leagues',
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

      const uniqueReferees = new Set(
        league.matches.filter((m) => m.refereeId).map((m) => m.refereeId)
      );

      return {
        id: league.id,
        apiId: league.apiId,
        name: league.name,
        country: league.country,
        logo: league.logo,
        season: league.season,
        matchCount: completedMatches.length,
        refereeCount: uniqueReferees.size,
        avgYellowCards:
          matchesWithStats.length > 0 ? totalYellow / matchesWithStats.length : 0,
        avgRedCards:
          matchesWithStats.length > 0 ? totalRed / matchesWithStats.length : 0,
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

      {/* League Comparison Section */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6">League Comparison</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Competition</th>
                    <th className="text-center py-3 px-4">Type</th>
                    <th className="text-center py-3 px-4">Matches</th>
                    <th className="text-center py-3 px-4">Referees</th>
                    <th className="text-center py-3 px-4">Avg Yellow</th>
                    <th className="text-center py-3 px-4">Avg Red</th>
                    <th className="text-center py-3 px-4">Discipline</th>
                  </tr>
                </thead>
                <tbody>
                  {allDisplayLeagues
                    .filter(l => l.matchCount > 0)
                    .sort((a, b) => b.avgYellowCards - a.avgYellowCards)
                    .map((league, index) => {
                      const disciplineRating = (
                        league.avgYellowCards * 1 +
                        league.avgRedCards * 3
                      ).toFixed(2);
                      return (
                        <tr key={league.apiId} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                #{index + 1}
                              </span>
                              <span className="font-medium">{league.name}</span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              league.type === 'cup'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted'
                            }`}>
                              {league.type === 'cup' ? 'Tournament' : 'League'}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">{league.matchCount}</td>
                          <td className="text-center py-3 px-4">{league.refereeCount}</td>
                          <td className="text-center py-3 px-4">
                            <span className="text-yellow-500 font-medium">
                              {league.avgYellowCards.toFixed(2)}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className="text-red-500 font-medium">
                              {league.avgRedCards.toFixed(2)}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className="font-bold text-primary">
                              {disciplineRating}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Discipline Rating = (Avg Yellow x 1) + (Avg Red x 3). Higher = stricter officiating.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
