'use client';

import { useState } from 'react';
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
  Legend,
  LineChart,
  Line,
} from 'recharts';

interface RestData {
  category: string;
  matches: number;
  avgYellow: number;
  avgRed: number;
  avgTotal: number;
}

interface RefereeData {
  id: number;
  name: string;
  slug: string;
  photo: string | null;
  league: string;
  totalMatches: number;
  restData: RestData[];
  fatigueImpact: number | null;
  shortRestMatches: number;
  shortRestAvg: number;
  normalRestAvg: number;
}

interface GlobalRestData {
  category: string;
  fullLabel: string;
  matches: number;
  avgYellow: number;
  avgRed: number;
  avgTotal: number;
}

interface FatigueData {
  referees: RefereeData[];
  globalRestData: GlobalRestData[];
  mostAffected: RefereeData[];
  leastAffected: RefereeData[];
  summary: {
    totalAnalyzed: number;
    shortRestTotal: number;
    normalRestTotal: number;
  };
}

interface RefereeFatigueClientProps {
  data: FatigueData;
}

export default function RefereeFatigueClient({ data }: RefereeFatigueClientProps) {
  const [expandedReferee, setExpandedReferee] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'impact' | 'shortRest' | 'matches'>('impact');

  const sortedReferees = [...data.referees].sort((a, b) => {
    switch (sortBy) {
      case 'impact':
        if (a.fatigueImpact === null) return 1;
        if (b.fatigueImpact === null) return -1;
        return Math.abs(b.fatigueImpact) - Math.abs(a.fatigueImpact);
      case 'shortRest':
        return b.shortRestMatches - a.shortRestMatches;
      case 'matches':
        return b.totalMatches - a.totalMatches;
      default:
        return 0;
    }
  });

  const chartData = data.globalRestData.map(d => ({
    name: d.category,
    'Yellow Cards': parseFloat(d.avgYellow.toFixed(2)),
    'Red Cards': parseFloat(d.avgRed.toFixed(2)),
    Matches: d.matches,
  }));

  const shortRestAvg = data.globalRestData[0]?.avgTotal || 0;
  const normalRestAvg = data.globalRestData[1]?.avgTotal || 0;
  const globalImpact = shortRestAvg - normalRestAvg;

  return (
    <div className="space-y-8">
      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">{data.summary.totalAnalyzed}</div>
            <p className="text-sm text-muted-foreground">Referees Analyzed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-orange-500">
              {data.summary.shortRestTotal}
            </div>
            <p className="text-sm text-muted-foreground">Short Rest Matches</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">{shortRestAvg.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">Avg Cards (Short Rest)</p>
          </CardContent>
        </Card>
        <Card className={globalImpact > 0 ? 'bg-red-500/10' : 'bg-green-500/10'}>
          <CardContent className="pt-6 text-center">
            <div className={`text-3xl font-bold ${globalImpact > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {globalImpact > 0 ? '+' : ''}{globalImpact.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Fatigue Impact</p>
          </CardContent>
        </Card>
      </div>

      {/* Explanation */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Understanding Fatigue Impact</h3>
          <p className="text-sm text-muted-foreground">
            <strong>Fatigue Impact</strong> measures the difference in cards given between short rest (0-3 days) and normal rest (4-7 days) periods.
            <br />
            <strong>Positive value</strong> = More cards when fatigued (stricter under pressure)
            <br />
            <strong>Negative value</strong> = Fewer cards when fatigued (more lenient when tired)
          </p>
        </CardContent>
      </Card>

      {/* Global Rest Impact Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cards by Rest Period (All Referees)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
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
                <Bar dataKey="Yellow Cards" fill="#eab308" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Red Cards" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Most/Least Affected */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Most Affected by Fatigue
            </CardTitle>
            <p className="text-sm text-muted-foreground">Stricter when tired</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.mostAffected.map((ref, idx) => (
                <Link
                  key={ref.id}
                  href={`/referees/${ref.slug}`}
                  className="flex items-center gap-3 p-2 rounded hover:bg-secondary/50"
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-red-500 text-white' : 'bg-muted'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="flex-1 truncate">{ref.name}</span>
                  <span className="text-red-500 font-bold">
                    +{ref.fatigueImpact?.toFixed(2)}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Least Affected by Fatigue
            </CardTitle>
            <p className="text-sm text-muted-foreground">More lenient when tired</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.leastAffected.map((ref, idx) => (
                <Link
                  key={ref.id}
                  href={`/referees/${ref.slug}`}
                  className="flex items-center gap-3 p-2 rounded hover:bg-secondary/50"
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-green-500 text-white' : 'bg-muted'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="flex-1 truncate">{ref.name}</span>
                  <span className="text-green-500 font-bold">
                    {ref.fatigueImpact?.toFixed(2)}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sort Options */}
      <div className="flex gap-4">
        <div>
          <label className="text-sm text-muted-foreground block mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="border rounded px-3 py-2 bg-background"
          >
            <option value="impact">Fatigue Impact</option>
            <option value="shortRest">Short Rest Matches</option>
            <option value="matches">Total Matches</option>
          </select>
        </div>
      </div>

      {/* Referee List */}
      <div className="space-y-3">
        {sortedReferees.slice(0, 20).map((referee) => (
          <Card key={referee.id} className="overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedReferee(expandedReferee === referee.id ? null : referee.id)}
            >
              <div className="flex items-center gap-4">
                {/* Photo */}
                <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden relative shrink-0">
                  {referee.photo ? (
                    <Image
                      src={referee.photo}
                      alt={referee.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/referees/${referee.slug}`}
                    className="font-semibold hover:text-primary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {referee.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {referee.league} &middot; {referee.shortRestMatches} short rest matches
                  </p>
                </div>

                {/* Stats */}
                <div className="flex gap-6 items-center">
                  <div className="text-center hidden sm:block">
                    <p className="text-lg font-bold text-orange-500">
                      {referee.shortRestAvg.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">Short Rest</p>
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className="text-lg font-bold">
                      {referee.normalRestAvg.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">Normal Rest</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-lg font-bold ${
                      referee.fatigueImpact === null
                        ? 'text-muted-foreground'
                        : referee.fatigueImpact > 0
                          ? 'text-red-500'
                          : 'text-green-500'
                    }`}>
                      {referee.fatigueImpact !== null
                        ? `${referee.fatigueImpact > 0 ? '+' : ''}${referee.fatigueImpact.toFixed(2)}`
                        : 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground">Impact</p>
                  </div>
                  <span className="text-muted-foreground">
                    {expandedReferee === referee.id ? '▲' : '▼'}
                  </span>
                </div>
              </div>
            </div>

            {/* Expanded Chart */}
            {expandedReferee === referee.id && (
              <div className="px-4 pb-4 pt-0 border-t bg-muted/20">
                <div className="h-48 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={referee.restData.filter(d => d.matches > 0)}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="category"
                        className="text-xs"
                        tickFormatter={(value) => value.split(' ')[0]}
                      />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                        }}
                        formatter={(value) => [(value as number).toFixed(2), 'Avg Cards']}
                      />
                      <Line
                        type="monotone"
                        dataKey="avgTotal"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name="Avg Cards"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                  {referee.restData.map((d) => (
                    <div key={d.category} className="bg-muted/50 rounded p-2">
                      <p className="font-medium">{d.category.split(' ')[0]}</p>
                      <p className="text-muted-foreground">{d.matches} matches</p>
                      <p className="font-bold">{d.avgTotal.toFixed(2)} cards</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Insights */}
      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle>Fatigue Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>
              On average, referees show{' '}
              <strong>
                {Math.abs(globalImpact).toFixed(2)} {globalImpact > 0 ? 'more' : 'fewer'}
              </strong>{' '}
              cards per match when officiating with short rest (0-3 days).
            </li>
            {data.mostAffected.length > 0 && (
              <li>
                <strong>{data.mostAffected[0].name}</strong> is most affected by fatigue, showing{' '}
                <strong>+{data.mostAffected[0].fatigueImpact?.toFixed(2)}</strong> more cards when tired.
              </li>
            )}
            {data.leastAffected.length > 0 && (
              <li>
                <strong>{data.leastAffected[0].name}</strong> becomes more lenient when fatigued, showing{' '}
                <strong>{data.leastAffected[0].fatigueImpact?.toFixed(2)}</strong> fewer cards.
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
