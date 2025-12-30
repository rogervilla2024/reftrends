import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Leagues',
  description: 'Explore referee statistics across Europe\'s top 5 football leagues: Premier League, La Liga, Serie A, Bundesliga, and Ligue 1. Compare discipline ratings and card averages.',
  openGraph: {
    title: 'Leagues - RefStats',
    description: 'Explore referee statistics across Europe\'s top 5 football leagues.',
    url: 'https://refstats.com/leagues',
  },
  twitter: {
    title: 'Leagues - RefStats',
    description: 'Explore referee statistics across Europe\'s top 5 football leagues.',
  },
  alternates: {
    canonical: 'https://refstats.com/leagues',
  },
};

const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

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

const defaultLeagues = [
  { apiId: 39, name: 'Premier League', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { apiId: 140, name: 'La Liga', country: 'Spain', flag: '🇪🇸' },
  { apiId: 135, name: 'Serie A', country: 'Italy', flag: '🇮🇹' },
  { apiId: 78, name: 'Bundesliga', country: 'Germany', flag: '🇩🇪' },
  { apiId: 61, name: 'Ligue 1', country: 'France', flag: '🇫🇷' },
];

export default async function LeaguesPage() {
  const leagues = await getLeagues();

  // Merge database leagues with default leagues
  const displayLeagues = defaultLeagues.map((defaultLeague) => {
    const dbLeague = leagues.find((l) => l.apiId === defaultLeague.apiId);
    return {
      ...defaultLeague,
      id: dbLeague?.id || defaultLeague.apiId,
      logo: dbLeague?.logo || null,
      season: dbLeague?.season || 2025,
      matchCount: dbLeague?.matchCount || 0,
      refereeCount: dbLeague?.refereeCount || 0,
      avgYellowCards: dbLeague?.avgYellowCards || 0,
      avgRedCards: dbLeague?.avgRedCards || 0,
    };
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Leagues</h1>
        <p className="text-muted-foreground mt-2">
          Explore referee statistics across Europe&apos;s top 5 leagues
        </p>
      </div>

      {/* League Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayLeagues.map((league) => (
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
                    <span className="text-3xl">{league.flag}</span>
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
                    <div className="text-xs text-muted-foreground">Avg Yellow/Match</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-red-500">
                      {league.avgRedCards.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">Avg Red/Match</div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <span className="text-sm text-muted-foreground">
                    Season {league.season - 1}/{league.season.toString().slice(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* League Comparison Section */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6">League Comparison</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">League</th>
                    <th className="text-center py-3 px-4">Matches</th>
                    <th className="text-center py-3 px-4">Referees</th>
                    <th className="text-center py-3 px-4">Avg Yellow</th>
                    <th className="text-center py-3 px-4">Avg Red</th>
                    <th className="text-center py-3 px-4">Discipline Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {displayLeagues
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
                              <span className="text-lg">{league.flag}</span>
                              <span className="font-medium">{league.name}</span>
                            </div>
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
              Discipline Rating = (Avg Yellow × 1) + (Avg Red × 3). Higher = stricter officiating.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
