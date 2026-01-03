'use client';

import { useState } from 'react';
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

interface DerbyMatch {
  id: number;
  date: string;
  derbyName: string;
  homeTeam: string;
  awayTeam: string;
  referee: { id: number; name: string; slug: string } | null;
  yellowCards: number;
  redCards: number;
  totalCards: number;
  league: string;
}

interface RefereeStats {
  id: number;
  name: string;
  slug: string;
  derbyMatches: number;
  derbyCards: number;
  regularMatches: number;
  regularCards: number;
  derbyAvg: number;
  regularAvg: number;
  difference: number;
  derbies: string[];
}

interface DerbyStats {
  name: string;
  matchCount: number;
  avgCards: number;
  avgYellow: number;
  avgRed: number;
  recentMatches: DerbyMatch[];
}

interface DerbyData {
  derbyMatches: DerbyMatch[];
  comparison: {
    derby: { yellow: number; red: number; total: number; count: number };
    regular: { yellow: number; red: number; total: number; count: number };
  };
  referees: RefereeStats[];
  derbyStats: DerbyStats[];
}

interface DerbyAnalyzerClientProps {
  data: DerbyData;
}

export default function DerbyAnalyzerClient({ data }: DerbyAnalyzerClientProps) {
  const [selectedDerby, setSelectedDerby] = useState<string>('all');
  const [expandedReferee, setExpandedReferee] = useState<number | null>(null);

  const comparisonData = [
    {
      type: 'Derby Matches',
      'Yellow Cards': parseFloat(data.comparison.derby.yellow.toFixed(2)),
      'Red Cards': parseFloat(data.comparison.derby.red.toFixed(2)),
    },
    {
      type: 'Regular Matches',
      'Yellow Cards': parseFloat(data.comparison.regular.yellow.toFixed(2)),
      'Red Cards': parseFloat(data.comparison.regular.red.toFixed(2)),
    },
  ];

  const cardDifference = data.comparison.derby.total - data.comparison.regular.total;
  const percentIncrease = data.comparison.regular.total > 0
    ? ((cardDifference / data.comparison.regular.total) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-8">
      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-red-500/10">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-red-500">
              {data.comparison.derby.count}
            </div>
            <p className="text-sm text-muted-foreground">Derby Matches</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">
              {data.comparison.derby.total.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Avg Derby Cards</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">
              {data.comparison.regular.total.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Avg Regular Cards</p>
          </CardContent>
        </Card>
        <Card className={cardDifference > 0 ? 'bg-orange-500/10' : 'bg-green-500/10'}>
          <CardContent className="pt-6 text-center">
            <div className={`text-3xl font-bold ${cardDifference > 0 ? 'text-orange-500' : 'text-green-500'}`}>
              {cardDifference > 0 ? '+' : ''}{percentIncrease}%
            </div>
            <p className="text-sm text-muted-foreground">Derby Card Increase</p>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Derby vs Regular Match Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="type" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Legend />
                <Bar dataKey="Yellow Cards" fill="#eab308" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Red Cards" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Famous Derbies */}
      <Card>
        <CardHeader>
          <CardTitle>Famous Derbies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.derbyStats.map((derby) => (
              <div
                key={derby.name}
                className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                onClick={() => setSelectedDerby(selectedDerby === derby.name ? 'all' : derby.name)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{derby.name}</h3>
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    {derby.matchCount} matches
                  </span>
                </div>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-2xl font-bold text-primary">
                      {derby.avgCards.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground ml-1">cards/match</span>
                  </div>
                </div>
                <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                  <span className="text-yellow-500">{derby.avgYellow.toFixed(1)} yellow</span>
                  <span className="text-red-500">{derby.avgRed.toFixed(2)} red</span>
                </div>

                {selectedDerby === derby.name && derby.recentMatches.length > 0 && (
                  <div className="mt-3 pt-3 border-t space-y-1">
                    <p className="text-xs font-medium">Recent:</p>
                    {derby.recentMatches.map((match) => (
                      <div key={match.id} className="text-xs flex justify-between">
                        <span className="text-muted-foreground">{match.date}</span>
                        <span>{match.totalCards} cards</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Derby Specialists (Referees) */}
      <Card>
        <CardHeader>
          <CardTitle>Derby Specialists</CardTitle>
          <p className="text-sm text-muted-foreground">
            Referees who have officiated the most derby matches
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.referees.slice(0, 10).map((referee) => (
              <div key={referee.id} className="border rounded-lg overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedReferee(expandedReferee === referee.id ? null : referee.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Link
                        href={`/referees/${referee.slug}`}
                        className="font-semibold hover:text-primary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {referee.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {referee.derbyMatches} derby matches
                      </p>
                    </div>

                    <div className="flex gap-6 items-center">
                      <div className="text-center">
                        <p className="text-lg font-bold text-red-500">
                          {referee.derbyAvg.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">Derby Avg</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">
                          {referee.regularAvg.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">Regular Avg</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-lg font-bold ${referee.difference > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                          {referee.difference > 0 ? '+' : ''}{referee.difference.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">Difference</p>
                      </div>
                      <span className="text-muted-foreground">
                        {expandedReferee === referee.id ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>
                </div>

                {expandedReferee === referee.id && (
                  <div className="px-4 pb-4 pt-0 border-t bg-muted/20">
                    <p className="text-sm font-medium mt-3 mb-2">Derbies Officiated:</p>
                    <div className="flex flex-wrap gap-2">
                      {referee.derbies.map((derby) => (
                        <span key={derby} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {derby}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Derby Matches */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Derby Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.derbyMatches.slice(0, 15).map((match) => (
              <div key={match.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50">
                <span className="text-sm text-muted-foreground w-24">{match.date}</span>
                <div className="flex-1">
                  <p className="font-medium">
                    {match.homeTeam} vs {match.awayTeam}
                  </p>
                  <p className="text-xs text-muted-foreground">{match.derbyName}</p>
                </div>
                {match.referee && (
                  <Link
                    href={`/referees/${match.referee.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    {match.referee.name}
                  </Link>
                )}
                <div className="text-right">
                  <span className="text-yellow-500">{match.yellowCards}</span>
                  {' / '}
                  <span className="text-red-500">{match.redCards}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insight */}
      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle>Derby Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>
              Derby matches see <strong>{Math.abs(parseFloat(percentIncrease))}% {cardDifference > 0 ? 'more' : 'fewer'}</strong> cards than regular matches on average.
            </li>
            {data.derbyStats.length > 0 && (
              <li>
                <strong>{data.derbyStats[0].name}</strong> is the most card-heavy derby with{' '}
                <strong>{data.derbyStats[0].avgCards.toFixed(1)}</strong> cards per match.
              </li>
            )}
            {data.referees.length > 0 && (
              <li>
                <strong>{data.referees[0].name}</strong> is the most experienced derby referee with{' '}
                <strong>{data.referees[0].derbyMatches}</strong> derby matches officiated.
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
