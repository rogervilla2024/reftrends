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

interface RefereeData {
  id: number;
  name: string;
  slug: string;
  photo: string | null;
  league: string;
  matchCount: number;
  totalFouls: number;
  homeFouls: number;
  awayFouls: number;
  avgFouls: number;
  avgYellow: number;
  foulToCardRatio: number;
  leniencyScore: number;
  homeFoulPercent: number;
}

interface LeagueData {
  name: string;
  avgFouls: number;
  avgCards: number;
  foulToCardRatio: number;
  matches: number;
}

interface FoulAnalysisData {
  referees: RefereeData[];
  leagueData: LeagueData[];
  overall: {
    totalMatches: number;
    totalFouls: number;
    avgFouls: number;
    avgFoulToCard: number;
  };
}

interface FoulAnalysisClientProps {
  data: FoulAnalysisData;
}

export default function FoulAnalysisClient({ data }: FoulAnalysisClientProps) {
  const [sortBy, setSortBy] = useState<'avgFouls' | 'leniency' | 'foulToCard' | 'matches'>('avgFouls');
  const [filterLeague, setFilterLeague] = useState<string>('all');

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
        case 'avgFouls':
          return b.avgFouls - a.avgFouls;
        case 'leniency':
          return b.leniencyScore - a.leniencyScore;
        case 'foulToCard':
          return b.foulToCardRatio - a.foulToCardRatio;
        case 'matches':
          return b.matchCount - a.matchCount;
        default:
          return 0;
      }
    });
  }, [data.referees, sortBy, filterLeague]);

  const leagueChartData = data.leagueData.map(l => ({
    name: l.name.replace(' League', '').replace(' 1', ''),
    'Avg Fouls': parseFloat(l.avgFouls.toFixed(1)),
    'Avg Cards': parseFloat(l.avgCards.toFixed(1)),
  }));


  const getLeniencyLabel = (score: number) => {
    if (score >= 8) return { text: 'Very Lenient', color: 'text-green-500' };
    if (score >= 6) return { text: 'Lenient', color: 'text-green-400' };
    if (score >= 4) return { text: 'Moderate', color: 'text-yellow-500' };
    if (score >= 2) return { text: 'Strict', color: 'text-orange-500' };
    return { text: 'Very Strict', color: 'text-red-500' };
  };

  return (
    <div className="space-y-8">
      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">{data.overall.totalMatches}</div>
            <p className="text-sm text-muted-foreground">Matches Analyzed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-primary">{data.overall.totalFouls.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Total Fouls</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">{data.overall.avgFouls.toFixed(1)}</div>
            <p className="text-sm text-muted-foreground">Avg Fouls/Match</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">{data.overall.avgFoulToCard.toFixed(1)}</div>
            <p className="text-sm text-muted-foreground">Fouls per Card</p>
          </CardContent>
        </Card>
      </div>

      {/* Explanation */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Understanding Foul Metrics</h3>
          <p className="text-sm text-muted-foreground">
            <strong>Fouls per Card</strong> = How many fouls occur before a card is shown. Higher = more lenient referee.
            <br />
            <strong>Leniency Score</strong> = Based on foul-to-card ratio. More lenient referees allow more physical play.
          </p>
        </CardContent>
      </Card>

      {/* League Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Fouls by League</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={leagueChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Bar dataKey="Avg Fouls" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Lists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Most Fouls Allowed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.referees.slice(0, 5).map((ref, idx) => (
                <Link
                  key={ref.id}
                  href={`/referees/${ref.slug}`}
                  className="flex items-center gap-2 p-2 rounded hover:bg-secondary/50"
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="flex-1 truncate">{ref.name}</span>
                  <span className="font-bold">{ref.avgFouls.toFixed(1)}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-500/5">
          <CardHeader>
            <CardTitle className="text-lg">Most Lenient</CardTitle>
            <p className="text-xs text-muted-foreground">Highest fouls per card</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...data.referees].sort((a, b) => b.leniencyScore - a.leniencyScore).slice(0, 5).map((ref, idx) => (
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
                  <span className="font-bold text-green-500">{ref.leniencyScore.toFixed(1)}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-lg">Least Lenient</CardTitle>
            <p className="text-xs text-muted-foreground">Lowest fouls per card</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...data.referees].sort((a, b) => a.leniencyScore - b.leniencyScore).slice(0, 5).map((ref, idx) => (
                <Link
                  key={ref.id}
                  href={`/referees/${ref.slug}`}
                  className="flex items-center gap-2 p-2 rounded hover:bg-secondary/50"
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-red-500 text-white' : 'bg-muted'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="flex-1 truncate">{ref.name}</span>
                  <span className="font-bold text-red-500">{ref.leniencyScore.toFixed(1)}</span>
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
            <option value="avgFouls">Avg Fouls/Match</option>
            <option value="leniency">Leniency Score</option>
            <option value="foulToCard">Fouls per Card</option>
            <option value="matches">Most Matches</option>
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
        {sortedReferees.slice(0, 30).map((referee) => {
          const leniency = getLeniencyLabel(referee.leniencyScore);

          return (
            <Card key={referee.id} className="overflow-hidden hover:border-primary transition-colors">
              <Link href={`/referees/${referee.slug}`}>
                <CardContent className="p-4">
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{referee.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded bg-muted ${leniency.color}`}>
                          {leniency.text}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {referee.league} &middot; {referee.matchCount} matches
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 items-center">
                      <div className="text-center hidden sm:block">
                        <p className="text-lg font-bold">{referee.avgFouls.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">Fouls/match</p>
                      </div>
                      <div className="text-center hidden md:block">
                        <p className="text-lg font-bold">{referee.foulToCardRatio.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">Fouls/card</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{referee.homeFoulPercent.toFixed(0)}%</p>
                        <p className="text-xs text-muted-foreground">Home fouls</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
