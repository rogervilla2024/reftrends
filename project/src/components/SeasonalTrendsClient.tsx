'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

interface MonthlyData {
  month: string;
  matches: number;
  totalYellow: number;
  totalRed: number;
  avgYellow: number;
  avgRed: number;
}

interface RefereeTrend {
  id: number;
  name: string;
  slug: string;
  totalMatches: number;
  avgCards: number;
  firstHalfAvg: number;
  secondHalfAvg: number;
  trendChange: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  monthlyData: { month: string; avgCards: number; matches: number }[];
}

interface SeasonalTrendsData {
  monthlyTrends: MonthlyData[];
  leagueMonthlyData: { league: string; data: { month: string; avgCards: number }[] }[];
  topReferees: RefereeTrend[];
  seasonSummary: {
    totalMatches: number;
    totalYellow: number;
    totalRed: number;
  };
}

interface SeasonalTrendsClientProps {
  data: SeasonalTrendsData;
}

export default function SeasonalTrendsClient({ data }: SeasonalTrendsClientProps) {
  const [selectedReferee, setSelectedReferee] = useState<number | null>(null);

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') return '^';
    if (trend === 'decreasing') return 'v';
    return '-';
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'increasing') return 'text-red-500';
    if (trend === 'decreasing') return 'text-green-500';
    return 'text-gray-500';
  };

  const chartData = data.monthlyTrends.map(m => ({
    name: m.month,
    'Yellow Cards': parseFloat(m.avgYellow.toFixed(2)),
    'Red Cards': parseFloat(m.avgRed.toFixed(2)),
    Matches: m.matches,
  }));

  return (
    <div className="space-y-8">
      {/* Season Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold">{data.seasonSummary.totalMatches}</div>
            <p className="text-muted-foreground">Total Matches</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-yellow-500">{data.seasonSummary.totalYellow}</div>
            <p className="text-muted-foreground">Yellow Cards</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-red-500">{data.seasonSummary.totalRed}</div>
            <p className="text-muted-foreground">Red Cards</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Card Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="Yellow Cards"
                  stackId="1"
                  stroke="hsl(var(--yellow-card))"
                  fill="hsl(var(--yellow-card))"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="Red Cards"
                  stackId="1"
                  stroke="hsl(var(--red-card))"
                  fill="hsl(var(--red-card))"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Referee Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Referee Behavior Trends</CardTitle>
          <p className="text-sm text-muted-foreground">
            Comparing first half vs second half of season performance
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topReferees.map((referee) => (
              <div key={referee.id} className="border rounded-lg overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedReferee(selectedReferee === referee.id ? null : referee.id)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{getTrendIcon(referee.trend)}</span>
                    <div className="flex-1">
                      <Link
                        href={`/referees/${referee.slug}`}
                        className="font-semibold hover:text-primary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {referee.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {referee.totalMatches} matches &middot; {referee.avgCards.toFixed(2)} avg cards
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">First Half</p>
                          <p className="font-medium">{referee.firstHalfAvg.toFixed(2)}</p>
                        </div>
                        <div className={`text-xl ${getTrendColor(referee.trend)}`}>
                          {referee.trendChange > 0 ? '+' : ''}{referee.trendChange.toFixed(2)}
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Second Half</p>
                          <p className="font-medium">{referee.secondHalfAvg.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    <span className="text-muted-foreground">
                      {selectedReferee === referee.id ? 'v' : '>'}
                    </span>
                  </div>
                </div>

                {/* Expanded Chart */}
                {selectedReferee === referee.id && referee.monthlyData.length > 0 && (
                  <div className="p-4 pt-0 border-t bg-muted/20">
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <LineChart data={referee.monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="month" className="text-xs" />
                          <YAxis className="text-xs" domain={[0, 'auto']} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--background))',
                              border: '1px solid hsl(var(--border))',
                            }}
                            formatter={(value) => [(value as number).toFixed(2), 'Avg Cards']}
                          />
                          <Line
                            type="monotone"
                            dataKey="avgCards"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Cards per match over time
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trend Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-red-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-red-500">^</span>
              <div>
                <p className="font-bold text-lg">
                  {data.topReferees.filter(r => r.trend === 'increasing').length}
                </p>
                <p className="text-sm text-muted-foreground">Getting Stricter</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-green-500">v</span>
              <div>
                <p className="font-bold text-lg">
                  {data.topReferees.filter(r => r.trend === 'decreasing').length}
                </p>
                <p className="text-sm text-muted-foreground">Getting Lenient</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-500">-</span>
              <div>
                <p className="font-bold text-lg">
                  {data.topReferees.filter(r => r.trend === 'stable').length}
                </p>
                <p className="text-sm text-muted-foreground">Staying Consistent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle>Seasonal Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>
              Referees tend to be{' '}
              <strong>
                {data.topReferees.filter(r => r.trend === 'increasing').length >
                data.topReferees.filter(r => r.trend === 'decreasing').length
                  ? 'stricter'
                  : 'more lenient'}
              </strong>{' '}
              as the season progresses.
            </li>
            {data.topReferees.filter(r => r.trend === 'increasing').length > 0 && (
              <li>
                Most notably,{' '}
                <strong>
                  {data.topReferees
                    .filter(r => r.trend === 'increasing')
                    .sort((a, b) => b.trendChange - a.trendChange)[0]?.name}
                </strong>{' '}
                has shown the biggest increase in card-giving.
              </li>
            )}
            {data.topReferees.filter(r => r.trend === 'decreasing').length > 0 && (
              <li>
                <strong>
                  {data.topReferees
                    .filter(r => r.trend === 'decreasing')
                    .sort((a, b) => a.trendChange - b.trendChange)[0]?.name}
                </strong>{' '}
                has become notably more lenient compared to the season start.
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
