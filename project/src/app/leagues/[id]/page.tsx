import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LeagueRefereeTable, type RefereeRanking as LeagueRefereeRankingType } from '@/components/LeagueRefereeTable';
import { formatSeason, getCurrentSeason } from '@/lib/season';
import { LEAGUE_INFO } from '@/lib/api-football';
import prisma from '@/lib/db';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const apiId = parseInt(params.id, 10);
  const info = LEAGUE_INFO[apiId];

  if (!info) {
    return { title: 'League Not Found' };
  }

  const typeLabel = info.type === 'cup' ? 'tournament' : 'league';

  return {
    title: info.name,
    description: `${info.name} referee statistics: rankings, card averages, strictness indices, and match history for this ${info.country} ${typeLabel}.`,
    openGraph: {
      title: `${info.name} - RefTrends`,
      description: `Referee statistics and rankings for ${info.name}.`,
      url: `https://reftrends.com/leagues/${apiId}`,
    },
    twitter: {
      title: `${info.name} - RefTrends`,
      description: `Referee statistics and rankings for ${info.name}.`,
    },
    alternates: {
      canonical: `https://reftrends.com/leagues/${apiId}`,
    },
  };
}

interface LeagueData {
  id: number;
  apiId: number;
  name: string;
  country: string;
  logo: string | null;
  season: number;
}

// Using LeagueRefereeRankingType from component

interface FixtureData {
  id: number;
  date: Date;
  status: string;
  homeTeam: { name: string; logo: string | null };
  awayTeam: { name: string; logo: string | null };
  homeGoals: number | null;
  awayGoals: number | null;
  referee: { name: string; slug: string } | null;
  stats: {
    yellowCards: number;
    redCards: number;
  } | null;
}

async function getLeague(apiId: number): Promise<LeagueData | null> {
  try {
    const league = await prisma.league.findFirst({
      where: { apiId },
    });
    return league;
  } catch (error) {
    console.error('Error fetching league:', error);
    return null;
  }
}

async function getRefereeRankings(leagueApiId: number): Promise<LeagueRefereeRankingType[]> {
  try {

    // Get stats for current season first, then fallback to any season
    const stats = await prisma.refereeSeasonStats.findMany({
      where: { leagueApiId },
      include: {
        referee: true,
      },
      orderBy: [{ season: 'desc' }, { matchesOfficiated: 'desc' }],
    });

    // Group by referee and get latest season stats
    const refereeMap = new Map<number, LeagueRefereeRankingType>();
    stats.forEach((stat) => {
      if (!refereeMap.has(stat.refereeId)) {
        refereeMap.set(stat.refereeId, {
          id: stat.referee.id,
          name: stat.referee.name,
          slug: stat.referee.slug,
          photo: stat.referee.photo,
          matchesOfficiated: stat.matchesOfficiated,
          avgYellowCards: stat.avgYellowCards,
          avgRedCards: stat.avgRedCards,
          totalYellowCards: stat.totalYellowCards,
          totalRedCards: stat.totalRedCards,
          strictnessIndex: stat.strictnessIndex,
        });
      }
    });

    return Array.from(refereeMap.values())
      .sort((a, b) => b.matchesOfficiated - a.matchesOfficiated);
  } catch (error) {
    console.error('Error fetching referee rankings:', error);
    return [];
  }
}

async function getFixtures(leagueId: number): Promise<FixtureData[]> {
  try {

    const fixtures = await prisma.match.findMany({
      where: { leagueId },
      include: {
        homeTeam: true,
        awayTeam: true,
        referee: true,
        stats: true,
      },
      orderBy: { date: 'desc' },
      take: 50,
    });

    return fixtures.map((f) => ({
      id: f.id,
      date: f.date,
      status: f.status,
      homeTeam: { name: f.homeTeam.name, logo: f.homeTeam.logo },
      awayTeam: { name: f.awayTeam.name, logo: f.awayTeam.logo },
      homeGoals: f.homeGoals,
      awayGoals: f.awayGoals,
      referee: f.referee ? { name: f.referee.name, slug: f.referee.slug } : null,
      stats: f.stats
        ? { yellowCards: f.stats.yellowCards, redCards: f.stats.redCards }
        : null,
    }));
  } catch (error) {
    console.error('Error fetching fixtures:', error);
    return [];
  }
}

async function getLeagueStats(leagueId: number) {
  try {
    const matches = await prisma.match.findMany({
      where: {
        leagueId,
        OR: [{ status: 'FT' }, { status: 'Match Finished' }],
      },
      include: {
        stats: true,
        referee: true,
      },
    });

    const matchesWithStats = matches.filter((m) => m.stats);
    const totalMatches = matchesWithStats.length;
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
    const totalGoals = matches.reduce(
      (sum, m) => sum + (m.homeGoals || 0) + (m.awayGoals || 0),
      0
    );

    const uniqueReferees = new Set(matches.filter((m) => m.refereeId).map((m) => m.refereeId));

    return {
      totalMatches,
      totalYellow,
      totalRed,
      totalPenalties,
      totalGoals,
      refereeCount: uniqueReferees.size,
      avgYellowPerMatch: totalMatches > 0 ? totalYellow / totalMatches : 0,
      avgRedPerMatch: totalMatches > 0 ? totalRed / totalMatches : 0,
      avgGoalsPerMatch: totalMatches > 0 ? totalGoals / totalMatches : 0,
    };
  } catch (error) {
    console.error('Error fetching league stats:', error);
    return {
      totalMatches: 0,
      totalYellow: 0,
      totalRed: 0,
      totalPenalties: 0,
      totalGoals: 0,
      refereeCount: 0,
      avgYellowPerMatch: 0,
      avgRedPerMatch: 0,
      avgGoalsPerMatch: 0,
    };
  }
}

