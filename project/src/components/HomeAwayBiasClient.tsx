'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

interface RefereeBiasData {
  id: number;
  name: string;
  slug: string;
  photo: string | null;
  league: string;
  matchCount: number;
  homeYellow: number;
  awayYellow: number;
  homeRed: number;
  awayRed: number;
  avgHomeCards: number;
  avgAwayCards: number;
  biasScore: number;
  biasPercent: number;
}

interface HomeAwayBiasClientProps {
  referees: RefereeBiasData[];
}

export default function HomeAwayBiasClient({ referees }: HomeAwayBiasClientProps) {
  const [sortBy, setSortBy] = useState<'bias' | 'homeCards' | 'awayCards' | 'matches'>('bias');
  const [filterLeague, setFilterLeague] = useState<string>('all');

  const leagues = useMemo(() => {
    const uniqueLeagues = [...new Set(referees.map(r => r.league))];
    return uniqueLeagues.sort();
  }, [referees]);

  const sortedReferees = useMemo(() => {
    const filtered = filterLeague === 'all'
      ? referees
      : referees.filter(r => r.league === filterLeague);

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'bias':
          return Math.abs(b.biasScore) - Math.abs(a.biasScore);
        case 'homeCards':
          return b.avgHomeCards - a.avgHomeCards;
        case 'awayCards':
          return b.avgAwayCards - a.avgAwayCards;
        case 'matches':
          return b.matchCount - a.matchCount;
        default:
          return 0;
      }
    });
  }, [referees, sortBy, filterLeague]);

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const totalHome = referees.reduce((sum, r) => sum + r.homeYellow + r.homeRed, 0);
    const totalAway = referees.reduce((sum, r) => sum + r.awayYellow + r.awayRed, 0);
    const totalMatches = referees.reduce((sum, r) => sum + r.matchCount, 0);

    const homeBiased = referees.filter(r => r.biasScore > 0.3).length;
    const awayBiased = referees.filter(r => r.biasScore < -0.3).length;
    const neutral = referees.length - homeBiased - awayBiased;

    return {
      avgHomeCards: totalMatches > 0 ? totalHome / totalMatches : 0,
      avgAwayCards: totalMatches > 0 ? totalAway / totalMatches : 0,
      homeBiased,
      awayBiased,
      neutral,
    };
  }, [referees]);

  const getBiasLabel = (score: number) => {
    if (score > 0.5) return { text: 'Strong Home Bias', color: 'text-blue-500', bg: 'bg-blue-500' };
    if (score > 0.2) return { text: 'Slight Home Bias', color: 'text-blue-400', bg: 'bg-blue-400' };
    if (score < -0.5) return { text: 'Strong Away Bias', color: 'text-orange-500', bg: 'bg-orange-500' };
    if (score < -0.2) return { text: 'Slight Away Bias', color: 'text-orange-400', bg: 'bg-orange-400' };
    return { text: 'Neutral', color: 'text-gray-500', bg: 'bg-gray-500' };
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-blue-500">
              {overallStats.avgHomeCards.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Avg Home Cards/Match</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-orange-500">
              {overallStats.avgAwayCards.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Avg Away Cards/Match</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-blue-500">
              {overallStats.homeBiased}
            </div>
            <p className="text-sm text-muted-foreground">Home Biased Refs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-orange-500">
              {overallStats.awayBiased}
            </div>
            <p className="text-sm text-muted-foreground">Away Biased Refs</p>
          </CardContent>
        </Card>
      </div>

      {/* Explanation Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">How Bias Score Works</h3>
          <p className="text-sm text-muted-foreground">
            <strong>Positive score</strong> = More cards to away teams (home team advantage)
            <br />
            <strong>Negative score</strong> = More cards to home teams (away team advantage)
            <br />
            <strong>Near zero</strong> = Fair and balanced officiating
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="text-sm text-muted-foreground block mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="border rounded px-3 py-2 bg-background"
          >
            <option value="bias">Bias Score (Highest)</option>
            <option value="homeCards">Home Cards (Highest)</option>
            <option value="awayCards">Away Cards (Highest)</option>
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
        {sortedReferees.map((referee) => {
          const bias = getBiasLabel(referee.biasScore);
          const homePercent = (referee.avgHomeCards / (referee.avgHomeCards + referee.avgAwayCards)) * 100 || 50;
          const awayPercent = 100 - homePercent;

          return (
            <Card key={referee.id} className="overflow-hidden hover:border-primary transition-colors">
              <Link href={`/referees/${referee.slug}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Photo */}
                    <div className="w-14 h-14 rounded-full bg-secondary overflow-hidden relative shrink-0">
                      {referee.photo ? (
                        <Image
                          src={referee.photo}
                          alt={referee.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-7 h-7 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{referee.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${bias.bg} text-white`}>
                          {bias.text}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {referee.league} &middot; {referee.matchCount} matches
                      </p>

                      {/* Bias Bar */}
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-blue-500 w-12">Home</span>
                        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden flex">
                          <div
                            className="bg-blue-500 h-full transition-all"
                            style={{ width: `${homePercent}%` }}
                          />
                          <div
                            className="bg-orange-500 h-full transition-all"
                            style={{ width: `${awayPercent}%` }}
                          />
                        </div>
                        <span className="text-xs text-orange-500 w-12 text-right">Away</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right shrink-0 hidden sm:block">
                      <div className="flex gap-4">
                        <div>
                          <p className="text-lg font-bold text-blue-500">
                            {referee.avgHomeCards.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">Home/match</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-orange-500">
                            {referee.avgAwayCards.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">Away/match</p>
                        </div>
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
