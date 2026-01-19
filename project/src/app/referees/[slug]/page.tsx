import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatSeason } from '@/lib/season';
import prisma from '@/lib/db';

// Dynamic imports for chart components (reduces initial bundle size)
const RefereeStatsChart = dynamic(() => import('@/components/RefereeStatsChart'), {
  loading: () => <div className="h-[500px] flex items-center justify-center text-muted-foreground">Loading chart...</div>,
  ssr: false,
});

const RefereeStatsCards = dynamic(() => import('@/components/RefereeStatsCards'), {
  loading: () => <div className="h-32 flex items-center justify-center text-muted-foreground">Loading stats...</div>,
});

const CardHeatmap = dynamic(() => import('@/components/CardHeatmap'), {
  loading: () => <div className="h-64 flex items-center justify-center text-muted-foreground">Loading heatmap...</div>,
});

const RefereeTimeline = dynamic(() => import('@/components/RefereeTimeline'), {
  loading: () => <div className="h-64 flex items-center justify-center text-muted-foreground">Loading timeline...</div>,
});

const SeasonComparisonChart = dynamic(() => import('@/components/SeasonComparisonChart'), {
  loading: () => <div className="h-80 flex items-center justify-center text-muted-foreground">Loading chart...</div>,
  ssr: false,
});

const DetailedFormAnalysis = dynamic(
  () => import('@/components/RefereeFormIndicator').then(mod => ({ default: mod.DetailedFormAnalysis })),
  { loading: () => <div className="h-64 flex items-center justify-center text-muted-foreground">Loading form...</div> }
);

// Betting Analysis Components
const OddsComparison = dynamic(() => import('@/components/OddsComparison'), {
  loading: () => <div className="h-64 flex items-center justify-center text-muted-foreground">Loading odds...</div>,
});

const UpcomingMatchPrediction = dynamic(() => import('@/components/UpcomingMatchPrediction'), {
  loading: () => <div className="h-64 flex items-center justify-center text-muted-foreground">Loading prediction...</div>,
});

const HotColdStreaks = dynamic(() => import('@/components/HotColdStreaks'), {
  loading: () => <div className="h-64 flex items-center justify-center text-muted-foreground">Loading streaks...</div>,
});

const TeamCardProbabilities = dynamic(() => import('@/components/TeamCardProbabilities'), {
  loading: () => <div className="h-64 flex items-center justify-center text-muted-foreground">Loading probabilities...</div>,
});

const RefereeRating = dynamic(() => import('@/components/RefereeRating'), {
  loading: () => <div className="h-48 flex items-center justify-center text-muted-foreground">Loading ratings...</div>,
});

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const referee = await prisma.referee.findUnique({
    where: { slug: params.slug },
    include: { seasonStats: { take: 1, orderBy: { season: 'desc' } } },
  });

  if (!referee) {
    return { title: 'Referee Not Found' };
  }

  const stats = referee.seasonStats[0];
  const description = stats
    ? `${referee.name} statistics: ${stats.matchesOfficiated} matches, ${stats.avgYellowCards.toFixed(2)} yellow cards/match, strictness index ${stats.strictnessIndex.toFixed(1)}.`
    : `View ${referee.name}'s referee statistics, card history, and match analysis.`;

  return {
    title: referee.name,
    description,
    openGraph: {
      title: `${referee.name} - Referee Statistics`,
      description,
      type: 'profile',
      url: `https://reftrends.com/referees/${referee.slug}`,
    },
    twitter: {
      title: `${referee.name} - RefTrends`,
      description,
    },
    alternates: {
      canonical: `https://reftrends.com/referees/${referee.slug}`,
    },
  };
}

interface RefereeData {
  id: number;
  name: string;
  nationality: string | null;
  photo: string | null;
  slug: string;
  seasonStats: {
    id: number;
    season: number;
    leagueApiId: number;
    matchesOfficiated: number;
    totalYellowCards: number;
    totalRedCards: number;
    avgYellowCards: number;
    avgRedCards: number;
    totalPenalties: number;
    avgPenalties: number;
    totalFouls: number;
    avgFouls: number;
    strictnessIndex: number;
    homeBiasScore: number;
  }[];
  matches: {
    id: number;
    date: Date;
    venue: string | null;
    status: string;
    homeGoals: number | null;
    awayGoals: number | null;
    season: number;
    homeTeam: { id: number; name: string; logo: string | null };
    awayTeam: { id: number; name: string; logo: string | null };
    league: { id: number; name: string; logo: string | null };
    stats: {
      yellowCards: number;
      redCards: number;
      fouls: number;
      penalties: number;
      homeYellowCards: number;
      awayYellowCards: number;
      homeRedCards: number;
      awayRedCards: number;
      cardEvents: {
        id: number;
        minute: number;
        type: string;
      }[];
    } | null;
  }[];
}

