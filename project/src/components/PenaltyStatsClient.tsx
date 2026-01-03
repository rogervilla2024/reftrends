'use client';

import { useState, useMemo } from 'react';
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
} from 'recharts';

interface RecentMatch {
  date: string;
  homeTeam: string;
  awayTeam: string;
  homePenalties: number;
  awayPenalties: number;
  total: number;
}

interface RefereeData {
  id: number;
  name: string;
  slug: string;
  photo: string | null;
  league: string;
  matchCount: number;
  totalPenalties: number;
  homePenalties: number;
  awayPenalties: number;
  avgPenalties: number;
  penaltyRate: number;
  multiPenaltyRate: number;
  matchesWithPenalty: number;
  matchesWithMultiple: number;
  homeBias: number;
  recentPenaltyMatches: RecentMatch[];
}

interface LeagueStats {
  name: string;
  matchCount: number;
  totalPenalties: number;
  avgPenalties: number;
}

interface PenaltyStatsData {
  referees: RefereeData[];
  leagueStats: LeagueStats[];
  overall: {
    totalMatches: number;
    totalPenalties: number;
    avgPenalties: number;
    matchesWithPenalty: number;
  };
}

interface PenaltyStatsClientProps {
  data: PenaltyStatsData;
}

export default function PenaltyStatsClient({ data }: PenaltyStatsClientProps) {
  const [sortBy, setSortBy] = useState<'avgPenalties' | 'penaltyRate' | 'total' | 'homeBias'>('avgPenalties');
  const [filterLeague, setFilterLeague] = useState<string>('all');
  const [expandedReferee, setExpandedReferee] = useState<number | null>(null);

  const leagues = useMemo(() => {
    const uniqueLeagues = [...new Set(data.referees.map(r => r.league))];
    return uniqueLeagues.sort();
  }, [data.referees]);

  const sortedReferees = useMemo(() => {
    const filtered = filterLeague === 'all'
      ? data.referees
      : data.referees.filter(r => r.league === filterLeague);

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'avgPenalties':
          return b.avgPenalties - a.avgPenalties;
        case 'penaltyRate':
          return b.penaltyRate - a.penaltyRate;
        case 'total':
          return b.totalPenalties - a.totalPenalties;
        case 'homeBias':
          return Math.abs(b.homeBias) - Math.abs(a.homeBias);
        default:
          return 0;
      }
    });
  }, [data.referees, sortBy, filterLeague]);

  const leagueChartData = data.leagueStats.map(l => ({
    name: l.name.replace(' League', '').replace(' 1', ''),
    'Avg Penalties': parseFloat(l.avgPenalties.toFixed(3)),
  }));

  return (
    <div className="space-y-8">
      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">{data.overall.totalMatches}</div>
            <p className="text-sm text-muted-foreground">Total Matches</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-primary">{data.overall.totalPenalties}</div>
            <p className="text-sm text-muted-foreground">Total Penalties</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">{data.overall.avgPenalties.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">Avg per Match</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">
              {((data.overall.matchesWithPenalty / data.overall.totalMatches) * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">Matches with Penalty</p>
          </CardContent>
        </Card>
      </div>

      {/* League Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Penalties by League</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leagueChartData} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis type="category" dataKey="name" className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Bar dataKey="Avg Penalties" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Penalty Givers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Most Penalties/Match</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.referees.slice(0, 3).map((ref, idx) => (
                <Link
                  key={ref.id}
                  href={`/referees/${ref.slug}`}
                  className="flex items-center gap-2 p-2 rounded hover:bg-secondary/50"
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-yellow-500 text-black' : 'bg-muted'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="flex-1 truncate">{ref.name}</span>
                  <span className="font-bold">{ref.avgPenalties.toFixed(2)}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-500/5">
          <CardHeader>
            <CardTitle className="text-lg">Lowest Penalty Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...data.referees].sort((a, b) => a.avgPenalties - b.avgPenalties).slice(0, 3).map((ref, idx) => (
                <Link
                  key={ref.id}
                  href={`/referees/${ref.slug}`}
                  className="flex items-center gap-2 p-2 rounded hover:bg-secondary/50"
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-green-500 text-white' : 'bg-muted'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="flex-1 truncate">{ref.name}</span>
                  <span className="font-bold">{ref.avgPenalties.toFixed(2)}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/5">
          <CardHeader>
            <CardTitle className="text-lg">Home Team Bias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...data.referees]
                .filter(r => r.totalPenalties >= 3)
                .sort((a, b) => b.homeBias - a.homeBias)
                .slice(0, 3)
                .map((ref, idx) => (
                  <Link
                    key={ref.id}
                    href={`/referees/${ref.slug}`}
                    className="flex items-center gap-2 p-2 rounded hover:bg-secondary/50"
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-blue-500 text-white' : 'bg-muted'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="flex-1 truncate">{ref.name}</span>
                    <span className="font-bold text-blue-500">+{ref.homeBias.toFixed(0)}%</span>
                  </Link>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="text-sm text-muted-foreground block mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="border rounded px-3 py-2 bg-background"
          >
            <option value="avgPenalties">Avg Penalties/Match</option>
            <option value="penaltyRate">Penalty Rate %</option>
            <option value="total">Total Penalties</option>
            <option value="homeBias">Home Bias</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-muted-foreground block mb-1">League</label>
          <select
            value={filterLeague}
            onChange={(e) => setFilterLeague(e.target.value)}
            className="border rounded px-3 py-2 bg-background"
          >
            <option value="all">All Leagues</option>
            {leagues.map(league => (
              <option key={league} value={league}>{league}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Referee List */}
      <div className="space-y-3">
        {sortedReferees.map((referee) => (
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
                    {referee.league} &middot; {referee.matchCount} matches
                  </p>
                </div>

                {/* Stats */}
                <div className="flex gap-6 items-center">
                  <div className="text-center hidden sm:block">
                    <p className="text-xl font-bold text-primary">{referee.avgPenalties.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Avg/Match</p>
                  </div>
                  <div className="text-center hidden md:block">
                    <p className="text-xl font-bold">{referee.penaltyRate.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Penalty Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">{referee.totalPenalties}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <span className="text-muted-foreground">
                    {expandedReferee === referee.id ? '▲' : '▼'}
                  </span>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedReferee === referee.id && (
              <div className="px-4 pb-4 pt-0 border-t">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-muted/50 rounded p-3 text-center">
                    <p className="text-lg font-bold">{referee.matchesWithPenalty}</p>
                    <p className="text-xs text-muted-foreground">Matches with Penalty</p>
                  </div>
                  <div className="bg-muted/50 rounded p-3 text-center">
                    <p className="text-lg font-bold">{referee.matchesWithMultiple}</p>
                    <p className="text-xs text-muted-foreground">Multiple Penalties</p>
                  </div>
                  <div className="bg-blue-500/10 rounded p-3 text-center">
                    <p className="text-lg font-bold text-blue-500">{referee.homePenalties}</p>
                    <p className="text-xs text-muted-foreground">Home Penalties</p>
                  </div>
                  <div className="bg-orange-500/10 rounded p-3 text-center">
                    <p className="text-lg font-bold text-orange-500">{referee.awayPenalties}</p>
                    <p className="text-xs text-muted-foreground">Away Penalties</p>
                  </div>
                </div>

                {/* Recent Penalty Matches */}
                {referee.recentPenaltyMatches.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Recent Penalty Matches</p>
                    <div className="space-y-2">
                      {referee.recentPenaltyMatches.map((match, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-muted/30 rounded">
                          <span className="text-muted-foreground w-24">{match.date}</span>
                          <span className="flex-1">
                            {match.homeTeam} vs {match.awayTeam}
                          </span>
                          <span className="font-medium">
                            {match.homePenalties > 0 && <span className="text-blue-500">{match.homePenalties}H </span>}
                            {match.awayPenalties > 0 && <span className="text-orange-500">{match.awayPenalties}A</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
