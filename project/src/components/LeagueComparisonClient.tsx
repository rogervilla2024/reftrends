'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
interface TopReferee {
  name: string;
  slug: string;
  matches: number;
  yellow: number;
  red: number;
  avgCards: number;
}
interface LeagueStats {
  apiId: number;
  name: string;
  country: string;
  flag: string;
  matches: number;
  totalYellow: number;
  totalRed: number;
  totalFouls?: number;
  avgYellow: number;
  avgRed: number;
  avgFouls?: number;
  avgCards: number;
  strictnessRank: number;
  topReferees: TopReferee[];
}
interface LeagueComparisonClientProps {
  leagues: LeagueStats[];
}
export default function LeagueComparisonClient({ leagues }: LeagueComparisonClientProps) {
  const chartData = useMemo(() => {
    return leagues.map(league => ({
      name: league.name.replace(' League', '').replace(' 1', ''),
      'Yellow Cards': parseFloat(league.avgYellow.toFixed(2)),
      'Red Cards': parseFloat(league.avgRed.toFixed(2)),
      'Total Cards': parseFloat(league.avgCards.toFixed(2)),
    }));
  }, [leagues]);
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-red-500';
    if (rank === 2) return 'text-orange-500';
    if (rank === 3) return 'text-yellow-500';
    if (rank === 4) return 'text-blue-500';
    return 'text-green-500';
  };
  const getRankLabel = (rank: number) => {
    if (rank === 1) return 'Strictest';
    if (rank === 5) return 'Most Lenient';
    return `#${rank}`;
  };
  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {leagues.sort((a, b) => a.strictnessRank - b.strictnessRank).map((league) => (
          <Card key={league.apiId} className={`relative overflow-hidden ${league.strictnessRank === 1 ? 'ring-2 ring-red-500' : ''}`}>
            <CardContent className="pt-6">
              <div className="text-center">
                <span className="text-4xl">{league.flag}</span>
                <h3 className="font-bold mt-2">{league.name}</h3>
                <p className={`text-sm font-medium ${getRankColor(league.strictnessRank)}`}>
                  {getRankLabel(league.strictnessRank)}
                </p>
                <div className="mt-4 space-y-1">
                  <p className="text-2xl font-bold">{league.avgCards.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">cards/match</p>
                </div>
                <div className="mt-2 flex justify-center gap-4 text-sm">
                  <span className="text-yellow-500">{league.avgYellow.toFixed(1)}</span>
                  <span className="text-red-500">{league.avgRed.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Average Cards per Match by League</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                <Bar dataKey="Yellow Cards" fill="hsl(var(--yellow-card))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Red Cards" fill="hsl(var(--red-card))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      {/* Detailed Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed League Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">League</th>
                  <th className="text-center py-3 px-4">Matches</th>
                  <th className="text-center py-3 px-4">Total Yellow</th>
                  <th className="text-center py-3 px-4">Total Red</th>
                  <th className="text-center py-3 px-4">Avg Yellow</th>
                  <th className="text-center py-3 px-4">Avg Red</th>
                  <th className="text-center py-3 px-4">Avg Total</th>
                  <th className="text-center py-3 px-4">Rank</th>
                </tr>
              </thead>
              <tbody>
                {leagues.sort((a, b) => a.strictnessRank - b.strictnessRank).map((league) => (
                  <tr key={league.apiId} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span>{league.flag}</span>
                        <span className="font-medium">{league.name}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">{league.matches}</td>
                    <td className="text-center py-3 px-4 text-yellow-500">{league.totalYellow}</td>
                    <td className="text-center py-3 px-4 text-red-500">{league.totalRed}</td>
                    <td className="text-center py-3 px-4">{league.avgYellow.toFixed(2)}</td>
                    <td className="text-center py-3 px-4">{league.avgRed.toFixed(3)}</td>
                    <td className="text-center py-3 px-4 font-bold">{league.avgCards.toFixed(2)}</td>
                    <td className="text-center py-3 px-4">
                      <span className={`font-bold ${getRankColor(league.strictnessRank)}`}>
                        #{league.strictnessRank}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Top Referees by League */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leagues.sort((a, b) => a.strictnessRank - b.strictnessRank).map((league) => (
          <Card key={league.apiId}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>{league.flag}</span>
                {league.name} Top Referees
              </CardTitle>
            </CardHeader>
            <CardContent>
              {league.topReferees.length > 0 ? (
                <div className="space-y-3">
                  {league.topReferees.map((ref, idx) => (
                    <Link
                      key={ref.slug}
                      href={`/referees/${ref.slug}`}
                      className="flex items-center gap-3 p-2 rounded hover:bg-secondary/50 transition-colors"
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="flex-1 truncate">{ref.name}</span>
                      <span className="text-sm font-medium">
                        {ref.avgCards.toFixed(1)}/match
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No referee data available</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Insights */}
      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {leagues.length > 0 && (
              <>
                <li>
                  <strong>{leagues.find(l => l.strictnessRank === 1)?.name}</strong> is the strictest league with{' '}
                  <strong>{leagues.find(l => l.strictnessRank === 1)?.avgCards.toFixed(2)}</strong> cards per match on average.
                </li>
                <li>
                  <strong>{leagues.find(l => l.strictnessRank === 5)?.name}</strong> is the most lenient league with{' '}
                  <strong>{leagues.find(l => l.strictnessRank === 5)?.avgCards.toFixed(2)}</strong> cards per match.
                </li>
                <li>
                  The difference between strictest and most lenient is{' '}
                  <strong>
                    {(
                      (leagues.find(l => l.strictnessRank === 1)?.avgCards || 0) -
                      (leagues.find(l => l.strictnessRank === 5)?.avgCards || 0)
                    ).toFixed(2)}
                  </strong>{' '}
                  cards per match.
                </li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