async function getReferee(slug: string): Promise<RefereeData | null> {
  try {
    const referee = await prisma.referee.findUnique({
      where: { slug },
      include: {
        seasonStats: {
          orderBy: { season: 'desc' },
        },
        matches: {
          include: {
            homeTeam: true,
            awayTeam: true,
            league: true,
            stats: {
              include: {
                cardEvents: {
                  select: {
                    id: true,
                    minute: true,
                    type: true,
                  },
                },
              },
            },
          },
          orderBy: { date: 'desc' },
          take: 50,
        },
      },
    });

    return referee;
  } catch (error) {
    console.error('Error fetching referee:', error);
    return null;
  }
}

interface LeagueMap {
  [key: number]: { name: string; logo: string | null };
}

async function getLeagueMap(): Promise<LeagueMap> {
  try {
    const leagues = await prisma.league.findMany();
    return leagues.reduce((acc, league) => {
      acc[league.apiId] = { name: league.name, logo: league.logo };
      return acc;
    }, {} as LeagueMap);
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return {};
  }
}

function getStrictnessLabel(index: number): { label: string; color: string } {
  if (index >= 8) return { label: 'Very Strict', color: 'text-red-500' };
  if (index >= 6) return { label: 'Strict', color: 'text-orange-500' };
  if (index >= 4) return { label: 'Average', color: 'text-yellow-500' };
  if (index >= 2) return { label: 'Lenient', color: 'text-green-500' };
  return { label: 'Very Lenient', color: 'text-emerald-500' };
}

