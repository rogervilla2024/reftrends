'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';

interface SeasonData {
  season: number;
  matchCount: number;
  avgYellow: number;
  avgRed: number;
  totalCards: number;
}

interface RefereeSeasonComparison {
  id: number;
  name: string;
  slug: string;
  photo: string | null;
  seasons: {
    season: number;
    matches: number;
    avgYellow: number;
    avgRed: number;
    strictness: number;
  }[];
  trend: 'stricter' | 'lenient' | 'stable';
  changePercent: number;
}

interface HistoricalSeasonsData {
  hasMultipleSeasons: boolean;
  seasons: SeasonData[];
  overallTrends: SeasonData[];
  refereeComparisons: RefereeSeasonComparison[];
  leagueSeasons: Record<string, SeasonData[]>;
}

interface HistoricalSeasonsClientProps {
  data: HistoricalSeasonsData;
}

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'];

export default function HistoricalSeasonsClient({ data }: HistoricalSeasonsClientProps) {
  if (!data.hasMultipleSeasons) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-xl font-bold mb-2">Building Historical Data...</h2>
          <p className="text-muted-foreground">
            We are currently collecting historical season data from the API.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            This feature requires data from multiple seasons (2024, 2023, etc.) to show
            trends and comparisons. Please check back later.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.seasons.map(s => ({
    season: `${s.season}/${(s.season + 1).toString().slice(-2)}`,
    seasonNum: s.season,
    avgYellow: s.avgYellow,
    avgRed: s.avgRed,
    matches: s.matchCount,
    total: s.avgYellow + s.avgRed,
  })).reverse();

  return (
    <div className="space-y-8">
      {/* Season Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.seasons.slice(0, 4).map((season, idx) => (
          <Card key={season.season} className={idx === 0 ? 'ring-2 ring-primary' : ''}>
            <CardContent className="pt-6 text-center">
              <div className="text-lg font-bold mb-1">
                {season.season}/{(season.season + 1).toString().slice(-2)}
              </div>
              <p className="text-3xl font-bold text-primary">{season.matchCount}</p>
              <p className="text-sm text-muted-foreground">Matches</p>
              <div className="mt-2 text-sm">
                <span className="text-yellow-500">{season.avgYellow.toFixed(2)} Y</span>
                {' / '}
                <span className="text-red-500">{season.avgRed.toFixed(2)} R</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Card Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Card Averages by Season</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="season" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Legend />
                <Bar dataKey="avgYellow" fill="#eab308" name="Avg Yellow" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgRed" fill="#ef4444" name="Avg Red" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* League Comparison by Season */}
      {Object.keys(data.leagueSeasons).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>League Trends Across Seasons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData.map(d => {
                    const leagueData: Record<string, number> = { season: d.seasonNum };
                    Object.entries(data.leagueSeasons).forEach(([league, seasons]) => {
                      const seasonData = seasons.find(s => s.season === d.seasonNum);
                      leagueData[league] = seasonData ? seasonData.avgYellow + seasonData.avgRed : 0;
                    });
                    return { ...d, ...leagueData };
                  })}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="season" className="text-xs" />
                  <YAxis className="text-xs" label={{ value: 'Cards/Match', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                    }}
                  />
                  <Legend />
                  {Object.keys(data.leagueSeasons).map((league, idx) => (
                    <Line
                      key={league}
                      type="monotone"
                      dataKey={league}
                      stroke={COLORS[idx % COLORS.length]}
                      strokeWidth={2}
                      dot={{ fill: COLORS[idx % COLORS.length] }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referee Evolution */}
      <Card>
        <CardHeader>
          <CardTitle>Referee Evolution</CardTitle>
          <p className="text-sm text-muted-foreground">
            How referees have changed their card behavior between seasons
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.refereeComparisons.map((referee) => (
              <div key={referee.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-4">
                  {/* Photo */}
                  <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden relative shrink-0">
                    {referee.photo ? (
                      <Image src={referee.photo} alt={referee.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">
                        {referee.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/referees/${referee.slug}`}
                      className="font-semibold hover:text-primary"
                    >
                      {referee.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          referee.trend === 'stricter'
                            ? 'bg-red-500/20 text-red-500'
                            : referee.trend === 'lenient'
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-gray-500/20 text-gray-500'
                        }`}
                      >
                        {referee.trend === 'stricter' && '↑ Stricter'}
                        {referee.trend === 'lenient' && '↓ More Lenient'}
                        {referee.trend === 'stable' && '→ Stable'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {referee.changePercent > 0 ? '+' : ''}
                        {referee.changePercent.toFixed(1)}% change
                      </span>
                    </div>
                  </div>

                  {/* Season Stats */}
                  <div className="hidden md:flex gap-4">
                    {referee.seasons.slice(0, 3).map((season) => (
                      <div key={season.season} className="text-center min-w-[80px]">
                        <p className="text-xs text-muted-foreground mb-1">
                          {season.season}/{(season.season + 1).toString().slice(-2)}
                        </p>
                        <p className="font-bold">
                          {season.avgYellow.toFixed(2)} Y
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {season.matches} matches
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile season stats */}
                <div className="md:hidden mt-4 grid grid-cols-3 gap-2">
                  {referee.seasons.slice(0, 3).map((season) => (
                    <div key={season.season} className="text-center bg-muted/50 rounded p-2">
                      <p className="text-xs text-muted-foreground">
                        {season.season}/{(season.season + 1).toString().slice(-2)}
                      </p>
                      <p className="font-bold text-sm">
                        {season.avgYellow.toFixed(1)} Y
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {data.refereeComparisons.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No referees with multi-season data available yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle>Historical Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>
              <strong>{data.seasons.length} seasons</strong> of data analyzed with{' '}
              <strong>{data.seasons.reduce((sum, s) => sum + s.matchCount, 0)}</strong> total matches.
            </li>
            {data.seasons.length >= 2 && (
              <>
                <li>
                  Card average {data.seasons[0].avgYellow + data.seasons[0].avgRed >
                  data.seasons[1].avgYellow + data.seasons[1].avgRed
                    ? 'increased'
                    : 'decreased'}{' '}
                  from {(data.seasons[1].avgYellow + data.seasons[1].avgRed).toFixed(2)} to{' '}
                  {(data.seasons[0].avgYellow + data.seasons[0].avgRed).toFixed(2)} cards per match.
                </li>
                <li>
                  <strong>
                    {data.refereeComparisons.filter(r => r.trend === 'stricter').length}
                  </strong>{' '}
                  referees became stricter, while{' '}
                  <strong>
                    {data.refereeComparisons.filter(r => r.trend === 'lenient').length}
                  </strong>{' '}
                  became more lenient.
                </li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