export default async function LeagueDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const apiId = parseInt(params.id, 10);
  const info = LEAGUE_INFO[apiId];

  if (!info) {
    notFound();
  }

  const league = await getLeague(apiId);
  const [refereeRankings, stats] = await Promise.all([
    getRefereeRankings(apiId),
    league ? getLeagueStats(league.id) : Promise.resolve({
      totalMatches: 0,
      totalYellow: 0,
      totalRed: 0,
      totalPenalties: 0,
      totalGoals: 0,
      refereeCount: 0,
      avgYellowPerMatch: 0,
      avgRedPerMatch: 0,
      avgGoalsPerMatch: 0,
    }),
  ]);

  const fixtures = league ? await getFixtures(league.id) : [];

  // Upcoming fixtures: future matches only
  const upcomingFixtures = fixtures.filter(
    (f) => new Date(f.date) > new Date() && f.status !== 'FT' && f.status !== 'Match Finished'
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Recent results: completed matches
  const recentResults = fixtures.filter(
    (f) => f.status === 'FT' || f.status === 'Match Finished'
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* League Header */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
        <div className="w-24 h-24 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
          {league?.logo ? (
            <Image
              src={league.logo}
              alt={info.name}
              width={80}
              height={80}
              className="object-contain"
            />
          ) : (
            <span className="text-5xl">{info.flag}</span>
          )}
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold">{info.name}</h1>
          <p className="text-lg text-muted-foreground">{info.country}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Season {formatSeason(getCurrentSeason())}
          </p>
        </div>
      </div>

      {/* League Stats Overview */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Season Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary">
                {stats.totalMatches}
              </div>
              <div className="text-sm font-medium">Matches</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary">
                {stats.refereeCount}
              </div>
              <div className="text-sm font-medium">Referees</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-yellow-500">
                {stats.avgYellowPerMatch.toFixed(2)}
              </div>
              <div className="text-sm font-medium">Avg Yellow/Match</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-red-500">
                {stats.avgRedPerMatch.toFixed(2)}
              </div>
              <div className="text-sm font-medium">Avg Red/Match</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-500">
                {stats.avgGoalsPerMatch.toFixed(2)}
              </div>
              <div className="text-sm font-medium">Avg Goals/Match</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Referee Rankings */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Referee Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <LeagueRefereeTable referees={refereeRankings} />
          </CardContent>
        </Card>
      </section>

      {/* Upcoming Fixtures */}
      {upcomingFixtures.length > 0 && (
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Fixtures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingFixtures.slice(0, 10).map((fixture) => (
                  <div
                    key={fixture.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-center w-16">
                        <div className="text-sm font-medium">
                          {new Date(fixture.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(fixture.date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        {fixture.homeTeam.logo && (
                          <Image
                            src={fixture.homeTeam.logo}
                            alt={fixture.homeTeam.name}
                            width={24}
                            height={24}
                            className="rounded"
                          />
                        )}
                        <span className="font-medium">{fixture.homeTeam.name}</span>
                        <span className="text-muted-foreground mx-2">vs</span>
                        <span className="font-medium">{fixture.awayTeam.name}</span>
                        {fixture.awayTeam.logo && (
                          <Image
                            src={fixture.awayTeam.logo}
                            alt={fixture.awayTeam.name}
                            width={24}
                            height={24}
                            className="rounded"
                          />
                        )}
                      </div>
                    </div>
                    {fixture.referee && (
                      <Link
                        href={`/referees/${fixture.referee.slug}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {fixture.referee.name}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Recent Results */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Results</CardTitle>
          </CardHeader>
          <CardContent>
            {recentResults.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Match</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Yellow</TableHead>
                    <TableHead className="text-center">Red</TableHead>
                    <TableHead>Referee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentResults.slice(0, 15).map((fixture) => (
                    <TableRow key={fixture.id}>
                      <TableCell className="text-muted-foreground">
                        {new Date(fixture.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {fixture.homeTeam.logo && (
                            <Image
                              src={fixture.homeTeam.logo}
                              alt={fixture.homeTeam.name}
                              width={20}
                              height={20}
                              className="rounded"
                            />
                          )}
                          <span>{fixture.homeTeam.name}</span>
                          <span className="text-muted-foreground">vs</span>
                          <span>{fixture.awayTeam.name}</span>
                          {fixture.awayTeam.logo && (
                            <Image
                              src={fixture.awayTeam.logo}
                              alt={fixture.awayTeam.name}
                              width={20}
                              height={20}
                              className="rounded"
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {fixture.homeGoals} - {fixture.awayGoals}
                      </TableCell>
                      <TableCell className="text-center">
                        {fixture.stats ? (
                          <span className="text-yellow-500">
                            {fixture.stats.yellowCards}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {fixture.stats ? (
                          <span className="text-red-500">
                            {fixture.stats.redCards}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {fixture.referee ? (
                          <Link
                            href={`/referees/${fixture.referee.slug}`}
                            className="text-primary hover:underline"
                          >
                            {fixture.referee.name}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No match results available yet.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Back Link */}
      <div className="mt-8">
        <Link
          href="/leagues"
          className="text-primary hover:underline inline-flex items-center gap-2"
        >
          ← Back to Leagues
        </Link>
      </div>
    </div>
  );
}