export default async function RefereeProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const [referee, leagueMap] = await Promise.all([
    getReferee(params.slug),
    getLeagueMap(),
  ]);

  if (!referee) {
    notFound();
  }

  const currentStats = referee.seasonStats[0];
  const strictness = currentStats
    ? getStrictnessLabel(currentStats.strictnessIndex)
    : { label: 'Unknown', color: 'text-muted-foreground' };

  // Calculate career totals
  const careerStats = referee.seasonStats.reduce(
    (acc, stat) => ({
      matches: acc.matches + stat.matchesOfficiated,
      yellowCards: acc.yellowCards + stat.totalYellowCards,
      redCards: acc.redCards + stat.totalRedCards,
      penalties: acc.penalties + stat.totalPenalties,
    }),
    { matches: 0, yellowCards: 0, redCards: 0, penalties: 0 }
  );

  // Get recent completed matches
  const recentMatches = referee.matches
    .filter((match) => match.status === 'FT' || match.status === 'Match Finished')
    .slice(0, 10);

  // Calculate team-specific stats
  const teamStats = new Map<
    number,
    {
      teamId: number;
      teamName: string;
      teamLogo: string | null;
      matches: number;
      yellowCards: number;
      redCards: number;
      wins: number;
      losses: number;
      draws: number;
    }
  >();

  referee.matches.forEach((match) => {
    if (!match.stats || match.homeGoals === null || match.awayGoals === null) return;

    // Home team stats
    const homeTeam = teamStats.get(match.homeTeam.id) || {
      teamId: match.homeTeam.id,
      teamName: match.homeTeam.name,
      teamLogo: match.homeTeam.logo,
      matches: 0,
      yellowCards: 0,
      redCards: 0,
      wins: 0,
      losses: 0,
      draws: 0,
    };
    homeTeam.matches++;
    homeTeam.yellowCards += match.stats.homeYellowCards;
    homeTeam.redCards += match.stats.homeRedCards;
    if (match.homeGoals > match.awayGoals) homeTeam.wins++;
    else if (match.homeGoals < match.awayGoals) homeTeam.losses++;
    else homeTeam.draws++;
    teamStats.set(match.homeTeam.id, homeTeam);

    // Away team stats
    const awayTeam = teamStats.get(match.awayTeam.id) || {
      teamId: match.awayTeam.id,
      teamName: match.awayTeam.name,
      teamLogo: match.awayTeam.logo,
      matches: 0,
      yellowCards: 0,
      redCards: 0,
      wins: 0,
      losses: 0,
      draws: 0,
    };
    awayTeam.matches++;
    awayTeam.yellowCards += match.stats.awayYellowCards;
    awayTeam.redCards += match.stats.awayRedCards;
    if (match.awayGoals > match.homeGoals) awayTeam.wins++;
    else if (match.awayGoals < match.homeGoals) awayTeam.losses++;
    else awayTeam.draws++;
    teamStats.set(match.awayTeam.id, awayTeam);
  });

  const teamStatsArray = Array.from(teamStats.values())
    .filter((t) => t.matches >= 2)
    .sort((a, b) => b.matches - a.matches)
    .slice(0, 10);

  // Prepare chart data - cards per match by season
  const chartData = referee.seasonStats
    .map((stat) => ({
      season: formatSeason(stat.season),
      yellowCards: stat.avgYellowCards,
      redCards: stat.avgRedCards,
      penalties: stat.avgPenalties,
      matches: stat.matchesOfficiated,
      league: leagueMap[stat.leagueApiId]?.name || 'Unknown',
    }))
    .reverse();

  // Collect all card events for heatmap
  const cardEvents = referee.matches
    .flatMap((match) =>
      match.stats?.cardEvents?.map((event) => ({
        minute: event.minute,
        type: event.type as 'yellow' | 'red',
      })) ?? []
    );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-shrink-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-muted overflow-hidden border-4 border-primary/20">
            {referee.photo ? (
              <Image
                src={referee.photo}
                alt={referee.name}
                width={160}
                height={160}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground">
                {referee.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{referee.name}</h1>
          {referee.nationality && (
            <p className="text-lg text-muted-foreground mb-4">
              {referee.nationality}
            </p>
          )}
          <div className="flex flex-wrap gap-4">
            <div className="bg-muted px-4 py-2 rounded-lg">
              <span className="text-sm text-muted-foreground">Strictness</span>
              <p className={`font-semibold ${strictness.color}`}>
                {strictness.label}
              </p>
            </div>
            {currentStats && (
              <>
                <div className="bg-muted px-4 py-2 rounded-lg">
                  <span className="text-sm text-muted-foreground">Current Season</span>
                  <p className="font-semibold">
                    {formatSeason(currentStats.season)}
                  </p>
                </div>
                <div className="bg-muted px-4 py-2 rounded-lg">
                  <span className="text-sm text-muted-foreground">League</span>
                  <p className="font-semibold">
                    {leagueMap[currentStats.leagueApiId]?.name || 'Unknown'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      {currentStats && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Current Season Statistics</h2>
          <RefereeStatsCards
            stats={{
              avgYellowCards: currentStats.avgYellowCards,
              avgRedCards: currentStats.avgRedCards,
              avgPenalties: currentStats.avgPenalties,
              strictnessIndex: currentStats.strictnessIndex,
              homeBiasScore: currentStats.homeBiasScore,
              matchesOfficiated: currentStats.matchesOfficiated,
              previousSeasonStrictness: referee.seasonStats[1]?.strictnessIndex,
            }}
            refereeName={referee.name}
          />
        </section>
      )}

      {/* Career Totals */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Career Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary">{careerStats.matches}</div>
              <div className="text-sm font-medium">Matches</div>
              <div className="text-xs text-muted-foreground">Career total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-yellow-500">{careerStats.yellowCards}</div>
              <div className="text-sm font-medium">Yellow Cards</div>
              <div className="text-xs text-muted-foreground">
                {careerStats.matches > 0
                  ? `${(careerStats.yellowCards / careerStats.matches).toFixed(2)} per match`
                  : 'N/A'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-red-500">{careerStats.redCards}</div>
              <div className="text-sm font-medium">Red Cards</div>
              <div className="text-xs text-muted-foreground">
                {careerStats.matches > 0
                  ? `${(careerStats.redCards / careerStats.matches).toFixed(2)} per match`
                  : 'N/A'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-blue-500">{careerStats.penalties}</div>
              <div className="text-sm font-medium">Penalties</div>
              <div className="text-xs text-muted-foreground">
                {careerStats.matches > 0
                  ? `${(careerStats.penalties / careerStats.matches).toFixed(2)} per match`
                  : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Community Rating */}
      <section className="mb-8">
        <RefereeRating refereeId={referee.id} refereeName={referee.name} />
      </section>

      {/* Season Statistics Table */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Season Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {referee.seasonStats.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Season</TableHead>
                    <TableHead>League</TableHead>
                    <TableHead className="text-center">Matches</TableHead>
                    <TableHead className="text-center">Yellow Cards</TableHead>
                    <TableHead className="text-center">Red Cards</TableHead>
                    <TableHead className="text-center">Penalties</TableHead>
                    <TableHead className="text-center">Strictness</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referee.seasonStats.map((stat) => {
                    const seasonStrictness = getStrictnessLabel(stat.strictnessIndex);
                    return (
                      <TableRow key={stat.id}>
                        <TableCell className="font-medium">
                          {formatSeason(stat.season)}
                        </TableCell>
                        <TableCell>
                          {leagueMap[stat.leagueApiId]?.name || 'Unknown'}
                        </TableCell>
                        <TableCell className="text-center">{stat.matchesOfficiated}</TableCell>
                        <TableCell className="text-center">
                          <span className="text-yellow-500">{stat.totalYellowCards}</span>
                          <span className="text-muted-foreground text-xs ml-1">
                            ({stat.avgYellowCards.toFixed(2)})
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-red-500">{stat.totalRedCards}</span>
                          <span className="text-muted-foreground text-xs ml-1">
                            ({stat.avgRedCards.toFixed(2)})
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {stat.totalPenalties}
                          <span className="text-muted-foreground text-xs ml-1">
                            ({stat.avgPenalties.toFixed(2)})
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={seasonStrictness.color}>
                            {stat.strictnessIndex.toFixed(1)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No season statistics available yet.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Cards Over Time Chart */}
      {chartData.length > 0 && (
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Cards Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <RefereeStatsChart data={chartData} />
            </CardContent>
          </Card>
        </section>
      )}

      {/* Referee Form Analysis */}
      {recentMatches.length >= 3 && currentStats && (
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Current Form (Last 5 Matches)</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailedFormAnalysis
                matches={recentMatches.slice(0, 5).map(m => ({
                  yellowCards: m.stats?.yellowCards || 0,
                  redCards: m.stats?.redCards || 0,
                  date: new Date(m.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  }),
                  teams: `${m.homeTeam.name} vs ${m.awayTeam.name}`,
                }))}
                seasonAvg={currentStats.avgYellowCards + currentStats.avgRedCards}
                refereeName={referee.name}
              />
            </CardContent>
          </Card>
        </section>
      )}

      {/* Betting Analysis Section */}
      {currentStats && (
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold">Betting Analysis</h2>
            <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
              PRO
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Odds Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Odds Comparison</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                    +EV
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OddsComparison
                  refereeAvgYellow={currentStats.avgYellowCards}
                  refereeAvgRed={currentStats.avgRedCards}
                  refereeMatches={currentStats.matchesOfficiated}
                />
              </CardContent>
            </Card>

            {/* Match Prediction */}
            <Card>
              <CardHeader>
                <CardTitle>Match Prediction</CardTitle>
              </CardHeader>
              <CardContent>
                <UpcomingMatchPrediction
                  refereeAvgYellow={currentStats.avgYellowCards}
                  refereeAvgRed={currentStats.avgRedCards}
                  refereeMatches={currentStats.matchesOfficiated}
                  strictnessIndex={currentStats.strictnessIndex}
                />
              </CardContent>
            </Card>

            {/* Hot/Cold Streaks */}
            {recentMatches.length >= 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Hot/Cold Streaks</CardTitle>
                </CardHeader>
                <CardContent>
                  <HotColdStreaks
                    recentMatches={recentMatches.slice(0, 10).map(m => ({
                      date: new Date(m.date).toLocaleDateString(),
                      homeTeam: m.homeTeam.name,
                      awayTeam: m.awayTeam.name,
                      yellowCards: m.stats?.yellowCards || 0,
                      redCards: m.stats?.redCards || 0,
                      penalties: m.stats?.penalties || 0,
                      totalCards: (m.stats?.yellowCards || 0) + (m.stats?.redCards || 0),
                    }))}
                    refereeAvgYellow={currentStats.avgYellowCards}
                    refereeAvgRed={currentStats.avgRedCards}
                  />
                </CardContent>
              </Card>
            )}

            {/* Team Card Probabilities */}
            {teamStatsArray.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Team Card Probabilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <TeamCardProbabilities
                    teamHistory={teamStatsArray.map(t => ({
                      teamName: t.teamName,
                      teamLogo: t.teamLogo || undefined,
                      matchesWithReferee: t.matches,
                      totalYellowCards: t.yellowCards,
                      totalRedCards: t.redCards,
                      totalPenaltiesFor: 0,
                      totalPenaltiesAgainst: 0,
                      wins: t.wins,
                      draws: t.draws,
                      losses: t.losses,
                    }))}
                    refereeAvgYellow={currentStats.avgYellowCards}
                    refereeAvgRed={currentStats.avgRedCards}
                    refereeAvgPenalties={currentStats.avgPenalties}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Season Comparison Chart */}
      {referee.seasonStats.length > 1 && (
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Season Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <SeasonComparisonChart
                seasonStats={referee.seasonStats.map(stat => ({
                  season: formatSeason(stat.season),
                  matchesOfficiated: stat.matchesOfficiated,
                  avgYellowCards: stat.avgYellowCards,
                  avgRedCards: stat.avgRedCards,
                  avgPenalties: stat.avgPenalties,
                  strictnessIndex: stat.strictnessIndex,
                  leagueName: leagueMap[stat.leagueApiId]?.name || 'Unknown',
                }))}
                refereeName={referee.name}
              />
            </CardContent>
          </Card>
        </section>
      )}

      {/* Career Timeline */}
      {referee.seasonStats.length > 1 && (
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Career Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <RefereeTimeline
                seasonStats={referee.seasonStats.map(stat => ({
                  season: stat.season,
                  leagueName: leagueMap[stat.leagueApiId]?.name || 'Unknown',
                  matchesOfficiated: stat.matchesOfficiated,
                  avgYellowCards: stat.avgYellowCards,
                  avgRedCards: stat.avgRedCards,
                  strictnessIndex: stat.strictnessIndex,
                  totalYellowCards: stat.totalYellowCards,
                  totalRedCards: stat.totalRedCards,
                }))}
                refereeName={referee.name}
              />
            </CardContent>
          </Card>
        </section>
      )}

      {/* Card Distribution Heatmap */}
      {cardEvents.length > 0 && (
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Card Timing Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <CardHeatmap
                cardEvents={cardEvents}
                title="When Does This Referee Show Cards?"
              />
            </CardContent>
          </Card>
        </section>
      )}

      {/* Team-Specific Performance */}
      {teamStatsArray.length > 0 && (
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Team-Specific Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-center">Matches</TableHead>
                    <TableHead className="text-center">Yellow Cards</TableHead>
                    <TableHead className="text-center">Red Cards</TableHead>
                    <TableHead className="text-center">W-D-L</TableHead>
                    <TableHead className="text-center">Win %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamStatsArray.map((team) => {
                    const winRate =
                      team.matches > 0
                        ? ((team.wins / team.matches) * 100).toFixed(0)
                        : '0';
                    return (
                      <TableRow key={team.teamId}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {team.teamLogo && (
                              <Image
                                src={team.teamLogo}
                                alt={team.teamName}
                                width={24}
                                height={24}
                                className="rounded"
                              />
                            )}
                            <span className="font-medium">{team.teamName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{team.matches}</TableCell>
                        <TableCell className="text-center">
                          <span className="text-yellow-500">{team.yellowCards}</span>
                          <span className="text-muted-foreground text-xs ml-1">
                            ({(team.yellowCards / team.matches).toFixed(2)})
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-red-500">{team.redCards}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-green-500">{team.wins}</span>-
                          <span className="text-muted-foreground">{team.draws}</span>-
                          <span className="text-red-500">{team.losses}</span>
                        </TableCell>
                        <TableCell className="text-center">{winRate}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Match History */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Match History</CardTitle>
          </CardHeader>
          <CardContent>
            {recentMatches.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Match</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Yellow</TableHead>
                    <TableHead className="text-center">Red</TableHead>
                    <TableHead className="text-center">Pen</TableHead>
                    <TableHead>League</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMatches.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell className="text-muted-foreground">
                        {new Date(match.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {match.homeTeam.logo && (
                            <Image
                              src={match.homeTeam.logo}
                              alt={match.homeTeam.name}
                              width={20}
                              height={20}
                              className="rounded"
                            />
                          )}
                          <span>{match.homeTeam.name}</span>
                          <span className="text-muted-foreground">vs</span>
                          <span>{match.awayTeam.name}</span>
                          {match.awayTeam.logo && (
                            <Image
                              src={match.awayTeam.logo}
                              alt={match.awayTeam.name}
                              width={20}
                              height={20}
                              className="rounded"
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {match.homeGoals} - {match.awayGoals}
                      </TableCell>
                      <TableCell className="text-center">
                        {match.stats ? (
                          <span className="text-yellow-500">{match.stats.yellowCards}</span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {match.stats ? (
                          <span className="text-red-500">{match.stats.redCards}</span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {match.stats ? (
                          <span className="text-blue-500">{match.stats.penalties}</span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {match.league.name}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No match history available yet.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Back Link */}
      <div className="mt-8">
        <Link
          href="/referees"
          className="text-primary hover:underline inline-flex items-center gap-2"
        >
          ← Back to Referees
        </Link>
      </div>
    </div>
  );
}
